import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  IconShield,
  IconEye,
  IconEyeOff,
  IconMail,
  IconLock,
  IconZap,
  IconAlert,
} from "../components/Icons";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setSubmitting(true);
    try {
      await login(email, password);
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
            Your finances,
            <br />
            <span className="accent">fully in control.</span>
          </h1>
          <p className="lead">
            Deposit, transfer, and monitor every dollar from one secure,
            intelligent banking dashboard.
          </p>

          <div className="auth-feature">
            <span className="icon"><IconShield width={19} height={19} /></span>
            <div>
              <strong>256-bit SSL Encryption</strong>
              <span>Bank-grade security on every request</span>
            </div>
          </div>
          <div className="auth-feature">
            <span className="icon"><IconZap width={19} height={19} /></span>
            <div>
              <strong>Instant Transfers</strong>
              <span>Move money in seconds, 24/7</span>
            </div>
          </div>
          <div className="auth-feature">
            <span className="icon"><IconLock width={19} height={19} /></span>
            <div>
              <strong>Zero-Knowledge Auth</strong>
              <span>We never store your plaintext password</span>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-box">
          <h1>Sign in to your account</h1>
          <p>Access your balance, transactions, and more.</p>

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
              <label htmlFor="email">Email Address</label>
              <div className="input-wrap">
                <span className="input-icon"><IconMail width={18} height={18} /></span>
                <input
                  id="email"
                  type="email"
                  placeholder="you@swissbank.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrap">
                <span className="input-icon"><IconLock width={18} height={18} /></span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="has-toggle"
                  autoComplete="current-password"
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

            <div className="auth-row">
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Remember me
              </label>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? "Signing in…" : "Sign In to Swiss Bank"}
            </button>

            <p style={{ textAlign: "center", marginTop: 16 }}>
              Don't have an account? <Link to="/register" className="link">Register</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
