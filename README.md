# IDSee - Pet Origin Verification

Privacy-preserving webapp for verifying the legitimate origin of puppies and pets. Blockchain-backed, but invisible to users.

## Problem

Puppy mills and illegal breeders sell dogs without proper documentation. Buyers have no way to verify:
- If a puppy was bred by a certified breeder
- If the mother is registered and chipped
- If a licensed veterinarian/chipper performed the registration

## Solution

IDSee provides a simple webapp where:
- **Buyers** verify a puppy's origin by entering a chip number (free, no account needed)
- **Professionals** (breeders, vets, chippers) register animals using credits
- **Blockchain** provides immutable proof (invisible to users)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + TypeScript + Vite |
| Backend | Node.js + Express + Prisma |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Blockchain | Cardano (demo mode, Lucid later) |
| Payments | Mollie (iDEAL, creditcard) |

## Project Structure

```
idsee/
├── frontend/          # React webapp (mobile-first)
├── backend/           # Node.js API server
│   ├── src/
│   │   ├── routes/    # API endpoints
│   │   ├── services/  # Blockchain, payments
│   │   └── middleware/# Auth, credits
│   └── prisma/        # Database schema
├── contracts/         # Aiken smart contracts
└── docs/              # Documentation
```

## Getting Started

### Prerequisites

- Node.js v18+
- (Optional) Blockfrost API key for blockchain

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env

# Setup database (SQLite - no PostgreSQL needed)
npx prisma db push
npx prisma db seed

# Start server
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## User Roles

| Role | Access | Payment |
|------|--------|---------|
| Buyer | Verify animals | Free |
| Breeder | Register nests, puppies | Credits |
| Vet | Health records, chips | Credits |
| Chipper | Chip registrations | Credits |
| Admin | User management | N/A |

## API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/verify/:chipId` | GET | No | Verify animal origin |
| `/auth/login` | POST | No | Login |
| `/auth/register` | POST | No | Create account |
| `/animals` | GET/POST | Yes | Manage animals |
| `/credits` | GET | Yes | Check balance |
| `/credits/purchase` | POST | Yes | Buy credits |

## Demo Mode

Without Blockfrost credentials, the backend runs in demo mode:
- Blockchain calls are simulated
- All verifications return mock data
- Perfect for development/testing

## Helper Scripts

```bash
# Backend
npm run wallet:generate    # Genereer nieuwe wallet seed
npx tsx scripts/test-api.ts  # Test alle API endpoints

# Database
npm run db:studio          # Open Prisma Studio (database UI)
npm run db:seed            # Laad test data
```

## Test Accounts

| Email | Password | Role |
|-------|----------|------|
| admin@idsee.nl | admin123 | Admin |
| fokker@test.nl | fokker123 | Breeder |
| vet@test.nl | dierenarts123 | Vet |
| chipper@test.nl | chipper123 | Chipper |

## Documentation

- [Development Workflow](docs/DEVELOPMENT.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Verification System](docs/VERIFICATION.md)
- [Backend Setup](docs/backend/SETUP.md)
- [Frontend Setup](docs/frontend/SETUP.md)
- [Authentication](docs/frontend/AUTH.md)
- [Credits System](docs/guides/CREDITS.md)
- [Handover](HANDOVER.md)

## License

MIT
