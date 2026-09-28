#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# horoscopetools.com 每日重建
#
#   src/  →  build/  →  (Cloudflare Pages)
#
# 每天做的事：
#   1. 把 site/ 拷进 build/（页面源文件不会被重生成）
#   2. 重算 12 个 horoscope daily 页（真实星历）
#   3. 重算 79 个 compatibility 页（真实星历 + 透明计分）
#   4. 重建 sitemap
#   5. 校验；失败即中止，不部署
#   6. Wrangler 推送（未配置凭据时自动跳过）
#
# 路径全部相对脚本自身目录，可任意位置运行。
# ─────────────────────────────────────────────────────────────
set -euo pipefail

if [ "${1:-}" = "--no-deploy" ]; then
  export SKIP_DEPLOY=1
fi

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$HERE"

SRC="$HERE/site"
BUILD="$HERE/build"
DAY="$(TZ=Asia/Shanghai date +%Y-%m-%d)"
STAMP="${DAY}T06:00:00Z"
export SITE_ROOT="$BUILD"

echo "════════════════════════════════════════════"
echo "  每日重建  $DAY"
echo "════════════════════════════════════════════"

# ── 1. 准备构建目录 ──────────────────────────────
echo "▸ 准备 build/"
rm -rf "$BUILD"
mkdir -p "$BUILD"
cp -r "$SRC/." "$BUILD/"
# 星座内容源：build.py 需要它来生成 zodiac-signs/
mkdir -p "$BUILD/gen/content"
cp -r "$HERE/gen/content/." "$BUILD/gen/content/"
# build_hub.py / build.py 从已生成的星座页取 CSS
mkdir -p "$BUILD/zodiac-signs"

# ── 2. 12 星座页 + 聚合页 ─────────────────────────
echo "▸ 13 星座内容页"
( cd gen && python3 build.py )
( cd gen && python3 build_hub.py )

# ── 3. 12 个 daily 页（真实星历）─────────────────
echo "▸ 12 个 daily 页"
( cd eph && BUILD_DATE="$STAMP" node build_daily.mjs )

# ── 4. 79 个 compatibility 页 ─────────────────────
echo "▸ 79 个 compatibility 页"
( cd eph && BUILD_DATE="$STAMP" node build_compat.mjs )

# ── 5. sitemap ────────────────────────────────────
echo "▸ sitemap"
( cd gen && python3 build_sitemap.py )

# ── 6. 校验（失败即中止，绝不部署坏版本）───────────
echo "▸ 校验"
FAIL=0
( cd eph && node vd.mjs | tail -2 ) || FAIL=1
( cd eph && node vc.mjs | tail -2 ) || FAIL=1
URLS=$(grep -c '<loc>' "$BUILD/sitemap.xml")
DAILY=$(find "$BUILD/horoscope" -name index.html | wc -l)
COMPAT=$(find "$BUILD/compatibility" -name index.html | wc -l)
SIGNS=$(find "$BUILD/zodiac-signs" -name index.html | wc -l)
echo "   daily: $DAILY · compatibility: $COMPAT · zodiac-signs: $SIGNS"
echo "   sitemap URL 数: $URLS"
if [ "$DAILY" -ne 12 ] || [ "$COMPAT" -ne 79 ] || [ "$SIGNS" -ne 13 ] || [ "$URLS" -ne 106 ]; then
  echo "❌ 产物数量不正确，终止部署。"
  exit 1
fi
if [ -e "$BUILD/_DONOT_UPLOAD" ] || [ -e "$BUILD/index.html.bak" ]; then
  echo "❌ build/ 含禁止上传文件，终止部署。"
  exit 1
fi
if [ "$FAIL" -ne 0 ]; then
  echo ""
  echo "❌ 校验未通过，终止部署。线上保持旧版本。"
  exit 1
fi

# ── 7. 部署 ───────────────────────────────────────
if [ -n "${SKIP_DEPLOY:-}" ]; then
  echo ""; echo "✅ 构建完成（未部署）· build/ 目录就绪"
  exit 0
fi

if [ -z "${CLOUDFLARE_API_TOKEN:-}" ] || [ -z "${CF_ACCOUNT_ID:-}" ]; then
  echo ""
  echo "⚠ 未配置 CLOUDFLARE_API_TOKEN / CF_ACCOUNT_ID —— 跳过部署"
  echo "   build/ 已就绪，可手动上传或稍后配置凭据"
  exit 0
fi

echo ""
echo "▸ 部署到 Cloudflare Pages"
CLOUDFLARE_ACCOUNT_ID="$CF_ACCOUNT_ID" \
npx --yes wrangler@3 pages deploy build \
  --project-name="${CF_PROJECT:-horoscopetools-com}" \
  --branch=main --commit-dirty=true

echo ""
echo "✅ 完成 · 今日 Sun/Moon 见上方脚本输出"
