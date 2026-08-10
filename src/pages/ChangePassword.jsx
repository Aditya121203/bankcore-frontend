import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import * as api from "../services/api";
import { IconKey, IconEye, IconEyeOff, IconShield, IconAlert } from "../components/Icons";

const tips = [
  "Use at least 12 characters for maximum security",
  "Mix uppercase, lowercase, numbers, and symbols",
  "Avoid using personal information like birthdays",
  "Never reuse passwords from other accounts",
  "Consider using a password manager",
];

function passwordValid(pw) {
  return pw.length >= 8 && /[A-Z]/.test(pw) && /[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw);
}

export default function ChangePassword() {
  const { user } = useAuth();
  const { showToast, ToastEl } = useToast();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function toggle(field) {
    setShow((s) => ({ ...s, [field]: !s[field] }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (!passwordValid(newPassword)) {
      setError("New password must be at least 8 characters and include an uppercase letter, a number, and a symbol.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (newPassword === currentPassword) {
      setError("New password must be different from your current password.");
      return;
    }

    setSubmitting(true);
    try {
      await api.changePassword(user.email, currentPassword, newPassword);
      showToast("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message || "Could not change password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      {ToastEl}
      <div className="page-header">
        <div>
          <h1>Change Password</h1>
          <p>Update your account password to keep it secure</p>
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
                background: "#eef1f6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconKey width={20} height={20} />
            </span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Update Password</div>
              <div style={{ color: "var(--ink-500)", fontSize: 13.5 }}>Choose a strong, unique password</div>
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
              <label>Current Password <span className="required">*</span></label>
              <div className="input-wrap">
                <span className="input-icon"><IconKey width={17} height={17} /></span>
                <input
                  type={show.current ? "text" : "password"}
                  placeholder="Enter your current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="has-toggle"
                  autoComplete="current-password"
                />
                <button type="button" className="input-toggle" onClick={() => toggle("current")} aria-label="Toggle visibility">
                  {show.current ? <IconEyeOff width={17} height={17} /> : <IconEye width={17} height={17} />}
                </button>
              </div>
            </div>

            <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "24px 0" }} />

            <div className="form-group">
              <label>New Password <span className="required">*</span></label>
              <div className="input-wrap">
                <span className="input-icon"><IconKey width={17} height={17} /></span>
                <input
                  type={show.next ? "text" : "password"}
                  placeholder="Enter your new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="has-toggle"
                  autoComplete="new-password"
                />
                <button type="button" className="input-toggle" onClick={() => toggle("next")} aria-label="Toggle visibility">
                  {show.next ? <IconEyeOff width={17} height={17} /> : <IconEye width={17} height={17} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Confirm New Password <span className="required">*</span></label>
              <div className="input-wrap">
                <span className="input-icon"><IconKey width={17} height={17} /></span>
                <input
                  type={show.confirm ? "text" : "password"}
                  placeholder="Re-enter your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="has-toggle"
                  autoComplete="new-password"
                />
                <button type="button" className="input-toggle" onClick={() => toggle("confirm")} aria-label="Toggle visibility">
                  {show.confirm ? <IconEyeOff width={17} height={17} /> : <IconEye width={17} height={17} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              <IconKey width={18} height={18} />
              {submitting ? "Updating…" : "Change Password"}
            </button>
          </form>
        </div>

        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, marginBottom: 16 }}>
              <IconShield width={18} height={18} /> Password Tips
            </div>
            {tips.map((tip, i) => (
              <div key={tip} style={{ display: "flex", gap: 12, marginBottom: 14, fontSize: 14 }}>
                <span style={{ fontWeight: 700, color: "var(--navy-800)" }}>{i + 1}</span>
                <span style={{ color: "var(--ink-700)" }}>{tip}</span>
              </div>
            ))}
          </div>

          <div className="card" style={{ background: "var(--amber-100)", border: "1px solid #f2d49b" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#8a6410", fontWeight: 700, marginBottom: 8 }}>
              <IconAlert width={17} height={17} /> Security Notice
            </div>
            <p style={{ margin: 0, fontSize: 13.5, color: "#8a6410", lineHeight: 1.5 }}>
              BankCore will never ask for your password via email or phone. If you suspect
              unauthorized access, change your password immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
