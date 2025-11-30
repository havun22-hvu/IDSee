# Changelog

Alle belangrijke wijzigingen aan IDSee worden hier gedocumenteerd.

## [0.2.0] - 2024-11-30

### Toegevoegd
- **Contracts uitgebreid:**
  - `validation.ak` - Validatie helpers en regels
  - `health.ak` - Health records validator
  - `verification.ak` - Verificatie logica voor afkomst

- **Frontend volledig opgezet:**
  - React componenten (WalletConnect, VerifyAnimal)
  - Custom hooks (useWallet, useVerification)
  - Lucid integratie voor Cardano
  - TypeScript types matching Aiken contracts

### Gewijzigd
- App.tsx herschreven met component-gebaseerde architectuur
- Verbeterde chip ID formattering (XXX-XXXX-XXXX-XXXX)

### Volgende stappen
- [ ] Aiken contracts compileren en testen op Preview testnet
- [ ] On-chain verificatie implementeren
- [ ] Registratie flow voor fokkers/dierenartsen
- [ ] Midnight ZK integratie onderzoeken

---

## [0.1.0] - 2024-11-30

### Toegevoegd
- Initiële projectstructuur aangemaakt
- Aiken smart contract basis met types en registry validator
- Documentatie structuur opgezet
- Frontend package.json met Lucid dependency

### Datastructuren gedefinieerd
- `Animal` - Geregistreerd dier met chip ID
- `Breeder` - Erkende fokker
- `CertifiedProfessional` - Dierenarts/Chipper
- `HealthRecord` - Gezondheidsgegevens
