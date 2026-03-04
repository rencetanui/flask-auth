import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);
  const [bootError, setBootError] = useState("");

  async function refreshSession() {
    try {
      const data = await api.get("/api/auth/me");
      setUser(data.user);
      return data.user;
    } catch (err) {
      if (err?.status === 401) {
        setUser(null);
        return null;
      }
      throw err;
    }
  }

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setBootError("");
        await refreshSession();
      } catch (err) {
        if (alive) setBootError(err?.message || "Failed to reach API");
      } finally {
        if (alive) setBooting(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  async function logout() {
    await api.post("/api/auth/logout");
    setUser(null);
  }

  const value = useMemo(
    () => ({ user, setUser, booting, bootError, refreshSession, logout }),
    [user, booting, bootError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}