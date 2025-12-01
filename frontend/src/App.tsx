import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import {
  Home,
  Login,
  Register,
  Verify,
  Dashboard,
  Animals,
  RegisterAnimal,
  Credits,
  Admin,
} from './pages';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes - any logged in user */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Protected routes - professionals only */}
            <Route
              path="/animals"
              element={
                <ProtectedRoute roles={['BREEDER', 'VET', 'CHIPPER', 'ADMIN']}>
                  <Animals />
                </ProtectedRoute>
              }
            />
            <Route
              path="/animals/new"
              element={
                <ProtectedRoute roles={['BREEDER', 'VET', 'CHIPPER', 'ADMIN']}>
                  <RegisterAnimal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/credits"
              element={
                <ProtectedRoute roles={['BREEDER', 'VET', 'CHIPPER', 'ADMIN']}>
                  <Credits />
                </ProtectedRoute>
              }
            />

            {/* Admin only */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={['ADMIN']}>
                  <Admin />
                </ProtectedRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}

function NotFound() {
  return (
    <div className="not-found">
      <h1>404</h1>
      <p>Pagina niet gevonden</p>
      <a href="/">Terug naar home</a>
    </div>
  );
}

export default App;
