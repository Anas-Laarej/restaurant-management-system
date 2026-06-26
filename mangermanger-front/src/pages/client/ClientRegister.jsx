import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api';

const T = {
  teal: "#2D5F5D",
  tealDark: "#1A3A38",
  gold: "#C8A84B",
  cream: "#F5EDD8",
  offWhite: "#FAFAF5",
  text: "#1A2E2D",
  text2: "rgba(26,46,45,0.65)",
  text3: "rgba(26,46,45,0.4)",
  border: "rgba(45,95,93,0.18)",
};

export default function ClientRegister() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    first_name: '', last_name: '', username: '',
    email: '', telephone: '', password: '', confirm: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = (name, value) => {
    const e = { ...fieldErrors };
    switch (name) {
      case 'first_name': e.first_name = value.trim() ? '' : 'Prénom obligatoire.'; break;
      case 'username':
        if (!value.trim()) e.username = "L'identifiant est obligatoire.";
        else if (/\s/.test(value)) e.username = "Pas d'espaces — utilisez _ (ex: anas_l)";
        else if (!/^[a-zA-Z0-9_.-]+$/.test(value)) e.username = "Lettres, chiffres, _ . - uniquement.";
        else if (value.length < 3) e.username = "Au moins 3 caractères.";
        else e.username = '';
        break;
      case 'email':
        e.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Adresse email invalide.';
        break;
      case 'password':
        e.password = value.length >= 6 ? '' : 'Au moins 6 caractères.';
        if (form.confirm) e.confirm = value === form.confirm ? '' : 'Mots de passe différents.';
        break;
      case 'confirm':
        e.confirm = value === form.password ? '' : 'Mots de passe différents.';
        break;
      default: break;
    }
    setFieldErrors(e);
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'username' && /\s/.test(value)) return;
    setForm(f => ({ ...f, [name]: value }));
    validate(name, value);
    setGlobalError('');
  };

  const step1Valid =
    form.first_name.trim().length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
    !fieldErrors.first_name && !fieldErrors.email;

  const step2Valid =
    form.username.length >= 3 &&
    /^[a-zA-Z0-9_.-]+$/.test(form.username) &&
    !fieldErrors.username &&
    form.password.length >= 6 &&
    !fieldErrors.password &&
    form.password === form.confirm;

  const submit = async (e) => {
    e.preventDefault();
    if (!step2Valid) return;
    setLoading(true);
    setGlobalError('');
    try {
      await API.post('/register/', {
        username: form.username.trim(),
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim().toLowerCase(),
        telephone: form.telephone.trim(),
        password: form.password,
      });
      await login(form.username.trim(), form.password);
      navigate('/acceuil');
    } catch (err) {
      if (!err.response) {
        setGlobalError('Impossible de contacter le serveur. Vérifiez que Django est démarré (python manage.py runserver).');
        setLoading(false);
        return;
      }
      const msg = err.response?.data?.error || 'Une erreur est survenue.';
      const msgLower = msg.toLowerCase();
      if (msgLower.includes('identifiant') || msgLower.includes('username')) {
        setFieldErrors(f => ({ ...f, username: msg })); setStep(2);
      } else if (msgLower.includes('email')) {
        setFieldErrors(f => ({ ...f, email: msg })); setStep(1);
      } else if (msgLower.includes('mot de passe') || msgLower.includes('password')) {
        setFieldErrors(f => ({ ...f, password: msg })); setStep(2);
      } else if (msgLower.includes('prénom') || msgLower.includes('first_name')) {
        setFieldErrors(f => ({ ...f, first_name: msg })); setStep(1);
      } else {
        setGlobalError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const getInpStyle = (field) => ({
    width: '100%',
    background: fieldErrors[field] ? '#fef2f2' : T.offWhite,
    border: `1.5px solid ${fieldErrors[field] ? '#fca5a5' : T.border}`,
    borderRadius: 10,
    padding: '12px 16px',
    color: T.text,
    fontSize: 14,
    outline: 'none',
    fontFamily: 'DM Sans, sans-serif',
    boxSizing: 'border-box',
    transition: 'all 0.2s',
  });

  const lbl = {
    display: 'block', fontSize: 11, color: T.teal,
    marginBottom: 6, fontFamily: 'Syne, sans-serif',
    fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em',
  };

  const errMsg = (field) => fieldErrors[field] ? (
    <p style={{ color: '#dc2626', fontSize: 11, marginTop: 5, fontFamily: 'Syne, sans-serif' }}>
      ⚠ {fieldErrors[field]}
    </p>
  ) : null;

  const focusStyle = (e, hasError) => {
    e.target.style.borderColor = hasError ? '#fca5a5' : T.teal;
    e.target.style.background = '#fff';
    e.target.style.boxShadow = `0 0 0 3px rgba(45,95,93,0.1)`;
  };
  const blurStyle = (e, hasError) => {
    e.target.style.borderColor = hasError ? '#fca5a5' : T.border;
    e.target.style.background = T.offWhite;
    e.target.style.boxShadow = 'none';
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr', background: T.offWhite }}>

      {/* ── GAUCHE : panneau décoratif ── */}
      <div style={{
        position: 'relative', overflow: 'hidden',
        background: `linear-gradient(150deg, ${T.tealDark} 0%, ${T.teal} 50%, #3A7A77 100%)`,
        display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '3rem',
      }}>
        <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(200,168,75,0.08)' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -60, width: 280, height: 280, borderRadius: '50%', background: 'rgba(245,237,216,0.04)' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '2.5rem' }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: T.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, boxShadow: `0 4px 12px rgba(200,168,75,0.4)` }}>🍽️</div>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: '#fff' }}>Zefran</span>
          </div>

          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 30, color: '#fff', marginBottom: '1.5rem', lineHeight: 1.2 }}>
            Rejoignez notre<br />communauté gourmande
          </h2>

          <div style={{ display: 'grid', gap: 16 }}>
            {[
              { icon: '★', title: 'Programme fidélité', desc: 'Gagnez des points à chaque commande' },
              { icon: '📅', title: 'Réservation facile', desc: 'Réservez en 30 secondes' },
              { icon: '🛒', title: 'Commande en ligne', desc: 'Commandez depuis chez vous' },
              { icon: '💬', title: 'Avis & recommandations', desc: 'Partagez vos expériences' },
            ].map(f => (
              <div key={f.title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(200,168,75,0.2)', border: '1px solid rgba(200,168,75,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{f.icon}</div>
                <div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: '#fff', marginBottom: 2 }}>{f.title}</div>
                  <div style={{ fontSize: 12, color: 'rgba(245,237,216,0.55)' }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── DROITE : formulaire ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem', overflowY: 'auto', background: T.offWhite }}>
        <div style={{ width: '100%', maxWidth: 460 }}>

          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 32, color: T.text, marginBottom: 6 }}>
              Créer un compte
            </h1>
            <p style={{ color: T.text2, fontSize: 14 }}>
              Inscription gratuite · {step === 1 ? 'Étape 1 : vos informations' : 'Étape 2 : identifiants'}
            </p>
          </div>

          {/* Barre de progression */}
          <div style={{ display: 'flex', gap: 8, marginBottom: '2rem' }}>
            {[1, 2].map(s => (
              <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: step >= s ? T.teal : T.border, transition: 'background 0.3s' }} />
            ))}
          </div>

          <form onSubmit={submit} noValidate style={{ display: 'grid', gap: 16 }}>

            {/* ── ÉTAPE 1 ── */}
            {step === 1 && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={lbl}>Prénom *</label>
                    <input
                      name="first_name" value={form.first_name} onChange={handleChange}
                      placeholder="Anas" autoFocus
                      style={getInpStyle('first_name')}
                      onFocus={e => focusStyle(e, !!fieldErrors.first_name)}
                      onBlur={e => blurStyle(e, !!fieldErrors.first_name)}
                    />
                    {errMsg('first_name')}
                  </div>
                  <div>
                    <label style={lbl}>Nom</label>
                    <input
                      name="last_name" value={form.last_name} onChange={handleChange}
                      placeholder="Laarej"
                      style={getInpStyle('last_name')}
                      onFocus={e => focusStyle(e, false)}
                      onBlur={e => blurStyle(e, false)}
                    />
                  </div>
                </div>

                <div>
                  <label style={lbl}>Adresse email *</label>
                  <input
                    name="email" type="email" value={form.email} onChange={handleChange}
                    placeholder="anas@email.com"
                    style={getInpStyle('email')}
                    onFocus={e => focusStyle(e, !!fieldErrors.email)}
                    onBlur={e => blurStyle(e, !!fieldErrors.email)}
                  />
                  {errMsg('email')}
                </div>

                <div>
                  <label style={lbl}>Téléphone <span style={{ fontWeight: 400, textTransform: 'none', color: T.text3 }}>(optionnel)</span></label>
                  <input
                    name="telephone" value={form.telephone} onChange={handleChange}
                    placeholder="+212 6XX XXX XXX"
                    style={getInpStyle('telephone')}
                    onFocus={e => focusStyle(e, false)}
                    onBlur={e => blurStyle(e, false)}
                  />
                </div>

                <button
                  type="button"
                  disabled={!step1Valid}
                  onClick={() => { if (step1Valid) setStep(2); }}
                  style={{
                    padding: '14px',
                    background: step1Valid ? T.teal : 'rgba(45,95,93,0.08)',
                    border: 'none', borderRadius: 12,
                    color: step1Valid ? '#fff' : T.text3,
                    fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15,
                    cursor: step1Valid ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s',
                    boxShadow: step1Valid ? `0 4px 16px rgba(45,95,93,0.3)` : 'none',
                  }}>
                  Continuer →
                </button>
              </>
            )}

            {/* ── ÉTAPE 2 ── */}
            {step === 2 && (
              <>
                {/* Résumé étape 1 */}
                <div style={{ background: T.cream, border: `1px solid rgba(200,168,75,0.25)`, borderRadius: 12, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 13, color: T.text }}>
                    <strong>{form.first_name} {form.last_name}</strong> · {form.email}
                  </div>
                  <button type="button" onClick={() => setStep(1)} style={{ fontSize: 12, color: T.teal, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>Modifier</button>
                </div>

                <div>
                  <label style={lbl}>Identifiant * <span style={{ fontWeight: 400, textTransform: 'none', color: T.text3 }}>(sans espaces)</span></label>
                  <input
                    name="username" value={form.username} onChange={handleChange}
                    placeholder="anas_laarej" autoComplete="username" autoFocus
                    style={getInpStyle('username')}
                    onFocus={e => focusStyle(e, !!fieldErrors.username)}
                    onBlur={e => blurStyle(e, !!fieldErrors.username)}
                  />
                  {errMsg('username')}
                  {!fieldErrors.username && form.username && (
                    <p style={{ color: T.teal, fontSize: 11, marginTop: 5 }}>✓ Utilisé pour la connexion</p>
                  )}
                </div>

                <div>
                  <label style={lbl}>Mot de passe * <span style={{ fontWeight: 400, textTransform: 'none', color: T.text3 }}>(min. 6 caractères)</span></label>
                  <input
                    name="password" type="password" value={form.password} onChange={handleChange}
                    placeholder="••••••••"
                    style={getInpStyle('password')}
                    onFocus={e => focusStyle(e, !!fieldErrors.password)}
                    onBlur={e => blurStyle(e, !!fieldErrors.password)}
                  />
                  {form.password && (
                    <div style={{ display: 'flex', gap: 4, marginTop: 6, alignItems: 'center' }}>
                      {[1, 2, 3].map(i => (
                        <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, transition: 'background 0.3s', background: form.password.length >= i * 4 ? (i === 1 ? '#ef4444' : i === 2 ? T.gold : T.teal) : T.border }} />
                      ))}
                      <span style={{ fontSize: 10, color: T.text3, marginLeft: 4, minWidth: 30 }}>
                        {form.password.length < 4 ? 'Faible' : form.password.length < 8 ? 'Moyen' : 'Fort'}
                      </span>
                    </div>
                  )}
                  {errMsg('password')}
                </div>

                <div>
                  <label style={lbl}>Confirmer le mot de passe *</label>
                  <input
                    name="confirm" type="password" value={form.confirm} onChange={handleChange}
                    placeholder="••••••••"
                    style={getInpStyle('confirm')}
                    onFocus={e => focusStyle(e, !!fieldErrors.confirm)}
                    onBlur={e => blurStyle(e, !!fieldErrors.confirm)}
                  />
                  {errMsg('confirm')}
                  {!fieldErrors.confirm && form.confirm && (
                    <p style={{ color: T.teal, fontSize: 11, marginTop: 5 }}>✓ Les mots de passe correspondent</p>
                  )}
                </div>

                {globalError && (
                  <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: 12, padding: '12px 16px' }}>
                    <div style={{ color: '#dc2626', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>⚠ {globalError}</div>
                    {globalError.includes('serveur') && (
                      <div style={{ color: '#9b1c1c', fontSize: 12, lineHeight: 1.5 }}>
                        Assurez-vous que Django est démarré :<br />
                        <code style={{ background: '#fee2e2', padding: '2px 6px', borderRadius: 4, fontSize: 11 }}>python manage.py runserver</code>
                      </div>
                    )}
                  </div>
                )}

                <div style={{ background: T.cream, border: `1px solid rgba(200,168,75,0.25)`, borderRadius: 12, padding: '11px 14px', fontSize: 13, color: T.text2, lineHeight: 1.5 }}>
                  🎁 En créant un compte, vous rejoignez notre programme fidélité et gagnez des points à chaque commande.
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
                  <button
                    type="button" onClick={() => { setStep(1); setGlobalError(''); }}
                    style={{ padding: '13px', background: 'transparent', border: `1.5px solid ${T.border}`, borderRadius: 12, color: T.text2, fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                    ← Retour
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !step2Valid}
                    style={{
                      padding: '13px',
                      background: step2Valid && !loading ? T.teal : 'rgba(45,95,93,0.08)',
                      border: 'none', borderRadius: 12,
                      color: step2Valid && !loading ? '#fff' : T.text3,
                      fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15,
                      cursor: step2Valid && !loading ? 'pointer' : 'not-allowed',
                      boxShadow: step2Valid ? `0 4px 16px rgba(45,95,93,0.3)` : 'none',
                      transition: 'all 0.2s',
                    }}>
                    {loading ? '⏳ Création en cours...' : 'Créer mon compte →'}
                  </button>
                </div>
              </>
            )}
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <p style={{ color: T.text2, fontSize: 14 }}>
              Déjà un compte ?{' '}
              <Link to="/login" style={{ color: T.teal, fontFamily: 'Syne, sans-serif', fontWeight: 700, textDecoration: 'none' }}>Se connecter</Link>
            </p>
          </div>
          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <Link to="/acceuil" style={{ fontSize: 13, color: T.text3, textDecoration: 'none' }}>← Retour à l'accueil</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
