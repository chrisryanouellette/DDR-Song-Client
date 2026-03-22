import { createContext, type PropsWithChildren } from "react";
import { useDownloadProgress } from "../../hooks/downloads";
import type { SongDownloadProgressSchema } from "../../schema";

const DownloadsContext = createContext<{
  downloads: SongDownloadProgressSchema;
  clearCompleted: () => void;
} | null>(null);

function DownloadsProvider({ children }: PropsWithChildren) {
  const downloads = useDownloadProgress();

  return (
    <DownloadsContext.Provider value={downloads}>
      {children}
    </DownloadsContext.Provider>
  );
}

export { DownloadsProvider };
export default DownloadsContext;
