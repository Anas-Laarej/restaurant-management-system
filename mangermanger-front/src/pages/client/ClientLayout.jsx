import { useState, useEffect } from "react";
import { NavLink, useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ClientNotificationBell from "../../components/ClientNotificationBell";

const T = {
  teal: "#2D5F5D",
  tealDark: "#1A3A38",
  tealMid: "#3A7A77",
  gold: "#C8A84B",
  cream: "#F5EDD8",
  offWhite: "#FAFAF5",
  text: "#1A2E2D",
  text2: "rgba(26,46,45,0.65)",
  text3: "rgba(26,46,45,0.4)",
  border: "rgba(45,95,93,0.1)",
};

export default function ClientLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isAuth =
    location.pathname === "/acceuil/login" ||
    location.pathname === "/acceuil/register";

  const navLinks = user
    ? [
        { to: "/acceuil", label: "Accueil", end: true },
        { to: "/acceuil/reserver", label: "Réserver" },
        { to: "/acceuil/commander", label: "Commander" },
        { to: "/acceuil/compte", label: "Mon compte" },
      ]
    : [
        { to: "/acceuil", label: "Accueil", end: true },
        { to: "/acceuil/reserver", label: "Réserver" },
      ];

  return (
    <div
      className="client-theme"
      style={{
        minHeight: "100vh",
        background: T.offWhite,
        color: T.text,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* ── NAVBAR ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        background: "rgba(250,250,245,0.97)",
        backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
        borderBottom: `1px solid ${T.border}`,
        transition: "box-shadow 0.35s ease",
        boxShadow: scrolled ? "0 4px 32px rgba(45,95,93,0.1)" : "none",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 2rem", display: "flex", alignItems: "center", height: 68, gap: 32 }}>

          {/* ── Logo ── */}
          <Link to="/acceuil" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 11, flexShrink: 0 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: `linear-gradient(135deg, ${T.teal}, #3A7A77)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, boxShadow: `0 4px 14px rgba(45,95,93,0.3)`,
            }}>🍽️</div>
            <div>
              <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: 19, color: T.tealDark, lineHeight: 1, letterSpacing: "-0.02em" }}>
                Zefran
              </div>
              <div style={{ fontSize: 10, color: T.gold, fontFamily: "Syne, sans-serif", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 1 }}>
                Restaurant
              </div>
            </div>
          </Link>

          {/* ── thin separator ── */}
          <div style={{ width: 1, height: 28, background: T.border, flexShrink: 0 }} />

          {/* ── Nav links ── */}
          <div style={{ display: "flex", alignItems: "center", gap: 0, flex: 1 }}>
            {navLinks.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end}
                style={({ isActive }) => ({
                  position: "relative",
                  padding: "8px 16px",
                  textDecoration: "none",
                  fontSize: 13,
                  fontFamily: "Syne, sans-serif",
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? T.tealDark : T.text2,
                  transition: "color 0.15s",
                  letterSpacing: "0.01em",
                })}
              >
                {({ isActive }) => (
                  <>
                    {n.label}
                    {isActive && (
                      <span style={{
                        position: "absolute", bottom: 0, left: "50%",
                        transform: "translateX(-50%)",
                        width: "60%", height: 2, borderRadius: 2,
                        background: T.gold, display: "block",
                      }} />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* ── Auth zone ── */}
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}>
            {user ? (
              <>
                <ClientNotificationBell />
                {/* avatar + name → mon compte */}
                <Link to="/acceuil/compte" style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "5px 12px 5px 5px",
                  background: `rgba(45,95,93,0.06)`,
                  borderRadius: 100, border: `1px solid ${T.border}`,
                  textDecoration: "none", transition: "all 0.18s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = `rgba(45,95,93,0.12)`; e.currentTarget.style.borderColor = T.teal; }}
                  onMouseLeave={e => { e.currentTarget.style.background = `rgba(45,95,93,0.06)`; e.currentTarget.style.borderColor = T.border; }}
                >
                  <div style={{
                    width: 30, height: 30, borderRadius: "50%",
                    background: `linear-gradient(135deg, ${T.teal}, #3A7A77)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 800, color: "#fff", fontFamily: "Syne, sans-serif",
                    flexShrink: 0,
                  }}>
                    {(user.first_name?.[0] || user.username?.[0] || "U").toUpperCase()}
                  </div>
                  <span style={{ fontSize: 13, fontFamily: "Syne, sans-serif", fontWeight: 600, color: T.text, whiteSpace: "nowrap" }}>
                    {user.first_name || user.username}
                  </span>
                </Link>
                <button onClick={() => { logout(); navigate("/acceuil"); }} style={{
                  padding: "7px 14px", background: "transparent",
                  border: `1px solid ${T.border}`, borderRadius: 10,
                  color: T.text3, fontSize: 12, fontFamily: "Syne, sans-serif",
                  fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
                }}>
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link to="/acceuil/login" style={{
                  padding: "8px 16px", borderRadius: 10, textDecoration: "none",
                  fontSize: 13, fontFamily: "Syne, sans-serif", fontWeight: 600,
                  color: T.text2, transition: "color 0.15s",
                }}
                  onMouseEnter={e => e.currentTarget.style.color = T.tealDark}
                  onMouseLeave={e => e.currentTarget.style.color = T.text2}
                >
                  Se connecter
                </Link>
                <Link to="/acceuil/register" style={{
                  padding: "9px 20px", borderRadius: 12, textDecoration: "none",
                  fontSize: 13, fontFamily: "Syne, sans-serif", fontWeight: 700,
                  color: "#fff",
                  background: `linear-gradient(135deg, ${T.gold} 0%, #A88A38 100%)`,
                  boxShadow: `0 4px 16px rgba(200,168,75,0.4)`,
                  letterSpacing: "0.02em",
                  transition: "all 0.2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 6px 22px rgba(200,168,75,0.55)`; e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = `0 4px 16px rgba(200,168,75,0.4)`; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  S'inscrire
                </Link>
              </>
            )}
          </div>

        </div>
      </nav>

      <main style={{ paddingTop: isAuth ? 68 : 0 }}>{children}</main>

      {/* ── FOOTER ── */}
      <footer
        style={{
          background: T.tealDark,
          borderTop: `1px solid rgba(255,255,255,0.06)`,
          padding: "3.5rem 1.5rem 2rem",
          marginTop: "4rem",
        }}
      >
        <div style={{ maxWidth: 1140, margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "2.5rem",
              marginBottom: "2.5rem",
            }}
          >
            {/* Colonne 1 : Logo + description */}
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: T.gold,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    boxShadow: `0 4px 12px rgba(200,168,75,0.35)`,
                  }}
                >
                  🍽️
                </div>
                <span
                  style={{
                    fontFamily: "Syne, sans-serif",
                    fontWeight: 900,
                    fontSize: 18,
                    color: T.cream,
                  }}
                >
                  Zefran
                </span>
              </div>
              <p
                style={{
                  color: "rgba(245,237,216,0.5)",
                  fontSize: 13,
                  lineHeight: 1.8,
                }}
              >
                Cuisine marocaine authentique depuis 2018. Une expérience
                gastronomique inoubliable au cœur de Rabat.
              </p>
            </div>

            {/* Colonne 2 : Navigation */}
            <div>
              <div
                style={{
                  fontFamily: "Syne, sans-serif",
                  fontWeight: 700,
                  fontSize: 11,
                  color: T.gold,
                  marginBottom: 14,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                Navigation
              </div>
              {navLinks.map((n) => (
                <div key={n.to} style={{ marginBottom: 8 }}>
                  <Link
                    to={n.to}
                    style={{
                      color: "rgba(245,237,216,0.5)",
                      textDecoration: "none",
                      fontSize: 14,
                      transition: "color 0.15s",
                    }}
                    onMouseEnter={(e) =>
                      (e.target.style.color = T.cream)
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.color = "rgba(245,237,216,0.5)")
                    }
                  >
                    {n.label}
                  </Link>
                </div>
              ))}
            </div>

            {/* Colonne 3 : Horaires */}
            <div>
              <div
                style={{
                  fontFamily: "Syne, sans-serif",
                  fontWeight: 700,
                  fontSize: 11,
                  color: T.gold,
                  marginBottom: 14,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                Horaires
              </div>
              {[
                ["Mardi – Vendredi", "12h – 15h · 19h – 23h"],
                ["Samedi – Dimanche", "12h – 16h · 18h30 – 23h30"],
                ["Lundi", "Fermé"],
              ].map(([j, h]) => (
                <div key={j} style={{ marginBottom: 10 }}>
                  <div
                    style={{
                      fontSize: 11,
                      color: "rgba(245,237,216,0.35)",
                      marginBottom: 2,
                    }}
                  >
                    {j}
                  </div>
                  <div style={{ fontSize: 13, color: "rgba(245,237,216,0.7)" }}>
                    {h}
                  </div>
                </div>
              ))}
            </div>

            {/* Colonne 4 : Contact */}
            <div>
              <div
                style={{
                  fontFamily: "Syne, sans-serif",
                  fontWeight: 700,
                  fontSize: 11,
                  color: T.gold,
                  marginBottom: 14,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                Contact
              </div>
              {[
                ["📍", "Ocean, Rabat"],
                ["📞", "+212 5 22 34 56 66"],
                ["✉️", "contact@zefran.ma"],
              ].map(([icon, val]) => (
                <div
                  key={val}
                  style={{
                    display: "flex",
                    gap: 10,
                    marginBottom: 10,
                    fontSize: 13,
                    color: "rgba(245,237,216,0.55)",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: 15 }}>{icon}</span>
                  <span>{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Copyright */}
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.08)",
              paddingTop: "1.5rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <span style={{ color: "rgba(245,237,216,0.3)", fontSize: 12 }}>
              © 2026 Zefran · Tous droits réservés
            </span>
            <span style={{ color: "rgba(245,237,216,0.2)", fontSize: 11 }}>
              Restaurant marocain · Ocean, Rabat
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
