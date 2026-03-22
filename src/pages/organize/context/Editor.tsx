import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useFormContext, useWatch } from "react-hook-form";
import type { EditSongApiResponse, EditSongSchema } from "../../../schema";

const EditorContext = createContext<{
  prom: Promise<EditSongApiResponse | undefined>;
  refresh: () => void;
} | null>(null);

function initEditorPromise(
  collection: string,
  song: string,
): Promise<EditSongApiResponse> {
  const url = new URL(`${window.location.origin}/api/song/editor`);
  url.searchParams.append("collection", collection);
  url.searchParams.append("song", song);
  return fetch(url).then((res) => res.json());
}

function EditorContextProvider({ children }: PropsWithChildren) {
  const { getValues, setValue } = useFormContext<EditSongSchema>();
  const collection = useWatch<EditSongSchema>({ name: "collection" });
  const song = useWatch<EditSongSchema>({ name: "song" });
  const [prom, setProm] = useState<Promise<EditSongApiResponse | undefined>>(
    () => Promise.resolve(undefined),
  );

  const refresh = useCallback(() => {
    const collection = getValues("collection");
    const song = getValues("song");
    setProm(
      initEditorPromise(collection, song).then((res) => {
        setValue("title", res.title);
        setValue("subtitle", res.subtitle);
        setValue("artist", res.artist);
        setValue("genre", res.genre);
        return res;
      }),
    );
  }, [getValues, setValue]);

  useEffect(
    function inCollectionSubscription() {
      if (!collection || !song) return;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProm(
        initEditorPromise(collection, song).then((res) => {
          setValue("title", res.title);
          setValue("subtitle", res.subtitle);
          setValue("artist", res.artist);
          setValue("genre", res.genre);
          return res;
        }),
      );
    },
    [collection, setValue, song],
  );

  return (
    <EditorContext.Provider value={{ prom, refresh }}>
      {children}
    </EditorContext.Provider>
  );
}

export { EditorContextProvider };
export default EditorContext;
