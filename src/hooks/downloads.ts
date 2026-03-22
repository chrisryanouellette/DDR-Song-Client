import { useEffect, useState } from "react";
import {
  type SongDownloadProgressSchema,
  songDownloadProgressSchema,
} from "../schema";

export function useDownloadProgress() {
  const [downloads, setDownloads] = useState<SongDownloadProgressSchema>({});

  function clearCompleted() {
    setDownloads(prev => {
      const notComplete: SongDownloadProgressSchema = {}
      for(const [key, value] of Object.entries(prev)) {
        if(('completed' in value)) continue
        notComplete[key] = value
      }
      return notComplete
    })
  }

  useEffect(function initDownloadEvents() {
    const evtSource = new EventSource("/api/song/progress");
    evtSource.onmessage = (event) => {
      const parsed = songDownloadProgressSchema.safeParse(
        JSON.parse(event.data),
      );
      if (parsed.error) throw parsed.error;
      setDownloads((prev) => ({ ...prev, ...parsed.data }));
    };
    evtSource.onerror = (event) => {
      setDownloads((prev) => {
        const inProgress: SongDownloadProgressSchema = {};
        for (const [id, data] of Object.entries(prev)) {
          if ("completed" in data) continue;
          inProgress[id] = {
            name: data.name,
            collection: data.collection,
            error: `Server error: ${event.type}`,
          };
        }
        return { ...prev, ...inProgress };
      });
    };
    return function cleanupInitDownloadEvents() {
      evtSource.close();
    };
  }, []);

  return {downloads, clearCompleted};
}
