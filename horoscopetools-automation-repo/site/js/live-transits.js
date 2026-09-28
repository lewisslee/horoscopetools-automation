// 实时行运重算 —— 页面加载时用当前时刻重算行星位置并覆写页面上的烘焙快照。
// 设计原则：失败就静默，绝不让一个脚本错误毁掉可读内容。
import * as A from 'https://esm.sh/astronomia@4.2.0';
import data from 'https://esm.sh/astronomia@4.2.0/data';

const D2R = Math.PI / 180, R2D = 180 / Math.PI;
const pmod = (x, m) => ((x % m) + m) % m;
const D = (data && data.earth) ? data : data.default;
const { julian, solar, moonposition, planetposition, pluto } = A;

const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio',
               'Sagittarius','Capricorn','Aquarius','Pisces'];
const GLYPH = { Sun:'☉',Moon:'☽',Mercury:'☿',Venus:'♀',Mars:'♂',
               Jupiter:'♃',Saturn:'♄',Uranus:'♅',Neptune:'♆',Pluto:'♇' };
const ORDER = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];

const P = {};
for (const k of ['mercury','venus','mars','jupiter','saturn','uranus','neptune']) {
  P[k[0].toUpperCase() + k.slice(1)] = new planetposition.Planet(D[k]);
}
const EARTH = new planetposition.Planet(D.earth);

function rectH(lon, lat, r) {
  const cb = Math.cos(lat);
  return [r*cb*Math.cos(lon), r*cb*Math.sin(lon), r*Math.sin(lat)];
}
function geoLon(helio, eH) {
  const p = rectH(helio.lon, helio.lat, helio.range);
  const e = rectH(eH.lon, eH.lat, eH.range);
  const gx=p[0]-e[0], gy=p[1]-e[1], gz=p[2]-e[2];
  return Math.atan2(gy, gx);
}
function signOf(lonRad) {
  const deg = pmod(lonRad * R2D, 360);
  const i = Math.floor(deg / 30);
  return { sign: SIGNS[i], deg: deg % 30 };
}

function now() {
  const jde = julian.DateToJDE(new Date());
  const eH = EARTH.position(jde);
  const out = {
    Sun:  signOf(solar.apparentLongitude((jde - 2451545.0) / 36525)),
    Moon: signOf(moonposition.position(jde).lon),
  };
  for (const [n, pl] of Object.entries(P)) out[n] = signOf(geoLon(pl.position(jde), eH));
  out.Pluto = signOf(geoLon(pluto.heliocentric(jde), eH));
  return out;
}

function refresh() {
  const p = now();
  const today = new Date().toISOString().slice(0, 10);

  const set = (sel, txt) => { const el = document.querySelector(sel); if (el) el.textContent = txt; };
  set('#js-date', today);
  set('#f-sun', p.Sun.sign);
  set('#f-moon', p.Moon.sign);
  set('#js-status', `Live · recalculated just now for ${today}`);

  // 星位表覆写
  const rows = document.querySelectorAll('table.sky tbody tr');
  rows.forEach(tr => {
    const name = tr.children[0].textContent.trim();
    const hit = ORDER.find(n => tr.children[0].textContent.includes(n));
    if (!hit || !p[hit]) return;
    tr.children[1].textContent = p[hit].sign;
    tr.children[2].textContent = p[hit].deg.toFixed(1) + '°';
  });

  document.querySelectorAll('.skel').forEach(e => e.classList.remove('skel'));
  const head = document.querySelector('#js-head');
  if (head) head.dataset.live = '1';
}

try {
  refresh();
} catch (e) {
  // 静默降级：保留构建期烘焙的内容
  const s = document.querySelector('#js-status');
  if (s) s.textContent = 'Offline snapshot — positions from build time';
}
