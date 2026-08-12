// Real API layer for Swiss Bank, talking to the Spring Boot backend.
// In dev, Vite proxies "/api/*" to http://localhost:8080 (see vite.config.js).
// In production (Render), VITE_API_URL is set at build time to the deployed
// backend's full URL, since there's no dev proxy on a static site.
const API_BASE = import.meta.env.VITE_API_URL || "/api";

const TOKEN_KEY = "bankcore_token";

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// Extracts a human-readable message from the backend's error shape.
// GlobalExceptionHandler returns either { message: "..." } or
// { errors: { field: "message" } } for validation failures.
async function parseErrorMessage(res) {
  try {
    const data = await res.json();
    if (data.message) return data.message;
    if (data.errors) {
      const first = Object.values(data.errors)[0];
      if (first) return first;
    }
  } catch {
    // response wasn't JSON (e.g. network/proxy error) — fall through
  }
  return `Request failed with status ${res.status}`;
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    if (res.status === 401 && auth) {
      // Token expired or invalid on an authenticated request — force back to login.
      // (Login/register calls use auth:false, so a wrong-password error there
      // still displays normally instead of triggering this redirect.)
      clearToken();
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    throw new Error(await parseErrorMessage(res));
  }

  if (res.status === 204) return null;
  return res.json();
}

// Maps the backend's ProfileResponse into the "user" shape the rest of the
// app expects (AuthContext just stores whatever this returns).
function toUser(profile) {
  if (!profile) return null;
  return {
    fullName: profile.fullName,
    email: profile.email,
    role: profile.role,
    accountNumber: profile.accountNumber,
    accountType: profile.accountType,
    status: profile.status,
    phone: profile.phone,
    address: profile.address,
    dob: profile.dateOfBirth,
    memberSince: profile.memberSince,
  };
}

// Maps the backend's TransactionResponse into the shape Transactions.jsx /
// Dashboard.jsx expect: { id, type, description, sender, receiver, amount, date, status }
// myAccountNumber is needed because a TRANSFER record looks identical from the
// database's point of view regardless of which side you're on — only comparing
// against your own account number tells us whether it was money going out or in.
function toTransaction(t, myAccountNumber) {
  let type;
  let amount;

  if (t.transactionType === "WITHDRAW") {
    type = "Withdrawal";
    amount = -Math.abs(t.amount);
  } else if (t.transactionType === "DEPOSIT") {
    type = "Deposit";
    amount = Math.abs(t.amount);
  } else {
    // TRANSFER — direction depends on which side "you" are.
    const youAreSender = myAccountNumber && t.senderAccount === myAccountNumber;
    type = youAreSender ? "Transfer Out" : "Transfer In";
    amount = youAreSender ? -Math.abs(t.amount) : Math.abs(t.amount);
  }

  return {
    id: String(t.transactionId),
    type,
    description: t.description,
    sender: t.senderName || t.senderAccount || "—",
    receiver: t.receiverName || t.receiverAccount || "—",
    amount,
    date: t.transactionDate,
    status: "Completed",
  };
}

export async function login({ email, password }) {
  const data = await request("/auth/login", {
    method: "POST",
    body: { email, password },
    auth: false,
  });
  setToken(data.token);
  return getCurrentUser();
}

export async function register({ fullName, email, password }) {
  await request("/auth/register", {
    method: "POST",
    body: { fullName, email, password },
    auth: false,
  });
  // Registration doesn't return a token, so log in immediately after
  // to keep the same "register() logs you in" behavior the app expects.
  return login({ email, password });
}

export async function logout() {
  // Stateless JWT — nothing to invalidate server-side, just drop the token.
  clearToken();
}

export async function getCurrentUser() {
  if (!getToken()) return null;
  try {
    const profile = await request("/users/profile");
    return toUser(profile);
  } catch {
    // Token missing/expired/invalid — treat as logged out.
    clearToken();
    return null;
  }
}

export async function updateProfile(_email, updates) {
  const profile = await request("/users/profile", {
    method: "PUT",
    body: {
      fullName: updates.fullName,
      phone: updates.phone,
      address: updates.address,
      // The <input type="date"> gives "" when empty — send null instead,
      // since an empty string isn't a valid date for the backend to parse.
      dateOfBirth: updates.dob || null,
    },
  });
  return toUser(profile);
}

export async function changePassword(_email, currentPassword, newPassword) {
  await request("/users/change-password", {
    method: "POST",
    body: { currentPassword, newPassword },
  });
  return true;
}

export async function getBalance(_email) {
  const data = await request("/accounts/balance");
  return Number(data.balance);
}

export async function getTransactions(_email, accountNumber) {
  const data = await request("/transactions/history?page=0&size=100");
  return data.map((t) => toTransaction(t, accountNumber)).sort((a, b) => new Date(b.date) - new Date(a.date));
}

export async function getMiniStatement(_email, accountNumber) {
  const data = await request("/transactions/mini-statement");
  return data.map((t) => toTransaction(t, accountNumber));
}

export async function getNotifications() {
  const data = await request("/audit/history");
  return data.map((log) => ({
    action: log.action,
    message: log.description,
    date: log.actionTime,
  }));
}

export async function deposit(_email, amount, description) {
  const data = await request("/accounts/deposit", {
    method: "POST",
    body: { amount: Number(amount), description },
  });
  return {
    balance: Number(data.currentBalance),
    transaction: { amount: Number(data.depositedAmount) },
  };
}

export async function withdraw(_email, amount, description) {
  const data = await request("/transactions/withdraw", {
    method: "POST",
    body: { amount: Number(amount), description },
  });
  return { transaction: toTransaction(data) };
}

export async function transfer(_email, receiverAccountNumber, amount, description, password) {
  const data = await request("/transactions/transfer", {
    method: "POST",
    body: { receiverAccountNumber, amount: Number(amount), description, password },
  });
  return { transaction: toTransaction(data) };
}
