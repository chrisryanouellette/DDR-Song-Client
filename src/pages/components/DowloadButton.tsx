import { RiCheckLine, RiDownload2Line } from "@remixicon/react";
import type { ComponentProps } from "react";
import { useSongDetailsContext } from "../hooks/song";

export function DownloadButtonFallback() {
  return (
    <RiDownload2Line className="mt-1 size-8 shrink-0 animate-pulse text-gray-700" />
  );
}

export function DownloadButton(props: ComponentProps<"button">) {
  const { downloaded } = useSongDetailsContext();
  return downloaded ? (
    <RiCheckLine className="mt-1 size-8 shrink-0" />
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
