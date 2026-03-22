import { RiCheckLine, RiDownload2Line } from "@remixicon/react";
import type { ComponentProps } from "react";
import { Link } from "react-router-dom";
import { useSongDetailsContext } from "../hooks/song";

export function DownloadButtonFallback() {
  return (
    <RiDownload2Line className="mt-1 size-8 shrink-0 animate-pulse text-gray-700" />
  );
}

export function DownloadButton(props: ComponentProps<"button">) {
  const { collection, song } = useSongDetailsContext();
  return collection && song ? (
    <Link
      to={`/organize?collection=${collection}&song=${song}`}
      className="mt-1 h-min shrink-0 cursor-pointer"
    >
      <RiCheckLine className="size-8 pressed:fill-purple-500 transition-colors hover:fill-purple-500" />
    </Link>
  ) : (
    <button
      type="button"
      className="mt-1 h-min shrink-0 cursor-pointer"
      {...props}
    >
      <RiDownload2Line className="size-8 pressed:fill-purple-500 transition-colors hover:fill-purple-500" />
    </button>
  );
}
