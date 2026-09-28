// 生成 12 个 /horoscope/{sign}/daily/ 页面
// 构建期算真值烘焙进 HTML（可被抓取），客户端再实时重算（永不过期）
import { positionsAt, SIGNS, GLYPH, planetOrder } from './transits.mjs';
import { topTransits, headline, planetNote, ORB, ELEMENT_OF, MODALITY } from './reading.mjs';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const SITE = 'https://horoscopetools.com';
const ROOT = process.env.SITE_ROOT || '/workspace/site-audit';
const OUT = `${ROOT}/horoscope`;
const CSSF = `${ROOT}/zodiac-signs/index.html`;
const NOW = process.env.BUILD_DATE ? new Date(process.env.BUILD_DATE) : new Date();
const DATE_ISO = NOW.toISOString().slice(0, 10);
const HUMAN = NOW.toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric', timeZone:'UTC' });

const facts = {
  aries:   { name:'Aries',   idx:0 },
  taurus:  { name:'Taurus',  idx:1 },
  gemini:  { name:'Gemini',  idx:2 },
  cancer:  { name:'Cancer',  idx:3 },
  leo:     { name:'Leo',     idx:4 },
  virgo:   { name:'Virgo',   idx:5 },
  libra:   { name:'Libra',   idx:6 },
  scorpio: { name:'Scorpio', idx:7 },
  sagittarius:{ name:'Sagittarius', idx:8 },
  capricorn:{ name:'Capricorn', idx:9 },
  aquarius:{ name:'Aquarius',idx:10 },
  pisces:  { name:'Pisces',  idx:11 },
};

const GLYPHS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
const esc = (s) => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const VS = '︎';

const ELEMENT_NOTE = {
  fire:  'Fire rises fast and cools fast. Whatever this transit touches will be loud before it is deep — expect the urge before the reason.',
  earth: 'Earth transits are slow and physical. Whatever this transit touches will show up in the body, the wallet or the calendar, not in the mood.',
  air:   'Air transits arrive as conversation. The effect is clearest once you say out loud what is going on, so do that early.',
  water: 'Water transits work below the surface. Nothing looks wrong from the outside, which is exactly when they cost the most.',
};

// 单个行运的叙述
function transitLine(t) {
  const orb = ORB(t);
  const tight = orb === 'tight' ? 'tight' : orb === 'close' ? 'close' : 'wide';
  const lead = {
    in:        `${t.glyph} <strong>${t.name}</strong> ${t.label} ${t.name === 'Sun' ? 'your' : 'your'} sign's space`,
    opposition:`${t.glyph} <strong>${t.name}</strong> ${t.label} your sign directly`,
    square:    `${t.glyph} <strong>${t.name}</strong> ${t.label} your sign at right angles`,
    sextile:   `${t.glyph} <strong>${t.name}</strong> ${t.label} from a helpful angle`,
    semi:      `${t.glyph} <strong>${t.name}</strong> ${t.label} your sign by a few degrees`,
    quincunx:  `${t.glyph} <strong>${t.name}</strong> ${t.label}, and you will misread it`,
    far:       `${t.glyph} <strong>${t.name}</strong> is ${t.label}`,
  }[t.kind];
  return {
    head: lead,
    body: `${t.why} A ${tight} orb. In this transit ${t.name} governs ${planetNote(t.name)}.`,
    weight: t.score, kind: t.kind, orb,
  };
}
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

function faq(sign, pos, t) {
  const moon = pos.Moon, sun = pos.Sun;
  return [
    { q: `What is ${sign} horoscope for ${DATE_ISO}?`,
      a: `The Sun is in ${sun.sign} at ${sun.degInSign.toFixed(0)}° and the Moon is in ${moon.sign} at ${moon.degInSign.toFixed(0)}°. ` +
         `The most active ${sign} transit today is ${t[0].name} in ${t[0].sign}, ${t[0].label} the sign at a ${t[0].orb} orb. ` +
         `These positions are computed from an ephemeris, not written by hand, and they are the same for everyone reading this page.` },
    { q: `What sign is the Moon in on ${DATE_ISO}?`,
      a: `The Moon is in ${moon.sign} at ${moon.degInSign.toFixed(1)}°. The Moon moves roughly 12 to 13 degrees a day, so it changes sign every two to three days — ` +
         `which makes it the fastest-moving and most personal body in the chart. It governs emotional weather and what you need in order to feel safe today.` },
    { q: `Does my ${sign} horoscope change based on where I live?`,
      a: `The planetary positions on this page are geocentric, so they are identical for everyone. What does change with location is your Ascendant — the sign rising on the eastern horizon at your birth moment. ` +
         `In practice the Ascendant often describes how you operate better than the Sun sign does, and it depends on both birth time and birthplace.` },
    { q: `How accurate is this horoscope?`,
      a: `The astronomy is exact: planetary positions come from a real ephemeris and are correct to a fraction of a degree. ` +
         `The interpretation of what those positions mean is astrological tradition, not scientific finding — it has been treated as pseudoscience since the 18th century. ` +
         `Treat the positions as fact and the meaning as a prompt to think.` },
    { q: `Why does my horoscope feel different from this one?`,
      a: `Most likely your Ascendant or Moon sign is carrying more of your life than your Sun sign does, and this page is written to the Sun sign. ` +
         `Open a full natal chart with your birth date, time and place and you can see which placements actually dominate.` },
    { q: `When does the ${sign} reading update?`,
      a: `The planetary positions on this page are recalculated every time you load it, from the current moment. The static text you see if scripts are disabled is the version baked in on ${DATE_ISO}. ` +
         `Nothing on this page is scheduled or guessed in advance.` },
  ];
}

const CSS = readFileSync(CSSF, 'utf8').match(/<style>([\s\S]*?)<\/style>/)[1];
const EXTRA = `
.dgrid{display:grid;gap:10px;margin:22px 0;grid-template-columns:1fr}
@media(min-width:760px){.dgrid{grid-template-columns:1fr 1fr}}
.dcard{background:var(--glass);border:1px solid var(--line);border-radius:var(--radius);padding:20px 22px}
.dcard.hot{border-color:rgba(240,208,136,.45);background:rgba(240,208,136,.06)}
.dcard .dh{font-family:var(--font-head);font-size:1.12rem;color:#fff;margin:0 0 8px;font-weight:600;line-height:1.3}
.dcard .dh .pg{margin-right:6px}
.dcard p{font-size:.95rem;margin:0;max-width:none}
.dscore{float:right;font-size:.68rem;letter-spacing:.12em;color:var(--gold-soft);border:1px solid var(--line);
  border-radius:999px;padding:2px 9px;margin-left:10px;white-space:nowrap}
.sky td .pg{margin-right:7px}
.tag{display:inline-block;font-size:.62rem;letter-spacing:.1em;text-transform:uppercase;
  border-radius:999px;padding:2px 8px;border:1px solid var(--line);color:var(--muted-2);margin-left:8px;vertical-align:2px}
.tag.hot{color:#080611;background:var(--gold);border-color:var(--gold)}
.skel{opacity:.35;transition:opacity .4s}
.live-dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--gold);margin-right:7px;
  vertical-align:2px;box-shadow:0 0 8px var(--gold)}
`;

function build(slug, sign, idx, pos) {
  const ts = topTransits(pos, idx, 5);
  const lines = ts.map(transitLine);
  const primary = lines[0];
  const el = ELEMENT_OF[SIGNS[idx]];
  const moon = pos.Moon, sun = pos.Sun;
  const head = headline(pos, idx);

  const skyRows = planetOrder.map(n => {
    const p = pos[n];
    const rel = ts.find(t => t.name === n);
    const hot = rel && rel.kind === 'in' && p.degInSign < 7;
    return `<tr><td><span class="pg">${GLYPH[n]}${VS}</span>${n}` +
      (hot ? '<span class="tag hot">on your sign</span>' : '') +
      `</td><td>${p.sign}</td><td>${p.degInSign.toFixed(1)}°</td></tr>`;
  }).join('');

  const cards = lines.map((l, i) =>
    `<div class="dcard${i === 0 ? ' hot' : ''}">
      <span class="dscore">${['STRONGEST','STRONG','MODERATE','SUPPORT','BACKGROUND'][i] || 'BACKGROUND'}</span>
      <p class="dh"><span class="pg">${ts[i].glyph}${VS}</span>${ts[i].sign} · ${ts[i].deg.toFixed(1)}°</p>
      <p><strong>${l.head}</strong>. ${l.body}</p>
    </div>`).join('');

  const faqHtml = faq(sign, pos, lines).map(f =>
    `<div class="faq-item"><p class="faq-q">${esc(f.q)}</p><p class="faq-a">${f.a}</p></div>`).join('');

  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type':'BreadcrumbList', itemListElement:[
        {'@type':'ListItem', position:1, name:'Home', item:`${SITE}/`},
        {'@type':'ListItem', position:2, name:'Zodiac Signs', item:`${SITE}/zodiac-signs/`},
        {'@type':'ListItem', position:3, name:sign, item:`${SITE}/zodiac-signs/${slug}/`},
        {'@type':'ListItem', position:4, name:`${sign} Horoscope`, item:`${SITE}/horoscope/${slug}/daily/`}]},
      { '@type':'Article',
        headline:`${sign} Horoscope Today — ${HUMAN}`,
        description:`Computed ${sign} horoscope for ${DATE_ISO}. Sun in ${sun.sign}, Moon in ${moon.sign}, with real planetary positions from an ephemeris.`,
        dateModified: DATE_ISO, datePublished: DATE_ISO,
        author:{'@type':'Organization', name:'Horoscope Tools'},
        publisher:{'@type':'Organization', name:'Horoscope Tools'},
        mainEntityOfPage:`${SITE}/horoscope/${slug}/daily/`},
      { '@type':'FAQPage', mainEntity: faq(sign, pos, lines).map(f =>
        ({'@type':'Question', name:f.q, acceptedAnswer:{'@type':'Answer', text:f.a}})) },
    ],
  };

  const nav12 = Object.entries(facts).map(([s2, f2]) =>
    `<a class="pair" href="/horoscope/${s2}/daily/" style="padding:11px 14px">
      <span class="pg">${SIGNS[f2.idx].slice(0,2)}${VS}</span>
      <span class="pn" style="font-size:.85rem">${f2.name}</span></a>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<title>${sign} Horoscope Today — ${DATE_ISO}</title>
<meta name="description" content="${sign} horoscope for ${DATE_ISO}. Sun in ${sun.sign}, Moon in ${moon.sign}. Positions computed from a real ephemeris, recalculated every visit." />
<link rel="canonical" href="${SITE}/horoscope/${slug}/daily/" />
<meta property="og:title" content="${sign} Horoscope Today — ${DATE_ISO}" />
<meta property="og:description" content="Sun in ${sun.sign}, Moon in ${moon.sign}. Computed, not written by hand." />
<meta property="og:type" content="article" />
<meta property="og:url" content="${SITE}/horoscope/${slug}/daily/" />
<meta property="og:image" content="${SITE}/og-${slug}.png" />
<meta name="twitter:card" content="summary_large_image" />
<script type="application/ld+json">
${JSON.stringify(ld, null, 2)}
</script>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cormorant+Garamond:wght@500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
<style>${CSS}${EXTRA}</style>
</head>
<body data-sign="${idx}">
<div class="topbar"><div class="wrap topbar-in">
  <a class="brand" href="/index.html"><span class="mark">✦</span> Horoscope</a>
  <nav class="topnav">
    <a href="/zodiac-signs/">Zodiac Signs</a>
    <a class="hide-s" href="/zodiac-signs/${slug}/">${sign}</a>
    <a class="hide-s" href="/natal-chart.html">Natal Chart</a>
    <a class="hide-s" href="/index.html#tarot">Tarot</a>
  </nav>
</div></div>
<main>
  <div class="wrap"><nav class="crumbs" aria-label="Breadcrumb">
    <a href="/index.html">Home</a><span>/</span>
    <a href="/zodiac-signs/">Zodiac Signs</a><span>/</span>
    <a href="/zodiac-signs/${slug}/">${sign}</a><span>/</span>
    <b style="color:var(--muted);font-weight:400">Today</b>
  </nav></div>

  <header class="hero"><div class="wrap hero-in">
    <div class="glyph" aria-hidden="true">${GLYPHS[idx]}${VS}</div>
    <h1>${sign} Horoscope</h1>
    <p class="dates" id="js-date">${DATE_ISO}</p>
    <p class="tagline" id="js-head">${head}</p>

    <dl class="facts">
      <div class="fact"><dt>Sun</dt><dd id="f-sun">${sun.sign}</dd></div>
      <div class="fact"><dt>Moon</dt><dd id="f-moon">${moon.sign}</dd></div>
      <div class="fact"><dt>Your sign</dt><dd>${sign}</dd></div>
      <div class="fact"><dt>Element</dt><dd>${el[0].toUpperCase()+el.slice(1)}</dd></div>
      <div class="fact"><dt>Modality</dt><dd>${MODALITY[idx]}</dd></div>
    </dl>

    <div class="cta-row">
      <a class="btn" href="/natal-chart.html?sign=${slug}">Get My Full Reading</a>
      <a class="btn ghost" href="/zodiac-signs/${slug}/">${sign} Profile</a>
    </div>
    <p style="margin-top:14px;font-size:.78rem;color:var(--muted-2)">
      <span class="live-dot"></span><span id="js-status">Positions computed ${DATE_ISO} · recalculating on load</span>
    </p>
  </div></header>

  <nav class="jump" aria-label="Section navigation"><div class="wrap jump-in">
    <a href="#transits">Today's Transits</a><a href="#sky">The Sky</a>
    <a href="#read">How to Read It</a><a href="#faq">FAQ</a>
    <a href="#all">All Signs</a>
  </div></nav>

  <div class="wrap">
    <section id="transits">
      <span class="eyebrow">01 — Computed</span>
      <h2>Today's ${sign} transits</h2>
      <p class="lede">These are the real positions of the ten bodies, ranked by how much they actually bear on ${sign} today. Nothing here is written by hand.</p>
      <div class="dgrid" id="js-cards">${cards}</div>
    </section>

    <section id="sky">
      <span class="eyebrow">02 — The Sky</span>
      <h2>Where everything is today</h2>
      <p>Geocentric positions for ${DATE_ISO}. These do not change with your location — what changes with location is your Ascendant, which is why the same ${sign} can feel completely different to two people.</p>
      <div class="table-wrap"><table class="sky">
        <thead><tr><th>Body</th><th>Sign</th><th>Degree</th></tr></thead>
        <tbody>${skyRows}</tbody>
      </table></div>
    </section>

    <section id="read">
      <span class="eyebrow">03 — How to read it</span>
      <h2>What this actually means for ${sign}</h2>
      <p>${esc(ELEMENT_NOTE[el])}</p>
      <p>Today's strongest ${sign} contact is <strong>${ts[0].name} in ${ts[0].sign}</strong>, ${ts[0].label} your sign at a ${ts[0].orb} orb. It governs ${planetNote(ts[0].name)}. If you want to know whether this is operating through your Sun sign or something else, the answer is usually in your Moon or your Ascendant — and both are on the chart, not on this page.</p>
      <div class="callout">
        <p><strong>The honest version</strong></p>
        <p>The positions above are astronomical fact. The meaning you attach to them is tradition, not science. ` +
        `Use this page as a prompt to notice what you are actually doing today, not as an instruction.</p>
      </div>
      <div class="cta-row" style="justify-content:flex-start;margin-top:8px">
        <a class="btn" href="/natal-chart.html?sign=${slug}">Open Free Natal Chart</a>
      </div>
    </section>

    <section id="faq">
      <span class="eyebrow">04 — FAQ</span>
      <h2>${sign} horoscope questions</h2>
      ${faqHtml}
    </section>

    <section id="all">
      <span class="eyebrow">— All 12</span>
      <h2>Today's horoscope by sign</h2>
      <div class="compat">${nav12}</div>
      <div class="signgrid" style="margin-top:14px">
        ${Object.entries(facts).map(([s2,f2]) => `<a href="/zodiac-signs/${s2}/" class="${s2===slug?'cur':''}"><span class="sg">${GLYPHS[f2.idx]}${VS}</span>${f2.name}</a>`).join('')}
      </div>
    </section>
  </div>
</main>
<footer class="site-footer">
  <div class="wrap foot-grid">
    <div class="foot-brand">
      <a class="brand" href="/index.html"><span class="mark">✦</span> Horoscope</a>
      <p>Free, private tools for astrology, numerology and tarot — a calm space for self-discovery and reflection.</p>
    </div>
    <div class="foot-col"><h4>Tools</h4>
      <a href="/natal-chart.html">Natal Chart</a><a href="/index.html#life">Life Path Number</a>
      <a href="/index.html#sun">Sun Sign</a><a href="/index.html#tarot">Daily Tarot</a></div>
    <div class="foot-col"><h4>Zodiac</h4>
      <a href="/zodiac-signs/">All 12 Signs</a><a href="/zodiac-signs/aries/">Aries</a>
      <a href="/zodiac-signs/libra/">Libra</a><a href="/zodiac-signs/scorpio/">Scorpio</a></div>
    <div class="foot-col"><h4>Today</h4>
      <a href="/horoscope/${slug}/daily/">${sign} Today</a>
      <a href="/zodiac-signs/${slug}/">${sign} Profile</a>
      <a href="/zodiac-signs/">All Horoscopes</a></div>
  </div>
  <div class="wrap copy">© 2026 Horoscope Tools · Made for people, not for ad networks.</div>
</footer>
<script type="module" src="/js/live-transits.js"></script>
</body>
</html>
`;
}

const pos = positionsAt(NOW);
mkdirSync(OUT, { recursive: true });
let n = 0;
for (const [slug, f] of Object.entries(facts)) {
  const d = join(OUT, slug, 'daily');
  mkdirSync(d, { recursive: true });
  writeFileSync(join(d, 'index.html'), build(slug, f.name, f.idx, pos), 'utf8');
  n++;
}
console.log(`✅ 生成 ${n} 个 daily 页 · 基准时刻 ${DATE_ISO}`);
console.log(`   Sun in ${pos.Sun.sign} ${pos.Sun.degInSign.toFixed(1)}° · Moon in ${pos.Moon.sign} ${pos.Moon.degInSign.toFixed(1)}°`);
