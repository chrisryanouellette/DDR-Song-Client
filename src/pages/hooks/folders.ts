import { use, useContext } from "react";
import FoldersContext from "../context/Folders";

export function useFoldersContext() {
  const context = useContext(FoldersContext);
  if (!context) {
    throw new Error(
      `useFoldersContext can only be used in a FoldersContextProvider`,
    );
  }
  return { ...context, ...use(context.prom) };
}
