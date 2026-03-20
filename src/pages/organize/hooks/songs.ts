import { useContext } from "react";
import SongContext from "../context/Songs";

export function useSongsContext() {
  const context = useContext(SongContext);
  if (!context) {
    throw new Error(`useSongsContext can only be used in a SongProvider`);
  }
  return context;
}
