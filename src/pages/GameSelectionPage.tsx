import { RiLoader2Fill } from "@remixicon/react";

function GameSelectionPage() {
  return (
    <div>
      <h1 className="font-bold text-4xl">Select a Game</h1>
      <p className="mt-4">
        Choose a DDR game to explore its songs and features.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          console.log("Dropdown form submitted");
        }}
        className="flex flex-wrap items-center gap-y-4 rounded-lg p-4 shadow-lg shadow-slate-400/25"
      >
        <div className="flex flex-1 basis-full flex-col gap-y-2 sm:basis-auto">
          <label
            htmlFor="song-select"
            className="font-medium text-slate-400 text-sm"
          >
            Select a Game / User Pack
          </label>
          <select
            id="song-select"
            className="w-full rounded-r-lg rounded-l-lg border border-slate-500 bg-slate-800 px-4 py-3 font-mono text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-800 sm:rounded-r-none"
          >
            <option value="">-- Choose a Option --</option>
            <option value="butterfly">Butterfly</option>
            <option value="paranoia">PARANOiA</option>
            <option value="max300">MAX 300</option>
          </select>
        </div>
        <div className="flex flex-1 basis-full flex-col gap-y-2 sm:basis-auto">
          <label
            htmlFor="song-select"
            className="font-medium text-slate-400 text-sm"
          >
            Game / User Pack Options
          </label>
          <select
            disabled
            id="song-select"
            className="w-full rounded-r-lg rounded-l-lg border border-slate-500 bg-slate-800 px-4 py-3 font-mono text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:text-slate-500 sm:rounded-l-none"
          >
            <option value="">-- Choose a song --</option>
            <option value="butterfly">Butterfly</option>
            <option value="paranoia">PARANOiA</option>
            <option value="max300">MAX 300</option>
          </select>
        </div>
        <button
          type="submit"
          className="relative col-span-2 flex min-w-32 basis-full items-center justify-center self-end rounded-lg bg-purple-600 px-4 py-3.5 font-mono text-sm text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-800 md:ml-4 md:basis-auto"
          //   disabled={isPending}
        >
          Search
          {false ? (
            <RiLoader2Fill className="absolute size-5 animate-spin" />
          ) : null}
        </button>
      </form>
    </div>
  );
}

export default GameSelectionPage;
