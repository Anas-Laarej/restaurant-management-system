import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../api";

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

const HERO_BG = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&q=85&fit=crop";
const ABOUT_IMG = "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=80&fit=crop";

const CATS = [
  { nom: "Tajines", desc: "Mijoté lentement", img: "https://i.pinimg.com/736x/89/d0/49/89d04987a28014b6c25f68894219ccc4.jpg" },
  { nom: "Couscous", desc: "Tradition centenaire", img: "https://i.pinimg.com/736x/b8/a2/8f/b8a28f6eaefac0647ce4ec32ca0f48bf.jpg" },
  { nom: "Grillades", desc: "Au charbon de bois", img: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=700&fit=crop" },
  { nom: "Pizzas", desc: "Four à bois", img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&h=700&fit=crop" },
  { nom: "Sushis & Japonais", desc: "Fraîcheur du Japon", img: "https://i.pinimg.com/736x/07/5a/c2/075ac209009c82c734c289755241f8f9.jpg" },
  { nom: "Burgers", desc: "100 % maison", img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=700&fit=crop" },
  { nom: "Pâtes & Risottos", desc: "Al dente", img: "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=600&h=700&fit=crop" },
  { nom: "Desserts", desc: "Pâtisseries maison", img: "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=600&h=700&fit=crop" },
];

const MARQUEE_ITEMS = ["TAJINES","COUSCOUS","GRILLADES","PIZZAS","SUSHIS","BURGERS","PÂTES","DESSERTS","BOISSONS","SALADES"];

const stars = (n) => "★".repeat(n) + "☆".repeat(5 - n);

export default function ClientHome() {
  const { user } = useAuth();
  const [avis, setAvis] = useState([]);
  const [plats, setPlats] = useState([]);
  const [slide, setSlide] = useState(0);
  const [visible, setVisible] = useState({});
  const [hovCat, setHovCat] = useState(null);
  const refs = useRef({});
  const [avisForm, setAvisForm] = useState({ commentaire: '', plat: '' });
  const [avisOk, setAvisOk] = useState(false);
  const [avisSaving, setAvisSaving] = useState(false);
  const [avisError, setAvisError] = useState('');

  const fetchAvis = () =>
    API.get("/avis/").then((r) => setAvis((r.data.results || r.data).slice(0, 6))).catch(() => {});

  useEffect(() => {
    fetchAvis();
    API.get("/plats/?disponible=true").then(r => setPlats((r.data.results || r.data).slice(0, 8))).catch(() => {});
    const t = setInterval(() => setSlide(i => (i + 1) % 3), 5000);
    return () => clearInterval(t);
  }, []);

  const submitAvis = async () => {
    if (!avisForm.commentaire.trim()) return;
    setAvisSaving(true); setAvisError('');
    try {
      await API.post('/avis/', {
        client_nom: user?.first_name ? `${user.first_name} ${user.last_name}`.trim() : user?.username,
        commentaire: avisForm.commentaire,
        plat: avisForm.plat || null,
      });
      setAvisOk(true);
      setAvisForm({ commentaire: '', plat: '' });
      fetchAvis();
    } catch (e) {
      setAvisError(e.response?.data?.error || "Erreur lors de la publication.");
    } finally { setAvisSaving(false); }
  };

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setVisible(v => ({ ...v, [e.target.dataset.id]: true })); }),
      { threshold: 0.1 }
    );
    Object.values(refs.current).forEach(r => r && obs.observe(r));
    return () => obs.disconnect();
  }, [plats, avis]);

  const ref = id => el => { refs.current[id] = el; if (el) el.dataset.id = id; };

  const HERO_LINES = [
    { line1: "La vraie cuisine", line2: "marocaine", line3: "à Rabat" },
    { line1: "Saveurs du monde", line2: "réunies", line3: "en un lieu" },
    { line1: "L'art culinaire", line2: "depuis", line3: "2018" },
  ];

  const S = {
    btn: { display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", background: T.teal, color: "#fff", borderRadius: 14, textDecoration: "none", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, boxShadow: `0 8px 28px rgba(45,95,93,0.35)` },
    btnGhost: { display: "inline-flex", alignItems: "center", padding: "14px 28px", background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.9)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 14, textDecoration: "none", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, backdropFilter: "blur(8px)" },
  };

  return (
    <div style={{ background: T.offWhite, color: T.text, fontFamily: "DM Sans, sans-serif" }}>

      {/* ══ HERO ══ */}
      <section style={{ position: "relative", height: "100vh", minHeight: 600, overflow: "hidden" }}>
        <img src={HERO_BG} alt="hero" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(20,45,43,0.5) 0%, rgba(20,45,43,0.22) 40%, rgba(20,45,43,0.8) 80%, rgba(20,45,43,1) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(20,45,43,0.65) 0%, transparent 60%)" }} />

        <div style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", alignItems: "center", padding: "68px 6vw 0", maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ maxWidth: 620 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "1px solid rgba(200,168,75,0.4)", borderRadius: 30, padding: "6px 18px", marginBottom: "2rem", backdropFilter: "blur(8px)", background: "rgba(200,168,75,0.12)" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.gold, display: "inline-block", animation: "pulse 2s infinite" }} />
              <span style={{ fontSize: 11, color: "rgba(245,237,216,0.9)", fontFamily: "Syne, sans-serif", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>Ouvert · Service en cours</span>
            </div>

            {HERO_LINES.map((h, i) => (
              <div key={i} style={{ display: i === slide ? "block" : "none", animation: i === slide ? "fadeUp 0.7s ease both" : "none" }}>
                <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: "clamp(42px,6vw,80px)", lineHeight: 1.02, margin: "0 0 1.5rem", color: "#fff" }}>
                  {h.line1}<br />
                  <em style={{ fontStyle: "normal", color: T.gold }}>{h.line2}</em><br />
                  {h.line3}
                </h1>
              </div>
            ))}

            <p style={{ fontSize: 16, color: "rgba(245,237,216,0.65)", lineHeight: 1.85, marginBottom: "2.5rem", maxWidth: 480 }}>
              Tajines, sushis, pizzas et grillades préparés chaque jour avec des produits frais. Une carte mondiale, une âme marocaine.
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: "3rem" }}>
              {user ? (
                <><Link to="/acceuil/reserver" style={S.btn}>📅 Réserver une table</Link><Link to="/acceuil/commander" style={S.btnGhost}>Passer une commande →</Link></>
              ) : (
                <><Link to="/acceuil/register" style={S.btn}>Créer un compte</Link><Link to="/acceuil/commander" style={S.btnGhost}>Passer une commande →</Link></>
              )}
            </div>

            <div style={{ display: "flex", gap: "2.5rem" }}>
              {[["14", "catégories"], ["86+", "plats"], ["4.8★", "note"]].map(([v, l]) => (
                <div key={l}>
                  <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: 22, color: "#fff" }}>{v}</div>
                  <div style={{ fontSize: 11, color: "rgba(245,237,216,0.45)", marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* dots */}
        <div style={{ position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8, zIndex: 3 }}>
          {[0,1,2].map(i => (
            <button key={i} onClick={() => setSlide(i)} style={{ width: i === slide ? 28 : 8, height: 8, borderRadius: 4, background: i === slide ? T.gold : "rgba(255,255,255,0.3)", border: "none", cursor: "pointer", padding: 0, transition: "all 0.35s" }} />
          ))}
        </div>

        <div style={{ position: "absolute", bottom: 40, right: "6vw", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, zIndex: 3, opacity: 0.5 }}>
          <div style={{ width: 1, height: 48, background: "linear-gradient(to bottom,transparent,#fff)", animation: "scrollLine 2s infinite" }} />
          <span style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "#fff" }}>SCROLL</span>
        </div>
      </section>

      {/* ══ MARQUEE ══ */}
      <div style={{ background: T.teal, overflow: "hidden", padding: "14px 0", borderTop: `1px solid rgba(200,168,75,0.2)` }}>
        <div style={{ display: "flex", animation: "marquee 22s linear infinite", whiteSpace: "nowrap" }}>
          {[...MARQUEE_ITEMS,...MARQUEE_ITEMS,...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 13, color: "rgba(245,237,216,0.9)", letterSpacing: "0.12em", marginRight: "3rem" }}>
              {item} <span style={{ color: T.gold, marginRight: "3rem" }}>✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ══ STATS ══ */}
      <section style={{ background: T.cream, padding: "5rem 6vw" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, border: `1px solid rgba(45,95,93,0.12)`, borderRadius: 20, overflow: "hidden" }}>
          {[["14","Catégories"],["86+","Plats au menu"],["4.8 ★","Note clients"],["2018","Depuis"]].map(([v, l], i) => (
            <div key={l} style={{ padding: "2.5rem 2rem", textAlign: "center", borderRight: i < 3 ? `1px solid rgba(45,95,93,0.12)` : "none", background: "#fff" }}>
              <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: "clamp(28px,3vw,42px)", color: T.teal, marginBottom: 8 }}>{v}</div>
              <div style={{ fontSize: 13, color: T.text3, letterSpacing: "0.06em" }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ CATÉGORIES ══ */}
      <section style={{ background: T.tealDark, padding: "5rem 6vw 6rem" }} ref={ref("cats")}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "3rem", flexWrap: "wrap", gap: 16 }}>
            <div>
              <p style={{ fontSize: 11, color: T.gold, fontFamily: "Syne, sans-serif", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>Notre carte</p>
              <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: "clamp(28px,3.5vw,52px)", color: "#fff", lineHeight: 1.05, margin: 0 }}>
                Toutes les saveurs<br />du monde
              </h2>
            </div>
            <Link to="/acceuil/commander" style={{ color: "rgba(245,237,216,0.55)", fontSize: 13, fontFamily: "Syne, sans-serif", fontWeight: 700, textDecoration: "none", letterSpacing: "0.05em", borderBottom: "1px solid rgba(245,237,216,0.25)", paddingBottom: 2, transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.color = T.gold; e.currentTarget.style.borderColor = T.gold; }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(245,237,216,0.55)"; e.currentTarget.style.borderColor = "rgba(245,237,216,0.25)"; }}>
              Passer une commande →
            </Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
            {CATS.map((cat, i) => (
              <div key={i} ref={ref(`cat-${i}`)} onMouseEnter={() => setHovCat(i)} onMouseLeave={() => setHovCat(null)}
                style={{ position: "relative", borderRadius: 18, overflow: "hidden", aspectRatio: "3/4", cursor: "pointer", opacity: visible[`cat-${i}`] ? 1 : 0, transform: visible[`cat-${i}`] ? "none" : "translateY(24px)", transition: `all 0.55s ease ${i * 0.06}s` }}>
                <img src={cat.img} alt={cat.nom} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.7s ease", transform: hovCat === i ? "scale(1.1)" : "scale(1)" }} onError={e => (e.target.style.display = "none")} />
                <div style={{ position: "absolute", inset: 0, background: hovCat === i ? "linear-gradient(to top,rgba(20,45,43,0.95) 0%,rgba(20,45,43,0.3) 55%,transparent 100%)" : "linear-gradient(to top,rgba(20,45,43,0.82) 0%,rgba(20,45,43,0.05) 55%,transparent 100%)", transition: "background 0.4s" }} />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "1.25rem 1.25rem 1.5rem" }}>
                  <p style={{ fontSize: 10, color: T.gold, fontFamily: "Syne, sans-serif", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 5px", opacity: hovCat === i ? 1 : 0.7, transition: "opacity 0.3s" }}>{cat.desc}</p>
                  <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: 16, color: "#fff", margin: 0, lineHeight: 1.2 }}>{cat.nom}</h3>
                  <div style={{ marginTop: 10, overflow: "hidden", maxHeight: hovCat === i ? 32 : 0, transition: "max-height 0.4s ease", opacity: hovCat === i ? 1 : 0 }}>
                    <Link to="/acceuil/commander" style={{ fontSize: 11, color: T.gold, fontFamily: "Syne, sans-serif", fontWeight: 700, textDecoration: "none", letterSpacing: "0.08em" }}>Commander →</Link>
                  </div>
                </div>
                <div style={{ position: "absolute", top: 14, left: 14, fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }}>
                  {String(i + 1).padStart(2, "0")}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PLATS SIGNATURE ══ */}
      {plats.length > 0 && (
        <section style={{ background: T.offWhite, padding: "5rem 0 6rem" }} ref={ref("plats")}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 6vw" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2.5rem", flexWrap: "wrap", gap: 16 }}>
              <div>
                <p style={{ fontSize: 11, color: T.teal, fontFamily: "Syne, sans-serif", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 10 }}>Sélection du chef</p>
                <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: "clamp(26px,3vw,44px)", color: T.text, margin: 0 }}>Nos plats du moment</h2>
              </div>
              <Link to="/acceuil/commander" style={{ fontSize: 13, color: T.text3, fontFamily: "Syne, sans-serif", fontWeight: 700, textDecoration: "none", borderBottom: `1px solid ${T.border}`, paddingBottom: 2 }}>Tout voir →</Link>
            </div>
          </div>

          <div style={{ display: "flex", gap: 16, overflowX: "auto", padding: "0.5rem 6vw 2rem", scrollbarWidth: "none", cursor: "grab" }}>
            {plats.map((p, i) => (
              <div key={p.id} ref={ref(`plat-${i}`)}
                style={{ flexShrink: 0, width: 280, borderRadius: 20, overflow: "hidden", background: "#fff", border: `1px solid ${T.border}`, opacity: visible[`plat-${i}`] ? 1 : 0, transform: visible[`plat-${i}`] ? "none" : "translateY(16px)", transition: `all 0.5s ease ${i * 0.07}s`, cursor: "pointer", boxShadow: "0 4px 20px rgba(45,95,93,0.07)" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `rgba(45,95,93,0.3)`; e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(45,95,93,0.14)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(45,95,93,0.07)"; }}>
                <div style={{ position: "relative", height: 200, overflow: "hidden", background: T.cream }}>
                  <img src={p.image_url || ''} alt={p.nom} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => (e.target.style.display = "none")} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(26,46,45,0.6) 0%,transparent 55%)" }} />
                  <div style={{ position: "absolute", top: 12, right: 12, background: T.teal, color: "#fff", borderRadius: 20, padding: "4px 12px", fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 13 }}>
                    {parseFloat(p.prix).toFixed(0)} DH
                  </div>
                </div>
                <div style={{ padding: "1rem 1.2rem 1.4rem" }}>
                  <p style={{ fontSize: 10, color: T.teal, fontFamily: "Syne, sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 6px" }}>{p.categorie_nom}</p>
                  <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 16, color: T.text, margin: "0 0 8px", lineHeight: 1.25 }}>{p.nom}</h3>
                  <p style={{ fontSize: 12, color: T.text3, lineHeight: 1.6, margin: "0 0 14px" }}>
                    {(p.description || "Préparé avec soin et ingrédients frais.").slice(0, 72)}{(p.description || "").length > 72 ? "..." : ""}
                  </p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: T.text3 }}>⏱ {p.temps_preparation} min</span>
                    <Link to={user ? "/acceuil/commander" : "/acceuil/login"}
                      style={{ fontSize: 11, color: T.teal, fontFamily: "Syne, sans-serif", fontWeight: 700, textDecoration: "none", border: `1px solid rgba(45,95,93,0.3)`, borderRadius: 8, padding: "5px 12px", transition: "all 0.2s" }}
                      onMouseEnter={e => { e.currentTarget.style.background = T.teal; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = T.teal; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.teal; e.currentTarget.style.borderColor = "rgba(45,95,93,0.3)"; }}>
                      {user ? "Commander →" : "Connexion →"}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ══ À PROPOS ══ */}
      <section style={{ background: T.cream, padding: "7rem 6vw" }} ref={ref("about")}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5vw", alignItems: "center" }}>
          <div style={{ position: "relative", opacity: visible.about ? 1 : 0, transform: visible.about ? "none" : "translateX(-30px)", transition: "all 0.8s ease" }}>
            <div style={{ borderRadius: 24, overflow: "hidden", aspectRatio: "4/5" }}>
              <img src={ABOUT_IMG} alt="Zefran restaurant" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(26,58,56,0.3) 0%,transparent 50%)", borderRadius: 24 }} />
            </div>
            <div style={{ position: "absolute", bottom: -20, right: -20, background: T.teal, borderRadius: 20, padding: "1.5rem 2rem", boxShadow: `0 16px 48px rgba(45,95,93,0.35)` }}>
              <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: 36, color: "#fff", lineHeight: 1 }}>2018</div>
              <div style={{ fontSize: 12, color: "rgba(245,237,216,0.75)", marginTop: 4 }}>Fondé à Rabat</div>
            </div>
            <div style={{ position: "absolute", top: 24, right: -16, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)", border: `1px solid ${T.border}`, borderRadius: 16, padding: "14px 20px", textAlign: "center", boxShadow: "0 8px 32px rgba(45,95,93,0.12)" }}>
              <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: 26, color: T.teal }}>4.8</div>
              <div style={{ color: T.gold, fontSize: 14, margin: "2px 0" }}>★★★★★</div>
              <div style={{ fontSize: 10, color: T.text3 }}>note Google</div>
            </div>
          </div>

          <div style={{ opacity: visible.about ? 1 : 0, transform: visible.about ? "none" : "translateX(30px)", transition: "all 0.8s ease 0.15s" }}>
            <p style={{ fontSize: 11, color: T.teal, fontFamily: "Syne, sans-serif", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>Notre histoire</p>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: "clamp(28px,3vw,46px)", color: T.text, lineHeight: 1.1, marginBottom: "1.5rem" }}>
              Une passion pour la<br />cuisine du <span style={{ color: T.teal }}>monde</span>
            </h2>
            <p style={{ color: T.text2, fontSize: 15, lineHeight: 1.9, marginBottom: "1.25rem" }}>
              Depuis 2018, <strong style={{ color: T.text }}>Zefran</strong> réunit les meilleures cuisines du monde dans un cadre chaleureux au cœur de Rabat. Tajines marocains, sushis japonais, pizzas italiennes — chaque plat est préparé avec des ingrédients frais sélectionnés chaque matin.
            </p>
            <p style={{ color: T.text3, fontSize: 15, lineHeight: 1.9, marginBottom: "2.5rem" }}>
              Notre chef Mohamed Fassi, formé entre Marrakech et Paris, apporte son savoir-faire multiculturel à chaque assiette.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: "2.5rem" }}>
              {[["🌿","Fresh","Produits locaux"],["👨‍🍳","Expert","Chef étoilé"],["🌍","World","14 cuisines"]].map(([ic,t,d]) => (
                <div key={t} style={{ border: `1px solid ${T.border}`, borderRadius: 16, padding: "1.25rem 1rem", textAlign: "center", background: "#fff", boxShadow: "0 2px 12px rgba(45,95,93,0.06)" }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{ic}</div>
                  <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 13, color: T.text, marginBottom: 4 }}>{t}</div>
                  <div style={{ fontSize: 11, color: T.text3, lineHeight: 1.4 }}>{d}</div>
                </div>
              ))}
            </div>

            {user ? <Link to="/acceuil/reserver" style={{ ...S.btn }}>📅 Réserver une table</Link>
              : <Link to="/acceuil/register" style={{ ...S.btn }}>Rejoindre Zefran →</Link>}
          </div>
        </div>
      </section>

      {/* ══ AVIS ══ */}
      <section style={{ background: T.offWhite, padding: "6rem 6vw" }} ref={ref("avis")}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <p style={{ fontSize: 11, color: T.teal, fontFamily: "Syne, sans-serif", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 14 }}>Témoignages</p>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: "clamp(26px,3vw,44px)", color: T.text, marginBottom: 14 }}>Ce que disent nos clients</h2>
            {avis.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                <span style={{ color: T.gold, fontSize: 20 }}>★★★★★</span>
                <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: 20, color: T.text }}>4.8</span>
                <span style={{ color: T.text3, fontSize: 14 }}>/ 5 · {avis.length} avis</span>
              </div>
            )}
          </div>

          {avis.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 16, marginBottom: "4rem" }}>
              {avis.map((a, i) => (
                <div key={a.id} ref={ref(`avis-${i}`)}
                  style={{ background: "#fff", border: `1px solid ${T.border}`, borderRadius: 20, padding: "1.75rem", opacity: visible[`avis-${i}`] ? 1 : 0, transform: visible[`avis-${i}`] ? "none" : "translateY(20px)", transition: `all 0.5s ease ${i * 0.1}s`, boxShadow: "0 4px 20px rgba(45,95,93,0.07)" }}>
                  <div style={{ color: T.gold, fontSize: 14, marginBottom: 14 }}>{stars(a.note)}</div>
                  <p style={{ fontSize: 14, color: T.text2, lineHeight: 1.8, fontStyle: "italic", margin: "0 0 18px" }}>"{a.commentaire}"</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 38, height: 38, borderRadius: "50%", background: `linear-gradient(135deg, ${T.teal}, #3A7A77)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 16, color: "#fff", flexShrink: 0 }}>
                      {a.client_nom?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13, color: T.text }}>{a.client_nom}</div>
                      {a.plat_nom && <div style={{ fontSize: 11, color: T.teal, marginTop: 2 }}>🍽️ {a.plat_nom}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Formulaire avis */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center" }}>
            <div>
              <p style={{ fontSize: 11, color: T.teal, fontFamily: "Syne, sans-serif", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>Votre avis compte</p>
              <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: "clamp(22px,2.5vw,36px)", color: T.text, lineHeight: 1.1, marginBottom: "1.25rem" }}>
                Partagez votre<br /><span style={{ color: T.teal }}>expérience</span>
              </h3>
              <p style={{ color: T.text2, fontSize: 15, lineHeight: 1.85, marginBottom: "1.5rem" }}>
                Chaque retour nous aide à améliorer notre cuisine et notre service. Votre commentaire est analysé et publié après validation.
              </p>
              <div style={{ display: "flex", gap: 16 }}>
                {[["★","Note auto"],["🔒","Validé"],["💬","Publié"]].map(([ic,l]) => (
                  <div key={l} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 22, marginBottom: 4 }}>{ic}</div>
                    <div style={{ fontSize: 10, color: T.text3, fontFamily: "Syne, sans-serif", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: "#fff", border: `1px solid ${T.border}`, borderRadius: 24, padding: "2rem", boxShadow: "0 8px 40px rgba(45,95,93,0.1)" }}>
              {avisOk ? (
                <div style={{ textAlign: "center", padding: "2rem 0" }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>✨</div>
                  <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 18, color: T.text, marginBottom: 8 }}>Merci pour votre avis !</div>
                  <div style={{ fontSize: 13, color: T.text3, marginBottom: "1.5rem" }}>Il sera publié après validation.</div>
                  <button onClick={() => setAvisOk(false)} style={{ background: "none", border: `1px solid ${T.border}`, borderRadius: 10, padding: "8px 20px", color: T.text2, fontFamily: "Syne, sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                    Laisser un autre avis
                  </button>
                </div>
              ) : !user ? (
                <div style={{ textAlign: "center", padding: "2rem 0" }}>
                  <div style={{ fontSize: 36, marginBottom: 14, opacity: 0.4 }}>💬</div>
                  <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, color: T.text, marginBottom: 8 }}>Connectez-vous pour laisser un avis</div>
                  <div style={{ fontSize: 13, color: T.text3, marginBottom: "1.5rem" }}>Un compte est requis pour publier un témoignage.</div>
                  <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                    <Link to="/acceuil/login" style={{ padding: "10px 22px", background: T.teal, color: "#fff", borderRadius: 10, textDecoration: "none", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13, boxShadow: `0 4px 16px rgba(45,95,93,0.3)` }}>Se connecter</Link>
                    <Link to="/acceuil/register" style={{ padding: "10px 18px", border: `1px solid ${T.border}`, color: T.text2, borderRadius: 10, textDecoration: "none", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13 }}>Créer un compte</Link>
                  </div>
                </div>
              ) : (
                <div style={{ display: "grid", gap: 14 }}>
                  <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 16, color: T.text, marginBottom: 4 }}>Laisser un avis</div>
                  <div>
                    <div style={{ fontSize: 11, color: T.teal, marginBottom: 6, fontFamily: "Syne, sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>Plat évalué <span style={{ fontWeight: 400, textTransform: "none", color: T.text3 }}>(optionnel)</span></div>
                    <select value={avisForm.plat} onChange={e => setAvisForm({ ...avisForm, plat: e.target.value })}
                      style={{ width: "100%", background: T.offWhite, border: `1.5px solid ${T.border}`, borderRadius: 10, padding: "10px 14px", color: T.text, fontSize: 13, outline: "none", fontFamily: "DM Sans, sans-serif", boxSizing: "border-box" }}>
                      <option value="">Expérience générale du restaurant</option>
                      {plats.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
                    </select>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: T.teal, marginBottom: 6, fontFamily: "Syne, sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>Votre commentaire</div>
                    <textarea value={avisForm.commentaire} onChange={e => setAvisForm({ ...avisForm, commentaire: e.target.value })} placeholder="Partagez votre expérience en détail..." rows={4}
                      style={{ width: "100%", background: T.offWhite, border: `1.5px solid ${T.border}`, borderRadius: 10, padding: "10px 14px", color: T.text, fontSize: 13, outline: "none", resize: "vertical", fontFamily: "DM Sans, sans-serif", boxSizing: "border-box" }} />
                  </div>
                  {avisError && <div style={{ fontSize: 12, color: "#dc2626", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, padding: "8px 12px" }}>⚠ {avisError}</div>}
                  <button onClick={submitAvis} disabled={!avisForm.commentaire.trim() || avisSaving}
                    style={{ padding: "13px", background: avisForm.commentaire.trim() ? T.teal : "rgba(45,95,93,0.08)", border: "none", borderRadius: 12, color: avisForm.commentaire.trim() ? "#fff" : T.text3, fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, cursor: avisForm.commentaire.trim() ? "pointer" : "not-allowed", boxShadow: avisForm.commentaire.trim() ? `0 8px 28px rgba(45,95,93,0.35)` : "none", transition: "all 0.2s" }}>
                    {avisSaving ? "Publication…" : "★ Publier mon avis"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ══ CTA FINAL ══ */}
      <section style={{ position: "relative", overflow: "hidden" }}>
        <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&q=80&fit=crop" alt="restaurant" style={{ width: "100%", height: 500, objectFit: "cover", objectPosition: "center 40%", display: "block" }} />
        <div style={{ position: "absolute", inset: 0, background: "rgba(20,45,43,0.82)" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", textAlign: "center", padding: "0 1.5rem" }}>
          <p style={{ fontSize: 11, color: T.gold, fontFamily: "Syne, sans-serif", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 20 }}>Réservation</p>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: "clamp(28px,5vw,60px)", color: "#fff", marginBottom: 16, lineHeight: 1.05 }}>
            {user ? `Bon appétit, ${user.first_name || user.username} !` : "Prêt à vous régaler ?"}
          </h2>
          <p style={{ fontSize: 16, color: "rgba(245,237,216,0.6)", marginBottom: "2.5rem", maxWidth: 480, lineHeight: 1.7 }}>
            {user ? "Réservez votre table ou passez commande directement depuis l'application." : "Rejoignez notre communauté. Inscription gratuite et rapide."}
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            {user ? (
              <>
                <Link to="/acceuil/reserver" style={{ padding: "15px 32px", background: T.gold, color: T.tealDark, borderRadius: 14, textDecoration: "none", fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 15, boxShadow: `0 8px 30px rgba(200,168,75,0.4)` }}>📅 Réserver</Link>
                <Link to="/acceuil/commander" style={{ padding: "15px 32px", background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 14, textDecoration: "none", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, backdropFilter: "blur(8px)" }}>🛒 Commander</Link>
              </>
            ) : (
              <>
                <Link to="/acceuil/register" style={{ padding: "15px 32px", background: T.gold, color: T.tealDark, borderRadius: 14, textDecoration: "none", fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 15, boxShadow: `0 8px 30px rgba(200,168,75,0.4)` }}>Créer mon compte</Link>
                <Link to="/acceuil/commander" style={{ padding: "15px 32px", background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 14, textDecoration: "none", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, backdropFilter: "blur(8px)" }}>Passer une commande</Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ══ INVITATION ══ */}
      {!user && (
        <section style={{ background: T.cream, padding: "3.5rem 6vw" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "2rem", flexWrap: "wrap" }}>
            <div>
              <p style={{ fontSize: 11, color: T.teal, fontFamily: "Syne, sans-serif", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>Programme fidélité</p>
              <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: 22, color: T.text, marginBottom: 6 }}>★ Rejoignez notre communauté</h3>
              <p style={{ color: T.text2, fontSize: 14, maxWidth: 450 }}>Réservation, commande en ligne, points fidélité — tout en un compte gratuit.</p>
            </div>
            <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
              <Link to="/acceuil/register" style={{ padding: "12px 26px", background: T.teal, color: "#fff", borderRadius: 12, textDecoration: "none", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, boxShadow: `0 4px 16px rgba(45,95,93,0.3)` }}>Créer un compte</Link>
              <Link to="/acceuil/login" style={{ padding: "12px 22px", border: `1px solid ${T.border}`, borderRadius: 12, color: T.text2, textDecoration: "none", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14 }}>Se connecter</Link>
            </div>
          </div>
        </section>
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.85)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:none} }
        @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-33.33%)} }
        @keyframes scrollLine { 0%{opacity:0;transform:scaleY(0);transform-origin:top} 50%{opacity:1} 100%{opacity:0;transform:scaleY(1);transform-origin:bottom} }
      `}</style>
    </div>
  );
}
