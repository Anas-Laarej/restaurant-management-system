import { useEffect, useState } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';

const roleColors = { gerant: '#f97316', chef: '#22c55e', serveur: '#3b82f6', caissier: '#a855f7' };
const roleLabels = { gerant: 'Gérant', chef: 'Chef cuisinier', serveur: 'Serveur', caissier: 'Caissier' };

const lbl = { fontSize: 11, color: 'var(--text3)', fontWeight: 600, display: 'block', marginBottom: 4 };

function AlertBox({ msg }) {
  if (!msg) return null;
  const ok = msg.type === 'ok';
  return (
    <div style={{ marginBottom: 12, padding: '8px 14px', borderRadius: 8, fontSize: 13, background: ok ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)', color: ok ? '#22c55e' : '#ef4444' }}>
      {msg.text}
    </div>
  );
}

export default function Profil() {
  const { role } = useAuth();
  const [profil, setProfil] = useState(null);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', telephone: '' });
  const [pwForm, setPwForm] = useState({ password: '', confirm: '' });
  const [msg, setMsg] = useState(null);
  const [pwMsg, setPwMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    API.get('/mon-profil-employe/').then(r => {
      setProfil(r.data);
      setForm({
        first_name: r.data.user?.first_name || '',
        last_name: r.data.user?.last_name || '',
        email: r.data.user?.email || '',
        telephone: r.data.telephone || '',
      });
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async e => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const r = await API.patch('/mon-profil-employe/', form);
      setProfil(r.data);
      setMsg({ type: 'ok', text: 'Profil mis à jour avec succès.' });
    } catch {
      setMsg({ type: 'err', text: 'Erreur lors de la mise à jour.' });
    } finally {
      setSaving(false);
    }
  };

  const handlePwSave = async e => {
    e.preventDefault();
    setPwMsg(null);
    if (!pwForm.password) return setPwMsg({ type: 'err', text: 'Entrez un nouveau mot de passe.' });
    if (pwForm.password.length < 6) return setPwMsg({ type: 'err', text: 'Au moins 6 caractères requis.' });
    if (pwForm.password !== pwForm.confirm) return setPwMsg({ type: 'err', text: 'Les mots de passe ne correspondent pas.' });
    setSavingPw(true);
    try {
      await API.patch('/mon-profil-employe/', { password: pwForm.password });
      setPwMsg({ type: 'ok', text: 'Mot de passe changé. Reconnectez-vous si nécessaire.' });
      setPwForm({ password: '', confirm: '' });
    } catch {
      setPwMsg({ type: 'err', text: 'Erreur lors du changement de mot de passe.' });
    } finally {
      setSavingPw(false);
    }
  };

  const accentColor = roleColors[role] || 'var(--accent)';
  const initials = `${form.first_name?.[0] || ''}${form.last_name?.[0] || ''}`.toUpperCase();

  if (loading) return (
    <div style={{ padding: '2rem', color: 'var(--text3)' }}>Chargement...</div>
  );

  return (
    <div style={{ padding: '1.75rem', maxWidth: 700 }} className="fade-in">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: 26, color: 'var(--text)', marginBottom: 4 }}>Mon profil</h1>
        <p style={{ color: 'var(--text3)', fontSize: 13 }}>Gérez vos informations personnelles et votre mot de passe.</p>
      </div>

      {/* Avatar + identité */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: '1.5rem' }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: accentColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, fontWeight: 800, color: 'white', flexShrink: 0,
          fontFamily: 'Syne',
        }}>
          {initials || '?'}
        </div>
        <div>
          <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 18, color: 'var(--text)' }}>
            {form.first_name} {form.last_name}
          </div>
          <span style={{
            display: 'inline-block', marginTop: 4,
            padding: '3px 12px', borderRadius: 20,
            background: `${accentColor}22`, color: accentColor,
            fontSize: 12, fontWeight: 700, fontFamily: 'Syne',
          }}>
            {roleLabels[role] || role}
          </span>
          {profil?.date_embauche && (
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
              Depuis le {new Date(profil.date_embauche).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          )}
        </div>
      </div>

      {/* Formulaire informations */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: 12, color: 'var(--text3)', textTransform: 'uppercase', fontFamily: 'Syne', fontWeight: 600, letterSpacing: '0.06em', marginBottom: '1.25rem' }}>
          Informations personnelles
        </div>
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={lbl}>Prénom</label>
              <input
                className="input"
                value={form.first_name}
                onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))}
                placeholder="Prénom"
                required
              />
            </div>
            <div>
              <label style={lbl}>Nom</label>
              <input
                className="input"
                value={form.last_name}
                onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))}
                placeholder="Nom"
              />
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>Email</label>
            <input
              className="input"
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="adresse@email.com"
            />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={lbl}>Téléphone</label>
            <input
              className="input"
              value={form.telephone}
              onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))}
              placeholder="+212 6XX XXX XXX"
            />
          </div>
          <AlertBox msg={msg} />
          <button type="submit" className="btn-primary" disabled={saving} style={{ width: '100%' }}>
            {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </form>
      </div>

      {/* Changement de mot de passe */}
      <div className="card">
        <div style={{ fontSize: 12, color: 'var(--text3)', textTransform: 'uppercase', fontFamily: 'Syne', fontWeight: 600, letterSpacing: '0.06em', marginBottom: '1.25rem' }}>
          Changer le mot de passe
        </div>
        <form onSubmit={handlePwSave}>
          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>Nouveau mot de passe</label>
            <input
              className="input"
              type="password"
              value={pwForm.password}
              onChange={e => setPwForm(f => ({ ...f, password: e.target.value }))}
              placeholder="Au moins 6 caractères"
            />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={lbl}>Confirmer le mot de passe</label>
            <input
              className="input"
              type="password"
              value={pwForm.confirm}
              onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
              placeholder="Répétez le mot de passe"
            />
          </div>
          <AlertBox msg={pwMsg} />
          <button type="submit" className="btn-primary" disabled={savingPw} style={{ width: '100%', background: '#ef4444' }}>
            {savingPw ? 'Modification...' : 'Changer le mot de passe'}
          </button>
        </form>
      </div>
    </div>
  );
}
