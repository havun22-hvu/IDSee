---
title: Midnight Integratie Plan — IDSee
type: plan
scope: idsee
last_check: 2026-05-30
---

# Midnight Integratie Plan

## Doel

Anonieme verificatie van fokkers, dierenartsen en chippers via Midnight ZK-proofs. Eindgebruikers merken niets van blockchain — de backend handelt alles af.

## Fasering

### Fase 0: Leren (nu — via Midnight Academy)

- [ ] Academy cursus doorlopen: https://academy.midnight.network/courses
  - Phase 1: Blockchain Fundamentals + ZK basics
  - Phase 2: Zero-Knowledge Proofs (Scholar Certificate)
  - Phase 3: ZK DApp Development (Builder Certificate)
- [ ] Midnight toolchain installeren (Lace wallet, Compact compiler, Docker)
- [ ] Hello World DApp draaien op Devnet

### Fase 1: Fundament (Compact contracts + Merkle registry)

- [ ] Certified Registry Merkle tree opzetten (fokkers, dierenartsen, chippers)
- [ ] `ProfessionalCertifiedProof` circuit schrijven in Compact
- [ ] Testen op lokale Devnet
- [ ] Deployment op Midnight Testnet

**Milestone:** Backend kan bewijzen "professional X is gecertificeerd" zonder identiteit te onthullen.

### Fase 2: IDSee Backend Integratie

- [ ] Midnight.js integreren in Node.js/Express backend
- [ ] Proof provider configureren (HTTP proof server)
- [ ] Registry updates: als NVWA/BIG-register wijzigt → Merkle root update
- [ ] Nullifier management: zorg dat proofs niet hergebruikt worden
- [ ] `POST /api/verify/professional` endpoint (returnt bool, geen identiteit)

### Fase 3: Circuits uitbreiden

- [ ] `AnimalOriginProof` — dier van erkende fokker?
- [ ] `HealthRecordProof` — vaccinatie/gezondheidsrecord aanwezig?
- [ ] Selective disclosure: welke claims te onthullen is configureerbaar

### Fase 4: Mainnet

- [ ] Audit van Compact contracts (veiligheid)
- [ ] DUST tokens regelen (transactiekosten — backend absorbeert, users betalen in credits)
- [ ] Deployment op Midnight Mainnet (Kolu-fase actief per Q1 2026 ✅)
- [ ] Monitoring via Midnight Indexer API (GraphQL)
- [ ] Mahalu (Q2 2026): Cardano SPO's valideren blokken → stabielere omgeving
- [ ] Ua (Q3 2026): Trustless bridge + volledige decentralisatie

## Technische Stack Toevoeging

```
Huidig:
  Backend (Node.js) → PostgreSQL + Cardano

Na Midnight:
  Backend (Node.js) → PostgreSQL + Cardano
                    ↓
              Midnight.js SDK
                    ↓
         Compact Proof Provider (HTTP)
                    ↓
         Midnight Blockchain (ZK-proofs)
```

## Architect Aanpassingen

### 1. Merkle Registry Service

```typescript
// Nieuwe service: registry.service.ts
class CertifiedRegistryService {
  // Bouwt Merkle tree van alle erkende professionals
  async buildRegistry(): Promise<MerkleTree>
  
  // Genereert Merkle path voor een specifieke professional
  async getMerklePath(professionalId: string): Promise<MerklePath>
  
  // Update root on-chain als registry wijzigt
  async updateRegistryRoot(newRoot: Field): Promise<TxHash>
}
```

### 2. Proof Generation Service

```typescript
// Nieuwe service: proof.service.ts
class ProofService {
  // Genereert ZK-proof voor professional
  async proveCertification(userId: string): Promise<ProofResult>
  
  // Verifieert een bestaande proof
  async verifyProof(proofHash: string): Promise<boolean>
}
```

### 3. Database Uitbreiding

```sql
-- Nieuwe tabel voor ZK proof tracking
zk_proofs
├── id (UUID)
├── user_id (FK → users)
├── proof_type (professional_certified | animal_origin | health_record)
├── nullifier_hash (voorkomt hergebruik, publiek veilig)
├── tx_hash (Midnight blockchain)
├── verified_at
└── expires_at
```

## Privacy Model

```
Fokker/Dierenarts/Chipper registreert zich:
  1. Vult formulier in (naam, ID, certificaat) → backend
  2. Backend versleutelt + slaat op in DB
  3. Backend genereert Midnight ZK-proof server-side
  4. Proof on-chain: "professional [hash] is gecertificeerd"
  5. Naam/ID nooit on-chain, nooit uitleesbaar

Koper verifieert:
  1. Voert chipnummer in
  2. Backend zoekt aan welke professional het dier gekoppeld is
  3. Backend verifieert ZK-proof on-chain
  4. Response: "✓ Afkomstig van erkende fokker" — meer niet
```

## Kosten Inschatting

- **DUST tokens**: Transactiekosten op Midnight (klein, exact bedrag TBD na testnet)
- **Proof server**: Kan als HTTP service draaien naast backend (of via Midnight.js ingebouwd)
- **Devnet**: Gratis, voor development
- **Testnet**: Gratis test tokens via Faucet
- **Mainnet**: DUST + NIGHT (governance) — exact pricing na mainnet launch

## Risico's

| Risico | Impact | Mitigatie |
|--------|--------|-----------|
| Midnight nog in ontwikkeling | Hoog | Start op Testnet, monitor releases |
| Cross-contract interactie ontbreekt | Medium | Circuits zelfstandig ontwerpen |
| Compact taal leercurve | Laag | Academy + MCP server voor AI-hulp |
| DUST kosten onbekend | Laag | Backend absorbeert kosten (credits systeem) |

## Nuttige Resources

- Academy: https://academy.midnight.network (gratis, 3 certificaten)
- Midnight MCP: https://docs.midnight.network/ai-integration (voor Claude)
- GitHub repos: https://github.com/midnightntwrk
- Awesome DApps: https://github.com/midnightntwrk/midnight-awesome-dapps
- Testnet Faucet: via Discord
