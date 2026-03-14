import { RiCloseCircleFill } from "@remixicon/react";
import type { PropsWithChildren } from "react";
import { cn } from "../../utils";

type DialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

function Dialog({ isOpen, onClose, children }: PropsWithChildren<DialogProps>) {
  return (
    <dialog
      open={isOpen}
      onClose={onClose}
      className={cn(
        "top-0 left-0 flex h-full w-full items-center justify-center bg-black/50 backdrop-blur-sm",
        isOpen ? "fixed" : "hidden",
      )}
    >
      <div className="relative flex w-max justify-center rounded-3xl bg-linear-to-br from-purple-600 to-blue-500 p-6 shadow-xl sm:rounded-lg">
        {children}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-1 right-1 rounded-full text-white transition-colors hover:text-purple-200 sm:top-0 sm:right-0 sm:translate-x-1/2 sm:-translate-y-1/2 sm:bg-slate-900"
        >
          <RiCloseCircleFill className="size-8 sm:size-12" />
        </button>
      </div>
    </dialog>
  );
}

export default Dialog;
