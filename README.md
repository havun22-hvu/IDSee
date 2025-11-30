# IDSee - Decentralized Pet Origin Verification

Privacy-preserving DApp on Cardano/Midnight for verifying the legitimate origin of puppies and pets.

## Problem

Puppy mills and illegal breeders sell dogs without proper documentation. Buyers have no way to verify:
- If a puppy was bred by a certified breeder
- If the mother is registered and chipped
- If a licensed veterinarian/chipper performed the registration
- Health history of the animal

## Solution

IDSee uses Zero-Knowledge proofs to verify pet origins **without exposing sensitive data**:

- **Prove** a puppy is from a certified breeder without revealing breeder identity
- **Verify** chip registration was done by licensed professionals
- **Share** health records selectively with buyers/insurers

## Entities

| Entity | Identifier | Verified by |
|--------|-----------|-------------|
| Puppy | Chip number | Vet/Chipper |
| Mother | Chip number | Linked to puppy |
| Breeder | Registration ID | Kennel Club/Chamber |
| Veterinarian | BIG number | Government |
| Chipper | Certificate | NVWA |

## Tech Stack

- **Smart Contracts**: Aiken (Cardano)
- **Privacy Layer**: Midnight SDK (ZK proofs)
- **Frontend**: TypeScript + React
- **Blockchain Interaction**: Lucid

## Project Structure

```
idsee/
├── contracts/          # Aiken smart contracts
│   ├── validators/     # On-chain validators
│   └── lib/           # Shared types and functions
├── frontend/          # React TypeScript app
│   └── src/
│       ├── components/
│       ├── hooks/
│       └── types/
└── docs/              # Documentation
```

## Getting Started

### Prerequisites

1. **Aiken** - Smart contract language for Cardano
   ```bash
   # Install via cargo
   cargo install aiken --version 1.0.29-alpha
   ```

2. **Node.js** (v18+) and npm

3. **Cardano Wallet** (Nami, Eternl, or similar)

### Installation

```bash
# Clone repository
git clone https://github.com/your-username/idsee.git
cd idsee

# Build contracts
cd contracts
aiken build

# Install frontend dependencies
cd ../frontend
npm install
npm run dev
```

## License

MIT
