import { ErrorMessage } from "@hookform/error-message";
import { RiEditLine, RiMusic2Line } from "@remixicon/react";
import { Suspense, startTransition, use, useActionState, useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import type { EditSongSchema } from "../../../schema";
import type { Throwable } from "../../../types";
import { useSongsContext } from "../hooks/songs";

function OrganizeEditorContentFallback() {
  return (
    <div className="my-auto flex flex-1 flex-col items-center justify-center space-y-4 text-slate-500 italic">
      <div className="rounded-full bg-slate-800/40 p-8 text-slate-400 opacity-50">
        <RiMusic2Line className="size-32 animate-pulse" />
      </div>
      <p>Loading song...</p>
    </div>
  );
}

async function saveSongDetailsAction(
  data: EditSongSchema,
): Promise<Throwable<boolean>> {
  try {
    const url = new URL(`${window.location.origin}/api/song/editor`);
    url.searchParams.append("collection", data.collection);
    url.searchParams.append("song", data.song);
    url.searchParams.append("title", data.title);
    url.searchParams.append("subtitle", data.subtitle ?? "");
    url.searchParams.append("artist", data.artist);
    url.searchParams.append("genre", data.genre);
    const result = await fetch(url, { method: "POST" });
    if (!result.ok) {
      return { isError: true, error: new Error(result.statusText) };
    }
    return { isError: false, value: true };
  } catch (error) {
    return {
      isError: true,
      error: new Error("Something went wrong when updating the song details", {
        cause: error,
      }),
    };
  }
}

type OrganizeEditorContentProps = {
  promise: Promise<{
    title: string;
    subtitle?: string;
    genre: string;
    artist: string;
    music: string;
  }>;
};

function OrganizeEditorContent({ promise }: OrganizeEditorContentProps) {
  const song = use(promise);
  const form = useFormContext<EditSongSchema>();
  const { refresh } = useSongsContext();
  const selectedCollectionId = useWatch<EditSongSchema>({ name: "collection" });
  const selectedSongId = useWatch<EditSongSchema>({ name: "song" });

  async function onSubmit(_: Throwable<boolean>, data: EditSongSchema) {
    const result = await saveSongDetailsAction(data);
    if (result.isError) return result;
    refresh();
    return result;
  }

  const [state, action, isPending] = useActionState(onSubmit, {
    isError: false,
    value: false,
  });

  if (!state.isError && state.value) {
    return (
      <div className="my-auto flex flex-1 flex-col items-center justify-center space-y-4 text-slate-500 italic">
        <div className="rounded-full bg-slate-800/40 p-8 text-slate-400 opacity-50">
          <RiMusic2Line className="size-32" />
        </div>
        <p>Song updated!</p>
      </div>
    );
  }

  return (
    <form
      className="flex flex-1 flex-col pr-4"
      onSubmit={form.handleSubmit(
        (data) => startTransition(() => action(data)),
        console.error,
      )}
    >
      <label
        htmlFor="song-title"
        className="mb-3 block font-bold text-2xl text-slate-400 uppercase tracking-widest"
      >
        Song Title
      </label>
      <input
        type="text"
        id="song-title"
        {...form.register("title")}
        placeholder="Enter song title..."
        className="w-full rounded-lg border border-slate-600 bg-slate-800/40 px-5 py-4 text-3xl text-white placeholder-slate-500 transition-all focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
      <ErrorMessage
        errors={form.formState.errors}
        name="title"
        render={({ message }) => (
          <p className="mt-1 text-lg text-red-600">{message}</p>
        )}
      />
      <label
        htmlFor="subtitle"
        className="mt-8 mb-3 block font-bold text-2xl text-slate-400 uppercase tracking-widest"
      >
        Subtitle <span className="text-sm">Optional</span>
      </label>
      <input
        type="text"
        id="subtitle"
        {...form.register("subtitle")}
        placeholder="Enter song subtitle..."
        className="w-full rounded-lg border border-slate-600 bg-slate-800/40 px-5 py-4 text-3xl text-white placeholder-slate-500 transition-all focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
      <label
        htmlFor="artist"
        className="mt-8 mb-3 block font-bold text-2xl text-slate-400 uppercase tracking-widest"
      >
        Artist
      </label>
      <input
        {...form.register("artist")}
        type="text"
        id="artist"
        placeholder="Enter artist name..."
        className="w-full rounded-lg border border-slate-600 bg-slate-800/40 px-5 py-4 text-3xl text-white placeholder-slate-500 transition-all focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
      <ErrorMessage
        errors={form.formState.errors}
        name="artist"
        render={({ message }) => (
          <p className="mt-1 text-lg text-red-600">{message}</p>
        )}
      />
      <label
        htmlFor="genre"
        className="mt-8 mb-3 block font-bold text-2xl text-slate-400 uppercase tracking-widest"
      >
        Genre
      </label>
      <input
        {...form.register("genre")}
        type="text"
        id="genre"
        placeholder="e.g. Dance"
        className="w-full rounded-lg border border-slate-600 bg-slate-800/40 px-5 py-4 text-3xl text-white placeholder-slate-500 transition-all focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
      <ErrorMessage
        errors={form.formState.errors}
        name="genre"
        render={({ message }) => (
          <p className="text-lg text-red-600">{message}</p>
        )}
      />
      <figure>
        {/** biome-ignore lint/a11y/useMediaCaption: <explanation> */}
        <audio
          controls
          className="mt-8 w-full"
          src={`/api/audio/${encodeURIComponent(selectedCollectionId!)}/${encodeURIComponent(selectedSongId!)}/${encodeURIComponent(song.music)}`}
        ></audio>
      </figure>
      <div className="mt-auto pt-6">
        <button
          type="submit"
          disabled={isPending}
          className="w-full cursor-pointer rounded-lg bg-purple-600 px-8 py-5 font-bold font-mono text-2xl text-white shadow-lg transition-all hover:bg-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          Save Changes
        </button>
        {state.isError ? (
          <p className="text-lg text-red-600">{state.error.message}</p>
        ) : null}
      </div>
    </form>
  );
}

export function OrganizeEditor() {
  const { setValue } = useFormContext();
  const selectedCollectionId = useWatch<EditSongSchema>({ name: "collection" });
  const selectedSongId = useWatch<EditSongSchema>({ name: "song" });
  const promise = useMemo(() => {
    if (!selectedSongId || !selectedCollectionId) return Promise.resolve();
    const url = new URL(`${window.location.origin}/api/song/editor`);
    url.searchParams.append("collection", selectedCollectionId);
    url.searchParams.append("song", selectedSongId);
    return fetch(url)
      .then((res) => res.json())
      .then((res) => {
        setValue("folder", res.folder);
        setValue("title", res.title);
        setValue("subtitle", res.subtitle);
        setValue("artist", res.artist);
        setValue("genre", res.genre);
        return res;
      });
  }, [setValue, selectedCollectionId, selectedSongId]);

  return (
    <div className="flex flex-1 flex-col rounded-xl border border-slate-700 bg-slate-800/20 p-8 shadow-2xl backdrop-blur-sm transition-all">
      <h2 className="mb-8 font-bold text-5xl text-slate-100 uppercase tracking-wide">
        Editor
      </h2>
      {selectedSongId ? (
        <Suspense fallback={<OrganizeEditorContentFallback />}>
          <OrganizeEditorContent key={selectedSongId} promise={promise} />
        </Suspense>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center space-y-4 text-slate-500 italic">
          <div className="rounded-full bg-slate-800/40 p-8 text-slate-400 opacity-50">
            <RiEditLine className="size-32" />
          </div>
          <p>Select a song to edit details</p>
        </div>
      )}
    </div>
  );
}
