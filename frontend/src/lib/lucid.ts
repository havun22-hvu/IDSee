// Lucid configuration and helpers

import { Blockfrost, Lucid, Network } from "@lucid-evolution/lucid";

export type SupportedWallet = "nami" | "eternl" | "lace";

const NETWORK: Network = (import.meta.env.VITE_NETWORK as Network) || "Preview";
const BLOCKFROST_URL =
  NETWORK === "Mainnet"
    ? "https://cardano-mainnet.blockfrost.io/api/v0"
    : NETWORK === "Preprod"
      ? "https://cardano-preprod.blockfrost.io/api/v0"
      : "https://cardano-preview.blockfrost.io/api/v0";

export async function initLucid(): Promise<Lucid> {
  const blockfrostKey = import.meta.env.VITE_BLOCKFROST_KEY;

  if (!blockfrostKey) {
    throw new Error("VITE_BLOCKFROST_KEY not set in environment");
  }

  const lucid = await Lucid.new(
    new Blockfrost(BLOCKFROST_URL, blockfrostKey),
    NETWORK
  );

  return lucid;
}

export function getAvailableWallets(): SupportedWallet[] {
  const wallets: SupportedWallet[] = [];
  const cardano = (window as any).cardano;

  if (cardano?.nami) wallets.push("nami");
  if (cardano?.eternl) wallets.push("eternl");
  if (cardano?.lace) wallets.push("lace");

  return wallets;
}

export async function connectWallet(
  lucid: Lucid,
  walletName: SupportedWallet
): Promise<string> {
  const cardano = (window as any).cardano;

  if (!cardano?.[walletName]) {
    throw new Error(`${walletName} wallet not found`);
  }

  const api = await cardano[walletName].enable();
  lucid.selectWallet.fromAPI(api);

  return await lucid.wallet().address();
}

export async function getWalletBalance(lucid: Lucid): Promise<bigint> {
  const utxos = await lucid.wallet().getUtxos();
  return utxos.reduce((sum, utxo) => sum + (utxo.assets["lovelace"] || 0n), 0n);
}

export function lovelaceToAda(lovelace: bigint): string {
  return (Number(lovelace) / 1_000_000).toFixed(2);
}

export function adaToLovelace(ada: number): bigint {
  return BigInt(Math.floor(ada * 1_000_000));
}
