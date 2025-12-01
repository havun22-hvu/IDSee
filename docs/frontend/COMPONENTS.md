# React Componenten

## Overzicht

```
components/
├── layout/
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── Navigation.tsx
├── wallet/
│   ├── WalletConnect.tsx
│   └── WalletInfo.tsx
├── verify/
│   ├── VerifyAnimal.tsx
│   └── VerificationResult.tsx
├── register/
│   ├── RegisterAnimal.tsx
│   ├── RegisterBreeder.tsx
│   └── RegisterProfessional.tsx
├── health/
│   ├── AddHealthRecord.tsx
│   └── ViewHealthRecords.tsx
└── common/
    ├── Button.tsx
    ├── Input.tsx
    ├── Card.tsx
    └── Loading.tsx
```

---

## Kern Componenten

### WalletConnect

Wallet selectie en verbinding.

```tsx
interface WalletConnectProps {
  onConnect: (address: string) => void;
  onDisconnect: () => void;
}
```

**Features:**
- Detecteer beschikbare wallets
- Toon wallet icons
- Connect/disconnect buttons
- Toon verbonden adres

### VerifyAnimal

Hoofdcomponent voor verificatie.

```tsx
interface VerifyAnimalProps {
  // Geen props nodig - standalone
}
```

**Flow:**
1. Input veld voor chipnummer
2. "Verifiëren" button
3. Laad indicator
4. Resultaat weergave

### VerificationResult

Toont verificatie resultaat.

```tsx
interface VerificationResultProps {
  chipId: string;
  certifiedOrigin: boolean;
  registeredMother: boolean;
  validProfessional: boolean;
  registrationDate?: Date;
}
```

### RegisterAnimal

Formulier voor dierregistratie (alleen professionals).

```tsx
interface RegisterAnimalProps {
  lucid: Lucid;
  professionalCredential: CertifiedProfessional;
}
```

**Velden:**
- Chipnummer (scan of handmatig)
- Moeder chipnummer
- Fokker selectie
- Ras
- Geboortedatum
- Geboorteplaats
- Land

---

## State Management

### Context: WalletContext

```tsx
interface WalletContextType {
  lucid: Lucid | null;
  address: string | null;
  connected: boolean;
  connect: (wallet: string) => Promise<void>;
  disconnect: () => void;
}
```

### Context: RegistryContext

```tsx
interface RegistryContextType {
  animals: Animal[];
  breeders: Breeder[];
  professionals: CertifiedProfessional[];
  loading: boolean;
  refresh: () => Promise<void>;
}
```

---

## Styling

Gebruik Tailwind CSS of CSS Modules.

### Tailwind Voorbeeld

```tsx
function Button({ children, variant = "primary" }) {
  const styles = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800",
    danger: "bg-red-600 hover:bg-red-700 text-white",
  };

  return (
    <button className={`px-4 py-2 rounded ${styles[variant]}`}>
      {children}
    </button>
  );
}
```

---

## Pagina Structuur

### Home (/)
- Hero met uitleg
- Quick verify form
- Links naar registratie

### Verify (/verify)
- VerifyAnimal component
- FAQ sectie

### Dashboard (/dashboard)
- Alleen na wallet connect
- Rol-specifieke weergave:
  - Fokker: mijn pups, registraties
  - Dierenarts: recente registraties
  - Koper: mijn dieren

### Register (/register)
- Alleen voor professionals
- RegisterAnimal form
- Transactie bevestiging

---

## Error States

```tsx
function ErrorMessage({ error }: { error: string }) {
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      {error}
    </div>
  );
}
```

### Veelvoorkomende Errors

| Error | Weergave |
|-------|----------|
| Wallet niet verbonden | "Verbind eerst je wallet" |
| Geen professional | "Alleen voor erkende professionals" |
| Chip niet gevonden | "Chipnummer niet gevonden in systeem" |
| Netwerk error | "Kon niet verbinden met blockchain" |
