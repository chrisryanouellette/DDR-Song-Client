import path from "node:path";
import * as cheerio from "cheerio";
import express from "express";
import { searchSchema } from "./schema.ts";
import type { SearchSong } from "./types.ts";

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
      const [titleElem, singleElem, doubleElem] = columns;
      const title = $(titleElem).text().trim();
      const linkElem = $(titleElem).find("a");
      const attr = $(linkElem).attr("title") || "";
      const link = $(linkElem).attr("href") || "";
      const artist = attr.slice(title.length + " / ".length).split(", ");
      const singleText = $(singleElem).text().trim();
      const single = singleText.split("/") as SearchSong["single"];
      const doubleText = $(doubleElem).text().trim();
      const double = doubleText.split("/") as SearchSong["double"];
      songs.push({ title, link, artist, single, double });
    });

    return res.json(songs);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
