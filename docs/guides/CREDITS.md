# Credits Systeem

## Overzicht

Credits zijn de interne valuta van IDSee. Professionals kopen credits om registraties te doen. Kopers verifiëren gratis.

---

## Prijsmodel

### Acties

| Actie | Credits | Wie |
|-------|---------|-----|
| Pup registreren | 1 | Fokker |
| Nest registreren (max 12 pups) | 3 | Fokker |
| Gezondheidsrecord toevoegen | 1 | Dierenarts |
| Chip koppelen | 1 | Chipper |
| **Verificatie** | **Gratis** | Koper |

### Bundels

| Bundel | Credits | Prijs | Per credit |
|--------|---------|-------|------------|
| Starter | 10 | €9 | €0,90 |
| Professional | 50 | €40 | €0,80 |
| Enterprise | 200 | €140 | €0,70 |

---

## Kopen

### Betaalmethodes

- **iDEAL** - Direct, geen kosten
- **Creditcard** - Visa, Mastercard
- **Bancontact** - Voor Belgische gebruikers
- **Factuur** - Alleen voor verified professionals

### Flow

```
1. Gebruiker klikt "Credits kopen"
2. Kiest bundel
3. Selecteert betaalmethode
4. Redirect naar Mollie
5. Betaling voltooid
6. Webhook → credits bijschrijven
7. Redirect terug naar app
```

---

## Backend Implementatie

### Mollie Integratie

```typescript
// services/payment.ts
import { createMollieClient } from '@mollie/api-client';

const mollie = createMollieClient({
  apiKey: process.env.MOLLIE_API_KEY
});

export async function createPayment(userId: string, bundle: Bundle) {
  const payment = await mollie.payments.create({
    amount: {
      currency: 'EUR',
      value: bundle.price.toFixed(2)
    },
    description: `IDSee ${bundle.credits} credits`,
    redirectUrl: `${process.env.APP_URL}/credits/success`,
    webhookUrl: `${process.env.API_URL}/credits/webhook`,
    metadata: {
      userId,
      credits: bundle.credits
    }
  });

  return payment.getCheckoutUrl();
}
```

### Webhook Handler

```typescript
// routes/credits.ts
router.post('/webhook', async (req, res) => {
  const { id } = req.body;

  const payment = await mollie.payments.get(id);

  if (payment.status === 'paid') {
    const { userId, credits } = payment.metadata;

    await prisma.user.update({
      where: { id: userId },
      data: { credits: { increment: credits } }
    });

    await prisma.creditTransaction.create({
      data: {
        userId,
        amount: credits,
        type: 'purchase',
        paymentId: id
      }
    });
  }

  res.status(200).send('OK');
});
```

---

## Credits Afschrijven

### Middleware

```typescript
// middleware/credits.ts
export function requireCredits(amount: number) {
  return async (req, res, next) => {
    const user = await prisma.user.findUnique({
      where: { id: req.userId }
    });

    if (user.credits < amount) {
      return res.status(402).json({
        error: 'Onvoldoende credits',
        required: amount,
        current: user.credits
      });
    }

    req.creditCost = amount;
    next();
  };
}
```

### Gebruik

```typescript
// routes/animals.ts
router.post('/',
  auth,
  requireCredits(1),
  async (req, res) => {
    // Registratie logica...

    // Credits afschrijven
    await prisma.user.update({
      where: { id: req.userId },
      data: { credits: { decrement: req.creditCost } }
    });

    await prisma.creditTransaction.create({
      data: {
        userId: req.userId,
        amount: -req.creditCost,
        type: 'usage'
      }
    });

    res.json({ success: true });
  }
);
```

---

## Frontend

### Credit Balans Component

```typescript
// components/credits/CreditBalance.tsx
export function CreditBalance() {
  const { user } = useAuth();

  return (
    <div className="credit-balance">
      <span className="label">Credits:</span>
      <span className="amount">{user?.credits ?? 0}</span>
      <Link to="/credits" className="buy-link">
        Kopen
      </Link>
    </div>
  );
}
```

### Koop Pagina

```typescript
// pages/Credits.tsx
const BUNDLES = [
  { id: 'starter', credits: 10, price: 9 },
  { id: 'professional', credits: 50, price: 40 },
  { id: 'enterprise', credits: 200, price: 140 },
];

export function Credits() {
  const [loading, setLoading] = useState(false);

  async function handlePurchase(bundleId: string) {
    setLoading(true);
    const { checkoutUrl } = await api('/credits/purchase', {
      method: 'POST',
      body: JSON.stringify({ bundleId })
    });
    window.location.href = checkoutUrl;
  }

  return (
    <div className="credits-page">
      <h1>Credits Kopen</h1>
      <div className="bundles">
        {BUNDLES.map(bundle => (
          <div key={bundle.id} className="bundle-card">
            <h2>{bundle.credits} Credits</h2>
            <p className="price">€{bundle.price}</p>
            <p className="per-credit">
              €{(bundle.price / bundle.credits).toFixed(2)} per credit
            </p>
            <button
              onClick={() => handlePurchase(bundle.id)}
              disabled={loading}
            >
              Kopen
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Transactie Historie

```typescript
// API endpoint
router.get('/transactions', auth, async (req, res) => {
  const transactions = await prisma.creditTransaction.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  res.json(transactions);
});
```

---

## Refunds

Alleen via admin panel:

```typescript
// routes/admin.ts
router.post('/refund', adminOnly, async (req, res) => {
  const { userId, amount, reason } = req.body;

  await prisma.user.update({
    where: { id: userId },
    data: { credits: { increment: amount } }
  });

  await prisma.creditTransaction.create({
    data: {
      userId,
      amount,
      type: 'refund',
      note: reason
    }
  });

  res.json({ success: true });
});
```

---

## Rapportage

### Maandelijks overzicht

```sql
SELECT
  DATE_TRUNC('month', created_at) as month,
  SUM(CASE WHEN type = 'purchase' THEN amount ELSE 0 END) as purchased,
  SUM(CASE WHEN type = 'usage' THEN ABS(amount) ELSE 0 END) as used,
  COUNT(DISTINCT user_id) as active_users
FROM credit_transactions
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;
```
