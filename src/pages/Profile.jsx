import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useAccount } from "../context/AccountContext";
import { formatMoney } from "../utils/format";
import { useToast } from "../components/Toast";
import * as api from "../services/api";
import {
  IconEdit,
  IconUser,
  IconMail,
  IconPhone,
  IconPin,
  IconCalendar,
  IconWallet,
  IconCard,
  IconCheckCircle,
} from "../components/Icons";

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const { balance } = useAccount();
  const { showToast, ToastEl } = useToast();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    address: user?.address || "",
    dob: user?.dob || "",
  });

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await api.updateProfile(user.email, form);
      refreshUser(updated);
      setEditing(false);
      showToast("Profile updated successfully.");
    } catch (err) {
      showToast(err.message || "Could not update profile.", "error");
    } finally {
      setSaving(false);
    }
  }

  const initials = (user?.fullName || "?")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div>
      {ToastEl}
      <div className="page-header">
        <div>
          <h1>My Profile</h1>
          <p>View and manage your personal details</p>
        </div>
        <button className="btn btn-primary" onClick={() => setEditing((e) => !e)}>
          <IconEdit width={16} height={16} />
          {editing ? "Cancel Edit" : "Edit Profile"}
        </button>
      </div>

      <div className="grid-2-1">
        <div>
          <div className="card" style={{ textAlign: "center", marginBottom: 20 }}>
            <div
              style={{
                width: 84,
                height: 84,
                borderRadius: "50%",
                margin: "0 auto 16px",
                background: "linear-gradient(160deg, var(--gold-400), var(--gold-500))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 28,
                fontWeight: 700,
              }}
            >
              {initials}
            </div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{user?.fullName}</div>
            <div style={{ color: "var(--ink-500)", fontSize: 14, marginTop: 2 }}>{user?.email}</div>
            <span className="badge badge-green" style={{ marginTop: 12 }}>
              {user?.status || "Active"}
            </span>

            <div style={{ borderTop: "1px solid var(--border)", marginTop: 20, paddingTop: 16 }}>
              <div style={{ fontSize: 13, color: "var(--ink-500)" }}>Member Since</div>
              <div style={{ fontWeight: 700, marginTop: 2 }}>
                {user?.memberSince
                  ? new Date(user.memberSince).toLocaleString("en-US", { month: "long", year: "numeric" })
                  : "—"}
              </div>
            </div>
            <div style={{ borderTop: "1px solid var(--border)", marginTop: 16, paddingTop: 16 }}>
              <div style={{ fontSize: 13, color: "var(--ink-500)" }}>Account Type</div>
              <span className="badge badge-gray no-dot" style={{ marginTop: 6 }}>
                <IconCard width={14} height={14} /> {user?.accountType}
              </span>
            </div>
          </div>

          <div className="card">
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, marginBottom: 16 }}>
              <IconWallet width={18} height={18} /> Current Balance
            </div>
            <div style={{ fontSize: 30, fontWeight: 800 }}>{formatMoney(balance)}</div>
            <div style={{ color: "var(--ink-500)", fontSize: 13.5, marginTop: 2 }}>Available funds</div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
              <span style={{ color: "var(--ink-500)", fontSize: 14 }}>Account Status</span>
              <span style={{ color: "var(--green-600)", fontWeight: 700, fontSize: 14 }}>{user?.status || "Active"}</span>
            </div>
          </div>
        </div>

        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700 }}>
              <IconUser width={18} height={18} /> Personal Information
            </div>
            <p className="section-sub" style={{ marginBottom: 20 }}>Your registered personal details</p>

            {editing ? (
              <form onSubmit={handleSave}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" value={user?.email || ""} disabled style={{ background: "#f3f4f6", cursor: "not-allowed" }} />
                  <p className="field-hint">This is your account's sign-in email and can't be changed here.</p>
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+1 (415) 000-0000" />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input type="text" value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="Street, City, State, ZIP" />
                </div>
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input type="date" value={form.dob} onChange={(e) => update("dob", e.target.value)} />
                </div>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  <IconCheckCircle width={16} height={16} />
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </form>
            ) : (
              <>
                <InfoRow icon={IconUser} label="Full Name" value={user?.fullName} />
                <InfoRow icon={IconMail} label="Email Address" value={user?.email} />
                <InfoRow icon={IconPhone} label="Phone Number" value={user?.phone || "Not set"} />
                <InfoRow icon={IconPin} label="Address" value={user?.address || "Not set"} />
                <InfoRow
                  icon={IconCalendar}
                  label="Date of Birth"
                  value={user?.dob ? new Date(user.dob).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "Not set"}
                  last
                />
              </>
            )}
          </div>

          <div className="card">
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700 }}>
              <IconCard width={18} height={18} /> Account Information
            </div>
            <p className="section-sub" style={{ marginBottom: 20 }}>Your BankCore account details</p>

            <InfoRow icon={IconCard} label="Account Number" value={user?.accountNumber} mono />
            <InfoRow icon={IconWallet} label="Account Type" value={user?.accountType} />
            <InfoRow icon={IconWallet} label="Current Balance" value={formatMoney(balance)} />
            <InfoRow icon={IconCheckCircle} label="Account Status" value={user?.status || "Active"} />
            <InfoRow
              icon={IconCalendar}
              label="Member Since"
              value={user?.memberSince ? new Date(user.memberSince).toLocaleString("en-US", { month: "long", year: "numeric" }) : "—"}
              last
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, mono, last }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 0",
        borderBottom: last ? "none" : "1px solid var(--border)",
      }}
    >
      <span
        style={{
          width: 38,
          height: 38,
          borderRadius: "50%",
          background: "#eef1f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color: "var(--ink-700)",
        }}
      >
        <Icon width={16} height={16} />
      </span>
      <div>
        <div style={{ fontSize: 11.5, letterSpacing: "0.05em", color: "var(--ink-500)", fontWeight: 700 }}>
          {label.toUpperCase()}
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2, fontFamily: mono ? "monospace" : "inherit" }}>
          {value}
        </div>
      </div>
    </div>
  );
}
