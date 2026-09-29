# -*- coding: utf-8 -*-
"""生成 sitemap.xml + 校验脚本。"""
import os, sys, re
from datetime import date
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from signs_data import SIGNS

import os as _os
ROOT = _os.environ.get("SITE_ROOT", "/workspace/site-audit")
SITE = "https://horoscopetools.com"
DATE = date.today().isoformat()

PAGES = [
    ("/", "1.0", "daily"),
    ("/zodiac-signs/", "0.9", "weekly"),
    ("/zodiac-signs/aries/", "0.8", "weekly"),
    ("/zodiac-signs/taurus/", "0.8", "weekly"),
    ("/zodiac-signs/gemini/", "0.8", "weekly"),
    ("/zodiac-signs/cancer/", "0.8", "weekly"),
    ("/zodiac-signs/leo/", "0.8", "weekly"),
    ("/zodiac-signs/virgo/", "0.8", "weekly"),
    ("/zodiac-signs/libra/", "0.8", "weekly"),
    ("/zodiac-signs/scorpio/", "0.8", "weekly"),
    ("/zodiac-signs/sagittarius/", "0.8", "weekly"),
    ("/zodiac-signs/capricorn/", "0.8", "weekly"),
    ("/zodiac-signs/aquarius/", "0.8", "weekly"),
    ("/zodiac-signs/pisces/", "0.8", "weekly"),
    ("/horoscope/aries/daily/", "0.7", "daily"),
    ("/horoscope/taurus/daily/", "0.7", "daily"),
    ("/horoscope/gemini/daily/", "0.7", "daily"),
    ("/horoscope/cancer/daily/", "0.7", "daily"),
    ("/horoscope/leo/daily/", "0.7", "daily"),
    ("/horoscope/virgo/daily/", "0.7", "daily"),
    ("/horoscope/libra/daily/", "0.7", "daily"),
    ("/horoscope/scorpio/daily/", "0.7", "daily"),
    ("/horoscope/sagittarius/daily/", "0.7", "daily"),
    ("/horoscope/capricorn/daily/", "0.7", "daily"),
    ("/horoscope/aquarius/daily/", "0.7", "daily"),
    ("/horoscope/pisces/daily/", "0.7", "daily"),
    ("/compatibility/", "0.8", "weekly"),
]

# 12 个单星座兼容枢纽页
for _s in ["aries","taurus","gemini","cancer","leo","virgo",
           "libra","scorpio","sagittarius","capricorn","aquarius","pisces"]:
    PAGES.append((f"/compatibility/{_s}/", "0.7", "monthly"))

# 66 个唯一配对页
import itertools
_SIGNS = ["aries","taurus","gemini","cancer","leo","virgo",
          "libra","scorpio","sagittarius","capricorn","aquarius","pisces"]
for _a, _b in itertools.combinations(_SIGNS, 2):
    PAGES.append((f"/compatibility/{_a}-{_b}/", "0.6", "monthly"))
PAGES.append(("/natal-chart.html", "0.9", "monthly"))

# Discover editorial guides so new pages cannot be omitted from the sitemap.
_guides_root = os.path.join(ROOT, "guides")
if os.path.isdir(_guides_root):
    for _dirpath, _dirnames, _filenames in os.walk(_guides_root):
        if "index.html" not in _filenames:
            continue
        _rel = os.path.relpath(_dirpath, ROOT).replace(os.sep, "/")
        PAGES.append((f"/{_rel}/", "0.7", "monthly"))

xml = ['<?xml version="1.0" encoding="UTF-8"?>',
       '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
for loc, pri, freq in PAGES:
    xml += ['  <url>', f'    <loc>{SITE}{loc}</loc>',
            f'    <lastmod>{DATE}</lastmod>',
            f'    <changefreq>{freq}</changefreq>',
            f'    <priority>{pri}</priority>', '  </url>']
xml += ['</urlset>', '']

out = os.path.join(ROOT, "sitemap.xml")
open(out, "w", encoding="utf-8").write("\n".join(xml))
print(f"✅ sitemap 已生成：{len(PAGES)} 个 URL -> {out}")
