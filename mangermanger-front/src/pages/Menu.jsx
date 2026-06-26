import { useEffect, useState } from 'react';
import API from '../api';

const EMPTY_FORM = { nom: '', description: '', prix: '', categorie: '', disponible: true, temps_preparation: 20 };

export default function Menu() {
  const [plats, setPlats] = useState([]);
  const [cats, setCats] = useState([]);
  const [catFiltre, setCatFiltre] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const fetchPlats = () => API.get('/plats/').then(r => setPlats(r.data.results || r.data));

  useEffect(() => {
    fetchPlats();
    API.get('/categories/').then(r => setCats(r.data.results || r.data));
  }, []);

  const filtered = catFiltre ? plats.filter(p => p.categorie === parseInt(catFiltre)) : plats;

  const openNew = () => {
    setSaveError('');
    setForm({ ...EMPTY_FORM, categorie: cats[0]?.id || '' });
    setModal({ type: 'new' });
  };

  const openEdit = (p) => {
    setSaveError('');
    setForm({ nom: p.nom, description: p.description || '', prix: p.prix, categorie: p.categorie, disponible: p.disponible, temps_preparation: p.temps_preparation });
    setModal({ type: 'edit', id: p.id });
  };

  const closeModal = () => { setModal(null); setSaveError(''); };

  const save = async () => {
    if (!form.nom.trim()) { setSaveError('Le nom est requis.'); return; }
    if (!form.prix || isNaN(form.prix)) { setSaveError('Le prix est requis.'); return; }
    if (!form.categorie) { setSaveError('Veuillez sélectionner une catégorie.'); return; }
    setSaving(true);
    setSaveError('');
    try {
      if (modal.type === 'edit') {
        await API.patch(`/plats/${modal.id}/`, form);
      } else {
        await API.post('/plats/', form);
      }
      await fetchPlats();
      closeModal();
    } catch (e) {
      const data = e.response?.data;
      if (data && typeof data === 'object') {
        const msg = Object.values(data).flat().join(' ');
        setSaveError(msg || 'Erreur lors de l\'enregistrement.');
      } else {
        setSaveError('Erreur lors de l\'enregistrement.');
      }
    } finally {
      setSaving(false);
    }
  };

  const toggleDispo = async (p) => {
    await API.patch(`/plats/${p.id}/`, { disponible: !p.disponible });
    fetchPlats();
  };

  const deletePlat = async (id) => {
    if (!confirm('Supprimer ce plat définitivement ?')) return;
    await API.delete(`/plats/${id}/`);
    setPlats(prev => prev.filter(p => p.id !== id));
    closeModal();
  };

  return (
    <div style={{ padding: '1.75rem' }} className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: 26, color: 'var(--text)', marginBottom: 4 }}>Menu & Plats</h1>
          <p style={{ color: 'var(--text3)', fontSize: 13 }}>{plats.length} plat(s) au total</p>
        </div>
        <button className="btn-primary" onClick={openNew}>+ Nouveau plat</button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <button onClick={() => setCatFiltre('')} style={{ padding: '6px 14px', fontSize: 12, fontFamily: 'Syne', fontWeight: 600, borderRadius: 20, border: '1px solid', borderColor: !catFiltre ? 'var(--accent)' : 'var(--border)', background: !catFiltre ? 'var(--accent-dim)' : 'transparent', color: !catFiltre ? 'var(--accent)' : 'var(--text2)', cursor: 'pointer', transition: 'all 0.15s' }}>Tous</button>
        {cats.map(c => (
          <button key={c.id} onClick={() => setCatFiltre(String(c.id))} style={{ padding: '6px 14px', fontSize: 12, fontFamily: 'Syne', fontWeight: 600, borderRadius: 20, border: '1px solid', borderColor: catFiltre === String(c.id) ? 'var(--accent)' : 'var(--border)', background: catFiltre === String(c.id) ? 'var(--accent-dim)' : 'transparent', color: catFiltre === String(c.id) ? 'var(--accent)' : 'var(--text2)', cursor: 'pointer', transition: 'all 0.15s' }}>{c.nom}</button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text3)', background: 'var(--bg2)', borderRadius: 12, border: '1px solid var(--border)' }}>
          Aucun plat{catFiltre ? ' dans cette catégorie' : ''}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
        {filtered.map(p => (
          <div key={p.id} className="card" style={{ opacity: p.disponible ? 1 : 0.55, transition: 'all 0.2s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div>
                <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 2 }}>{p.nom}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>{p.categorie_nom}</div>
              </div>
              <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 18, color: 'var(--accent)' }}>{parseFloat(p.prix).toFixed(0)} DH</div>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 12, lineHeight: 1.5 }}>{p.description || 'Aucune description'}</p>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 10 }}>
              <span className="badge badge-gray">⏱ {p.temps_preparation} min</span>
              <span className={`badge ${p.disponible ? 'badge-success' : 'badge-danger'}`}>{p.disponible ? 'Disponible' : 'Indisponible'}</span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn-ghost" style={{ flex: 1, fontSize: 11, padding: '6px' }} onClick={() => openEdit(p)}>Modifier</button>
              <button className={p.disponible ? 'btn-danger' : 'btn-success'} style={{ flex: 1, fontSize: 11, padding: '6px' }} onClick={() => toggleDispo(p)}>{p.disponible ? 'Désactiver' : 'Activer'}</button>
              <button className="btn-danger" style={{ fontSize: 11, padding: '6px 8px' }} onClick={() => deletePlat(p.id)} title="Supprimer">✕</button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '5vh', overflowY: 'auto', zIndex: 100 }} onClick={closeModal}>
          <div className="card fade-in" style={{ width: 480 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, marginBottom: '1.25rem' }}>{modal.type === 'edit' ? 'Modifier le plat' : 'Nouveau plat'}</h3>

            {saveError && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: 8, padding: '8px 12px', color: '#ef4444', fontSize: 12, marginBottom: '1rem' }}>
                ⚠ {saveError}
              </div>
            )}

            <div style={{ display: 'grid', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text3)', display: 'block', marginBottom: 5, textTransform: 'uppercase', fontFamily: 'Syne', fontWeight: 600 }}>Nom *</label>
                <input value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} placeholder="Nom du plat" />
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text3)', display: 'block', marginBottom: 5, textTransform: 'uppercase', fontFamily: 'Syne', fontWeight: 600 }}>Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Description du plat (optionnel)" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text3)', display: 'block', marginBottom: 5, textTransform: 'uppercase', fontFamily: 'Syne', fontWeight: 600 }}>Prix (DH) *</label>
                  <input type="number" min="0" step="0.5" value={form.prix} onChange={e => setForm({ ...form, prix: e.target.value })} placeholder="0" />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text3)', display: 'block', marginBottom: 5, textTransform: 'uppercase', fontFamily: 'Syne', fontWeight: 600 }}>Préparation (min)</label>
                  <input type="number" min="1" value={form.temps_preparation} onChange={e => setForm({ ...form, temps_preparation: e.target.value })} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text3)', display: 'block', marginBottom: 5, textTransform: 'uppercase', fontFamily: 'Syne', fontWeight: 600 }}>Catégorie *</label>
                <select value={form.categorie} onChange={e => setForm({ ...form, categorie: e.target.value })}>
                  {cats.length === 0 && <option value="">Chargement…</option>}
                  {cats.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button className="btn-primary" style={{ flex: 1 }} onClick={save} disabled={saving}>
                  {saving ? 'Enregistrement…' : 'Enregistrer'}
                </button>
                <button className="btn-ghost" onClick={closeModal} disabled={saving}>Annuler</button>
                {modal.type === 'edit' && (
                  <button className="btn-danger" style={{ padding: '8px 14px' }} onClick={() => deletePlat(modal.id)} disabled={saving} title="Supprimer ce plat">✕</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
