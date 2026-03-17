import { useContext } from "react";
import DialogContext from ".";

export function useDrawer() {
  const context = useContext(DialogContext);
  if (context === undefined) {
    throw new Error("useDialog must be used within a DialogProvider");
  }
  return context;
}
