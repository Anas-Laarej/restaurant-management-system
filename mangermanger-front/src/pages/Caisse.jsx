import { useEffect, useState } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';

const MODE_LABELS = { especes: 'Espèces', carte: 'Carte bancaire' };

function imprimerRecu({ cmd, facture, caissierNom }) {
  const date = new Date(facture.created_at);
  const dateStr = date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const heureStr = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const label = cmd.table_numero ? `Table ${cmd.table_numero}` : 'Commande en ligne';
  const total = parseFloat(facture.montant_ttc).toFixed(2);
  const modeIcons = { especes: '💵', carte: '💳' };
  const modeIcon = modeIcons[facture.mode_paiement] || '💰';
  const mode = MODE_LABELS[facture.mode_paiement] || facture.mode_paiement;
  const numCmd = `CMD-${String(cmd.id).padStart(4, '0')}`;
  const nbItems = (cmd.items || []).reduce((s, i) => s + i.quantite, 0);

  const lignesItems = (cmd.items || []).map(i => {
    const pu = parseFloat(i.prix_unitaire).toFixed(0);
    const sous = (i.quantite * parseFloat(i.prix_unitaire)).toFixed(0);
    return `<tr>
      <td class="td-name">${i.plat_nom}</td>
      <td class="td-qty">${i.quantite}</td>
      <td class="td-pu">${pu} DH</td>
      <td class="td-total">${sous} DH</td>
    </tr>`;
  }).join('');

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <title>Reçu ${numCmd} — Zefran</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');
    *{margin:0;padding:0;box-sizing:border-box}
    body{
      font-family:'DM Sans',Arial,sans-serif;
      background:#fff;
      max-width:400px;
      margin:0 auto;
      color:#1a0e04;
    }

    /* ── Header ── */
    .header{
      background:linear-gradient(160deg,#5C1106 0%,#8B2208 40%,#C8860C 100%);
      padding:30px 28px 26px;
      text-align:center;
      color:#fff;
      position:relative;
      overflow:hidden;
    }
    .header::before{
      content:'';position:absolute;top:-40px;right:-40px;
      width:150px;height:150px;border-radius:50%;
      background:rgba(255,255,255,0.06);
    }
    .header::after{
      content:'';position:absolute;bottom:-50px;left:-30px;
      width:120px;height:120px;border-radius:50%;
      background:rgba(0,0,0,0.12);
    }
    .header-inner{position:relative;z-index:1}
    .header-icon{font-size:34px;margin-bottom:8px;display:block}
    .header-name{
      font-family:'Playfair Display',Georgia,serif;
      font-size:30px;font-weight:900;
      letter-spacing:0.06em;color:#fff;
      line-height:1;
    }
    .header-sub{
      font-size:10px;font-weight:400;
      letter-spacing:0.22em;text-transform:uppercase;
      color:rgba(255,255,255,0.65);margin-top:5px;
    }
    .header-divider{
      margin:14px auto 0;width:50px;height:2px;
      background:rgba(255,255,255,0.35);border-radius:2px;
    }

    /* ── Ref band ── */
    .ref-band{
      background:#FAF5EC;
      border-bottom:1px solid #EDD9B0;
      padding:14px 28px;
      display:flex;justify-content:space-between;align-items:center;
    }
    .ref-label{
      font-size:9px;font-weight:700;
      letter-spacing:0.2em;text-transform:uppercase;
      color:#B8924A;
    }
    .ref-num{
      font-family:'Playfair Display',Georgia,serif;
      font-size:18px;font-weight:700;color:#1a0e04;
    }
    .ref-items{
      font-size:11px;color:#8a7060;font-weight:500;
    }

    /* ── Meta ── */
    .meta{padding:16px 28px;border-bottom:1px dashed #EDD9B0}
    .meta-row{
      display:flex;justify-content:space-between;align-items:center;
      padding:5px 0;font-size:12.5px;
    }
    .meta-lbl{color:#9a8070;font-weight:400}
    .meta-val{font-weight:600;color:#1a0e04;font-size:13px}

    /* ── Items ── */
    .items-wrap{padding:0 28px}
    .items-head{
      display:grid;grid-template-columns:1fr 36px 62px 62px;
      padding:12px 0 7px;
      border-bottom:2px solid #1a0e04;
      font-size:9px;font-weight:700;
      letter-spacing:0.18em;text-transform:uppercase;
      color:#9a8070;
    }
    .items-head span:nth-child(2),
    .items-head span:nth-child(3),
    .items-head span:nth-child(4){text-align:right}
    table{width:100%;border-collapse:collapse}
    td{padding:9px 0;border-bottom:1px solid #F0E4D0;font-size:13px;vertical-align:middle}
    .td-name{font-weight:500;color:#1a0e04;padding-right:8px}
    .td-qty{text-align:right;font-weight:700;color:#C8860C;width:36px}
    .td-pu{text-align:right;color:#9a8070;width:62px;font-size:12px}
    .td-total{text-align:right;font-weight:700;color:#1a0e04;width:62px}

    /* ── Total ── */
    .total-wrap{padding:0 28px 20px}
    .total-box{
      margin-top:16px;
      background:linear-gradient(135deg,#1a0e04,#2d1a08);
      border-radius:14px;
      padding:18px 22px;
      display:flex;justify-content:space-between;align-items:center;
    }
    .total-lbl{
      font-size:9px;font-weight:700;
      letter-spacing:0.2em;text-transform:uppercase;
      color:rgba(255,255,255,0.55);
      line-height:1;margin-bottom:4px;
    }
    .total-nb{font-size:11px;color:rgba(255,255,255,0.35);margin-top:2px}
    .total-amount{
      font-family:'Playfair Display',Georgia,serif;
      font-size:28px;font-weight:900;color:#F0B830;
    }

    /* ── Payment ── */
    .payment{
      padding:14px 28px;
      display:flex;justify-content:center;
    }
    .mode-pill{
      display:inline-flex;align-items:center;gap:8px;
      padding:9px 22px;
      border:2px solid #C8860C;
      border-radius:30px;
      font-size:12px;font-weight:700;
      color:#C8860C;letter-spacing:0.04em;
    }
    .mode-pill-icon{font-size:15px}

    /* ── Footer ── */
    .footer-sep{
      margin:0 28px;
      border:none;
      border-top:1px dashed #C8A870;
    }
    .footer{
      padding:16px 28px 10px;
      text-align:center;
    }
    .footer-stars{
      font-size:14px;color:#C8860C;
      letter-spacing:5px;margin-bottom:8px;
    }
    .footer-merci{
      font-family:'Playfair Display',Georgia,serif;
      font-size:17px;font-weight:700;color:#1a0e04;
      margin-bottom:4px;
    }
    .footer-msg{font-size:12px;color:#8a7060;margin-bottom:10px}
    .footer-info{font-size:10px;color:#C0A880;letter-spacing:0.04em;line-height:1.8}

    @media print{
      body{max-width:100%}
      @page{margin:8mm}
    }
  </style>
</head>
<body>

  <div class="header">
    <div class="header-inner">
      <span class="header-icon">🍽️</span>
      <div class="header-name">Zefran</div>
      <div class="header-sub">Restaurant Marocain · Rabat</div>
      <div class="header-divider"></div>
    </div>
  </div>

  <div class="ref-band">
    <div>
      <div class="ref-label">Reçu de paiement</div>
      <div class="ref-num">${numCmd}</div>
    </div>
    <div class="ref-items">${nbItems} article${nbItems > 1 ? 's' : ''}</div>
  </div>

  <div class="meta">
    <div class="meta-row"><span class="meta-lbl">Date</span><span class="meta-val">${dateStr}</span></div>
    <div class="meta-row"><span class="meta-lbl">Heure</span><span class="meta-val">${heureStr}</span></div>
    <div class="meta-row"><span class="meta-lbl">Table / Commande</span><span class="meta-val">${label}</span></div>
    <div class="meta-row"><span class="meta-lbl">Caissier</span><span class="meta-val">${caissierNom}</span></div>
  </div>

  <div class="items-wrap">
    <div class="items-head">
      <span>Article</span><span>Qté</span><span>P.U.</span><span>Total</span>
    </div>
    <table><tbody>${lignesItems}</tbody></table>
  </div>

  <div class="total-wrap">
    <div class="total-box">
      <div>
        <div class="total-lbl">Total payé</div>
        <div class="total-nb">${nbItems} article${nbItems > 1 ? 's' : ''} commandé${nbItems > 1 ? 's' : ''}</div>
      </div>
      <div class="total-amount">${total} DH</div>
    </div>
  </div>

  <div class="payment">
    <div class="mode-pill">
      <span class="mode-pill-icon">${modeIcon}</span>
      Réglé par ${mode}
    </div>
  </div>

  <hr class="footer-sep"/>

  <div class="footer">
    <div class="footer-stars">★ ★ ★ ★ ★</div>
    <div class="footer-merci">Merci de votre visite !</div>
    <div class="footer-msg">Nous espérons vous revoir très bientôt.</div>
    <div class="footer-info">
      Ocean, Rabat · +212 5 22 34 56 66 · contact@zefran.ma<br/>
      Reçu généré le ${dateStr} à ${heureStr}
    </div>
  </div>


</body>
</html>`;

  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;top:0;left:0;width:0;height:0;border:none;visibility:hidden';
  document.body.appendChild(iframe);
  const doc = iframe.contentDocument || iframe.contentWindow.document;
  doc.open(); doc.write(html); doc.close();
  setTimeout(() => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    setTimeout(() => document.body.removeChild(iframe), 2000);
  }, 400);
}

export default function Caisse() {
  const { user } = useAuth();
  const [cmdServies, setCmdServies] = useState([]);
  const [success, setSuccess]     = useState('');
  const [error, setError]         = useState('');
  const [lastRecu, setLastRecu]   = useState(null);

  const fetchData = async () => {
    const r = await API.get('/commandes/?statut=servi');
    setCmdServies(r.data.results || r.data);
  };

  useEffect(() => {
    fetchData();
    const t = setInterval(fetchData, 15000);
    return () => clearInterval(t);
  }, []);

  const encaisser = async (cmd, mode) => {
    setError('');
    try {
      const r = await API.post('/facturation/encaisser/', { commande_id: cmd.id, mode_paiement: mode });
      const label = cmd.table_numero ? `Table ${cmd.table_numero}` : 'Commande en ligne';
      const caissierNom = user ? `${user.first_name} ${user.last_name}`.trim() || user.username : '—';
      const recuData = { cmd, facture: r.data, caissierNom };
      setLastRecu(recuData);
      setSuccess(`Paiement enregistré — ${label} — ${parseFloat(cmd.montant_total).toFixed(0)} DH`);
      fetchData();
      setTimeout(() => setSuccess(''), 6000);
    } catch (e) {
      setError(e.response?.data?.error || "Erreur lors de l'encaissement.");
    }
  };

  const cmds = cmdServies;

  return (
    <div style={{ padding: '1.75rem' }} className="fade-in">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: 26, color: 'var(--text)', marginBottom: 4 }}>Caisse & Facturation</h1>
        <p style={{ color: 'var(--text3)', fontSize: 13 }}>{cmds.length} commande(s) à encaisser</p>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: 10, padding: '10px 14px', color: '#ef4444', fontSize: 13, marginBottom: '1rem' }}>
          ⚠ {error}
        </div>
      )}

      {success && (
        <div style={{ background: 'var(--success-dim)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10, padding: '12px 16px', color: 'var(--success)', fontSize: 13, marginBottom: '1rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>✓ {success}</span>
          {lastRecu && (
            <button
              onClick={() => imprimerRecu(lastRecu)}
              style={{ marginLeft: 16, padding: '5px 14px', fontSize: 12, fontWeight: 700, background: '#22c55e', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              🖨️ Imprimer le reçu
            </button>
          )}
        </div>
      )}

      {cmds.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text3)' }}>
          <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.3 }}>◎</div>
          <p style={{ fontSize: 15 }}>Aucune commande à encaisser pour le moment</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
          {cmds.map(c => (
            <div key={c.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 20, color: 'var(--text)' }}>
                    {c.table_numero ? `Table ${c.table_numero}` : '🌐 Commande en ligne'}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>CMD #{String(c.id).padStart(4, '0')}</div>
                </div>
                <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 24, color: 'var(--accent)' }}>
                  {parseFloat(c.montant_total).toFixed(0)} DH
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                {c.items?.map(i => (
                  <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '5px 0', borderBottom: '1px solid var(--border)', color: 'var(--text2)' }}>
                    <span>{i.plat_nom} × {i.quantite}</span>
                    <span>{(i.quantite * parseFloat(i.prix_unitaire)).toFixed(0)} DH</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                <button className="btn-primary" style={{ fontSize: 12, padding: '8px' }} onClick={() => encaisser(c, 'especes')}>
                  💵 Espèces
                </button>
                <button className="btn-ghost" style={{ fontSize: 12, padding: '8px' }} onClick={() => encaisser(c, 'carte')}>
                  💳 Carte
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
