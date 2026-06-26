import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

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

const css = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .login-fade { animation: fadeUp 0.55s ease both; }
  .login-fade-1 { animation: fadeUp 0.55s 0.08s ease both; }
  .login-fade-2 { animation: fadeUp 0.55s 0.16s ease both; }
  .login-fade-3 { animation: fadeUp 0.55s 0.24s ease both; }
  .login-fade-4 { animation: fadeUp 0.55s 0.32s ease both; }

  /* neutralise l'autofill jaune/bleu du navigateur */
  .login-inp:-webkit-autofill,
  .login-inp:-webkit-autofill:hover,
  .login-inp:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0 50px #fff inset !important;
    -webkit-text-fill-color: #1A2E2D !important;
    caret-color: #1A2E2D;
    transition: background-color 9999s ease-in-out 0s;
  }

  /* points du mot de passe plus foncés */
  .login-pwd { color: #1A2E2D !important; }
  .login-pwd::placeholder { color: rgba(26,46,45,0.5); opacity: 1; letter-spacing: 3px; }
`;

export default function ClientLogin() {
  const { login } = useAuth();
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
      const role = data?.role || localStorage.getItem('role');
      const staffRoutes = { gerant: '/dashboard', chef: '/cuisine', serveur: '/salle', caissier: '/caisse' };
      if (staffRoutes[role]) {
        navigate(staffRoutes[role]);
      } else {
        navigate('/acceuil');
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

  const ready = form.username.trim() && form.password && !loading;

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
          {/* overlay gradient — dark teal, same as hero landing */}
          <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(160deg, rgba(20,45,43,0.78) 0%, rgba(26,58,56,0.92) 100%)`,
          }} />

          {/* gold accent circle */}
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

          {/* gold scroll line like hero */}
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

            {/* headline */}
            <div>
              {/* badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                border: `1px solid rgba(200,168,75,0.45)`,
                borderRadius: 100, padding: '6px 14px',
                marginBottom: '1.5rem',
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.gold }} />
                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 11, color: T.gold, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Cuisine authentique
                </span>
              </div>

              <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 38, color: '#fff', marginBottom: 16, lineHeight: 1.15, letterSpacing: '-0.02em' }}>
                Bienvenue dans<br />
                <span style={{ color: T.gold }}>notre univers</span><br />
                culinaire
              </h2>
              <p style={{ color: 'rgba(245,237,216,0.65)', fontSize: 15, lineHeight: 1.7, marginBottom: '2rem', maxWidth: 360 }}>
                Tajines, couscous et grillades préparés avec passion. Une expérience gastronomique authentique depuis 2018.
              </p>

              {/* feature pills */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {['🌿 Produits frais', '👨‍🍳 Chef expert', '❤️ Fait maison'].map(t => (
                  <div key={t} style={{
                    background: 'rgba(245,237,216,0.08)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(245,237,216,0.18)',
                    borderRadius: 8, padding: '7px 14px',
                    fontSize: 12, color: T.cream,
                    fontFamily: 'Syne, sans-serif', fontWeight: 600,
                  }}>{t}</div>
                ))}
              </div>
            </div>

            {/* bottom rating badge — same glassmorphism as landing */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 14,
              background: 'rgba(255,255,255,0.07)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 16, padding: '14px 20px',
              alignSelf: 'flex-start',
            }}>
              <div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 26, color: '#fff', lineHeight: 1 }}>4.8</div>
                <div style={{ color: T.gold, fontSize: 13, marginTop: 2 }}>★★★★★</div>
              </div>
              <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.15)' }} />
              <div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>+1 200 avis</div>
                <div style={{ fontSize: 11, color: 'rgba(245,237,216,0.55)', marginTop: 2 }}>clients satisfaits</div>
              </div>
            </div>

          </div>
        </div>

        {/* ── DROITE : formulaire ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem', background: T.cream }}>
          <div style={{ width: '100%', maxWidth: 420 }}>

            {/* header */}
            <div className="login-fade" style={{ marginBottom: '2.5rem' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: `rgba(200,168,75,0.12)`,
                border: `1px solid rgba(200,168,75,0.3)`,
                borderRadius: 100, padding: '5px 14px', marginBottom: '1rem',
              }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: T.gold }} />
                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 11, color: T.gold, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Espace client
                </span>
              </div>
              <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 32, color: T.text, marginBottom: 8, letterSpacing: '-0.02em' }}>
                Connexion
              </h1>
              <p style={{ color: T.text2, fontSize: 15 }}>Accédez à votre espace Zefran</p>
            </div>

            {/* form card */}
            <div className="login-fade-1" style={{
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
                    className="login-inp"
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
                      className="login-inp login-pwd"
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
                  disabled={!ready}
                  style={{
                    padding: '14px',
                    background: ready
                      ? `linear-gradient(135deg, ${T.tealDark}, ${T.teal})`
                      : 'rgba(45,95,93,0.08)',
                    border: 'none',
                    borderRadius: 12,
                    color: ready ? '#fff' : T.text3,
                    fontFamily: 'Syne, sans-serif',
                    fontWeight: 700,
                    fontSize: 15,
                    cursor: ready ? 'pointer' : 'not-allowed',
                    boxShadow: ready ? `0 4px 20px rgba(45,95,93,0.35)` : 'none',
                    transition: 'all 0.2s',
                    letterSpacing: '0.02em',
                  }}>
                  {loading ? '⏳ Connexion...' : 'Se connecter →'}
                </button>
              </form>
            </div>

            {/* register link */}
            <div className="login-fade-2" style={{ margin: '0 0 1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem' }}>
                <div style={{ flex: 1, height: 1, background: T.border }} />
                <span style={{ fontSize: 12, color: T.text3, whiteSpace: 'nowrap' }}>Pas encore de compte ?</span>
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

            <div className="login-fade-3" style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <Link to="/acceuil" style={{ fontSize: 13, color: T.text3, textDecoration: 'none' }}>← Retour à l'accueil</Link>
            </div>

            <div className="login-fade-4" style={{
              padding: '12px 16px',
              background: `rgba(45,95,93,0.06)`,
              border: `1px solid ${T.border}`,
              borderRadius: 10, textAlign: 'center',
            }}>
              <span style={{ fontSize: 12, color: T.text3 }}>Vous êtes employé ? </span>
              <Link to="/login" style={{ fontSize: 12, color: T.teal, fontFamily: 'Syne, sans-serif', fontWeight: 700, textDecoration: 'none' }}>
                Accès espace staff →
              </Link>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
