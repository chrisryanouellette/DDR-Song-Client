import { useContext } from "react";
import CollectionsContext from "../context/Collections";

export function useCollectionsContext() {
  const context = useContext(CollectionsContext);
  if (!context) {
    throw new Error(`useCollectionsContext can only be used in a SongProvider`);
  }
  return context;
}
