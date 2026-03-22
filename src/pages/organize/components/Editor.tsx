import { ErrorMessage } from "@hookform/error-message";
import { RiEditLine, RiMusic2Line } from "@remixicon/react";
import {
  type ChangeEvent,
  Suspense,
  startTransition,
  use,
  useActionState,
  useEffect,
  useState,
  useTransition,
} from "react";
import { useFormContext, useWatch } from "react-hook-form";
import Difficulty from "../../../components/Song/Difficulty";
import type { EditSongApiResponse, EditSongSchema } from "../../../schema";
import type { Throwable } from "../../../types";
import { useEditorContext } from "../hooks/editor";
import { useSongsContext } from "../hooks/songs";

const genres = [
  "Broadway",
  "Classical",
  "Country",
  "EDM, Techno, House",
  "Folk, Acoustic",
  "Hip-Hop, Rap",
  "Indie, Alternative",
  "Jazz",
  "K-Pop, Asian Pop",
  "Latin",
  "Lo-Fi, Ambient",
  "Metal",
  "Other",
  "Pop",
  "Punk, Pop-Punk",
  "R&B, Soul",
  "Reggae",
  "Rock",
  "Synth-Pop, Retro-80s",
];

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

type OrganizeEditorSongDetailsHeaderProps = {
  promise: Promise<EditSongApiResponse | undefined>;
};

function OrganizeEditorSongDetailsHeader({
  promise,
}: OrganizeEditorSongDetailsHeaderProps) {
  const song = use(promise);
  const difficulty = [
    song?.grades.Beginner || "-",
    song?.grades.Easy || "-",
    song?.grades.Medium || "-",
    song?.grades.Hard || "-",
    song?.grades.Challenge || "-",
  ] as [
    `${number}` | "-",
    `${number}` | "-",
    `${number}` | "-",
    `${number}` | "-",
    `${number}` | "-",
  ];

  return (
    <div>
      <Difficulty difficulty={difficulty}>Single</Difficulty>
      <p className="text-2xl text-slate-300">BPM {song?.bpm}</p>
    </div>
  );
}

type OrganizeEditorAudioPlayerProps = {
  files: string[];
  path: string;
};

function OrganizeEditorAudioPlayer({
  path,
  files,
}: OrganizeEditorAudioPlayerProps) {
  const { refresh } = useEditorContext();
  const [isError, setIsError] = useState(false);
  const [isPending, startTransition] = useTransition();
  const selectedCollectionId = useWatch<EditSongSchema>({ name: "collection" });
  const selectedSongId = useWatch<EditSongSchema>({ name: "song" });
  const src = `/api/audio/${encodeURIComponent(selectedCollectionId!)}/${encodeURIComponent(selectedSongId!)}/${encodeURIComponent(path)}`;

  async function handleUpdateAudioFile(
    e: ChangeEvent<HTMLSelectElement>,
  ): Promise<void> {
    if (!e.currentTarget.value) return;
    try {
      const url = new URL(`${window.location.origin}/api/editor/audio/update`);
      url.searchParams.append("collection", selectedCollectionId!);
      url.searchParams.append("song", selectedSongId!);
      url.searchParams.append("file", e.currentTarget.value);
      const result = await fetch(url);
      if (!result.ok) return console.log(result.statusText);
      refresh();
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(
    function lookForAudio() {
      fetch(src)
        .then((res) => setIsError(!res.ok))
        .catch(() => setIsError(true));
    },
    [src],
  );

  return isError ? (
    <div>
      <label
        htmlFor="audio"
        className="mt-8 mb-3 block font-bold text-2xl text-slate-400 uppercase tracking-widest"
      >
        Audio File
      </label>
      <select
        id="audio"
        disabled={isPending}
        className="w-full appearance-none rounded-lg border border-slate-600 bg-slate-800/40 px-5 py-4 text-3xl text-white placeholder-slate-500 transition-all focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
        onChange={(e) => startTransition(() => handleUpdateAudioFile(e))}
      >
        <option value="">Select an file...</option>
        {files.map((file) => (
          <option key={file} value={file}>
            {file}
          </option>
        ))}
      </select>
    </div>
  ) : (
    <figure>
      {/** biome-ignore lint/a11y/useMediaCaption: <explanation> */}
      <audio controls src={src} className="mt-8 w-full"></audio>
    </figure>
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
  promise: Promise<EditSongApiResponse | undefined>;
};

function OrganizeEditorContent({ promise }: OrganizeEditorContentProps) {
  const song = use(promise);
  const form = useFormContext<EditSongSchema>();
  const { refresh } = useSongsContext();

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

  if (!song) return null;

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
      <select
        {...form.register("genre")}
        id="genre"
        className="w-full appearance-none rounded-lg border border-slate-600 bg-slate-800/40 px-5 py-4 text-3xl text-white placeholder-slate-500 transition-all focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        <option value="">Select a genre...</option>
        {genres.map((genre) => (
          <option key={genre} value={genre}>
            {genre}
          </option>
        ))}
      </select>
      <ErrorMessage
        errors={form.formState.errors}
        name="genre"
        render={({ message }) => (
          <p className="text-lg text-red-600">{message}</p>
        )}
      />
      <OrganizeEditorAudioPlayer path={song.music} files={song.files} />
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
  const selectedSongId = useWatch<EditSongSchema>({ name: "song" });
  const { prom } = useEditorContext();

  return (
    <div className="flex flex-1 flex-col rounded-xl border border-slate-700 bg-slate-800/20 p-8 shadow-2xl backdrop-blur-sm transition-all">
      <div className="mb-8 flex flex-wrap justify-between gap-y-4">
        <h2 className="font-bold text-5xl text-slate-100 uppercase tracking-wide">
          Editor
        </h2>
        {selectedSongId ? (
          <Suspense>
            <OrganizeEditorSongDetailsHeader promise={prom} />
          </Suspense>
        ) : null}
      </div>

      {selectedSongId ? (
        <Suspense fallback={<OrganizeEditorContentFallback />}>
          <OrganizeEditorContent key={selectedSongId} promise={prom} />
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
