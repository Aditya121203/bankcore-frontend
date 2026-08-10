import { Fragment, useMemo, useState } from "react";
import { useAccount } from "../context/AccountContext";
import { formatMoney, formatDate, formatTime, TYPE_CLASS } from "../utils/format";
import { IconSearch, IconFilter } from "../components/Icons";

const filters = ["All", "Deposit", "Withdrawal", "Transfer In", "Transfer Out"];

export default function Transactions() {
  const { balance, transactions, loading } = useAccount();
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [sortDesc, setSortDesc] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const totalInflow = useMemo(
    () => transactions.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0),
    [transactions]
  );
  const totalOutflow = useMemo(
    () => transactions.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0),
    [transactions]
  );

  const filtered = useMemo(() => {
    let list = transactions;
    if (activeFilter !== "All") {
      list = list.filter((t) => t.type === activeFilter);
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (t) =>
          t.id.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.sender.toLowerCase().includes(q) ||
          t.receiver.toLowerCase().includes(q)
      );
    }
    list = [...list].sort((a, b) =>
      sortDesc ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date)
    );
    return list;
  }, [transactions, activeFilter, query, sortDesc]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Transaction Statement</h1>
          <p>Full history of your account activity</p>
        </div>
      </div>

      <div className="grid-cols-4" style={{ marginBottom: 20 }}>
        <div className="card">
          <div style={{ fontSize: 13, color: "var(--ink-500)", fontWeight: 600 }}>Total Transactions</div>
          <div style={{ fontSize: 26, fontWeight: 800, marginTop: 6 }}>{transactions.length}</div>
          <div style={{ fontSize: 13, color: "var(--ink-500)", marginTop: 2 }}>All time</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 13, color: "var(--ink-500)", fontWeight: 600 }}>Total Inflow</div>
          <div style={{ fontSize: 26, fontWeight: 800, marginTop: 6, color: "var(--green-600)" }}>{formatMoney(totalInflow)}</div>
          <div style={{ fontSize: 13, color: "var(--ink-500)", marginTop: 2 }}>Deposits &amp; transfers in</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 13, color: "var(--ink-500)", fontWeight: 600 }}>Total Outflow</div>
          <div style={{ fontSize: 26, fontWeight: 800, marginTop: 6, color: "var(--red-600)" }}>{formatMoney(totalOutflow)}</div>
          <div style={{ fontSize: 13, color: "var(--ink-500)", marginTop: 2 }}>Withdrawals &amp; transfers out</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 13, color: "var(--ink-500)", fontWeight: 600 }}>Current Balance</div>
          <div style={{ fontSize: 26, fontWeight: 800, marginTop: 6 }}>{formatMoney(balance)}</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div className="input-wrap" style={{ flex: 1, minWidth: 240 }}>
            <span className="input-icon"><IconSearch width={17} height={17} /></span>
            <input
              type="text"
              placeholder="Search by ID, description, sender, receiver…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ background: "#f7f8fa" }}
            />
          </div>
          <IconFilter width={17} height={17} style={{ color: "var(--ink-400)" }} />
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              style={{
                border: "none",
                borderRadius: 999,
                padding: "9px 16px",
                fontSize: 13.5,
                fontWeight: 600,
                cursor: "pointer",
                background: activeFilter === f ? "var(--navy-900)" : "#eef1f6",
                color: activeFilter === f ? "#fff" : "var(--ink-700)",
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th style={{ cursor: "pointer" }}>Type</th>
                <th>Sender</th>
                <th>Receiver</th>
                <th style={{ cursor: "pointer" }}>Amount</th>
                <th>Status</th>
                <th onClick={() => setSortDesc((s) => !s)} style={{ cursor: "pointer" }}>
                  Date {sortDesc ? "↓" : "↑"}
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: 32, color: "var(--ink-500)" }}>
                    Loading transactions…
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: 32, color: "var(--ink-500)" }}>
                    No transactions match your search.
                  </td>
                </tr>
              )}
              {!loading &&
                filtered.map((t) => (
                  <Fragment key={t.id}>
                    <tr
                      onClick={() => setExpandedId((id) => (id === t.id ? null : t.id))}
                      style={{ cursor: "pointer" }}
                    >
                      <td style={{ fontFamily: "monospace", color: "var(--ink-500)" }}>{t.id}</td>
                      <td>
                        <span className={`type-pill ${TYPE_CLASS[t.type] || ""}`}>{t.type}</span>
                      </td>
                      <td style={{ fontFamily: "monospace", fontSize: 13 }}>{t.sender}</td>
                      <td style={{ fontFamily: "monospace", fontSize: 13 }}>{t.receiver}</td>
                      <td className={t.amount >= 0 ? "amount-pos" : "amount-neg"}>
                        {t.amount >= 0 ? "+" : ""}
                        {formatMoney(t.amount)}
                      </td>
                      <td>
                        <span className={`status-pill ${t.status === "Completed" ? "status-completed" : "status-pending"}`}>
                          {t.status}
                        </span>
                      </td>
                      <td>
                        {formatDate(t.date)}
                        <br />
                        <span style={{ color: "var(--ink-500)", fontSize: 12.5 }}>{formatTime(t.date)}</span>
                      </td>
                    </tr>
                    {expandedId === t.id && (
                      <tr>
                        <td colSpan={7} style={{ background: "#fafbfc" }}>
                          <div style={{ display: "flex", gap: 32, flexWrap: "wrap", padding: "4px 8px" }}>
                            <DetailField label="Description" value={t.description} />
                            <DetailField label="Transaction ID" value={t.id} mono />
                            <DetailField label="Processed" value={`${formatDate(t.date)} at ${formatTime(t.date)}`} />
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, fontSize: 13.5, color: "var(--ink-500)" }}>
          <span>Showing {filtered.length} of {transactions.length} transactions</span>
          <span>Click a row to expand details</span>
        </div>
      </div>
    </div>
  );
}

function DetailField({ label, value, mono }) {
  return (
    <div>
      <div style={{ fontSize: 11.5, letterSpacing: "0.05em", color: "var(--ink-500)", fontWeight: 700 }}>
        {label.toUpperCase()}
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4, fontFamily: mono ? "monospace" : "inherit" }}>
        {value}
      </div>
    </div>
  );
}
