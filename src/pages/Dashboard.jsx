import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAccount } from "../context/AccountContext";
import { formatMoney, formatDate, formatTime, TYPE_CLASS } from "../utils/format";
import {
  IconRefresh,
  IconEye,
  IconEyeOff,
  IconCopy,
  IconShield,
  IconTrendUp,
  IconClock,
  IconDeposit,
  IconWithdraw,
  IconTransfer,
  IconDoc,
} from "../components/Icons";

function buildMonthlySeries(transactions) {
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleString("en-US", { month: "short" }), inflow: 0, outflow: 0 });
  }
  transactions.forEach((t) => {
    const d = new Date(t.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const bucket = months.find((m) => m.key === key);
    if (!bucket) return;
    if (t.amount > 0) bucket.inflow += t.amount;
    else bucket.outflow += Math.abs(t.amount);
  });
  return months;
}

function TrendChart({ transactions }) {
  const data = useMemo(() => buildMonthlySeries(transactions), [transactions]);
  const max = Math.max(1000, ...data.map((d) => Math.max(d.inflow, d.outflow)));
  const width = 760;
  const height = 220;
  const padL = 46;
  const padB = 26;
  const stepX = (width - padL - 10) / (data.length - 1);

  const scaleY = (v) => height - padB - (v / max) * (height - padB - 20);

  const linePath = (key) =>
    data
      .map((d, i) => `${i === 0 ? "M" : "L"} ${padL + i * stepX} ${scaleY(d[key])}`)
      .join(" ");

  const areaPath = (key) =>
    `${linePath(key)} L ${padL + (data.length - 1) * stepX} ${height - padB} L ${padL} ${height - padB} Z`;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(max * f));

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="220">
      {yTicks.map((t) => (
        <g key={t}>
          <line x1={padL} x2={width - 6} y1={scaleY(t)} y2={scaleY(t)} stroke="#eef1f6" strokeDasharray="4 4" />
          <text x={0} y={scaleY(t) + 4} fontSize="11" fill="#98a2b3">
            ₹{t >= 1000 ? `${Math.round(t / 1000)}k` : t}
          </text>
        </g>
      ))}
      <path d={areaPath("inflow")} fill="rgba(23,128,61,0.08)" stroke="none" />
      <path d={linePath("inflow")} fill="none" stroke="#1a9b4c" strokeWidth="2.5" />
      <path d={linePath("outflow")} fill="none" stroke="#e0413a" strokeWidth="2.5" />
      {data.map((d, i) => (
        <text key={d.key} x={padL + i * stepX} y={height - 4} fontSize="11" fill="#98a2b3" textAnchor="middle">
          {d.label}
        </text>
      ))}
    </svg>
  );
}

const quickActions = [
  { to: "/deposit", label: "Deposit", sub: "Add funds", icon: IconDeposit, color: "#1a9b4c", bg: "#e7f6ec" },
  { to: "/withdraw", label: "Withdraw", sub: "Take out funds", icon: IconWithdraw, color: "#d92d20", bg: "#fdeceb" },
  { to: "/transfer", label: "Transfer", sub: "Send money", icon: IconTransfer, color: "#1d5fd6", bg: "#e8f0fe" },
  { to: "/statement", label: "Statement", sub: "View history", icon: IconDoc, color: "#344054", bg: "#eef1f6" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const { balance, transactions, loading, refresh } = useAccount();
  const [hideBalance, setHideBalance] = useState(false);
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const totalDeposited = useMemo(
    () => transactions.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0),
    [transactions]
  );
  const totalWithdrawn = useMemo(
    () => transactions.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0),
    [transactions]
  );
  const lastTxn = transactions[0];
  const completedCount = transactions.filter((t) => t.status === "Completed").length;

  async function handleRefresh() {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }

  function copyAccount() {
    navigator.clipboard?.writeText(user?.accountNumber || "").then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Last updated: {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} at{" "}
            {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <button className="btn btn-outline" onClick={handleRefresh} disabled={refreshing}>
          <IconRefresh width={16} height={16} style={{ animation: refreshing ? "spin 0.8s linear infinite" : "none" }} />
          Refresh
        </button>
      </div>

      <div
        className="card"
        style={{
          background: "linear-gradient(120deg, var(--navy-950), var(--navy-800))",
          color: "#fff",
          border: "none",
          marginBottom: 20,
          position: "relative",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, letterSpacing: "0.08em", color: "#93a5c4", fontWeight: 700 }}>
              WELCOME BACK
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>{user?.fullName}</div>
          </div>
          <span className="badge badge-green" style={{ background: "rgba(23,128,61,0.18)", color: "#5fe08c" }}>
            {user?.status || "Active"}
          </span>
        </div>

        <div style={{ marginTop: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, letterSpacing: "0.08em", color: "#93a5c4", fontWeight: 700 }}>
            AVAILABLE BALANCE
            <button
              onClick={() => setHideBalance((h) => !h)}
              style={{ background: "none", border: "none", color: "#93a5c4", cursor: "pointer", display: "flex" }}
              aria-label={hideBalance ? "Show balance" : "Hide balance"}
            >
              {hideBalance ? <IconEyeOff width={15} height={15} /> : <IconEye width={15} height={15} />}
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginTop: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 44, fontWeight: 800 }}>
              {hideBalance ? "••••••" : loading ? "…" : formatMoney(balance)}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#5fe08c", fontSize: 14, fontWeight: 600 }}>
              <IconTrendUp width={15} height={15} /> +8.4% this month
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 56, marginTop: 32, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 11.5, letterSpacing: "0.06em", color: "#93a5c4", fontWeight: 700, marginBottom: 6 }}>
              ACCOUNT NUMBER
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 15 }}>
              {user?.accountNumber}
              <button onClick={copyAccount} style={{ background: "none", border: "none", color: "#93a5c4", cursor: "pointer", display: "flex" }} aria-label="Copy account number">
                <IconCopy width={14} height={14} />
              </button>
              {copied && <span style={{ fontSize: 11, color: "#5fe08c" }}>Copied!</span>}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11.5, letterSpacing: "0.06em", color: "#93a5c4", fontWeight: 700, marginBottom: 6 }}>
              ACCOUNT TYPE
            </div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "var(--gold-400)" }}>{user?.accountType} Account</div>
          </div>
          <div>
            <div style={{ fontSize: 11.5, letterSpacing: "0.06em", color: "#93a5c4", fontWeight: 700, marginBottom: 6 }}>
              MEMBER SINCE
            </div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{user?.memberSince}</div>
          </div>
        </div>

        <div style={{ position: "absolute", right: 24, bottom: 20, display: "flex", alignItems: "center", gap: 6, color: "#93a5c4", fontSize: 12.5 }}>
          <IconShield width={14} height={14} /> FDIC Insured
        </div>
      </div>

      <div className="grid-cols-4" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="stat-icon" style={{ background: "#eef1f6" }}>
            <IconTrendUp width={20} height={20} stroke="#344054" />
          </div>
          <div style={{ marginTop: 16, fontSize: 12, letterSpacing: "0.05em", color: "var(--ink-500)", fontWeight: 700 }}>
            TOTAL TRANSACTIONS
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, marginTop: 4 }}>{transactions.length}</div>
          <div style={{ fontSize: 13, color: "var(--ink-500)", marginTop: 2 }}>{completedCount} completed</div>
        </div>

        <div className="card">
          <div className="stat-icon" style={{ background: "var(--green-100)" }}>
            <IconDeposit width={20} height={20} stroke="#17803d" />
          </div>
          <div style={{ marginTop: 16, fontSize: 12, letterSpacing: "0.05em", color: "var(--ink-500)", fontWeight: 700 }}>
            TOTAL DEPOSITED
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, marginTop: 4 }}>{formatMoney(totalDeposited)}</div>
          <div style={{ fontSize: 13, color: "var(--ink-500)", marginTop: 2 }}>All-time inflow</div>
        </div>

        <div className="card">
          <div className="stat-icon" style={{ background: "var(--red-100)" }}>
            <IconWithdraw width={20} height={20} stroke="#d92d20" />
          </div>
          <div style={{ marginTop: 16, fontSize: 12, letterSpacing: "0.05em", color: "var(--ink-500)", fontWeight: 700 }}>
            TOTAL WITHDRAWN
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, marginTop: 4 }}>{formatMoney(totalWithdrawn)}</div>
          <div style={{ fontSize: 13, color: "var(--ink-500)", marginTop: 2 }}>All-time outflow</div>
        </div>

        <div className="card">
          <div className="stat-icon" style={{ background: "var(--amber-100)" }}>
            <IconClock width={20} height={20} stroke="#b5750a" />
          </div>
          <div style={{ marginTop: 16, fontSize: 12, letterSpacing: "0.05em", color: "var(--ink-500)", fontWeight: 700 }}>
            LAST TRANSACTION
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, marginTop: 4 }}>
            {lastTxn ? formatMoney(Math.abs(lastTxn.amount)) : "—"}
          </div>
          <div style={{ fontSize: 13, color: "var(--ink-500)", marginTop: 2 }}>
            {lastTxn ? formatDate(lastTxn.date) : "No activity"}
          </div>
        </div>
      </div>

      <div className="grid-2-1" style={{ marginBottom: 20 }}>
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h2 className="section-title">Transaction Volume</h2>
              <p className="section-sub">Monthly inflow vs outflow — last 6 months</p>
            </div>
            <span className="badge badge-gray no-dot">
              {new Date(new Date().setMonth(new Date().getMonth() - 5)).toLocaleString("en-US", { month: "short" })} – {new Date().toLocaleString("en-US", { month: "short", year: "numeric" })}
            </span>
          </div>
          <TrendChart transactions={transactions} />
          <div style={{ display: "flex", gap: 20, justifyContent: "center", fontSize: 13.5 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#1a9b4c" }} /> Inflow
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#e0413a" }} /> Outflow
            </span>
          </div>
        </div>

        <div className="card">
          <h2 className="section-title">Quick Actions</h2>
          <p className="section-sub" style={{ marginBottom: 16 }}>Common banking operations</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {quickActions.map((a) => (
              <Link
                key={a.to}
                to={a.to}
                style={{
                  textDecoration: "none",
                  background: a.bg,
                  borderRadius: 14,
                  padding: "18px 14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <a.icon width={20} height={20} stroke={a.color} />
                <div>
                  <div style={{ fontWeight: 700, color: a.color, fontSize: 14.5 }}>{a.label}</div>
                  <div style={{ fontSize: 12.5, color: "var(--ink-500)" }}>{a.sub}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 8 }}>
          <div>
            <h2 className="section-title">Recent Transactions</h2>
            <p className="section-sub">Last {Math.min(8, transactions.length)} activities on your account</p>
          </div>
          <Link to="/statement" className="link" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14 }}>
            View all →
          </Link>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Type</th>
                <th>Description</th>
                <th>Sender / Receiver</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 8).map((t) => (
                <tr key={t.id}>
                  <td style={{ fontFamily: "monospace", color: "var(--ink-500)" }}>{t.id}</td>
                  <td>
                    <span className={`type-pill ${TYPE_CLASS[t.type] || ""}`}>{t.type}</span>
                  </td>
                  <td>{t.description}</td>
                  <td style={{ fontFamily: "monospace", fontSize: 13, color: "var(--ink-500)" }}>
                    {t.sender}
                    <br />→ {t.receiver}
                  </td>
                  <td className={t.amount >= 0 ? "amount-pos" : "amount-neg"}>
                    {t.amount >= 0 ? "+" : ""}
                    {formatMoney(t.amount)}
                  </td>
                  <td>
                    {formatDate(t.date)}
                    <br />
                    <span style={{ color: "var(--ink-500)", fontSize: 12.5 }}>{formatTime(t.date)}</span>
                  </td>
                  <td>
                    <span className={`status-pill ${t.status === "Completed" ? "status-completed" : "status-pending"}`}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", color: "var(--ink-500)", padding: 32 }}>
                    No transactions yet — make your first deposit to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
