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
  AnimalDetail,
  RegisterAnimal,
  Credits,
  Admin,
  Verification,
  Confirmations,
  FraudReview,
  ReportSignal,
  RegisterImport,
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
              path="/animals/:id"
              element={
                <ProtectedRoute roles={['BREEDER', 'VET', 'CHIPPER', 'ADMIN']}>
                  <AnimalDetail />
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
            <Route
              path="/verification"
              element={
                <ProtectedRoute roles={['BREEDER', 'VET', 'CHIPPER']}>
                  <Verification />
                </ProtectedRoute>
              }
            />
            <Route
              path="/confirmations"
              element={
                <ProtectedRoute roles={['BREEDER']}>
                  <Confirmations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/fraud-review"
              element={
                <ProtectedRoute roles={['VET']}>
                  <FraudReview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/report-signal"
              element={
                <ProtectedRoute roles={['BREEDER', 'VET', 'CHIPPER']}>
                  <ReportSignal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/imports/new"
              element={
                <ProtectedRoute roles={['VET']}>
                  <RegisterImport />
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
