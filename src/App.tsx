import { zodResolver } from "@hookform/resolvers/zod";
import { RiLoader2Fill } from "@remixicon/react";
import { startTransition, useActionState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { searchSchema } from "./schema";
import type { SearchSong } from "./types";

type SearchInputs = z.infer<typeof searchSchema>;

async function searchAction(prev: SearchSong[] | null, data: SearchInputs) {
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

function App() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SearchInputs>({
    resolver: zodResolver(searchSchema),
  });

  const [search, action, isPending] = useActionState(searchAction, null);

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-12 font-bold text-5xl text-white">
          DDR Song Collection
        </h1>
        <form
          onSubmit={handleSubmit(
            (result) => startTransition(() => action(result)),
            console.error,
          )}
        >
          <div className="flex flex-wrap items-center gap-y-4">
            <div className="flex flex-1 flex-col gap-y-2">
              <label
                htmlFor="song-title"
                className="font-medium text-slate-400 text-sm"
              >
                Song Title
              </label>
              <input
                id="song-title"
                {...register("songtitle")}
                type="text"
                placeholder="Search by song title..."
                className="col-start-1 flex-1 rounded-r-lg rounded-l-lg border border-slate-500 bg-transparent px-4 py-3 font-mono text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-800 sm:rounded-r-none"
              />
            </div>
            <div className="flex flex-1 flex-col gap-y-2">
              <label
                htmlFor="artist-name"
                className="font-medium text-slate-400 text-sm"
              >
                Artist Name
              </label>
              <input
                id="artist-name"
                {...register("songartist")}
                type="text"
                placeholder="Search by artist name..."
                className="flex-1 rounded-r-lg rounded-l-lg border border-slate-500 bg-transparent px-4 py-3 font-mono text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-800 sm:rounded-l-none"
              />
            </div>
            <button
              type="submit"
              className="relative col-span-2 flex min-w-32 basis-full items-center justify-center self-end rounded-lg bg-purple-600 px-4 py-3.5 font-mono text-sm text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-800 md:ml-4 md:basis-auto"
              disabled={isPending}
            >
              {isPending ? (
                <RiLoader2Fill className="size-5 animate-spin" />
              ) : (
                "Search"
              )}
            </button>
          </div>
          {errors.songtitle || errors.songartist ? (
            <p className="mt-2 text-red-500 text-sm">
              {errors.songtitle?.message || errors.songartist?.message}
            </p>
          ) : null}
        </form>
        {!search?.length ? (
          <img
            src="no-song.png"
            alt="no songs found in search"
            className="mx-auto mt-12"
          />
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {search.map((song) => (
              <button
                key={song.title}
                className="w-full cursor-pointer rounded-lg border border-slate-700 bg-slate-800 p-6 text-left transition-colors duration-300 hover:border-purple-600"
                // onClick={() => openModal(song)}
                type="button"
              >
                <h2 className="mb-2 font-bold text-2xl text-white">
                  {song.title}
                </h2>
                <p className="mb-4 font-medium text-slate-400">
                  {song.artist.join(", ")}
                </p>
                <div className="flex gap-4">
                  <h3 className="mb-2 font-medium text-slate-300">Single:</h3>
                  <div className="flex">
                    {song.single.map((difficulty, index) => (
                      <p
                        key={difficulty}
                        className={`font-medium after:px-0.5 after:pl-1 after:text-slate-400 after:content-['-'] last:after:content-[''] ${
                          index < song.single.length / 3
                            ? "text-green-400"
                            : index < (2 * song.single.length) / 3
                              ? "text-yellow-400"
                              : "text-red-400"
                        }`}
                      >
                        {difficulty === "-" ? "X" : difficulty}
                      </p>
                    ))}
                  </div>
                </div>
                <div className="flex gap-4">
                  <h3 className="mb-2 font-medium text-slate-300">Double:</h3>
                  <div className="flex">
                    {song.double.map((difficulty, index) => (
                      <p
                        key={difficulty}
                        className={`fter:pl-1 font-medium after:px-0.5 after:text-slate-400 after:content-['-'] last:after:content-[''] ${
                          index < song.single.length / 3
                            ? "text-green-400"
                            : index < (2 * song.single.length) / 3
                              ? "text-yellow-400"
                              : "text-red-400"
                        }`}
                      >
                        {difficulty === "-" ? "X" : difficulty}
                      </p>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
        {/* <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredSongs.map((song) => (
            
          ))}
        </div>
      </div> */}

        {/* {isModalOpen && selectedSong && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-purple-600/50 bg-slate-800 p-8 shadow-xl">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="mb-2 font-bold text-3xl text-white">
                  {selectedSong.title}
                </h2>
                <p className="text-slate-400">by {selectedSong.artist}</p>
              </div>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-purple-400"
                type="button"
                aria-label="Close modal"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <h3 className="mb-2 font-semibold text-slate-300">Details</h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-slate-400">Collection:</span>{" "}
                    <span className="text-white">
                      {selectedSong.collection}
                    </span>
                  </p>
                  <p>
                    <span className="text-slate-400">BPM:</span>{" "}
                    <span className="font-mono text-white">
                      {selectedSong.bpm}
                    </span>
                  </p>
                </div>
              </div>
              <div>
                <h3 className="mb-2 font-semibold text-slate-300">
                  Difficulties
                </h3>
                <div className="space-y-1">
                  {selectedSong.difficulties.map((diff) => (
                    <div
                      key={diff.level}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-slate-400">{diff.level}:</span>
                      <span className="font-mono text-purple-300">
                        {diff.rating}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-slate-300">Description</h3>
              <p className="text-slate-200 leading-relaxed">
                {selectedSong.description}
              </p>
            </div>
          </div>
        </div>
      )} */}
      </div>
    </div>
  );
}

export default App;
