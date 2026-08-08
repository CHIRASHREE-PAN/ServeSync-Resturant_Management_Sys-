import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";

function MainLayout() {
  return (
    <div className="min-h-screen bg-background text-text">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-1 overflow-hidden rounded-[28px] border border-border bg-card shadow-soft">
          <Sidebar />

          <div className="flex min-w-0 flex-1 flex-col">
            <Header />

            <main className="flex-1 overflow-auto px-4 py-6 sm:px-6 lg:px-8">
              <Outlet />
            </main>

            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainLayout;