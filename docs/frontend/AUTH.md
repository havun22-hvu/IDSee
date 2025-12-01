# Authenticatie

## Overzicht

IDSee gebruikt een traditioneel login-systeem. Gebruikers hoeven niets van blockchain te weten.

---

## Gebruikersrollen

| Rol | Registratie | Verificatie |
|-----|-------------|-------------|
| **Koper** | Niet nodig | Direct chipnummer invoeren |
| **Fokker** | Email + KvK nummer | Admin goedkeuring |
| **Dierenarts** | Email + BIG nummer | Automatisch (BIG register) |
| **Chipper** | Email + NVWA certificaat | Admin goedkeuring |

---

## Registratie Flow

### Koper (geen account nodig)

```
1. Ga naar verificatiepagina
2. Voer chipnummer in
3. Zie resultaat
```

### Professional (fokker/vet/chipper)

```
1. Klik "Account aanmaken"
2. Vul in: email, wachtwoord, rol
3. Vul professionele gegevens in:
   - Fokker: KvK nummer
   - Dierenarts: BIG nummer
   - Chipper: NVWA certificaatnummer
4. Verificatie email
5. Wacht op goedkeuring (of automatisch bij BIG)
6. Account actief
```

---

## Login Flow

```
1. Email + wachtwoord invoeren
2. Backend valideert
3. JWT token ontvangen
4. Token opslaan in localStorage/cookie
5. Doorsturen naar dashboard
```

---

## Frontend Implementatie

### AuthContext

```typescript
// contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  role: 'koper' | 'fokker' | 'vet' | 'chipper' | 'admin';
  credits: number;
  verified: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check voor bestaande sessie
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  async function login(email: string, password: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) throw new Error('Login mislukt');

    const { token, user } = await res.json();
    localStorage.setItem('token', token);
    setUser(user);
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

### Protected Routes

```typescript
// components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Laden...</div>;

  if (!user) return <Navigate to="/login" />;

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
}
```

### Gebruik

```typescript
// App.tsx
<Routes>
  {/* Publiek */}
  <Route path="/" element={<Home />} />
  <Route path="/verify" element={<Verify />} />
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />

  {/* Alleen ingelogd */}
  <Route path="/dashboard" element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } />

  {/* Alleen specifieke rollen */}
  <Route path="/register-animal" element={
    <ProtectedRoute roles={['fokker', 'vet', 'chipper']}>
      <RegisterAnimal />
    </ProtectedRoute>
  } />

  <Route path="/admin" element={
    <ProtectedRoute roles={['admin']}>
      <Admin />
    </ProtectedRoute>
  } />
</Routes>
```

---

## API Calls met Auth

```typescript
// lib/api.ts
const API_URL = import.meta.env.VITE_API_URL;

export async function apiCall(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    // Token verlopen, uitloggen
    localStorage.removeItem('token');
    window.location.href = '/login';
  }

  return res;
}
```

---

## Professionele Verificatie

### BIG Register (Dierenartsen)

```typescript
// Backend controleert BIG nummer via:
// https://www.bigregister.nl/zoek-zorgverlener

async function verifyBIG(bigNumber: string): Promise<boolean> {
  // API call naar BIG register
  // Of handmatige verificatie door admin
}
```

### KvK (Fokkers)

```typescript
// Handmatige verificatie door admin
// Fokker upload KvK uittreksel
```

### NVWA (Chippers)

```typescript
// Handmatige verificatie door admin
// Chipper upload NVWA certificaat
```

---

## Session Management

| Instelling | Waarde |
|------------|--------|
| Token expiry | 7 dagen |
| Refresh token | Optioneel |
| Remember me | 30 dagen |

---

## Security Tips

1. **HTTPS only** - Tokens nooit over HTTP
2. **HttpOnly cookies** - Overweeg voor betere XSS bescherming
3. **CSRF tokens** - Bij cookie-based auth
4. **Rate limiting** - Max 5 login pogingen per minuut
5. **Password hashing** - bcrypt met cost 12
