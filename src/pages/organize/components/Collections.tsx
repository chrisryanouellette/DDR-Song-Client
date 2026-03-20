import { RiFoldersLine } from "@remixicon/react";
import { Suspense, use, useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { cn } from "../../../utils";

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
  promise: Promise<{ folders: { name: string }[] }>;
};

function OrganizeCollectionsContent({
  promise,
}: OrganizeCollectionsContentProps) {
  const { folders } = use(promise);
  const form = useFormContext();

  const selectedCollectionId = useWatch({
    name: "collection",
  });

  const handleDragOver = (e: React.DragEvent, collectionId: string) => {
    e.preventDefault();
    setDragOverCollectionId(collectionId);
  };

  return folders.map(({ name }) => (
    <button
      key={name}
      type="button"
      onClick={() => {
        form.setValue("collection", name);
        form.setValue("song", "");
      }}
      onDragOver={(e) => handleDragOver(e, name)}
      // onDragLeave={handleDragLeave}
      // onDrop={(e) => handleDrop(e, collection.id)}
      className={cn(
        "relative w-full rounded-lg px-4 py-4 text-left font-mono text-xl transition-all",
        selectedCollectionId === name
          ? "scale-[1.02] bg-purple-600 text-white shadow-lg shadow-purple-500/30"
          : "bg-slate-800/40 text-slate-400 hover:bg-slate-800 hover:text-slate-200",
        //   dragOverCollectionId === collection.id &&
        //     "z-10 scale-[1.05] bg-slate-700 text-white ring-2 ring-purple-400",
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
  const promise = useMemo(
    () => fetch("/api/folders/list").then((res) => res.json()),
    [],
  );

  return (
    <div className="flex w-1/4 flex-col rounded-xl border border-slate-700 bg-slate-800/20 p-4 shadow-2xl backdrop-blur-sm">
      <h2 className="mb-4 font-bold text-2xl text-slate-100 uppercase tracking-wide">
        Collections
      </h2>
      <div className="flex flex-1 flex-col space-y-2 pr-2">
        <Suspense fallback={<OrganizeCollectionsContentFallback />}>
          <OrganizeCollectionsContent promise={promise} />
        </Suspense>
      </div>
      <button
        type="button"
        className="w-full cursor-pointer rounded-lg bg-purple-600 px-8 py-5 font-bold font-mono text-2xl text-white shadow-lg transition-all hover:bg-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        New Folder
      </button>
    </div>
  );
}
