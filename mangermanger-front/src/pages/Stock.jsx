import { useEffect, useState } from 'react';
import API from '../api';

export default function Stock() {
  const [ingredients, setIngredients] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ nom:'', quantite_stock:0, quantite_min:1, unite:'kg' });

  const fetch = () => API.get('/ingredients/').then(r => setIngredients(r.data.results || r.data));
  useEffect(() => { fetch(); }, []);

  const save = async () => {
    if (modal.type === 'edit') await API.patch(`/ingredients/${modal.id}/`, form);
    else await API.post('/ingredients/', form);
    fetch(); setModal(null);
  };

  const alertes = ingredients.filter(i => i.en_alerte);

  return (
    <div style={{ padding: '1.75rem' }} className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: 26, color: 'var(--text)', marginBottom: 4 }}>Gestion des stocks</h1>
          <p style={{ color: alertes.length > 0 ? 'var(--warn)' : 'var(--text3)', fontSize: 13 }}>{alertes.length > 0 ? `⚠ ${alertes.length} article(s) en alerte` : '✓ Tous les stocks sont OK'}</p>
        </div>
        <button className="btn-primary" onClick={() => { setForm({ nom:'', quantite_stock:0, quantite_min:1, unite:'kg' }); setModal({ type: 'new' }); }}>+ Ajouter un ingrédient</button>
      </div>

      {alertes.length > 0 && (
        <div style={{ background: 'var(--warn-dim)', border: '1px solid rgba(234,179,8,0.3)', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--warn)', marginBottom: 8, fontFamily: 'Syne' }}>⚠ Stocks à renouveler</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {alertes.map(a => <span key={a.id} className="badge badge-warn">{a.nom} — {a.quantite_stock} {a.unite}</span>)}
          </div>
        </div>
      )}

      <div className="card">
        <table>
          <thead><tr><th>Ingrédient</th><th>Stock actuel</th><th>Seuil min.</th><th>Unité</th><th>Niveau</th><th>Statut</th><th>Action</th></tr></thead>
          <tbody>
            {ingredients.map(i => (
              <tr key={i.id}>
                <td style={{ fontWeight: 600, color: 'var(--text)' }}>{i.nom}</td>
                <td style={{ fontFamily: 'Syne', fontWeight: 700, color: i.en_alerte ? 'var(--danger)' : 'var(--text)' }}>{i.quantite_stock}</td>
                <td style={{ color: 'var(--text3)' }}>{i.quantite_min}</td>
                <td><span className="badge badge-gray">{i.unite}</span></td>
                <td style={{ width: 120 }}>
                  <div style={{ height: 6, background: 'var(--bg4)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${i.niveau_pct}%`, background: i.niveau_pct < 25 ? 'var(--danger)' : i.niveau_pct < 50 ? 'var(--warn)' : 'var(--success)', borderRadius: 3, transition: 'width 0.5s' }} />
                  </div>
                </td>
                <td><span className={`badge ${i.en_alerte ? 'badge-danger' : 'badge-success'}`}>{i.en_alerte ? 'Alerte' : 'OK'}</span></td>
                <td>
                  <button className="btn-ghost" style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => { setForm({ nom: i.nom, quantite_stock: i.quantite_stock, quantite_min: i.quantite_min, unite: i.unite }); setModal({ type: 'edit', id: i.id }); }}>Modifier</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => setModal(null)}>
          <div className="card fade-in" style={{ width: 420 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, marginBottom: '1.25rem' }}>{modal.type === 'edit' ? 'Modifier' : 'Nouvel ingrédient'}</h3>
            <div style={{ display: 'grid', gap: 12 }}>
              <div><label style={{ fontSize: 11, color: 'var(--text3)', display: 'block', marginBottom: 5, textTransform: 'uppercase', fontFamily: 'Syne', fontWeight: 600 }}>Nom</label><input value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                <div><label style={{ fontSize: 11, color: 'var(--text3)', display: 'block', marginBottom: 5 }}>Stock</label><input type="number" value={form.quantite_stock} onChange={e => setForm({...form, quantite_stock: e.target.value})} /></div>
                <div><label style={{ fontSize: 11, color: 'var(--text3)', display: 'block', marginBottom: 5 }}>Seuil min</label><input type="number" value={form.quantite_min} onChange={e => setForm({...form, quantite_min: e.target.value})} /></div>
                <div><label style={{ fontSize: 11, color: 'var(--text3)', display: 'block', marginBottom: 5 }}>Unité</label>
                  <select value={form.unite} onChange={e => setForm({...form, unite: e.target.value})}>
                    {['kg','g','L','ml','pcs','boite'].map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button className="btn-primary" style={{ flex: 1 }} onClick={save}>Enregistrer</button>
                <button className="btn-ghost" onClick={() => setModal(null)}>Annuler</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
