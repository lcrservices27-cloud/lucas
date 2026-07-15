import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const OUT = "/home/user/lucas/raio-x/criativos";

// ---- gauge SVG (semicircular velocímetro) ----
const pol = (cx, cy, r, deg) => {
  const a = (deg * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy - r * Math.sin(a)];
};
const arc = (cx, cy, r, a1, a2, color, w) => {
  const [x1, y1] = pol(cx, cy, r, a1);
  const [x2, y2] = pol(cx, cy, r, a2);
  return `<path d="M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="${color}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`;
};
function gauge(valor) {
  const cx = 300, cy = 285, r = 235, w = 34;
  const ang = 180 - valor * 1.8;
  const [nx, ny] = pol(cx, cy, 150, ang);
  return `
  <svg viewBox="0 0 600 430" width="100%" xmlns="http://www.w3.org/2000/svg">
    ${arc(cx, cy, r, 180, 108, "#ef4444", w)}
    ${arc(cx, cy, r, 106, 74, "#f59e0b", w)}
    ${arc(cx, cy, r, 72, 0, "#10b981", w)}
    <line x1="${cx}" y1="${cy}" x2="${nx.toFixed(1)}" y2="${ny.toFixed(1)}" stroke="#0a1f3c" stroke-width="13" stroke-linecap="round"/>
    <circle cx="${cx}" cy="${cy}" r="21" fill="#0a1f3c"/>
    <circle cx="${cx}" cy="${cy}" r="9" fill="#34d399"/>
    <text x="${cx}" y="388" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="110" font-weight="800" fill="#0a1f3c" letter-spacing="-3">${valor}</text>
    <text x="${cx}" y="424" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="26" font-weight="600" fill="#94a3b8">de 100 pontos</text>
  </svg>`;
}

// ---- page template ----
function page({ badge, hook, sub, valor, statusLabel, statusColor, cta }) {
  return `<!doctype html><html><head><meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { width:1080px; height:1920px; font-family:'Inter',Arial,sans-serif; overflow:hidden; }
  .stage {
    width:1080px; height:1920px; position:relative; color:#fff;
    background-color:#0a1f3c;
    background-image:
      linear-gradient(rgba(255,255,255,.045) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,.045) 1px, transparent 1px),
      radial-gradient(60% 40% at 50% 8%, rgba(37,99,235,.28), transparent 70%),
      radial-gradient(55% 40% at 85% 22%, rgba(16,185,129,.20), transparent 70%),
      linear-gradient(180deg,#06122b 0%,#0a1f3c 55%,#0b2545 100%);
    background-size:46px 46px,46px 46px,100% 100%,100% 100%,100% 100%;
    display:flex; flex-direction:column; padding:96px 84px 84px;
  }
  .brand { display:flex; align-items:center; gap:16px; font-size:30px; font-weight:800; letter-spacing:-.5px; }
  .brand .mark { width:52px; height:52px; border-radius:14px; background:#0e2a4d; border:1px solid rgba(255,255,255,.12);
     display:flex; align-items:center; justify-content:center; }
  .brand .mark svg { width:30px; height:30px; }
  .badge { display:inline-flex; align-items:center; gap:12px; margin-top:64px; align-self:flex-start;
     border:1px solid rgba(255,255,255,.18); background:rgba(255,255,255,.06); backdrop-filter:blur(8px);
     padding:16px 26px; border-radius:999px; font-size:26px; font-weight:600; color:rgba(255,255,255,.9); }
  .badge .dot { width:12px; height:12px; border-radius:999px; background:#34d399; box-shadow:0 0 16px #34d399; }
  h1 { margin-top:40px; font-size:96px; line-height:1.02; font-weight:900; letter-spacing:-2px; }
  h1 .g { background:linear-gradient(90deg,#34d399,#10b981); -webkit-background-clip:text; background-clip:text; color:transparent; }
  p.sub { margin-top:32px; font-size:38px; line-height:1.35; font-weight:500; color:rgba(255,255,255,.78); max-width:820px; }
  .card { margin-top:auto; margin-bottom:44px; background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.14);
     backdrop-filter:blur(14px); border-radius:44px; padding:40px 44px 34px; box-shadow:0 40px 100px -40px rgba(0,0,0,.7); }
  .card .cap { display:flex; align-items:center; justify-content:space-between; font-size:28px; font-weight:600; color:rgba(255,255,255,.72); }
  .gwrap { background:#fff; border-radius:32px; margin-top:24px; padding:34px 40px 20px; }
  .status { display:inline-flex; align-items:center; gap:14px; margin-top:26px; padding:16px 30px; border-radius:999px;
     font-size:30px; font-weight:800; }
  .scale { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-top:26px; }
  .scale span { text-align:center; padding:18px 0; border-radius:16px; font-size:26px; font-weight:700; }
  .benefits { display:flex; gap:40px; margin-top:6px; margin-bottom:40px; font-size:30px; font-weight:600; color:rgba(255,255,255,.85); }
  .benefits div { display:flex; align-items:center; gap:12px; }
  .benefits .ic { color:#34d399; font-size:30px; }
  .cta { display:flex; align-items:center; justify-content:center; gap:18px; background:linear-gradient(90deg,#10b981,#059669);
     color:#fff; font-size:44px; font-weight:800; padding:44px; border-radius:30px; letter-spacing:.3px;
     box-shadow:0 30px 70px -20px rgba(16,185,129,.7); }
  .disc { margin-top:34px; text-align:center; font-size:22px; line-height:1.4; color:rgba(255,255,255,.42); }
</style></head>
<body><div class="stage">
  <div class="brand">
    <span class="mark"><svg viewBox="0 0 32 32"><circle cx="14" cy="14" r="7" fill="none" stroke="#fff" stroke-width="2.4"/><path d="m19.5 19.5 5 5" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><path d="M10.5 14h7M14 10.5v7" stroke="#34d399" stroke-width="2.4" stroke-linecap="round"/></svg></span>
    Raio-X do Crédito
  </div>

  <span class="badge"><span class="dot"></span>${badge}</span>
  <h1>${hook}</h1>
  <p class="sub">${sub}</p>

  <div class="card">
    <div class="cap"><span>Índice de Saúde Financeira</span><span style="color:#34d399; font-weight:700">estimativa</span></div>
    <div class="gwrap">${gauge(valor)}</div>
    <div style="text-align:center">
      <span class="status" style="color:${statusColor};background:${statusColor}22">● STATUS: ${statusLabel}</span>
    </div>
    <div class="scale">
      <span style="background:#fee2e2;color:#dc2626">Baixo</span>
      <span style="background:#fef3c7;color:#d97706">Médio</span>
      <span style="background:#d1fae5;color:#059669">Alto</span>
    </div>
  </div>

  <div class="benefits">
    <div><span class="ic">✓</span> Gratuito</div>
    <div><span class="ic">✓</span> 2 minutos</div>
    <div><span class="ic">✓</span> Resultado na hora</div>
  </div>

  <div class="cta">${cta} <span style="font-size:40px">→</span></div>
  <div class="disc">Autoavaliação orientativa. Não faz consulta que afeta seu score nem garante aprovação de crédito.</div>
</div></body></html>`;
}

const criativos = [
  {
    file: "criativo-1-pedir-credito.png",
    badge: "Sem consulta que afeta seu score",
    hook: `Vai pedir<br><span class="g">crédito?</span>`,
    sub: "Descubra em 2 minutos os fatores que podem estar travando a sua aprovação.",
    valor: 58, statusLabel: "MÉDIO", statusColor: "#f59e0b",
    cta: "FAZER MEU RAIO-X",
  },
  {
    file: "criativo-2-negado.png",
    badge: "Diagnóstico gratuito · 2 minutos",
    hook: `Crédito<br><span class="g">sempre negado?</span>`,
    sub: "Existe um motivo — e ele aparece no seu Índice de Saúde Financeira. Veja o seu agora.",
    valor: 42, statusLabel: "ATENÇÃO", statusColor: "#ef4444",
    cta: "DESCOBRIR O MOTIVO",
  },
  {
    file: "criativo-3-antes-de-pedir.png",
    badge: "Feito por especialistas · LGPD",
    hook: `Antes de pedir<br><span class="g">empréstimo…</span>`,
    sub: "Faça o Raio-X e veja como está a sua saúde financeira aos olhos das instituições.",
    valor: 63, statusLabel: "MÉDIO", statusColor: "#f59e0b",
    cta: "FAZER MEU RAIO-X",
  },
];

const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
});
const pg = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
for (const c of criativos) {
  const html = page(c);
  writeFileSync(`${OUT}/${c.file.replace(".png", ".html")}`, html);
  await pg.setContent(html, { waitUntil: "networkidle" });
  await pg.waitForTimeout(400);
  await pg.screenshot({ path: `${OUT}/${c.file}` });
  console.log("ok", c.file);
}
await browser.close();
console.log("done");
