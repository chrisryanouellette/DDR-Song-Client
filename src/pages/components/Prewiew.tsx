import { RiEyeLine, RiEyeOffLine } from "@remixicon/react";
import { useSongDetailsContext } from "../hooks/song";

export function PreviewFallback() {
  return (
    <RiEyeLine className="mt-1 ml-auto size-8 shrink-0 animate-pulse text-gray-700" />
  );
}

type PreviewProps = {
  onClickPreview: (preview: string) => void;
};

export function Preview({ onClickPreview }: PreviewProps) {
  const { preview } = useSongDetailsContext();
  return preview ? (
    <button
      type="button"
      className="mt-1 ml-auto h-max cursor-pointer"
      onClick={() => onClickPreview(preview)}
    >
      <RiEyeLine className="size-8 shrink-0 pressed:fill-purple-500 transition-colors hover:fill-purple-500" />
    </button>
  ) : (
    <RiEyeOffLine className="mt-1 ml-auto size-8 shrink-0 text-gray-700" />
  );
}
