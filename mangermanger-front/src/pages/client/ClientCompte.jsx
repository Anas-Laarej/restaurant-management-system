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

const TABS = [
  { id: 'apercu', label: 'Aperçu' },
  { id: 'reservations', label: 'Réservations' },
  { id: 'commandes', label: 'Commandes' },
  { id: 'avis', label: 'Avis' },
  { id: 'profil', label: 'Mon profil' },
];

const STATUT_CMD = {
  en_attente:     { label: 'En attente',     color: '#2D5F5D', bg: 'rgba(45,95,93,0.1)' },
  confirmee:      { label: 'Confirmée',      color: T.gold,    bg: 'rgba(200,168,75,0.12)' },
  en_preparation: { label: 'En préparation', color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
  prete:          { label: 'Prête',          color: T.gold,    bg: 'rgba(200,168,75,0.12)' },
  livree:         { label: 'Livrée',         color: T.text3,   bg: 'rgba(26,46,45,0.06)' },
  annulee:        { label: 'Annulée',        color: '#dc2626', bg: 'rgba(220,38,38,0.08)' },
};
const STATUT_RES = {
  en_attente: { label: '⏳ En attente', color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
  confirmee:  { label: '✅ Confirmée',  color: T.teal,   bg: 'rgba(45,95,93,0.1)' },
  annulee:    { label: '❌ Annulée',   color: '#dc2626', bg: 'rgba(220,38,38,0.08)' },
  terminee:   { label: 'Terminée',    color: T.text3,   bg: 'rgba(26,46,45,0.06)' },
};

const lightInp = {
  width: '100%',
  background: T.offWhite,
  border: `1.5px solid ${T.border}`,
  borderRadius: 10,
  padding: '11px 16px',
  color: T.text,
  fontSize: 14,
  outline: 'none',
  fontFamily: 'DM Sans, sans-serif',
  boxSizing: 'border-box',
  transition: 'all 0.2s',
};
const lightLbl = {
  display: 'block',
  fontSize: 11,
  color: T.teal,
  marginBottom: 7,
  fontFamily: 'Syne, sans-serif',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
};

function downloadReservationPDF(r) {
  const date = new Date(r.date_heure);
  const dateLong = date.toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  const heure    = date.toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' });
  const numRes   = String(r.id).padStart(4, '0');
  const today    = new Date().toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' });
  const isConfirmee = r.statut === 'confirmee';

  const statusColor  = isConfirmee ? '#2D5F5D' : '#D97706';
  const statusBg     = isConfirmee ? '#F0FAF5' : '#FFFBEB';
  const statusBorder = isConfirmee ? '#A7D9C5' : '#FDE68A';
  const statusLabel  = isConfirmee ? '✅ Réservation confirmée' : '⏳ En attente de confirmation';
  const statusSub    = isConfirmee ? 'Nous vous attendons avec impatience !' : 'Validation en cours par notre équipe';

  const html = `<!DOCTYPE html><html lang="fr">
<head>
<meta charset="UTF-8"><title>Réservation Zefran #${numRes}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'DM Sans',Arial,sans-serif;background:#fff;color:#1a0e04;max-width:720px;margin:0 auto}
  .header{background:linear-gradient(150deg,#1A3A38 0%,#2D5F5D 60%,#3A7A77 100%);padding:44px 48px 36px;color:#fff;position:relative;overflow:hidden;}
  .header::before{content:'';position:absolute;top:-60px;right:-60px;width:220px;height:220px;border-radius:50%;background:rgba(200,168,75,0.1)}
  .header-inner{position:relative;z-index:1;display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:20px}
  .header-brand .logo{font-size:40px;margin-bottom:8px}
  .header-brand .name{font-family:'Playfair Display',Georgia,serif;font-size:34px;font-weight:900;letter-spacing:0.05em;line-height:1}
  .header-brand .tagline{font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(245,237,216,0.6);margin-top:5px}
  .header-ref .ref-label{font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(245,237,216,0.55);margin-bottom:4px;text-align:right}
  .header-ref .ref-num{font-family:'Playfair Display',Georgia,serif;font-size:26px;font-weight:900;color:#C8A84B}
  .header-ref .ref-date{font-size:11px;color:rgba(245,237,216,0.5);margin-top:3px;text-align:right}
  .status-ribbon{background:${statusBg};border-bottom:1px solid ${statusBorder};padding:14px 48px;display:flex;align-items:center;gap:10px;}
  .status-dot{width:10px;height:10px;border-radius:50%;background:${isConfirmee ? '#2D5F5D' : '#F59E0B'};flex-shrink:0}
  .status-text{font-size:12px;font-weight:700;letter-spacing:0.04em;color:${statusColor}}
  .status-sub{margin-left:auto;font-size:11px;color:${statusColor};opacity:0.7}
  .body{padding:36px 48px 40px}
  .cards{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:30px}
  .card{background:#FAF5EC;border:1.5px solid #EDD9B0;border-radius:14px;padding:18px 20px;display:flex;align-items:center;gap:14px}
  .card-icon{font-size:26px;flex-shrink:0;width:48px;height:48px;border-radius:12px;background:#fff;border:1px solid #EDD9B0;display:flex;align-items:center;justify-content:center}
  .card-label{font-size:9px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#2D5F5D;margin-bottom:4px}
  .card-value{font-family:'Playfair Display',Georgia,serif;font-size:16px;font-weight:700;color:#1a0e04;line-height:1.2}
  .card-sub{font-size:11px;color:#6B8E8C;margin-top:2px}
  .section{margin-bottom:22px}
  .sec-title{font-size:9px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#2D5F5D;margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid #EDD9B0}
  .row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #F5ECD8;font-size:13px}
  .row:last-child{border-bottom:none}
  .lbl{color:#6B8E8C}.val{font-weight:600;color:#1a0e04;text-align:right}
  .info-note{background:${statusBg};border:1.5px solid ${statusBorder};border-radius:12px;padding:14px 18px;display:flex;align-items:flex-start;gap:10px;margin-bottom:22px;}
  .info-note-icon{font-size:18px;flex-shrink:0;margin-top:1px}
  .info-note-text{font-size:12px;color:${statusColor};line-height:1.65}
  .footer{border-top:1px solid #EDD9B0;padding-top:20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px}
  .footer-brand-name{font-family:'Playfair Display',Georgia,serif;font-size:14px;font-weight:700;color:#1a0e04}
  .footer-brand-sub{font-size:10px;color:#6B8E8C}
  .footer-info{text-align:right;font-size:10px;color:#2D5F5D;line-height:1.8}
  @media print{body{max-width:100%}@page{margin:12mm}}
</style>
</head>
<body>
  <div class="header"><div class="header-inner">
    <div class="header-brand"><div class="logo">🍽️</div><div class="name">Zefran</div><div class="tagline">Restaurant Marocain · Ocean, Rabat</div></div>
    <div class="header-ref"><div class="ref-label">Réservation N°</div><div class="ref-num">#${numRes}</div><div class="ref-date">${today}</div></div>
  </div></div>
  <div class="status-ribbon"><div class="status-dot"></div><div class="status-text">${statusLabel}</div><div class="status-sub">${statusSub}</div></div>
  <div class="body">
    <div class="cards">
      <div class="card"><div class="card-icon">📅</div><div><div class="card-label">Date</div><div class="card-value">${dateLong.split(' ').slice(1).join(' ')}</div><div class="card-sub">${dateLong.split(' ')[0]}</div></div></div>
      <div class="card"><div class="card-icon">🕐</div><div><div class="card-label">Heure d'arrivée</div><div class="card-value">${heure}</div><div class="card-sub">Service du ${date.getHours() < 15 ? 'midi' : 'soir'}</div></div></div>
      <div class="card"><div class="card-icon">🪑</div><div><div class="card-label">Table réservée</div><div class="card-value">Table ${r.table_numero}</div><div class="card-sub">Salle principale</div></div></div>
      <div class="card"><div class="card-icon">👥</div><div><div class="card-label">Convives</div><div class="card-value">${r.nombre_personnes}</div><div class="card-sub">personne${r.nombre_personnes > 1 ? 's' : ''}</div></div></div>
    </div>
    <div class="section">
      <div class="sec-title">Informations client</div>
      <div class="row"><span class="lbl">Nom complet</span><span class="val">${r.client_nom}</span></div>
      ${r.client_email ? `<div class="row"><span class="lbl">Email</span><span class="val">${r.client_email}</span></div>` : ''}
      ${r.client_tel ? `<div class="row"><span class="lbl">Téléphone</span><span class="val">${r.client_tel}</span></div>` : ''}
    </div>
    <div class="info-note"><div class="info-note-icon">${isConfirmee ? '✅' : '📬'}</div><div class="info-note-text">${isConfirmee ? 'Votre réservation est <strong>officiellement confirmée</strong>. Présentez ce document à l\'accueil le jour de votre visite.' : 'Votre réservation est enregistrée. Vous recevrez une <strong>confirmation dans votre espace "Mon compte"</strong> dès que le gérant l\'aura validée.'}</div></div>
    <div class="footer">
      <div class="footer-brand" style="display:flex;align-items:center;gap:10px"><div style="font-size:22px">🍽️</div><div><div class="footer-brand-name">Zefran</div><div class="footer-brand-sub">Restaurant Marocain</div></div></div>
      <div class="footer-info">Ocean, Rabat · +212 5 22 34 56 66<br/>contact@zefran.ma<br/>Document généré le ${today}</div>
    </div>
  </div>
</body></html>`;

  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;top:0;left:0;width:0;height:0;border:none;visibility:hidden';
  document.body.appendChild(iframe);
  const doc = iframe.contentDocument || iframe.contentWindow.document;
  doc.open(); doc.write(html); doc.close();
  iframe.contentWindow.focus();
  iframe.contentWindow.print();
  setTimeout(() => document.body.removeChild(iframe), 2000);
}

export default function ClientCompte() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('apercu');
  const [profil, setProfil] = useState(null);
  const [commandes, setCommandes] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [plats, setPlats] = useState([]);
  const [avisForm, setAvisForm] = useState({ commentaire: '', plat: '' });
  const [avisOk, setAvisOk] = useState(false);
  const [profilForm, setProfilForm] = useState({});
  const [profilOk, setProfilOk] = useState(false);
  const [avisError, setAvisError] = useState('');
  const [profilError, setProfilError] = useState('');
  const [annulCmdMsg, setAnnulCmdMsg] = useState('');
  const [annulResMsg, setAnnulResMsg] = useState('');
  const [mdpForm, setMdpForm] = useState({ ancien: '', nouveau: '', confirm: '' });
  const [mdpOk, setMdpOk] = useState(false);
  const [mdpError, setMdpError] = useState('');

  const fetchCommandes = () => API.get('/commandes-client/').then(r => setCommandes(r.data.results || r.data)).catch(() => {});

  useEffect(() => {
    if (!user) { navigate('/acceuil/login'); return; }
    API.get('/mon-profil/').then(r => { setProfil(r.data); setProfilForm({ first_name: r.data.user?.first_name || '', last_name: r.data.user?.last_name || '', email: r.data.user?.email || '', telephone: r.data.telephone || '' }); }).catch(() => {});
    fetchCommandes();
    API.get('/mes-reservations/').then(r => setReservations(r.data.results || r.data)).catch(() => {});
    API.get('/plats/?disponible=true').then(r => setPlats(r.data.results || r.data)).catch(() => {});
  }, [user]);

  const annulerReservation = async (id) => {
    if (!window.confirm('Annuler cette réservation ?')) return;
    try {
      await API.post(`/annuler-reservation/${id}/`);
      setAnnulResMsg('Réservation annulée avec succès.');
      API.get('/mes-reservations/').then(r => setReservations(r.data.results || r.data));
      setTimeout(() => setAnnulResMsg(''), 4000);
    } catch (e) {
      setAnnulResMsg(e.response?.data?.error || "Impossible d'annuler cette réservation.");
      setTimeout(() => setAnnulResMsg(''), 4000);
    }
  };

  const annulerCommande = async (id) => {
    if (!window.confirm('Annuler cette commande ?')) return;
    try {
      await API.post(`/commandes-client/${id}/annuler/`);
      setAnnulCmdMsg('Commande annulée avec succès.');
      fetchCommandes();
      setTimeout(() => setAnnulCmdMsg(''), 4000);
    } catch (e) {
      setAnnulCmdMsg(e.response?.data?.error || "Impossible d'annuler cette commande.");
      setTimeout(() => setAnnulCmdMsg(''), 4000);
    }
  };

  const saveAvis = async () => {
    setAvisError('');
    try {
      await API.post('/avis/', { client_nom: profil?.nom_complet || user?.username, ...avisForm, plat: avisForm.plat || null });
      setAvisOk(true);
      setAvisForm({ commentaire: '', plat: '' });
      setTimeout(() => setAvisOk(false), 4000);
    } catch (e) {
      setAvisError(e.response?.data?.error || "Erreur lors de la publication de l'avis.");
    }
  };

  const saveProfil = async () => {
    setProfilError('');
    try {
      await API.patch('/mon-profil/', profilForm);
      const r = await API.get('/mon-profil/');
      setProfil(r.data);
      setProfilOk(true);
      setTimeout(() => setProfilOk(false), 3000);
    } catch (e) {
      setProfilError(e.response?.data?.error || 'Erreur lors de la mise à jour du profil.');
    }
  };

  const changerMdp = async () => {
    setMdpError('');
    if (mdpForm.nouveau !== mdpForm.confirm) { setMdpError('Les nouveaux mots de passe ne correspondent pas.'); return; }
    try {
      const r = await API.post('/changer-mot-de-passe/', { ancien_mot_de_passe: mdpForm.ancien, nouveau_mot_de_passe: mdpForm.nouveau });
      localStorage.setItem('token', r.data.token);
      setMdpOk(true);
      setMdpForm({ ancien: '', nouveau: '', confirm: '' });
      setTimeout(() => setMdpOk(false), 4000);
    } catch (e) {
      setMdpError(e.response?.data?.error || 'Erreur lors du changement de mot de passe.');
    }
  };

  if (!user) return null;

  const initiale = user.first_name?.[0] || user.username?.[0] || 'C';

  const card = (children, extraStyle = {}) => ({
    background: '#fff', border: `1px solid ${T.border}`, borderRadius: 20, padding: '1.5rem',
    boxShadow: '0 4px 20px rgba(45,95,93,0.07)', ...extraStyle,
  });

  return (
    <div style={{ background: T.offWhite, minHeight: '100vh', paddingTop: 68, fontFamily: 'DM Sans, sans-serif' }}>

      {/* Header profil */}
      <div style={{ background: `linear-gradient(135deg, ${T.tealDark} 0%, ${T.teal} 100%)`, borderBottom: `1px solid rgba(45,95,93,0.2)`, padding: '3rem 1.5rem 2rem' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
            <div style={{ width: 76, height: 76, borderRadius: '50%', background: `linear-gradient(135deg, ${T.gold}, #A88A38)`, border: '3px solid rgba(200,168,75,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 30, color: '#fff', flexShrink: 0, boxShadow: '0 0 32px rgba(200,168,75,0.3)' }}>
              {initiale}
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 26, color: '#fff', marginBottom: 6 }}>
                {profil?.nom_complet || user.username}
              </h1>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'rgba(245,237,216,0.55)' }}>{user.email}</span>
                {profil && (
                  <span style={{ background: 'rgba(200,168,75,0.2)', border: '1px solid rgba(200,168,75,0.4)', borderRadius: 20, padding: '3px 12px', fontSize: 12, color: T.gold, fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
                    ★ {profil.points_fidelite} pts fidélité
                  </span>
                )}
              </div>
            </div>
            <button onClick={() => { logout(); navigate('/acceuil'); }} style={{ padding: '9px 18px', background: 'transparent', border: '1px solid rgba(245,237,216,0.2)', borderRadius: 10, color: 'rgba(245,237,216,0.75)', fontSize: 13, fontFamily: 'Syne, sans-serif', fontWeight: 600, cursor: 'pointer' }}>
              Déconnexion
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: '1.75rem' }}>
            {[['Commandes', commandes.length, '📦'], ['Réservations', reservations.length, '📅'], ['Points fidélité', profil?.points_fidelite || 0, '★']].map(([l, v, ic]) => (
              <div key={l} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '1.1rem', textAlign: 'center' }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{ic}</div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 24, color: '#fff' }}>{v}</div>
                <div style={{ fontSize: 11, color: 'rgba(245,237,216,0.45)', marginTop: 3 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: '#fff', borderBottom: `1px solid ${T.border}`, position: 'sticky', top: 68, zIndex: 50, overflowX: 'auto', boxShadow: '0 2px 8px rgba(45,95,93,0.06)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 1.5rem', display: 'flex', gap: 4 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ padding: '14px 18px', background: 'none', border: 'none', borderBottom: `2px solid ${tab === t.id ? T.teal : 'transparent'}`, color: tab === t.id ? T.teal : T.text3, fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>

        {/* APERCU */}
        {tab === 'apercu' && (
          <div style={{ display: 'grid', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
              {[
                { icon: '📅', title: 'Réserver une table', desc: 'Choisissez votre date et heure préférées.', link: '/acceuil/reserver' },
                { icon: '🛒', title: 'Commander en ligne', desc: "Composez votre repas depuis l'application.", link: '/acceuil/commander' },
                { icon: '💬', title: 'Laisser un avis', desc: 'Partagez votre dernière expérience.', action: () => setTab('avis') },
              ].map(f => (
                <div key={f.title} onClick={f.action || undefined}
                  style={{ ...card(), cursor: f.action ? 'pointer' : undefined, transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = `rgba(45,95,93,0.25)`; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(45,95,93,0.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(45,95,93,0.07)'; }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>{f.icon}</div>
                  <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: T.text, marginBottom: 6 }}>{f.title}</h3>
                  <p style={{ fontSize: 13, color: T.text3, marginBottom: 14, lineHeight: 1.6 }}>{f.desc}</p>
                  {f.link
                    ? <Link to={f.link} style={{ fontSize: 13, color: T.teal, fontFamily: 'Syne, sans-serif', fontWeight: 700, textDecoration: 'none' }}>Accéder →</Link>
                    : <span style={{ fontSize: 13, color: T.teal, fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>Accéder →</span>
                  }
                </div>
              ))}
            </div>

            {commandes.length > 0 && (
              <div style={card()}>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: T.text, marginBottom: '1rem' }}>Dernière commande</h3>
                {(() => {
                  const c = commandes[0];
                  const st = STATUT_CMD[c.statut] || { label: c.statut, color: T.text3, bg: 'rgba(26,46,45,0.06)' };
                  return (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                      <div>
                        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: T.teal, marginBottom: 4 }}>Commande #CM-{String(c.id).padStart(4, '0')}</div>
                        <div style={{ fontSize: 13, color: T.text2 }}>{c.items?.map(i => i.plat_nom).join(', ')}</div>
                        <div style={{ fontSize: 12, color: T.text3, marginTop: 4 }}>{new Date(c.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 24, color: T.teal, marginBottom: 6 }}>{parseFloat(c.montant_total).toFixed(0)} DH</div>
                        <span style={{ fontSize: 12, color: st.color, background: st.bg, padding: '4px 12px', borderRadius: 20, fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{st.label}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* RÉSERVATIONS */}
        {tab === 'reservations' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: 10 }}>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 22, color: T.text }}>Mes réservations</h2>
              <Link to="/acceuil/reserver" style={{ padding: '10px 18px', background: T.teal, color: '#fff', borderRadius: 12, textDecoration: 'none', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13, boxShadow: `0 8px 28px rgba(45,95,93,0.3)` }}>
                + Nouvelle réservation
              </Link>
            </div>

            {annulResMsg && (
              <div style={{ background: annulResMsg.includes('succès') ? 'rgba(45,95,93,0.08)' : '#fef2f2', border: `1px solid ${annulResMsg.includes('succès') ? 'rgba(45,95,93,0.25)' : '#fca5a5'}`, borderRadius: 14, padding: '12px 16px', color: annulResMsg.includes('succès') ? T.teal : '#dc2626', fontSize: 13, marginBottom: '1rem', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
                {annulResMsg.includes('succès') ? '✓' : '⚠'} {annulResMsg}
              </div>
            )}

            {reservations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', ...card() }}>
                <div style={{ fontSize: 56, marginBottom: 12, opacity: 0.4 }}>📅</div>
                <p style={{ color: T.text3, fontSize: 15, marginBottom: '1rem' }}>Aucune réservation pour le moment</p>
                <Link to="/acceuil/reserver" style={{ display: 'inline-block', padding: '12px 24px', background: T.teal, color: '#fff', borderRadius: 12, textDecoration: 'none', fontFamily: 'Syne, sans-serif', fontWeight: 700, boxShadow: `0 8px 24px rgba(45,95,93,0.3)` }}>
                  Réserver une table
                </Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 14 }}>
                {reservations.map(r => {
                  const st = STATUT_RES[r.statut] || STATUT_RES.en_attente;
                  const date = new Date(r.date_heure);
                  return (
                    <div key={r.id} style={{ ...card(), border: `1px solid ${r.statut === 'confirmee' ? 'rgba(45,95,93,0.25)' : T.border}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: T.teal }}>Réservation #{String(r.id).padStart(4, '0')}</span>
                            <span style={{ fontSize: 12, color: st.color, background: st.bg, padding: '3px 12px', borderRadius: 20, fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{st.label}</span>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8 }}>
                            {[['📅 Date', date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })], ['🕐 Heure', date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })], ['🪑 Table', `Table ${r.table_numero}`], ['👥 Personnes', `${r.nombre_personnes} pers.`]].map(([k, v]) => (
                              <div key={k} style={{ background: T.offWhite, borderRadius: 10, padding: '8px 12px' }}>
                                <div style={{ fontSize: 11, color: T.text3, marginBottom: 2 }}>{k}</div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{v}</div>
                              </div>
                            ))}
                          </div>
                          {r.notes && <div style={{ marginTop: 10, fontSize: 13, color: T.text3, fontStyle: 'italic' }}>Notes : {r.notes}</div>}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                          {['en_attente', 'confirmee'].includes(r.statut) && (
                            <button onClick={() => annulerReservation(r.id)} style={{ padding: '10px 16px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, color: '#dc2626', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}>✕ Annuler</button>
                          )}
                          <button onClick={() => downloadReservationPDF(r)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: r.statut === 'confirmee' ? T.teal : T.offWhite, border: `1px solid ${r.statut === 'confirmee' ? T.teal : T.border}`, borderRadius: 10, color: r.statut === 'confirmee' ? '#fff' : T.text2, fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: r.statut === 'confirmee' ? `0 4px 16px rgba(45,95,93,0.3)` : 'none' }}>
                            📄 {r.statut === 'confirmee' ? 'PDF confirmé' : 'Télécharger PDF'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* COMMANDES */}
        {tab === 'commandes' && (
          <div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 22, color: T.text, marginBottom: '1.25rem' }}>Mes commandes</h2>
            {annulCmdMsg && (
              <div style={{ background: annulCmdMsg.includes('succès') ? 'rgba(45,95,93,0.08)' : '#fef2f2', border: `1px solid ${annulCmdMsg.includes('succès') ? 'rgba(45,95,93,0.25)' : '#fca5a5'}`, borderRadius: 14, padding: '12px 16px', color: annulCmdMsg.includes('succès') ? T.teal : '#dc2626', fontSize: 13, marginBottom: '1rem', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
                {annulCmdMsg.includes('succès') ? '✓' : '⚠'} {annulCmdMsg}
              </div>
            )}
            {commandes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', ...card() }}>
                <div style={{ fontSize: 56, marginBottom: 12, opacity: 0.4 }}>🛒</div>
                <p style={{ color: T.text3, fontSize: 15 }}>Aucune commande pour le moment</p>
                <Link to="/acceuil/commander" style={{ display: 'inline-block', marginTop: '1rem', padding: '12px 24px', background: T.teal, color: '#fff', borderRadius: 12, textDecoration: 'none', fontFamily: 'Syne, sans-serif', fontWeight: 700, boxShadow: `0 8px 24px rgba(45,95,93,0.3)` }}>
                  Commander maintenant
                </Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 12 }}>
                {commandes.map(c => {
                  const st = STATUT_CMD[c.statut] || { label: c.statut, color: T.text3, bg: 'rgba(26,46,45,0.06)' };
                  return (
                    <div key={c.id} style={card()}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                        <div>
                          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: T.teal, fontSize: 15, marginBottom: 4 }}>Commande #CM-{String(c.id).padStart(4, '0')}</div>
                          <div style={{ fontSize: 12, color: T.text3 }}>{new Date(c.created_at).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 22, color: T.text }}>{parseFloat(c.montant_total).toFixed(0)} DH</div>
                          <span style={{ fontSize: 12, color: st.color, background: st.bg, padding: '3px 12px', borderRadius: 20, fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{st.label}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginTop: 4 }}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {c.items?.map(i => (
                            <span key={i.id} style={{ fontSize: 12, color: T.text2, background: T.offWhite, padding: '4px 10px', borderRadius: 8, border: `1px solid ${T.border}` }}>
                              {i.plat_nom} ×{i.quantite}
                            </span>
                          ))}
                        </div>
                        {['en_attente', 'en_preparation'].includes(c.statut) && (
                          <button onClick={() => annulerCommande(c.id)} style={{ padding: '7px 14px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, color: '#dc2626', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
                            ✕ Annuler la commande
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* AVIS */}
        {tab === 'avis' && (
          <div style={{ maxWidth: 560 }}>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 22, color: T.text, marginBottom: '1.5rem' }}>Laisser un avis</h2>
            {avisOk && (
              <div style={{ background: 'rgba(45,95,93,0.08)', border: `1px solid rgba(45,95,93,0.25)`, borderRadius: 14, padding: '14px 18px', color: T.teal, fontSize: 14, marginBottom: '1.25rem', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
                ✓ Merci pour votre avis !
              </div>
            )}
            <div style={{ ...card(), display: 'grid', gap: 18 }}>
              <div>
                <label style={lightLbl}>Plat évalué <span style={{ fontWeight: 400, textTransform: 'none', color: T.text3 }}>(optionnel)</span></label>
                <select value={avisForm.plat} onChange={e => setAvisForm({ ...avisForm, plat: e.target.value })} style={lightInp}>
                  <option value="">Expérience générale du restaurant</option>
                  {plats.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
                </select>
              </div>
              <div>
                <label style={lightLbl}>Votre commentaire</label>
                <textarea value={avisForm.commentaire} onChange={e => setAvisForm({ ...avisForm, commentaire: e.target.value })} placeholder="Partagez votre expérience en détail..." rows={4} style={{ ...lightInp, resize: 'vertical' }} />
              </div>
              {avisError && <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '10px 14px', color: '#dc2626', fontSize: 13 }}>⚠ {avisError}</div>}
              <button onClick={saveAvis} disabled={!avisForm.commentaire} style={{ padding: '14px', background: avisForm.commentaire ? T.teal : 'rgba(45,95,93,0.08)', border: 'none', borderRadius: 12, color: avisForm.commentaire ? '#fff' : T.text3, fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, cursor: avisForm.commentaire ? 'pointer' : 'not-allowed', boxShadow: avisForm.commentaire ? `0 8px 28px rgba(45,95,93,0.35)` : 'none' }}>
                Publier mon avis
              </button>
            </div>
          </div>
        )}

        {/* PROFIL */}
        {tab === 'profil' && (
          <div style={{ maxWidth: 520 }}>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 22, color: T.text, marginBottom: '1.5rem' }}>Mon profil</h2>
            {profilOk && (
              <div style={{ background: 'rgba(45,95,93,0.08)', border: `1px solid rgba(45,95,93,0.25)`, borderRadius: 14, padding: '14px 18px', color: T.teal, fontSize: 14, marginBottom: '1.25rem', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
                ✓ Profil mis à jour !
              </div>
            )}
            <div style={{ ...card(), display: 'grid', gap: 16, marginBottom: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={lightLbl}>Prénom</label><input style={lightInp} value={profilForm.first_name || ''} onChange={e => setProfilForm({ ...profilForm, first_name: e.target.value })} /></div>
                <div><label style={lightLbl}>Nom</label><input style={lightInp} value={profilForm.last_name || ''} onChange={e => setProfilForm({ ...profilForm, last_name: e.target.value })} /></div>
              </div>
              <div><label style={lightLbl}>Email</label><input style={lightInp} type="email" value={profilForm.email || ''} onChange={e => setProfilForm({ ...profilForm, email: e.target.value })} /></div>
              <div><label style={lightLbl}>Téléphone</label><input style={lightInp} value={profilForm.telephone || ''} onChange={e => setProfilForm({ ...profilForm, telephone: e.target.value })} /></div>

              {profil && (
                <div style={{ background: T.cream, border: `1px solid rgba(200,168,75,0.3)`, borderRadius: 14, padding: '1.25rem' }}>
                  <div style={{ fontSize: 12, color: T.teal, fontFamily: 'Syne, sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Programme fidélité</div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 28, color: T.teal, marginBottom: 4 }}>★ {profil.points_fidelite} points</div>
                  <div style={{ fontSize: 13, color: T.text2 }}>Vous gagnez 1 point par 10 DH dépensé · Membre depuis {new Date(profil.created_at || Date.now()).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</div>
                </div>
              )}

              {profilError && <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '10px 14px', color: '#dc2626', fontSize: 13 }}>⚠ {profilError}</div>}
              <button onClick={saveProfil} style={{ padding: '13px', background: T.teal, border: 'none', borderRadius: 12, color: '#fff', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: `0 8px 28px rgba(45,95,93,0.35)` }}>
                Sauvegarder
              </button>
            </div>

            {/* Changer MDP */}
            <div style={{ ...card(), display: 'grid', gap: 16 }}>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, color: T.text, margin: 0 }}>🔒 Changer le mot de passe</h3>
              {mdpOk && (
                <div style={{ background: 'rgba(45,95,93,0.08)', border: `1px solid rgba(45,95,93,0.25)`, borderRadius: 12, padding: '12px 16px', color: T.teal, fontSize: 14, fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
                  ✓ Mot de passe modifié avec succès !
                </div>
              )}
              <div><label style={lightLbl}>Mot de passe actuel</label><input type="password" style={lightInp} value={mdpForm.ancien} onChange={e => setMdpForm({ ...mdpForm, ancien: e.target.value })} placeholder="••••••••" /></div>
              <div><label style={lightLbl}>Nouveau mot de passe</label><input type="password" style={lightInp} value={mdpForm.nouveau} onChange={e => setMdpForm({ ...mdpForm, nouveau: e.target.value })} placeholder="Min. 6 caractères" /></div>
              <div>
                <label style={lightLbl}>Confirmer le nouveau mot de passe</label>
                <input type="password" style={{ ...lightInp, borderColor: mdpForm.confirm && mdpForm.nouveau !== mdpForm.confirm ? '#fca5a5' : T.border }} value={mdpForm.confirm} onChange={e => setMdpForm({ ...mdpForm, confirm: e.target.value })} placeholder="••••••••" />
                {mdpForm.confirm && mdpForm.nouveau !== mdpForm.confirm && <p style={{ fontSize: 12, color: '#dc2626', marginTop: 6 }}>Les mots de passe ne correspondent pas.</p>}
              </div>
              {mdpError && <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '10px 14px', color: '#dc2626', fontSize: 13 }}>⚠ {mdpError}</div>}
              <button onClick={changerMdp} disabled={!mdpForm.ancien || !mdpForm.nouveau || !mdpForm.confirm}
                style={{ padding: '13px', background: mdpForm.ancien && mdpForm.nouveau && mdpForm.confirm ? T.teal : 'rgba(45,95,93,0.08)', border: 'none', borderRadius: 12, color: mdpForm.ancien && mdpForm.nouveau && mdpForm.confirm ? '#fff' : T.text3, fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, cursor: mdpForm.ancien && mdpForm.nouveau && mdpForm.confirm ? 'pointer' : 'not-allowed', boxShadow: mdpForm.ancien && mdpForm.nouveau && mdpForm.confirm ? `0 8px 28px rgba(45,95,93,0.35)` : 'none' }}>
                Changer le mot de passe
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
