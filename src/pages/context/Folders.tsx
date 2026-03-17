import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useState,
} from "react";
import type { Folder } from "../../types";

const FoldersContext = createContext<{
  prom: Promise<{ folders: Folder[] }>;
  refresh: () => void;
} | null>(null);

const url = new URL(`${window.location.origin}/api/folders/list`);
let prom: Promise<{ folders: Folder[] }> | null = null;
function initFolders(reset?: true) {
  if (!reset && prom) return prom;
  prom = fetch(url).then((res) => res.json());
  return prom;
}

function FoldersProvider({ children }: PropsWithChildren) {
  const [prom, setProm] = useState(initFolders());

  const refresh = useCallback(() => setProm(initFolders(true)), []);

  return (
    <FoldersContext.Provider value={{ prom, refresh }}>
      {children}
    </FoldersContext.Provider>
  );
}

export { FoldersProvider };
export default FoldersContext;
