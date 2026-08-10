import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAccount } from "../context/AccountContext";
import { formatMoney } from "../utils/format";
import { useToast } from "../components/Toast";
import { IconDeposit, IconDoc, IconDollar, IconAlert } from "../components/Icons";

const quickAmounts = [500, 1000, 2500, 5000];

export default function Deposite() {
  const { user } = useAuth();
  const { balance, deposit } = useAccount();
  const { showToast, ToastEl } = useToast();
  const navigate = useNavigate();

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const numeric = parseFloat(amount);
    if (!numeric || numeric <= 0) {
      setError("Enter a valid deposit amount.");
      return;
    }
    setSubmitting(true);
    try {
      const { transaction } = await deposit(numeric, description);
      showToast(`Deposit of ${formatMoney(transaction.amount)} confirmed.`);
      setAmount("");
      setDescription("");
      setTimeout(() => navigate("/dashboard"), 900);
    } catch (err) {
      setError(err.message || "Deposit failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      {ToastEl}
      <div className="page-header">
        <div>
          <h1>Deposit Funds</h1>
          <p>Add money to your BankCore account</p>
        </div>
      </div>

      <div className="grid-2-1">
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <span
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "var(--green-100)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconDeposit width={20} height={20} stroke="#17803d" />
            </span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>New Deposit</div>
              <div style={{ color: "var(--ink-500)", fontSize: 13.5 }}>Funds will be credited instantly</div>
            </div>
          </div>

          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--red-100)", color: "var(--red-600)", padding: "12px 14px", borderRadius: 10, fontSize: 14, marginBottom: 20 }}>
              <IconAlert width={17} height={17} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Deposit Amount <span className="required">*</span></label>
              <div className="input-wrap">
                <span className="input-icon" style={{ fontSize: 16, fontWeight: 700, color: "var(--ink-700)" }}>₹</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
              {quickAmounts.map((amt) => (
                <button
                  type="button"
                  key={amt}
                  onClick={() => setAmount(String(amt))}
                  style={{
                    border: "1px solid var(--border)",
                    background: "#f7f8fa",
                    borderRadius: 999,
                    padding: "8px 16px",
                    fontSize: 13.5,
                    fontWeight: 600,
                    cursor: "pointer",
                    color: "var(--ink-700)",
                  }}
                >
                  +₹{amt.toLocaleString("en-IN")}
                </button>
              ))}
            </div>

            <div className="form-group">
              <label>Description <span style={{ color: "var(--ink-400)", fontWeight: 500 }}>(optional)</span></label>
              <div className="input-wrap">
                <span className="input-icon" style={{ top: 20 }}><IconDoc width={17} height={17} /></span>
                <textarea
                  placeholder="e.g. Payroll, freelance income, savings top-up…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ paddingLeft: 44 }}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-green btn-block" disabled={submitting}>
              <IconDeposit width={18} height={18} />
              {submitting ? "Processing…" : "Confirm Deposit"}
            </button>
          </form>
        </div>

        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, marginBottom: 4 }}>
              <IconDollar width={18} height={18} /> Current Balance
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, marginTop: 10 }}>{formatMoney(balance)}</div>
            <div style={{ color: "var(--ink-500)", fontSize: 13, fontFamily: "monospace", marginTop: 2 }}>
              {user?.accountNumber}
            </div>
          </div>

          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 700, marginBottom: 14 }}>Deposit Limits</div>
            <LimitRow label="Minimum deposit" value="₹1.00" />
            <LimitRow label="Maximum single deposit" value="₹50,000" />
            <LimitRow label="Daily limit" value="₹1,00,000" />
            <LimitRow label="Processing time" value="Instant" last />
          </div>

          <div className="card" style={{ background: "var(--green-100)", border: "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--green-600)", fontWeight: 700, marginBottom: 6 }}>
              <IconDollar width={16} height={16} /> Secure &amp; Instant
            </div>
            <p style={{ margin: 0, fontSize: 13.5, color: "#1f6b3d" }}>
              All deposits are processed securely and reflected in your balance immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LimitRow({ label, value, last }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "10px 0",
        borderBottom: last ? "none" : "1px solid var(--border)",
        fontSize: 14,
      }}
    >
      <span style={{ color: "var(--ink-500)" }}>{label}</span>
      <span style={{ fontWeight: 700 }}>{value}</span>
    </div>
  );
}
