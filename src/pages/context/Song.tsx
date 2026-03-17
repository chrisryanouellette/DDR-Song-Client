import { createContext, type PropsWithChildren, useMemo } from "react";
import type { SongDetails } from "../../types";

const SongDetailsContext = createContext<Promise<SongDetails> | null>(null);

type SongDetailsProviderProps = {
  id: string;
};

function SongDetailsProvider({
  children,
  id,
}: PropsWithChildren<SongDetailsProviderProps>) {
  const prom = useMemo(() => {
    const url = new URL(`${window.location.origin}/api/song/details`);
    url.searchParams.append("id", id);
    return fetch(url).then((res) => res.json());
  }, [id]);
  return (
    <SongDetailsContext.Provider value={prom}>
      {children}
    </SongDetailsContext.Provider>
  );
}

export { SongDetailsProvider };
export default SongDetailsContext;
