import { useEffect, useState } from 'react';
import API from '../api';

const HEURES = ['11:30','12:00','12:30','13:00','13:30','14:00','14:30','19:00','19:30','20:00','20:30','21:00','21:30','22:00','22:30'];

const STATUT_RES = {
  en_attente: { label: 'En attente', color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
  confirmee:  { label: 'Confirmée',  color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  annulee:    { label: 'Annulée',    color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  terminee:   { label: 'Terminée',   color: '#9ba3b5', bg: 'rgba(255,255,255,0.06)' },
};

const todayStr = () => new Date().toISOString().split('T')[0];

function ReservationModal({ onClose, onSuccess }) {
  const [form, setForm]           = useState({ client_nom: '', client_tel: '', date: todayStr(), heure: '12:00', nombre_personnes: 2, table_id: '', notes: '' });
  const [tablesDispos, setTablesDispos] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  useEffect(() => {
    if (!form.date || !form.heure || !form.nombre_personnes) return;
    const date_heure = `${form.date}T${form.heure}:00`;
    API.get('/tables-disponibles/', { params: { date_heure, nombre_personnes: form.nombre_personnes } })
      .then(r => setTablesDispos(r.data || []))
      .catch(() => setTablesDispos([]));
  }, [form.date, form.heure, form.nombre_personnes]);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v, ...((['date','heure','nombre_personnes'].includes(k)) ? { table_id: '' } : {}) }));

  const submit = async () => {
    if (!form.client_nom.trim()) return setError('Nom du client requis.');
    if (!form.table_id) return setError('Veuillez choisir une table.');
    setLoading(true); setError('');
    try {
      const payload = {
        client_nom: form.client_nom,
        client_tel: form.client_tel,
        date_heure: `${form.date}T${form.heure}:00`,
        nombre_personnes: form.nombre_personnes,
        table_id: form.table_id,
        notes: form.notes,
      };
      await API.post('/reserver/', payload);
      onSuccess();
    } catch (e) {
      setError(e.response?.data?.error || e.response?.data?.detail || 'Erreur lors de la réservation.');
    } finally { setLoading(false); }
  };

  const inputStyle = { width: '100%', padding: '9px 12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 13 };
  const labelStyle = { fontSize: 11, color: 'var(--text3)', fontFamily: 'Syne,sans-serif', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4, display: 'block' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div className="card" style={{ width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: 18, color: 'var(--text)' }}>Nouvelle réservation</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, color: 'var(--text3)', cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div style={{ gridColumn: '1/-1' }}>
            <label style={labelStyle}>Nom du client *</label>
            <input style={inputStyle} placeholder="Nom complet" value={form.client_nom} onChange={e => set('client_nom', e.target.value)} />
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <label style={labelStyle}>Téléphone</label>
            <input style={inputStyle} placeholder="+212 6XX XXX XXX" value={form.client_tel} onChange={e => set('client_tel', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Date *</label>
            <input type="date" style={inputStyle} value={form.date} min={todayStr()} onChange={e => set('date', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Heure *</label>
            <select style={inputStyle} value={form.heure} onChange={e => set('heure', e.target.value)}>
              {HEURES.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Nombre de personnes *</label>
            <input type="number" style={inputStyle} min={1} max={20} value={form.nombre_personnes} onChange={e => set('nombre_personnes', parseInt(e.target.value) || 1)} />
          </div>
          <div>
            <label style={labelStyle}>Table *</label>
            <select style={inputStyle} value={form.table_id} onChange={e => set('table_id', e.target.value)}>
              <option value="">-- Choisir --</option>
              {tablesDispos.map(t => <option key={t.id} value={t.id}>Table {t.numero} ({t.capacite} pers.)</option>)}
            </select>
            {tablesDispos.length === 0 && <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 4 }}>Aucune table disponible pour ce créneau</div>}
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <label style={labelStyle}>Notes</label>
            <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 72 }} placeholder="Allergies, demandes spéciales…" value={form.notes} onChange={e => set('notes', e.target.value)} />
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

function TabReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showModal, setShowModal]       = useState(false);
  const [success, setSuccess]           = useState('');
  const [filtre, setFiltre]             = useState('today');

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const r = await API.get('/reservations/');
      setReservations(r.data.results || r.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchReservations(); const t = setInterval(fetchReservations, 15000); return () => clearInterval(t); }, []);

  const handleSuccess = () => {
    setShowModal(false);
    setSuccess('Réservation créée avec succès.');
    fetchReservations();
    setTimeout(() => setSuccess(''), 4000);
  };

  const confirmer = async (id) => {
    try { await API.patch(`/reservations/${id}/confirmer/`, { statut: 'confirmee' }); fetchReservations(); } catch {}
  };
  const annuler = async (id) => {
    if (!window.confirm('Annuler cette réservation ?')) return;
    try { await API.patch(`/reservations/${id}/confirmer/`, { statut: 'annulee' }); fetchReservations(); } catch {}
  };

  const today = todayStr();
  const filtered = reservations.filter(r => {
    if (filtre === 'today') return r.date_heure?.startsWith(today);
    if (filtre === 'en_attente') return r.statut === 'en_attente';
    return true;
  });

  return (
    <div style={{ padding: '1.75rem' }} className="fade-in">
      {showModal && <ReservationModal onClose={() => setShowModal(false)} onSuccess={handleSuccess} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h1 style={{ fontSize: 22, color: 'var(--text)', marginBottom: 4 }}>Réservations</h1>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }} className="pulse" />
            <span style={{ fontSize: 11, color: 'var(--success)' }}>Actualisation auto</span>
          </div>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>+ Nouvelle réservation</button>
      </div>

      {success && <div style={{ background: 'var(--success-dim)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10, padding: '10px 14px', color: 'var(--success)', fontSize: 13, marginBottom: '1rem', fontWeight: 600 }}>✓ {success}</div>}

      <div style={{ display: 'flex', gap: 8, marginBottom: '1.25rem' }}>
        {[['today', "Aujourd'hui"], ['en_attente', 'En attente'], ['all', 'Toutes']].map(([v, l]) => (
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
              <th>Pers.</th>
              <th>Notes</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text3)' }}>Chargement…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text3)' }}>Aucune réservation</td></tr>
            ) : filtered.map(r => {
              const st = STATUT_RES[r.statut] || STATUT_RES.en_attente;
              return (
                <tr key={r.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text)' }}>{r.client_nom}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>{r.client_tel || r.client_email || '—'}</div>
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
                  <td style={{ maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text3)', fontSize: 12 }}>{r.notes || '—'}</td>
                  <td>
                    <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, background: st.bg, color: st.color, fontFamily: 'Syne,sans-serif', fontWeight: 700 }}>{st.label}</span>
                  </td>
                  <td>
                    {r.statut === 'en_attente' && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn-success" style={{ fontSize: 11, padding: '5px 10px' }} onClick={() => confirmer(r.id)}>✓</button>
                        <button className="btn-danger" style={{ fontSize: 11, padding: '5px 10px' }} onClick={() => annuler(r.id)}>✕</button>
                      </div>
                    )}
                    {r.statut === 'confirmee' && <button className="btn-ghost" style={{ fontSize: 11, padding: '5px 10px' }} onClick={() => annuler(r.id)}>Annuler</button>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TabCommandes() {
  const [tables, setTables]           = useState([]);
  const [plats, setPlats]             = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [panier, setPanier]           = useState([]);
  const [codePromo, setCodePromo]     = useState('');
  const [promoInfo, setPromoInfo]     = useState(null);
  const [success, setSuccess]         = useState('');
  const [commandesActives, setCommandesActives] = useState([]);
  const [annulSuccess, setAnnulSuccess] = useState('');

  const fetchActives = async () => {
    const [r1, r2] = await Promise.all([
      API.get('/commandes/?statut=en_attente'),
      API.get('/commandes/?statut=en_preparation'),
    ]);
    setCommandesActives([...(r1.data.results||r1.data), ...(r2.data.results||r2.data)]);
  };

  useEffect(() => {
    API.get('/tables/').then(r => setTables(r.data.results || r.data));
    API.get('/plats/?disponible=true').then(r => setPlats(r.data.results || r.data));
    fetchActives();
    const t = setInterval(fetchActives, 12000);
    return () => clearInterval(t);
  }, []);

  const accepterCommande = async (id) => {
    await API.patch(`/commandes/${id}/changer_statut/`, { statut: 'en_preparation' });
    fetchActives();
    refreshTables();
  };

  const annulerCommande = async (id) => {
    if (!window.confirm('Refuser / annuler cette commande ?')) return;
    await API.patch(`/commandes/${id}/changer_statut/`, { statut: 'annulee' });
    setAnnulSuccess('Commande annulée.');
    fetchActives();
    refreshTables();
    setTimeout(() => setAnnulSuccess(''), 3000);
  };

  const refreshTables = () => API.get('/tables/').then(r => setTables(r.data.results || r.data));

  const tablesLibres = tables.filter(t => t.statut === 'libre' || t.statut === 'reservee');

  const ajouterPlat = (plat) => {
    setPanier(prev => {
      const ex = prev.find(i => i.plat_id === plat.id);
      if (ex) return prev.map(i => i.plat_id === plat.id ? { ...i, quantite: i.quantite + 1 } : i);
      return [...prev, { plat_id: plat.id, nom: plat.nom, prix: parseFloat(plat.prix), quantite: 1 }];
    });
  };

  const retirerPlat = (id) => setPanier(prev => prev.filter(i => i.plat_id !== id));

  const validerPromo = async () => {
    try { const r = await API.post('/codes-promo/valider/', { code: codePromo }); setPromoInfo(r.data); }
    catch { setPromoInfo({ valide: false }); }
  };

  const total       = panier.reduce((s, i) => s + i.prix * i.quantite, 0);
  const totalApres  = promoInfo?.valide ? total * (1 - promoInfo.reduction / 100) : total;

  const [erreurSoumission, setErreurSoumission] = useState('');

  const soumettre = async () => {
    if (!selectedTable || panier.length === 0) return;
    setErreurSoumission('');
    try {
      await API.post('/commandes/nouvelle/', {
        table_id: selectedTable.id,
        items: panier.map(i => ({ plat_id: i.plat_id, quantite: i.quantite })),
        code_promo: promoInfo?.valide ? codePromo : '',
      });
      setSuccess(`Commande envoyée en cuisine — Table ${selectedTable.numero}`);
      setPanier([]); setSelectedTable(null); setCodePromo(''); setPromoInfo(null);
      refreshTables();
      setTimeout(() => setSuccess(''), 4000);
    } catch (e) {
      setErreurSoumission(e.response?.data?.error || 'Erreur lors de la création de la commande.');
    }
  };

  return (
    <>
    <div style={{ padding: '1.75rem', display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, minHeight: '80vh' }} className="fade-in">
      <div>
        <h1 style={{ fontSize: 22, color: 'var(--text)', marginBottom: '1.25rem' }}>Interface salle</h1>
        {success && <div style={{ background: 'var(--success-dim)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10, padding: '12px 16px', color: 'var(--success)', fontSize: 13, marginBottom: '1rem', fontWeight: 600 }}>✓ {success}</div>}

        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 8, textTransform: 'uppercase', fontFamily: 'Syne', fontWeight: 600 }}>Sélectionner une table libre</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {tablesLibres.map(t => (
              <button key={t.id} onClick={() => setSelectedTable(t)} style={{ width: 52, height: 52, borderRadius: 10, border: `2px solid ${selectedTable?.id === t.id ? 'var(--accent)' : 'var(--border)'}`, background: selectedTable?.id === t.id ? 'var(--accent-dim)' : 'var(--bg2)', color: selectedTable?.id === t.id ? 'var(--accent)' : 'var(--text2)', fontFamily: 'Syne', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all 0.15s' }}>T{t.numero}</button>
            ))}
            {tablesLibres.length === 0 && <p style={{ color: 'var(--text3)', fontSize: 13 }}>Aucune table libre disponible</p>}
          </div>
        </div>

        <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 10, textTransform: 'uppercase', fontFamily: 'Syne', fontWeight: 600 }}>Menu disponible</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
          {plats.map(p => (
            <div key={p.id} className="card" style={{ cursor: 'pointer', transition: 'all 0.2s' }}
              onClick={() => ajouterPlat(p)}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
              <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 4 }}>{p.nom}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 8 }}>{p.categorie_nom}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 16, fontFamily: 'Syne', fontWeight: 800, color: 'var(--accent)' }}>{parseFloat(p.prix).toFixed(0)} DH</span>
                <span style={{ fontSize: 18, color: 'var(--text3)' }}>+</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="card" style={{ position: 'sticky', top: '1.75rem' }}>
          <h3 style={{ fontSize: 16, color: 'var(--text)', marginBottom: '1rem' }}>
            {selectedTable ? `Commande — Table ${selectedTable.numero}` : 'Nouvelle commande'}
          </h3>
          {panier.length === 0 ? (
            <p style={{ color: 'var(--text3)', fontSize: 13, textAlign: 'center', padding: '1.5rem 0' }}>Cliquez sur un plat pour l'ajouter</p>
          ) : (
            <>
              {panier.map(i => (
                <div key={i.plat_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{i.nom}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>× {i.quantite} — {(i.prix * i.quantite).toFixed(0)} DH</div>
                  </div>
                  <button onClick={() => retirerPlat(i.plat_id)} style={{ background: 'var(--danger-dim)', border: 'none', color: 'var(--danger)', borderRadius: 6, width: 24, height: 24, fontSize: 14, cursor: 'pointer' }}>✕</button>
                </div>
              ))}
              <div style={{ marginTop: '1rem' }}>
                <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                  <input placeholder="Code promo" value={codePromo} onChange={e => setCodePromo(e.target.value)} style={{ flex: 1, fontSize: 12 }} />
                  <button className="btn-ghost" style={{ fontSize: 12, padding: '8px 10px', whiteSpace: 'nowrap' }} onClick={validerPromo}>Valider</button>
                </div>
                {promoInfo && <div style={{ fontSize: 12, marginBottom: 8, color: promoInfo.valide ? 'var(--success)' : 'var(--danger)' }}>{promoInfo.valide ? `✓ -${promoInfo.reduction}% appliqué` : '✕ Code invalide'}</div>}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid var(--border)' }}>
                  <span style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--text)' }}>Total</span>
                  <div style={{ textAlign: 'right' }}>
                    {promoInfo?.valide && <div style={{ fontSize: 11, color: 'var(--text3)', textDecoration: 'line-through' }}>{total.toFixed(0)} DH</div>}
                    <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 18, color: 'var(--accent)' }}>{totalApres.toFixed(0)} DH</div>
                  </div>
                </div>
                {erreurSoumission && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: 8, padding: '8px 12px', color: '#ef4444', fontSize: 12, marginBottom: 6 }}>⚠ {erreurSoumission}</div>}
                <button className="btn-primary" style={{ width: '100%', padding: '11px', marginTop: 4 }} onClick={soumettre} disabled={!selectedTable}>
                  {selectedTable ? 'Envoyer en cuisine' : 'Sélectionner une table'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>

    {/* ── Commandes en cours ── */}
    {(commandesActives.length > 0 || annulSuccess) && (
      <div style={{ padding: '0 1.75rem 1.75rem' }}>
        {annulSuccess && (
          <div style={{ background: 'var(--success-dim)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10, padding: '10px 14px', color: 'var(--success)', fontSize: 13, marginBottom: 12, fontWeight: 600 }}>✓ {annulSuccess}</div>
        )}
        {commandesActives.length > 0 && (
          <>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 10, textTransform: 'uppercase', fontFamily: 'Syne', fontWeight: 600, letterSpacing: '0.06em' }}>
              Commandes en cours — {commandesActives.length}
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              {commandesActives.map(cmd => {
                const isOnline = cmd.notes && cmd.notes.includes('[COMMANDE EN LIGNE');
                const isAttente = cmd.statut === 'en_attente';
                return (
                  <div key={cmd.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', borderColor: isOnline && isAttente ? 'rgba(249,115,22,0.5)' : 'var(--border)', background: isOnline && isAttente ? 'rgba(249,115,22,0.04)' : undefined }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--accent)' }}>
                          #{String(cmd.id).padStart(4, '0')} — {cmd.table_numero ? `Table ${cmd.table_numero}` : '—'}
                        </span>
                        {isOnline && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: 'rgba(249,115,22,0.15)', color: 'var(--accent)', fontFamily: 'Syne', fontWeight: 700 }}>🌐 En ligne</span>}
                        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: isAttente ? 'rgba(59,130,246,0.12)' : 'rgba(249,115,22,0.12)', color: isAttente ? 'var(--info)' : 'var(--warn)', fontFamily: 'Syne', fontWeight: 700 }}>
                          {isAttente ? '⏳ En attente' : '🍳 En préparation'}
                        </span>
                      </div>
                      {isOnline && cmd.notes && (
                        <div style={{ fontSize: 11, color: 'var(--accent)', marginBottom: 4 }}>
                          {cmd.notes.replace('[COMMANDE EN LIGNE - ', '👤 ').replace(']', '')}
                        </div>
                      )}
                      <div style={{ fontSize: 12, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {cmd.items?.map(i => `${i.plat_nom} ×${i.quantite}`).join(' · ')}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      <span style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--text)' }}>{parseFloat(cmd.montant_total).toFixed(0)} DH</span>
                      {isAttente && (
                        <button className="btn-success" style={{ fontSize: 11, padding: '5px 12px' }} onClick={() => accepterCommande(cmd.id)}>✓ Accepter</button>
                      )}
                      <button className="btn-danger" style={{ fontSize: 11, padding: '5px 12px' }} onClick={() => annulerCommande(cmd.id)}>✕ {isAttente ? 'Refuser' : 'Annuler'}</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    )}
    </>
  );
}

export default function Salle() {
  const [onglet, setOnglet] = useState('commandes');

  const tabStyle = (active) => ({
    padding: '9px 20px',
    fontFamily: 'Syne, sans-serif',
    fontWeight: 700,
    fontSize: 13,
    border: 'none',
    borderBottom: `2px solid ${active ? 'var(--accent)' : 'transparent'}`,
    background: 'transparent',
    color: active ? 'var(--accent)' : 'var(--text2)',
    cursor: 'pointer',
    transition: 'all 0.15s',
  });

  return (
    <div>
      <div style={{ borderBottom: '1px solid var(--border)', display: 'flex', gap: 4, padding: '0 1.75rem', background: 'var(--bg2)' }}>
        <button style={tabStyle(onglet === 'commandes')} onClick={() => setOnglet('commandes')}>◉ Commandes</button>
        <button style={tabStyle(onglet === 'reservations')} onClick={() => setOnglet('reservations')}>📅 Réservations</button>
      </div>
      {onglet === 'commandes'   && <TabCommandes />}
      {onglet === 'reservations' && <TabReservations />}
    </div>
  );
}
