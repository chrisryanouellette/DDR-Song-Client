import path from "node:path";
import * as cheerio from "cheerio";
import express from "express";
import { searchSchema, songDetailsSchema } from "./schema.ts";
import type { SearchSong, SongDetails } from "./types.ts";

const app = express();
const port = 3000;

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
  "/api/song-details",
  async (req, res, next) => {
    const params = songDetailsSchema.safeParse(req.query);
    if (params.error) return next(params.error);
    const url = new URL("https://zenius-i-vanisher.com/v5.2/viewsimfile.php");
    url.searchParams.append("simfileid", params.data.id);
    const result = await fetch(url);
    const html = await result.text();
    const $ = cheerio.load(html);
    const [info, simfile, details, other] = $(".content table");
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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
