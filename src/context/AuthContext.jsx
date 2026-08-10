import { createContext, useContext, useEffect, useState } from "react";
import * as api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCurrentUser().then((u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  async function login(email, password) {
    const u = await api.login({ email, password });
    setUser(u);
    return u;
  }

  async function register(payload) {
    const u = await api.register(payload);
    setUser(u);
    return u;
  }

  async function logout() {
    await api.logout();
    setUser(null);
  }

  function refreshUser(updates) {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
