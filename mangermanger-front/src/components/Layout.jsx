import { useState } from 'react';
import NotificationBell from './NotificationBell';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navByRole = {
  gerant: [
    { path: '/dashboard', label: 'Tableau de bord', icon: '◈' },
    { path: '/reservations', label: 'Réservations', icon: '📅' },
    { path: '/commandes', label: 'Commandes', icon: '◉' },
    { path: '/tables', label: 'Tables', icon: '▦' },
    { path: '/stock', label: 'Stock', icon: '◇' },
    { path: '/personnel', label: 'Personnel', icon: '◑' },
    { path: '/avis', label: 'Avis clients', icon: '★' },
    { path: '/promos', label: 'Codes promo', icon: '◆' },
  ],
  chef: [
    { path: '/cuisine', label: 'Interface cuisine', icon: '◈' },
    { path: '/menu', label: 'Menu & Plats', icon: '◎' },
    { path: '/stock', label: 'Stock cuisine', icon: '◇' },
  ],
  serveur: [
    { path: '/salle', label: 'Salle & Réservations', icon: '▦' },
    { path: '/reservations', label: 'Réservations', icon: '📅' },
    { path: '/commandes', label: 'Commandes', icon: '◉' },
  ],
  caissier: [
    { path: '/caisse', label: 'Caisse', icon: '◆' },
  ],
};

const roleColors = { gerant: '#2563EB', chef: '#C2410C', serveur: '#16A34A', caissier: '#7C3AED' };
const roleLabels = { gerant: 'Gérant', chef: 'Chef cuisinier', serveur: 'Serveur', caissier: 'Caissier' };

export default function Layout({ children }) {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const nav = navByRole[role] || navByRole.serveur;

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div data-role={role} style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <aside style={{
        width: collapsed ? 64 : 220,
        minWidth: collapsed ? 64 : 220,
        background: 'var(--sidebar, var(--bg2))',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.25s ease, min-width 0.25s ease',
        position: 'relative',
      }}>
        <div style={{ padding: collapsed ? '1.25rem 0' : '1.25rem 1rem', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--border)', cursor: 'pointer', overflow: 'hidden' }} onClick={() => setCollapsed(!collapsed)}>
          <span style={{ fontSize: 22, flexShrink: 0, marginLeft: collapsed ? 'auto' : 0, marginRight: collapsed ? 'auto' : 0 }}>🍽️</span>
          {!collapsed && <div>
            <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 15, color: 'var(--text)', whiteSpace: 'nowrap' }}>Zefran</div>
            <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>ERP Restaurant</div>
          </div>}
        </div>

        {!collapsed && (
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: roleColors[role] || 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap' }}>{user?.first_name} {user?.last_name}</div>
                <div style={{ fontSize: 10, color: roleColors[role] || 'var(--accent)', fontWeight: 600 }}>{roleLabels[role]}</div>
              </div>
            </div>
          </div>
        )}

        <nav style={{ flex: 1, padding: collapsed ? '0.5rem 0' : '0.5rem', overflow: 'hidden' }}>
          {nav.map(item => (
            <NavLink key={item.path} to={item.path} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: collapsed ? '10px 0' : '9px 12px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: collapsed ? 0 : 8,
              marginBottom: 2,
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: isActive ? 600 : 400,
              color: isActive ? 'var(--accent)' : 'var(--text2)',
              background: isActive ? 'var(--accent-dim)' : 'transparent',
              transition: 'all 0.15s',
            })}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && <span style={{ whiteSpace: 'nowrap', fontFamily: 'Syne' }}>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: collapsed ? '1rem 0' : '1rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8, alignItems: collapsed ? 'center' : 'stretch' }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}><NotificationBell /></div>
          <NavLink to="/profil" style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 8,
            padding: collapsed ? '8px 0' : '8px 10px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            borderRadius: 8,
            textDecoration: 'none',
            fontSize: 12,
            fontWeight: isActive ? 600 : 400,
            color: isActive ? 'var(--accent)' : 'var(--text2)',
            background: isActive ? 'var(--accent-dim)' : 'transparent',
          })}>
            <span style={{ fontSize: 15, flexShrink: 0 }}>◎</span>
            {!collapsed && <span style={{ fontFamily: 'Syne', whiteSpace: 'nowrap' }}>Mon profil</span>}
          </NavLink>
          <button onClick={handleLogout} className="btn-ghost" style={{ width: '100%', padding: '8px', fontSize: 12, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 6 }}>
            {!collapsed && '↩'} {!collapsed && 'Déconnexion'}
            {collapsed && '↩'}
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, overflow: 'auto', background: 'var(--bg)' }}>
        {children}
      </main>
    </div>
  );
}
