// 生成 /compatibility/ 全部页面
// 12 个单星座枢纽页（内含 12×12 矩阵热力图）+ 66 个唯一配对页
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { positionsAt, SIGNS, GLYPH } from './transits.mjs';
import { structural, sharedTransits, sharedHeadline, tierOf, tierColor,
         allPairs, pairSlug, pairNames, ELEM_COLOR, ELEMENT_LABEL,
         ELEMENT_OF, OPPOSITE, MODALITY } from './compat.mjs';

const SITE = 'https://horoscopetools.com';
const ROOT = process.env.SITE_ROOT || '/workspace/site-audit';
const OUT = `${ROOT}/compatibility`;
const NOW = process.env.BUILD_DATE ? new Date(process.env.BUILD_DATE) : new Date();
const DATE_ISO = NOW.toISOString().slice(0, 10);
const VS = '︎';
const GLYPHS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];

const lower = s => s.toLowerCase();
const el = n => ELEMENT_LABEL[ELEMENT_OF[n]];
const elc = n => ELEM_COLOR[ELEMENT_OF[n]];

const CSS = readFileSync(`${ROOT}/zodiac-signs/index.html`,'utf8').match(/<style>([\s\S]*?)<\/style>/)[1];

const EXTRA = `
/* ═══ 分数环 ═══ */
.ringwrap{display:flex;align-items:center;gap:22px;justify-content:center;flex-wrap:wrap;margin:8px 0 26px}
.ring{position:relative;width:150px;height:150px;flex:0 0 auto}
.ring svg{transform:rotate(-90deg);display:block}
.ring .rbg{fill:none;stroke:rgba(169,134,255,.16);stroke-width:11}
.ring .rfg{fill:none;stroke-width:11;stroke-linecap:round;transition:stroke-dashoffset 1.1s cubic-bezier(.2,.8,.2,1)}
.ring .rlab{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px}
.ring .rnum{font-family:var(--font-head);font-size:2.9rem;font-weight:700;line-height:1;color:#fff}
.ring .rout{font-size:.63rem;letter-spacing:.2em;text-transform:uppercase;color:var(--muted-2)}
.ring .rtier{font-size:.72rem;color:var(--gold);letter-spacing:.06em}
.ringmeta{max-width:34ch}
.ringmeta .rlab2{font-family:var(--font-head);font-size:1.28rem;color:#fff;margin:0 0 6px}
.ringmeta p{font-size:.95rem;margin:0}

/* ═══ 双星座叠加轮 ═══ */
.duo{display:flex;justify-content:center;margin:6px 0 22px}
.duo svg{width:min(330px,86vw);height:auto;overflow:visible}
.duo .dl{animation:dfloat 7s ease-in-out infinite}
@keyframes dfloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@media(prefers-reduced-motion:reduce){.duo .dl{animation:none}}

/* ═══ 12×12 矩阵热力图 ═══ */
.mxwrap{overflow-x:auto;margin:20px 0 8px;-webkit-overflow-scrolling:touch;
  padding:4px;border-radius:var(--radius)}
.mx{border-collapse:separate;border-spacing:3px;margin:0 auto}
.mx th{font-size:.62rem;letter-spacing:.02em;padding:0;text-transform:none;background:none;
  border:0;color:var(--muted-2);font-weight:500;white-space:nowrap}
.mx th.h{width:34px;height:30px;vertical-align:bottom}
.mx th.c{padding:5px 0 3px;text-align:center;min-width:34px}
.mx th.c .pg{font-size:1rem;display:block;line-height:1.1}
.mx th.corner{width:34px}
.mx td{width:34px;height:34px;padding:0;text-align:center;border:0;border-radius:8px;
  font-size:.66rem;font-weight:600;position:relative}
.mx td a{display:flex;align-items:center;justify-content:center;width:100%;height:100%;
  border-radius:8px;color:transparent;text-decoration:none;transition:transform .14s}
.mx td a:hover{transform:scale(1.13);z-index:2;color:#080611!important;box-shadow:0 4px 18px rgba(0,0,0,.6)}
.mx td.self{background:rgba(169,134,255,.10);color:var(--muted-2);font-size:.9rem}
.mx td.self::after{content:"·";opacity:.5}
.mxlegend{display:flex;gap:14px;flex-wrap:wrap;justify-content:center;margin:14px 0 0;
  font-size:.72rem;color:var(--muted-2)}
.mxlegend i{display:inline-block;width:11px;height:11px;border-radius:3px;margin-right:6px;vertical-align:-1px}

/* ═══ 排行条 ═══ */
.rank{display:flex;flex-direction:column;gap:7px;margin:20px 0}
.rank a{display:flex;align-items:center;gap:12px;padding:12px 15px;border-radius:var(--radius-sm);
  background:var(--glass);border:1px solid var(--line);color:var(--muted);text-decoration:none;transition:.16s}
.rank a:hover{text-decoration:none;border-color:var(--gold);transform:translateX(3px)}
.rank .rg{font-size:1.35rem;line-height:1}
.rank .rn{flex:1;color:#fff;font-size:.93rem}
.rank .rb{flex:1;height:5px;border-radius:3px;background:rgba(169,134,255,.14);overflow:hidden;max-width:150px}
.rank .rb i{display:block;height:100%;border-radius:3px}
.rank .rs{font-size:.85rem;font-weight:600;min-width:30px;text-align:right}

/* ═══ 双列优劣 ═══ */
.duo2{display:grid;gap:12px;margin:22px 0;grid-template-columns:1fr}
@media(min-width:700px){.duo2{grid-template-columns:1fr 1fr}}
.dcol{background:var(--glass);border:1px solid var(--line);border-radius:var(--radius);padding:20px 22px}
.dcol h3{font-family:var(--font-head);font-size:1.16rem;margin:0 0 10px;font-weight:600}
.dcol.good h3{color:var(--gold)} .dcol.hard h3{color:#ff8f9e}
.dcol ul{margin:0;padding-left:18px} .dcol li{font-size:.93rem;margin-bottom:8px}

.tcard{background:var(--glass);border:1px solid var(--line);border-radius:var(--radius);padding:20px 22px;margin-bottom:11px}
.tcard .th{display:flex;align-items:center;gap:9px;margin-bottom:9px;flex-wrap:wrap}
.tcard .th .pg{font-size:1.4rem;line-height:1}
.tcard .tn{font-family:var(--font-head);font-size:1.1rem;color:#fff;font-weight:600}
.tcard .ts{font-size:.7rem;letter-spacing:.12em;text-transform:uppercase;border-radius:999px;padding:2px 9px;border:1px solid var(--line);color:var(--muted-2)}
.tcard p{font-size:.94rem;margin:0 0 8px}
.tcard p:last-child{margin:0}
.tcard .pair2{font-size:.82rem;color:var(--gold)}
.mini{display:inline-flex;gap:4px;align-items:center;margin-left:auto;font-size:.7rem;color:var(--muted-2)}
`;

// ══════════════ 共享零件 ══════════════
function scoreRing(score, tier) {
  const R = 62, C = 2 * Math.PI * R, off = C * (1 - score / 100);
  const col = tierColor(score);
  return `<div class="ring"><svg viewBox="0 0 150 150" width="150" height="150">
    <circle class="rbg" cx="75" cy="75" r="${R}"/>
    <circle class="rfg" cx="75" cy="75" r="${R}" stroke="${col}"
      stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}"/>
  </svg><div class="rlab"><div class="rnum">${score}</div>
  <div class="rout">score</div><div class="rtier">${tier}</div></div></div>`;
}

function duoWheel(a, b) {
  const A = elc(a), B = elc(b);
  const gA = `g${Math.abs(a.length * 31 + b.length * 7)}`, gB = `h${Math.abs(b.length * 13 + a.length * 5)}`;
  return `<div class="duo"><svg viewBox="0 0 300 206" role="img"
    aria-label="${a} and ${b} signs shown as two overlapping zodiac circles">
    <defs>
      <radialGradient id="${gA}"><stop offset="0%" stop-color="${A}" stop-opacity=".9"/>
        <stop offset="100%" stop-color="${A}" stop-opacity=".38"/></radialGradient>
      <radialGradient id="${gB}"><stop offset="0%" stop-color="${B}" stop-opacity=".9"/>
        <stop offset="100%" stop-color="${B}" stop-opacity=".38"/></radialGradient>
    </defs>
    <g class="dl">
      <circle cx="118" cy="88" r="66" fill="url(#${gA})"/>
      <circle cx="118" cy="88" r="66" fill="none" stroke="${A}" stroke-width="1.4" stroke-opacity=".85"/>
      <circle cx="118" cy="88" r="54" fill="none" stroke="${A}" stroke-width=".8" stroke-opacity=".35" stroke-dasharray="2 7"/>
      <text x="118" y="78" text-anchor="middle" font-size="36" fill="#fff" opacity=".95"
        font-family="Segoe UI Symbol,Apple Symbols,serif">${GLYPHS[SIGNS.indexOf(a)]}${VS}</text>
      <text x="118" y="102" text-anchor="middle" font-size="12" fill="#f0d088"
        letter-spacing="2">${a.toUpperCase()}</text>
    </g>
    <g class="dl" style="animation-delay:-3.5s">
      <circle cx="182" cy="88" r="66" fill="url(#${gB})"/>
      <circle cx="182" cy="88" r="66" fill="none" stroke="${B}" stroke-width="1.4" stroke-opacity=".85"/>
      <circle cx="182" cy="88" r="54" fill="none" stroke="${B}" stroke-width=".8" stroke-opacity=".35" stroke-dasharray="2 7"/>
      <text x="182" y="78" text-anchor="middle" font-size="36" fill="#fff" opacity=".95"
        font-family="Segoe UI Symbol,Apple Symbols,serif">${GLYPHS[SIGNS.indexOf(b)]}${VS}</text>
      <text x="182" y="102" text-anchor="middle" font-size="12" fill="#f0d088"
        letter-spacing="2">${b.toUpperCase()}</text>
    </g>
    <line x1="128" y1="158" x2="172" y2="158" stroke="rgba(169,134,255,.28)" stroke-width="1"/>
    <rect x="112" y="164" width="76" height="34" rx="17" fill="#080611"
      stroke="rgba(240,208,136,.38)" stroke-width="1"/>
    <text x="150" y="178" text-anchor="middle" font-size="7" fill="#aaa0d4" letter-spacing="1.4">TODAY</text>
    <text x="150" y="191" text-anchor="middle" font-size="9" fill="#f0d088">${DATE_ISO}</text>
  </svg></div>`;
}

function matrix(home) {
  const hi = SIGNS.indexOf(home);
  let rows = `<tr><th class="corner"></th>` +
    SIGNS.map(n => `<th class="c"><span class="pg">${GLYPHS[SIGNS.indexOf(n)]}${VS}</span></th>`).join('') +
    `</tr>`;
  for (const r of SIGNS) {
    const ri = SIGNS.indexOf(r);
    rows += `<tr><th class="c"><span class="pg">${GLYPHS[ri]}${VS}</span></th>`;
    for (const c of SIGNS) {
      const ci = SIGNS.indexOf(c);
      if (r === c) { rows += `<td class="self"></td>`; continue; }
      const s = structural(r, c).score;
      const t = Math.max(0.34, Math.min(0.92, (s - 38) / 50));
      const col = s < 52 ? '#6f7ba8' : tierColor(s);
      const a = Math.min(ri, ci), b = Math.max(ri, ci);
      const slug = pairSlug(SIGNS[a], SIGNS[b]);
      const dim = r === home ? 1 : 0.62;
      rows += `<td><a href="/compatibility/${slug}/" title="${r} + ${c} · ${s}"
        style="background:${col};opacity:${(t * dim).toFixed(2)};color:#080611">${s}</a></td>`;
    }
    rows += `</tr>`;
  }
  return `<div class="mxwrap"><table class="mx"><tbody>${rows}</tbody></table></div>
  <div class="mxlegend">
    <span><i style="background:${tierColor(82)}"></i>82+ easy</span>
    <span><i style="background:${tierColor(72)}"></i>68–78 workable</span>
    <span><i style="background:${tierColor(58)}"></i>52–62 growth</span>
    <span><i style="background:#6f7ba8"></i>under 52 · hardest</span>
  </div>`;
}

function nav12(current) {
  return Object.entries(STRUCT).map(([s2, f2]) =>
    `<a class="pair" href="/compatibility/${s2}/" style="padding:11px 14px">
      <span class="pg">${GLYPHS[f2.idx]}${VS}</span>
      <span class="pn" style="font-size:.85rem">${f2.name}</span></a>`).join('');
}

function head(ld, title, desc, url, extraCss = '') {
  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<title>${title}</title>
<meta name="description" content="${desc}" />
<link rel="canonical" href="${url}" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${desc}" />
<meta property="og:type" content="article" />
<meta property="og:url" content="${url}" />
<meta property="og:image" content="${SITE}/og-compat.png" />
<meta name="twitter:card" content="summary_large_image" />
<script type="application/ld+json">
${JSON.stringify(ld, null, 2)}
</script>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cormorant+Garamond:wght@500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
<style>${CSS}${EXTRA}${extraCss}</style>
</head>`;
}

function footBar() {
  return `<footer class="site-footer">
  <div class="wrap foot-grid">
    <div class="foot-brand">
      <a class="brand" href="/index.html"><span class="mark">✦</span> Horoscope</a>
      <p>Free, private tools for astrology, numerology and tarot — a calm space for self-discovery and reflection.</p>
    </div>
    <div class="foot-col"><h4>Tools</h4>
      <a href="/zodiac-signs/">Zodiac Signs</a><a href="/natal-chart.html">Natal Chart</a>
      <a href="/index.html#life">Life Path Number</a><a href="/index.html#sun">Sun Sign</a>
      <a href="/index.html#tarot">Daily Tarot</a></div>
    <div class="foot-col"><h4>Compatibility</h4>
      <a href="/compatibility/">All Pairings</a><a href="/compatibility/aries/">Aries</a>
      <a href="/compatibility/libra/">Libra</a><a href="/compatibility/scorpio/">Scorpio</a></div>
    <div class="foot-col"><h4>Today</h4>
      <a href="/horoscope/aries/daily/">Aries Horoscope</a>
      <a href="/horoscope/libra/daily/">Libra Horoscope</a>
      <a href="/horoscope/scorpio/daily/">Scorpio Horoscope</a></div>
  </div>
  <div class="wrap copy">© 2026 Horoscope Tools · Made for people, not for ad networks.</div>
</footer>`;
}

const STRUCT = {};
SIGNS.forEach((n, i) => { STRUCT[lower(n)] = { name: n, idx: i }; });

// ══════════════ 66 个配对页 ══════════════
function pairPage(a, b, pos) {
  const slug = pairSlug(a, b);
  const st = structural(a, b);
  const rows = sharedTransits(pos, a, b, 3);
  const url = `${SITE}/compatibility/${slug}/`;
  const reversed = SIGNS.indexOf(a) > SIGNS.indexOf(b);
  const [A, B] = reversed ? [b, a] : [a, b];

  const faq = [
    { q: `Are ${a} and ${b} compatible?`,
      a: `Structurally, ${a} and ${b} score ${st.score} out of 100 — "${st.tier}" — which comes from how their elements relate and whether their modalities reinforce or fight each other. ` +
         `The full breakdown is on this page, and it is recomputed rather than written by hand.` },
    { q: `What makes ${a} and ${b} such a specific pairing?`,
      a: `${st.why}` },
    { q: `Is ${a} and ${b} an opposite-sign pairing?`,
      a: OPPOSITE[a] === b
        ? `Yes. ${a} and ${b} sit directly opposite on the wheel — the two ends of the same axis, ${A} being ${MODALITY[SIGNS.indexOf(A)].toLowerCase()} ${el(A)} and ${b} being ${MODALITY[SIGNS.indexOf(B)].toLowerCase()} ${el(B)}. Opposite signs attract because they complete something, and they clash for the same reason.`
        : `No. They are ${Math.abs(SIGNS.indexOf(a) - SIGNS.indexOf(b))} signs apart on the wheel, not six. Their connection comes from element and modality rather than opposition.` },
    { q: `What is happening between ${a} and ${b} in the sky today?`,
      a: rows.length
        ? `${sharedHeadline(rows)}. ${rows[0].name} is in ${rows[0].sign} at ${rows[0].deg.toFixed(1)}°, which touches both signs. Positions are computed from an ephemeris and change daily.`
        : `Nothing in the sky is placing a strong aspect on both signs at once right now, so today is comparatively quiet for this pairing.` },
    { q: `Does compatibility mean the relationship will work?`,
      a: `No. This page describes structure — how the two signs tend to interact, derived from elemental and modal relationships. It is traditional astrological weighting, not a prediction and not a scientific finding. ` +
         `If you want the specific version, you need two real birth charts, which is what our free natal chart tool computes.` },
    { q: `How is the compatibility score calculated?`,
      a: `Two transparent components: element relationship (60% of the score, from a traditional four-elements table) and modality relationship (40%, covering how cardinal, fixed and mutable signs interact). ` +
         `Identical signs are scored separately as a mirror, and opposite signs as an axis, because those pairings do not follow the ordinary element rules.` },
  ];

  const ld = { '@context':'https://schema.org', '@graph':[
    { '@type':'BreadcrumbList', itemListElement:[
      {'@type':'ListItem',position:1,name:'Home',item:`${SITE}/`},
      {'@type':'ListItem',position:2,name:'Zodiac Signs',item:`${SITE}/zodiac-signs/`},
      {'@type':'ListItem',position:3,name:'Compatibility',item:`${SITE}/compatibility/`},
      {'@type':'ListItem',position:4,name:`${a} and ${b}`,item:url}]},
    { '@type':'Article', headline:`${a} and ${b} Compatibility: Score, Traits & Today's Sky`,
      description:`${a} and ${b} score ${st.score}/100 (${st.tier}). Element, modality and today's computed transits.`,
      dateModified:DATE_ISO, datePublished:DATE_ISO,
      author:{'@type':'Organization',name:'Horoscope Tools'},
      publisher:{'@type':'Organization',name:'Horoscope Tools'}, mainEntityOfPage:url},
    { '@type':'FAQPage', mainEntity: faq.map(f =>
      ({'@type':'Question',name:f.q,acceptedAnswer:{'@type':'Answer',text:f.a}})) },
  ]};

  const tCards = rows.map((r, i) => {
    const tag = r.both ? 'BOTH SIGNS' : r.a.weight >= r.b.weight ? `HEAVIER ON ${a.toUpperCase()}` : `HEAVIER ON ${b.toUpperCase()}`;
    return `<div class="tcard">
      <div class="th"><span class="pg">${r.glyph}${VS}</span>
        <span class="tn">${r.name} in ${r.sign}</span>
        <span class="ts">${r.deg.toFixed(1)}°</span>
        <span class="mini">${tag}</span></div>
      <p><strong>On ${a}:</strong> ${r.a.label} — ${r.a.why}</p>
      <p><strong>On ${b}:</strong> ${r.b.label} — ${r.b.why}</p>
    </div>`;
  }).join('') || `<p>No body in the sky is placing a strong aspect on both signs at once right now. That is not a blank — it means nothing is amplifying this pairing today, so whatever tension exists between ${a} and ${b} is coming from the two of you rather than the timing.</p>`;

  const all = SIGNS.filter(n => n !== a && n !== b)
    .map(n => ({ n, s: structural(n, a).score }))
    .sort((x, y) => y.s - x.s);
  const best = all[0], worst = all[all.length - 1];
  const linkTo = n => `/compatibility/${pairSlug(a, n)}/`;

  return head(ld, `${a} and ${b} Compatibility: Score, Traits & Today's Sky`,
    `${a} and ${b} score ${st.score} out of 100 (${st.tier}). Full element and modality breakdown, plus today's computed transits for this pairing.`, url) +
`<body>
<div class="topbar"><div class="wrap topbar-in">
  <a class="brand" href="/index.html"><span class="mark">✦</span> Horoscope</a>
  <nav class="topnav">
    <a href="/zodiac-signs/">Zodiac Signs</a>
    <a class="hide-s" href="/compatibility/">Compatibility</a>
    <a class="hide-s" href="/natal-chart.html">Natal Chart</a>
    <a class="hide-s" href="/zodiac-signs/${lower(a)}/">${a}</a>
  </nav></div></div>
<main>
  <div class="wrap"><nav class="crumbs" aria-label="Breadcrumb">
    <a href="/index.html">Home</a><span>/</span>
    <a href="/zodiac-signs/">Zodiac Signs</a><span>/</span>
    <a href="/compatibility/">Compatibility</a><span>/</span>
    <b style="color:var(--muted);font-weight:400">${a} + ${b}</b>
  </nav></div>

  <header class="hero" style="padding-bottom:24px"><div class="wrap hero-in">
    ${duoWheel(A, B)}
    <h1>${a} &amp; ${b}</h1>
    <p class="dates">${el(a).toUpperCase()} × ${el(b).toUpperCase()}</p>
    <p class="tagline">${st.why}</p>
    <div class="ringwrap">
      ${scoreRing(st.score, st.tier)}
      <div class="ringmeta">
        <p class="rlab2">${st.tier} pairing</p>
        <p>${a} is ${MODALITY[SIGNS.indexOf(a)].toLowerCase()} ${el(a)}; ${b} is ${MODALITY[SIGNS.indexOf(b)].toLowerCase()} ${el(b)}.
        ${OPPOSITE[a] === b ? 'They sit opposite on the wheel.' : a === b ? 'They are the same sign.' : 'They are neither the same nor opposite.'}</p>
      </div>
    </div>
    <div class="cta-row">
      <a class="btn" href="/natal-chart.html?a=${lower(a)}&b=${lower(b)}">Get the Real Synastry</a>
      <a class="btn ghost" href="/compatibility/${lower(a)}/">All ${a} pairings</a>
    </div>
  </div></header>

  <nav class="jump" aria-label="Section navigation"><div class="wrap jump-in">
    <a href="#structure">Structure</a><a href="#today">Today's Sky</a>
    <a href="#strengths">Strengths</a><a href="#friction">Friction</a>
    <a href="#faq">FAQ</a><a href="#all">All Pairings</a>
  </div></nav>

  <div class="wrap">
    <section id="structure">
      <span class="eyebrow">01 — Structure</span>
      <h2>How the two signs actually relate</h2>
      <p class="lede">${st.why}</p>
      <p>The score is built from two visible components, not a gut feeling. Element carries 60% and modality 40%, and the same table is used for every one of the 66 pairings on this site — so the numbers are at least internally consistent, which most horoscope sites cannot say.</p>
      <div class="duo2">
        <div class="dcol"><h3>Element · ${el(a)} + ${el(b)}</h3>
          <p>${el(a)} and ${el(b)} ${ELEMENT_OF[a] === ELEMENT_OF[b] ? 'share an element, which doubles the flavour and the blind spot.' : 'are different elements, which makes the pairing either easy or demanding depending on which.'}</p>
          <p>${st.why}</p></div>
        <div class="dcol"><h3>Modality · ${MODALITY[SIGNS.indexOf(a)]} + ${MODALITY[SIGNS.indexOf(b)]}</h3>
          <p>${MODALITY[SIGNS.indexOf(a)]} signs initiate or hold; ${MODALITY[SIGNS.indexOf(b)]} signs do the same at a different tempo. This is usually what decides whether the pairing sustains or drifts.</p>
          <p>${OPPOSITE[a] === b ? 'Because these are opposite signs, the usual modality rules bend — the pull is stronger than the structure.' : 'The modality relationship here is the ordinary one, so expect it to behave predictably under pressure.'}</p></div>
      </div>
    </section>

    <section id="today">
      <span class="eyebrow">02 — Computed</span>
      <h2>${a} &amp; ${b} in today's sky</h2>
      <p class="lede">${sharedHeadline(rows)}.</p>
      <p>These are real positions from an ephemeris, recalculated every visit. The same three bodies will not be doing this tomorrow, which is the point — a pairing page that never changes is a poster, not a reading.</p>
      ${tCards}
      <p style="font-size:.8rem;color:var(--muted-2)">Computed ${DATE_ISO}</p>
    </section>

    <section id="strengths">
      <span class="eyebrow">03 — Where it works</span>
      <h2>What ${a} and ${b} do well</h2>
      <div class="duo2">
        <div class="dcol good"><h3>Natural strengths</h3><ul>
          <li>${el(a).toLowerCase()}-${el(b).toLowerCase()} is ${st.score >= 68 ? 'a combination that reinforces itself' : 'a combination that takes deliberate effort'}</li>
          <li>${MODALITY[SIGNS.indexOf(a)] === MODALITY[SIGNS.indexOf(b)] ? 'Matching modalities mean you both want the same rhythm — plans actually happen' : 'Different modalities mean one initiates while the other adjusts, which can work well if negotiated'}</li>
          <li>${OPPOSITE[a] === b ? 'Opposite signs complete each other’s blind spots faster than anyone else can' : 'Neither sign is the other’s direct opposite, so there is no single pressure point to resolve'}</li>
          <li>Element ${el(a).toLowerCase()} and ${el(b).toLowerCase()} give this pairing a recognisable dynamic others can read instantly</li>
        </ul></div>
        <div class="dcol hard" id="friction"><h3>Where it catches</h3><ul>
          <li>${ELEMENT_OF[a] === 'fire' || ELEMENT_OF[b] === 'fire' ? 'Fire outruns earth and water — someone in this pairing moves faster than the other can hold' : 'The slower element will feel the faster one is not committing'}</li>
          <li>${st.score < 60 ? 'The low element score means the friction is structural, not situational — it will not go away on a good week' : 'The high element score means friction here is situational and usually passes'}</li>
          <li>${OPPOSITE[a] === b ? 'Opposite signs want opposite things at the same time, and neither will compromise first' : 'Similar ages-of-chart positions mean expectations are assumed rather than stated'}</li>
          <li>Compatibility describes structure. It does not describe whether either party is actually available</li>
        </ul></div>
      </div>
    </section>

    <section id="faq">
      <span class="eyebrow">04 — FAQ</span>
      <h2>${a} and ${b} questions</h2>
      ${faq.map(f => `<div class="faq-item"><p class="faq-q">${f.q}</p><p class="faq-a">${f.a}</p></div>`).join('')}
    </section>

    <section id="all">
      <span class="eyebrow">— All 12</span>
      <h2>Every pairing with ${a}</h2>
      <div class="signgrid">
        ${SIGNS.filter(n => n !== a).map(n => {
          const s = structural(a, n).score;
          return `<a href="${linkTo(n)}"><span class="sg">${GLYPHS[SIGNS.indexOf(n)]}${VS}</span>${n}
            <span style="display:block;font-size:.64rem;color:${tierColor(s)};margin-top:3px">${s}</span></a>`;
        }).join('')}
      </div>
      <div class="cta-row" style="justify-content:flex-start;margin-top:14px">
        <a class="btn" href="/compatibility/${lower(a)}/">Open the full ${a} matrix</a>
      </div>
    </section>
  </div>
</main>
${footBar()}
<script type="module" src="/js/live-transits.js"></script>
</body></html>`;
}

// ══════════════ 12 个单星座枢纽页（含矩阵） ══════════════
function singlePage(name, pos) {
  const slug = lower(name);
  const idx = SIGNS.indexOf(name);
  const url = `${SITE}/compatibility/${slug}/`;
  const rows = SIGNS.filter(n => n !== name).map(n => ({ n, s: structural(name, n).score }));
  const sorted = [...rows].sort((x, y) => y.s - x.s);
  const best = sorted.slice(0, 3), worst = sorted.slice(-3).reverse();
  const self = structural(name, name);

  const faq = [
    { q: `Who is ${name} most compatible with?`,
      a: `By the same element-and-modality table used across this site, ${name} scores highest with ${best.map(x => `${x.n} (${x.s})`).join(', ')}. ` +
         `${best[0].n} is the strongest structural match because ${el(best[0].n)} sits at the most compatible angle to ${el(name)}.` },
    { q: `Who is ${name} least compatible with?`,
      a: `The hardest pairings for ${name} are ${worst.map(x => `${x.n} (${x.s})`).join(', ')}. ` +
         `These score low because the element relationship runs against ${name}'s natural mode, not because anything is wrong with either sign.` },
    { q: `What is ${name}'s element and modality?`,
      a: `${name} is a ${el(name).toLowerCase()} sign with ${MODALITY[idx].toLowerCase()} modality. ${el(name)} signs process experience through ${el(name) === 'Fire' ? 'action' : el(name) === 'Earth' ? 'concrete reality' : el(name) === 'Air' ? 'connection and language' : 'feeling'}, and ${MODALITY[idx].toLowerCase()} signs ${MODALITY[idx] === 'Cardinal' ? 'initiate things' : MODALITY[idx] === 'Fixed' ? 'hold a position' : 'adapt to changing circumstances'}.` },
    { q: `What does ${name} score with itself?`,
      a: `${name} paired with ${name} scores ${self.score} (${self.tier}). Identical signs are scored separately from the element table, because you understand each other instantly and never surprise each other — which is exactly the risk.` },
    { q: `Is ${name} compatible with its opposite sign?`,
      a: `${name}'s opposite is ${OPPOSITE[name]}, and yes — opposite signs score high (80 in the axis category). They attract because they complete something one of them lacks, and they clash for the same reason.` },
    { q: `How do I see all 144 zodiac combinations?`,
      a: `The full grid is on this page as a 12×12 matrix, and the 66 unique pairings each have their own page. ` +
         `We deliberately do not generate 144 pages, because half of them would be near-duplicates of the other half and that dilutes the whole set in search results.` },
  ];

  const ld = { '@context':'https://schema.org', '@graph':[
    { '@type':'BreadcrumbList', itemListElement:[
      {'@type':'ListItem',position:1,name:'Home',item:`${SITE}/`},
      {'@type':'ListItem',position:2,name:'Zodiac Signs',item:`${SITE}/zodiac-signs/`},
      {'@type':'ListItem',position:3,name:name,item:`${SITE}/zodiac-signs/${slug}/`},
      {'@type':'ListItem',position:4,name:`${name} Compatibility`,item:url}]},
    { '@type':'Article', headline:`${name} Compatibility: All 12 Signs, Scores & the Full Matrix`,
      description:`${name} compatibility with all twelve zodiac signs. Full 12×12 matrix, ranked pairings and a transparent scoring method.`,
      dateModified:DATE_ISO, datePublished:DATE_ISO,
      author:{'@type':'Organization',name:'Horoscope Tools'},
      publisher:{'@type':'Organization',name:'Horoscope Tools'}, mainEntityOfPage:url},
    { '@type':'FAQPage', mainEntity: faq.map(f =>
      ({'@type':'Question',name:f.q,acceptedAnswer:{'@type':'Answer',text:f.a}})) },
  ]};

  const rankRow = (n, s) => `<a href="/compatibility/${pairSlug(name, n)}/">
    <span class="rg" style="color:${tierColor(s)}">${GLYPHS[SIGNS.indexOf(n)]}${VS}</span>
    <span class="rn">${n}</span>
    <span class="rb"><i style="width:${s}%;background:${tierColor(s)}"></i></span>
    <span class="rs" style="color:${tierColor(s)}">${s}</span></a>`;

  return head(ld, `${name} Compatibility: All 12 Signs, Scores & Full Matrix`,
    `${name} compatibility with every zodiac sign. Full 12×12 matrix, ranked pairings and a transparent scoring method.`, url) +
`<body>
<div class="topbar"><div class="wrap topbar-in">
  <a class="brand" href="/index.html"><span class="mark">✦</span> Horoscope</a>
  <nav class="topnav">
    <a href="/zodiac-signs/">Zodiac Signs</a>
    <a class="hide-s" href="/compatibility/">Compatibility</a>
    <a class="hide-s" href="/natal-chart.html">Natal Chart</a>
    <a class="hide-s" href="/zodiac-signs/${slug}/">${name}</a>
  </nav></div></div>
<main>
  <div class="wrap"><nav class="crumbs" aria-label="Breadcrumb">
    <a href="/index.html">Home</a><span>/</span>
    <a href="/zodiac-signs/">Zodiac Signs</a><span>/</span>
    <a href="/zodiac-signs/${slug}/">${name}</a><span>/</span>
    <b style="color:var(--muted);font-weight:400">Compatibility</b>
  </nav></div>

  <header class="hero" style="padding-bottom:24px"><div class="wrap hero-in">
    <div class="glyph" aria-hidden="true">${GLYPHS[idx]}${VS}</div>
    <h1>${name} Compatibility</h1>
    <p class="dates">${el(name).toUpperCase()} · ${MODALITY[idx].toUpperCase()} · ${name.toUpperCase()}</p>
    <p class="tagline">Every pairing, scored the same way. The table below is the whole zodiac — tap any square for the full breakdown.</p>
    <dl class="facts">
      <div class="fact"><dt>Best match</dt><dd>${best[0].n} ${best[0].s}</dd></div>
      <div class="fact"><dt>2nd</dt><dd>${best[1].n} ${best[1].s}</dd></div>
      <div class="fact"><dt>Hardest</dt><dd>${worst[0].n} ${worst[0].s}</dd></div>
      <div class="fact"><dt>Opposite</dt><dd>${OPPOSITE[name]}</dd></div>
      <div class="fact"><dt>Self</dt><dd>${self.score}</dd></div>
    </dl>
    <div class="cta-row">
      <a class="btn" href="#matrix">See the matrix</a>
      <a class="btn ghost" href="/natal-chart.html?sign=${slug}">Get My Real Chart</a>
    </div>
  </div></header>

  <nav class="jump" aria-label="Section navigation"><div class="wrap jump-in">
    <a href="#matrix">12×12 Matrix</a><a href="#best">Best matches</a>
    <a href="#hardest">Hardest</a><a href="#method">How it's scored</a>
    <a href="#faq">FAQ</a><a href="#all">All signs</a>
  </div></nav>

  <div class="wrap">
    <section id="matrix">
      <span class="eyebrow">01 — The matrix</span>
      <h2>All twelve signs, squared</h2>
      <p class="lede">144 combinations, one grid. ${name}'s own row is brighter. Hover any square on a desktop, tap on a phone, and you land on that pairing's full page.</p>
      ${matrix(name)}
      <p style="font-size:.8rem;color:var(--muted-2);text-align:center;margin-top:10px">
        Scores are symmetric — ${name} with ${OPPOSITE[name]} reads the same in both directions. There are 66 unique pairings, not 144.</p>
    </section>

    <section id="best">
      <span class="eyebrow">02 — Ranked</span>
      <h2>${name}'s pairings, ranked</h2>
      <p>Sorted highest to lowest by the same formula used everywhere on this site. The top three are not always the same elements, because modality matters as much as element.</p>
      <div class="rank">${sorted.map(x => rankRow(x.n, x.s)).join('')}</div>
    </section>

    <section id="hardest">
      <span class="eyebrow">03 — The hard ones</span>
      <h2>Where ${name} gets stretched</h2>
      <p class="lede">Low scores are not verdicts. They mean the element relationship runs against ${name}'s grain, which usually shows up as a difference in tempo rather than a lack of care.</p>
      <div class="duo2">
        ${worst.map(w => `<div class="dcol hard">
          <h3><span style="color:${tierColor(w.s)}">${GLYPHS[SIGNS.indexOf(w.n)]}${VS}</span>
          ${w.n} · ${w.s}</h3>
          <p>${structural(name, w.n).why}</p>
          <p style="margin-top:8px"><a href="/compatibility/${pairSlug(name, w.n)}/">Read the full ${name} + ${w.n} pairing →</a></p>
        </div>`).join('')}
      </div>
    </section>

    <section id="method">
      <span class="eyebrow">04 — Method</span>
      <h2>How the score is built</h2>
      <p>Compatibility scores on horoscope sites are usually invented. This one is not, so here is the entire method — you should be able to reproduce any number on this site by hand.</p>
      <div class="duo2">
        <div class="dcol"><h3>Element · 60% of the score</h3>
          <p>Every sign carries one of four elements. The pairing gets a value from a traditional four-elements table: same element scores highest, the two that feed each other (fire–air, earth–water) score high, and the two in tension (fire–water, air–earth) score lowest.</p></div>
        <div class="dcol"><h3>Modality · 40% of the score</h3>
          <p>Every sign is also cardinal, fixed or mutable. Cardinal initiates, fixed sustains, mutable adapts. Matching modalities reinforce each other; mismatched ones either complement or grind depending on which.</p></div>
      </div>
      <div class="callout">
        <p><strong>Two exceptions</strong></p>
        <p>Identical signs are scored as a mirror, and opposite signs as an axis, because neither follows the ordinary element rules. That is why ${name} with ${name} scores ${self.score} and ${name} with ${OPPOSITE[name]} scores 80.</p>
      </div>
      <p>What this method deliberately does not claim: that a score predicts whether a relationship will work. It describes structure, not outcome. For the specific version, you need two real charts.</p>
      <div class="cta-row" style="justify-content:flex-start;margin-top:8px">
        <a class="btn" href="/natal-chart.html?sign=${slug}">Open Free Natal Chart</a></div>
    </section>

    <section id="faq">
      <span class="eyebrow">05 — FAQ</span>
      <h2>${name} compatibility questions</h2>
      ${faq.map(f => `<div class="faq-item"><p class="faq-q">${f.q}</p><p class="faq-a">${f.a}</p></div>`).join('')}
    </section>

    <section id="all">
      <span class="eyebrow">— All 12</span>
      <h2>Compatibility by sign</h2>
      <div class="compat">${nav12(slug)}</div>
    </section>
  </div>
</main>
${footBar()}
<script type="module" src="/js/live-transits.js"></script>
</body></html>`;
}

// ══════════════ 汇总页 ══════════════
function indexPage(pos) {
  const url = `${SITE}/compatibility/`;
  const all = allPairs().map(([a, b]) => ({ a, b, s: structural(a, b).score }))
    .sort((x, y) => y.s - x.s);
  const ld = { '@context':'https://schema.org', '@graph':[
    { '@type':'BreadcrumbList', itemListElement:[
      {'@type':'ListItem',position:1,name:'Home',item:`${SITE}/`},
      {'@type':'ListItem',position:2,name:'Compatibility',item:url}]},
    { '@type':'Article', headline:'Zodiac Compatibility: All 66 Sign Pairings, Scored',
      description:'Every zodiac sign pairing scored with a transparent element and modality method. Full 12×12 matrix and 66 unique pairing pages.',
      dateModified:DATE_ISO, datePublished:DATE_ISO,
      author:{'@type':'Organization',name:'Horoscope Tools'},
      publisher:{'@type':'Organization',name:'Horoscope Tools'}, mainEntityOfPage:url}]};

  const cards = SIGNS.map(n => {
    const rows = SIGNS.filter(x => x !== n).map(x => ({ x, s: structural(n, x).score })).sort((a, b) => b.s - a.s);
    return `<a class="pair" href="/compatibility/${lower(n)}/" style="flex-direction:column;align-items:flex-start;gap:4px;padding:18px">
      <span style="display:flex;align-items:center;gap:10px;width:100%">
        <span class="pg">${GLYPHS[SIGNS.indexOf(n)]}${VS}</span>
        <span class="pn">${n}</span></span>
      <span class="pl">best: ${rows[0].x} ${rows[0].s} · hard: ${rows[rows.length-1].x} ${rows[rows.length-1].s}</span></a>`;
  }).join('');

  const topList = all.slice(0, 12).map(x =>
    `<a href="/compatibility/${pairSlug(x.a, x.b)}/">
      <span class="rg" style="color:${tierColor(x.s)}">${x.s}</span>
      <span class="rn">${x.a} + ${x.b}</span>
      <span class="rb"><i style="width:${x.s}%;background:${tierColor(x.s)}"></i></span>
      <span class="rs" style="color:${tierColor(x.s)}">${tierOf(x.s)}</span></a>`).join('');

  return head(ld, 'Zodiac Compatibility: All 66 Sign Pairings, Scored',
    'Every zodiac sign pairing scored with a transparent element and modality method. 66 unique pairings, no duplicates.', url) +
`<body>
<div class="topbar"><div class="wrap topbar-in">
  <a class="brand" href="/index.html"><span class="mark">✦</span> Horoscope</a>
  <nav class="topnav">
    <a href="/zodiac-signs/">Zodiac Signs</a><a href="/compatibility/">Compatibility</a>
    <a class="hide-s" href="/natal-chart.html">Natal Chart</a></nav></div></div>
<main>
  <div class="wrap"><nav class="crumbs" aria-label="Breadcrumb">
    <a href="/index.html">Home</a><span>/</span>
    <b style="color:var(--muted);font-weight:400">Compatibility</b></nav></div>
  <header class="hero"><div class="wrap hero-in">
    <div class="glyph" aria-hidden="true">⚯︎</div>
    <h1>Zodiac Compatibility</h1>
    <p class="dates">66 UNIQUE PAIRINGS · ONE METHOD</p>
    <p class="tagline">Every combination of two signs, scored the same way and explained the same way. No duplicated pages, no invented numbers, and the same table you can reproduce by hand.</p>
    <div class="cta-row">
      <a class="btn" href="#by-sign">Browse by sign</a>
      <a class="btn ghost" href="#top">Highest scoring</a>
    </div>
  </div></header>
  <nav class="jump" aria-label="Section navigation"><div class="wrap jump-in">
    <a href="#by-sign">By sign</a><a href="#top">Top pairings</a>
    <a href="#method">Method</a><a href="#matrices">12 matrices</a></div></nav>
  <div class="wrap">
    <section id="by-sign"><span class="eyebrow">01 — By sign</span>
      <h2>Pick a sign</h2>
      <p class="lede">Each sign page carries the full 12×12 matrix and the method behind it.</p>
      <div class="compat">${cards}</div></section>
    <section id="top"><span class="eyebrow">02 — Ranked</span>
      <h2>Highest scoring pairings</h2>
      <p>Out of all 66. Note that fire with air scores above the classic "opposite signs attract" pairs — which is a useful corrective to most horoscope sites.</p>
      <div class="rank">${topList}</div></section>
    <section id="method"><span class="eyebrow">03 — Method</span>
      <h2>How every score is calculated</h2>
      <p>Two components: element relationship at 60%, modality relationship at 40%. Identical signs are scored as a mirror, opposite signs as an axis. Nothing here is a black box — the full explanation is on every sign page.</p>
      <div class="callout"><p><strong>Why 66 pages and not 144</strong></p>
        <p>144 combinations exist, but Aries with Taurus and Taurus with Aries are the same relationship. Generating both would create 78 near-duplicate pages and split the authority across them. We publish each pairing once and make sure every one is reachable from at least two other pages.</p></div>
    </section>
    <section id="matrices"><span class="eyebrow">04 — Matrices</span>
      <h2>The 12×12 grid, twelve times</h2>
      <p>Each grid is the same data, re-centred on one sign so that sign's own row reads brightest.</p>
      <div class="signgrid">
        ${SIGNS.map(n => `<a href="/compatibility/${lower(n)}/"><span class="sg">${GLYPHS[SIGNS.indexOf(n)]}${VS}</span>${n}</a>`).join('')}
      </div></section>
  </div>
</main>
${footBar()}
</body></html>`;
}

// ══════════════ 生成 ══════════════
const pos = positionsAt(NOW);
mkdirSync(OUT, { recursive: true });

let np = 0;
for (const [a, b] of allPairs()) {
  const d = join2(pairSlug(a, b));
  mkdirSync(d, { recursive: true });
  writeFileSync(join2(pairSlug(a, b), 'index.html'), pairPage(a, b, pos), 'utf8');
  np++;
}
let ns = 0;
for (const n of SIGNS) {
  const d = join2(lower(n));
  mkdirSync(d, { recursive: true });
  writeFileSync(join2(lower(n), 'index.html'), singlePage(n, pos), 'utf8');
  ns++;
}
writeFileSync(join2('', 'index.html'), indexPage(pos), 'utf8');

console.log(`✅ 配对页 ${np} · 单星座页 ${ns} · 汇总页 1  合计 ${np + ns + 1}`);
console.log(`   基准时刻 ${DATE_ISO} · Sun ${pos.Sun.sign} ${pos.Sun.degInSign.toFixed(1)}° · Moon ${pos.Moon.sign} ${pos.Moon.degInSign.toFixed(1)}°`);

function join2(...p) { return `${ROOT}/compatibility/` + p.filter(Boolean).join('/'); }
