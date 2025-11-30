// Wallet connection hook

import { useState, useEffect, useCallback } from "react";
import { Lucid } from "@lucid-evolution/lucid";
import {
  initLucid,
  connectWallet,
  getAvailableWallets,
  getWalletBalance,
  lovelaceToAda,
  SupportedWallet,
} from "../lib/lucid";

interface WalletState {
  lucid: Lucid | null;
  address: string | null;
  balance: string | null;
  walletName: SupportedWallet | null;
  connected: boolean;
  loading: boolean;
  error: string | null;
}

interface UseWalletReturn extends WalletState {
  availableWallets: SupportedWallet[];
  connect: (wallet: SupportedWallet) => Promise<void>;
  disconnect: () => void;
  refreshBalance: () => Promise<void>;
}

export function useWallet(): UseWalletReturn {
  const [state, setState] = useState<WalletState>({
    lucid: null,
    address: null,
    balance: null,
    walletName: null,
    connected: false,
    loading: false,
    error: null,
  });

  const [availableWallets, setAvailableWallets] = useState<SupportedWallet[]>(
    []
  );

  // Check available wallets on mount
  useEffect(() => {
    const wallets = getAvailableWallets();
    setAvailableWallets(wallets);
  }, []);

  // Initialize Lucid
  useEffect(() => {
    async function init() {
      try {
        const lucid = await initLucid();
        setState((prev) => ({ ...prev, lucid }));
      } catch (error) {
        console.error("Failed to initialize Lucid:", error);
        setState((prev) => ({
          ...prev,
          error: "Failed to initialize blockchain connection",
        }));
      }
    }
    init();
  }, []);

  const connect = useCallback(
    async (wallet: SupportedWallet) => {
      if (!state.lucid) {
        setState((prev) => ({ ...prev, error: "Lucid not initialized" }));
        return;
      }

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const address = await connectWallet(state.lucid, wallet);
        const balanceLovelace = await getWalletBalance(state.lucid);
        const balance = lovelaceToAda(balanceLovelace);

        setState((prev) => ({
          ...prev,
          address,
          balance,
          walletName: wallet,
          connected: true,
          loading: false,
        }));
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error.message || "Failed to connect wallet",
        }));
      }
    },
    [state.lucid]
  );

  const disconnect = useCallback(() => {
    setState((prev) => ({
      ...prev,
      address: null,
      balance: null,
      walletName: null,
      connected: false,
    }));
  }, []);

  const refreshBalance = useCallback(async () => {
    if (!state.lucid || !state.connected) return;

    try {
      const balanceLovelace = await getWalletBalance(state.lucid);
      const balance = lovelaceToAda(balanceLovelace);
      setState((prev) => ({ ...prev, balance }));
    } catch (error) {
      console.error("Failed to refresh balance:", error);
    }
  }, [state.lucid, state.connected]);

  return {
    ...state,
    availableWallets,
    connect,
    disconnect,
    refreshBalance,
  };
}
