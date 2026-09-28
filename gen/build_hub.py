# -*- coding: utf-8 -*-
"""生成 /zodiac-signs/ 聚合页 —— 主攻 "zodiac signs" / "zodiac signs dates" 82.3万"""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from signs_data import SIGNS
from build import CSS, SITE, VS15, DATE

import os as _os
OUT = _os.environ.get("SITE_ROOT", "/workspace/site-audit") + "/zodiac-signs/index.html"

FAQ = [
    ("What are the 12 zodiac signs in order?",
     "Starting from the March equinox: Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, "
     "Sagittarius, Capricorn, Aquarius and Pisces. The cycle begins with Aries because the First Point "
     "of Aries is the spring equinox point, the place the Sun crosses the celestial equator."),
    ("What are the zodiac sign dates?",
     "Aries Mar 21-Apr 19, Taurus Apr 20-May 20, Gemini May 21-Jun 20, Cancer Jun 21-Jul 22, "
     "Leo Jul 23-Aug 22, Virgo Aug 23-Sep 22, Libra Sep 23-Oct 22, Scorpio Oct 23-Nov 21, "
     "Sagittarius Nov 22-Dec 21, Capricorn Dec 22-Jan 19, Aquarius Jan 20-Feb 18, Pisces Feb 19-Mar 20. "
     "These are approximate — the Sun changes sign at a precise astronomical moment, not at midnight."),
    ("What are the 4 elements in astrology?",
     "Fire (Aries, Leo, Sagittarius), Earth (Taurus, Virgo, Capricorn), Air (Gemini, Libra, Aquarius) "
     "and Water (Cancer, Scorpio, Pisces). Element describes how a sign processes experience. Fire acts, "
     "Earth builds, Air connects, Water feels."),
    ("What are the 3 modalities?",
     "Cardinal (Aries, Cancer, Libra, Capricorn) initiates. Fixed (Taurus, Leo, Scorpio, Aquarius) "
     "sustains. Mutable (Gemini, Virgo, Sagittarius, Pisces) adapts. Every sign is one element and one "
     "modality, which is why there are exactly twelve."),
    ("What is the difference between the zodiac and a birth chart?",
     "The zodiac is the twelve 30-degree divisions of the ecliptic and the character assigned to each. "
     "A birth chart maps every planet to those divisions at your exact birth moment, plus your Ascendant, "
     "which usually describes you better than the Sun sign does."),
    ("Is the zodiac astronomy or astrology?",
     "The ecliptic and the twelve 30-degree segments are real astronomical divisions of the Sun's path. "
     "The personality meanings attached to them are astrological tradition, not scientific finding, and "
     "have been treated as pseudoscience since the 18th century. This site presents the tradition as "
     "tradition, and the astronomy as astronomy."),
]

ld = {
    "@context": "https://schema.org",
    "@graph": [
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{SITE}/"},
            {"@type": "ListItem", "position": 2, "name": "Zodiac Signs", "item": f"{SITE}/zodiac-signs/"}]},
        {"@type": "Article",
         "headline": "The 12 Zodiac Signs: Dates, Elements, Modalities & Traits",
         "description": "All twelve zodiac signs with dates, elements, modalities, ruling planets and personality traits.",
         "dateModified": DATE, "datePublished": DATE,
         "author": {"@type": "Organization", "name": "Horoscope Tools"},
         "publisher": {"@type": "Organization", "name": "Horoscope Tools"},
         "mainEntityOfPage": f"{SITE}/zodiac-signs/",
         "image": f"{SITE}/og-zodiac-signs.png"},
        {"@type": "FAQPage", "mainEntity": [
            {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}}
            for q, a in FAQ]},
    ],
}

rows = "".join(
    f'<tr><td><a href="/zodiac-signs/{s["slug"]}/"><span class="pg">{s["glyph"]}{VS15}</span> {s["name"]}</a></td>'
    f'<td>{s["dates_short"]}</td><td>{s["element"]}</td><td>{s["modality"]}</td>'
    f'<td>{s["ruler"]}</td><td>{s["symbol"]}</td></tr>' for s in SIGNS)

cards = "".join(
    f'<a class="scard" href="/zodiac-signs/{s["slug"]}/">'
    f'<span class="sg">{s["glyph"]}{VS15}</span>'
    f'<span class="sn">{s["name"]}</span>'
    f'<span class="sd">{s["dates_short"]}</span>'
    f'<span class="st">{s["element"]} · {s["modality"]} · {s["ruler"]}</span></a>' for s in SIGNS)

elem_cards = "".join(
    f'<div class="card"><h3>{g} {t}</h3><p>{d}</p><p class="signs">{m}</p></div>'
    for g, t, d, m in [
        ("🔥", "Fire", "Acts before thinking. Warm, fast, convinced — and impatient with anything that slows the impulse down.", "Aries · Leo · Sagittarius"),
        ("🌍", "Earth", "Builds before speaking. Patient, concrete, loyal to what already works — and slow to unmake it.", "Taurus · Virgo · Capricorn"),
        ("🌬", "Air", "Thinks out loud. Social, curious, fluent in ideas — and prone to talking instead of committing.", "Gemini · Libra · Aquarius"),
        ("💧", "Water", "Feels first and reasons later. Deep, intuitive, protective — and prone to absorbing what isn't theirs.", "Cancer · Scorpio · Pisces"),
    ])

faq_html = "".join(
    f'<div class="faq-item"><p class="faq-q">{q}</p><p class="faq-a">{a}</p></div>' for q, a in FAQ)

EXTRA = """
.scards{display:grid;grid-template-columns:repeat(auto-fill,minmax(158px,1fr));gap:11px;margin:24px 0}
.scard{display:block;text-align:center;padding:20px 12px;border-radius:var(--radius);
  background:var(--glass);border:1px solid var(--line);color:var(--muted)}
.scard:hover{text-decoration:none;border-color:var(--gold);transform:translateY(-2px)}
.scard .sg{display:block;font-size:1.9rem;line-height:1.15;margin-bottom:7px}
.scard .sn{display:block;color:#fff;font-size:1.02rem;font-weight:500;margin-bottom:4px}
.scard .sd{display:block;font-size:.76rem;color:var(--gold);letter-spacing:.08em;margin-bottom:5px}
.scard .st{display:block;font-size:.72rem;color:var(--muted-2);line-height:1.4}
.grid.elem{grid-template-columns:1fr}
@media(min-width:760px){.grid.elem{grid-template-columns:1fr 1fr}}
.card .signs{color:var(--gold);font-size:.82rem;letter-spacing:.06em;margin-top:9px}
th:last-child,td:last-child{white-space:nowrap}
td a{display:inline-flex;align-items:center;gap:7px}
"""

page = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<title>The 12 Zodiac Signs: Dates, Elements, Modalities &amp; Traits</title>
<meta name="description" content="All 12 zodiac signs with dates, elements, modalities, ruling planets and traits. Aries Mar 21-Apr 19 through Pisces Feb 19-Mar 20, with links to every sign's full guide." />
<link rel="canonical" href="{SITE}/zodiac-signs/" />
<meta property="og:title" content="The 12 Zodiac Signs: Dates, Elements, Modalities &amp; Traits" />
<meta property="og:description" content="Every sign, every date, element, modality and ruler — plus the full guide to each." />
<meta property="og:type" content="article" />
<meta property="og:url" content="{SITE}/zodiac-signs/" />
<meta property="og:image" content="{SITE}/og-zodiac-signs.png" />
<meta name="twitter:card" content="summary_large_image" />
<script type="application/ld+json">
{json.dumps(ld, ensure_ascii=False, indent=2)}
</script>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cormorant+Garamond:wght@500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
<style>{CSS}{EXTRA}</style>
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
    <a href="/index.html">Home</a><span>/</span><b style="color:var(--muted);font-weight:400">Zodiac Signs</b>
  </nav></div>

  <header class="hero"><div class="wrap hero-in">
    <div class="glyph" aria-hidden="true">☉</div>
    <h1>The 12 Zodiac Signs</h1>
    <p class="dates">DATES · ELEMENTS · MODALITIES · RULERS</p>
    <p class="tagline">Twelve 30-degree slices of the Sun's yearly path, and the long tradition of
      character assigned to each. Every sign has a date range, an element, a modality, a ruler and a
      full guide — all on this page.</p>
    <div class="cta-row">
      <a class="btn" href="#all">Jump to all 12</a>
      <a class="btn ghost" href="/natal-chart.html">Find My Real Sign</a>
    </div>
  </div></header>

  <nav class="jump" aria-label="Section navigation"><div class="wrap jump-in">
    <a href="#all">All 12 Signs</a><a href="#dates">Full Table</a><a href="#elements">4 Elements</a>
    <a href="#order">Order</a><a href="#cusp">Cusp Days</a><a href="#faq">FAQ</a>
  </div></nav>

  <div class="wrap">
    <section id="all">
      <span class="eyebrow">01 — All 12</span>
      <h2>Every sign, in zodiac order</h2>
      <p class="lede">The cycle runs Aries to Pisces, starting from the spring equinox. Tap any sign
        for its full profile — personality, love, career and a daily horoscope.</p>
      <div class="scards">{cards}</div>
    </section>

    <section id="dates">
      <span class="eyebrow">02 — The Table</span>
      <h2>Zodiac sign dates, elements and rulers</h2>
      <p>The complete reference in one table. Each combination is unique — twelve signs is twelve
        different element-and-modality pairings, which is exactly why there are twelve.</p>
      <div class="table-wrap"><table>
        <thead><tr><th>Sign</th><th>Dates</th><th>Element</th><th>Modality</th><th>Ruler</th><th>Symbol</th></tr></thead>
        <tbody>{rows}</tbody>
      </table></div>
      <div class="callout"><p><strong>These dates are approximate</strong></p>
        <p>The Sun does not change sign at midnight. It changes at a precise astronomical moment, and
        that moment drifts by up to about 18 hours year to year. If your birthday falls within a day
        of a boundary, your birth time and birthplace decide the answer — not the calendar.</p></div>
    </section>

    <section id="elements">
      <span class="eyebrow">03 — Elements</span>
      <h2>The four elements</h2>
      <p>Every sign carries one of four elements, and it describes how that sign processes the world
        rather than whether it succeeds at anything.</p>
      <div class="grid elem">{elem_cards}</div>
    </section>

    <section id="order">
      <span class="eyebrow">04 — Modalities</span>
      <h2>Cardinal, fixed, mutable</h2>
      <p>Element says <em>how</em> a sign processes; modality says <em>when</em> it acts. Cardinal
        signs start things, fixed signs hold them, mutable signs change them. Together they make four
        columns of three, which is the whole architecture of the zodiac.</p>
      <ul>
        <li><strong>Cardinal</strong> — Aries, Cancer, Libra, Capricorn. They initiate. The energy
          of beginning something that didn't exist last season.</li>
        <li><strong>Fixed</strong> — Taurus, Leo, Scorpio, Aquarius. They sustain. The energy of
          holding a position long enough for it to cost something.</li>
        <li><strong>Mutable</strong> — Gemini, Virgo, Sagittarius, Pisces. They adapt. The energy
          of reshaping the plan when circumstances won't hold still.</li>
      </ul>
      <p class="lede" style="margin-top:24px">The two systems together give each sign a distinct
        problem. Taurus is fixed earth — a bull holding a position about material things. Sagittarius
        is mutable fire — a flame that keeps changing shape. Same element, opposite behaviour; same
        modality, different material. That is the whole grid.</p>
    </section>

    <section id="cusp">
      <span class="eyebrow">05 — Boundary Days</span>
      <h2>Born on a cusp? Check the real chart</h2>
      <p>About 10% of people are born within a day of a sign boundary — the last day of one sign or
        the first of the next. These are the most commonly mislabelled people in astrology, and it is
        not because anyone is careless. The Sun's crossing point is an astronomical event with a
        timestamp, and that timestamp moves.</p>
      <p>The useful move is to stop guessing from the calendar. Your birth time and birthplace give
        the real answer, including which sign was actually rising on the eastern horizon at that
        moment — usually a better description of how you operate than the Sun sign is.</p>
      <div class="cta-row" style="justify-content:flex-start;margin-top:8px">
        <a class="btn" href="/natal-chart.html">Open Free Natal Chart</a></div>
    </section>

    <section id="faq">
      <span class="eyebrow">06 — FAQ</span>
      <h2>Zodiac questions, answered</h2>
      {faq_html}
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
    <div class="foot-col"><h4>Learn</h4>
      <a href="/zodiac-signs/#faq">FAQ</a><a href="/zodiac-signs/#cusp">Cusp Days</a>
      <a href="/zodiac-signs/#elements">Elements</a></div>
  </div>
  <div class="wrap copy">© 2026 Horoscope Tools · Made for people, not for ad networks.</div>
</footer>
</body>
</html>
"""

os.makedirs(os.path.dirname(OUT), exist_ok=True)
open(OUT, "w", encoding="utf-8").write(page)
print("✅ 聚合页已生成:", OUT, os.path.getsize(OUT), "字节")
