import { useEffect, useState, useCallback } from "react";

export function useToast() {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type, id: Date.now() });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const ToastEl = toast ? (
    <div className={`toast ${toast.type}`}>{toast.message}</div>
  ) : null;

  return { showToast, ToastEl };
}
