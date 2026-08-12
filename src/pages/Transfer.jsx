import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAccount } from "../context/AccountContext";
import { formatMoney } from "../utils/format";
import { useToast } from "../components/Toast";
import { IconTransfer, IconCard, IconDoc, IconWallet, IconAlert, IconLock } from "../components/Icons";

export default function Transfer() {
  const { user } = useAuth();
  const { balance, transfer } = useAccount();
  const { showToast, ToastEl } = useToast();
  const navigate = useNavigate();

  const [receiver, setReceiver] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const PASSWORD_THRESHOLD = 15000;
  const MAX_SINGLE_TRANSFER = 25000;
  const numericAmount = parseFloat(amount) || 0;
  const requiresPassword = numericAmount > PASSWORD_THRESHOLD;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const numeric = parseFloat(amount);
    if (!receiver.trim()) {
      setError("Enter the receiver's account number.");
      return;
    }
    if (!numeric || numeric <= 0) {
      setError("Enter a valid transfer amount.");
      return;
    }
    if (numeric > balance) {
      setError("Insufficient balance for this transfer.");
      return;
    }
    if (numeric > MAX_SINGLE_TRANSFER) {
      setError(`Single transfer cannot exceed ${formatMoney(MAX_SINGLE_TRANSFER)}.`);
      return;
    }
    if (numeric > PASSWORD_THRESHOLD && !password.trim()) {
      setError("Enter your password to confirm this transfer.");
      return;
    }
    setSubmitting(true);
    try {
      const { transaction } = await transfer(receiver, numeric, description, password || undefined);
      showToast(`Transfer of ${formatMoney(Math.abs(transaction.amount))} sent to ${receiver}.`);
      setReceiver("");
      setAmount("");
      setDescription("");
      setPassword("");
      setTimeout(() => navigate("/dashboard"), 900);
    } catch (err) {
      setError(err.message || "Transfer failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      {ToastEl}
      <div className="page-header">
        <div>
          <h1>Transfer Funds</h1>
          <p>Send money to another BankCore account</p>
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
                background: "var(--blue-100)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconTransfer width={20} height={20} stroke="#1d5fd6" />
            </span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>New Transfer</div>
              <div style={{ color: "var(--ink-500)", fontSize: 13.5 }}>Transfer between BankCore accounts</div>
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
              <label>Receiver Account Number <span className="required">*</span></label>
              <div className="input-wrap">
                <span className="input-icon"><IconCard width={17} height={17} /></span>
                <input
                  type="text"
                  placeholder="e.g. D0ECD5175DE5"
                  value={receiver}
                  onChange={(e) => setReceiver(e.target.value.toUpperCase())}
                />
              </div>
              <p className="field-hint">Enter the exact account number shown on the receiver's profile page.</p>
            </div>

            <div className="form-group">
              <label>Amount <span className="required">*</span></label>
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

            {requiresPassword && (
              <div className="form-group">
                <label>Confirm Password <span className="required">*</span></label>
                <div className="input-wrap">
                  <span className="input-icon"><IconLock width={17} height={17} /></span>
                  <input
                    type="password"
                    placeholder="Enter your account password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <p className="field-hint">Transfers above ₹15,000 require your password to confirm.</p>
              </div>
            )}

            <div className="form-group">
              <label>Description <span className="required">*</span></label>
              <div className="input-wrap">
                <span className="input-icon" style={{ top: 20 }}><IconDoc width={17} height={17} /></span>
                <textarea
                  placeholder="e.g. Rent payment, shared expense, invoice settlement…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ paddingLeft: 44 }}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              <IconTransfer width={18} height={18} />
              {submitting ? "Processing…" : "Confirm Transfer"}
            </button>
          </form>
        </div>

        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, marginBottom: 4 }}>
              <IconWallet width={18} height={18} /> Your Balance
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, marginTop: 10 }}>{formatMoney(balance)}</div>
            <div style={{ color: "var(--ink-500)", fontSize: 13, fontFamily: "monospace", marginTop: 2 }}>
              {user?.accountNumber}
            </div>
          </div>

          <div className="card">
            <div style={{ fontWeight: 700, marginBottom: 14 }}>Transfer Limits</div>
            <LimitRow label="Minimum transfer" value="₹1.00" />
            <LimitRow label="Maximum single transfer" value="₹25,000" />
            <LimitRow label="Daily limit" value="₹50,000" />
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
