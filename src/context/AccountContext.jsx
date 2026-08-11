import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import * as api from "../services/api";

const AccountContext = createContext(null);

export function AccountProvider({ children }) {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [bal, txns] = await Promise.all([
      api.getBalance(user.email),
      api.getTransactions(user.email, user.accountNumber),
    ]);
    setBalance(bal);
    setTransactions(txns);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) refresh();
    else {
      setBalance(0);
      setTransactions([]);
    }
  }, [user, refresh]);

  async function deposit(amount, description) {
    const result = await api.deposit(user.email, amount, description);
    await refresh();
    return result;
  }

  async function withdraw(amount, description) {
    const result = await api.withdraw(user.email, amount, description);
    await refresh();
    return result;
  }

  async function transfer(receiverAccountNumber, amount, description, password) {
    const result = await api.transfer(user.email, receiverAccountNumber, amount, description, password);
    await refresh();
    return result;
  }

  return (
    <AccountContext.Provider
      value={{ balance, transactions, loading, refresh, deposit, withdraw, transfer }}
    >
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  const ctx = useContext(AccountContext);
  if (!ctx) throw new Error("useAccount must be used within AccountProvider");
  return ctx;
}
