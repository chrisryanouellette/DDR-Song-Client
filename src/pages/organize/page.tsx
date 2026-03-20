import { ErrorMessage } from "@hookform/error-message";
import { zodResolver } from "@hookform/resolvers/zod";
import { RiEditLine } from "@remixicon/react";
import { Suspense, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { editSongSchema } from "../../schema";
import { cn } from "../../utils";
import OrganizeCollections from "./components/Collections";
import OrganizeSongs from "./components/Songs";
import OrganizeFormContextProvider from "./context/Form";

const dummyCollections = [
  { id: "1", name: "DDR A3" },
  { id: "2", name: "DDR World" },
  { id: "3", name: "Custom Songs" },
  { id: "4", name: "DDR A20 Plus" },
  { id: "5", name: "DDR SuperNova" },
];

const dummySongs = [
  {
    id: "s1",
    title: "Poseidon",
    artist: "NAOKI underground",
    collectionId: "1",

    genre: "Dance",
  },
  {
    id: "s2",
    title: "Healing Vision",
    artist: "DE-SIRE",
    collectionId: "1",

    genre: "Trance",
  },
  {
    id: "s3",
    title: "MAX 300",
    artist: "Omega",
    collectionId: "2",

    genre: "Hardcore",
  },
  {
    id: "s4",
    title: "EGOISM 440",
    artist: "U1 High-Speed",
    collectionId: "2",

    genre: "Speedcore",
  },
  {
    id: "s5",
    title: "Paranoia Hades",
    subtitle: "ontuhou",
    artist: "αTYPE-300",
    collectionId: "5",

    genre: "Industrial",
  },
];

export default function OrganizePage() {
  const [dragOverCollectionId, setDragOverCollectionId] = useState<
    string | null
  >(null);
  const form = useForm({ resolver: zodResolver(editSongSchema) });
  const selectedCollectionId = useWatch({
    control: form.control,
    name: "collection",
  });
  const selectedSongId = useWatch({ control: form.control, name: "song" });

  const songsInCollection = dummySongs.filter(
    (s) => s.collectionId === selectedCollectionId,
  );

  const handleMoveSong = (songId: string, targetCollectionId: string) => {
    const song = dummySongs.find((s) => s.id === songId);
    const collection = dummyCollections.find(
      (c) => c.id === targetCollectionId,
    );
    console.log(
      `Moving song "${song?.title}" to collection "${collection?.name}"`,
    );
    // This is where the server call will go
  };

  const handleDragStart = (e: React.DragEvent, songId: string) => {
    e.dataTransfer.setData("songId", songId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragLeave = () => {
    setDragOverCollectionId(null);
  };

  const handleDrop = (e: React.DragEvent, targetCollectionId: string) => {
    e.preventDefault();
    setDragOverCollectionId(null);
    const songId = e.dataTransfer.getData("songId");
    if (songId) {
      handleMoveSong(songId, targetCollectionId);
    }
  };

  return (
    <OrganizeFormContextProvider>
      <div className="flex flex-1 gap-6 px-16 pb-8">
        {/* Column 1: Collections */}
        <OrganizeCollections />

        {/* Column 2: Songs */}
        <OrganizeSongs />

        {/* Column 3: Editor */}
        <div className="flex flex-1 flex-col rounded-xl border border-slate-700 bg-slate-800/20 p-8 shadow-2xl backdrop-blur-sm transition-all">
          <h2 className="mb-8 font-bold text-5xl text-slate-100 uppercase tracking-wide">
            Editor
          </h2>
          {selectedSongId ? (
            <form
              className="flex flex-1 flex-col pr-4"
              onSubmit={form.handleSubmit(() => {}, console.error)}
            >
              <div className="grid grid-cols-2 gap-8">
                <div>
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
                    className="w-full rounded-lg border border-slate-600 bg-slate-800/40 px-5 py-4 text-2xl text-white placeholder-slate-500 transition-all focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <ErrorMessage
                    errors={form.formState.errors}
                    name="title"
                    render={({ message }) => (
                      <p className="mt-1 text-lg text-red-600">{message}</p>
                    )}
                  />
                </div>
                <div>
                  <label
                    htmlFor="subtitle"
                    className="mb-3 block font-bold text-2xl text-slate-400 uppercase tracking-widest"
                  >
                    Subtitle <span className="text-sm">Optional</span>
                  </label>
                  <input
                    type="text"
                    id="subtitle"
                    {...form.register("subtitle")}
                    placeholder="Enter song subtitle..."
                    className="w-full rounded-lg border border-slate-600 bg-slate-800/40 px-5 py-4 text-2xl text-white placeholder-slate-500 transition-all focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <label
                htmlFor="artist"
                className="mt-8 mb-3 block font-bold text-2xl text-slate-400 uppercase tracking-widest"
              >
                Artist <span className="text-sm">Comma separated</span>
              </label>
              <input
                {...form.register("artist")}
                type="text"
                id="artist"
                placeholder="Enter artist name..."
                className="w-full rounded-lg border border-slate-600 bg-slate-800/40 px-5 py-4 text-2xl text-white placeholder-slate-500 transition-all focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                className="w-full rounded-lg border border-slate-600 bg-slate-800/40 px-5 py-4 text-2xl text-white placeholder-slate-500 transition-all focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <ErrorMessage
                errors={form.formState.errors}
                name="genre"
                render={({ message }) => (
                  <p className="text-lg text-red-600">{message}</p>
                )}
              />
              <div className="mt-auto pt-6">
                <button
                  type="submit"
                  className="w-full cursor-pointer rounded-lg bg-purple-600 px-8 py-5 font-bold font-mono text-2xl text-white shadow-lg transition-all hover:bg-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center space-y-4 text-slate-500 italic">
              <div className="rounded-full bg-slate-800/40 p-8 text-slate-400 opacity-50">
                <RiEditLine className="size-32" />
              </div>
              <p className="text-xl">Select a song to edit details</p>
            </div>
          )}
        </div>
      </div>
    </OrganizeFormContextProvider>
  );
}
