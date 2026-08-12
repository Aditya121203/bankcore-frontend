import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import * as api from "../services/api";

const NotificationContext = createContext(null);

const POLL_INTERVAL_MS = 20000; // check for new activity every 20s

function seenKey(email) {
  return `bankcore_notifications_seen_${email}`;
}

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [lastSeen, setLastSeen] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) {
      setNotifications([]);
      return;
    }
    const stored = localStorage.getItem(seenKey(user.email));
    setLastSeen(stored ? Number(stored) : 0);
  }, [user?.email]);

  const refresh = useCallback(async () => {
    if (!user?.email) return;
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch {
      // Notifications are non-critical — fail silently rather than
      // interrupting the rest of the app if this call has trouble.
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (!user?.email) return;
    refresh();
    const interval = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [user?.email, refresh]);

  function markAllRead() {
    const now = Date.now();
    if (user?.email) localStorage.setItem(seenKey(user.email), String(now));
    setLastSeen(now);
  }

  const unreadCount = notifications.filter(
    (n) => new Date(n.date).getTime() > lastSeen
  ).length;

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, loading, refresh, markAllRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
