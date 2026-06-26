import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../api";

const HEURES = [
  "12:00","12:30","13:00","13:30","14:00","14:30",
  "19:00","19:30","20:00","20:30","21:00","21:30","22:00",
];
const PERSONNES = [1, 2, 3, 4, 5, 6, 7, 8];

const T = {
  teal: "#2D5F5D",
  tealDark: "#1A3A38",
  gold: "#C8A84B",
  cream: "#F5EDD8",
  offWhite: "#FAFAF5",
  text: "#1A2E2D",
  text2: "rgba(26,46,45,0.65)",
  text3: "rgba(26,46,45,0.4)",
  border: "rgba(45,95,93,0.14)",
};

const inp = {
  background: "#fff",
  border: `1.5px solid rgba(45,95,93,0.16)`,
  borderRadius: 10,
  padding: "12px 16px",
  color: T.text,
  fontSize: 14,
  outline: "none",
  fontFamily: "DM Sans, sans-serif",
  boxSizing: "border-box",
  width: "100%",
  transition: "all 0.2s",
};

const lbl = {
  display: "block", fontSize: 11, color: T.teal,
  marginBottom: 8, fontFamily: "Syne, sans-serif",
  fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em",
};

export default function ClientReserver() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    client_nom: "",
    client_email: "",
    client_tel: "",
    date: "",
    heure: "",
    nombre_personnes: 2,
    notes: "",
    table_id: "",
  });
  const [tablesDispos, setTablesDispos] = useState([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const [success, setSuccess] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        client_nom: `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username,
        client_email: user.email || "",
      }));
    }
  }, [user]);

  useEffect(() => {
    if (form.date && form.heure && step === 2) {
      setLoadingTables(true);
      const date_heure = `${form.date}T${form.heure}:00`;
      API.get(`/tables-disponibles/?date_heure=${date_heure}&nombre_personnes=${form.nombre_personnes}`)
        .then((r) => { setTablesDispos(r.data); setForm((f) => ({ ...f, table_id: "" })); })
        .catch(() => setTablesDispos([]))
        .finally(() => setLoadingTables(false));
    }
  }, [form.date, form.heure, form.nombre_personnes, step]);

  const submit = async () => {
    if (!form.client_nom.trim()) { setError("Le nom est obligatoire."); return; }
    if (!form.table_id) { setError("Veuillez choisir une table."); return; }
    setLoading(true); setError("");
    try {
      const date_heure = `${form.date}T${form.heure}:00+00:00`;
      const table = tablesDispos.find((t) => t.id === parseInt(form.table_id));
      const r = await API.post("/reserver/", { ...form, date_heure });
      setSelectedTable(table);
      setSuccess(r.data);
      setStep(4);
    } catch (e) {
      setError(e.response?.data?.error || "Erreur lors de la réservation.");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    const dateObj = new Date(form.date);
    const dateLong = dateObj.toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
    const numRes = String(success.id || '').padStart(4, '0');
    const todayStr = new Date().toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' });
    const tableNum = selectedTable?.numero || '?';
    const tableCap = selectedTable?.capacite || '?';

    const html = `<!DOCTYPE html><html lang="fr">
<head>
<meta charset="UTF-8">
<title>Réservation Zefran #${numRes}</title>
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
  .header-ref{text-align:right}
  .header-ref .ref-label{font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(245,237,216,0.55);margin-bottom:4px}
  .header-ref .ref-num{font-family:'Playfair Display',Georgia,serif;font-size:26px;font-weight:900;color:#C8A84B}
  .header-ref .ref-date{font-size:11px;color:rgba(245,237,216,0.5);margin-top:3px}
  .status-ribbon{background:#FAF5EC;border-bottom:1px solid #EDD9B0;padding:14px 48px;display:flex;align-items:center;gap:10px;}
  .status-dot{width:10px;height:10px;border-radius:50%;background:#C8A84B;flex-shrink:0}
  .status-text{font-size:12px;font-weight:700;letter-spacing:0.05em;color:#2D5F5D}
  .status-sub{margin-left:auto;font-size:11px;color:#6B8E8C}
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
  .info-note{background:#F5EDD8;border:1.5px solid #EDD9B0;border-radius:12px;padding:14px 18px;display:flex;align-items:flex-start;gap:10px;margin-bottom:22px;}
  .info-note-icon{font-size:18px;flex-shrink:0;margin-top:1px}
  .info-note-text{font-size:12px;color:#2D5F5D;line-height:1.65}
  .footer{border-top:1px solid #EDD9B0;padding-top:20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px}
  .footer-brand{display:flex;align-items:center;gap:10px}
  .footer-brand-name{font-family:'Playfair Display',Georgia,serif;font-size:14px;font-weight:700;color:#1a0e04}
  .footer-brand-sub{font-size:10px;color:#6B8E8C}
  .footer-info{text-align:right;font-size:10px;color:#2D5F5D;line-height:1.8}
  @media print{body{max-width:100%}@page{margin:12mm}}
</style>
</head>
<body>
  <div class="header">
    <div class="header-inner">
      <div class="header-brand">
        <div class="logo">🍽️</div>
        <div class="name">Zefran</div>
        <div class="tagline">Restaurant Marocain · Ocean, Rabat</div>
      </div>
      <div class="header-ref">
        <div class="ref-label">Réservation N°</div>
        <div class="ref-num">#${numRes}</div>
        <div class="ref-date">${todayStr}</div>
      </div>
    </div>
  </div>
  <div class="status-ribbon">
    <div class="status-dot"></div>
    <div class="status-text">En attente de confirmation du gérant</div>
    <div class="status-sub">Vous serez notifié par email</div>
  </div>
  <div class="body">
    <div class="cards">
      <div class="card"><div class="card-icon">📅</div><div><div class="card-label">Date</div><div class="card-value">${dateLong.split(' ').slice(1).join(' ')}</div><div class="card-sub">${dateLong.split(' ')[0]}</div></div></div>
      <div class="card"><div class="card-icon">🕐</div><div><div class="card-label">Heure</div><div class="card-value">${form.heure}</div><div class="card-sub">Service du soir</div></div></div>
      <div class="card"><div class="card-icon">🪑</div><div><div class="card-label">Table réservée</div><div class="card-value">Table ${tableNum}</div><div class="card-sub">${tableCap} places disponibles</div></div></div>
      <div class="card"><div class="card-icon">👥</div><div><div class="card-label">Convives</div><div class="card-value">${form.nombre_personnes}</div><div class="card-sub">personne${form.nombre_personnes > 1 ? 's' : ''}</div></div></div>
    </div>
    <div class="section">
      <div class="sec-title">Informations client</div>
      <div class="row"><span class="lbl">Nom complet</span><span class="val">${success.client_nom || form.client_nom}</span></div>
      ${(success.client_email || form.client_email) ? `<div class="row"><span class="lbl">Email</span><span class="val">${success.client_email || form.client_email}</span></div>` : ''}
      ${(success.client_tel || form.client_tel) ? `<div class="row"><span class="lbl">Téléphone</span><span class="val">${success.client_tel || form.client_tel}</span></div>` : ''}
    </div>
    <div class="info-note">
      <div class="info-note-icon">📬</div>
      <div class="info-note-text">Votre réservation est enregistrée. Vous recevrez une <strong>confirmation dans votre espace "Mon compte"</strong> dès que le gérant l'aura validée.</div>
    </div>
    <div class="footer">
      <div class="footer-brand"><div style="font-size:22px;margin-right:8px">🍽️</div><div><div class="footer-brand-name">Zefran</div><div class="footer-brand-sub">Restaurant Marocain</div></div></div>
      <div class="footer-info">Ocean, Rabat · +212 5 22 34 56 66<br/>contact@zefran.ma<br/>Document généré le ${todayStr}</div>
    </div>
  </div>
</body>
</html>`;

    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;top:0;left:0;width:0;height:0;border:none;visibility:hidden';
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open(); doc.write(html); doc.close();
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    setTimeout(() => document.body.removeChild(iframe), 2000);
  };

  if (!user) return (
    <div style={{ position: "relative", minHeight: "100vh", background: T.offWhite, overflow: "hidden" }}>
      <div style={{ filter: "blur(6px) brightness(0.96)", pointerEvents: "none", userSelect: "none" }}>
        <div style={{ position: "relative", minHeight: 260, display: "flex", alignItems: "center", overflow: "hidden", background: T.tealDark }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&q=80')", backgroundSize: "cover", backgroundPosition: "center", opacity: 0.2 }} />
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, rgba(26,58,56,0.6) 0%, rgba(26,58,56,0.95) 100%)` }} />
          <div style={{ maxWidth: 1140, margin: "0 auto", padding: "3.5rem 1.5rem", textAlign: "center", position: "relative", zIndex: 1, width: "100%" }}>
            <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: 48, color: "#fff", marginBottom: 12 }}>Réserver une table</h1>
            <p style={{ color: "rgba(245,237,216,0.6)", fontSize: 15 }}>Disponible du mardi au dimanche · Service midi et soir</p>
          </div>
        </div>
        <div style={{ maxWidth: 660, margin: "0 auto", padding: "3rem 1.5rem" }}>
          <div style={{ background: "#fff", border: `1px solid ${T.border}`, borderRadius: 24, padding: "2rem", height: 340 }} />
        </div>
      </div>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
        <div style={{
          background: "#fff",
          border: `1px solid ${T.border}`,
          borderRadius: 24, padding: "3rem 2.5rem",
          maxWidth: 420, width: "100%", textAlign: "center",
          boxShadow: "0 24px 80px rgba(45,95,93,0.15)",
        }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(45,95,93,0.1)", border: `1.5px solid rgba(45,95,93,0.2)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, margin: "0 auto 1.5rem" }}>🔒</div>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: 24, color: T.text, marginBottom: 12 }}>Connexion requise</h2>
          <p style={{ color: T.text2, fontSize: 14, lineHeight: 1.7, marginBottom: "2rem" }}>Veuillez vous connecter pour effectuer une réservation en ligne.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Link to="/login" style={{ display: "block", padding: "14px", background: T.teal, borderRadius: 12, color: "#fff", textDecoration: "none", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, boxShadow: `0 8px 28px rgba(45,95,93,0.35)` }}>Se connecter</Link>
            <Link to="/acceuil/register" style={{ display: "block", padding: "13px", border: `1px solid ${T.border}`, borderRadius: 12, color: T.text2, textDecoration: "none", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14 }}>Créer un compte</Link>
          </div>
        </div>
      </div>
    </div>
  );

  if (success) return (
    <div style={{ background: T.offWhite, minHeight: "100vh", paddingTop: 68 }}>
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100, background: "#fff", borderTop: `1px solid ${T.border}`, padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 -8px 32px rgba(45,95,93,0.1)" }}>
        <div>
          <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, color: T.text }}>Réservation #{String(success.id || '').padStart(4, '0')}</div>
          <div style={{ fontSize: 12, color: T.text3 }}>{new Date(form.date).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })} · {form.heure} · Table {selectedTable?.numero}</div>
        </div>
        <button onClick={downloadPDF} style={{ padding: "11px 22px", background: T.teal, border: "none", borderRadius: 12, color: "#fff", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, boxShadow: `0 8px 28px rgba(45,95,93,0.35)` }}>
          📄 Télécharger PDF
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "5rem 1.5rem 7rem" }}>
        <div style={{ maxWidth: 520, width: "100%", textAlign: "center" }}>
          <div style={{ width: 88, height: 88, borderRadius: "50%", background: "rgba(45,95,93,0.1)", border: `2px solid rgba(45,95,93,0.25)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38, margin: "0 auto 1.5rem", color: T.teal }}>✓</div>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: 32, color: T.text, marginBottom: 12 }}>Réservation envoyée !</h2>
          <p style={{ color: T.text2, fontSize: 15, marginBottom: "2rem", lineHeight: 1.7 }}>
            Bonjour <strong style={{ color: T.text }}>{success.client_nom}</strong>, votre demande de réservation pour la{" "}
            <strong style={{ color: T.teal }}>Table {selectedTable?.numero || "?"}</strong>{" "}
            le <strong style={{ color: T.teal }}>{new Date(form.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })} à {form.heure}</strong> est enregistrée.
          </p>

          <div style={{ background: "#fff", border: `1px solid ${T.border}`, borderRadius: 20, padding: "1.5rem", marginBottom: "1.5rem", textAlign: "left", boxShadow: "0 4px 24px rgba(45,95,93,0.08)" }}>
            {[["Table", `Table ${selectedTable?.numero || "?"}`], ["Personnes", `${form.nombre_personnes} personne(s)`], ["Statut", "⏳ En attente de confirmation"], ["Email", success.client_email || "—"]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: `1px solid ${T.border}`, fontSize: 13 }}>
                <span style={{ color: T.text3 }}>{k}</span>
                <span style={{ color: T.text, fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>

          <div style={{ background: T.cream, border: `1px solid rgba(200,168,75,0.3)`, borderRadius: 12, padding: "12px 16px", fontSize: 13, color: T.text2, marginBottom: "1.5rem" }}>
            📬 Vous recevrez une confirmation quand le gérant validera votre réservation.
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => { setStep(1); setSuccess(null); setSelectedTable(null); setForm(f => ({ ...f, date: "", heure: "", table_id: "", notes: "" })); }}
              style={{ padding: "12px 24px", background: T.teal, border: "none", borderRadius: 12, color: "#fff", fontFamily: "Syne, sans-serif", fontWeight: 700, cursor: "pointer", boxShadow: `0 8px 28px rgba(45,95,93,0.35)` }}>
              Nouvelle réservation
            </button>
            <Link to="/acceuil" style={{ padding: "12px 20px", border: `1px solid ${T.border}`, borderRadius: 12, color: T.text2, textDecoration: "none", fontFamily: "Syne, sans-serif", fontWeight: 700 }}>
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  const stepLabels = ["Infos", "Table", "Confirmer"];

  return (
    <div style={{ background: T.offWhite, minHeight: "100vh", paddingTop: 68 }}>
      {/* Hero */}
      <div style={{ position: "relative", minHeight: 240, display: "flex", alignItems: "center", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&q=80')", backgroundSize: "cover", backgroundPosition: "center" }} />
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, rgba(26,58,56,0.72) 0%, rgba(26,58,56,0.92) 100%)` }} />
        <div style={{ maxWidth: 1140, margin: "0 auto", padding: "3.5rem 1.5rem", textAlign: "center", position: "relative", zIndex: 1, width: "100%" }}>
          <div style={{ display: "inline-block", background: "rgba(200,168,75,0.2)", border: "1px solid rgba(200,168,75,0.4)", borderRadius: 20, padding: "5px 16px", fontSize: 11, color: T.gold, fontFamily: "Syne, sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 16 }}>
            Réservation en ligne
          </div>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: 48, color: "#fff", marginBottom: 12, lineHeight: 1.05 }}>
            Réserver une table
          </h1>
          <p style={{ color: "rgba(245,237,216,0.65)", fontSize: 15 }}>
            Disponible du mardi au dimanche · Service midi et soir
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 660, margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>

        {/* Steps indicator */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: "2.5rem", justifyContent: "center" }}>
          {stepLabels.map((label, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", flex: i < stepLabels.length - 1 ? 1 : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: step >= i + 1 ? T.teal : "#fff",
                  border: `2px solid ${step >= i + 1 ? T.teal : T.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14,
                  color: step >= i + 1 ? "#fff" : T.text3,
                  flexShrink: 0, transition: "all 0.3s",
                  boxShadow: step === i + 1 ? `0 0 20px rgba(45,95,93,0.3)` : "none",
                }}>
                  {step > i + 1 ? "✓" : i + 1}
                </div>
                <span style={{ fontSize: 12, fontFamily: "Syne, sans-serif", fontWeight: 600, color: step >= i + 1 ? T.teal : T.text3, whiteSpace: "nowrap" }}>
                  {label}
                </span>
              </div>
              {i < stepLabels.length - 1 && (
                <div style={{ flex: 1, height: 2, background: step > i + 1 ? T.teal : T.border, margin: "0 12px", borderRadius: 1, transition: "background 0.3s" }} />
              )}
            </div>
          ))}
        </div>

        {/* Form card */}
        <div style={{ background: "#fff", border: `1px solid ${T.border}`, borderRadius: 24, padding: "2rem", boxShadow: "0 8px 40px rgba(45,95,93,0.1)" }}>

          {/* ÉTAPE 1 */}
          {step === 1 && (
            <div style={{ display: "grid", gap: 20 }}>
              <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 18, color: T.text }}>📅 Choisissez votre créneau</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={lbl}>Date *</label>
                  <input type="date" min={today} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} style={inp}
                    onFocus={e => { e.target.style.borderColor = T.teal; e.target.style.boxShadow = `0 0 0 3px rgba(45,95,93,0.1)`; }}
                    onBlur={e => { e.target.style.borderColor = "rgba(45,95,93,0.16)"; e.target.style.boxShadow = "none"; }}
                  />
                </div>
                <div>
                  <label style={lbl}>Heure *</label>
                  <select value={form.heure} onChange={(e) => setForm({ ...form, heure: e.target.value })} style={inp}
                    onFocus={e => { e.target.style.borderColor = T.teal; e.target.style.boxShadow = `0 0 0 3px rgba(45,95,93,0.1)`; }}
                    onBlur={e => { e.target.style.borderColor = "rgba(45,95,93,0.16)"; e.target.style.boxShadow = "none"; }}
                  >
                    <option value="">Sélectionner...</option>
                    <optgroup label="Midi">{HEURES.filter(h => h < "15").map(h => <option key={h}>{h}</option>)}</optgroup>
                    <optgroup label="Soir">{HEURES.filter(h => h >= "19").map(h => <option key={h}>{h}</option>)}</optgroup>
                  </select>
                </div>
              </div>

              <div>
                <label style={lbl}>Nombre de personnes *</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {PERSONNES.map(n => (
                    <button key={n} type="button" onClick={() => setForm({ ...form, nombre_personnes: n })}
                      style={{ width: 48, height: 48, borderRadius: 12, border: "1.5px solid", borderColor: form.nombre_personnes === n ? T.teal : T.border, background: form.nombre_personnes === n ? T.teal : "#fff", color: form.nombre_personnes === n ? "#fff" : T.text2, fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 16, cursor: "pointer", transition: "all 0.15s", boxShadow: form.nombre_personnes === n ? `0 4px 14px rgba(45,95,93,0.3)` : "none" }}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={lbl}>Notes <span style={{ fontWeight: 400, textTransform: "none", color: T.text3 }}>(optionnel)</span></label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Occasion spéciale, allergie, chaise bébé..." rows={3}
                  style={{ ...inp, resize: "vertical" }}
                  onFocus={e => { e.target.style.borderColor = T.teal; e.target.style.boxShadow = `0 0 0 3px rgba(45,95,93,0.1)`; }}
                  onBlur={e => { e.target.style.borderColor = "rgba(45,95,93,0.16)"; e.target.style.boxShadow = "none"; }}
                />
              </div>

              {error && <p style={{ color: "#dc2626", fontSize: 13 }}>⚠ {error}</p>}

              <button type="button" disabled={!form.date || !form.heure}
                onClick={() => { if (!form.date || !form.heure) { setError("Choisissez une date et une heure."); } else { setError(""); setStep(2); } }}
                style={{ padding: "14px", background: form.date && form.heure ? T.teal : "rgba(45,95,93,0.08)", border: "none", borderRadius: 12, color: form.date && form.heure ? "#fff" : T.text3, fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, cursor: form.date && form.heure ? "pointer" : "not-allowed", boxShadow: form.date && form.heure ? `0 8px 28px rgba(45,95,93,0.3)` : "none", transition: "all 0.2s" }}>
                Voir les tables disponibles →
              </button>
            </div>
          )}

          {/* ÉTAPE 2 */}
          {step === 2 && (
            <div style={{ display: "grid", gap: 20 }}>
              <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 18, color: T.text }}>🪑 Choisissez votre table</h3>

              <div style={{ background: T.cream, border: `1px solid rgba(200,168,75,0.3)`, borderRadius: 12, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 14, color: T.teal, fontFamily: "Syne, sans-serif", fontWeight: 700 }}>
                  📅 {new Date(form.date).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })} à {form.heure} · {form.nombre_personnes} pers.
                </span>
                <button type="button" onClick={() => setStep(1)} style={{ fontSize: 12, color: T.teal, background: "none", border: "none", cursor: "pointer", fontFamily: "Syne, sans-serif", fontWeight: 700 }}>Modifier</button>
              </div>

              {loadingTables ? (
                <div style={{ textAlign: "center", padding: "2rem", color: T.teal }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
                  <p style={{ fontSize: 14 }}>Vérification des disponibilités...</p>
                </div>
              ) : tablesDispos.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 14 }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>😔</div>
                  <p style={{ fontSize: 14, color: "#dc2626", fontWeight: 600 }}>Aucune table disponible pour {form.nombre_personnes} personne(s)</p>
                  <p style={{ fontSize: 12, color: T.text3, marginTop: 6 }}>Essayez un autre créneau ou un nombre de personnes différent.</p>
                  <button type="button" onClick={() => setStep(1)} style={{ marginTop: 12, padding: "8px 18px", background: "#dc2626", border: "none", borderRadius: 8, color: "#fff", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Changer le créneau</button>
                </div>
              ) : (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10 }}>
                    {tablesDispos.map(t => (
                      <div key={t.id} onClick={() => setForm({ ...form, table_id: String(t.id) })}
                        style={{ border: `2px solid ${form.table_id === String(t.id) ? T.teal : T.border}`, background: form.table_id === String(t.id) ? T.teal : "#fff", borderRadius: 14, padding: "1.25rem", textAlign: "center", cursor: "pointer", transition: "all 0.2s", boxShadow: form.table_id === String(t.id) ? `0 8px 24px rgba(45,95,93,0.3)` : "0 2px 8px rgba(45,95,93,0.06)" }}>
                        <div style={{ fontSize: 28, marginBottom: 6 }}>🪑</div>
                        <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 16, color: form.table_id === String(t.id) ? "#fff" : T.text, marginBottom: 3 }}>Table {t.numero}</div>
                        <div style={{ fontSize: 12, color: form.table_id === String(t.id) ? "rgba(255,255,255,0.8)" : T.text3 }}>{t.capacite} places</div>
                        <div style={{ fontSize: 10, marginTop: 4, color: form.table_id === String(t.id) ? "rgba(255,255,255,0.7)" : T.teal, fontFamily: "Syne, sans-serif", fontWeight: 600 }}>
                          {t.statut === "libre" ? "Libre" : "Disponible"}
                        </div>
                      </div>
                    ))}
                  </div>

                  {form.table_id && (
                    <div style={{ background: T.cream, border: `1px solid rgba(200,168,75,0.3)`, borderRadius: 10, padding: "10px 14px", fontSize: 13, color: T.teal, fontFamily: "Syne, sans-serif", fontWeight: 600 }}>
                      ✓ Table {tablesDispos.find(t => t.id === parseInt(form.table_id))?.numero} sélectionnée ({tablesDispos.find(t => t.id === parseInt(form.table_id))?.capacite} places)
                    </div>
                  )}

                  {error && <p style={{ color: "#dc2626", fontSize: 13 }}>⚠ {error}</p>}

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 10 }}>
                    <button type="button" onClick={() => setStep(1)} style={{ padding: "13px", background: "transparent", border: `1px solid ${T.border}`, borderRadius: 12, color: T.text2, fontFamily: "Syne, sans-serif", fontWeight: 700, cursor: "pointer" }}>← Retour</button>
                    <button type="button" disabled={!form.table_id}
                      onClick={() => { if (!form.table_id) { setError("Choisissez une table."); } else { setError(""); setStep(3); } }}
                      style={{ padding: "13px", background: form.table_id ? T.teal : "rgba(45,95,93,0.08)", border: "none", borderRadius: 12, color: form.table_id ? "#fff" : T.text3, fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, cursor: form.table_id ? "pointer" : "not-allowed", boxShadow: form.table_id ? `0 8px 28px rgba(45,95,93,0.3)` : "none" }}>
                      Continuer →
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ÉTAPE 3 */}
          {step === 3 && (
            <div style={{ display: "grid", gap: 16 }}>
              <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 18, color: T.text }}>👤 Vos coordonnées</h3>

              <div style={{ background: T.cream, border: `1px solid rgba(200,168,75,0.3)`, borderRadius: 12, padding: "12px 16px" }}>
                <div style={{ fontSize: 14, color: T.teal, fontFamily: "Syne, sans-serif", fontWeight: 700 }}>
                  📅 {new Date(form.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })} à {form.heure}
                </div>
                <div style={{ fontSize: 13, color: T.text2, marginTop: 4 }}>
                  🪑 Table {tablesDispos.find(t => t.id === parseInt(form.table_id))?.numero} · {form.nombre_personnes} personne(s)
                </div>
              </div>

              <div>
                <label style={lbl}>Nom complet *</label>
                <input value={form.client_nom} onChange={e => setForm({ ...form, client_nom: e.target.value })} placeholder="Votre nom et prénom" style={inp}
                  onFocus={e => { e.target.style.borderColor = T.teal; e.target.style.boxShadow = `0 0 0 3px rgba(45,95,93,0.1)`; }}
                  onBlur={e => { e.target.style.borderColor = "rgba(45,95,93,0.16)"; e.target.style.boxShadow = "none"; }}
                />
              </div>
              <div>
                <label style={lbl}>Email</label>
                <input type="email" value={form.client_email} onChange={e => setForm({ ...form, client_email: e.target.value })} placeholder="pour recevoir la confirmation" style={inp}
                  onFocus={e => { e.target.style.borderColor = T.teal; e.target.style.boxShadow = `0 0 0 3px rgba(45,95,93,0.1)`; }}
                  onBlur={e => { e.target.style.borderColor = "rgba(45,95,93,0.16)"; e.target.style.boxShadow = "none"; }}
                />
              </div>
              <div>
                <label style={lbl}>Téléphone</label>
                <input value={form.client_tel} onChange={e => setForm({ ...form, client_tel: e.target.value })} placeholder="+212 6XX XXX XXX" style={inp}
                  onFocus={e => { e.target.style.borderColor = T.teal; e.target.style.boxShadow = `0 0 0 3px rgba(45,95,93,0.1)`; }}
                  onBlur={e => { e.target.style.borderColor = "rgba(45,95,93,0.16)"; e.target.style.boxShadow = "none"; }}
                />
              </div>

              {error && (
                <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 10, padding: "10px 14px", color: "#dc2626", fontSize: 13 }}>⚠ {error}</div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 10 }}>
                <button type="button" onClick={() => setStep(2)} style={{ padding: "13px", background: "transparent", border: `1px solid ${T.border}`, borderRadius: 12, color: T.text2, fontFamily: "Syne, sans-serif", fontWeight: 700, cursor: "pointer" }}>← Retour</button>
                <button type="button" onClick={submit} disabled={loading || !form.client_nom}
                  style={{ padding: "13px", background: form.client_nom ? T.teal : "rgba(45,95,93,0.08)", border: "none", borderRadius: 12, color: form.client_nom ? "#fff" : T.text3, fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, cursor: form.client_nom ? "pointer" : "not-allowed", boxShadow: form.client_nom ? `0 8px 28px rgba(45,95,93,0.3)` : "none" }}>
                  {loading ? "⏳ Réservation..." : "✓ Confirmer la réservation"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Infos pratiques */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginTop: "2rem" }}>
          {[["📍", "Adresse", "Ocean, Rabat"], ["🕐", "Horaires", "Mar–Dim · 12h–23h"], ["📞", "Tél", "+212 5 22 34 56 66"]].map(([ic, lb, val]) => (
            <div key={lb} style={{ background: "#fff", border: `1px solid ${T.border}`, borderRadius: 14, padding: "1.25rem", textAlign: "center", boxShadow: "0 2px 12px rgba(45,95,93,0.06)" }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{ic}</div>
              <div style={{ fontSize: 11, color: T.teal, fontFamily: "Syne, sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{lb}</div>
              <div style={{ fontSize: 12, color: T.text3 }}>{val}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
