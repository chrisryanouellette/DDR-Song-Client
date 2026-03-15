import { NavLink } from "react-router-dom";
import { cn } from "../utils";

function Header() {
  return (
    <header className="mx-auto mb-4 flex flex-wrap items-center justify-between gap-y-2 px-16 sm:mb-8">
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
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
