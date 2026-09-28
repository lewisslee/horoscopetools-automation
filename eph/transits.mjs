// 复刻 natal.js 的历表算法，用于构建期计算真实行星位置。
// 校验锚点：2026-09-27 太阳应落在 Libra（Sep 23 - Oct 22）
import * as A from 'astronomia';
import data from 'astronomia/data';

const D = (data && data.earth) ? data : data.default;
const { julian, solar, moonposition, planetposition, pluto } = A;

const D2R = Math.PI / 180, R2D = 180 / Math.PI;
const pmod = (x, m) => ((x % m) + m) % m;

export const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra',
                      'Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
export const GLYPH = { Sun:'☉', Moon:'☽', Mercury:'☿', Venus:'♀', Mars:'♂',
                       Jupiter:'♃', Saturn:'♄', Uranus:'♅', Neptune:'♆', Pluto:'♇' };
export const ELEMENT = { Aries:'Fire', Taurus:'Earth', Gemini:'Air', Cancer:'Water',
  Leo:'Fire', Virgo:'Earth', Libra:'Air', Scorpio:'Water', Sagittarius:'Fire',
  Capricorn:'Earth', Aquarius:'Air', Pisces:'Water' };

const P = {
  Mercury: new planetposition.Planet(D.mercury),
  Venus:   new planetposition.Planet(D.venus),
  Mars:    new planetposition.Planet(D.mars),
  Jupiter: new planetposition.Planet(D.jupiter),
  Saturn:  new planetposition.Planet(D.saturn),
  Uranus:  new planetposition.Planet(D.uranus),
  Neptune: new planetposition.Planet(D.neptune),
};
const EARTH = new planetposition.Planet(D.earth);

function rectH(lon, lat, r) {
  const cb = Math.cos(lat);
  return [r * cb * Math.cos(lon), r * cb * Math.sin(lon), r * Math.sin(lat)];
}
function geoLon(helio, eH) {
  const p = rectH(helio.lon, helio.lat, helio.range);
  const e = rectH(eH.lon, eH.lat, eH.range);
  const gx = p[0] - e[0], gy = p[1] - e[1], gz = p[2] - e[2];
  return Math.atan2(gy, gx);
}
function signInfo(lonRad) {
  const deg = pmod(lonRad * R2D, 360);
  const idx = Math.floor(deg / 30);
  return { sign: SIGNS[idx], signIndex: idx, degInSign: deg % 30, absDeg: deg };
}

/** 返回某 UTC 时刻全部天体的地心黄经与所在星座 */
export function positionsAt(dateUTC) {
  const jde = julian.DateToJDE(dateUTC);
  const eH = EARTH.position(jde);
  const out = {
    Sun:  signInfo(solar.apparentLongitude((jde - 2451545.0) / 36525)),
    Moon: signInfo(moonposition.position(jde).lon),
  };
  for (const [name, pl] of Object.entries(P)) {
    out[name] = signInfo(geoLon(pl.position(jde), eH));
  }
  out.Pluto = signInfo(geoLon(pluto.heliocentric(jde), eH));
  return out;
}

export const planetOrder = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];
