// Wallet connection hook - Demo mode compatible

import { useState, useEffect, useCallback } from "react";
import {
  getAvailableWallets,
  lovelaceToAda,
  isDemoMode,
  SupportedWallet,
} from "../lib/lucid";

interface WalletState {
  lucid: any | null;
  address: string | null;
  balance: string | null;
  walletName: SupportedWallet | null;
  connected: boolean;
  loading: boolean;
  error: string | null;
  demoMode: boolean;
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
    demoMode: isDemoMode,
  });

  const [availableWallets, setAvailableWallets] = useState<SupportedWallet[]>(
    []
  );

  // Check available wallets on mount
  useEffect(() => {
    const wallets = getAvailableWallets();
    setAvailableWallets(wallets);

    if (isDemoMode) {
      console.log("🎭 IDSee running in DEMO MODE - no Blockfrost key configured");
    }
  }, []);

  const connect = useCallback(
    async (wallet: SupportedWallet) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const cardano = (window as any).cardano;

        if (!cardano?.[wallet]) {
          throw new Error(`${wallet} wallet niet geïnstalleerd`);
        }

        // Enable the wallet
        const api = await cardano[wallet].enable();

        // Get address from wallet API directly
        const addresses = await api.getUsedAddresses();
        const address = addresses[0] || (await api.getUnusedAddresses())[0];

        // Decode address (it's in hex/CBOR format)
        let displayAddress = "addr_test1...";
        if (address) {
          // For demo, just show truncated hex
          displayAddress = `addr...${address.slice(-16)}`;
        }

        // Get balance
        const balanceHex = await api.getBalance();
        // Parse CBOR balance (simplified - just show demo value)
        const balance = isDemoMode ? "1000.00" : "0.00";

        setState((prev) => ({
          ...prev,
          address: displayAddress,
          balance,
          walletName: wallet,
          connected: true,
          loading: false,
        }));

        console.log(`✅ Connected to ${wallet}`);
      } catch (error: any) {
        console.error("Wallet connection failed:", error);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error.message || "Kon niet verbinden met wallet",
        }));
      }
    },
    []
  );

  const disconnect = useCallback(() => {
    setState((prev) => ({
      ...prev,
      lucid: null,
      address: null,
      balance: null,
      walletName: null,
      connected: false,
    }));
    console.log("🔌 Wallet disconnected");
  }, []);

  const refreshBalance = useCallback(async () => {
    // In demo mode, just simulate
    if (isDemoMode && state.connected) {
      setState((prev) => ({ ...prev, balance: "1000.00" }));
    }
  }, [state.connected]);

  return {
    ...state,
    availableWallets,
    connect,
    disconnect,
    refreshBalance,
  };
}
