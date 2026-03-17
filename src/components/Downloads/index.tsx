import { RiCheckboxCircleLine, RiDownload2Line } from "@remixicon/react";
import { useDrawer } from "../../context/Dialog/hooks";
import { useSongDownloadsContext } from "../../context/Downloads/hook";
import Drawer from "../Drawer";

export default function SongDownloadsDrawer() {
  const { closeDrawer } = useDrawer();
  const downloads = useSongDownloadsContext();

  const activeDownloads = Object.entries(downloads).filter(
    ([, value]) => !("completed" in value),
  );
  const completedDownloads = Object.entries(downloads).filter(
    ([, value]) => "completed" in value,
  );

  return (
    <Drawer id="song-downloads">
      <Drawer.Header title="Song Downloads" />

      <div className="flex-1 overflow-y-auto p-6">
        {!!activeDownloads.length && (
          <section className="mb-8">
            <h3 className="mb-4 font-bold text-slate-500 text-sm uppercase tracking-wider">
              Active Downloads
            </h3>
            <div className="space-y-4">
              {activeDownloads.map(([id, status]) => (
                <div
                  key={id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3"
                >
                  <span className="truncate font-medium text-slate-700">
                    {status.name}
                  </span>
                  <div className="flex items-center gap-2 text-nowrap text-purple-600">
                    <RiDownload2Line className="size-4 animate-bounce" />
                    <span className="font-mono text-sm">
                      {"progress" in status
                        ? (status.progress / 10).toFixed(1)
                        : 0}{" "}
                      mb
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {!!completedDownloads.length && (
          <section>
            <h3 className="mb-4 font-bold text-slate-500 text-sm uppercase tracking-wider">
              Completed
            </h3>
            <div className="space-y-3">
              {completedDownloads.map(([id, { name }]) => (
                <a
                  key={id}
                  href={`/song/${id}`}
                  className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3 text-slate-600 transition-colors hover:bg-purple-200 hover:text-slate-800"
                >
                  <span className="truncate font-medium">{name}</span>
                  <RiCheckboxCircleLine className="size-5 text-green-500" />
                </a>
              ))}
            </div>
          </section>
        )}

        {!Object.keys(downloads).length && (
          <div className="flex h-full flex-col items-center justify-center text-slate-400">
            <RiDownload2Line className="mb-2 size-12 opacity-50" />
            <p>No active downloads</p>
          </div>
        )}
      </div>

      <Drawer.Footer>
        <button
          type="button"
          className="w-full flex-1 cursor-pointer rounded-md bg-purple-500 py-2 font-semibold text-white hover:bg-purple-600 focus:outline-hidden focus:ring-2 focus:ring-purple-400 disabled:cursor-not-allowed disabled:bg-gray-400"
          onClick={closeDrawer}
        >
          Close
        </button>
      </Drawer.Footer>
    </Drawer>
  );
}
