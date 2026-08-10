import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AccountProvider } from "../context/AccountContext";
import { NotificationProvider } from "../context/Notificationcontext";
import Navbar from "./Navbar";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--ink-500)",
          fontSize: 15,
        }}
      >
        Loading BankCore…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AccountProvider>
      <NotificationProvider>
        <div className="app-shell">
          <Navbar />
          <main className="app-main">
            <Outlet />
          </main>
        </div>
      </NotificationProvider>
    </AccountProvider>
  );
}