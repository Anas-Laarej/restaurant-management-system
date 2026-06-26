import { useEffect, useState } from 'react';
import API from '../api';

const ROLES = [
  { value: 'gerant', label: 'Gérant' },
  { value: 'chef', label: 'Chef cuisinier' },
  { value: 'serveur', label: 'Serveur' },
  { value: 'caissier', label: 'Caissier' },
];
const roleColors = { gerant: '#f97316', chef: '#22c55e', serveur: '#3b82f6', caissier: '#a855f7' };
const roleLabels = { gerant: 'Gérant', chef: 'Chef cuisinier', serveur: 'Serveur', caissier: 'Caissier' };

const EMPTY_FORM = { username: '', password: '', first_name: '', last_name: '', role: 'serveur', telephone: '', actif: true };

export default function Personnel() {
  const [employes, setEmployes] = useState([]);
  const [modal, setModal] = useState(null); // null | 'add' | 'edit'
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = () => API.get('/employes/').then(r => setEmployes(r.data.results || r.data)).catch(() => {});

  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(EMPTY_FORM); setError(''); setModal('add'); };
  const openEdit = (e) => {
    setEditId(e.id);
    setForm({ username: e.user?.username || '', password: '', first_name: e.user?.first_name || '', last_name: e.user?.last_name || '', role: e.role, telephone: e.telephone || '', actif: e.actif });
    setError('');
    setModal('edit');
  };
  const closeModal = () => { setModal(null); setEditId(null); setError(''); };

  const save = async () => {
    setLoading(true); setError('');
    try {
      if (modal === 'add') {
        await API.post('/employes/creer/', form);
      } else {
        await API.patch(`/employes/${editId}/modifier/`, form);
      }
      await load();
      closeModal();
    } catch(e) {
      setError(e.response?.data?.error || 'Erreur lors de l\'enregistrement.');
    } finally { setLoading(false); }
  };

  const supprimer = async (e) => {
    const nom = e.nom_complet || `${e.user?.first_name || ''} ${e.user?.last_name || ''}`.trim() || e.user?.username || 'cet employé';
    if (!confirm(`Supprimer ${nom} ? Cette action est irréversible.`)) return;
    try {
      await API.delete(`/employes/${e.id}/`);
      await load();
    } catch {
      alert('Impossible de supprimer cet employé.');
    }
  };

  const inp = { background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'DM Sans, sans-serif', width: '100%', boxSizing: 'border-box' };
  const lbl = { display: 'block', fontSize: 11, color: 'var(--text3)', marginBottom: 5, fontFamily: 'Syne, sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' };

  return (
    <div style={{ padding: '1.75rem' }} className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: 26, color: 'var(--text)', marginBottom: 4 }}>Personnel</h1>
          <p style={{ color: 'var(--text3)', fontSize: 13 }}>{employes.length} employé(s)</p>
        </div>
        <button onClick={openAdd} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', fontSize: 13 }}>
          + Ajouter un employé
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {employes.map(e => {
          const color = roleColors[e.role] || 'var(--accent)';
          const initials = `${e.user?.first_name?.[0] || ''}${e.user?.last_name?.[0] || ''}`.toUpperCase() || '?';
          return (
            <div key={e.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 46, height: 46, borderRadius: '50%', background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne', fontWeight: 800, fontSize: 16, color, flexShrink: 0 }}>
                  {initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{e.user?.first_name} {e.user?.last_name}</div>
                  <div style={{ fontSize: 12, color, fontWeight: 600 }}>{roleLabels[e.role]}</div>
                  {e.telephone && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{e.telephone}</div>}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span className={`badge ${e.actif ? 'badge-success' : 'badge-gray'}`}>{e.actif ? 'Actif' : 'Inactif'}</span>
                  <span className="badge badge-gray">Depuis {new Date(e.date_embauche).toLocaleDateString('fr-FR')}</span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => openEdit(e)} style={{ padding: '5px 10px', background: 'var(--accent-dim)', border: 'none', borderRadius: 7, color: 'var(--accent)', fontSize: 12, cursor: 'pointer', fontFamily: 'Syne', fontWeight: 600 }}>✏️ Modifier</button>
                  <button onClick={() => supprimer(e)} style={{ padding: '5px 10px', background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: 7, color: '#ef4444', fontSize: 12, cursor: 'pointer', fontFamily: 'Syne', fontWeight: 600 }}>🗑️</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 20, padding: '2rem', width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 20, color: 'var(--text)', marginBottom: '1.5rem' }}>
              {modal === 'add' ? '+ Ajouter un employé' : '✏️ Modifier l\'employé'}
            </h2>

            <div style={{ display: 'grid', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={lbl}>Prénom *</label>
                  <input style={inp} value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} placeholder="Prénom" />
                </div>
                <div>
                  <label style={lbl}>Nom</label>
                  <input style={inp} value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} placeholder="Nom de famille" />
                </div>
              </div>

              {modal === 'add' && (
                <>
                  <div>
                    <label style={lbl}>Identifiant (login) *</label>
                    <input style={inp} value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="ex: ali_benjelloun" autoComplete="off" />
                  </div>
                  <div>
                    <label style={lbl}>Mot de passe *</label>
                    <input type="password" style={inp} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Min. 6 caractères" autoComplete="new-password" />
                  </div>
                </>
              )}

              <div>
                <label style={lbl}>Rôle *</label>
                <select style={inp} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>

              <div>
                <label style={lbl}>Téléphone</label>
                <input style={inp} value={form.telephone} onChange={e => setForm({ ...form, telephone: e.target.value })} placeholder="+212 6XX XXX XXX" />
              </div>

              {modal === 'edit' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="checkbox" id="actif" checked={form.actif} onChange={e => setForm({ ...form, actif: e.target.checked })} style={{ width: 16, height: 16, cursor: 'pointer' }} />
                  <label htmlFor="actif" style={{ fontSize: 13, color: 'var(--text)', cursor: 'pointer' }}>Employé actif</label>
                </div>
              )}

              {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: 8, padding: '10px 14px', color: '#ef4444', fontSize: 13 }}>⚠ {error}</div>}

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                <button onClick={closeModal} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text2)', fontSize: 13, cursor: 'pointer', fontFamily: 'Syne', fontWeight: 600 }}>Annuler</button>
                <button onClick={save} disabled={loading} className="btn-primary" style={{ padding: '10px 24px', fontSize: 13 }}>
                  {loading ? '⏳ Enregistrement...' : modal === 'add' ? 'Créer l\'employé' : 'Enregistrer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
