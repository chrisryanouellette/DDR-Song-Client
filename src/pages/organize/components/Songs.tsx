import {
  RiDeleteBin7Line,
  RiFoldersLine,
  RiMistLine,
  RiMusic2Line,
  RiRefreshLine,
} from "@remixicon/react";
import {
  Suspense,
  startTransition,
  use,
  useActionState,
  useDeferredValue,
} from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { toast } from "../../../components/Toast/utils";
import type { EditSongSchema } from "../../../schema";
import type { Throwable } from "../../../types";
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

type OrganizeSongDeleteSongButtonProps = {
  song: string;
};

function OrganizeSongDeleteSongButton({
  song,
}: OrganizeSongDeleteSongButtonProps) {
  const { getValues } = useFormContext<EditSongSchema>();
  const { refresh } = useSongsContext();
  async function onDeleteSong(_: Throwable, data: string): Promise<Throwable> {
    try {
      const collection = getValues("collection");
      const url = new URL(`${window.location.origin}/api/song/delete`);
      url.searchParams.append("collection", collection);
      url.searchParams.append("song", data);
      const response = await fetch(url);
      if (!response.ok) {
        const message = await response.text();
        toast(message, "error");
        return { isError: true, error: new Error(message) };
      }
      refresh();
      return { isError: false };
    } catch (error) {
      toast("Something went wrong deleting the Song.", "error");
      return {
        isError: true,
        error: new Error(
          "Something went wrong when trying to delete the Song.",
          { cause: error },
        ),
      };
    }
  }

  const [state, action, isPending] = useActionState(onDeleteSong, {
    isError: false,
  });

  return (
    <button
      type="button"
      disabled={isPending}
      className={cn(
        "mr-2 ml-auto p-1 transition-colors hover:text-slate-900 disabled:animate-pulse",
        state.isError && "text-red-300 hover:text-red-600",
      )}
      onClick={(e) => {
        e.stopPropagation();
        startTransition(() => action(song));
      }}
    >
      <RiDeleteBin7Line />
    </button>
  );
}

type OrganizeSongsContentProps = {
  promise: Promise<{ songs: { name: string }[] } | undefined>;
  isRefreshing: boolean;
};

function OrganizeSongsContent({
  promise,
  isRefreshing,
}: OrganizeSongsContentProps) {
  const result = use(promise);
  const form = useFormContext<EditSongSchema>();
  const selectedSongId = useWatch<EditSongSchema>({ name: "song" });
  const search = useWatch<EditSongSchema>({ name: "search" });

  function handleSelectSong(name: string) {
    form.setValue("song", name);
    form.clearErrors();
  }

  const handleDragStart = (e: React.DragEvent, songId: string) => {
    e.dataTransfer.setData("songId", songId);
    e.dataTransfer.effectAllowed = "move";
  };

  if (!result?.songs) return <OrganizeSongsContentFallback />;
  const { songs } = result;
  const filtered = search
    ? songs.filter(({ name }) =>
        name.toLowerCase().includes(search.toLowerCase()),
      )
    : songs;

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <div
        className={cn(
          "flex flex-1 flex-col space-y-2 overflow-auto px-4 transition-opacity duration-300",
          isRefreshing ? "opacity-40" : "opacity-100",
        )}
      >
        {songs.length ? (
          filtered.length ? (
            filtered.map(({ name }) => (
              <button
                key={name}
                type="button"
                draggable
                onDragStart={(e) => handleDragStart(e, name)}
                onClick={() => handleSelectSong(name)}
                className={cn(
                  "flex w-full cursor-grab items-center rounded-lg px-4 py-3 text-left font-bold font-mono text-2xl transition-all active:cursor-grabbing",
                  selectedSongId === name
                    ? "scale-[1.02] bg-purple-600 text-white shadow-lg shadow-purple-500/30"
                    : "bg-slate-800/40 text-slate-400 hover:bg-slate-800 hover:text-slate-200",
                )}
              >
                {name}
                {selectedSongId === name ? (
                  <OrganizeSongDeleteSongButton song={name} />
                ) : null}
              </button>
            ))
          ) : (
            <div className="my-auto flex flex-1 flex-col items-center justify-center space-y-4 text-slate-500 italic">
              <div className="rounded-full bg-slate-800/40 p-8 text-slate-400 opacity-50">
                <RiMistLine className="size-32" />
              </div>
              <p> No songs found from search.</p>
            </div>
          )
        ) : (
          <div className="my-auto flex flex-1 flex-col items-center justify-center space-y-4 text-slate-500 italic">
            <div className="rounded-full bg-slate-800/40 p-8 text-slate-400 opacity-50">
              <RiMistLine className="size-32" />
            </div>
            <p> No songs in this collection</p>
          </div>
        )}
      </div>
      <form className="mt-auto mb-4 px-4">
        <label
          htmlFor="search"
          className="mt-4 mb-3 block font-bold text-2xl text-slate-400 uppercase tracking-widest"
        >
          Search
        </label>
        <input
          {...form.register("search")}
          type="text"
          id="search"
          placeholder="Enter song title..."
          className="w-full rounded-lg border border-slate-600 bg-slate-800/40 px-5 py-4 text-3xl text-white placeholder-slate-500 transition-all focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </form>
    </div>
  );
}

export default function OrganizeSongs() {
  const collection = useWatch<EditSongSchema>({ name: "collection" });
  const { prom, refresh } = useSongsContext();
  const deferredProm = useDeferredValue(prom);
  const isRefreshing = prom !== deferredProm;

  return (
    <div className="flex w-1/4 flex-col rounded-xl border border-slate-700 bg-slate-800/20 py-4 shadow-2xl backdrop-blur-sm">
      <h2 className="mb-4 flex items-center px-4 font-bold text-2xl text-slate-100 uppercase tracking-wide">
        Songs
        <button
          type="button"
          className="mr-2 ml-auto hover:text-purple-300"
          onClick={refresh}
        >
          <RiRefreshLine />
        </button>
      </h2>
      <div className="flex flex-1 flex-col overflow-auto">
        {collection ? (
          <Suspense fallback={<OrganizeSongsContentFallback />}>
            <OrganizeSongsContent
              promise={deferredProm}
              isRefreshing={isRefreshing}
            />
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
