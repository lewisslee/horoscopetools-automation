# horoscopetools.com 自动化工程

每天自动重建并发布站点里**真算**的那部分内容。

---

## 这是什么

| 目录 | 内容 | 说明 |
|---|---|---|
| `site/` | `index.html` `natal-chart.html` `natal.js` `robots.txt` | **唯一真相**。这些文件不会被重新生成，是站点的地基 |
| `gen/content/` | 12 个星座的原创文案 JSON | 内容源，支撑 `zodiac-signs/` 的生成 |
| `gen/` | `build.py` `build_hub.py` `build_sitemap.py` `verify.py` | 星座页 / 聚合页 / sitemap 生成器 |
| `eph/` | `transits.mjs` `reading.mjs` `compat.mjs` `build_daily.mjs` `build_compat.mjs` | **星历引擎**，用 `astronomia@4.2.0` 算真实行星位置 |
| `refresh.sh` | 一条命令跑完全部 | 可在任意路径运行 |
| `.github/workflows/daily-deploy.yml` | 每日 07:17（北京时间）自动重建 + 发布 | 配好 secrets 后生效 |

`build/` 是产物目录，每次重建时从 `site/` 全新生成，**不要手动往里放东西**。

---

## 本地跑

```bash
npm ci                      # 首次
bash refresh.sh             # 重建 + 部署
SKIP_DEPLOY=1 bash refresh.sh   # 只重建不部署
```

**不需要 Cloudflare 凭据也能跑**，没配就自动跳过部署，`build/` 照样产出。

---

## 每天生成什么

| 内容 | 数量 | 是不是真算 |
|---|---|---|
| `zodiac-signs/` 12 星座页 + 聚合页 | 13 | 静态文案 |
| `horoscope/{sign}/daily/` | 12 | ✅ **真星历** |
| `compatibility/` 配对 + 枢纽 + 汇总 | 79 | ✅ **真星历** + 透明计分 |
| `sitemap.xml` | 106 URL | — |

**91 个页面由真实历表计算，每天不一样。** 这是这个站和竞品的唯一区别——
竞品 1478 页全是文字模板，这些算不出来也抄不走。

### 校验不通过 = 绝不部署

`refresh.sh` 里任何一步失败就 `exit 1`，线上保持旧版本。
GitHub Actions 也会独立核对数量（12 / 79 / 13 / 106），对不上直接中止。

---

## 接 Cloudflare Pages

### 1. 建仓库

把这个目录整个传进一个 GitHub 仓库（**不要带 `build/` 和 `node_modules/`**，`.gitignore` 已配好）。

### 2. 建 API Token

Cloudflare 控制台 → My Profile → API Tokens → Create Token → **Edit Cloudflare Workers** 模板

改这两处：
- **Permissions**：`Account` → `Cloudflare Pages` → `Edit`
- **Account Resources**：包含 `horoscopetools-com` 所在的那个账号

复制生成的 token。

### 3. 加 Secrets

仓库 → Settings → Secrets and variables → Actions → New repository secret：

| Name | Value |
|---|---|
| `CLOUDFLARE_API_TOKEN` | 上一步复制的 token |
| `CF_ACCOUNT_ID` | Cloudflare Account ID（控制台右侧可见） |

**token 属于凭据类信息，请在 Cloudflare 页面直接创建，不要贴到聊天里。**

### 4. 手动触发一次验证

Actions 页面 → `每日重建并发布 horoscopetools.com` → **Run workflow**

绿色即成功。工作流最后一步会自己 curl 线上做冒烟测试。

### 5. 之后就不用管了

每天 UTC 23:17（北京 07:17）自动：

```
重建 → 校验数量 → 部署 → 线上冒烟测试 → 失败通知
```

---

## 改内容

| 想改什么 | 改哪儿 |
|---|---|
| 某个星座页的文案 | `gen/content/{sign}.json` |
| 首页设计 | `site/index.html` |
| 兼容计分规则 | `eph/compat.mjs` 里的 `ELEMENT_REL` / `modalityRel` |
| 行运相关度权重 | `eph/reading.mjs` 里的 `relation()` |
| 配色 / 字体 / 断点 | `site/index.html` 的 `<style>`，各生成器从这里取 |

改完跑 `SKIP_DEPLOY=1 bash refresh.sh` 本地看效果，确认后再提交。

⚠️ **`site/index.html` 只能从线上拉最新版覆盖回来**，不要用旧副本——
线上首页已经被优化过（6 列栅格、760px 断点、根相对链接、zcard 金色光晕）。

---

## 依赖与凭据

- Node 20（`astronomia@4.2.0` 从 npm 装）
- Python 3.11（只用标准库，无需 pip 依赖）
- Cloudflare API Token（仅部署时需要）

没有其他外部服务依赖。
