import { useEffect, useState } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';

const HEURES = ['11:30','12:00','12:30','13:00','13:30','14:00','14:30','19:00','19:30','20:00','20:30','21:00','21:30','22:00','22:30'];
const todayStr = () => new Date().toISOString().split('T')[0];

function ReservationModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ client_nom: '', client_tel: '', date: todayStr(), heure: '12:00', nombre_personnes: 2, table_id: '', notes: '' });
  const [tablesDispos, setTablesDispos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!form.date || !form.heure || !form.nombre_personnes) return;
    API.get('/tables-disponibles/', { params: { date_heure: `${form.date}T${form.heure}:00`, nombre_personnes: form.nombre_personnes } })
      .then(r => setTablesDispos(r.data || []))
      .catch(() => setTablesDispos([]));
  }, [form.date, form.heure, form.nombre_personnes]);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v, ...(['date','heure','nombre_personnes'].includes(k) ? { table_id: '' } : {}) }));

  const submit = async () => {
    if (!form.client_nom.trim()) return setError('Nom du client requis.');
    if (!form.table_id) return setError('Veuillez choisir une table.');
    setLoading(true); setError('');
    try {
      await API.post('/reserver/', {
        client_nom: form.client_nom, client_tel: form.client_tel,
        date_heure: `${form.date}T${form.heure}:00`,
        nombre_personnes: form.nombre_personnes, table_id: form.table_id, notes: form.notes,
      });
      onSuccess();
    } catch (e) {
      setError(e.response?.data?.error || e.response?.data?.detail || 'Erreur lors de la réservation.');
    } finally { setLoading(false); }
  };

  const inp = { width: '100%', padding: '9px 12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 13 };
  const lbl = { fontSize: 11, color: 'var(--text3)', fontFamily: 'Syne,sans-serif', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4, display: 'block' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div className="card" style={{ width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: 18, color: 'var(--text)' }}>Nouvelle réservation</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, color: 'var(--text3)', cursor: 'pointer' }}>✕</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div style={{ gridColumn: '1/-1' }}>
            <label style={lbl}>Nom du client *</label>
            <input style={inp} placeholder="Nom complet" value={form.client_nom} onChange={e => set('client_nom', e.target.value)} />
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <label style={lbl}>Téléphone</label>
            <input style={inp} placeholder="+212 6XX XXX XXX" value={form.client_tel} onChange={e => set('client_tel', e.target.value)} />
          </div>
          <div>
            <label style={lbl}>Date *</label>
            <input type="date" style={inp} value={form.date} min={todayStr()} onChange={e => set('date', e.target.value)} />
          </div>
          <div>
            <label style={lbl}>Heure *</label>
            <select style={inp} value={form.heure} onChange={e => set('heure', e.target.value)}>
              {HEURES.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Nombre de personnes *</label>
            <input type="number" style={inp} min={1} max={20} value={form.nombre_personnes} onChange={e => set('nombre_personnes', parseInt(e.target.value) || 1)} />
          </div>
          <div>
            <label style={lbl}>Table *</label>
            <select style={inp} value={form.table_id} onChange={e => set('table_id', e.target.value)}>
              <option value="">-- Choisir --</option>
              {tablesDispos.map(t => <option key={t.id} value={t.id}>Table {t.numero} ({t.capacite} pers.)</option>)}
            </select>
            {tablesDispos.length === 0 && <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 4 }}>Aucune table disponible pour ce créneau</div>}
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <label style={lbl}>Notes</label>
            <textarea style={{ ...inp, resize: 'vertical', minHeight: 72 }} placeholder="Allergies, demandes spéciales…" value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>
        </div>
        {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: 8, padding: '9px 12px', color: '#ef4444', fontSize: 12, marginBottom: 12 }}>⚠ {error}</div>}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn-ghost" onClick={onClose}>Annuler</button>
          <button className="btn-primary" onClick={submit} disabled={loading}>{loading ? 'Envoi…' : 'Réserver'}</button>
        </div>
      </div>
    </div>
  );
}

const STATUT_RES = {
  en_attente: { label: 'En attente', color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
  confirmee:  { label: 'Confirmée',  color: '#22c55e', bg: 'rgba(34,197,94,0.12)'  },
  annulee:    { label: 'Annulée',    color: '#ef4444', bg: 'rgba(239,68,68,0.12)'  },
  terminee:   { label: 'Terminée',   color: '#9ba3b5', bg: 'rgba(255,255,255,0.06)'},
};

const STATUT_TABLE = {
  libre:    { label: 'Libre',    color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   dot: '#22c55e' },
  occupee:  { label: 'Occupée', color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   dot: '#ef4444' },
  reservee: { label: 'Réservée',color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  dot: '#3b82f6' },
  fermee:   { label: 'Fermée',  color: '#9ba3b5', bg: 'rgba(255,255,255,0.06)', dot: '#9ba3b5' },
};

export default function Reservations() {
  const { role } = useAuth();
  const canAct = role === 'gerant' || role === 'serveur';
  const [reservations, setReservations] = useState([]);
  const [tables, setTables]             = useState([]);
  const [filtre, setFiltre]             = useState('');
  const [loading, setLoading]           = useState(true);
  const [acting, setActing]             = useState(null);
  const [showModal, setShowModal]        = useState(false);
  const [successMsg, setSuccessMsg]      = useState('');

  const actOnReservation = async (pk, nouveau_statut) => {
    setActing(pk + nouveau_statut);
    try {
      await API.patch(`/reservations/${pk}/confirmer/`, { statut: nouveau_statut });
      await fetchData();
    } finally {
      setActing(null);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [r1, r2] = await Promise.all([
        API.get('/reservations/'),
        API.get('/tables/'),
      ]);
      const raw = r1.data.results || r1.data;
      setReservations([...raw].sort((a, b) => new Date(b.date_heure) - new Date(a.date_heure)));
      setTables((r2.data.results || r2.data).sort((a, b) => a.numero - b.numero));
    } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchData();
    const t = setInterval(fetchData, 15000);
    return () => clearInterval(t);
  }, []);

  const filtered = filtre ? reservations.filter(r => r.statut === filtre) : reservations;

  const countByStatut = (s) => tables.filter(t => t.statut === s).length;

  const handleSuccess = () => {
    setShowModal(false);
    setSuccessMsg('Réservation créée avec succès.');
    fetchData();
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div style={{ padding: '1.75rem' }} className="fade-in">
      {showModal && <ReservationModal onClose={() => setShowModal(false)} onSuccess={handleSuccess} />}

      {/* ── En-tête ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: 26, color: 'var(--text)', marginBottom: 4 }}>Vue d'ensemble</h1>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <p style={{ color: 'var(--text3)', fontSize: 13 }}>{tables.length} tables · {reservations.length} réservation(s)</p>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }} className="pulse" />
            <span style={{ fontSize: 11, color: 'var(--success)' }}>Actualisation auto</span>
          </div>
        </div>
        {canAct && (
          <button className="btn-primary" onClick={() => setShowModal(true)}>+ Nouvelle réservation</button>
        )}
      </div>

      {successMsg && (
        <div style={{ background: 'var(--success-dim)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10, padding: '10px 14px', color: 'var(--success)', fontSize: 13, marginBottom: '1rem', fontWeight: 600 }}>
          ✓ {successMsg}
        </div>
      )}

      {/* ── Résumé statuts tables ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: '1.5rem' }}>
        {Object.entries(STATUT_TABLE).map(([key, s]) => (
          <div key={key} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: s.dot }} />
            </div>
            <div>
              <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 22, color: s.color, lineHeight: 1 }}>{countByStatut(key)}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Grille des tables ── */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: 12, color: 'var(--text3)', textTransform: 'uppercase', fontFamily: 'Syne', fontWeight: 600, letterSpacing: '0.06em', marginBottom: '1rem' }}>
          Plan des tables
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {tables.map(t => {
            const s = STATUT_TABLE[t.statut] || STATUT_TABLE.libre;
            return (
              <div key={t.id} style={{ width: 72, textAlign: 'center', padding: '10px 6px', borderRadius: 12, background: s.bg, border: `1.5px solid ${s.dot}22` }}>
                <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 16, color: s.color }}>T{t.numero}</div>
                <div style={{ fontSize: 10, color: s.color, marginTop: 2, fontFamily: 'Syne', fontWeight: 600 }}>{s.label}</div>
                <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 3 }}>{t.capacite} pers.</div>
              </div>
            );
          })}
        </div>
        {/* Légende */}
        <div style={{ display: 'flex', gap: 16, marginTop: '1rem', flexWrap: 'wrap' }}>
          {Object.entries(STATUT_TABLE).map(([key, s]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.dot }} />
              <span style={{ fontSize: 11, color: 'var(--text3)' }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Liste des réservations (lecture seule) ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1rem', flexWrap: 'wrap' }}>
        {[['', 'Toutes'], ['en_attente', 'En attente'], ['confirmee', 'Confirmées'], ['annulee', 'Annulées']].map(([v, l]) => (
          <button key={v} onClick={() => setFiltre(v)}
            style={{ padding: '6px 14px', fontSize: 12, fontFamily: 'Syne,sans-serif', fontWeight: 600, borderRadius: 20, border: '1px solid', borderColor: filtre === v ? 'var(--accent)' : 'var(--border)', background: filtre === v ? 'var(--accent-dim)' : 'transparent', color: filtre === v ? 'var(--accent)' : 'var(--text2)', cursor: 'pointer', transition: 'all 0.15s' }}>
            {l}
          </button>
        ))}
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Client</th>
              <th>Table</th>
              <th>Date & Heure</th>
              <th>Personnes</th>
              <th>Notes</th>
              <th>Statut</th>
              {canAct && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={canAct ? 7 : 6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text3)' }}>Chargement...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={canAct ? 7 : 6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text3)' }}>Aucune réservation</td></tr>
            ) : filtered.map(r => {
              const st = STATUT_RES[r.statut] || STATUT_RES.en_attente;
              const isPending = r.statut === 'en_attente';
              return (
                <tr key={r.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text)' }}>{r.client_nom}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>{r.client_email || r.client_tel || '—'}</div>
                  </td>
                  <td style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, color: 'var(--accent)' }}>Table {r.table_numero}</td>
                  <td>
                    <div style={{ color: 'var(--text)', fontWeight: 500 }}>
                      {new Date(r.date_heure).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text3)' }}>
                      {new Date(r.date_heure).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text)' }}>{r.nombre_personnes}</td>
                  <td style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text3)', fontSize: 12 }}>{r.notes || '—'}</td>
                  <td>
                    <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, background: st.bg, color: st.color, fontFamily: 'Syne,sans-serif', fontWeight: 700 }}>
                      {st.label}
                    </span>
                  </td>
                  {canAct && (
                    <td>
                      {isPending ? (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            disabled={acting !== null}
                            onClick={() => actOnReservation(r.id, 'confirmee')}
                            style={{ padding: '5px 11px', fontSize: 11, fontFamily: 'Syne,sans-serif', fontWeight: 700, borderRadius: 8, border: 'none', cursor: acting ? 'wait' : 'pointer', background: 'rgba(34,197,94,0.15)', color: '#22c55e', transition: 'all 0.15s', opacity: acting === r.id + 'confirmee' ? 0.6 : 1 }}
                          >
                            ✓ Confirmer
                          </button>
                          <button
                            disabled={acting !== null}
                            onClick={() => actOnReservation(r.id, 'annulee')}
                            style={{ padding: '5px 11px', fontSize: 11, fontFamily: 'Syne,sans-serif', fontWeight: 700, borderRadius: 8, border: 'none', cursor: acting ? 'wait' : 'pointer', background: 'rgba(239,68,68,0.15)', color: '#ef4444', transition: 'all 0.15s', opacity: acting === r.id + 'annulee' ? 0.6 : 1 }}
                          >
                            ✕ Annuler
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: 11, color: 'var(--text3)' }}>—</span>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
