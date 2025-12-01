// Lucid configuration and helpers

export type SupportedWallet = "nami" | "eternl" | "lace";

// Check if we're in demo mode (no Blockfrost key)
export const isDemoMode = !import.meta.env.VITE_BLOCKFROST_KEY;

export function getAvailableWallets(): SupportedWallet[] {
  const wallets: SupportedWallet[] = [];
  const cardano = (window as any).cardano;

  if (cardano?.nami) wallets.push("nami");
  if (cardano?.eternl) wallets.push("eternl");
  if (cardano?.lace) wallets.push("lace");

  return wallets;
}

export function lovelaceToAda(lovelace: bigint): string {
  return (Number(lovelace) / 1_000_000).toFixed(2);
}

export function adaToLovelace(ada: number): bigint {
  return BigInt(Math.floor(ada * 1_000_000));
}

// For future use when Blockfrost key is available
export async function initLucidWithBlockfrost() {
  const { Blockfrost, Lucid } = await import("@lucid-evolution/lucid");

  const blockfrostKey = import.meta.env.VITE_BLOCKFROST_KEY;
  const network = import.meta.env.VITE_NETWORK || "Preview";

  const blockfrostUrl =
    network === "Mainnet"
      ? "https://cardano-mainnet.blockfrost.io/api/v0"
      : network === "Preprod"
        ? "https://cardano-preprod.blockfrost.io/api/v0"
        : "https://cardano-preview.blockfrost.io/api/v0";

  const lucid = await Lucid(
    new Blockfrost(blockfrostUrl, blockfrostKey),
    network
  );

  return lucid;
}
