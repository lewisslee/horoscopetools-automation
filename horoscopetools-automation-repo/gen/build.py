# -*- coding: utf-8 -*-
"""星座页生成器 —— 12 页共用一套壳，内容分槽独立填。
用法： python3 build.py
输出： /workspace/site-audit/zodiac-signs/{sign}/index.html  +  /zodiac-signs/index.html
"""
import json, os, sys, html
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from signs_data import SIGNS, BY_SLUG, ORDER

import os as _os
ROOT = _os.environ.get("SITE_ROOT", "/workspace/site-audit")
OUT = os.path.join(ROOT, "zodiac-signs")
CONTENT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "content")
SITE = "https://horoscopetools.com"
DATE = "2026-09-27"

VS15 = "︎"

# ---------------------------------------------------------------- CSS
CSS = """
:root{
  --bg-0:#080611; --bg-1:#120a26; --bg-2:#1a1038;
  --gold:#f0d088; --gold-soft:#f4d58d;
  --violet:#a986ff; --violet-deep:#7c5cff;
  --text:#f3eefe; --muted:#d4ccf0; --muted-2:#aaa0d4;
  --line:rgba(169,134,255,.22);
  --glass:rgba(22,14,44,.62); --glass-2:rgba(14,9,30,.78);
  --radius:18px; --radius-sm:12px;
  --shadow:0 18px 50px rgba(0,0,0,.45);
  --font-body:"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
  --font-display:"Cinzel",Georgia,"Times New Roman",serif;
  --font-head:"Cormorant Garamond",Georgia,serif;
  --wrap:1120px;
}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;font-family:var(--font-body);color:var(--text);background:var(--bg-0);
  line-height:1.65;min-height:100vh;overflow-x:hidden;-webkit-font-smoothing:antialiased}
a{color:var(--gold-soft);text-decoration:none}
a:hover{text-decoration:underline}
.wrap{max-width:var(--wrap);margin:0 auto;padding:0 20px}
.topbar{position:sticky;top:0;z-index:50;background:var(--glass-2);
  backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid var(--line)}
.topbar-in{display:flex;align-items:center;justify-content:space-between;height:58px}
.brand{font-family:var(--font-display);font-size:1.05rem;letter-spacing:.12em;color:#fff;display:flex;align-items:center;gap:8px}
.brand:hover{text-decoration:none}
.mark{color:var(--gold)}
.topnav{display:flex;gap:20px;align-items:center}
.topnav a{color:var(--muted);font-size:.86rem;letter-spacing:.03em}
.topnav a:hover{color:var(--gold-soft);text-decoration:none}
@media(max-width:760px){.topnav .hide-s{display:none}}
.crumbs{padding:16px 0 0;font-size:.78rem;color:var(--muted-2)}
.crumbs a{color:var(--muted-2)}
.crumbs a:hover{color:var(--gold-soft)}
.crumbs span{opacity:.5;margin:0 7px}
.hero{padding:22px 0 34px;position:relative;overflow:hidden}
.hero::before{content:"";position:absolute;inset:-40% 50% auto;transform:translateX(-50%);
  width:min(900px,140vw);aspect-ratio:1;border-radius:50%;
  background:radial-gradient(circle,rgba(124,92,255,.20),transparent 62%);pointer-events:none}
.hero-in{position:relative;text-align:center}
.glyph{font-size:2.6rem;line-height:1;margin-bottom:6px;color:var(--gold);
  filter:drop-shadow(0 0 24px rgba(240,208,136,.35))}
.pg,.sg{font-family:"Segoe UI Symbol","Apple Symbols","Noto Sans Symbols 2","Noto Sans Symbols","DejaVu Sans",serif;color:var(--gold)}
.glyph,.pg,.sg{font-variant-emoji:text}
h1{font-family:var(--font-head);font-weight:700;font-size:clamp(2.6rem,11vw,4.4rem);
  line-height:1.02;margin:0 0 10px;color:#fff;text-shadow:0 4px 40px rgba(124,92,255,.45)}
.dates{font-family:var(--font-display);font-size:clamp(.86rem,3.7vw,1.3rem);
  color:var(--gold);letter-spacing:.18em;margin-bottom:6px}
@media(max-width:400px){.dates{letter-spacing:.09em}}
.tagline{color:var(--muted);max-width:56ch;margin:0 auto 26px;font-size:clamp(.95rem,2.6vw,1.02rem)}
.facts{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;max-width:660px;margin:0 auto}
@media(min-width:620px){.facts{grid-template-columns:repeat(5,1fr)}}
.fact{background:var(--glass);border:1px solid var(--line);border-radius:var(--radius-sm);padding:14px 10px;text-align:center}
@media(max-width:619px){.fact:last-child{grid-column:1/-1}}
.fact dt{font-size:.66rem;letter-spacing:.16em;text-transform:uppercase;color:var(--muted-2);margin-bottom:5px}
.fact dd{margin:0;font-size:clamp(.92rem,2.7vw,1.05rem);color:#fff;font-weight:500}
.cta-row{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-top:26px}
.btn{display:inline-block;padding:13px 24px;border-radius:999px;font-size:.92rem;font-weight:500;
  background:linear-gradient(135deg,var(--violet-deep),var(--violet));color:#fff;box-shadow:0 10px 30px rgba(124,92,255,.32)}
.btn:hover{text-decoration:none;transform:translateY(-1px)}
.btn.ghost{background:transparent;border:1px solid var(--line);color:var(--muted);box-shadow:none}
.btn.ghost:hover{color:var(--gold-soft);border-color:var(--gold)}
.jump{position:sticky;top:58px;z-index:40;background:var(--glass-2);
  backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);
  border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.jump-in{display:flex;gap:6px;overflow-x:auto;padding:9px 0;scrollbar-width:none}
.jump-in::-webkit-scrollbar{display:none}
.jump a{flex:0 0 auto;padding:7px 14px;border-radius:999px;font-size:.8rem;
  color:var(--muted);background:rgba(169,134,255,.07);white-space:nowrap}
.jump a:hover{color:var(--gold-soft);text-decoration:none;background:rgba(240,208,136,.12)}
main{padding:10px 0 60px}
section{padding:38px 0 8px;scroll-margin-top:112px}
@media(max-width:760px){section{scroll-margin-top:104px;padding:30px 0 4px}}
h2{font-family:var(--font-head);font-weight:700;font-size:clamp(1.7rem,5.4vw,2.5rem);line-height:1.14;color:#fff;margin:0 0 6px}
.eyebrow{display:inline-block;font-size:.7rem;letter-spacing:.2em;text-transform:uppercase;color:var(--gold);margin-bottom:10px}
p{color:var(--muted);font-size:clamp(1rem,2.65vw,1.055rem);margin:0 0 16px;max-width:68ch}
.lede{color:#fff;font-size:clamp(1.05rem,2.9vw,1.16rem);max-width:62ch}
strong{color:#fff;font-weight:600}
.callout{border-left:3px solid var(--gold);background:rgba(240,208,136,.07);
  border-radius:0 var(--radius-sm) var(--radius-sm) 0;padding:16px 20px;margin:22px 0}
.callout p{margin:0 0 8px;color:var(--gold-soft)}
.callout p:last-child{margin:0;color:var(--muted)}
ul{color:var(--muted);max-width:68ch;padding-left:20px;margin:0 0 18px}
li{margin-bottom:9px}
li::marker{color:var(--violet)}
.grid{display:grid;gap:12px;margin:22px 0;grid-template-columns:1fr}
@media(min-width:700px){.grid.two{grid-template-columns:1fr 1fr}}
.card{background:var(--glass);border:1px solid var(--line);border-radius:var(--radius);padding:22px}
.card h3{font-family:var(--font-head);font-size:1.3rem;color:#fff;margin:0 0 10px;font-weight:600}
.card p{margin:0;font-size:.96rem}
.table-wrap{overflow-x:auto;margin:20px 0;border:1px solid var(--line);border-radius:var(--radius);-webkit-overflow-scrolling:touch}
table{width:100%;border-collapse:collapse;min-width:440px;font-size:.9rem}
th,td{padding:13px 16px;text-align:left;border-bottom:1px solid var(--line);color:var(--muted)}
th{background:rgba(169,134,255,.09);color:#fff;font-weight:500;font-size:.8rem;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap}
tr:last-child td{border-bottom:0}
td:first-child{color:#fff;font-weight:500}
tr:hover td{background:rgba(169,134,255,.05)}
.compat{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;margin:22px 0}
.pair{background:var(--glass);border:1px solid var(--line);border-radius:var(--radius-sm);
  padding:14px;display:flex;align-items:center;gap:11px;transition:.18s}
.pair:hover{border-color:var(--gold);transform:translateY(-2px);text-decoration:none}
.pair .pg{font-size:1.5rem;line-height:1}
.pair .pn{color:#fff;font-size:.94rem;display:block}
.pair .pl{color:var(--muted-2);font-size:.76rem}
.pair.good{border-color:rgba(240,208,136,.42);background:rgba(240,208,136,.07)}
.pair.push{border-color:rgba(169,134,255,.42)}
.faq-item{border-bottom:1px solid var(--line);padding:18px 0}
.faq-item:last-child{border-bottom:0}
.faq-q{font-family:var(--font-head);font-size:clamp(1.08rem,3.2vw,1.28rem);color:#fff;font-weight:600;margin:0 0 8px}
.faq-a{color:var(--muted);margin:0;max-width:70ch}
.signgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(112px,1fr));gap:9px;margin:22px 0}
.signgrid a{display:block;text-align:center;padding:14px 6px;border-radius:var(--radius-sm);
  background:var(--glass);border:1px solid var(--line);color:var(--muted);font-size:.82rem}
.signgrid a:hover{text-decoration:none;border-color:var(--gold);color:var(--gold-soft)}
.signgrid .sg{display:block;font-size:1.4rem;line-height:1.2;margin-bottom:5px}
.signgrid .cur{color:var(--gold);border-color:var(--gold);background:rgba(240,208,136,.09)}
.site-footer{border-top:1px solid var(--line);background:var(--bg-1);padding:40px 0 30px;margin-top:40px}
.foot-grid{display:grid;gap:26px;grid-template-columns:1fr}
@media(min-width:700px){.foot-grid{grid-template-columns:2fr 1fr 1fr 1fr}}
.foot-brand p{color:var(--muted-2);font-size:.88rem;margin:10px 0 0;max-width:38ch}
.foot-col h4{font-family:var(--font-display);font-size:.8rem;letter-spacing:.14em;text-transform:uppercase;color:var(--gold);margin:0 0 12px}
.foot-col a{display:block;color:var(--muted);font-size:.88rem;margin-bottom:9px}
.foot-col a:hover{color:var(--gold-soft)}
.copy{margin-top:30px;padding-top:18px;border-top:1px solid var(--line);color:var(--muted-2);font-size:.8rem;text-align:center}
"""

SECTIONS = [
    ("overview", "01 — Overview", "What {name} actually is"),
    ("traits",  "02 — Personality", "{name} personality traits"),
    ("love",    "03 — Love &amp; Sex", "{name} in love"),
    ("friends", "04 — Friends &amp; Family", "{name} with friends and family"),
    ("career",  "05 — Career &amp; Money", "{name} career strengths and money"),
    ("man",     "06 — {name} Man", "The {name} man"),
    ("woman",   "07 — {name} Woman", "The {name} woman"),
]


def slugify_name(n):
    return n.lower()


def sign_link(n, cls="", extra=""):
    s = BY_SLUG[slugify_name(n)]
    return f'<a class="{cls}" href="/zodiac-signs/{s["slug"]}/"{extra}><span class="pg">{s["glyph"]}{VS15}</span><span><span class="pn">{s["name"]}</span>{extra and "" or ""}</span></a>'


def build_page(s, c):
    n = s["name"]
    g = s["glyph"] + VS15
    url = f"{SITE}/zodiac-signs/{s['slug']}/"
    title = f"{n} Zodiac Sign: Dates, Traits, Compatibility &amp; Today"
    desc = (f"{n} runs {s['dates']}. {s['element']} sign, {s['modality'].lower()} modality, "
            f"ruled by {s['ruler']}. Get {n} personality traits, love compatibility, "
            f"career strengths and today's {n} horoscope.")

    # ---- JSON-LD ----
    faq_items = []
    for f in c["faq"]:
        faq_items.append({"@type": "Question", "name": f["q"],
                          "acceptedAnswer": {"@type": "Answer", "text": f["a"]}})
    ld = {
        "@context": "https://schema.org",
        "@graph": [
            {"@type": "BreadcrumbList", "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{SITE}/"},
                {"@type": "ListItem", "position": 2, "name": "Zodiac Signs", "item": f"{SITE}/zodiac-signs/"},
                {"@type": "ListItem", "position": 3, "name": n, "item": url}]},
            {"@type": "Article", "headline": f"{n} Zodiac Sign: Dates, Traits, Compatibility & Today",
             "description": f"The complete {n} guide — dates, personality, love, career and today's reading.",
             "dateModified": DATE, "datePublished": DATE,
             "author": {"@type": "Organization", "name": "Horoscope Tools"},
             "publisher": {"@type": "Organization", "name": "Horoscope Tools"},
             "mainEntityOfPage": url, "image": f"{SITE}/og-{s['slug']}.png"},
            {"@type": "FAQPage", "mainEntity": faq_items},
        ],
    }

    def P(t, cls=""):
        return f'<p{"" if not cls else f" class={cls!r}"}>{t}</p>'

    # ---- jump nav ----
    jump = "".join(f'<a href="#{sid}">{lbl.format(name=n)}</a>' for sid, lbl, _ in SECTIONS)
    jump += '<a href="#compatibility">Compatibility</a><a href="#cusp">Cusp Days</a><a href="#faq">FAQ</a>'

    # ---- body sections ----
    b = []
    b.append(f'<section id="overview"><span class="eyebrow">01 — Overview</span>'
             f'<h2>What {n} actually is</h2>')
    ov = c["overview"]
    b.append(P(ov[0], "lede"))
    for t in ov[1:]:
        b.append(P(t))
    b.append(f'<div class="callout"><p><strong>{c["callout_title"]}</strong></p>'
             f'<p>{c["callout_text"]}</p></div></section>')

    b.append(f'<section id="traits"><span class="eyebrow">02 — Personality</span>'
             f'<h2>{n} personality traits</h2>')
    b.append(P(c["traits_lede"]))
    sl = "".join(f"<li>{x}</li>" for x in c["strengths"])
    wl = "".join(f"<li>{x}</li>" for x in c["weaknesses"])
    b.append(f'<div class="grid two">'
             f'<div class="card"><h3>{g} Strengths</h3><ul>{sl}</ul></div>'
             f'<div class="card"><h3>{g} Weaknesses</h3><ul>{wl}</ul></div></div></section>')

    b.append(f'<section id="love"><span class="eyebrow">03 — Love &amp; Sex</span>'
             f'<h2>{n} in love</h2>')
    b.append(P(c["love_lede"], "lede"))
    b.append("".join(P(t) for t in c["love"]))
    b.append("</section>")

    b.append(f'<section id="friends"><span class="eyebrow">04 — Friends &amp; Family</span>'
             f'<h2>{n} with friends and family</h2>')
    b.append("".join(P(t) for t in c["friends"]))
    b.append("</section>")

    # career + 12 表
    rows = "".join(
        f'<tr><td>{x["glyph"]}{VS15} {x["name"]}{" <b>" if x["slug"]==s["slug"] else ""}</td>'
        f'<td>{x["dates_short"]}</td><td>{x["element"]}</td>'
        f'<td>{x["modality"]}</td><td>{x["ruler"]}{"</b>" if x["slug"]==s["slug"] else ""}</td></tr>'
        for x in SIGNS)
    b.append(f'<section id="career"><span class="eyebrow">05 — Career &amp; Money</span>'
             f'<h2>{n} career strengths and money</h2>')
    b.append("".join(P(t) for t in c["career"]))
    b.append('<div class="table-wrap"><table><thead><tr><th>Sign</th><th>Dates</th>'
             '<th>Element</th><th>Modality</th><th>Ruler</th></tr></thead>'
             f'<tbody>{rows}</tbody></table></div></section>')

    b.append(f'<section id="man"><span class="eyebrow">06 — {n} Man</span>'
             f'<h2>The {n} man</h2>' + "".join(P(t) for t in c["man"]) + "</section>")
    b.append(f'<section id="woman"><span class="eyebrow">07 — {n} Woman</span>'
             f'<h2>The {n} woman</h2>' + "".join(P(t) for t in c["woman"]) + "</section>")

    # compatibility
    def pairs(names, cls, labels):
        out = []
        for nm, lb in zip(names, labels):
            t = BY_SLUG[slugify_name(nm)]
            out.append(f'<a class="pair {cls}" href="/zodiac-signs/{t["slug"]}/">'
                       f'<span class="pg">{t["glyph"]}{VS15}</span>'
                       f'<span><span class="pn">{t["name"]}</span>'
                       f'<span class="pl">{lb}</span></span></a>')
        return "".join(out)
    gl = ["Same element · easiest", "Same element · most freedom", "Mirror · deep but static"]
    pl_ = [f"Opposite · magnetic tension", "Water · different logic", "Cardinal · direct vs. measured"]
    b.append(f'<section id="compatibility"><span class="eyebrow">08 — Compatibility</span>'
             f'<h2>{n} compatibility</h2>')
    b.append(P(f"Compatibility here means <em>ease of understanding</em>, not likelihood of "
               f"staying together. The best matches are the ones that need no translation; "
               f"the best lessons usually come from the signs that push {n} to have a preference at all."))
    b.append('<h3 style="font-family:var(--font-head);font-size:1.3rem;color:#fff;margin:26px 0 4px">Natural fit</h3>')
    b.append(f'<div class="compat">{pairs(c["compat_good"],"good",gl)}</div>')
    b.append('<h3 style="font-family:var(--font-head);font-size:1.3rem;color:#fff;margin:26px 0 4px">Opposite &amp; challenging</h3>')
    b.append(f'<div class="compat">{pairs(c["compat_push"],"push",pl_)}</div></section>')

    # cusp —— 共享样板 + 星座日期注入
    b.append(f'<section id="cusp"><span class="eyebrow">09 — Cusp Days</span>'
             f'<h2>If you were born on a {n} cusp day</h2>')
    b.append(P(f"Roughly 10% of people are born within a day of a sign boundary, and they are the "
               f"most commonly mislabelled people in astrology. {s['dates']} is not an arbitrary "
               f"cutoff on a calendar."))
    b.append(P("The Sun changes sign at a <strong>precise astronomical moment</strong>, and that "
               "moment shifts by up to about 18 hours from year to year. Two people born on the same "
               "calendar date in different years — or the same year in different cities — can fall on "
               "opposite sides of the line. If your birthday lands within a day of a boundary, your "
               "birth time and birthplace actually decide the answer."))
    b.append(P("A useful tell: <strong>if you don't recognise the sign description</strong>, don't "
               "fight it. Check the real chart instead of guessing."))
    b.append('<div class="cta-row" style="justify-content:flex-start;margin-top:8px">'
             '<a class="btn" href="/natal-chart.html">Open Free Natal Chart</a></div></section>')

    # FAQ
    b.append(f'<section id="faq"><span class="eyebrow">10 — FAQ</span>'
             f'<h2>{n} questions, answered</h2>')
    for f in c["faq"]:
        b.append(f'<div class="faq-item"><p class="faq-q">{f["q"]}</p>'
                 f'<p class="faq-a">{f["a"]}</p></div>')
    b.append("</section>")

    # 12 星座内链网
    grid = "".join(
        f'<a href="/zodiac-signs/{x["slug"]}/" class="{"cur" if x["slug"]==s["slug"] else ""}">'
        f'<span class="sg">{x["glyph"]}{VS15}</span>{x["name"]}</a>' for x in SIGNS)
    b.append(f'<section id="all-signs"><span class="eyebrow">— All 12</span>'
             f'<h2>Explore every zodiac sign</h2><div class="signgrid">{grid}</div></section>')

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<title>{n} Zodiac Sign: Dates, Traits, Compatibility &amp; Today</title>
<meta name="description" content="{desc}" />
<link rel="canonical" href="{url}" />
<meta property="og:title" content="{n} Zodiac Sign: Dates, Traits, Compatibility &amp; Today" />
<meta property="og:description" content="{s['element']} sign · {s['modality']} · Ruled by {s['ruler']}. The complete {n} guide." />
<meta property="og:type" content="article" />
<meta property="og:url" content="{url}" />
<meta property="og:image" content="{SITE}/og-{s['slug']}.png" />
<meta name="twitter:card" content="summary_large_image" />
<script type="application/ld+json">
{json.dumps(ld, ensure_ascii=False, indent=2)}
</script>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cormorant+Garamond:wght@500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
<style>{CSS}</style>
</head>
<body>
<div class="topbar"><div class="wrap topbar-in">
  <a class="brand" href="/index.html"><span class="mark">✦</span> Horoscope</a>
  <nav class="topnav">
    <a href="/zodiac-signs/">Zodiac Signs</a>
    <a class="hide-s" href="/natal-chart.html">Natal Chart</a>
    <a class="hide-s" href="/index.html#life">Life Path</a>
    <a class="hide-s" href="/index.html#tarot">Tarot</a>
  </nav>
</div></div>
<main>
  <div class="wrap"><nav class="crumbs" aria-label="Breadcrumb">
    <a href="/index.html">Home</a><span>/</span>
    <a href="/zodiac-signs/">Zodiac Signs</a><span>/</span>
    <b style="color:var(--muted);font-weight:400">{n}</b>
  </nav></div>
  <header class="hero"><div class="wrap hero-in">
    <div class="glyph" aria-hidden="true">{g}</div>
    <h1>{n}</h1>
    <p class="dates">{s['dates'].upper()}</p>
    <p class="tagline">{c['tagline']}</p>
    <dl class="facts">
      <div class="fact"><dt>Element</dt><dd>{s['element']}</dd></div>
      <div class="fact"><dt>Modality</dt><dd>{s['modality']}</dd></div>
      <div class="fact"><dt>Ruler</dt><dd>{s['ruler']}</dd></div>
      <div class="fact"><dt>Opposite</dt><dd>{s['opposite']}</dd></div>
      <div class="fact"><dt>Birthstone</dt><dd>{s['birthstone']}</dd></div>
    </dl>
    <div class="cta-row">
      <a class="btn" href="/horoscope/{s['slug']}/daily/">Today's {n} Horoscope</a>
      <a class="btn ghost" href="/natal-chart.html">Check My Real Chart</a>
    </div>
  </div></header>
  <nav class="jump" aria-label="Section navigation"><div class="wrap jump-in">{jump}</div></nav>
  <div class="wrap">
{''.join(b)}
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
      <a href="/zodiac-signs/">All 12 Signs</a>
      <a href="/zodiac-signs/aries/">Aries</a><a href="/zodiac-signs/libra/">Libra</a>
      <a href="/zodiac-signs/scorpio/">Scorpio</a></div>
    <div class="foot-col"><h4>Learn</h4>
      <a href="/zodiac-signs/{s['slug']}/#faq">FAQ</a><a href="/zodiac-signs/{s['slug']}/#cusp">Cusp Days</a>
      <a href="/zodiac-signs/{s['slug']}/#compatibility">Compatibility</a></div>
  </div>
  <div class="wrap copy">© 2026 Horoscope Tools · Made for people, not for ad networks.</div>
</footer>
</body>
</html>
"""


def main():
    made, missing = [], []
    for s in SIGNS:
        p = os.path.join(CONTENT, s["slug"] + ".json")
        if not os.path.exists(p):
            missing.append(s["slug"]); continue
        c = json.load(open(p, encoding="utf-8"))
        d = os.path.join(OUT, s["slug"])
        os.makedirs(d, exist_ok=True)
        open(os.path.join(d, "index.html"), "w", encoding="utf-8").write(build_page(s, c))
        made.append(s["slug"])
    print("已生成:", len(made), made)
    if missing:
        print("缺内容:", missing)
    return missing


if __name__ == "__main__":
    main()
