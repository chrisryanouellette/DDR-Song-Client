import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import Dialog from "../../../components/Dialog";
import { useDrawer } from "../../../context/Dialog/hooks";
import { cn } from "../../../utils";
import { useCollectionsContext } from "../hooks/collections";

const newFolderSchema = z.object({
  name: z.string().min(1, "Folder name is required."),
});

type NewFolderSchema = z.infer<typeof newFolderSchema>;

export default function NewFolderDialog() {
  const { refresh } = useCollectionsContext();
  const { openDrawerId, closeDrawer } = useDrawer();
  const isOpen = openDrawerId === "new-folder";

  const form = useForm<NewFolderSchema>({
    resolver: zodResolver(newFolderSchema),
    defaultValues: { name: "" },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    // Don't wire up any of the server events.
    try {
      const url = new URL(`${window.location.origin}/api/collection/create`);
      url.searchParams.append("collection", data.name);
      const result = await fetch(url);
      if (!result.ok) {
        throw new Error(result.statusText);
      }
      closeDrawer();
      form.reset();
      refresh();
    } catch (error) {
      throw new Error("Something went wrong when creating the folder.", {
        cause: error,
      });
    }
  });

  return (
    <Dialog isOpen={isOpen} onClose={closeDrawer}>
      <form
        className="flex min-h-64 min-w-3xl flex-col rounded-md bg-white p-4 shadow-md"
        onSubmit={onSubmit}
      >
        <label
          htmlFor="new-folder-name"
          className="mb-2 text-2xl text-gray-700"
        >
          Create a <span className="font-semibold">New Folder</span>
        </label>
        <input
          {...form.register("name")}
          type="text"
          id="new-folder-name"
          placeholder="Folder Name"
          className={cn(
            "rounded-md border border-gray-300 p-2 text-xl transition-opacity focus:outline-none focus:ring-2 focus:ring-purple-400",
            form.formState.errors.name && "border-red-500",
          )}
        />
        {form.formState.errors.name && (
          <p className="mt-1 text-lg text-red-600">
            {form.formState.errors.name.message}
          </p>
        )}
        <div className="mt-auto flex gap-4">
          <button
            type="submit"
            className="mt-4 flex-1 cursor-pointer rounded-md bg-purple-500 py-2 font-semibold text-white hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            Create
          </button>
          <button
            type="button"
            className="mt-4 cursor-pointer rounded-md bg-purple-800 px-4 py-2 font-semibold text-lg text-white hover:bg-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
            onClick={closeDrawer}
          >
            Cancel
          </button>
        </div>
      </form>
    </Dialog>
  );
}
