import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Commandes from './pages/Commandes';
import Tables from './pages/Tables';
import Menu from './pages/Menu';
import Stock from './pages/Stock';
import Cuisine from './pages/Cuisine';
import Salle from './pages/Salle';
import Caisse from './pages/Caisse';
import Avis from './pages/Avis';
import Personnel from './pages/Personnel';
import Promos from './pages/Promos';
import Reservations from './pages/Reservations';
import Profil from './pages/Profil';

import ClientLayout from './pages/client/ClientLayout';
import ClientHome from './pages/client/ClientHome';
import ClientReserver from './pages/client/ClientReserver';
import ClientCommander from './pages/client/ClientCommander';
import ClientRegister from './pages/client/ClientRegister';
import ClientCompte from './pages/client/ClientCompte';

const STAFF_ROLES = ['gerant', 'chef', 'serveur', 'caissier'];

// Guard pour les pages staff : redirige vers /login si pas connecté en tant que staff
function StaffRoute({ children }) {
  const { user, role, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text3)', fontFamily: 'Syne' }}>
      Chargement...
    </div>
  );
  const isStaff = user && STAFF_ROLES.includes(role);
  if (!isStaff) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

// Guard pour les pages client privées : redirige vers /login si pas connecté
function ClientRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? (
    <ClientLayout>{children}</ClientLayout>
  ) : (
    <Navigate to="/login" replace />
  );
}

function AppRoutes() {
  const { role, user } = useAuth();

  // Redirection intelligente depuis "/"
  const getDefaultRoute = () => {
    if (!user) return '/acceuil';
    const staffRoutes = { gerant: '/dashboard', chef: '/cuisine', serveur: '/salle', caissier: '/caisse' };
    return staffRoutes[role] || '/acceuil';
  };

  return (
    <Routes>
      {/* Racine → redirection intelligente */}
      <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />

      {/* ── STAFF ROUTES ── */}
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard"  element={<StaffRoute><Dashboard /></StaffRoute>} />
      <Route path="/commandes"  element={<StaffRoute><Commandes /></StaffRoute>} />
      <Route path="/tables"     element={<StaffRoute><Tables /></StaffRoute>} />
      <Route path="/menu"       element={<StaffRoute><Menu /></StaffRoute>} />
      <Route path="/stock"      element={<StaffRoute><Stock /></StaffRoute>} />
      <Route path="/cuisine"    element={<StaffRoute><Cuisine /></StaffRoute>} />
      <Route path="/salle"      element={<StaffRoute><Salle /></StaffRoute>} />
      <Route path="/caisse"     element={<StaffRoute><Caisse /></StaffRoute>} />
      <Route path="/avis"       element={<StaffRoute><Avis /></StaffRoute>} />
      <Route path="/personnel"   element={<StaffRoute><Personnel /></StaffRoute>} />
      <Route path="/promos"      element={<StaffRoute><Promos /></StaffRoute>} />
      <Route path="/reservations" element={<StaffRoute><Reservations /></StaffRoute>} />
      <Route path="/profil"       element={<StaffRoute><Profil /></StaffRoute>} />

      {/* ── CLIENT ROUTES (publiques) ── */}
      <Route path="/acceuil"          element={<ClientLayout><ClientHome /></ClientLayout>} />
      <Route path="/acceuil/reserver" element={<ClientLayout><ClientReserver /></ClientLayout>} />
      <Route path="/acceuil/commander"element={<ClientLayout><ClientCommander /></ClientLayout>} />
      <Route path="/acceuil/login"    element={<Navigate to="/login" replace />} />
      <Route path="/acceuil/register" element={<ClientLayout><ClientRegister /></ClientLayout>} />

      {/* ── CLIENT ROUTES (privées — nécessite compte client) ── */}
      <Route path="/acceuil/compte"   element={<ClientRoute><ClientCompte /></ClientRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/acceuil" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
