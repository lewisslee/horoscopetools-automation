# -*- coding: utf-8 -*-
"""Generate sitemap.xml for generated pages and editorial pages."""
import itertools
import os
from datetime import date

ROOT = os.environ.get("SITE_ROOT", "/workspace/site-audit")
SITE = "https://horoscopetools.com"
DATE = date.today().isoformat()
SIGNS = ["aries","taurus","gemini","cancer","leo","virgo","libra","scorpio","sagittarius","capricorn","aquarius","pisces"]

PAGES = [("/", "1.0", "daily"), ("/zodiac-signs/", "0.9", "weekly")]
for sign in SIGNS:
    PAGES.append((f"/zodiac-signs/{sign}/", "0.8", "weekly"))
for sign in SIGNS:
    PAGES.append((f"/horoscope/{sign}/daily/", "0.7", "daily"))
PAGES.append(("/compatibility/", "0.8", "weekly"))
for sign in SIGNS:
    PAGES.append((f"/compatibility/{sign}/", "0.7", "monthly"))
for first, second in itertools.combinations(SIGNS, 2):
    PAGES.append((f"/compatibility/{first}-{second}/", "0.6", "monthly"))
PAGES.append(("/natal-chart.html", "0.9", "monthly"))

# Discover hand-authored editorial pages without duplicating generated sections.
for collection in ("guides", "stellium", "composite-chart", "saturn-return-meaning", "lilith-placement", "north-node-sign", "chiron-placement", "north-node", "north-node-calculator"):
    collection_root = os.path.join(ROOT, collection)
    if not os.path.isdir(collection_root):
        continue
    for dirpath, _dirnames, filenames in os.walk(collection_root):
        if "index.html" not in filenames:
            continue
        rel = os.path.relpath(dirpath, ROOT).replace(os.sep, "/")
        PAGES.append((f"/{rel}/", "0.7", "monthly"))

xml = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
for loc, priority, frequency in PAGES:
    xml.extend(["  <url>", f"    <loc>{SITE}{loc}</loc>", f"    <lastmod>{DATE}</lastmod>", f"    <changefreq>{frequency}</changefreq>", f"    <priority>{priority}</priority>", "  </url>"])
xml.extend(["</urlset>", ""])
out = os.path.join(ROOT, "sitemap.xml")
with open(out, "w", encoding="utf-8") as handle:
    handle.write("\n".join(xml))
print(f"✅ sitemap 已生成：{len(PAGES)} 个 URL -> {out}")
