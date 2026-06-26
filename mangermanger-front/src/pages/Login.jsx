import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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

const PHOTO = "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=85&fit=crop";

const STAFF_ROUTES = { gerant: '/dashboard', chef: '/cuisine', serveur: '/salle', caissier: '/caisse' };
const ADMIN_URL = 'http://localhost:8000/admin/';

const css = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .lf0 { animation: fadeUp 0.55s ease both; }
  .lf1 { animation: fadeUp 0.55s 0.08s ease both; }
  .lf2 { animation: fadeUp 0.55s 0.16s ease both; }
  .lf3 { animation: fadeUp 0.55s 0.24s ease both; }
  .lf4 { animation: fadeUp 0.55s 0.32s ease both; }

  .l-inp:-webkit-autofill,
  .l-inp:-webkit-autofill:hover,
  .l-inp:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0 50px #fff inset !important;
    -webkit-text-fill-color: #1A2E2D !important;
    caret-color: #1A2E2D;
    transition: background-color 9999s ease-in-out 0s;
  }

  .l-pwd { color: #1A2E2D !important; }
  .l-pwd::placeholder { color: rgba(26,46,45,0.5); opacity: 1; letter-spacing: 3px; }
`;

export default function Login() {
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await login(form.username.trim(), form.password);
      const role = data?.role;
      if (role === 'admin') {
        logout();
        window.location.href = ADMIN_URL;
      } else {
        navigate(STAFF_ROUTES[role] || '/acceuil');
      }
    } catch (err) {
      if (!err.response) {
        setError('Impossible de contacter le serveur. Vérifiez que Django est démarré.');
      } else if (err.response?.status === 400) {
        setError('Identifiant ou mot de passe incorrect.');
      } else {
        setError(`Erreur ${err.response?.status || ''} : ${err.response?.data?.error || 'Veuillez réessayer.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = form.username.trim() && form.password && !loading;

  const inpStyle = (hasError) => ({
    width: '100%',
    background: hasError ? '#fef2f2' : '#fff',
    border: `1.5px solid ${hasError ? '#fca5a5' : T.border}`,
    borderRadius: 12,
    padding: '13px 16px',
    color: T.text,
    fontSize: 14,
    outline: 'none',
    fontFamily: 'DM Sans, sans-serif',
    boxSizing: 'border-box',
    transition: 'all 0.2s',
  });

  const lbl = {
    display: 'block', fontSize: 11, color: T.teal,
    marginBottom: 7, fontFamily: 'Syne, sans-serif',
    fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em',
  };

  return (
    <>
      <style>{css}</style>
      <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr', background: T.offWhite }}>

        {/* ── GAUCHE : photo hero ── */}
        <div style={{
          position: 'relative', overflow: 'hidden',
          backgroundImage: `url(${PHOTO})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}>
          {/* dark teal overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(160deg, rgba(20,45,43,0.82) 0%, rgba(26,58,56,0.94) 100%)`,
          }} />

          {/* gold radial glow */}
          <div style={{
            position: 'absolute', top: -80, right: -80,
            width: 340, height: 340, borderRadius: '50%',
            background: `radial-gradient(circle, rgba(200,168,75,0.18) 0%, transparent 70%)`,
          }} />
          <div style={{
            position: 'absolute', bottom: -60, left: -60,
            width: 260, height: 260, borderRadius: '50%',
            background: 'rgba(245,237,216,0.04)',
          }} />

          {/* gold vertical accent line */}
          <div style={{
            position: 'absolute', left: '3rem', top: 0,
            width: 1, height: '100%',
            background: `linear-gradient(to bottom, transparent 0%, rgba(200,168,75,0.35) 30%, rgba(200,168,75,0.35) 70%, transparent 100%)`,
          }} />

          <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '3rem 3rem 3rem 5rem' }}>

            {/* logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: T.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, boxShadow: `0 4px 16px rgba(200,168,75,0.45)` }}>🍽️</div>
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: '#fff', letterSpacing: '-0.01em' }}>Zefran</span>
            </div>

            {/* headline + roles */}
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                border: `1px solid rgba(200,168,75,0.45)`,
                borderRadius: 100, padding: '6px 14px', marginBottom: '1.5rem',
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.gold }} />
                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 11, color: T.gold, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Espace professionnel
                </span>
              </div>

              <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 36, color: '#fff', marginBottom: 14, lineHeight: 1.15, letterSpacing: '-0.02em' }}>
                L'art de la<br />
                <span style={{ color: T.gold }}>table marocaine</span>
              </h2>
              <p style={{ color: 'rgba(245,237,216,0.6)', fontSize: 15, lineHeight: 1.7, marginBottom: '2rem', maxWidth: 340 }}>
                Gérez votre restaurant en temps réel. Interface dédiée à chaque rôle de votre équipe.
              </p>

              {/* roles grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { icon: '📊', label: 'Gérant', desc: 'Tableau de bord' },
                  { icon: '👨‍🍳', label: 'Chef', desc: 'Bons de commande' },
                  { icon: '🛎️', label: 'Serveur', desc: 'Gestion des tables' },
                  { icon: '💳', label: 'Caissier', desc: 'Encaissements' },
                ].map(r => (
                  <div key={r.label} style={{
                    background: 'rgba(255,255,255,0.07)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 12, padding: '10px 14px',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <span style={{ fontSize: 20 }}>{r.icon}</span>
                    <div>
                      <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 12, color: T.gold }}>{r.label}</div>
                      <div style={{ fontSize: 11, color: 'rgba(245,237,216,0.5)', marginTop: 1 }}>{r.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* bottom glass badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 14,
              background: 'rgba(255,255,255,0.07)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 16, padding: '14px 20px',
              alignSelf: 'flex-start',
            }}>
              <div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: '#fff', lineHeight: 1 }}>4.8</div>
                <div style={{ color: T.gold, fontSize: 12, marginTop: 2 }}>★★★★★</div>
              </div>
              <div style={{ width: 1, height: 34, background: 'rgba(255,255,255,0.15)' }} />
              <div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>+1 200 clients</div>
                <div style={{ fontSize: 11, color: 'rgba(245,237,216,0.5)', marginTop: 2 }}>satisfaits</div>
              </div>
            </div>

          </div>
        </div>

        {/* ── DROITE : formulaire ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem', background: T.cream }}>
          <div style={{ width: '100%', maxWidth: 420 }}>

            {/* header */}
            <div className="lf0" style={{ marginBottom: '2.5rem' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: `rgba(200,168,75,0.12)`,
                border: `1px solid rgba(200,168,75,0.3)`,
                borderRadius: 100, padding: '5px 14px', marginBottom: '1rem',
              }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: T.gold }} />
                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 11, color: T.gold, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Accès staff
                </span>
              </div>
              <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 32, color: T.text, marginBottom: 8, letterSpacing: '-0.02em' }}>
                Connexion
              </h1>
              <p style={{ color: T.text2, fontSize: 15 }}>
                Clients et staff — un seul accès, votre espace dédié
              </p>
            </div>

            {/* form card */}
            <div className="lf1" style={{
              background: '#fff',
              borderRadius: 20,
              padding: '2rem',
              boxShadow: `0 8px 40px rgba(45,95,93,0.1), 0 1px 3px rgba(45,95,93,0.06)`,
              marginBottom: '1.25rem',
            }}>
              <form onSubmit={submit} noValidate style={{ display: 'grid', gap: 18 }}>

                <div>
                  <label style={lbl}>Identifiant</label>
                  <input
                    className="l-inp"
                    value={form.username}
                    onChange={e => { setForm({ ...form, username: e.target.value }); setError(''); }}
                    placeholder="Nom d'utilisateur"
                    autoComplete="username"
                    autoFocus
                    style={inpStyle(!!error)}
                    onFocus={e => { e.target.style.borderColor = T.teal; e.target.style.boxShadow = `0 0 0 3px rgba(45,95,93,0.1)`; }}
                    onBlur={e => { e.target.style.borderColor = error ? '#fca5a5' : T.border; e.target.style.boxShadow = 'none'; }}
                  />
                </div>

                <div>
                  <label style={lbl}>Mot de passe</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      className="l-inp l-pwd"
                      type={showPwd ? 'text' : 'password'}
                      value={form.password}
                      onChange={e => { setForm({ ...form, password: e.target.value }); setError(''); }}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      style={{ ...inpStyle(!!error), paddingRight: 46, letterSpacing: showPwd ? 'normal' : '3px', fontSize: showPwd ? 14 : 16 }}
                      onFocus={e => { e.target.style.borderColor = T.teal; e.target.style.boxShadow = `0 0 0 3px rgba(45,95,93,0.1)`; }}
                      onBlur={e => { e.target.style.borderColor = error ? '#fca5a5' : T.border; e.target.style.boxShadow = 'none'; }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: T.text3, fontSize: 16, padding: 4, cursor: 'pointer', lineHeight: 1 }}>
                      {showPwd ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: 12, padding: '12px 16px' }}>
                    <div style={{ color: '#dc2626', fontSize: 13, fontWeight: 600 }}>⚠ {error}</div>
                    {error.includes('serveur') && (
                      <div style={{ color: '#9b1c1c', fontSize: 12, lineHeight: 1.5, marginTop: 4 }}>
                        Lancez Django dans un terminal :<br />
                        <code style={{ background: '#fee2e2', padding: '2px 6px', borderRadius: 4, fontSize: 11 }}>
                          cd mangermanger && python manage.py runserver
                        </code>
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!canSubmit}
                  style={{
                    padding: '14px',
                    background: canSubmit
                      ? `linear-gradient(135deg, ${T.tealDark}, ${T.teal})`
                      : 'rgba(45,95,93,0.08)',
                    border: 'none',
                    borderRadius: 12,
                    color: canSubmit ? '#fff' : T.text3,
                    fontFamily: 'Syne, sans-serif',
                    fontWeight: 700,
                    fontSize: 15,
                    cursor: canSubmit ? 'pointer' : 'not-allowed',
                    boxShadow: canSubmit ? `0 4px 20px rgba(45,95,93,0.35)` : 'none',
                    transition: 'all 0.2s',
                    letterSpacing: '0.02em',
                  }}>
                  {loading ? '⏳ Connexion...' : 'Se connecter →'}
                </button>
              </form>
            </div>

            {/* register link */}
            <div className="lf2">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem' }}>
                <div style={{ flex: 1, height: 1, background: T.border }} />
                <span style={{ fontSize: 12, color: T.text3, whiteSpace: 'nowrap' }}>Nouveau client ?</span>
                <div style={{ flex: 1, height: 1, background: T.border }} />
              </div>
              <Link
                to="/acceuil/register"
                style={{
                  display: 'block', textAlign: 'center', padding: '13px',
                  border: `1.5px solid rgba(200,168,75,0.5)`,
                  borderRadius: 12, textDecoration: 'none',
                  color: T.tealDark,
                  fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14,
                  transition: 'all 0.2s',
                  background: `rgba(200,168,75,0.07)`,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = `rgba(200,168,75,0.14)`; e.currentTarget.style.borderColor = T.gold; }}
                onMouseLeave={e => { e.currentTarget.style.background = `rgba(200,168,75,0.07)`; e.currentTarget.style.borderColor = `rgba(200,168,75,0.5)`; }}>
                Créer un compte gratuitement
              </Link>
            </div>

            <div className="lf3" style={{ textAlign: 'center', marginTop: '1rem' }}>
              <Link to="/acceuil" style={{ fontSize: 13, color: T.text3, textDecoration: 'none' }}>← Retour à l'accueil</Link>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
