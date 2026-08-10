import {
  Home,
  Sparkles,
  ChefHat,
  Users,
  UtensilsCrossed,
  HandCoins,
  ShieldCheck,
  Soup,
  X,
} from "lucide-react";
import { memo, useState } from "react";
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

const Sidebar = memo(function Sidebar({ mobileOpen, onMobileClose }) {
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
    <>
      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onMobileClose}
        />
      )}
      
      {/* Mobile sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 transform border-r border-border bg-card p-5 transition-transform duration-300 lg:hidden
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">
              ServeSync
            </h1>
            <p className="mt-1 text-sm text-secondary-text">
              Operations console
            </p>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-button p-2 text-text transition hover:bg-muted"
          >
            <X size={20} />
          </button>
        </div>

        {isAuthenticated && user && (
          <div className="mb-4 rounded-xl border border-border bg-muted p-3">
            <p className="truncate text-sm font-semibold text-text">
              {user.name}
            </p>
            <p className="mt-1 text-xs capitalize text-secondary-text">
              {user.role}
            </p>
          </div>
        )}

        <nav className="space-y-2">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onMobileClose}
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
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:shrink-0 lg:flex-col lg:border-r lg:border-border lg:bg-card lg:p-5">

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">
          ServeSync
        </h1>

        <p className="mt-1 text-sm text-secondary-text">
          Operations console
        </p>
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
    </>
  );
});

export default Sidebar;