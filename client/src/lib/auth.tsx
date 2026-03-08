import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";

interface AuthUser {
  id: number;
  username: string;
  role: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAdmin: false,
  isLoading: true,
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  const fetchMe = useCallback(async (t: string) => {
    try {
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        return true;
      }
    } catch {}
    return false;
  }, []);

  useEffect(() => {
    if (token) {
      fetchMe(token).then((ok) => {
        if (!ok) {
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        }
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, [token, fetchMe]);

  const login = async (username: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Login failed");
    }
    const data = await res.json();
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setLocation("/");
  };

  return (
    <AuthContext.Provider value={{ user, token, isAdmin: user?.role === "admin", isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export function authFetch(token: string | null) {
  return (url: string, options: RequestInit = {}) => {
    const headers: Record<string, string> = { ...(options.headers as Record<string, string> || {}) };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    if (options.body && typeof options.body === "string") headers["Content-Type"] = "application/json";
    return fetch(url, { ...options, headers });
  };
}
