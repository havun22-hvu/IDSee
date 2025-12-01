# IDSee Architecture

## Overview

IDSee is een privacy-preserving verificatiesysteem voor dierherkomst. De blockchain-laag is volledig onzichtbaar voor eindgebruikers - zij werken met een normale webapp en credits.

## Architectuur Overzicht

```
┌─────────────────────────────────────────────────────────────────┐
│                        GEBRUIKERS                                │
├─────────────┬─────────────┬─────────────┬─────────────┬─────────┤
│   Koper     │   Fokker    │ Dierenarts  │   Chipper   │  Admin  │
│  (gratis)   │  (credits)  │  (credits)  │  (credits)  │         │
└──────┬──────┴──────┬──────┴──────┬──────┴──────┬──────┴────┬────┘
       │             │             │             │           │
       ▼             ▼             ▼             ▼           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React Webapp)                       │
│  • Mobile-first responsive design                                │
│  • Login systeem (email/wachtwoord)                             │
│  • Credits kopen (iDEAL, creditcard)                            │
│  • Registratie/verificatie formulieren                          │
└─────────────────────────────────┬───────────────────────────────┘
                                  │ REST API / GraphQL
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js/Express)                     │
│  • Authenticatie & autorisatie                                   │
│  • Credits beheer                                                │
│  • Professionele verificatie (BIG, NVWA)                        │
│  • Blockchain transacties (onzichtbaar voor users)              │
└───────┬─────────────────┬─────────────────┬─────────────────────┘
        │                 │                 │
        ▼                 ▼                 ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│   Database    │ │ Server Wallet │ │    Cardano    │
│  (PostgreSQL) │ │   (Lucid)     │ │  Blockchain   │
│               │ │               │ │               │
│ • Users       │ │ • Private key │ │ • Immutable   │
│ • Credits     │ │ • Transacties │ │   records     │
│ • Registraties│ │ • ADA beheer  │ │ • ZK proofs   │
└───────────────┘ └───────────────┘ └───────────────┘
```

## Gebruikersrollen

| Rol | Toegang | Betaling |
|-----|---------|----------|
| **Koper** | Alleen verificatie (lezen) | Gratis |
| **Fokker** | Registreren nesten, pups | Credits |
| **Dierenarts** | Gezondheidsrecords, chips | Credits |
| **Chipper** | Chip registraties | Credits |
| **Admin** | Beheer, professionele goedkeuring | N.v.t. |

## Data Flow

### Registratie (schrijven naar blockchain)

```
1. Dierenarts logt in op webapp
2. Vult registratieformulier in (chipnummer, dier, etc.)
3. Backend valideert data + controleert credits
4. Backend maakt blockchain transactie (server wallet)
5. Hash wordt opgeslagen on-chain
6. Bevestiging naar gebruiker
7. Credit wordt afgeschreven
```

### Verificatie (lezen van blockchain)

```
1. Koper opent webapp (geen login nodig)
2. Voert chipnummer in
3. Backend zoekt hash op blockchain
4. Retourneert verificatie status
5. Gratis, geen credits nodig
```

## Database Schema

### Users
```sql
users
├── id (UUID)
├── email
├── password_hash
├── role (koper|fokker|vet|chipper|admin)
├── professional_id (BIG nummer, KvK, etc.)
├── verified (boolean)
├── credits (integer)
└── created_at
```

### Registrations
```sql
registrations
├── id (UUID)
├── user_id (FK)
├── type (animal|health_record|chip)
├── chip_id_hash
├── data_hash
├── tx_hash (blockchain transaction)
├── status (pending|confirmed|failed)
└── created_at
```

### Credit Transactions
```sql
credit_transactions
├── id (UUID)
├── user_id (FK)
├── amount (integer, + of -)
├── type (purchase|usage|refund)
├── payment_id (Mollie/Stripe ref)
└── created_at
```

## On-Chain vs Off-Chain

| Data | Opslag | Reden |
|------|--------|-------|
| Chip ID | Hash on-chain | Privacy, maar verifieerbaar |
| Fokker ID | Hash on-chain | Privacy |
| Dierenarts ID | Hash on-chain | Privacy |
| Timestamps | Plain on-chain | Nodig voor validatie |
| Persoonlijke gegevens | Database (encrypted) | GDPR |
| Gezondheidsrecords | Database (encrypted) | Privacy + GDPR |
| Credits/betalingen | Database | Geen blockchain nodig |

## Credits Systeem

### Prijzen (voorbeeld)
| Actie | Credits |
|-------|---------|
| Pup registreren | 1 credit |
| Nest registreren | 3 credits |
| Gezondheidsrecord | 1 credit |
| Chip koppelen | 1 credit |
| Verificatie (koper) | Gratis |

### Aankoop
- iDEAL, creditcard via Mollie/Stripe
- Bundels: 10 credits = €9, 50 credits = €40
- Facturatie voor professionals

## Backend Structuur

```
backend/
├── src/
│   ├── routes/
│   │   ├── auth.ts          # Login, registratie
│   │   ├── animals.ts       # Dier registraties
│   │   ├── verify.ts        # Verificatie endpoint
│   │   ├── credits.ts       # Credits kopen/beheren
│   │   └── admin.ts         # Admin functies
│   ├── services/
│   │   ├── blockchain.ts    # Cardano/Lucid wrapper
│   │   ├── payment.ts       # Mollie/Stripe integratie
│   │   └── verification.ts  # Professionele verificatie
│   ├── middleware/
│   │   ├── auth.ts          # JWT verificatie
│   │   └── credits.ts       # Credits check
│   ├── models/              # Database models
│   └── utils/
│       └── hash.ts          # Hashing functies
├── prisma/
│   └── schema.prisma        # Database schema
└── package.json
```

## Security

1. **Server wallet** - Private key in environment variable of HSM
2. **Rate limiting** - Voorkom spam registraties
3. **Professionele verificatie** - BIG/NVWA check voor accounts
4. **Data encryptie** - Gevoelige data encrypted in database
5. **HTTPS only** - Alle communicatie encrypted
6. **JWT tokens** - Veilige sessie management

## Toekomstige Uitbreidingen

### Zero-Knowledge (Midnight)
- ZK proofs voor privacy-preserving verificatie
- Nog steeds onzichtbaar voor gebruikers
- Backend genereert proofs

### API voor derden
- Verzekeringen kunnen verifiëren
- Dierenasielen kunnen herkomst checken
- Altijd via API, nooit directe blockchain toegang

## Deployment

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Vercel    │     │  Railway/   │     │  Cardano    │
│  Frontend   │────▶│  Render     │────▶│  Preview/   │
│             │     │  Backend    │     │  Mainnet    │
└─────────────┘     └─────────────┘     └─────────────┘
                          │
                          ▼
                    ┌─────────────┐
                    │  Supabase/  │
                    │  PostgreSQL │
                    └─────────────┘
```
