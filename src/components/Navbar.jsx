import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/Notificationcontext";
import { timeAgo } from "../utils/format";
import {
  IconShield,
  IconGrid,
  IconUser,
  IconDeposit,
  IconWithdraw,
  IconTransfer,
  IconDoc,
  IconClock,
  IconKey,
  IconBell,
  IconLogout,
  IconChevronLeft,
} from "./Icons";

const NOTIFICATION_ICONS = {
  DEPOSIT: IconDeposit,
  WITHDRAW: IconWithdraw,
  TRANSFER_OUT: IconTransfer,
  TRANSFER_IN: IconTransfer,
  CHANGE_PASSWORD: IconKey,
  PROFILE_UPDATE: IconUser,
  LOGIN: IconShield,
  REGISTER: IconShield,
};

// Overview / Profile grouping matches BankCore's structure exactly:
// Dashboard sits under OVERVIEW, Profile + money-movement sit under
// TRANSACTIONS, Change Password sits under ACCOUNT.
const groupedNav = [
  { label: "Overview", items: [{ to: "/dashboard", label: "Dashboard", icon: IconGrid }] },
  { label: "Account", items: [{ to: "/profile", label: "Profile", icon: IconUser }] },
  {
    label: "Transactions",
    items: [
      { to: "/deposit", label: "Deposit", icon: IconDeposit },
      { to: "/withdraw", label: "Withdraw", icon: IconWithdraw },
      { to: "/transfer", label: "Transfer", icon: IconTransfer },
      { to: "/statement", label: "Statement", icon: IconDoc },
      { to: "/mini-statement", label: "Mini Statement", icon: IconClock },
    ],
  },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAllRead, refresh } = useNotifications();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setPanelOpen(false);
      }
    }
    if (panelOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [panelOpen]);

  function toggleNotifications() {
    setPanelOpen((open) => {
      const next = !open;
      if (next) {
        refresh();
        markAllRead();
      }
      return next;
    });
  }

  async function handleSignOut() {
    await logout();
    navigate("/login");
  }

  const initials = (user?.fullName || "?")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside
      style={{
        width: collapsed ? 84 : 280,
        background: "var(--navy-900)",
        color: "#cdd9ec",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        position: "relative",
        transition: "width 0.18s ease",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "26px 24px",
          color: "#fff",
        }}
      >
        <span
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: "linear-gradient(160deg, var(--gold-400), var(--gold-500))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <IconShield width={20} height={20} stroke="#0f2647" />
        </span>
        {!collapsed && <span style={{ fontSize: 19, fontWeight: 700 }}>BankCore</span>}
      </div>

      <button
        onClick={() => setCollapsed((c) => !c)}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        style={{
          position: "absolute",
          top: 46,
          right: -14,
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "#fff",
          border: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "var(--ink-700)",
          boxShadow: "var(--shadow-card)",
          zIndex: 2,
        }}
      >
        <IconChevronLeft
          width={15}
          height={15}
          style={{ transform: collapsed ? "rotate(180deg)" : "none" }}
        />
      </button>

      <nav style={{ flex: 1, overflowY: "auto", padding: "8px 16px" }}>
        {groupedNav.map((section) => (
          <div key={section.label} style={{ marginBottom: 22 }}>
            {!collapsed && (
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  color: "#7488a8",
                  padding: "0 12px",
                  marginBottom: 8,
                }}
              >
                {section.label.toUpperCase()}
              </div>
            )}
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                style={({ isActive }) => ({
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "11px 12px",
                  borderRadius: 10,
                  marginBottom: 3,
                  fontSize: 14.5,
                  fontWeight: 500,
                  textDecoration: "none",
                  color: isActive ? "#fff" : "#b7c4dc",
                  background: isActive ? "rgba(255,255,255,0.08)" : "transparent",
                  borderLeft: isActive ? "3px solid var(--gold-400)" : "3px solid transparent",
                  justifyContent: collapsed ? "center" : "flex-start",
                })}
              >
                <item.icon width={19} height={19} />
                {!collapsed && item.label}
              </NavLink>
            ))}
          </div>
        ))}

        <div style={{ marginBottom: 22 }}>
          {!collapsed && (
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: "#7488a8",
                padding: "0 12px",
                marginBottom: 8,
              }}
            >
              ACCOUNT
            </div>
          )}
          <NavLink
            to="/change-password"
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "11px 12px",
              borderRadius: 10,
              marginBottom: 3,
              fontSize: 14.5,
              fontWeight: 500,
              textDecoration: "none",
              color: isActive ? "#fff" : "#b7c4dc",
              background: isActive ? "rgba(255,255,255,0.08)" : "transparent",
              borderLeft: isActive ? "3px solid var(--gold-400)" : "3px solid transparent",
              justifyContent: collapsed ? "center" : "flex-start",
            })}
          >
            <IconKey width={19} height={19} />
            {!collapsed && "Change Password"}
          </NavLink>
        </div>
      </nav>

      <div style={{ padding: "10px 16px" }}>
        <div style={{ position: "relative" }} ref={panelRef}>
          <div
            onClick={toggleNotifications}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 12px",
              borderRadius: 10,
              marginBottom: 4,
              fontSize: 14.5,
              fontWeight: 500,
              color: "#b7c4dc",
              cursor: "pointer",
              position: "relative",
            }}
          >
            <IconBell width={19} height={19} />
            {!collapsed && "Notifications"}
            {unreadCount > 0 && (
              <span
                style={{
                  marginLeft: collapsed ? 0 : "auto",
                  position: collapsed ? "absolute" : "static",
                  top: collapsed ? 2 : "auto",
                  right: collapsed ? 10 : "auto",
                  background: "#e03b3b",
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 700,
                  borderRadius: 999,
                  minWidth: 18,
                  height: 18,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 5px",
                }}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>

          {panelOpen && (
            <div
              style={{
                position: "absolute",
                bottom: collapsed ? 0 : "calc(100% + 6px)",
                left: collapsed ? "calc(100% + 10px)" : 0,
                width: 340,
                maxHeight: 420,
                overflowY: "auto",
                background: "#fff",
                borderRadius: 12,
                boxShadow: "0 12px 32px rgba(0,0,0,0.18)",
                zIndex: 20,
                color: "var(--ink-900)",
              }}
            >
              <div
                style={{
                  padding: "14px 16px",
                  fontWeight: 700,
                  fontSize: 14.5,
                  borderBottom: "1px solid var(--border)",
                }}
              >
                Recent Activity
              </div>

              {notifications.length === 0 ? (
                <div style={{ padding: "28px 16px", textAlign: "center", color: "var(--ink-500)", fontSize: 13.5 }}>
                  No activity yet.
                </div>
              ) : (
                notifications.slice(0, 15).map((n, i) => {
                  const Icon = NOTIFICATION_ICONS[n.action] || IconBell;
                  return (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 12,
                        padding: "12px 16px",
                        borderBottom: i === notifications.length - 1 ? "none" : "1px solid var(--border)",
                      }}
                    >
                      <span
                        style={{
                          width: 34,
                          height: 34,
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
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 500, lineHeight: 1.4 }}>{n.message}</div>
                        <div style={{ fontSize: 12, color: "var(--ink-500)", marginTop: 2 }}>{timeAgo(n.date)}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
        <button
          onClick={handleSignOut}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 12px",
            borderRadius: 10,
            fontSize: 14.5,
            fontWeight: 500,
            color: "#b7c4dc",
            cursor: "pointer",
            background: "none",
            border: "none",
            width: "100%",
            textAlign: "left",
          }}
        >
          <IconLogout width={19} height={19} />
          {!collapsed && "Sign Out"}
        </button>
      </div>

      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.08)",
          padding: "16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: "linear-gradient(160deg, var(--gold-400), var(--gold-500))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: 700,
            fontSize: 14,
            flexShrink: 0,
          }}
        >
          {initials}
        </span>
        {!collapsed && (
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                color: "#fff",
                fontWeight: 600,
                fontSize: 14,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user?.fullName}
            </div>
            <div style={{ fontSize: 12.5, color: "#93a5c4" }}>
              {user?.accountType} Account
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}