import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";

function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-background px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-5">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-[1600px] overflow-hidden rounded-3xl border border-border bg-card shadow-soft">

        {/* Desktop Sidebar */}
        <div className="hidden w-72 shrink-0 border-r border-border bg-card lg:block">
          <Sidebar />
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" />
        )}

        {/* Mobile sidebar */}
        <div
          className={`
            fixed inset-y-0 left-0 z-50 w-64 transform border-r border-border bg-card p-5 transition-transform duration-300 lg:hidden
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          <Sidebar
            mobileOpen={sidebarOpen}
            onMobileClose={() => setSidebarOpen(false)}
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <Header
            onToggleSidebar={() => setSidebarOpen((open) => !open)}
          />

          <main className="flex-1 overflow-auto px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </main>

          <Footer />
        </div>
      </div>
    </div>
  );
}

export default MainLayout;