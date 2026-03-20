import { RiMusic2Line } from "@remixicon/react";
import { Suspense, use, useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { cn } from "../../../utils";

function OrganizeSongsContentFallback() {
  return (
    <div className="my-auto flex flex-1 flex-col items-center justify-center space-y-4 text-slate-500 italic">
      <div className="rounded-full bg-slate-800/40 p-8 text-slate-400 opacity-50">
        <RiMusic2Line className="size-32 animate-pulse" />
      </div>
      <p className="text-xl">Loading folders...</p>
    </div>
  );
}

type OrganizeSongsContentProps = {
  promise: Promise<{ songs: { name: string }[] }>;
};

function OrganizeSongsContent({ promise }: OrganizeSongsContentProps) {
  const { songs } = use(promise);
  const form = useFormContext();
  const selectedSongId = useWatch({ name: "song" });

  return songs.length ? (
    songs.map(({ name }) => (
      <button
        key={name}
        type="button"
        draggable
        //   onDragStart={(e) => handleDragStart(e, name)}
        onClick={() => form.setValue("song", name)}
        className={cn(
          "w-full cursor-grab rounded-lg px-4 py-3 text-left font-mono text-xl transition-all active:cursor-grabbing",
          selectedSongId === name
            ? "scale-[1.02] bg-purple-600 text-white shadow-lg shadow-purple-500/30"
            : "bg-slate-800/40 text-slate-400 hover:bg-slate-800 hover:text-slate-200",
        )}
      >
        <div className="truncate font-bold text-xl">{name}</div>
        {/* <div className="mt-1 truncate text-sm opacity-70">{song.artist}</div> */}
      </button>
    ))
  ) : (
    <p className="my-auto flex items-center justify-center text-slate-500 italic">
      No songs in this collection
    </p>
  );
}

export default function OrganizeSongs() {
  const folder = useWatch({ name: "collection" });
  const promise = useMemo(() => {
    if (!folder) return Promise.reject();
    const url = new URL(`${window.location.origin}/api/songs/list`);
    url.searchParams.append("folder", folder);
    return fetch(url).then((res) => res.json());
  }, [folder]);

  return (
    <div className="flex w-1/4 flex-col rounded-xl border border-slate-700 bg-slate-800/20 p-4 shadow-2xl backdrop-blur-sm">
      <h2 className="mb-4 font-bold text-2xl text-slate-100 uppercase tracking-wide">
        Songs
      </h2>
      <div className="flex flex flex-1 flex-col flex-col space-y-2 pr-2">
        {folder ? (
          <Suspense fallback={<OrganizeSongsContentFallback />}>
            <OrganizeSongsContent promise={promise} />
          </Suspense>
        ) : (
          <p className="my-auto items-center justify-center px-4 text-center text-slate-500 italic">
            Select a collection to view songs
          </p>
        )}
      </div>
    </div>
  );
}
