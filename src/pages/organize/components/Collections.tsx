import { RiDeleteBin7Line, RiFoldersLine } from "@remixicon/react";
import { type DragEvent, Suspense, use, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useDrawer } from "../../../context/Dialog/hooks";
import type { EditSongSchema } from "../../../schema";
import { cn } from "../../../utils";
import { useCollectionsContext } from "../hooks/collections";
import { useSongsContext } from "../hooks/songs";

function OrganizeCollectionsContentFallback() {
  return (
    <div className="my-auto flex flex-1 flex-col items-center justify-center space-y-4 text-slate-500 italic">
      <div className="rounded-full bg-slate-800/40 p-8 text-slate-400 opacity-50">
        <RiFoldersLine className="size-32 animate-pulse" />
      </div>
      <p className="text-xl">Loading folders...</p>
    </div>
  );
}

type OrganizeCollectionsContentProps = {
  promise: Promise<{ collections: { name: string }[] }>;
};

function OrganizeCollectionsContent({
  promise,
}: OrganizeCollectionsContentProps) {
  const { collections } = use(promise);
  const form = useFormContext<EditSongSchema>();
  const { refresh } = useSongsContext();
  const [dragOverCollectionId, setDragOverCollectionId] = useState<
    null | string
  >(null);

  const selectedCollectionId = useWatch<EditSongSchema>({
    name: "collection",
  });

  const handleDragOver = (e: DragEvent, collectionId: string) => {
    e.preventDefault();
    setDragOverCollectionId(collectionId);
  };

  const handleDragLeave = () => {
    setDragOverCollectionId(null);
  };

  const handleDrop = async (e: React.DragEvent, collectionId: string) => {
    e.preventDefault();
    setDragOverCollectionId(null);
    const activeCollection = form.getValues("collection");
    const songId = e.dataTransfer.getData("songId");
    if (!songId) throw new Error("Boom");
    if (activeCollection === collectionId) throw new Error("Can't move");
    try {
      const url = new URL(`${window.location.origin}/api/song/move`);
      url.searchParams.append("collection", activeCollection);
      url.searchParams.append("dest", collectionId);
      url.searchParams.append("song", songId);
      const result = await fetch(url);
      if (!result.ok) throw new Error(result.statusText);
      refresh(activeCollection);
    } catch (error) {
      throw new Error("Something went wrong when moving song", {
        cause: error,
      });
    }
  };

  return collections.map(({ name }) => (
    <button
      key={name}
      type="button"
      onClick={() => {
        form.setValue("collection", name);
        form.setValue("song", "");
        refresh(name);
      }}
      onDragOver={(e) => handleDragOver(e, name)}
      onDragLeave={handleDragLeave}
      onDrop={(e) => handleDrop(e, name)}
      className={cn(
        "relative w-full rounded-lg px-4 py-4 text-left font-mono text-xl transition-all",
        selectedCollectionId === name
          ? "scale-[1.02] bg-purple-600 text-white shadow-lg shadow-purple-500/30"
          : "bg-slate-800/40 text-slate-400 hover:bg-slate-800 hover:text-slate-200",
        dragOverCollectionId === name &&
          "z-10 scale-[1.05] bg-slate-700 text-white ring-2 ring-purple-400",
      )}
    >
      {name}
      {/* {dragOverCollectionId === collection.id && (
              <div className="pointer-events-none absolute inset-0 animate-pulse rounded-lg bg-purple-500/25" />
            )} */}
    </button>
  ));
}

export default function OrganizeCollections() {
  const { prom } = useCollectionsContext();
  const { openDrawer } = useDrawer();

  return (
    <div className="flex w-1/4 flex-col rounded-xl border border-slate-700 bg-slate-800/20 p-4 shadow-2xl backdrop-blur-sm">
      <h2 className="mb-4 flex items-center font-bold text-2xl text-slate-100 uppercase">
        Collections
        <button type="button" className="mr-2 ml-auto hover:text-purple-300">
          <RiDeleteBin7Line />
        </button>
      </h2>
      <div className="flex flex-1 flex-col space-y-2 pr-2">
        <Suspense fallback={<OrganizeCollectionsContentFallback />}>
          <OrganizeCollectionsContent promise={prom} />
        </Suspense>
      </div>
      <button
        type="button"
        className="mb-4 w-full cursor-pointer rounded-lg bg-purple-600 px-8 py-5 font-bold font-mono text-2xl text-white shadow-lg transition-all hover:bg-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
        onClick={() => openDrawer("new-folder")}
      >
        New Folder
      </button>
    </div>
  );
}
