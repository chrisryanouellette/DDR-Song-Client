import { RiDownload2Line, RiLoader5Line } from "@remixicon/react";
import { NavLink } from "react-router-dom";
import { useDrawer } from "../context/Dialog/hooks";
import { useSongDownloadsContext } from "../context/Downloads/hook";
import { cn } from "../utils";

function Header() {
  const { openDrawer } = useDrawer();
  const downloads = useSongDownloadsContext();
  const isDownloading = !!Object.values(downloads).filter(
    (data) => "progress" in data,
  ).length;

  return (
    <header className="mb-4 flex flex-wrap items-center justify-between gap-y-2 px-16 sm:mb-8">
      <h1 className="font-bold text-6xl">DDR Song Collection</h1>
      <nav className="flex items-center justify-between">
        <ul className="flex space-x-8">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) =>
                cn(
                  "text-2xl",
                  isActive
                    ? "font-bold text-purple-400"
                    : "hover:text-purple-400",
                )
              }
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/organize"
              className={({ isActive }) =>
                cn(
                  "text-2xl",
                  isActive
                    ? "font-bold text-purple-400"
                    : "hover:text-purple-400",
                )
              }
            >
              Organize
            </NavLink>
          </li>
          {/* <li>
            <NavLink
              to="/game-selection"
              className={({ isActive }) =>
                cn(
                  "text-2xl",
                  isActive
                    ? "font-bold text-purple-400"
                    : "hover:text-purple-400",
                )
              }
            >
              Game Selection
            </NavLink>
          </li> */}
        </ul>
        <button
          type="button"
          className="relative ml-4 flex cursor-pointer items-center justify-center p-4"
          onClick={() => openDrawer("song-downloads")}
        >
          <RiDownload2Line className="size-7" />
          {isDownloading ? (
            <RiLoader5Line className="-translate-1/2 absolute top-1/2 left-1/2 size-16 animate-spin" />
          ) : null}
        </button>
      </nav>
    </header>
  );
}

export default Header;
