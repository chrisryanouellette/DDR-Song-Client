import { use, useContext } from "react";
import SongDetailsContext from "../context/Song";

export function useSongDetailsContext() {
  const prom = useContext(SongDetailsContext);
  if (!prom) {
    throw new Error(
      `useSongDetailsContext can only be used in a SongDetailsProvider`,
    );
  }
  return use(prom);
}
