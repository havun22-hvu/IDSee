# Frontend Setup

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build**: Vite
- **Routing**: React Router
- **Styling**: CSS Modules of Tailwind
- **State**: React Context (auth, credits)

---

## Installatie

```bash
cd frontend
npm install
```

## Environment Variables

Maak `.env.local`:

```env
VITE_API_URL=http://localhost:3001
```

---

## Development

```bash
npm run dev
```

Open http://localhost:5173

---

## Projectstructuur

```
frontend/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Navigation.tsx
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── verify/
│   │   │   ├── VerifyForm.tsx
│   │   │   └── VerifyResult.tsx
│   │   ├── animals/
│   │   │   ├── RegisterAnimal.tsx
│   │   │   └── AnimalList.tsx
│   │   └── credits/
│   │       ├── CreditBalance.tsx
│   │       └── PurchaseCredits.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── useCredits.ts
│   ├── lib/
│   │   └── api.ts
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Verify.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Dashboard.tsx
│   │   └── Admin.tsx
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   └── main.tsx
├── public/
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Pagina's

| Route | Component | Auth | Beschrijving |
|-------|-----------|------|--------------|
| `/` | Home | Nee | Landing page |
| `/verify` | Verify | Nee | Chipnummer verificatie |
| `/login` | Login | Nee | Inloggen |
| `/register` | Register | Nee | Account aanmaken |
| `/dashboard` | Dashboard | Ja | Overzicht |
| `/animals` | AnimalList | Ja | Mijn registraties |
| `/animals/new` | RegisterAnimal | Ja | Nieuwe registratie |
| `/credits` | Credits | Ja | Credits beheren |
| `/admin` | Admin | Admin | Beheer |

---

## Mobile-First Design

### Breakpoints

```css
/* Mobile first */
.container { padding: 1rem; }

/* Tablet */
@media (min-width: 768px) {
  .container { padding: 2rem; }
}

/* Desktop */
@media (min-width: 1024px) {
  .container { max-width: 1200px; margin: 0 auto; }
}
```

### Touch-Friendly

```css
button {
  min-height: 44px;  /* Apple guideline */
  min-width: 44px;
  padding: 12px 24px;
}

input {
  font-size: 16px;  /* Voorkomt zoom op iOS */
  padding: 12px;
}
```

---

## API Communicatie

```typescript
// lib/api.ts
const API_URL = import.meta.env.VITE_API_URL;

export async function api<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token');

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'API error');
  }

  return res.json();
}

// Gebruik
const result = await api<VerifyResult>(`/verify/${chipId}`);
```

---

## Dependencies

| Package | Doel |
|---------|------|
| `react` | UI framework |
| `react-router-dom` | Routing |
| `vite` | Build tool |
| `typescript` | Type checking |

**Verwijderd:**
- ~~`@lucid-evolution/lucid`~~ → Nu in backend
- ~~`bip39`~~ → Niet meer nodig

---

## Scripts

| Command | Beschrijving |
|---------|--------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production |
| `npm run lint` | ESLint check |

---

## Build

```bash
npm run build
```

Output in `dist/` folder. Deploy naar Vercel, Netlify, of eigen server.
