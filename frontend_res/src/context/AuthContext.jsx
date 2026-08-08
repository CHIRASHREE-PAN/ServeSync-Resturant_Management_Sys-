import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { getMe } from "../api/auth";

const AuthContext = createContext(null);

function getStoredToken() {
  return (
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("access_token") ||
    null
  );
}

function getStoredUser() {
  const user =
    localStorage.getItem("user") ||
    sessionStorage.getItem("user");

  try {
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

function normalizeUser(user) {
  if (!user) return null;

  return {
    id: user.id ?? user.user_id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getStoredToken);
  const [user, setUser] = useState(() =>
    normalizeUser(getStoredUser())
  );
  const [loading, setLoading] = useState(() =>
    Boolean(getStoredToken())
  );

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      if (!token) {
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const response = await getMe();

        if (!mounted) return;

        const currentUser = normalizeUser(response.data);

        setUser(currentUser);

        if (localStorage.getItem("access_token")) {
          localStorage.setItem(
            "user",
            JSON.stringify(currentUser)
          );
        } else if (sessionStorage.getItem("access_token")) {
          sessionStorage.setItem(
            "user",
            JSON.stringify(currentUser)
          );
        }
      } catch {
        if (mounted) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("user");

          sessionStorage.removeItem("access_token");
          sessionStorage.removeItem("user");

          setToken(null);
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [token]);

  const login = (
    accessToken,
    userData,
    remember = true
  ) => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("user");

    const normalizedUser = normalizeUser(userData);

    const storage = remember
      ? localStorage
      : sessionStorage;

    storage.setItem(
      "access_token",
      accessToken
    );

    storage.setItem(
      "user",
      JSON.stringify(normalizedUser)
    );

    setToken(accessToken);
    setUser(normalizedUser);
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("user");

    setToken(null);
    setUser(null);
    setLoading(false);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      logout,
      isAuthenticated: Boolean(token && user),
    }),
    [user, token, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}