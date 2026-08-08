import {
  Home,
  Sparkles,
  ChefHat,
  Users,
  UtensilsCrossed,
  HandCoins,
  ShieldCheck,
  Soup,
} from "lucide-react";
import { memo } from "react";
import { NavLink } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

const publicLinks = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/welcome", label: "Overview", icon: Sparkles },
  { to: "/session", label: "Guest Sessions", icon: Users },
  { to: "/menu", label: "Menu Catalog", icon: UtensilsCrossed },
  {
    to: "/guest-experience",
    label: "Guest Services",
    icon: HandCoins,
  },
];

const Sidebar = memo(function Sidebar() {
  const { user, isAuthenticated } = useAuth();

  const roleLinks = [];

  if (isAuthenticated && user?.role === "admin") {
    roleLinks.push({
      to: "/admin",
      label: "Admin",
      icon: ShieldCheck,
    });
  }

  if (isAuthenticated && user?.role === "waiter") {
    roleLinks.push({
      to: "/waiter",
      label: "Waiter",
      icon: Soup,
    });
  }

  if (isAuthenticated && user?.role === "kitchen") {
    roleLinks.push({
      to: "/kitchen",
      label: "Kitchen",
      icon: ChefHat,
    });
  }

  const links = [...publicLinks, ...roleLinks];

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-card p-5">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">
          ServeSync
        </h1>

        <p className="mt-1 text-sm text-secondary-text">
          Operations console
        </p>

        {isAuthenticated && user && (
          <div className="mt-4 rounded-xl border border-border bg-muted p-3">
            <p className="truncate text-sm font-semibold text-text">
              {user.name}
            </p>

            <p className="mt-1 text-xs capitalize text-secondary-text">
              {user.role}
            </p>
          </div>
        )}
      </div>

      <nav className="space-y-2">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-primary text-white shadow-soft"
                  : "text-text hover:bg-muted"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto space-y-2 pt-6">
        <div className="rounded-2xl border border-border bg-muted p-4">
          <p className="text-sm font-semibold text-text">
            ServeSync
          </p>

          <p className="mt-1 text-sm text-secondary-text">
            Restaurant management platform
          </p>
        </div>
      </div>
    </aside>
  );
});

export default Sidebar;