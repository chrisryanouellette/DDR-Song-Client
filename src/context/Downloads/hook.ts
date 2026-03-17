import { useContext } from "react";
import DownloadsContext from ".";

export function useSongDownloadsContext() {
  const context = useContext(DownloadsContext);
  if (!context) {
    throw new Error(
      `useSongDownloadsContext can only be used in a DownloadsContext`,
    );
  }
  return context;
}
