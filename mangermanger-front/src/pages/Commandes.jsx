import { useEffect, useState } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';

const STATUTS = [
  { value: '', label: 'Tous' },
  { value: 'en_attente', label: 'En attente' },
  { value: 'en_preparation', label: 'En préparation' },
  { value: 'pret', label: 'Prêt' },
  { value: 'servi', label: 'Servi' },
  { value: 'paye', label: 'Payé' },
];

const statutBadge = (s) => {
  const map = {
    en_attente: ['badge-info', 'En attente'],
    en_preparation: ['badge-warn', 'En préparation'],
    pret: ['badge-success', 'Prêt'],
    servi: ['badge-gray', 'Servi'],
    paye: ['badge-success', 'Payé'],
    annulee: ['badge-danger', 'Annulée'],
  };
  const [cls, label] = map[s] || ['badge-gray', s];
  return <span className={`badge ${cls}`}>{label}</span>;
};

const isOnline = (cmd) => cmd.notes && cmd.notes.includes('[COMMANDE EN LIGNE');

export default function Commandes() {
  const { role } = useAuth();
  const canManage = role === 'serveur' || role === 'caissier';
  const [commandes, setCommandes] = useState([]);
  const [filtre, setFiltre] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState('');

  const fetchCommandes = async () => {
    setLoading(true);
    try {
      const url = filtre ? `/commandes/?statut=${filtre}` : '/commandes/';
      const r = await API.get(url);
      setCommandes(r.data.results || r.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchCommandes(); const t = setInterval(fetchCommandes, 10000); return () => clearInterval(t); }, [filtre]);

  const changerStatut = async (id, statut) => {
    setActionError('');
    try {
      await API.patch(`/commandes/${id}/changer_statut/`, { statut });
      fetchCommandes();
      setSelected(null);
    } catch (e) {
      setActionError(e.response?.data?.error || 'Erreur lors du changement de statut.');
      setTimeout(() => setActionError(''), 4000);
    }
  };

  const onlineCount = commandes.filter(isOnline).length;

  return (
    <div style={{ padding: '1.75rem' }} className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: 26, color: 'var(--text)', marginBottom: 4 }}>Commandes</h1>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <p style={{ color: 'var(--text3)', fontSize: 13 }}>{commandes.length} commande(s)</p>
            {onlineCount > 0 && (
              <span style={{ fontSize: 11, background: 'rgba(249,115,22,0.15)', color: 'var(--accent)', border: '1px solid rgba(249,115,22,0.3)', padding: '2px 8px', borderRadius: 10, fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
                🌐 {onlineCount} en ligne
              </span>
            )}
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }} className="pulse" />
            <span style={{ fontSize: 11, color: 'var(--success)' }}>Actualisation auto</span>
          </div>
        </div>
      </div>

      {actionError && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: 10, padding: '10px 14px', color: '#ef4444', fontSize: 13, marginBottom: '1rem' }}>⚠ {actionError}</div>}

      <div style={{ display: 'flex', gap: 8, marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {STATUTS.map(s => (
          <button key={s.value} onClick={() => setFiltre(s.value)}
            style={{ padding: '6px 14px', fontSize: 12, fontFamily: 'Syne, sans-serif', fontWeight: 600, borderRadius: 20, border: '1px solid', borderColor: filtre === s.value ? 'var(--accent)' : 'var(--border)', background: filtre === s.value ? 'var(--accent-dim)' : 'transparent', color: filtre === s.value ? 'var(--accent)' : 'var(--text2)', cursor: 'pointer', transition: 'all 0.15s' }}>
            {s.label}
          </button>
        ))}
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Commande</th>
              <th>Table</th>
              <th>Origine</th>
              <th>Plats</th>
              <th>Montant</th>
              <th>Heure</th>
              <th>Statut</th>
              {canManage && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={canManage ? 8 : 7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text3)' }}>Chargement...</td></tr>
            ) : commandes.length === 0 ? (
              <tr><td colSpan={canManage ? 8 : 7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text3)' }}>Aucune commande</td></tr>
            ) : commandes.map(cmd => (
              <tr key={cmd.id} style={{ cursor: 'pointer', background: isOnline(cmd) ? 'rgba(249,115,22,0.03)' : 'transparent' }} onClick={() => setSelected(selected?.id === cmd.id ? null : cmd)}>
                <td style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--accent)' }}>
                  #{String(cmd.id).padStart(4, '0')}
                </td>
                <td style={{ fontWeight: 600, color: 'var(--text)' }}>
                  {cmd.table_numero ? `Table ${cmd.table_numero}` : '—'}
                </td>
                <td>
                  {isOnline(cmd)
                    ? <span style={{ fontSize: 11, background: 'rgba(249,115,22,0.12)', color: 'var(--accent)', padding: '2px 8px', borderRadius: 8, fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>🌐 En ligne</span>
                    : <span style={{ fontSize: 11, color: 'var(--text3)' }}>Salle</span>
                  }
                </td>
                <td style={{ color: 'var(--text2)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {cmd.items?.map(i => `${i.plat_nom} ×${i.quantite}`).join(', ') || '—'}
                </td>
                <td style={{ fontWeight: 700, color: 'var(--text)' }}>{parseFloat(cmd.montant_total).toFixed(0)} DH</td>
                <td style={{ color: 'var(--text3)' }}>{new Date(cmd.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</td>
                <td>{statutBadge(cmd.statut)}</td>
                {canManage && (
                  <td onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: 5 }}>
                      {cmd.statut === 'en_attente' && <>
                        <button className="btn-success" style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => changerStatut(cmd.id, 'en_preparation')}>✓ Accepter</button>
                        <button className="btn-danger"  style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => { if(window.confirm('Refuser cette commande ?')) changerStatut(cmd.id, 'annulee'); }}>✕ Refuser</button>
                      </>}
                      {cmd.statut === 'en_preparation' && <>
                        {role !== 'serveur' && <button className="btn-success" style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => changerStatut(cmd.id, 'pret')}>→ Prêt</button>}
                        <button className="btn-danger"  style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => { if(window.confirm('Annuler cette commande ?')) changerStatut(cmd.id, 'annulee'); }}>✕ Annuler</button>
                      </>}
                      {cmd.statut === 'pret' && <button className="btn-ghost" style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => changerStatut(cmd.id, 'servi')}>→ Servi</button>}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => setSelected(null)}>
          <div className="card fade-in" style={{ width: 500, maxHeight: '80vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: 18 }}>Commande #{String(selected.id).padStart(4, '0')}</h3>
                {isOnline(selected) && <span style={{ fontSize: 12, color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>🌐 Commande passée en ligne</span>}
              </div>
              <button onClick={() => setSelected(null)} className="btn-ghost" style={{ padding: '4px 10px', fontSize: 16 }}>✕</button>
            </div>

            {/* Notes (extrait le nom client si commande en ligne) */}
            {isOnline(selected) && selected.notes && (
              <div style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: '1rem', fontSize: 13, color: 'var(--accent)' }}>
                {selected.notes.replace('[COMMANDE EN LIGNE - ', '👤 Client : ').replace(']', '')}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: '1rem' }}>
              <div style={{ background: 'var(--bg3)', padding: 12, borderRadius: 8 }}>
                <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 4, textTransform: 'uppercase' }}>Table</div>
                <div style={{ fontWeight: 700, color: 'var(--text)' }}>{selected.table_numero ? `Table ${selected.table_numero}` : '—'}</div>
              </div>
              <div style={{ background: 'var(--bg3)', padding: 12, borderRadius: 8 }}>
                <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 4, textTransform: 'uppercase' }}>Total</div>
                <div style={{ fontWeight: 700, color: 'var(--accent)' }}>{parseFloat(selected.montant_total).toFixed(0)} DH</div>
              </div>
            </div>

            <h4 style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Détail des plats</h4>
            {selected.items?.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 13 }}>{item.plat_nom} × {item.quantite}</span>
                {item.notes && <span style={{ fontSize: 11, color: 'var(--warn)' }}>📝 {item.notes}</span>}
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>{(item.quantite * parseFloat(item.prix_unitaire)).toFixed(0)} DH</span>
              </div>
            ))}

            {canManage && (
              <div style={{ marginTop: '1rem', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {selected.statut === 'en_attente' && <>
                  <button className="btn-primary" onClick={() => changerStatut(selected.id, 'en_preparation')}>✓ Accepter</button>
                  <button className="btn-danger"  onClick={() => { if(window.confirm('Refuser cette commande ?')) changerStatut(selected.id, 'annulee'); }}>✕ Refuser</button>
                </>}
                {selected.statut === 'en_preparation' && <>
                  {role !== 'serveur' && <button className="btn-success" onClick={() => changerStatut(selected.id, 'pret')}>✓ Marquer prêt</button>}
                  <button className="btn-danger" onClick={() => { if(window.confirm('Annuler cette commande ?')) changerStatut(selected.id, 'annulee'); }}>✕ Annuler</button>
                </>}
                {selected.statut === 'pret' && <button className="btn-ghost" onClick={() => changerStatut(selected.id, 'servi')}>Marquer servi</button>}
                {selected.statut === 'servi' && <button className="btn-ghost" style={{ opacity: 0.5 }}>En attente de paiement</button>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
