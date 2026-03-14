import type { ComponentProps, PropsWithChildren } from "react";

function SongCardTitle({
  children,
  ...rest
}: PropsWithChildren<ComponentProps<"h2">>) {
  return (
    <h2
      {...rest}
      className="relative mb-2 flex gap-4 font-bold text-2xl text-white"
    >
      {children}
    </h2>
  );
}

function SongCardSubTitle({
  children,
  ...rest
}: PropsWithChildren<ComponentProps<"p">>) {
  return (
    <p {...rest} className="font-medium text-slate-400">
      {children}
    </p>
  );
}

function SongCard({
  children,
  ...rest
}: PropsWithChildren<ComponentProps<"div">>) {
  return (
    <div
      {...rest}
      className="flex w-full flex-col rounded-lg border border-slate-700 bg-slate-800 p-6 text-left transition-colors duration-300 hover:border-purple-600"
    >
      {children}
    </div>
  );
}

SongCard.Title = SongCardTitle;
SongCard.SubTitle = SongCardSubTitle;

export default SongCard;
