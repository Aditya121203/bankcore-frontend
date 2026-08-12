import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAccount } from "../context/AccountContext";
import { formatMoney } from "../utils/format";
import { useToast } from "../components/Toast";
import { IconWithdraw, IconDoc, IconWallet, IconAlert } from "../components/Icons";

const quickAmounts = [100, 500, 1000, 2000];

export default function Withdraw() {
  const { user } = useAuth();
  const { balance, withdraw } = useAccount();
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
      setError("Enter a valid withdrawal amount.");
      return;
    }
    if (numeric > balance) {
      setError("Insufficient balance for this withdrawal.");
      return;
    }
    if (numeric > 10000) {
      setError("Single withdrawal cannot exceed ₹10,000.");
      return;
    }
    setSubmitting(true);
    try {
      const { transaction } = await withdraw(numeric, description);
      showToast(`Withdrawal of ${formatMoney(Math.abs(transaction.amount))} confirmed.`);
      setAmount("");
      setDescription("");
      setTimeout(() => navigate("/dashboard"), 900);
    } catch (err) {
      setError(err.message || "Withdrawal failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      {ToastEl}
      <div className="page-header">
        <div>
          <h1>Withdraw Funds</h1>
          <p>Withdraw money from your Swiss Bank account</p>
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
                background: "var(--red-100)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconWithdraw width={20} height={20} stroke="#d92d20" />
            </span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>New Withdrawal</div>
              <div style={{ color: "var(--ink-500)", fontSize: 13.5 }}>Funds will be debited immediately</div>
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
              <label>Withdrawal Amount <span className="required">*</span></label>
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
                  ₹{amt.toLocaleString("en-IN")}
                </button>
              ))}
            </div>

            <div className="form-group">
              <label>Description <span className="required">*</span></label>
              <div className="input-wrap">
                <span className="input-icon" style={{ top: 20 }}><IconDoc width={17} height={17} /></span>
                <textarea
                  placeholder="e.g. ATM withdrawal, bill payment, personal use…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ paddingLeft: 44 }}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-red btn-block" disabled={submitting}>
              <IconWithdraw width={18} height={18} />
              {submitting ? "Processing…" : "Confirm Withdrawal"}
            </button>
          </form>
        </div>

        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, marginBottom: 4 }}>
              <IconWallet width={18} height={18} /> Available Balance
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, marginTop: 10 }}>{formatMoney(balance)}</div>
            <div style={{ color: "var(--ink-500)", fontSize: 13, fontFamily: "monospace", marginTop: 2 }}>
              {user?.accountNumber}
            </div>
          </div>

          <div className="card">
            <div style={{ fontWeight: 700, marginBottom: 14 }}>Withdrawal Limits</div>
            <LimitRow label="Minimum withdrawal" value="₹1.00" />
            <LimitRow label="Maximum single withdrawal" value="₹10,000" />
            <LimitRow label="Daily limit" value="₹20,000" />
            <LimitRow label="Processing time" value="Instant" last />
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
