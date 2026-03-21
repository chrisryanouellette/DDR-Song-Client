import { ErrorMessage } from "@hookform/error-message";
import { zodResolver } from "@hookform/resolvers/zod";
import { startTransition, useActionState } from "react";
import { useForm, useWatch } from "react-hook-form";
import type z from "zod";
import { songDownloadSchema } from "../../schema";
import type { Throwable } from "../../types";
import { cn } from "../../utils";
import { useFoldersContext } from "../hooks/folders";

export function DownloadFallback() {
  return (
    <div className="flex min-h-48 min-w-3xl flex-col items-center justify-center rounded-md bg-white p-4 shadow-md">
      <p>Loading Folders</p>
    </div>
  );
}

async function actionDownloadSong(
  prev: Throwable<boolean>,
  data: z.infer<typeof songDownloadSchema>,
): Promise<Throwable<boolean>> {
  const url = new URL(`${window.location.origin}/api/song/download`);
  url.searchParams.append("id", data.id);
  url.searchParams.append("name", data.name);
  url.searchParams.append("folder", data.folder);
  url.searchParams.append("new", data.new);
  try {
    const result = await fetch(url);
    if (!result.ok) {
      const text = await result.text();
      return { isError: true, error: new Error(text) };
    }
    return { isError: false, value: true };
  } catch (error) {
    return {
      isError: true,
      error: new Error("Download song action failed", { cause: error }),
    };
  }
}

type DownloadProps = {
  id: string;
  name: string;
  close: () => void;
};

export function Download({ id, name, close }: DownloadProps) {
  const { collections, refresh } = useFoldersContext();
  const form = useForm({
    resolver: zodResolver(songDownloadSchema),
    defaultValues: { id, name },
  });
  const [state, action, isPending] = useActionState(actionDownloadSong, {
    isError: false,
    value: false,
  });
  const selectedFolder = useWatch({ control: form.control, name: "folder" });
  const selectedNew = useWatch({ control: form.control, name: "new" });

  if (!state.isError && state.value) {
    return (
      <div className="flex min-h-48 min-w-3xl flex-col items-center justify-center rounded-md bg-white p-4 shadow-md">
        <p>Song "{name}" Download Started</p>
        <p className="mt-4 text-xl">Check the Downloads Drawer for progress.</p>
        <button
          type="button"
          className="mt-4 cursor-pointer rounded-md bg-purple-500 px-4 py-2 font-semibold text-lg text-white hover:bg-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:cursor-not-allowed disabled:bg-gray-400"
          onClick={close}
        >
          Close Window
        </button>
      </div>
    );
  }

  return (
    <form
      className="flex min-w-3xl flex-col rounded-md bg-white p-4 shadow-md"
      onSubmit={form.handleSubmit((result) =>
        startTransition(() => action(result)),
      )}
    >
      <label
        htmlFor="folder-selection"
        className={cn(
          "mb-2 pr-22 text-2xl text-gray-700 transition-opacity",
          selectedNew && "opacity-50",
        )}
      >
        Download <span className="font-semibold">"{name}"</span> to Folder
      </label>
      <select
        {...form.register("folder")}
        name="folder"
        id="folder-selection"
        className={cn(
          "rounded-md border border-gray-300 p-2 transition-opacity focus:outline-none focus:ring-2 focus:ring-purple-400",
          selectedNew && "opacity-50",
        )}
        onClick={() => form.setValue("new", "")}
      >
        <option value="">Select an Option</option>
        {collections.map((folder) => (
          <option key={folder.name} className="text-gray-700">
            {folder.name}
          </option>
        ))}
      </select>
      <ErrorMessage
        errors={form.formState.errors}
        name="folder"
        render={({ message }) => (
          <p className="mt-1 text-lg text-red-600">{message}</p>
        )}
      />
      <p className="relative my-4 text-center text-slate-600 text-xl before:absolute before:top-1/2 before:z-0 before:block before:h-px before:w-full before:bg-slate-600 before:content-['']">
        <span className="relative bg-white px-4">OR</span>
      </p>
      <label
        htmlFor="create-new-folder"
        className={cn(
          "mb-2 pr-12 text-2xl text-gray-700 transition-opacity",
          !!selectedFolder && "opacity-50",
        )}
      >
        Create a New Folder
      </label>
      <input
        {...form.register("new")}
        type="text"
        id="create-new-folder"
        className={cn(
          "flex-1 rounded-md border border-gray-300 p-2 transition-opacity focus:outline-none focus:ring-2 focus:ring-purple-400",
          !!selectedFolder && "opacity-50",
        )}
        onClick={() => form.setValue("folder", "")}
      />
      <p className="mt-4 text-xl">
        You will be able to edit the rest of the song's details when the
        download completes.
      </p>
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isPending}
          className="mt-4 flex-1 cursor-pointer rounded-md bg-purple-500 py-2 font-semibold text-white hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          Download
        </button>
        <button
          type="button"
          disabled={isPending}
          className="mt-4 cursor-pointer rounded-md bg-purple-800 px-4 py-2 font-semibold text-lg text-white hover:bg-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:cursor-not-allowed disabled:bg-gray-400"
          onClick={refresh}
        >
          Reload Folders
        </button>
      </div>
      {state.isError ? (
        <p className="mt-4 text-red-500 text-xl">
          Something went wrong downloading the song.
          <code className="block max-w-xl">{state.error.message}</code>
        </p>
      ) : null}
    </form>
  );
}
