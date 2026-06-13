# IDSee Handover

> Oorspronkelijk opgesteld 1 december 2024 · laatst herzien 13 juni 2026
> Beknopte, altijd-actuele status: `.claude/handover.md` en `docs/INDEX.md`

## Wat is er gebouwd

### Backend (Node.js/Express)
- Complete REST API op `http://localhost:8006`
- SQLite database met Prisma ORM
- JWT authenticatie met role-based access
- Demo mode voor blockchain (echte Cardano later)

### Frontend (React/Vite)
- Webapp op `http://localhost:5173`
- Role-specifieke interfaces (Koper, Fokker, Dierenarts, Chipper, Admin)
- Geen wallet connectie nodig - blockchain onder de motorkap

### Verificatie Systeem (NIEUW)
1. **Email verificatie** - bevestig email adres
2. **Peer verificatie** - professionals verifiëren elkaar met credits als borg
3. **Dubbele bevestiging** - fokker moet registratie van dierenarts/chipper bevestigen

## Waar gebleven

### Klaar
- [x] Database schema met verificatie velden
- [x] API routes voor email/peer verificatie
- [x] API routes voor dubbele bevestiging
- [x] Documentatie (VERIFICATION.md)
- [x] Role-specifieke Header en Dashboard

### Klaar (vervolg — 13 juni 2026)
- [x] Frontend pagina's voor verificatie flow (`Verification.tsx`)
- [x] Frontend pagina's voor bevestigingen (fokker — `Confirmations.tsx`)
- [x] Animal-detailpagina (`AnimalDetail.tsx`, `/animals/:id`)

### Nog te doen
- [ ] Notificatie systeem (email/in-app)
- [ ] Mollie betalingen activeren
- [ ] Geautomatiseerde tests (Jest/Vitest)
- [ ] Testen met echte gebruikers
- [ ] Cardano testnet integratie

## Test Accounts

| Email | Wachtwoord | Rol |
|-------|------------|-----|
| admin@idsee.nl | admin123 | Admin |
| fokker@test.nl | fokker123 | Fokker |
| vet@test.nl | dierenarts123 | Dierenarts |
| chipper@test.nl | chipper123 | Chipper |

## Starten

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

Database resetten:
```bash
cd backend
npx prisma db push --force-reset
npx prisma db seed
```

## API Endpoints (nieuw)

### Verificatie
- `POST /verification/email/send` - Stuur verificatie email
- `POST /verification/email/verify` - Bevestig met token
- `POST /verification/request` - Dien verificatie aanvraag in
- `GET /verification/requests` - Bekijk openstaande aanvragen
- `POST /verification/peer/:id` - Verifieer collega (10 credits borg)
- `POST /verification/release-bond/:id` - Vrijgeven borg na 30 dagen

### Bevestigingen
- `GET /confirmations/pending` - Wachtende registraties (fokker)
- `POST /confirmations/:id/confirm` - Bevestig registratie
- `POST /confirmations/:id/reject` - Wijs af met reden
- `GET /confirmations/history` - Bevestigingsgeschiedenis

## Belangrijke bestanden

```
backend/
  prisma/schema.prisma     # Database model
  src/routes/verification.ts  # Verificatie endpoints
  src/routes/confirmations.ts # Bevestiging endpoints

frontend/
  src/components/layout/Header.tsx  # Role-specifieke navigatie
  src/pages/Dashboard.tsx           # Role-specifieke dashboard

docs/
  VERIFICATION.md          # Verificatie systeem uitleg
  DEVELOPMENT.md           # Development fasen
```

## Volgende stappen

1. **Frontend verificatie pages** - Pagina waar professionals hun verificatie aanvraag kunnen doen en waar geverifieerde professionals anderen kunnen verifiëren

2. **Frontend bevestiging pages** - Pagina voor fokkers om registraties te bevestigen/afwijzen

3. **Notificaties** - Email of in-app notificaties wanneer er een actie nodig is

4. **Styling** - CSS verbeteren voor mobiel

## Notities

- Blockchain draait in demo mode - transacties zijn gesimuleerd
- Email versturen is nog niet geïmplementeerd (token wordt gelogd in console)
- Peer verificatie borg is 10 credits, vast voor 30 dagen
- Alle professionals moeten UBN/Diergeneeskunderegister nummer opgeven
