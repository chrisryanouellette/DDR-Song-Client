import { RiCloseLargeLine } from "@remixicon/react";
import type { ComponentProps, PropsWithChildren } from "react";
import { useDrawer } from "../../context/Dialog/hooks";
import { cn } from "../../utils";

type DrawerProps = {
  id: string;
};

function Drawer({ id, children }: PropsWithChildren<DrawerProps>) {
  const { openDrawerId, closeDrawer } = useDrawer();
  const isOpen = openDrawerId === id;
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex overflow-hidden transition-[visibility] duration-300",
        isOpen ? "visible" : "invisible delay-300",
      )}
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-in-out",
          isOpen ? "opacity-100" : "opacity-0",
        )}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={cn(
          "fixed top-0 right-0 flex h-full w-full max-w-lg flex-col border-slate-700 border-l bg-linear-to-br bg-slate-900 from-purple-600 to-blue-500 text-black shadow-2xl transition-transform duration-300 ease-in-out sm:min-w-lg",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="m-6 flex h-full flex-col rounded-lg bg-white">
          {children}
        </div>
      </aside>
    </div>
  );
}

function DrawerHeader({
  title,
  children,
  className,
  ...rest
}: PropsWithChildren<ComponentProps<"div"> & { title?: string }>) {
  const { closeDrawer } = useDrawer();
  return (
    <div
      className={cn(
        "flex items-center justify-between border-slate-800 border-b p-6",
        className,
      )}
      {...rest}
    >
      {title ? <h2 className="font-bold text-3xl">{title}</h2> : children}
      <button
        type="button"
        onClick={closeDrawer}
        className="rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-800 hover:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
        aria-label="Close drawer"
      >
        <RiCloseLargeLine className="size-8" />
      </button>
    </div>
  );
}

function DrawerFooter({
  children,
  className,
  ...rest
}: PropsWithChildren<ComponentProps<"div">>) {
  return (
    <div
      className={cn("mt-auto border-slate-800 border-t p-6", className)}
      {...rest}
    >
      {children}
    </div>
  );
}

Drawer.Header = DrawerHeader;
Drawer.Footer = DrawerFooter;

export default Drawer;
