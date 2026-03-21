import { useState } from "react";
import Dialog from "../Dialog";

export function FullscreenDialog() {
  const [isOpen, setIsOpen] = useState(!document.fullscreenElement);

  return (
    <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
      <div className="flex min-w-3xl flex-col rounded-md bg-white p-4 text-center shadow-md">
        <p className="font-semibold">The App Works Best in Fullscreen Mode</p>
        <p className="mt-2 text-xl">
          You can press "Escape" to close fullscreen mode.
        </p>
        <button
          type="button"
          className="mt-8 flex-1 cursor-pointer rounded-md bg-purple-500 py-2 font-semibold text-white hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:cursor-not-allowed disabled:bg-gray-400"
          onClick={() =>
            document.body.requestFullscreen().then(() => setIsOpen(false))
          }
        >
          Enter Fullscreen Mode
        </button>
      </div>
    </Dialog>
  );
}
