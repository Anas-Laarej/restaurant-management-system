import { useEffect, useState } from 'react';
import API from '../api';

export default function Cuisine() {
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const r = await API.get('/commandes/?statut=en_preparation');
      setCommandes(r.data.results || r.data);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); const t = setInterval(fetchData, 10000); return () => clearInterval(t); }, []);

  const marquerPret = async (id) => {
    try { await API.patch(`/commandes/${id}/changer_statut/`, { statut: 'pret' }); fetchData(); } catch {}
  };

  const elapsed = (dt) => {
    const diff = Math.round((Date.now() - new Date(dt)) / 60000);
    return diff < 1 ? 'À l\'instant' : `il y a ${diff} min`;
  };

  if (loading) return <div style={{ padding: '2rem', color: 'var(--text3)' }}>Chargement des commandes…</div>;

  return (
    <div style={{ padding: '1.75rem', minHeight: '100vh' }} className="fade-in">
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 12 }}>
        <h1 style={{ fontSize: 26, color: 'var(--text)' }}>Interface cuisine</h1>
        <span className="badge badge-warn">{commandes.length} en préparation</span>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)' }} className="pulse" />
        <span style={{ fontSize: 12, color: 'var(--success)' }}>En direct</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {commandes.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text3)', background: 'var(--bg2)', borderRadius: 12, border: '1px solid var(--border)', gridColumn: '1/-1' }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🍽️</div>
            Aucune commande en cours de préparation
          </div>
        )}
        {commandes.map(c => (
          <div key={c.id} className="card" style={{ borderLeft: `3px solid ${c.notes?.includes('[COMMANDE EN LIGNE') ? 'var(--accent)' : 'var(--warn)'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--accent)' }}>Table {c.table_numero || '?'}</span>
                {c.notes?.includes('[COMMANDE EN LIGNE') && (
                  <span style={{ fontSize: 10, background: 'rgba(249,115,22,0.15)', color: 'var(--accent)', padding: '2px 7px', borderRadius: 6, fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>🌐 EN LIGNE</span>
                )}
              </div>
              <span style={{ fontSize: 12, color: 'var(--warn)' }}>⏱ {elapsed(c.created_at)}</span>
            </div>
            {c.items?.map(i => (
              <div key={i.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--warn-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--warn)', flexShrink: 0 }}>{i.quantite}</span>
                <span style={{ color: 'var(--text)' }}>{i.plat_nom}</span>
                {i.notes && <span style={{ fontSize: 11, color: 'var(--warn)', marginLeft: 'auto' }}>📝 {i.notes}</span>}
              </div>
            ))}
            <button className="btn-success" style={{ width: '100%', marginTop: '0.75rem', padding: '8px' }} onClick={() => marquerPret(c.id)}>✓ Prêt</button>
          </div>
        ))}
      </div>
    </div>
  );
}
