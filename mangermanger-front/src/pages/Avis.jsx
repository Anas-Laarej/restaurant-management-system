import { useEffect, useState } from 'react';
import API from '../api';

const stars = (n) => n ? '★'.repeat(n) + '☆'.repeat(5 - n) : '☆☆☆☆☆';

const ONGLETS = [
  { key: 'en_attente', label: 'En attente', color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
  { key: 'accepte',    label: 'Acceptés',   color: '#22c55e', bg: 'rgba(34,197,94,0.12)'  },
  { key: 'refuse',     label: 'Refusés',    color: '#ef4444', bg: 'rgba(239,68,68,0.12)'  },
];

const SENTIMENT_CFG = {
  positif: { label: 'Positif',  color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   icon: '😊' },
  neutre:  { label: 'Neutre',   color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', icon: '😐' },
  negatif: { label: 'Négatif',  color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   icon: '😞' },
};

function statutAvis(a) {
  if (a.valide === null || a.valide === undefined) return 'en_attente';
  return a.valide ? 'accepte' : 'refuse';
}

function SentimentBadge({ sentiment, score }) {
  if (!sentiment) return null;
  const cfg = SENTIMENT_CFG[sentiment] || SENTIMENT_CFG.neutre;
  return (
    <span title={score ? `Confiance : ${Math.round(score * 100)}%` : undefined}
      style={{
        fontSize: 10, padding: '2px 8px', borderRadius: 20,
        background: cfg.bg, color: cfg.color,
        fontFamily: 'Syne', fontWeight: 700,
        display: 'inline-flex', alignItems: 'center', gap: 4,
      }}>
      {cfg.icon} {cfg.label}
      {score && <span style={{ opacity: 0.75 }}>· {Math.round(score * 100)}%</span>}
    </span>
  );
}

function SentimentStats({ stats }) {
  if (!stats || stats.total === 0) return null;
  const order = ['positif', 'neutre', 'negatif'];
  const byLabel = {};
  (stats.distribution || []).forEach(d => { byLabel[d.sentiment] = d.count; });

  return (
    <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>
          Analyse de sentiment — {stats.total} avis acceptés
        </span>
        <span style={{ fontSize: 11, color: 'var(--text3)' }}>
          Note & Sentiment : <span style={{ color: 'var(--accent)', fontWeight: 600 }}>BERT (XLM-RoBERTa)</span>
        </span>
      </div>

      {/* Barres */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {order.map(key => {
          const cfg = SENTIMENT_CFG[key];
          const count = byLabel[key] || 0;
          const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
          return (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 60, fontSize: 11, color: cfg.color, fontFamily: 'Syne', fontWeight: 700 }}>
                {cfg.icon} {cfg.label}
              </span>
              <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'var(--border)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 4,
                  width: `${pct}%`, background: cfg.color,
                  transition: 'width 0.5s ease',
                }} />
              </div>
              <span style={{ width: 42, fontSize: 11, color: 'var(--text2)', textAlign: 'right' }}>
                {count} <span style={{ color: 'var(--text3)' }}>({pct}%)</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Avis() {
  const [avis, setAvis]         = useState([]);
  const [onglet, setOnglet]     = useState('en_attente');
  const [loading, setLoading]   = useState(true);
  const [sentimentStats, setSentimentStats] = useState(null);

  const fetchAvis = () => {
    setLoading(true);
    API.get('/avis/').then(r => setAvis(r.data.results || r.data)).finally(() => setLoading(false));
  };

  const fetchStats = () => {
    API.get('/avis/stats_sentiment/').then(r => setSentimentStats(r.data)).catch(() => {});
  };

  useEffect(() => {
    fetchAvis();
    fetchStats();
  }, []);

  const accepter = async (id) => {
    await API.post(`/avis/${id}/accepter/`);
    fetchAvis();
    fetchStats();
  };

  const refuser = async (id) => {
    await API.post(`/avis/${id}/refuser/`);
    fetchAvis();
    fetchStats();
  };

  const supprimer = async (id) => {
    if (!confirm('Supprimer définitivement cet avis ?')) return;
    await API.delete(`/avis/${id}/`);
    fetchAvis();
    fetchStats();
  };

  const filtres = {
    en_attente: avis.filter(a => statutAvis(a) === 'en_attente'),
    accepte:    avis.filter(a => statutAvis(a) === 'accepte'),
    refuse:     avis.filter(a => statutAvis(a) === 'refuse'),
  };

  const notedAvis = filtres.accepte.filter(a => a.note != null);
  const avg = notedAvis.length
    ? (notedAvis.reduce((s, a) => s + a.note, 0) / notedAvis.length).toFixed(1)
    : '—';

  const activeSt = ONGLETS.find(o => o.key === onglet);
  const liste = filtres[onglet] || [];

  return (
    <div style={{ padding: '1.75rem' }} className="fade-in">

      {/* En-tête */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: 26, color: 'var(--text)', marginBottom: 4 }}>Avis clients</h1>
          <p style={{ color: 'var(--text3)', fontSize: 13 }}>
            {avis.length} avis au total · Note moyenne (acceptés) :{' '}
            <span style={{ color: 'var(--warn)', fontWeight: 700 }}>{avg}{avg !== '—' ? '/5' : ''}</span>
          </p>
          <p style={{ color: 'var(--accent)', fontSize: 11, marginTop: 4, fontFamily: 'Syne', fontWeight: 600 }}>
            🤖 Les étoiles et le sentiment sont attribués automatiquement par BERT
          </p>
        </div>
        {avg !== '—' && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 36, color: 'var(--warn)' }}>{avg}</div>
            <div style={{ fontSize: 18, color: 'var(--warn)', marginTop: 2 }}>{stars(Math.round(avg))}</div>
          </div>
        )}
      </div>

      {/* Compteurs rapides */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: '1.5rem' }}>
        {ONGLETS.map(o => (
          <div key={o.key} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', outline: onglet === o.key ? `2px solid ${o.color}` : 'none' }}
            onClick={() => setOnglet(o.key)}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: o.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: o.color }} />
            </div>
            <div>
              <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 24, color: o.color, lineHeight: 1 }}>{filtres[o.key].length}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{o.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Stats de sentiment */}
      <SentimentStats stats={sentimentStats} />

      {/* Onglets */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1rem' }}>
        {ONGLETS.map(o => (
          <button key={o.key} onClick={() => setOnglet(o.key)}
            style={{
              padding: '6px 16px', fontSize: 12, fontFamily: 'Syne,sans-serif', fontWeight: 600,
              borderRadius: 20, border: '1px solid',
              borderColor: onglet === o.key ? o.color : 'var(--border)',
              background: onglet === o.key ? o.bg : 'transparent',
              color: onglet === o.key ? o.color : 'var(--text2)',
              cursor: 'pointer', transition: 'all 0.15s',
            }}>
            {o.label} ({filtres[o.key].length})
          </button>
        ))}
      </div>

      {/* Grille d'avis */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text3)' }}>Chargement...</div>
      ) : liste.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text3)' }}>
          Aucun avis {ONGLETS.find(o => o.key === onglet)?.label.toLowerCase()}.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 14 }}>
          {liste.map(a => (
            <div key={a.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{a.client_nom}</div>
                  <div style={{ color: 'var(--warn)', fontSize: 14, marginTop: 2 }}>{stars(a.note)}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 20, background: activeSt.bg, color: activeSt.color, fontFamily: 'Syne', fontWeight: 700, flexShrink: 0 }}>
                    {activeSt.label}
                  </span>
                  <SentimentBadge sentiment={a.sentiment} score={a.sentiment_score} />
                </div>
              </div>

              {a.plat_nom && (
                <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>→ {a.plat_nom}</div>
              )}

              <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, flex: 1, margin: 0 }}>{a.commentaire}</p>

              <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                {new Date(a.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                {onglet !== 'accepte' && (
                  <button onClick={() => accepter(a.id)}
                    style={{ flex: 1, padding: '7px', fontSize: 12, borderRadius: 8, border: 'none', background: 'rgba(34,197,94,0.15)', color: '#22c55e', fontWeight: 700, cursor: 'pointer', fontFamily: 'Syne' }}>
                    ✓ Accepter
                  </button>
                )}
                {onglet !== 'refuse' && (
                  <button onClick={() => refuser(a.id)}
                    style={{ flex: 1, padding: '7px', fontSize: 12, borderRadius: 8, border: 'none', background: 'rgba(239,68,68,0.12)', color: '#ef4444', fontWeight: 700, cursor: 'pointer', fontFamily: 'Syne' }}>
                    ✕ Refuser
                  </button>
                )}
                <button onClick={() => supprimer(a.id)}
                  style={{ padding: '7px 10px', fontSize: 12, borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text3)', cursor: 'pointer' }}
                  title="Supprimer définitivement">
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
