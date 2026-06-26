import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  border: "rgba(45,95,93,0.12)",
};

export default function ClientCommander() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plats, setPlats] = useState([]);
  const [cats, setCats] = useState([]);
  const [catActive, setCatActive] = useState('');
  const [search, setSearch] = useState('');
  const [panier, setPanier] = useState([]);
  const [codePromo, setCodePromo] = useState('');
  const [promoInfo, setPromoInfo] = useState(null);
  const [tableNumero, setTableNumero] = useState('');
  const [notes, setNotes] = useState('');
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    API.get('/plats/?disponible=true').then(r => setPlats(r.data.results || r.data)).catch(() => {});
    API.get('/categories/').then(r => setCats(r.data.results || r.data)).catch(() => {});
  }, []);

  const filtered = plats.filter(p => {
    const mc = !catActive || p.categorie === parseInt(catActive);
    const ms = !search || p.nom.toLowerCase().includes(search.toLowerCase());
    return mc && ms;
  });

  const addToCart = (plat) => {
    setPanier(prev => {
      const ex = prev.find(i => i.plat_id === plat.id);
      if (ex) return prev.map(i => i.plat_id === plat.id ? { ...i, quantite: i.quantite + 1 } : i);
      return [...prev, { plat_id: plat.id, nom: plat.nom, prix: parseFloat(plat.prix), quantite: 1, emoji: '🍽️', img: plat.image_url }];
    });
  };

  const updateQty = (id, delta) => {
    setPanier(prev => prev.map(i => i.plat_id === id ? { ...i, quantite: Math.max(0, i.quantite + delta) } : i).filter(i => i.quantite > 0));
  };

  const validerPromo = async () => {
    if (!codePromo) return;
    try {
      const r = await API.post('/codes-promo/valider/', { code: codePromo });
      setPromoInfo(r.data);
    } catch { setPromoInfo({ valide: false }); }
  };

  const total = panier.reduce((s, i) => s + i.prix * i.quantite, 0);
  const totalFinal = promoInfo?.valide ? total * (1 - promoInfo.reduction / 100) : total;
  const panierCount = panier.reduce((s, i) => s + i.quantite, 0);

  const commander = async () => {
    if (!user) { navigate('/acceuil/login'); return; }
    if (!panier.length) return;
    setLoading(true); setError('');
    try {
      const r = await API.post('/commandes-client/passer/', {
        items: panier.map(i => ({ plat_id: i.plat_id, quantite: i.quantite })),
        code_promo: promoInfo?.valide ? codePromo : '',
        notes,
        table_numero: tableNumero,
      });
      setSuccess(r.data);
      setPanier([]); setCodePromo(''); setPromoInfo(null); setNotes(''); setTableNumero('');
    } catch (e) {
      setError(!e.response ? 'Serveur non joignable.' : e.response?.data?.error || 'Erreur lors de la commande.');
    } finally { setLoading(false); }
  };

  if (success) return (
    <div style={{ background: T.offWhite, minHeight: '100vh', paddingTop: 68, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 1.5rem' }}>
      <div style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>
        <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'rgba(45,95,93,0.1)', border: `2px solid rgba(45,95,93,0.25)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38, margin: '0 auto 1.5rem', color: T.teal }}>✓</div>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 32, color: T.text, marginBottom: 12 }}>Commande envoyée !</h2>
        <p style={{ color: T.text2, fontSize: 15, marginBottom: '2rem', lineHeight: 1.7 }}>
          Commande <strong style={{ color: T.teal }}>#{String(success.id).padStart(4, '0')}</strong> reçue. Elle est en cours de préparation.
        </p>
        <div style={{ background: '#fff', border: `1px solid ${T.border}`, borderRadius: 20, padding: '1.5rem', marginBottom: '1.5rem', textAlign: 'left', boxShadow: '0 4px 24px rgba(45,95,93,0.08)' }}>
          {success.items?.map(i => (
            <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${T.border}`, fontSize: 14 }}>
              <span style={{ color: T.text2 }}>{i.plat_nom} × {i.quantite}</span>
              <span style={{ color: T.teal, fontWeight: 700 }}>{(i.quantite * parseFloat(i.prix_unitaire)).toFixed(0)} DH</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 0', fontFamily: 'Syne, sans-serif', fontWeight: 800 }}>
            <span style={{ color: T.text }}>Total</span>
            <span style={{ color: T.teal, fontSize: 22 }}>{parseFloat(success.montant_total).toFixed(0)} DH</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <Link to="/acceuil/compte" style={{ padding: '12px 24px', background: T.teal, color: '#fff', borderRadius: 12, textDecoration: 'none', fontFamily: 'Syne, sans-serif', fontWeight: 700, boxShadow: `0 8px 28px rgba(45,95,93,0.35)` }}>Voir mes commandes</Link>
          <button onClick={() => setSuccess(null)} style={{ padding: '12px 20px', border: `1px solid ${T.border}`, borderRadius: 12, background: 'transparent', color: T.text2, fontFamily: 'Syne, sans-serif', fontWeight: 700, cursor: 'pointer' }}>Commander encore</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ background: T.offWhite, minHeight: '100vh', paddingTop: 68 }}>
      {/* Hero header */}
      <div style={{ position: 'relative', overflow: 'hidden', padding: '3rem 1.5rem 2.5rem', background: T.tealDark }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&q=80')", backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.12 }} />
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom, rgba(26,58,56,0.5), rgba(26,58,56,0.85))` }} />
        <div style={{ maxWidth: 1140, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{ display: 'inline-block', background: 'rgba(200,168,75,0.2)', border: '1px solid rgba(200,168,75,0.4)', borderRadius: 20, padding: '4px 14px', fontSize: 11, color: T.gold, fontFamily: 'Syne, sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>
              Commander en ligne
            </div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 40, color: '#fff', marginBottom: 10, lineHeight: 1.05 }}>Composez votre repas</h1>
            <p style={{ color: 'rgba(245,237,216,0.6)', fontSize: 14 }}>Ajoutez vos plats au panier et passez commande</p>
          </div>
          {!user && (
            <Link to="/acceuil/login" style={{ padding: '12px 22px', background: 'rgba(245,237,216,0.1)', border: '1px solid rgba(245,237,216,0.2)', borderRadius: 12, textDecoration: 'none', color: 'rgba(245,237,216,0.85)', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14 }}>
              Se connecter pour commander →
            </Link>
          )}
        </div>
      </div>

      {/* Filtres sticky */}
      <div style={{ background: '#fff', borderBottom: `1px solid ${T.border}`, position: 'sticky', top: 68, zIndex: 40, boxShadow: '0 2px 12px rgba(45,95,93,0.06)' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 1.5rem', display: 'flex', gap: 6, alignItems: 'center', overflowX: 'auto', scrollbarWidth: 'none' }}>
          <div style={{ position: 'relative', flexShrink: 0, padding: '10px 0' }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: T.text3 }}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher..."
              style={{ background: T.offWhite, border: `1px solid ${T.border}`, borderRadius: 8, padding: '7px 12px 7px 30px', fontSize: 13, outline: 'none', color: T.text, width: 160 }}
            />
          </div>
          {[{ id: '', nom: 'Tous' }, ...cats].map(c => {
            const isActive = catActive === (c.id ? String(c.id) : '');
            const count = c.id ? plats.filter(p => p.categorie === c.id).length : plats.length;
            return (
              <button key={c.id || 'all'} onClick={() => setCatActive(c.id ? String(c.id) : '')}
                style={{ padding: '8px 16px', background: isActive ? T.teal : 'transparent', border: `1px solid ${isActive ? T.teal : T.border}`, borderRadius: 20, color: isActive ? '#fff' : T.text2, fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>{c.nom}</span>
                <span style={{ background: isActive ? 'rgba(255,255,255,0.25)' : T.border, borderRadius: 10, padding: '1px 7px', fontSize: 10, fontWeight: 800, color: isActive ? '#fff' : T.text3 }}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ maxWidth: 1140, margin: '0 auto', padding: '2rem 1.5rem', display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>

        {/* Liste plats */}
        <div style={{ display: 'grid', gap: 12 }}>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem', color: T.text3 }}>
              <div style={{ fontSize: 48, marginBottom: 10, opacity: 0.5 }}>🍽️</div>
              <p>Aucun plat trouvé</p>
            </div>
          )}
          {filtered.map(p => {
            const cartItem = panier.find(i => i.plat_id === p.id);
            return (
              <div key={p.id}
                style={{ background: '#fff', border: `1.5px solid ${cartItem ? T.teal : T.border}`, borderRadius: 18, overflow: 'hidden', display: 'flex', alignItems: 'stretch', transition: 'all 0.22s', boxShadow: cartItem ? `0 6px 24px rgba(45,95,93,0.14)` : '0 2px 10px rgba(45,95,93,0.06)' }}
                onMouseEnter={e => { if (!cartItem) e.currentTarget.style.boxShadow = '0 6px 24px rgba(45,95,93,0.12)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = cartItem ? '0 6px 24px rgba(45,95,93,0.14)' : '0 2px 10px rgba(45,95,93,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {/* photo */}
                <div style={{ width: 110, flexShrink: 0, position: 'relative', overflow: 'hidden', background: T.cream }}>
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt={p.nom}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }}
                      onMouseEnter={e => e.target.style.transform = 'scale(1.07)'}
                      onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, background: `linear-gradient(135deg, ${T.cream}, #EDE5CC)` }}>🍽️</div>
                  )}
                  {/* subtle right-side fade to blend with card */}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, transparent 60%, rgba(255,255,255,0.5) 100%)', pointerEvents: 'none' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0, padding: '0.9rem 1rem' }}>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: T.text, marginBottom: 3 }}>{p.nom}</div>
                  <div style={{ fontSize: 11, color: T.teal, fontWeight: 600, marginBottom: 5 }}>{p.categorie_nom}</div>
                  <div style={{ fontSize: 12, color: T.text3, lineHeight: 1.4 }}>{(p.description || 'Plat traditionnel marocain.').slice(0, 65)}{(p.description || '').length > 65 ? '...' : ''}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0, padding: '0.9rem 1rem' }}>
                  <div style={{ background: T.teal, color: '#fff', borderRadius: 20, padding: '4px 12px', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 14 }}>
                    {parseFloat(p.prix).toFixed(0)} DH
                  </div>
                  {cartItem ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <button onClick={() => updateQty(p.id, -1)} style={{ width: 32, height: 32, borderRadius: '50%', background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>−</button>
                      <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, color: T.text, minWidth: 20, textAlign: 'center', fontSize: 16 }}>{cartItem.quantite}</span>
                      <button onClick={() => updateQty(p.id, 1)} style={{ width: 32, height: 32, borderRadius: '50%', background: T.teal, border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>+</button>
                    </div>
                  ) : (
                    <button onClick={() => user ? addToCart(p) : navigate('/acceuil/login')}
                      style={{ padding: '8px 18px', background: T.teal, border: 'none', color: '#fff', borderRadius: 10, fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: `0 4px 14px rgba(45,95,93,0.25)`, transition: 'all 0.15s' }}>
                      Ajouter
                    </button>
                  )}
                  <div style={{ fontSize: 11, color: T.text3 }}>⏱ {p.temps_preparation} min</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Panier sticky */}
        <div style={{ position: 'sticky', top: 120 }}>
          <div style={{ background: '#fff', border: `1px solid ${T.border}`, borderRadius: 20, overflow: 'hidden', boxShadow: '0 8px 40px rgba(45,95,93,0.1)' }}>
            <div style={{ background: `linear-gradient(135deg, ${T.tealDark}, ${T.teal})`, padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, color: '#fff' }}>🛒 Mon panier</h3>
              {panierCount > 0 && (
                <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', borderRadius: 20, padding: '3px 10px', fontSize: 13, fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
                  {panierCount} article{panierCount > 1 ? 's' : ''}
                </span>
              )}
            </div>

            <div style={{ padding: '1rem 1.25rem' }}>
              {panier.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 0', color: T.text3 }}>
                  <div style={{ fontSize: 40, marginBottom: 8, opacity: 0.3 }}>🛒</div>
                  <p style={{ fontSize: 13 }}>Votre panier est vide</p>
                  <p style={{ fontSize: 11, color: T.text3, marginTop: 4 }}>Cliquez sur "Ajouter" pour commencer</p>
                </div>
              ) : (
                <>
                  {panier.map(i => (
                    <div key={i.plat_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: `1px solid ${T.border}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 16 }}>{i.emoji}</span>
                        <div>
                          <div style={{ fontSize: 13, color: T.text, fontWeight: 500 }}>{i.nom}</div>
                          <div style={{ fontSize: 11, color: T.text3 }}>{i.quantite} × {i.prix.toFixed(0)} DH</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: T.teal, fontSize: 14 }}>{(i.quantite * i.prix).toFixed(0)} DH</span>
                        <button onClick={() => updateQty(i.plat_id, -i.quantite)} style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: 15, cursor: 'pointer', padding: '2px 4px' }}>✕</button>
                      </div>
                    </div>
                  ))}

                  <div style={{ marginTop: 14 }}>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                      <input value={codePromo} onChange={e => setCodePromo(e.target.value.toUpperCase())} placeholder="Code promo"
                        style={{ flex: 1, background: T.offWhite, border: `1px solid ${T.border}`, borderRadius: 8, padding: '8px 12px', color: T.text, fontSize: 13, outline: 'none', fontFamily: 'Syne, sans-serif', letterSpacing: '0.05em' }} />
                      <button onClick={validerPromo} style={{ padding: '8px 12px', background: T.teal, border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>OK</button>
                    </div>
                    {promoInfo && (
                      <p style={{ fontSize: 12, color: promoInfo.valide ? T.teal : '#dc2626', marginBottom: 8 }}>
                        {promoInfo.valide ? `✓ -${promoInfo.reduction}% appliqué` : '✕ Code invalide'}
                      </p>
                    )}

                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 11, color: T.teal, marginBottom: 5, fontFamily: 'Syne, sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Numéro de table *
                      </div>
                      <input type="number" min="1" value={tableNumero} onChange={e => setTableNumero(e.target.value)} placeholder="Ex: 5"
                        style={{ width: '100%', background: T.offWhite, border: `1.5px solid ${tableNumero ? T.teal : T.border}`, borderRadius: 8, padding: '10px 12px', color: T.text, fontSize: 14, outline: 'none', fontFamily: 'Syne, sans-serif', fontWeight: 700, boxSizing: 'border-box' }} />
                    </div>

                    <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Note pour le chef (allergies, préférences...)" rows={2}
                      style={{ width: '100%', background: T.offWhite, border: `1px solid ${T.border}`, borderRadius: 8, padding: '8px 12px', color: T.text, fontSize: 12, outline: 'none', resize: 'none', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box', marginBottom: 12 }} />

                    {promoInfo?.valide && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: T.text3, marginBottom: 4 }}>
                        <span>Sous-total</span>
                        <span style={{ textDecoration: 'line-through' }}>{total.toFixed(0)} DH</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Syne, sans-serif', fontWeight: 800, padding: '10px 0', borderTop: `1px solid ${T.border}`, marginBottom: 14 }}>
                      <span style={{ color: T.text, fontSize: 16 }}>Total</span>
                      <span style={{ color: T.teal, fontSize: 24 }}>{totalFinal.toFixed(0)} DH</span>
                    </div>

                    {error && (
                      <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '8px 12px', color: '#dc2626', fontSize: 12, marginBottom: 10 }}>
                        ⚠ {error}
                      </div>
                    )}

                    <button onClick={commander} disabled={loading || panier.length === 0 || !tableNumero}
                      style={{ width: '100%', padding: '14px', background: (panier.length > 0 && tableNumero) ? T.teal : 'rgba(45,95,93,0.08)', border: 'none', borderRadius: 12, color: (panier.length > 0 && tableNumero) ? '#fff' : T.text3, fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, cursor: (panier.length > 0 && tableNumero) ? 'pointer' : 'not-allowed', boxShadow: (panier.length > 0 && tableNumero) ? `0 8px 28px rgba(45,95,93,0.35)` : 'none', transition: 'all 0.2s' }}>
                      {loading ? '⏳ Envoi...' : !user ? 'Se connecter pour commander' : !tableNumero ? 'Indiquez votre table' : '✓ Passer la commande'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
