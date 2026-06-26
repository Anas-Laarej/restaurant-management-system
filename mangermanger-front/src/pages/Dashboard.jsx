import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import API from '../api';


function StatCard({ label, value, sub, color, icon }) {
  return (
    <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -20, right: -20, fontSize: 60, opacity: 0.05, fontFamily: 'Syne' }}>{icon}</div>
      <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Syne', fontWeight: 600, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 30, fontFamily: 'Syne', fontWeight: 800, color: color || 'var(--text)', marginBottom: 4 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text3)' }}>{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [commandes, setCommandes] = useState([]);
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    API.get('/dashboard/').then(r => setStats(r.data)).catch(() => {});
    API.get('/commandes/?ordering=-created_at').then(r => setCommandes(r.data.results || r.data)).catch(() => {});
    API.get('/ingredients/alertes/').then(r => setStocks(r.data)).catch(() => {});
  }, []);

  const statutBadge = (s) => {
    const map = { en_attente: ['badge-info','En attente'], en_preparation: ['badge-warn','En préparation'], pret: ['badge-success','Prêt'], servi: ['badge-gray','Servi'], paye: ['badge-success','Payé'], annulee: ['badge-danger','Annulée'] };
    const [cls, label] = map[s] || ['badge-gray', s];
    return <span className={`badge ${cls}`}>{label}</span>;
  };

  return (
    <div style={{ padding: '1.75rem', minHeight: '100vh' }} className="fade-in">
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: 26, color: 'var(--text)', marginBottom: 4 }}>Tableau de bord</h1>
        <p style={{ color: 'var(--text3)', fontSize: 13 }}>Vue d'ensemble — Service du {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>

      <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        <StatCard label="Chiffre d'affaires" value={`${stats?.ca_jour?.toLocaleString('fr-FR') || 0} DH`} sub={stats?.delta_ca > 0 ? `+${stats.delta_ca}% vs hier` : `${stats?.delta_ca || 0}% vs hier`} color="var(--accent)" icon="◈" />
        <StatCard label="Commandes" value={stats?.commandes_count || 0} sub="Aujourd'hui" color="var(--info)" icon="◉" />
        <StatCard label="Tables occupées" value={`${stats?.tables_occupees || 0}/${stats?.tables_total || 15}`} sub={`${Math.round(((stats?.tables_occupees || 0)/(stats?.tables_total||15))*100)}% d'occupation`} color="var(--success)" icon="▦" />
        <StatCard label="Note moyenne" value={`${stats?.note_moyenne || '—'}/5`} sub={stats?.stocks_alerte > 0 ? `⚠ ${stats.stocks_alerte} alerte(s) stock` : 'Stocks OK'} color="var(--warn)" icon="★" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, marginBottom: 14 }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: 15, color: 'var(--text)' }}>Chiffre d'affaires — semaine</h3>
            <span className="badge badge-orange">Cette semaine</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={stats?.ca_semaine || []}>
              <defs>
                <linearGradient id="ca" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="jour" tick={{ fill: '#5c6478', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#5c6478', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1c2030', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f3f7', fontSize: 12 }} />
              <Area type="monotone" dataKey="ca" stroke="#f97316" fill="url(#ca)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 style={{ fontSize: 15, color: 'var(--text)', marginBottom: '1rem' }}>Plats populaires</h3>
          {(stats?.top_plats || []).map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: i === 0 ? 'var(--accent-dim)' : 'var(--bg4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontFamily: 'Syne', fontWeight: 700, color: i === 0 ? 'var(--accent)' : 'var(--text3)', flexShrink: 0 }}>{i+1}</div>
              <div style={{ flex: 1, fontSize: 12, color: 'var(--text2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.plat__nom}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text3)' }}>{p.total}</div>
            </div>
          ))}
          {(stats?.top_plats || []).length === 0 && <p style={{ color: 'var(--text3)', fontSize: 12 }}>Aucune commande aujourd'hui</p>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div className="card">
          <h3 style={{ fontSize: 15, color: 'var(--text)', marginBottom: '1rem' }}>Commandes récentes</h3>
          <table>
            <thead><tr><th>N°</th><th>Table</th><th>Montant</th><th>Statut</th></tr></thead>
            <tbody>
              {(commandes.slice(0,6)).map(c => (
                <tr key={c.id}>
                  <td style={{ color: 'var(--accent)', fontFamily: 'Syne', fontWeight: 600 }}>#{String(c.id).padStart(4,'0')}</td>
                  <td>{c.table_numero ? `Table ${c.table_numero}` : <span style={{ color: 'var(--accent)', fontSize: 11 }}>🌐 En ligne</span>}</td>
                  <td style={{ fontWeight: 600, color: 'var(--text)' }}>{parseFloat(c.montant_total).toFixed(0)} DH</td>
                  <td>{statutBadge(c.statut)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3 style={{ fontSize: 15, color: 'var(--text)', marginBottom: '1rem' }}>⚠ Alertes stock</h3>
          {stocks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--success)' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>✓</div>
              <p style={{ fontSize: 13 }}>Tous les stocks sont OK</p>
            </div>
          ) : stocks.map(s => (
            <div key={s.id} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: 'var(--text2)' }}>{s.nom}</span>
                <span style={{ fontSize: 12, color: s.quantite_stock <= s.quantite_min * 0.5 ? 'var(--danger)' : 'var(--warn)', fontWeight: 600 }}>{s.quantite_stock} {s.unite}</span>
              </div>
              <div style={{ height: 4, background: 'var(--bg4)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${s.niveau_pct}%`, background: s.niveau_pct < 30 ? 'var(--danger)' : 'var(--warn)', borderRadius: 2, transition: 'width 0.5s ease' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
