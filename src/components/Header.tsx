import { NavLink } from "react-router-dom";

function Header() {
  return (
    <header className="mx-auto mb-4 flex max-w-6xl flex-wrap items-center justify-between gap-y-2 sm:mb-8">
      <h1 className="font-bold text-2xl">DDR Song Collection</h1>
      <nav className="flex items-center justify-between">
        <ul className="flex space-x-4">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? "font-bold text-purple-400" : "hover:text-purple-400"
              }
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/game-selection"
              className={({ isActive }) =>
                isActive ? "font-bold text-purple-400" : "hover:text-purple-400"
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
