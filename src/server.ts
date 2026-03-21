import { createWriteStream, existsSync } from "node:fs";
import {
  glob,
  mkdir,
  readdir,
  readFile,
  rename,
  rm,
  rmdir,
  unlink,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Readable } from "node:stream";
import { finished } from "node:stream/promises";
import type { ReadableStream } from "node:stream/web";
import * as cheerio from "cheerio";
import decompress from "decompress";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import {
  createFolderSchema,
  type EditSongSchema,
  editSongSchema,
  getSongSchema,
  listSongsSchema,
  moveSongSchema,
  type SongDownloadProgressSchema,
  searchSchema,
  songDetailsSchema,
  songDownloadSchema,
} from "./schema.ts";
import type { SearchSong, Song, SongDetails, Throwable } from "./types.ts";

const app = express();
const port = 3000;
const platform = os.platform();
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

app.use("/", express.static(path.join(process.cwd(), "/dist")));

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

function getAttributeStartLocation(content: string, attr: string): number {
  return content.indexOf(attr) + attr.length;
}

app.get<{ collection: string; song: string }, EditSongSchema, never, never>(
  "/api/song/editor",
  async (req, res, next) => {
    const parsed = getSongSchema.safeParse(req.query);
    if (parsed.error) return next(parsed.error);
    const dir = path.resolve(
      outfoxSongsDir,
      parsed.data.collection,
      parsed.data.song,
    );
    let filePath: string = "";
    for await (const entry of glob(`${dir}/**/*(*.sm|*.ssc)`)) {
      if (filePath.includes(".ssc")) continue;
      filePath = entry;
    }
    if (!filePath) {
      return next(
        new Error(`Unable to find sm or ssc file for ${parsed.data.song}`),
      );
    }
    const file = (await readFile(filePath)).toString();
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
    const genre = file.slice(genreIndex, file.indexOf(";", genreIndex));
    return res.json({
      ...parsed.data,
      folder: parsed.data.song,
      title,
      subtitle,
      artist,
      genre,
    });
  },
);

function injectString(
  file: string,
  update: string,
  start: number,
  end: number,
): string {
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
    for await (const entry of glob(`${dir}/**/*(*.sm|*.ssc)`)) {
      if (filePath.includes(".ssc")) continue;
      filePath = entry;
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
    const titleIndex = getAttributeStartLocation(file, "#TITLE:");
    file = injectString(
      file,
      parsed.data.title,
      titleIndex,
      file.indexOf(";", titleIndex),
    );
    const subtitleIndex = getAttributeStartLocation(file, "#SUBTITLE:");
    file = injectString(
      file,
      parsed.data.subtitle || "",
      subtitleIndex,
      file.indexOf(";", subtitleIndex),
    );
    const artistIndex = getAttributeStartLocation(file, "#ARTIST:");
    file = injectString(
      file,
      parsed.data.artist,
      artistIndex,
      file.indexOf(";", artistIndex),
    );
    const genreIndex = getAttributeStartLocation(file, "#GENRE:");
    file = injectString(
      file,
      parsed.data.genre,
      genreIndex,
      file.indexOf(";", genreIndex),
    );
    await writeFile(filePath, file);
    if (parsed.data.song !== parsed.data.folder) {
      const dest = path.resolve(
        outfoxSongsDir,
        parsed.data.collection,
        parsed.data.folder,
      );
      await rename(dir, dest);
    }
    return res.send();
  },
);

app.get<{ collection: string; song: string }, never, never, never>(
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

async function downloadSimFile({
  file,
  name,
  id,
}: {
  file: string;
  name: string;
  id: string;
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
        [id]: { progress: amount, name },
      };
      const message = JSON.stringify(data);
      for (const client of clients) {
        client.write(`data: ${message}\n\n`);
      }
    });
    webReadable.on("end", () => {
      const data: SongDownloadProgressSchema = {
        [id]: { completed: true, name },
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

  const dir = path.resolve(
    outfoxSongsDir,
    decodeURIComponent(params.data.folder) ||
      decodeURIComponent(params.data.new),
  );
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
  downloadSimFile({ file, id: params.data.id, name: params.data.name });
  return res.json({ isError: false });
});

app.get<{ song: string; collection: string }>(
  "/api/song/delete",
  async (req, res, next) => {
    const parsed = getSongSchema.safeParse(req.query);
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _: Request, res: Response, _next: NextFunction) => {
  if (err instanceof Error) {
    return res.status(500).send(err.message);
  }
  return res.status(500).send("Internal Server Error");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
