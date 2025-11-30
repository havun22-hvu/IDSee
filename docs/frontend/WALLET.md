# Wallet Integratie

## Ondersteunde Wallets

| Wallet | Status | API |
|--------|--------|-----|
| Nami | ✅ Ondersteund | `window.cardano.nami` |
| Eternl | ✅ Ondersteund | `window.cardano.eternl` |
| Lace | ✅ Ondersteund | `window.cardano.lace` |
| Flint | ⏳ Gepland | `window.cardano.flint` |

---

## Lucid Setup

```typescript
import { Lucid, Blockfrost } from "@lucid-evolution/lucid";

const lucid = await Lucid.new(
  new Blockfrost(
    "https://cardano-preview.blockfrost.io/api/v0",
    import.meta.env.VITE_BLOCKFROST_KEY
  ),
  "Preview"
);
```

---

## Wallet Connectie

### Detectie

```typescript
// Check welke wallets beschikbaar zijn
const availableWallets = [];

if (window.cardano?.nami) availableWallets.push("nami");
if (window.cardano?.eternl) availableWallets.push("eternl");
if (window.cardano?.lace) availableWallets.push("lace");
```

### Verbinden

```typescript
async function connectWallet(walletName: string) {
  const api = await window.cardano[walletName].enable();
  lucid.selectWallet(api);

  const address = await lucid.wallet.address();
  return address;
}
```

### Adres Ophalen

```typescript
const address = await lucid.wallet.address();
// addr_test1qz...
```

### Balans Ophalen

```typescript
const utxos = await lucid.wallet.getUtxos();
const balance = utxos.reduce(
  (sum, utxo) => sum + utxo.assets.lovelace,
  0n
);
// Balance in lovelace (1 ADA = 1,000,000 lovelace)
```

---

## Transacties

### Basis Transactie

```typescript
const tx = await lucid
  .newTx()
  .payToAddress(recipientAddress, { lovelace: 5000000n })
  .complete();

const signedTx = await tx.sign().complete();
const txHash = await signedTx.submit();
```

### Contract Interactie

```typescript
import registryValidator from "../contracts/build/registry.json";

const tx = await lucid
  .newTx()
  .collectFrom([registryUtxo], redeemer)
  .attachSpendingValidator(registryValidator)
  .payToContract(contractAddress, { inline: newDatum }, assets)
  .addSigner(await lucid.wallet.address())
  .complete();
```

---

## Error Handling

```typescript
try {
  await connectWallet("nami");
} catch (error) {
  if (error.code === 1) {
    // User rejected
    console.log("Gebruiker weigerde verbinding");
  } else if (error.code === 2) {
    // Wallet not found
    console.log("Wallet niet geïnstalleerd");
  }
}
```

---

## React Hook Voorbeeld

```typescript
// hooks/useWallet.ts
import { useState, useEffect } from "react";
import { Lucid } from "@lucid-evolution/lucid";

export function useWallet() {
  const [lucid, setLucid] = useState<Lucid | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  async function connect(walletName: string) {
    const api = await window.cardano[walletName].enable();
    const instance = await Lucid.new(/* config */);
    instance.selectWallet(api);

    setLucid(instance);
    setAddress(await instance.wallet.address());
    setConnected(true);
  }

  function disconnect() {
    setLucid(null);
    setAddress(null);
    setConnected(false);
  }

  return { lucid, address, connected, connect, disconnect };
}
```

---

## Testnet ADA

Voor testen op Preview/Preprod netwerk:

1. **Preview Faucet**: https://docs.cardano.org/cardano-testnets/tools/faucet
2. Voer je testnet adres in
3. Ontvang test ADA

---

## Beveiligingstips

1. **Valideer altijd** transactiedetails voor ondertekening
2. **Toon duidelijk** wat gebruiker ondertekent
3. **Gebruik testnet** voor ontwikkeling
4. **Bewaar nooit** seed phrases in code
