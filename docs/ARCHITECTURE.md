# IDSee Architecture

## Overview

IDSee is a privacy-preserving verification system for pet origins, built on Cardano with future Midnight integration for Zero-Knowledge proofs.

## Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Breeder   │────▶│  Inspector  │────▶│  Registry   │
│  (fokker)   │     │  (keuring)  │     │  (on-chain) │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
┌─────────────┐     ┌─────────────┐            │
│    Puppy    │────▶│ Vet/Chipper │────────────┘
│   (pup)     │     │ (registr.)  │
└─────────────┘     └─────────────┘
                                               │
┌─────────────┐                                ▼
│   Buyer/    │◀───────────────────────┌─────────────┐
│  Insurance  │   Verify (ZK proof)    │   IDSee     │
└─────────────┘                        │   DApp      │
                                       └─────────────┘
```

## On-Chain Data (Public but Hashed)

| Data | Stored As | Why |
|------|-----------|-----|
| Chip ID | Hash | Prevent tracking |
| Breeder ID | Hash | Privacy |
| Professional ID | Hash | Privacy |
| Timestamps | Plain | Needed for validation |
| Status | Plain | Needed for validation |

## Off-Chain Data (Private)

| Data | Storage | Access |
|------|---------|--------|
| Breeder details | Encrypted IPFS | Owner only |
| Health records | Encrypted IPFS | Vet + Owner |
| Personal info | Local wallet | Never shared |

## Verification Flow (ZK)

```
1. Buyer requests: "Is this puppy from certified breeder?"

2. IDSee creates ZK proof:
   - INPUT (private): breeder_id, chip_id, registration
   - OUTPUT (public): TRUE/FALSE

3. Buyer receives: TRUE (no other data exposed)
```

## Smart Contract Architecture

### Registry Contract
- Manages all registrations
- Validates professional credentials
- Links animals to breeders

### Verification Contract (Future - Midnight)
- ZK circuit for origin verification
- ZK circuit for health record existence
- Privacy-preserving queries

## Token Model (Optional Future)

| Token | Purpose |
|-------|---------|
| IDSEE | Governance |
| REG | Registration fee payment |
| CERT | Professional certification NFT |

## Security Considerations

1. **Multi-sig admin** - No single point of failure
2. **Time-locked upgrades** - Community can review changes
3. **Professional verification** - Real-world identity check required
4. **Chip ID protection** - Never stored in plain text
