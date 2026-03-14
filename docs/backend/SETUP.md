# Backend Setup

## Tech Stack

- **Runtime**: Node.js v18+
- **Framework**: Express.js of Fastify
- **Database**: PostgreSQL + Prisma ORM
- **Blockchain**: Lucid (server-side)
- **Auth**: JWT + bcrypt
- **Payments**: Mollie (iDEAL, creditcard)

---

## Installatie

```bash
cd backend
npm install
```

## Environment Variables

Maak `.env`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/idsee"

# JWT
JWT_SECRET="your-secret-key-min-32-chars"
JWT_EXPIRES_IN="7d"

# Cardano
CARDANO_NETWORK="Preview"
BLOCKFROST_KEY="your_blockfrost_key"
WALLET_SEED="your 24 word seed phrase here"

# Payments
MOLLIE_API_KEY="your_mollie_key"

# Server
PORT=8006
NODE_ENV="development"
```

**Let op:** `WALLET_SEED` is extreem gevoelig. Gebruik in productie een HSM of vault.

---

## Database Setup

```bash
# Prisma migraties
npx prisma migrate dev

# Seed data (optioneel)
npx prisma db seed
```

---

## Development

```bash
npm run dev
```

Server draait op http://localhost:8006

---

## Projectstructuur

```
backend/
├── src/
│   ├── index.ts              # Entry point
│   ├── routes/
│   │   ├── auth.ts           # POST /auth/login, /auth/register
│   │   ├── animals.ts        # CRUD dieren
│   │   ├── verify.ts         # GET /verify/:chipId
│   │   ├── credits.ts        # Credits beheer
│   │   └── admin.ts          # Admin endpoints
│   ├── services/
│   │   ├── blockchain.ts     # Lucid wrapper
│   │   ├── payment.ts        # Mollie integratie
│   │   └── hash.ts           # SHA256 hashing
│   ├── middleware/
│   │   ├── auth.ts           # JWT verificatie
│   │   ├── credits.ts        # Credits check
│   │   └── rateLimit.ts      # Rate limiting
│   └── types/
│       └── index.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── tests/
├── package.json
└── tsconfig.json
```

---

## API Endpoints

### Auth
| Method | Endpoint | Beschrijving |
|--------|----------|--------------|
| POST | `/auth/register` | Account aanmaken |
| POST | `/auth/login` | Inloggen, JWT ontvangen |
| POST | `/auth/refresh` | Token vernieuwen |
| GET | `/auth/me` | Huidige gebruiker |

### Dieren
| Method | Endpoint | Auth | Credits |
|--------|----------|------|---------|
| POST | `/animals` | Ja | 1 |
| GET | `/animals` | Ja | 0 |
| GET | `/animals/:id` | Ja | 0 |

### Verificatie
| Method | Endpoint | Auth | Credits |
|--------|----------|------|---------|
| GET | `/verify/:chipId` | Nee | 0 |

### Credits
| Method | Endpoint | Beschrijving |
|--------|----------|--------------|
| GET | `/credits` | Huidige balans |
| POST | `/credits/purchase` | Aankoop starten |
| POST | `/credits/webhook` | Mollie webhook |

---

## Blockchain Service

```typescript
// services/blockchain.ts
import { Blockfrost, Lucid } from "@lucid-evolution/lucid";

let lucid: Lucid;

export async function initBlockchain() {
  lucid = await Lucid.new(
    new Blockfrost(
      "https://cardano-preview.blockfrost.io/api/v0",
      process.env.BLOCKFROST_KEY
    ),
    "Preview"
  );

  // Laad server wallet vanuit seed
  lucid.selectWalletFromSeed(process.env.WALLET_SEED!);
}

export async function registerOnChain(dataHash: string): Promise<string> {
  const tx = await lucid
    .newTx()
    .payToContract(contractAddress, { inline: datumFromHash(dataHash) }, {})
    .complete();

  const signed = await tx.sign().complete();
  const txHash = await signed.submit();

  return txHash;
}

export async function verifyOnChain(chipIdHash: string): Promise<boolean> {
  // Query blockchain voor registratie
  const utxos = await lucid.utxosAt(contractAddress);
  return utxos.some(utxo => extractHash(utxo.datum) === chipIdHash);
}
```

---

## Scripts

| Command | Beschrijving |
|---------|--------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Start production |
| `npm run test` | Run tests |
| `npm run migrate` | Database migraties |

---

## Deployment

### Railway / Render

1. Connect GitHub repo
2. Set environment variables
3. Deploy

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
COPY prisma ./prisma
RUN npx prisma generate
CMD ["node", "dist/index.js"]
```

---

## Security Checklist

- [ ] WALLET_SEED in secure vault (niet in .env op server)
- [ ] Rate limiting op alle endpoints
- [ ] CORS correct geconfigureerd
- [ ] Helmet.js voor HTTP headers
- [ ] Input validatie (zod/joi)
- [ ] SQL injection preventie (Prisma doet dit)
- [ ] HTTPS only in productie
