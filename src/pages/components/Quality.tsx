import { RiImage2Line, RiMusic2Line, RiVideoLine } from "@remixicon/react";
import type { ComponentProps } from "react";
import { cn } from "../../utils";
import { useSongDetailsContext } from "../hooks/song";

type QualityProps = {
  musicProps?: ComponentProps<typeof RiMusic2Line>;
  bannerProps?: ComponentProps<typeof RiImage2Line>;
  backgroundProps?: ComponentProps<typeof RiVideoLine>;
};

export function QualityFallback({
  musicProps,
  backgroundProps,
  bannerProps,
}: QualityProps) {
  return (
    <>
      <RiMusic2Line
        {...musicProps}
        className={cn("animate-pulse text-gray-700", musicProps?.className)}
      />
      <RiImage2Line
        {...backgroundProps}
        className={cn(
          "animate-pulse text-gray-700",
          backgroundProps?.className,
        )}
      />
      <RiVideoLine
        {...bannerProps}
        className={cn("animate-pulse text-gray-700", bannerProps?.className)}
      />
    </>
  );
}

export function Quality({
  musicProps,
  backgroundProps,
  bannerProps,
}: QualityProps) {
  const { quality } = useSongDetailsContext();
  return (
    <>
      <RiMusic2Line
        {...musicProps}
        className={cn(
          quality.audio === 2
            ? "text-green-400"
            : quality.audio === 1
              ? "text-yellow-500"
              : quality.audio === 0
                ? "text-red-500"
                : "text-gray-700",
          musicProps?.className,
        )}
      />
      <RiImage2Line
        {...bannerProps}
        className={cn(
          quality.banner === 2
            ? "text-green-400"
            : quality.banner === 1
              ? "text-yellow-500"
              : quality.banner === 0
                ? "text-red-500"
                : quality.banner === "custom"
                  ? "text-pink-400"
                  : "text-gray-700",
          bannerProps?.className,
        )}
      />
      <RiVideoLine
        {...backgroundProps}
        className={cn(
          quality.background === 2
            ? "text-green-400"
            : quality.background === 1
              ? "text-yellow-500"
              : quality.background === 0
                ? "text-red-500"
                : quality.background === "custom"
                  ? "text-pink-400"
                  : "text-gray-700",
          backgroundProps?.className,
        )}
      />
    </>
  );
}
