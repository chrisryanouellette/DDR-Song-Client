import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useFormContext, useWatch } from "react-hook-form";
import type { EditSongSchema } from "../../../schema";

const SongsContext = createContext<{
  prom: Promise<{ songs: { name: string }[] } | undefined>;
  refresh: () => void;
} | null>(null);

function initSongsPromise(collection?: string) {
  if (!collection) return Promise.resolve();
  const url = new URL(`${window.location.origin}/api/songs/list`);
  url.searchParams.append("collection", collection);
  return fetch(url).then((res) => res.json());
}

function SongsContextProvider({ children }: PropsWithChildren) {
  const { getValues } = useFormContext<EditSongSchema>();
  const collection = useWatch<EditSongSchema>({ name: "collection" });
  const [prom, setProm] = useState(() => initSongsPromise());

  const refresh = useCallback(() => {
    const collection = getValues("collection");
    setProm(initSongsPromise(collection));
  }, [getValues]);

  useEffect(
    function inCollectionSubscription() {
      setProm(initSongsPromise(collection));
    },
    [collection],
  );

  return (
    <SongsContext.Provider value={{ prom, refresh }}>
      {children}
    </SongsContext.Provider>
  );
}

export { SongsContextProvider };
export default SongsContext;
