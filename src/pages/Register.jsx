import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  IconShield,
  IconEye,
  IconEyeOff,
  IconCheckCircle,
  IconAlert,
} from "../components/Icons";

const features = [
  "Instant deposits and withdrawals",
  "Real-time transaction notifications",
  "Zero-fee internal transfers",
  "Detailed monthly statements",
  "Multi-layer fraud protection",
];

function passwordValid(pw) {
  return pw.length >= 8 && /[A-Z]/.test(pw) && /[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw);
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!passwordValid(password)) {
      setError("Password must be at least 8 characters and include an uppercase letter, a number, and a symbol.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!agree) {
      setError("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }

    setSubmitting(true);
    try {
      await register({ fullName: fullName.trim(), email: email.trim(), password });
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-side">
        <div className="auth-side-content">
          <div className="auth-brand">
            <span
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: "linear-gradient(160deg, var(--gold-400), var(--gold-500))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconShield width={18} height={18} stroke="#0f2647" />
            </span>
            Swiss Bank
          </div>

          <h1>
            Open your account
            <br />
            <span className="accent">in under 2 minutes.</span>
          </h1>
          <p className="lead">
            Join thousands of customers who trust Swiss Bank with their everyday
            finances.
          </p>

          {features.map((f) => (
            <div className="auth-feature" key={f}>
              <span className="icon" style={{ background: "transparent" }}>
                <IconCheckCircle width={20} height={20} stroke="var(--gold-400)" />
              </span>
              <strong style={{ display: "flex", alignItems: "center" }}>{f}</strong>
            </div>
          ))}

          <p style={{ position: "absolute", bottom: 32, left: 56, color: "#7c8aab", fontSize: 12.5, margin: 0 }}>
            © 2026 Swiss Bank Financial Services. Deposits Protected.
          </p>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-box">
          <h1>Create your account</h1>
          <p>Get started with Swiss Bank — it's free and takes just minutes.</p>

          {error && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "var(--red-100)",
                color: "var(--red-600)",
                padding: "12px 14px",
                borderRadius: 10,
                fontSize: 14,
                marginBottom: 20,
              }}
            >
              <IconAlert width={17} height={17} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                type="text"
                placeholder="Marcus Holloway"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="you@swissbank.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <p className="field-hint" style={{ marginTop: -4, marginBottom: 10 }}>
                Minimum 8 characters with uppercase, number, and symbol.
              </p>
              <div className="input-wrap">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="has-toggle"
                  style={{ paddingLeft: 16 }}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="input-toggle"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <IconEyeOff width={18} height={18} /> : <IconEye width={18} height={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-wrap">
                <input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="has-toggle"
                  style={{ paddingLeft: 16 }}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="input-toggle"
                  onClick={() => setShowConfirm((s) => !s)}
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <IconEyeOff width={18} height={18} /> : <IconEye width={18} height={18} />}
                </button>
              </div>
            </div>

            <label className="checkbox-row" style={{ marginBottom: 24, alignItems: "flex-start" }}>
              <input
                type="checkbox"
                className="form-checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                style={{ marginTop: 2 }}
              />
              <span>
                I agree to Swiss Bank's{" "}
                <span className="link" style={{ cursor: "pointer" }}>Terms of Service</span> and{" "}
                <span className="link" style={{ cursor: "pointer" }}>Privacy Policy</span>
              </span>
            </label>

            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? "Creating account…" : "Create My Account"}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account? <Link to="/login" className="link">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
