import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../api';

const NAV_PATH = {
  reservation:           '/acceuil/compte',
  reservation_confirmee: '/acceuil/compte',
  reservation_annulee:   '/acceuil/compte',
  commande:              '/acceuil/compte',
  commande_prete:        '/acceuil/compte',
};

const TYPE_ICON  = { reservation: '📅', commande: '🛒', commande_prete: '✅', reservation_confirmee: '✅', reservation_annulee: '❌' };
const TYPE_COLOR = { reservation: '#C8860C', commande: '#f97316', commande_prete: '#C8860C', reservation_confirmee: '#C8860C', reservation_annulee: '#ef4444' };
const TYPE_BG    = { reservation: '#f0fdf4', commande: '#fff7ed', commande_prete: '#f0fdf4', reservation_confirmee: '#f0fdf4', reservation_annulee: '#fef2f2' };

export default function ClientNotificationBell() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const [count, setCount]   = useState(0);
  const [notifs, setNotifs] = useState([]);
  const [open, setOpen]     = useState(false);
  const ref = useRef(null);

  // Ne jamais interroger le backend pour un compte staff
  const isClient = role === 'client' || role === null;

  useEffect(() => {
    if (!isClient) { setCount(0); setNotifs([]); return; }
    const fetchNotifs = async () => {
      try {
        const r = await API.get('/notifications/non_lues/');
        // Vérification défensive : si le backend retourne un rôle staff, ignorer
        if (r.data.role && r.data.role !== 'client') { setCount(0); setNotifs([]); return; }
        setCount(r.data.count || 0);
        setNotifs(r.data.notifications || []);
      } catch { /* silence */ }
    };
    fetchNotifs();
    const t = setInterval(fetchNotifs, 5000);
    return () => clearInterval(t);
  }, [role]);

  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const marquerLues = async () => {
    try {
      await API.post('/notifications/marquer_lues/');
      setCount(0);
      setNotifs(prev => prev.map(n => ({ ...n, lue: true })));
    } catch {}
  };

  const supprimerUne = async (e, id) => {
    e.stopPropagation();
    try {
      await API.delete(`/notifications/${id}/`);
      setNotifs(prev => prev.filter(n => n.id !== id));
      setCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const supprimerToutes = async () => {
    try {
      await API.delete('/notifications/supprimer_toutes/');
      setNotifs([]);
      setCount(0);
    } catch {}
  };

  const handleOpen = () => {
    const newOpen = !open;
    setOpen(newOpen);
    if (newOpen && count > 0) marquerLues();
  };

  const handleNotifClick = (n) => {
    const path = NAV_PATH[n.type];
    setOpen(false);
    if (path) navigate(path);
  };

  // Ne rien afficher pour le staff
  if (!isClient) return null;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={handleOpen}
        style={{
          position: 'relative',
          background: count > 0 ? '#f0fdf4' : 'transparent',
          border: `1.5px solid ${count > 0 ? '#86efac' : 'var(--c-border)'}`,
          borderRadius: 10,
          width: 38, height: 38,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', fontSize: 18, transition: 'all 0.2s',
        }}
      >
        🔔
        {count > 0 && (
          <span style={{
            position: 'absolute', top: -5, right: -5,
            background: '#ef4444', color: '#fff',
            borderRadius: '50%', width: 18, height: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontFamily: 'Syne, sans-serif', fontWeight: 800,
            border: '2px solid #fff',
          }}>
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 46, right: 0,
          width: 340, background: '#fff',
          border: '1.5px solid #bbf7d0',
          borderRadius: 16,
          boxShadow: '0 16px 48px rgba(200,134,12,0.15)',
          zIndex: 300, overflow: 'hidden',
        }}>
          <div style={{
            padding: '13px 16px',
            borderBottom: '1px solid #e2f5e9',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: '#f0fdf4',
          }}>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: '#0f1f13' }}>
              🔔 Mes notifications
            </span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {notifs.some(n => !n.lue) && (
                <button onClick={marquerLues} style={{ fontSize: 11, color: '#C8860C', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontWeight: 600 }}>
                  Tout lire
                </button>
              )}
              {notifs.length > 0 && (
                <button onClick={supprimerToutes} style={{ fontSize: 11, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontWeight: 600 }}>
                  Tout supprimer
                </button>
              )}
            </div>
          </div>

          <div style={{ maxHeight: 380, overflowY: 'auto' }}>
            {notifs.length === 0 ? (
              <div style={{ padding: '2.5rem', textAlign: 'center', color: '#6b7c6a' }}>
                <div style={{ fontSize: 32, marginBottom: 10, opacity: 0.4 }}>🔔</div>
                <div style={{ fontSize: 13 }}>Aucune notification</div>
              </div>
            ) : notifs.map(n => {
              const color = TYPE_COLOR[n.type] || '#C8860C';
              const bg    = TYPE_BG[n.type]    || '#f0fdf4';
              const path  = NAV_PATH[n.type];
              return (
                <div
                  key={n.id}
                  onClick={() => handleNotifClick(n)}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #e2f5e9',
                    background: n.lue ? '#fff' : '#f0fdf4',
                    transition: 'background 0.15s',
                    cursor: path ? 'pointer' : 'default',
                  }}
                  onMouseEnter={e => { if (path) e.currentTarget.style.background = '#dcfce7'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = n.lue ? '#fff' : '#f0fdf4'; }}
                >
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: bg, border: `1px solid ${color}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 17, flexShrink: 0,
                    }}>
                      {TYPE_ICON[n.type] || '📢'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#0f1f13', marginBottom: 3, lineHeight: 1.3 }}>
                        {n.titre}
                      </div>
                      <div style={{ fontSize: 12, color: '#6b7c6a', lineHeight: 1.5 }}>
                        {n.message}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5 }}>
                        <span style={{ fontSize: 10, color: '#9ca3af' }}>
                          {new Date(n.created_at).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {path && <span style={{ fontSize: 10, color: '#C8860C', fontWeight: 700 }}>→ Voir</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                      {!n.lue && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#C8860C' }} />}
                      <button
                        onClick={(e) => supprimerUne(e, n.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db', fontSize: 14, padding: '2px 4px', borderRadius: 4, lineHeight: 1, transition: 'color 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                        onMouseLeave={e => e.currentTarget.style.color = '#d1d5db'}
                        title="Supprimer"
                      >✕</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
