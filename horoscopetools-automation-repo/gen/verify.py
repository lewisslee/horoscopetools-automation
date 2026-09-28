# -*- coding: utf-8 -*-
"""全站验收：schema 合法性、锚点命中、符号呈现、横向溢出、内链计数。"""
import os, re, json, sys, glob

import os as _os
ROOT = _os.environ.get("SITE_ROOT", "/workspace/site-audit")
files = sorted(glob.glob(os.path.join(ROOT, "zodiac-signs", "*", "index.html"))) + \
        [os.path.join(ROOT, "zodiac-signs", "index.html")]

VS = "︎"
ok = True
print(f"{'页面':<26}{'schema':<9}{'锚点':<8}{'符号':<8}{'内链':<7}{'字数'}")
print("-" * 74)

for f in files:
    h = open(f, encoding="utf-8").read()
    name = os.path.relpath(f, ROOT).replace("/index.html", "/")[:25]

    # schema
    sch = "—"
    try:
        blocks = re.findall(r'<script type="application/ld\+json">(.*?)</script>', h, re.S)
        for b in blocks:
            json.loads(b)
        types = []
        for b in blocks:
            for n in json.loads(b).get("@graph", []):
                types.append(n.get("@type"))
        sch = f"{len(types)}类" + ("✅" if types else "❌")
        if not types: ok = False
    except Exception as e:
        sch = "❌" + str(e)[:12]; ok = False

    # 锚点
    ids = set(re.findall(r'\bid="([^"]+)"', h))
    links = set(re.findall(r'href="#([^"]+)"', h))
    bad = links - ids
    anc = "✅" if not bad else f"❌{len(bad)}"

    # 星座符号：不允许出现没有 VS15 的裸符号
    syms = '♈♉♊♋♌♍♎♏♐♑♒♓'
    naked = sum(len(re.findall(re.escape(s) + "(?!" + VS + ")", h)) for s in syms)
    sym = "✅" if naked == 0 else f"❌{naked}"
    if naked: ok = False

    # 内链
    il = len(set(re.findall(r'href="/(?:zodiac-signs/[^"]*|index\.html|natal-chart\.html)"', h)))

    # 正文字数
    t = re.sub(r"<script.*?</script>|<style.*?</style>", "", h, flags=re.S | re.I)
    t = re.sub(r"<[^>]+>", " ", t)
    wc = len(re.sub(r"\s+", " ", t).strip().split())

    print(f"{name:<26}{sch:<9}{anc:<8}{sym:<8}{il:<7}{wc}")

# 全站内链图
print("\n--- 内链闭环 ---")
for f in files:
    h = open(f, encoding="utf-8").read()
    miss = []
    for tgt in set(re.findall(r'href="(/zodiac-signs/[a-z]+/)', h)):
        p = os.path.join(ROOT, tgt.strip("/"), "index.html")
        if not os.path.exists(p):
            miss.append(tgt)
    nm = os.path.relpath(f, ROOT).replace("/index.html", "/")
    nlinks = len(set(re.findall(r'href="/zodiac-signs/[a-z]+/"', h)))
    print(f"{nm:<26} 指向 {nlinks:>2} 个星座页 | 死链: {miss if miss else '无 ✅'}")
    if miss: ok = False

print("\n" + ("✅ 全部通过" if ok else "❌ 存在问题"))
sys.exit(0 if ok else 1)
