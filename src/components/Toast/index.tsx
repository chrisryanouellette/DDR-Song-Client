import {
  RiCheckboxCircleLine,
  RiCloseLine,
  RiErrorWarningLine,
  RiInformationLine,
} from "@remixicon/react";
import { useEffect, useState } from "react";
import { cn } from "../../utils";

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

export const TOAST_EVENT = "app-toast";

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleToast = (event: Event) => {
      const customEvent = event as CustomEvent<ToastMessage>;
      const newToast = customEvent.detail;

      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 5000);
    };

    window.addEventListener(TOAST_EVENT, handleToast);
    return () => window.removeEventListener(TOAST_EVENT, handleToast);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed top-6 right-6 z-100 flex flex-col gap-3">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "flex min-w-80 animate-in items-center gap-3 overflow-hidden rounded-xl border border-slate-700 bg-slate-900/90 p-4 text-white shadow-2xl backdrop-blur-md transition-all duration-300",
          )}
        >
          <div
            className={cn(
              "flex size-10 items-center justify-center rounded-lg",
              t.type === "success" && "bg-green-500/20 text-green-400",
              t.type === "error" && "bg-red-500/20 text-red-400",
              t.type === "info" && "bg-purple-500/20 text-purple-400",
            )}
          >
            {t.type === "success" && (
              <RiCheckboxCircleLine className="size-6" />
            )}
            {t.type === "error" && <RiErrorWarningLine className="size-6" />}
            {t.type === "info" && <RiInformationLine className="size-6" />}
          </div>
          <div className="flex-1">
            <p className="font-medium text-lg">{t.message}</p>
          </div>
          <button
            type="button"
            onClick={() => removeToast(t.id)}
            className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <RiCloseLine className="size-5" />
          </button>
          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 h-1 w-full bg-slate-800">
            <div
              className={cn(
                "h-full animate-toast-progress bg-linear-to-r",
                t.type === "success" && "from-green-500 to-emerald-400",
                t.type === "error" && "from-red-500 to-orange-400",
                t.type === "info" && "from-purple-600 to-blue-500",
              )}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
