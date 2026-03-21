import { useContext } from "react";
import SongContext from "../context/Collections";

export function useCollectionsContext() {
  const context = useContext(SongContext);
  if (!context) {
    throw new Error(`useCollectionsContext can only be used in a SongProvider`);
  }
  return context;
}
