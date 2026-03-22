import { useContext } from "react";
import EditorContext from "../context/Editor";

export function useEditorContext() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error(`useEditorContext can only be used in a SongProvider`);
  }
  return context;
}
