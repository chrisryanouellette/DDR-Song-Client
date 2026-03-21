import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useState,
} from "react";

const CollectionsContext = createContext<{
  prom: Promise<{ collections: { name: string }[] }>;
  refresh: () => void;
} | null>(null);

const url = new URL(`${window.location.origin}/api/collections/list`);
let prom: Promise<{ collections: { name: string }[] }> | null = null;
function initCollections(reset?: true) {
  if (!reset && prom) return prom;
  prom = fetch(url).then((res) => res.json());
  return prom;
}

function CollectionsProvider({ children }: PropsWithChildren) {
  const [prom, setProm] = useState(initCollections);

  const refresh = useCallback(() => setProm(initCollections(true)), []);

  return (
    <CollectionsContext.Provider value={{ prom, refresh }}>
      {children}
    </CollectionsContext.Provider>
  );
}

export { CollectionsProvider };
export default CollectionsContext;
