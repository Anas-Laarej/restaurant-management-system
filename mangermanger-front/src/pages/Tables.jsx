import { useEffect, useState } from 'react';
import API from '../api';

const statutConfig = {
  libre: { label: 'Libre', color: 'var(--success)', bg: 'var(--success-dim)', border: 'rgba(34,197,94,0.3)' },
  occupee: { label: 'Occupée', color: 'var(--warn)', bg: 'var(--warn-dim)', border: 'rgba(234,179,8,0.3)' },
  reservee: { label: 'Réservée', color: 'var(--info)', bg: 'var(--info-dim)', border: 'rgba(59,130,246,0.3)' },
  fermee: { label: 'Fermée', color: 'var(--text3)', bg: 'rgba(255,255,255,0.03)', border: 'var(--border)' },
};

export default function Tables() {
  const [tables, setTables] = useState([]);
  const [selected, setSelected] = useState(null);

  const fetchTables = () => API.get('/tables/').then(r => setTables(r.data.results || r.data));
  useEffect(() => { fetchTables(); const t = setInterval(fetchTables, 15000); return () => clearInterval(t); }, []);

  const changerStatut = async (id, statut) => {
    await API.patch(`/tables/${id}/changer_statut/`, { statut });
    fetchTables(); setSelected(null);
  };

  const stats = Object.keys(statutConfig).reduce((acc, s) => { acc[s] = tables.filter(t => t.statut === s).length; return acc; }, {});

  return (
    <div style={{ padding: '1.75rem' }} className="fade-in">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: 26, color: 'var(--text)', marginBottom: 4 }}>Plan des tables</h1>
        <p style={{ color: 'var(--text3)', fontSize: 13 }}>Mise à jour automatique toutes les 15s</p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {Object.entries(statutConfig).map(([k, v]) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg2)', padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: v.color }} />
            <span style={{ fontSize: 13, color: 'var(--text2)' }}>{v.label}</span>
            <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'Syne', color: 'var(--text)' }}>{stats[k] || 0}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
        {tables.map(t => {
          const cfg = statutConfig[t.statut] || statutConfig.libre;
          return (
            <div key={t.id} onClick={() => setSelected(t)} style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 12, padding: '1.25rem', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ fontSize: 22, fontFamily: 'Syne', fontWeight: 800, color: cfg.color, marginBottom: 4 }}>T{t.numero}</div>
              <div style={{ fontSize: 11, color: cfg.color, fontWeight: 600, marginBottom: 4 }}>{cfg.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>{t.capacite} places</div>
            </div>
          );
        })}
      </div>

      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => setSelected(null)}>
          <div className="card fade-in" style={{ width: 360 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: 20 }}>Table {selected.numero}</h3>
              <button onClick={() => setSelected(null)} className="btn-ghost" style={{ padding: '4px 10px' }}>✕</button>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 4 }}>Statut actuel</div>
              <span className="badge" style={{ background: statutConfig[selected.statut]?.bg, color: statutConfig[selected.statut]?.color }}>{statutConfig[selected.statut]?.label}</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 12 }}>Changer le statut :</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {Object.entries(statutConfig).map(([k, v]) => k !== selected.statut && (
                <button key={k} className="btn-ghost" style={{ fontSize: 12, padding: '8px', borderColor: v.border, color: v.color }} onClick={() => changerStatut(selected.id, k)}>{v.label}</button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
