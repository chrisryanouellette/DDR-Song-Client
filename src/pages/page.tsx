import { zodResolver } from "@hookform/resolvers/zod";
import { RiDownload2Line, RiLoader2Fill } from "@remixicon/react";
import { Suspense, startTransition, useActionState, useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import SongCard from "../components/Cards/Songs";
import Dialog from "../components/Dialog";
import Difficulty from "../components/Song/Difficulty";
import { searchSchema } from "../schema";
import type { SearchSong } from "../types";
import { Bpm, BpmFallback } from "./components/Bpm";
import { Grade } from "./components/Grade";
import { Preview, PreviewFallback } from "./components/Prewiew";
import { Quality, QualityFallback } from "./components/Quality";
import { SongDetailsProvider } from "./context/Song";

type SearchInputs = z.infer<typeof searchSchema>;

async function searchAction(_: SearchSong[] | null, data: SearchInputs) {
  window.scrollTo({ top: 0, behavior: "smooth" });
  const url = new URL(`${window.location.origin}/api/search`);
  if ("songtitle" in data) {
    url.searchParams.append("songtitle", data.songtitle);
  }
  if ("songartist" in data) {
    url.searchParams.append("songartist", data.songartist);
  }
  const response = await fetch(url);
  const json = (await response.json()) as SearchSong[];
  console.log(json);
  return json;
}

function IndexPage() {
  const {
    setValue,
    register,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm<SearchInputs>({
    resolver: zodResolver(searchSchema),
  });
  const [preview, setPreview] = useState<string | null>(null);

  const [search, action, isPending] = useActionState(searchAction, null);

  function handleSelectSong(song: string) {
    const current = getValues("songtitle");
    setValue("songtitle", song);
    setValue("songartist", "");
    if (current.toLowerCase() === song.toLowerCase()) return;
    handleSubmit(
      (result) => startTransition(() => action(result)),
      console.error,
    )();
  }

  function handleSelectArtist(artist: string) {
    const current = getValues("songartist");
    setValue("songtitle", "");
    setValue("songartist", artist);
    if (current.toLowerCase() === artist.toLowerCase()) return;
    handleSubmit(
      (result) => startTransition(() => action(result)),
      console.error,
    )();
  }

  return (
    <div className="mx-auto px-16">
      <form
        className="flex flex-wrap items-center gap-y-4 rounded-lg"
        onSubmit={handleSubmit(
          (result) => startTransition(() => action(result)),
          console.error,
        )}
      >
        <div className="flex flex-1 flex-col gap-y-2">
          <label
            htmlFor="song-title"
            className="font-medium text-3xl text-slate-200"
          >
            Song Title
          </label>
          <input
            id="song-title"
            {...register("songtitle")}
            type="text"
            placeholder="Search by song title..."
            className="col-start-1 flex-1 rounded-r-lg rounded-l-lg border border-slate-500 bg-transparent px-4 py-3 font-mono text-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-800 sm:rounded-r-none"
          />
        </div>
        <div className="flex flex-1 flex-col gap-y-2">
          <label
            htmlFor="artist-name"
            className="font-medium text-3xl text-slate-200"
          >
            Artist Name
          </label>
          <input
            id="artist-name"
            {...register("songartist")}
            type="text"
            placeholder="Search by artist name..."
            className="flex-1 rounded-r-lg rounded-l-lg border border-slate-500 bg-transparent px-4 py-3 font-mono text-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-800 sm:rounded-l-none"
          />
        </div>
        <button
          type="submit"
          className="relative col-span-2 flex min-w-32 basis-full items-center justify-center self-end rounded-lg bg-purple-600 px-8 py-3.5 font-mono text-2xl text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-800 md:ml-4 md:basis-auto"
          disabled={isPending}
        >
          {isPending ? (
            <RiLoader2Fill className="size-8 animate-spin" />
          ) : (
            "Search"
          )}
        </button>
        {"songtitle" in errors || "songartist" in errors ? (
          <p className="basis-full text-3xl text-red-500">
            {errors.songtitle?.message || errors.songartist?.message}
          </p>
        ) : null}
      </form>
      {search === null ? null : !search?.length ? (
        <img
          src="no-song.png"
          alt="no songs found in search"
          className="mx-auto mt-12"
        />
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {search.map((song) => (
            <SongDetailsProvider key={song.id} id={song.id}>
              <SongCard>
                <SongCard.Title>
                  <button
                    type="button"
                    className="line-clamp-3 cursor-pointer text-left pressed:text-purple-600 transition-colors hover:text-purple-500 active:text-purple-600"
                    onClick={() => handleSelectSong(song.title)}
                  >
                    {song.title}
                  </button>
                  <Suspense fallback={<PreviewFallback />}>
                    <Preview onClickPreview={setPreview} />
                  </Suspense>
                  <button
                    type="button"
                    className="mt-1 h-min shrink-0 cursor-pointer"
                  >
                    <RiDownload2Line className="size-8 pressed:fill-purple-500 transition-colors hover:fill-purple-500" />
                  </button>
                  <Suspense>
                    <Grade single={song.single} double={song.double} />
                  </Suspense>
                </SongCard.Title>
                <SongCard.SubTitle>
                  <ul className="flex flex-wrap gap-x-2 pr-10">
                    {song.artist.map((artist) => (
                      <li
                        key={artist}
                        className="after:pl-2 after:content-['-'] last:after:content-['']"
                      >
                        <button
                          type="button"
                          className="cursor-pointer text-left pressed:text-purple-600 transition-colors hover:text-purple-500 active:text-purple-600"
                          onClick={() => handleSelectArtist(artist)}
                        >
                          {artist}
                        </button>
                      </li>
                    ))}
                  </ul>
                </SongCard.SubTitle>
                <Difficulty className="mt-auto pt-4" difficulty={song.single}>
                  Single
                </Difficulty>
                <Difficulty difficulty={song.double}>Double</Difficulty>
                <a
                  href={`/collection?id=${song.collectionId}`}
                  className="cursor-pointer py-2 text-purple-400 text-xl underline transition-colors hover:text-purple-600"
                >
                  {song.collection}
                </a>
                <div className="flex items-center gap-2">
                  <Suspense fallback={<BpmFallback />}>
                    <Bpm />
                  </Suspense>
                  <Suspense
                    fallback={
                      <QualityFallback musicProps={{ className: "ml-auto" }} />
                    }
                  >
                    <Quality musicProps={{ className: "ml-auto" }} />
                  </Suspense>
                </div>
                <a
                  href={`https://zenius-i-vanisher.com//v5.2/viewsimfile.php?simfileid=${song.id}`}
                  target="_blank"
                  className="mt-2 cursor-pointer text-right pressed:text-purple-600 text-gray-400 text-lg transition-colors hover:text-purple-500 active:text-purple-600"
                >
                  View Original
                </a>
              </SongCard>
            </SongDetailsProvider>
          ))}
        </div>
      )}
      <Dialog isOpen={!!preview} onClose={() => setPreview(null)}>
        <div className="aspect-video p-4">
          {preview ? (
            <iframe
              src={preview}
              title="song preview"
              className="h-full w-full rounded-lg md:w-7xl"
            />
          ) : null}
        </div>
      </Dialog>
    </div>
  );
}

export default IndexPage;
