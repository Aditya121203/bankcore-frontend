import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as api from "../services/api";
import { formatMoney, formatDate, formatTime, TYPE_CLASS } from "../utils/format";
import { IconClock } from "../components/Icons";

export default function MiniStatement() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .getMiniStatement(user?.email, user?.accountNumber)
      .then((data) => {
        if (!cancelled) setTransactions(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Couldn't load your mini statement.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.email]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Mini Statement</h1>
          <p>Your last 5 transactions at a glance</p>
        </div>
      </div>

      <div className="card">
        {loading && (
          <div style={{ textAlign: "center", padding: 32, color: "var(--ink-500)" }}>
            Loading your mini statement…
          </div>
        )}

        {!loading && error && (
          <div style={{ textAlign: "center", padding: 32, color: "var(--red-600)" }}>{error}</div>
        )}

        {!loading && !error && transactions.length === 0 && (
          <div style={{ textAlign: "center", padding: 32, color: "var(--ink-500)" }}>
            No transactions yet.
          </div>
        )}

        {!loading && !error && transactions.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {transactions.map((t) => (
              <div
                key={t.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                  padding: "14px 8px",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
                  <span
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      background: "#eef1f6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <IconClock width={18} height={18} />
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14.5 }}>
                      <span className={`type-pill ${TYPE_CLASS[t.type] || ""}`} style={{ marginRight: 8 }}>
                        {t.type}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "var(--ink-500)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: "clamp(90px, 40vw, 320px)",
                      }}
                    >
                      {t.description}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div className={t.amount >= 0 ? "amount-pos" : "amount-neg"} style={{ fontWeight: 700 }}>
                    {t.amount >= 0 ? "+" : ""}
                    {formatMoney(t.amount)}
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--ink-500)" }}>
                    {formatDate(t.date)} · {formatTime(t.date)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 18, textAlign: "center" }}>
          <Link to="/statement" className="link">
            View full statement →
          </Link>
        </div>
      </div>
    </div>
  );
}
