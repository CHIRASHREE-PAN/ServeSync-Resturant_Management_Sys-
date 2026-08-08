import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "../components/layout/MainLayout";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import LoadingPage from "../pages/LoadingPage";

const LoginPage = lazy(() => import("../pages/Login"));
const LandingPage = lazy(() => import("../pages/LandingPage"));
const WelcomePage = lazy(() => import("../pages/WelcomePage"));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage"));
const ForbiddenPage = lazy(() => import("../pages/ForbiddenPage"));

const CustomerSessionPage = lazy(
  () => import("../pages/CustomerSessionPage")
);

const MenuPage = lazy(() => import("../pages/MenuPage"));

const CustomerExperiencePage = lazy(
  () => import("../pages/CustomerExperiencePage")
);

const AdminPage = lazy(() => import("../pages/AdminPage"));
const WaiterPage = lazy(() => import("../pages/WaiterPage"));

const KitchenPage = lazy(
  () => import("../pages/KitchenPage")
);

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <Routes>

        {/* Authentication */}
        <Route
          path="/login"
          element={<LoginPage />}
        />

        {/* Application Layout */}
        <Route element={<MainLayout />}>

          {/* Public Routes */}
          <Route
            path="/"
            element={<LandingPage />}
          />

          <Route
            path="/welcome"
            element={<WelcomePage />}
          />

          <Route
            path="/loading"
            element={<LoadingPage />}
          />

          {/* Customer Routes - Public */}
          <Route
            path="/session"
            element={<CustomerSessionPage />}
          />

          <Route
            path="/menu"
            element={<MenuPage />}
          />

          <Route
            path="/guest-experience"
            element={<CustomerExperiencePage />}
          />

          {/* Admin Routes */}
          <Route
            element={
              <ProtectedRoute allowedRoles={["admin"]} />
            }
          >
            <Route
              path="/admin"
              element={<AdminPage />}
            />
          </Route>

          {/* Waiter Routes */}
          <Route
            element={
              <ProtectedRoute allowedRoles={["waiter"]} />
            }
          >
            <Route
              path="/waiter"
              element={<WaiterPage />}
            />
          </Route>

          {/* Kitchen Routes */}
          <Route
            element={
              <ProtectedRoute allowedRoles={["kitchen"]} />
            }
          >
            <Route
              path="/kitchen"
              element={<KitchenPage />}
            />
          </Route>

          {/* Error Pages */}
          <Route
            path="/403"
            element={<ForbiddenPage />}
          />

          <Route
            path="/404"
            element={<NotFoundPage />}
          />

          {/* Unknown Routes */}
          <Route
            path="*"
            element={
              <Navigate
                to="/404"
                replace
              />
            }
          />

        </Route>
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;