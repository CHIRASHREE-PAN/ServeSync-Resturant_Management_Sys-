import { Bell, LogOut, Search, UserCircle } from "lucide-react";
import { memo } from "react";

import { useAuth } from "../../context/AuthContext";

const Header = memo(function Header() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="flex items-center justify-between border-b border-border px-4 py-4 sm:px-6">
      <div>
        <h2 className="text-xl font-bold text-text">
          ServeSync
        </h2>

        <p className="text-sm text-secondary-text">
          Restaurant operations platform
        </p>
      </div>

      <div className="flex items-center gap-3">
        <label className="hidden items-center gap-2 rounded-full border border-border bg-muted px-3 py-2 text-sm text-secondary-text sm:flex">
          <Search size={16} aria-hidden="true" />

          <input
            aria-label="Search the workspace"
            className="w-32 bg-transparent text-text outline-none placeholder:text-secondary-text"
            placeholder="Search"
          />
        </label>

        <button
          type="button"
          className="rounded-full border border-border bg-muted p-2 text-text transition hover:bg-border"
          aria-label="Notifications"
        >
          <Bell size={18} aria-hidden="true" />
        </button>

        {isAuthenticated && user && (
          <div className="hidden items-center gap-2 sm:flex">
            <UserCircle
              size={28}
              className="text-primary"
              aria-hidden="true"
            />

            <div className="max-w-32">
              <p className="truncate text-sm font-semibold text-text">
                {user.name}
              </p>

              <p className="truncate text-xs capitalize text-secondary-text">
                {user.role}
              </p>
            </div>

            <button
              type="button"
              onClick={logout}
              className="rounded-full border border-border bg-muted p-2 text-text transition hover:bg-border"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut size={17} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
});

export default Header;