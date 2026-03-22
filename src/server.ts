import { createReadStream, createWriteStream, existsSync } from "node:fs";
import {
  glob,
  mkdir,
  readdir,
  readFile,
  rename,
  rm,
  rmdir,
  stat,
  unlink,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Readable } from "node:stream";
import { finished } from "node:stream/promises";
import type { ReadableStream } from "node:stream/web";
import { fileURLToPath } from "node:url";
import * as cheerio from "cheerio";
import decompress from "decompress";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import open from "open";
import {
  createFolderSchema,
  type EditSongApiResponse,
  type EditSongSchema,
  editSongSchema,
  type GetSongApiSchema,
  getSongApiSchema,
  listSongsSchema,
  moveSongSchema,
  type SongDownloadProgressSchema,
  searchSchema,
  songDetailsSchema,
  songDownloadSchema,
  type UpdateAudioSchema,
  updateAudioSchema,
} from "./schema.ts";
import type { SearchSong, Song, SongDetails, Throwable } from "./types.ts";

const app = express();
const port = 3000;
const platform = os.platform();
const directory =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));
const outfoxDirectories = {
  linux: path.resolve(os.homedir(), ".project-outfox"),
  darwin: path.resolve(os.homedir(), "/Applications/OutFox/"),
} as const;
const outfoxDirectory = Object.hasOwn(outfoxDirectories, platform)
  ? outfoxDirectories[platform as keyof typeof outfoxDirectories]
  : null;

const clients = new Set<Response>();

if (!outfoxDirectory) {
  throw new Error(`Platform "${platform}" is not supported yet.`);
}

if (!existsSync(outfoxDirectory)) {
  throw new Error(`Cannot find Outfox Directory in home dir.`);
}

const outfoxSongsDir = path.resolve(outfoxDirectory, "./Songs");

const distDir = path.join(directory, "/dist");
const publicDir = existsSync(distDir) ? distDir : directory;
app.use("/", express.static(publicDir));

app.get("/api/search", async (req, res, next) => {
  const params = searchSchema.safeParse(req.query);
  if (params.error) return next(params.error);
  try {
    const url = new URL(
      "https://zenius-i-vanisher.com/v5.2/simfiles_search_ajax.php",
    );
    if ("songartist" in params.data) {
      url.searchParams.append("songartist", params.data.songartist);
    }
    if ("songtitle" in params.data) {
      url.searchParams.append("songtitle", params.data.songtitle);
    }
    const result = await fetch(url);
    const html = await result.text();
    const $ = cheerio.load(html);
    const songs: SearchSong[] = [];

    $("table tr").each((index, row) => {
      if (index === 0 || !row) return;
      const columns = $(row).find("td");
      if (columns.length <= 1) return;
      const [titleElem, singleElem, doubleElem, collectionElem] = columns;
      const title = $(titleElem).text().trim();
      const linkElem = $(titleElem).find("a");
      const attr = $(linkElem).attr("title") || "";
      const link = $(linkElem).attr("href") || "";
      const params = new URLSearchParams(link.slice(link.indexOf("?")));
      const id = params.get("simfileid") ?? "";
      const artist = attr.slice(title.length + " / ".length).split(", ");
      const singleText = $(singleElem).text().trim();
      const single = singleText.split("/") as SearchSong["single"];
      const doubleText = $(doubleElem).text().trim();
      const double = doubleText.split("/") as SearchSong["double"];
      const collectionLinkElem = $(collectionElem).children("a");
      const collection = $(collectionElem).text().trim();
      const collectionLink = $(collectionLinkElem).attr("href") ?? "";
      const collectionParams = new URLSearchParams(
        collectionLink.slice(collectionLink.indexOf("?")),
      );
      const collectionId = collectionParams.get("categoryid") ?? "";
      songs.push({
        title,
        id,
        artist,
        single,
        double,
        collection,
        collectionId,
      });
    });

    return res.json(songs);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

app.get<{ id: string }, SongDetails, never, never>(
  "/api/song/details",
  async (req, res, next) => {
    const params = songDetailsSchema.safeParse(req.query);
    if (params.error) return next(params.error);
    const url = new URL("https://zenius-i-vanisher.com/v5.2/viewsimfile.php");
    url.searchParams.append("simfileid", params.data.id);
    const files = await glob(`${outfoxSongsDir}/**/*${params.data.id}.json`);
    const file = await files.next();
    const downloaded = file.value;
    const [collection, song] =
      downloaded?.replace(`${outfoxSongsDir}/`, "").split("/") ?? [];
    console.log(collection, song);
    const result = await fetch(url);
    const html = await result.text();
    const $ = cheerio.load(html);
    const [info, , details, other] = $(".content table");
    const infoRows = $(info).find("td");
    const bpmElem = infoRows.filter((_, element) => {
      return $(element).text().trim() === "BPM";
    });
    const bpm = bpmElem.next().text().trim();
    const detailsRows = $(details).find("td");
    const audioElem = detailsRows.filter((_, element) => {
      return $(element).text().trim() === "Audio Quality";
    });
    const audioText = audioElem.next().text().trim();
    const audio = audioText.includes("Perfect")
      ? 2
      : audioText.includes("Generic")
        ? 1
        : audioText.includes("Missing")
          ? 0
          : "unknown";

    const bannerElem = detailsRows.filter((_, element) => {
      return $(element).text().trim() === "Banner Quality";
    });
    const bannerText = bannerElem.next().text().trim();
    const banner = bannerText.includes("Perfect")
      ? 2
      : bannerText.includes("Generic")
        ? 1
        : bannerText.includes("Missing")
          ? 0
          : bannerText.includes("Custom")
            ? "custom"
            : "unknown";

    const backgroundElem = detailsRows.filter((_, element) => {
      return $(element).text().trim() === "Background Quality";
    });
    const backgroundText = backgroundElem.next().text().trim();
    const background = backgroundText.includes("Perfect")
      ? 2
      : backgroundText.includes("Generic")
        ? 1
        : backgroundText.includes("Missing")
          ? 0
          : bannerText.includes("Custom")
            ? "custom"
            : "unknown";

    const previewElem = $(other).find("iframe");
    const previewSrc = previewElem.attr("src");
    const preview = previewSrc?.includes("www.youtube.com")
      ? previewSrc
      : undefined;

    return res.json({
      bpm,
      preview,
      collection,
      song,
      id: params.data.id,
      quality: { audio, banner, background },
    });
  },
);

app.get("/api/collections/list", async (_, res, next) => {
  try {
    const contents = await readdir(outfoxSongsDir, { withFileTypes: true });
    const dirs = contents.filter((content) => content.isDirectory());
    const names = dirs.map((dir) => ({ name: dir.name }));
    return res.json({ collections: names });
  } catch (error) {
    console.log(error);
    return next(error);
  }
});

app.get<{ folder: string }, { songs: Song[] }, never, never>(
  "/api/songs/list",
  async (req, res, next) => {
    const params = listSongsSchema.safeParse(req.query);
    if (params.error) return next(params.error);
    const dirs = await readdir(
      path.resolve(outfoxSongsDir, params.data.collection),
      { withFileTypes: true },
    );
    const result: Song[] = [];
    for (const dirent of dirs) {
      if (dirent.isDirectory()) result.push({ name: dirent.name });
    }
    return res.json({ songs: result });
  },
);

app.get<{ collection: string }, never, never, never>(
  "/api/collection/create",
  async (req, res, next) => {
    const parsed = createFolderSchema.safeParse(req.query);
    if (parsed.error) return next(parsed.error);
    const dir = path.join(outfoxSongsDir, parsed.data.collection);
    if (existsSync(dir)) {
      return next(new Error("That folder already exists."));
    }
    await mkdir(dir);
    return res.send();
  },
);

app.get<{ collection: string }, never, never, never>(
  "/api/collection/delete",
  async (req, res, next) => {
    const parsed = createFolderSchema.safeParse(req.query);
    if (parsed.error) return next(parsed.error);
    const dir = path.join(outfoxSongsDir, parsed.data.collection);
    if (!existsSync(dir)) {
      return next(new Error("That collection dose not exists."));
    }
    const dirs = await readdir(dir, { withFileTypes: true });
    const folders = dirs.filter((dir) => dir.isDirectory());
    if (folders.length) {
      return next(new Error("Collection needs to be empty to delete it."));
    }
    await rmdir(dir);
    return res.send();
  },
);

function getAttributeStartLocation(
  content: string,
  attr: string,
  start?: number,
): number {
  const index = content.indexOf(attr, start ?? 0);
  if (index === -1) return -1;
  return index + attr.length;
}

app.get<GetSongApiSchema, EditSongApiResponse>(
  "/api/song/editor",
  async (req, res, next) => {
    const parsed = getSongApiSchema.safeParse(req.query);
    if (parsed.error) return next(parsed.error);
    const dir = path.resolve(
      outfoxSongsDir,
      parsed.data.collection,
      parsed.data.song,
    );

    let filePath: string = "";
    for (const entry of await readdir(dir)) {
      if (!entry.endsWith(".sm") && !entry.endsWith(".ssc")) continue;
      if (filePath.includes(".ssc")) continue;
      filePath = path.resolve(dir, entry);
    }
    if (!filePath) {
      return next(
        new Error(`Unable to find sm or ssc file for ${parsed.data.song}`),
      );
    }
    const file = (await readFile(filePath)).toString();
    const files = await readdir(dir);
    const titleIndex = getAttributeStartLocation(file, "#TITLE:");
    const title = file.slice(titleIndex, file.indexOf(";", titleIndex));
    const subtitleIndex = getAttributeStartLocation(file, "#SUBTITLE:");
    const subtitle = file.slice(
      subtitleIndex,
      file.indexOf(";", subtitleIndex),
    );
    const artistIndex = getAttributeStartLocation(file, "#ARTIST:");
    const artist = file.slice(artistIndex, file.indexOf(";", artistIndex));
    const genreIndex = getAttributeStartLocation(file, "#GENRE:");
    const genre = genreIndex
      ? file.slice(genreIndex, file.indexOf(";", genreIndex))
      : "";
    const musicIndex = getAttributeStartLocation(file, "#MUSIC:");
    const music = file.slice(musicIndex, file.indexOf(";", musicIndex));
    const bpmIndex = getAttributeStartLocation(file, "#BPMS:");
    const bpmText = file.slice(bpmIndex, file.indexOf(";", bpmIndex));
    const bpmSet = new Set(
      bpmText.split(",").map((line) => Math.round(Number(line.split("=")[1]))),
    );
    const bpm = [...bpmSet].join(", ");
    const isSmFile = filePath.endsWith(".sm");
    const grades: { [index: string]: number } = {};
    if (isSmFile) {
      let singleIndex = getAttributeStartLocation(file, "dance-single:");
      while (singleIndex !== -1) {
        const slice = file.slice(singleIndex, singleIndex + 100);
        const [, difficulty, grade] = slice
          .split("     ")
          .filter((i) => !!i.trim());
        grades[difficulty.trim().replace(":", "")] = Number(
          grade.trim().replace(":", ""),
        );
        singleIndex = getAttributeStartLocation(
          file,
          "dance-single:",
          singleIndex,
        );
      }
    } else {
      let singleIndex = getAttributeStartLocation(
        file,
        "#STEPSTYPE:dance-single;",
      );
      let meterIndex = getAttributeStartLocation(file, "#METER:");
      let difficultyIndex = getAttributeStartLocation(file, "#DIFFICULTY:");
      while (singleIndex !== -1) {
        const meterEnd = file.indexOf(";", meterIndex);
        const difficultyEnd = file.indexOf(";", difficultyIndex);
        const grade = file.slice(meterIndex, meterEnd);
        const difficulty = file.slice(difficultyIndex, difficultyEnd);
        meterIndex = getAttributeStartLocation(file, "#METER:", meterEnd);
        difficultyIndex = getAttributeStartLocation(
          file,
          "#DIFFICULTY:",
          difficultyEnd,
        );
        singleIndex = getAttributeStartLocation(
          file,
          "#STEPSTYPE:dance-single;",
          singleIndex,
        );
        grades[difficulty] = Number(grade);
      }
    }

    return res.json({
      ...parsed.data,
      title,
      subtitle,
      artist,
      genre,
      music,
      bpm,
      grades,
      files,
    });
  },
);

function inject(file: string, section: string, update: string) {
  const start = getAttributeStartLocation(file, section);
  if (start === -1) {
    return `${section}${update};\n${file}`;
  }
  const end = file.indexOf(";", start);
  return `${file.slice(0, start)}${update}${file.slice(end)}`;
}

app.post<EditSongSchema, never, never, never>(
  "/api/song/editor",
  async (req, res, next) => {
    const parsed = editSongSchema.safeParse(req.query);
    if (parsed.error) return next(parsed.error);
    const dir = path.resolve(
      outfoxSongsDir,
      parsed.data.collection,
      parsed.data.song,
    );
    let filePath: string = "";
    for (const entry of await readdir(dir)) {
      if (!entry.endsWith(".sm") && !entry.endsWith(".ssc")) continue;
      if (filePath.includes(".ssc")) continue;
      filePath = path.resolve(dir, entry);
    }
    if (!filePath) {
      return next(
        new Error(`Unable to find sm or ssc file for ${parsed.data.song}`),
      );
    }
    if (!existsSync(filePath)) {
      return next(
        new Error(
          `Unable to update song in collection "${parsed.data.collection}" with name "${parsed.data.song}"`,
        ),
      );
    }
    let file = (await readFile(filePath)).toString();
    file = inject(file, "#TITLE:", parsed.data.title);
    file = inject(file, "#SUBTITLE:", parsed.data.subtitle || "");
    file = inject(file, "#ARTIST:", parsed.data.artist);
    file = inject(file, "#GENRE:", parsed.data.genre);
    await writeFile(filePath, file);
    const folder = [parsed.data.title, parsed.data.subtitle, parsed.data.artist]
      .filter(Boolean)
      .join(" - ");
    if (parsed.data.song !== folder) {
      const dest = path.resolve(outfoxSongsDir, parsed.data.collection, folder);
      await rename(dir, dest);
    }
    return res.send();
  },
);

app.get<GetSongApiSchema, never, never, never>(
  "/api/song/move",
  async (req, res, next) => {
    const parsed = moveSongSchema.safeParse(req.query);
    if (parsed.error) return next(parsed.error);
    const current = path.resolve(
      outfoxSongsDir,
      parsed.data.collection,
      parsed.data.song,
    );
    const dest = path.resolve(
      outfoxSongsDir,
      parsed.data.dest,
      parsed.data.song,
    );
    await rename(current, dest);
    res.send();
  },
);

app.get<UpdateAudioSchema>(
  "/api/editor/audio/update",
  async (req, res, next) => {
    const parsed = updateAudioSchema.safeParse(req.query);
    if (parsed.error) return next(parsed.error);
    const dir = path.resolve(
      outfoxSongsDir,
      parsed.data.collection,
      parsed.data.song,
    );
    let filePath: string = "";
    for (const entry of await readdir(dir)) {
      if (!entry.endsWith(".sm") && !entry.endsWith(".ssc")) continue;
      if (filePath.includes(".ssc")) continue;
      filePath = path.resolve(dir, entry);
    }
    if (!filePath) {
      return next(
        new Error(`Unable to find sm or ssc file for ${parsed.data.song}`),
      );
    }
    let file = (await readFile(filePath)).toString();
    file = inject(file, "#MUSIC:", parsed.data.file);
    await writeFile(filePath, file);
    return res.send();
  },
);

async function downloadSimFile({
  file,
  name,
  id,
  collection,
}: {
  file: string;
  name: string;
  id: string;
  collection: string;
}): Promise<void> {
  const url = new URL("https://zenius-i-vanisher.com/v5.2/download.php");
  url.searchParams.append("type", "ddrsimfile");
  url.searchParams.append("simfileid", id);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Download failed, status code: ${response.status}`);
    }
    if (!response.body) {
      throw new Error("Response body is empty");
    }
    let progress = 0;
    let previous = 0;
    const fileStream = createWriteStream(file);
    const webReadable = Readable.fromWeb(
      response.body as ReadableStream<Uint8Array>,
    );
    webReadable.on("data", (chunk) => {
      progress += chunk.length;
      const amount = Math.floor(progress / 100000);
      if (amount <= previous) return;
      previous = amount;
      const data: SongDownloadProgressSchema = {
        [id]: { progress: amount, name, collection },
      };
      const message = JSON.stringify(data);
      for (const client of clients) {
        client.write(`data: ${message}\n\n`);
      }
    });
    webReadable.on("end", () => {
      const data: SongDownloadProgressSchema = {
        [id]: {
          completed: true,
          name,
          collection,
          completedAt: Date.now(),
        },
      };
      const message = JSON.stringify(data);
      for (const client of clients) {
        client.write(`data: ${message}\n\n`);
      }
    });
    await finished(webReadable.pipe(fileStream));
    await decompress(file, path.dirname(file));
    await unlink(file);
    const output = path.resolve(
      path.dirname(file),
      path.basename(file, path.extname(file)),
    );
    const metadata = JSON.stringify({ id, name });
    await writeFile(path.resolve(output, `${id}.json`), metadata);
  } catch (error) {
    console.error(error);
    await unlink(file);
    const message = JSON.stringify({ id, error: "Boom" });
    for (const client of clients) {
      client.write(`data: ${message}\n\n`);
    }
  }
}

app.get("/api/song/progress", async (req, res) => {
  clients.add(res);
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  res.flushHeaders();
  req.on("close", () => res.end());
});

app.get<
  { id: string; name: string; folder?: string; new?: string },
  Throwable,
  never,
  never
>("/api/song/download", async (req, res, next) => {
  const params = songDownloadSchema.safeParse(req.query);
  if (params.error) return next(params.error);

  const collection =
    decodeURIComponent(params.data.folder) ||
    decodeURIComponent(params.data.new);
  const dir = path.resolve(outfoxSongsDir, collection);
  const result = path.resolve(dir, `${decodeURIComponent(params.data.name)}`);
  const file = `${result}.zip`;
  if (params.data.new) {
    try {
      await mkdir(dir);
    } catch (error) {
      return next(error);
    }
  }
  if (existsSync(result))
    return next(
      new Error("That song with that name already exists in this folder."),
    );
  if (existsSync(file))
    return next(new Error("Download is already in progress."));
  downloadSimFile({
    file,
    collection,
    id: params.data.id,
    name: params.data.name,
  });
  return res.json({ isError: false });
});

app.get<{ song: string; collection: string }>(
  "/api/song/delete",
  async (req, res, next) => {
    const parsed = getSongApiSchema.safeParse(req.query);
    if (parsed.error) return next(parsed.error);
    const dir = path.resolve(
      outfoxSongsDir,
      parsed.data.collection,
      parsed.data.song,
    );
    await rm(dir, { recursive: true });
    return res.send();
  },
);

app.get("/api/audio/*rest", async (req, res) => {
  const filePath = path.resolve(outfoxSongsDir, req.params.rest.join("/"));
  if (!existsSync(filePath)) {
    return res.status(404).send("Audio file not found.");
  }
  const stats = await stat(filePath);
  const fileSize = stats.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = end - start + 1;
    const file = createReadStream(filePath, { start, end });

    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": "audio",
    });
    file.pipe(res);
  } else {
    res.writeHead(200, {
      "Content-Length": fileSize,
      "Content-Type": "audio",
    });
    createReadStream(filePath).pipe(res);
  }
});

app.use((_, res) => {
  res.sendFile(distDir);
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _: Request, res: Response, _next: NextFunction) => {
  if (err instanceof Error) {
    return res.status(500).send(err.message);
  }
  return res.status(500).send("Internal Server Error");
});

app.listen(port, async () => {
  console.log(`Server running on port ${port}`);
  try {
    await fetch("http://localhost:5173");
  } catch {
    open("http://localhost:3000");
  }
});
