import { RiFoldersLine, RiMusic2Line } from "@remixicon/react";
import { Suspense, use } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import type { EditSongSchema } from "../../../schema";
import { cn } from "../../../utils";
import { useSongsContext } from "../hooks/songs";

function OrganizeSongsContentFallback() {
  return (
    <div className="my-auto flex flex-1 flex-col items-center justify-center space-y-4 text-slate-500 italic">
      <div className="rounded-full bg-slate-800/40 p-8 text-slate-400 opacity-50">
        <RiMusic2Line className="size-32 animate-pulse" />
      </div>
      <p>Loading folders...</p>
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

  function handleSelectSong(name: string) {
    form.setValue("song", name);
    form.clearErrors();
  }

  const handleDragStart = (e: React.DragEvent, songId: string) => {
    e.dataTransfer.setData("songId", songId);
    e.dataTransfer.effectAllowed = "move";
  };

  return songs.length ? (
    songs.map(({ name }) => (
      <button
        key={name}
        type="button"
        draggable
        onDragStart={(e) => handleDragStart(e, name)}
        onClick={() => handleSelectSong(name)}
        className={cn(
          "w-full cursor-grab rounded-lg px-4 py-3 text-left font-mono text-xl transition-all active:cursor-grabbing",
          selectedSongId === name
            ? "scale-[1.02] bg-purple-600 text-white shadow-lg shadow-purple-500/30"
            : "bg-slate-800/40 text-slate-400 hover:bg-slate-800 hover:text-slate-200",
        )}
      >
        <div className="truncate font-bold text-xl">{name}</div>
      </button>
    ))
  ) : (
    <p className="my-auto flex items-center justify-center text-slate-500 italic">
      No songs in this collection
    </p>
  );
}

export default function OrganizeSongs() {
  const collection = useWatch<EditSongSchema>({ name: "collection" });
  const { prom } = useSongsContext();

  return (
    <div className="flex w-1/4 flex-col rounded-xl border border-slate-700 bg-slate-800/20 p-4 shadow-2xl backdrop-blur-sm">
      <h2 className="mb-4 font-bold text-2xl text-slate-100 uppercase tracking-wide">
        Songs
      </h2>
      <div className="flex flex-1 flex-col space-y-2 pr-2">
        {collection ? (
          <Suspense fallback={<OrganizeSongsContentFallback />}>
            <OrganizeSongsContent promise={prom} />
          </Suspense>
        ) : (
          <div className="my-auto flex flex-1 flex-col items-center justify-center space-y-4 text-slate-500 italic">
            <div className="rounded-full bg-slate-800/40 p-8 text-slate-400 opacity-50">
              <RiFoldersLine className="size-32" />
            </div>
            <p className="items-center justify-center px-4 text-center text-slate-500 italic">
              Select a collection to view songs
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
