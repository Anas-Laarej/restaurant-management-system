import { useEffect, useState } from 'react';
import API from '../api';

const EMPTY_FORM = { code: '', reduction_pct: 10, actif: true, utilisations_max: 100 };

export default function Promos() {
  const [promos, setPromos] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const fetchPromos = () => API.get('/codes-promo/').then(r => setPromos(r.data.results || r.data));
  useEffect(() => { fetchPromos(); }, []);

  const openNew = () => {
    setForm(EMPTY_FORM);
    setSaveError('');
    setModal({ type: 'new' });
  };

  const openEdit = (p) => {
    setForm({ code: p.code, reduction_pct: p.reduction_pct, actif: p.actif, utilisations_max: p.utilisations_max });
    setSaveError('');
    setModal({ type: 'edit', id: p.id });
  };

  const closeModal = () => { setModal(null); setSaveError(''); };

  const save = async () => {
    if (!form.code.trim()) { setSaveError('Le code est requis.'); return; }
    setSaving(true);
    setSaveError('');
    try {
      if (modal.type === 'edit') {
        await API.patch(`/codes-promo/${modal.id}/`, form);
      } else {
        await API.post('/codes-promo/', form);
      }
      await fetchPromos();
      closeModal();
    } catch (e) {
      const data = e.response?.data;
      if (data && typeof data === 'object') {
        setSaveError(Object.values(data).flat().join(' ') || 'Erreur lors de l\'enregistrement.');
      } else {
        setSaveError('Erreur lors de l\'enregistrement.');
      }
    } finally {
      setSaving(false);
    }
  };

  const deletePromo = async (id) => {
    if (!confirm('Supprimer ce code promo ?')) return;
    await API.delete(`/codes-promo/${id}/`);
    setPromos(prev => prev.filter(p => p.id !== id));
    closeModal();
  };

  return (
    <div style={{ padding: '1.75rem' }} className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: 26, color: 'var(--text)', marginBottom: 4 }}>Codes promo</h1>
          <p style={{ color: 'var(--text3)', fontSize: 13 }}>{promos.length} code(s) au total</p>
        </div>
        <button className="btn-primary" onClick={openNew}>+ Nouveau code</button>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Réduction</th>
              <th>Utilisations</th>
              <th>Max</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {promos.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text3)' }}>Aucun code promo</td></tr>
            ) : promos.map(p => (
              <tr key={p.id}>
                <td style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.1em' }}>{p.code}</td>
                <td style={{ fontWeight: 700, color: 'var(--text)', fontSize: 15 }}>-{p.reduction_pct}%</td>
                <td style={{ color: 'var(--text2)' }}>{p.utilisations_count}</td>
                <td style={{ color: 'var(--text3)' }}>{p.utilisations_max}</td>
                <td><span className={`badge ${p.actif ? 'badge-success' : 'badge-danger'}`}>{p.actif ? 'Actif' : 'Inactif'}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn-ghost" style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => openEdit(p)}>Modifier</button>
                    <button className="btn-danger" style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => deletePromo(p.id)}>✕ Supprimer</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={closeModal}>
          <div className="card fade-in" style={{ width: 400 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, marginBottom: '1.25rem' }}>
              {modal.type === 'edit' ? 'Modifier le code promo' : 'Nouveau code promo'}
            </h3>

            {saveError && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: 8, padding: '8px 12px', color: '#ef4444', fontSize: 12, marginBottom: '1rem' }}>
                ⚠ {saveError}
              </div>
            )}

            <div style={{ display: 'grid', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text3)', display: 'block', marginBottom: 5, textTransform: 'uppercase', fontFamily: 'Syne', fontWeight: 600 }}>Code *</label>
                <input
                  value={form.code}
                  onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="ex: PROMO20"
                  disabled={modal.type === 'edit'}
                  style={{ opacity: modal.type === 'edit' ? 0.6 : 1 }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text3)', display: 'block', marginBottom: 5, textTransform: 'uppercase', fontFamily: 'Syne', fontWeight: 600 }}>Réduction (%)</label>
                  <input type="number" min="1" max="100" value={form.reduction_pct} onChange={e => setForm({ ...form, reduction_pct: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text3)', display: 'block', marginBottom: 5, textTransform: 'uppercase', fontFamily: 'Syne', fontWeight: 600 }}>Max utilisations</label>
                  <input type="number" min="1" value={form.utilisations_max} onChange={e => setForm({ ...form, utilisations_max: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <label style={{ fontSize: 13, color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.actif} onChange={e => setForm({ ...form, actif: e.target.checked })} />
                  Code actif
                </label>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button className="btn-primary" style={{ flex: 1 }} onClick={save} disabled={saving}>
                  {saving ? 'Enregistrement…' : modal.type === 'edit' ? 'Modifier' : 'Créer le code'}
                </button>
                <button className="btn-ghost" onClick={closeModal} disabled={saving}>Annuler</button>
                {modal.type === 'edit' && (
                  <button className="btn-danger" style={{ padding: '8px 14px' }} onClick={() => deletePromo(modal.id)} disabled={saving} title="Supprimer">✕</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
