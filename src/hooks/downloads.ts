import { useEffect, useState } from "react";
import {
  type SongDownloadProgressSchema,
  songDownloadProgressSchema,
} from "../schema";

export function useDownloadProgress() {
  const [downloads, setDownloads] = useState<SongDownloadProgressSchema>({});

  useEffect(function initDownloadEvents() {
    const evtSource = new EventSource("/api/song/progress");
    evtSource.onmessage = (event) => {
      const parsed = songDownloadProgressSchema.safeParse(
        JSON.parse(event.data),
      );
      if (parsed.error) throw parsed.error;
      setDownloads((prev) => ({ ...prev, ...parsed.data }));
    };
    return function cleanupInitDownloadEvents() {
      evtSource.close();
    };
  });

  return downloads;
}
