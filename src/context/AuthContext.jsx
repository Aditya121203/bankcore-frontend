import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  loginRequest,
  signupRequest,
  logoutRequest,
  getStoredUser,
  getToken,
} from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hydrate from localStorage on first mount so a refresh doesn't log the user out
  useEffect(() => {
    setUser(getStoredUser());
    setToken(getToken());
    setLoading(false);
  }, []);

  // Matches Login.jsx: await login(email, password)
  const login = useCallback(async (email, password) => {
    const loggedInUser = await loginRequest(email, password);
    setUser(loggedInUser);
    setToken(getToken());
    return loggedInUser;
  }, []);

  // Matches Register.jsx: await register({ fullName, email, password })
  // Backend signup only returns a confirmation message (no token), so we
  // immediately log the new user in to get a token and keep the existing
  // "navigate to /dashboard on success" behavior in Register.jsx.
  const register = useCallback(async ({ fullName, email, password }) => {
    await signupRequest({ fullName, email, password });
    const loggedInUser = await loginRequest(email, password);
    setUser(loggedInUser);
    setToken(getToken());
    return loggedInUser;
  }, []);

  const logout = useCallback(() => {
    logoutRequest();
    setUser(null);
    setToken(null);
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
