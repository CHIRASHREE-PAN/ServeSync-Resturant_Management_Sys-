import { memo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  CalendarCheck,
  HandCoins,
  LogOut,
  Menu as MenuIcon,
  ShoppingBag,
  Sparkles,
  UserCircle,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCustomerSession } from "../../context/CustomerSessionContext";
import { useCart } from "../../context/CartContext";

/* ---------------------------------------------------------------
   Customer-facing navigation links (existing routes)
--------------------------------------------------------------- */
const customerLinks = [
  { to: "/menu", label: "Menu", icon: UtensilsCrossed },
  { to: "/session", label: "My Session", icon: CalendarCheck },
  {
    to: "/guest-experience",
    label: "Guest Services",
    icon: HandCoins,
  },
];

const navLinkClass = ({ isActive }) =>
  `inline-flex items-center gap-2 rounded-button px-3 py-2 text-sm font-medium transition ${
    isActive
      ? "bg-primary text-white shadow-soft"
      : "text-text hover:bg-muted"
  }`;

const Header = memo(function Header({ onToggleSidebar }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { session } = useCustomerSession();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const hasActiveSession = session?.status === "ACTIVE";
  const goToLogin = () => navigate("/login");

  const renderNavLinks = (mobile = false) => (
    <>
      {customerLinks.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={navLinkClass}
        >
          <Icon size={16} aria-hidden="true" />
          <span className={mobile ? "" : "whitespace-nowrap"}>{label}</span>
        </NavLink>
      ))}

      {/* Existing cart feature — navigates to /menu where the cart drawer lives */}
      <NavLink
        to="/menu"
        className={navLinkClass}
      >
        <ShoppingBag size={16} aria-hidden="true" />
        Cart
        {itemCount > 0 ? ` (${itemCount})` : ""}
      </NavLink>
    </>
  );

  return (
    <header className="border-b border-border bg-card">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <NavLink
          to="/"
          className="flex shrink-0 items-center gap-2"
        >
          <span className="text-xl font-bold tracking-tight text-primary">
            ServeSync
          </span>
          <span className="hidden text-sm text-secondary-text sm:inline">
            Restaurant
          </span>
        </NavLink>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {renderNavLinks(false)}
        </nav>

        {/* Active session indicator */}
        {hasActiveSession && !isAuthenticated && (
          <span className="hidden items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success lg:inline-flex">
            <Sparkles size={13} aria-hidden="true" />
            Active table
            {session?.name ? ` · ${session.name}` : ""}
          </span>
        )}

        {/* Right side — staff area stays untouched for authenticated staff */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {/* Mobile sidebar toggle */}
          <button
            type="button"
            onClick={onToggleSidebar}
            className="rounded-button p-2 text-text transition hover:bg-muted lg:hidden"
            aria-label="Toggle navigation"
          >
            <MenuIcon size={20} aria-hidden="true" />
          </button>

          {isAuthenticated && user ? (
            <div className="hidden items-center gap-2 sm:flex">
              <UserCircle
                size={26}
                className="shrink-0 text-primary"
                aria-hidden="true"
              />
              <div className="max-w-28">
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
                <LogOut size={16} aria-hidden="true" />
              </button>
            </div>
          ) : (
            /* Secondary, visually quiet staff login for guests */
            <button
              type="button"
              onClick={goToLogin}
              className="hidden rounded-button px-3 py-2 text-sm font-medium text-secondary-text transition hover:bg-muted hover:text-text sm:inline-flex"
            >
              Staff Login
            </button>
          )}
        </div>
      </div>

      {/* Mobile navigation panel */}
      <nav className="space-y-1 border-t border-border bg-card px-4 py-3 md:hidden">
        {renderNavLinks(true)}
        {!isAuthenticated && (
          <button
            type="button"
            onClick={goToLogin}
            className="inline-flex w-full items-center gap-2 rounded-button px-3 py-2 text-sm font-medium text-secondary-text transition hover:bg-muted hover:text-text"
          >
            Staff Login
          </button>
        )}
      </nav>
    </header>
  );
});

export default Header;