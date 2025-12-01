# IDSee Development Werkplan

## Ontwikkel Fases

### Fase 1: Lokaal Development (HUIDIG)
**Mode:** Demo mode - blockchain gesimuleerd

**Wat werkt:**
- Volledige frontend + backend
- Login, registratie, credits
- Dieren registreren en verifiëren
- Alles opgeslagen in lokale database
- Blockchain transacties worden gesimuleerd

**Voordelen:**
- Snel ontwikkelen, geen wachttijden
- Geen externe dependencies
- Gratis

**Setup:**
```bash
# Backend
cd backend
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

---

### Fase 2: Preview Testnet
**Mode:** Echte blockchain, fake ADA

**Wanneer:** Als alle features af zijn en je blockchain wilt testen

**Wat verandert:**
- Transacties gaan echt naar Cardano Preview
- Wachttijd voor confirmatie (~20 sec)
- Alles nog steeds gratis (test ADA)

**Setup:**
1. Blockfrost account: https://blockfrost.io
2. Maak project voor Preview network
3. Genereer server wallet (24 woorden)
4. Vraag test ADA aan via faucet

**Backend `.env`:**
```env
CARDANO_NETWORK=Preview
BLOCKFROST_KEY=previewXXXXXXXXXXXXXXX
WALLET_SEED=24 woorden hier
```

---

### Fase 3: Preprod Testnet
**Mode:** Staging omgeving

**Wanneer:** Laatste test voor productie

**Wat verandert:**
- Andere Blockfrost key (Preprod)
- Nieuwe wallet voor staging
- Test met echte gebruikers (beta)

---

### Fase 4: Mainnet (Productie)
**Mode:** Live met echte ADA

**Wanneer:** Klaar voor lancering

**Kosten:**
- ~0.2-0.5 ADA per transactie (~€0.20-0.50)
- Server wallet moet ADA bevatten
- Gebruikers betalen via credits (EUR), niet ADA

**Setup:**
```env
CARDANO_NETWORK=Mainnet
BLOCKFROST_KEY=mainnetXXXXXXXXXXXXXXX
WALLET_SEED=andere 24 woorden (VEILIG BEWAREN!)
```

---

## Cardano Netwerken Overzicht

| Netwerk | ADA | Kosten | Blockfrost URL |
|---------|-----|--------|----------------|
| Preview | Fake | Gratis | cardano-preview.blockfrost.io |
| Preprod | Fake | Gratis | cardano-preprod.blockfrost.io |
| Mainnet | Echt | ~€0.20/tx | cardano-mainnet.blockfrost.io |

## Test ADA Faucet

https://docs.cardano.org/cardano-testnets/tools/faucet

- Selecteer Preview of Preprod
- Voer wallet address in
- Ontvang 10.000 test ADA (gratis, onbeperkt)

---

## Huidige Status

- [x] Backend structuur
- [x] Frontend structuur
- [x] Database schema
- [x] Auth systeem
- [x] Credits systeem
- [x] Demo mode blockchain service
- [ ] Smart contracts deployen
- [ ] Echte blockchain integratie testen
- [ ] Mollie betalingen
- [ ] Email notificaties
- [ ] Productie deployment

---

## Volgende Stappen (Fase 1)

1. ✅ Backend + Frontend basis
2. 🔲 Features compleet maken
3. 🔲 UI/UX verbeteren
4. 🔲 Testen in browser
5. 🔲 Bugs fixen
6. 🔲 → Door naar Fase 2
