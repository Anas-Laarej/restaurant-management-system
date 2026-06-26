import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../api';

const TYPE_ICON  = { reservation: '📅', commande: '🛒', commande_prete: '✅', reservation_confirmee: '✅', reservation_annulee: '❌' };
const TYPE_COLOR = { reservation: '#3b82f6', commande: '#f97316', commande_prete: '#22c55e', reservation_confirmee: '#22c55e', reservation_annulee: '#ef4444' };

function getNavPath(type, role) {
  if (type === 'commande' || type === 'commande_prete') {
    if (role === 'chef') return '/cuisine';
    return '/commandes';
  }
  if (type === 'reservation' || type === 'reservation_confirmee' || type === 'reservation_annulee') return '/reservations';
  return null;
}

export default function NotificationBell() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [count, setCount]   = useState(0);
  const [notifs, setNotifs] = useState([]);
  const [open, setOpen]     = useState(false);
  const ref = useRef(null);

  const fetchNotifs = async () => {
    try {
      const r = await API.get('/notifications/non_lues/');
      setCount(r.data.count || 0);
      setNotifs(r.data.notifications || []);
    } catch (e) {
      console.error('[NotificationBell] fetch error:', e?.response?.status, e?.message);
    }
  };

  useEffect(() => {
    if (!user) { setCount(0); setNotifs([]); return; }
    fetchNotifs();
    const t = setInterval(fetchNotifs, 5000);
    return () => clearInterval(t);
  }, [user]);

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
    const path = getNavPath(n.type, role);
    setOpen(false);
    if (path) navigate(path);
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={handleOpen}
        style={{
          position: 'relative',
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 10, width: 38, height: 38,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', fontSize: 18, transition: 'all 0.2s',
        }}
      >
        🔔
        {count > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4,
            background: '#ef4444', color: '#fff',
            borderRadius: '50%', width: 18, height: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontFamily: 'Syne, sans-serif', fontWeight: 800,
            border: '2px solid var(--bg2)',
          }}>
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'fixed', bottom: 80, left: 230,
          width: 340, background: 'var(--bg2)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
          zIndex: 1000, overflow: 'hidden',
        }}>
          <div style={{
            padding: '14px 16px',
            borderBottom: '1px solid var(--border)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>
              🔔 Notifications
            </span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {notifs.some(n => !n.lue) && (
                <button onClick={marquerLues} style={{ fontSize: 11, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontWeight: 600 }}>
                  Tout lire
                </button>
              )}
              {notifs.length > 0 && (
                <button onClick={supprimerToutes} style={{ fontSize: 11, color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontWeight: 600 }}>
                  Tout supprimer
                </button>
              )}
            </div>
          </div>

          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {notifs.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>
                <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.4 }}>🔔</div>
                Aucune notification récente
              </div>
            ) : notifs.map(n => {
              const path = getNavPath(n.type, role);
              return (
                <div
                  key={n.id}
                  onClick={() => handleNotifClick(n)}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border)',
                    background: n.lue ? 'transparent' : 'rgba(249,115,22,0.05)',
                    transition: 'background 0.15s',
                    cursor: path ? 'pointer' : 'default',
                  }}
                  onMouseEnter={e => { if (path) e.currentTarget.style.background = 'rgba(249,115,22,0.10)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = n.lue ? 'transparent' : 'rgba(249,115,22,0.05)'; }}
                >
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 10,
                      background: `${TYPE_COLOR[n.type] || '#6b7280'}20`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, flexShrink: 0,
                    }}>
                      {TYPE_ICON[n.type] || '📢'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 3, lineHeight: 1.3 }}>
                        {n.titre}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.4 }}>
                        {n.message}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5 }}>
                        <span style={{ fontSize: 10, color: 'var(--text3)' }}>
                          {new Date(n.created_at).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {path && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setOpen(false); navigate(path); }}
                            style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                          >→ Voir</button>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                      {!n.lue && <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)' }} />}
                      <button
                        onClick={(e) => supprimerUne(e, n.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', fontSize: 14, padding: '2px 4px', borderRadius: 4, lineHeight: 1, transition: 'color 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
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
