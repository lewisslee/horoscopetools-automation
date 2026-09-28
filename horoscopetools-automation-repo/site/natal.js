// Natal Chart engine — pure client-side, powered by astronomia (esm.sh)
import * as A from 'https://esm.sh/astronomia@4.2.0';
import data from 'https://esm.sh/astronomia@4.2.0/data';

const { julian, solar, moonposition, planetposition, pluto, sidereal, nutation, base } = A;
// esm.sh CJS interop: data may be the object itself or { default: {...} }
const D = (data && data.earth) ? data : data.default;
const D2R = Math.PI / 180, R2D = 180 / Math.PI;
const pmod = (x, m) => ((x % m) + m) % m;

const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const SIGN_ABBR = ['Ar','Ta','Ge','Cn','Le','Vi','Li','Sc','Sg','Cp','Aq','Pi'];
const ELEMENT = ['fire','earth','air','water','fire','earth','air','water','fire','earth','air','water'];
const EL_COLOR = { fire:'#ff7a7a', earth:'#7ad19a', air:'#ffd166', water:'#6fb7ff' };
const GLYPH = { Sun:'☉', Moon:'☽', Mercury:'☿', Venus:'♀', Mars:'♂', Jupiter:'♃', Saturn:'♄', Uranus:'♅', Neptune:'♆', Pluto:'♇', ASC:'Asc', MC:'MC' };

// Planet data (heliocentric VSOP87 / Pluto)
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
  const gx = p[0]-e[0], gy = p[1]-e[1], gz = p[2]-e[2];
  return { lon: Math.atan2(gy, gx), lat: Math.atan2(gz, Math.hypot(gx,gy)), range: Math.hypot(gx,gy,gz) };
}
function signInfo(lonRad) {
  const deg = pmod(lonRad * R2D, 360);
  return { sign: SIGNS[Math.floor(deg/30)], degInSign: deg % 30, absDeg: deg };
}
function ascMc(thetaDeg, latDeg, epsRad) {
  const th = thetaDeg * D2R, phi = latDeg * D2R, eps = epsRad;
  const asc = Math.atan2(Math.cos(th), -(Math.sin(th) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps)));
  const mc  = Math.atan2(Math.sin(th), Math.cos(th) * Math.cos(eps));
  return { asc: pmod(asc * R2D, 360), mc: pmod(mc * R2D, 360) };
}
function fmt(deg) {
  const d = Math.floor(deg), m = Math.round((deg - d) * 60);
  return d + '°' + (m < 10 ? '0' : '') + m + '′';
}

// Build the full chart from a UTC Date + lat/lon
function buildChart(dateUTC, lat, lon) {
  const jde = julian.DateToJDE(dateUTC);
  const sun = signInfo(solar.apparentLongitude(base.J2000Century(jde)));
  const moon = signInfo(moonposition.position(jde).lon);
  const eH = EARTH.position(jde);
  const planets = [];
  for (const [name, pl] of Object.entries(P)) {
    planets.push({ name, ...signInfo(geoLon(pl.position(jde), eH).lon) });
  }
  const plu = signInfo(geoLon(pluto.heliocentric(jde), eH).lon);
  planets.push({ name: 'Pluto', ...plu });

  const gstRad = sidereal.apparent(jde) / 86400 * 2 * Math.PI; // seconds of time -> radians
  const lst = pmod(gstRad + lon * D2R, 2 * Math.PI);
  const theta = lst * R2D;
  const eps = nutation.meanObliquity(jde);
  const am = ascMc(theta, lat, eps);
  const ascLon = am.asc, mcLon = am.mc;

  const houseOf = (deg) => pmod(Math.floor(pmod(deg - ascLon + 360, 360) / 30), 12) + 1;
  planets.forEach(p => { p.house = houseOf(p.absDeg); });
  return { sun, moon, asc: signInfo(ascLon * D2R), mc: signInfo(mcLon * D2R), planets, ascLon, mcLon };
}

// ---------- Sign interpretations ----------
const SUN = {
  Aries:'Bold, pioneering and action-driven — you lead with courage and initiative.',
  Taurus:'Steady, sensual and loyal — you seek security, beauty and the simple pleasures.',
  Gemini:'Curious, witty and adaptable — your mind is your greatest asset.',
  Cancer:'Nurturing, intuitive and protective — home and family anchor your sense of self.',
  Leo:'Confident, warm and expressive — you shine when you are seen and appreciated.',
  Virgo:'Precise, practical and thoughtful — you serve through detail and quiet competence.',
  Libra:'Diplomatic, charming and fair — you find yourself through relationships and balance.',
  Scorpio:'Intense, passionate and perceptive — you transform through depth and emotional honesty.',
  Sagittarius:'Adventurous, optimistic and free — meaning and exploration fuel your spirit.',
  Capricorn:'Ambitious, disciplined and grounded — you build lasting structures and achievement.',
  Aquarius:'Independent, visionary and humanitarian — you champion what is original and just.',
  Pisces:'Empathetic, imaginative and gentle — you move through the world with compassion.'
};
const MOON = {
  Aries:'Your emotions are immediate and fiery — you need to act on your feelings.',
  Taurus:'You find emotional safety in routine, comfort and the physical world.',
  Gemini:'Your mind never rests — you process feelings by talking and learning.',
  Cancer:'You feel everything deeply; emotional closeness is your refuge.',
  Leo:'You need to be appreciated — warmth and recognition nourish your heart.',
  Virgo:'You show care by being useful; you worry when you cannot fix things.',
  Libra:'You are soothed by harmony and unsettled by conflict or isolation.',
  Scorpio:'Your inner life is intense and private; trust is earned slowly.',
  Sagittarius:'You feel free when you are growing, exploring and believing in something.',
  Capricorn:'You steady your emotions through responsibility and self-reliance.',
  Aquarius:'You detach to understand — friendship and ideals comfort you.',
  Pisces:'You absorb the moods around you; solitude and creativity restore you.'
};
const ASC = {
  Aries:'Others see you as direct, energetic and unafraid to begin.',
  Taurus:'You come across as calm, grounded and dependable.',
  Gemini:'You read as curious, talkative and quick-witted.',
  Cancer:'You appear caring, sensitive and quietly protective.',
  Leo:'You make an impression as confident, warm and charismatic.',
  Virgo:'You seem composed, precise and quietly capable.',
  Libra:'You project grace, diplomacy and social ease.',
  Scorpio:'You register as intense, private and quietly powerful.',
  Sagittarius:'You show up as open, optimistic and adventurous.',
  Capricorn:'You are perceived as serious, competent and in control.',
  Aquarius:'You come across as original, independent and a little unconventional.',
  Pisces:'You seem gentle, dreamy and empathetic to others.'
};

// ---------- Geocoding (Open-Meteo, free, no key) ----------
async function geocode(city) {
  const url = 'https://geocoding-api.open-meteo.com/v1/search?name=' +
    encodeURIComponent(city) + '&count=1&language=en&format=json';
  const r = await fetch(url);
  const j = await r.json();
  if (!j.results || !j.results.length) throw new Error('City not found. Try another, or enter coordinates manually.');
  const c = j.results[0];
  return { lat: c.latitude, lon: c.longitude, offset: (c.utc_offset_seconds || 0) / 3600, name: c.name, country: c.country };
}

// ---------- Rendering ----------
function render(chart, meta) {
  const $ = (id) => document.getElementById(id);
  $('rMeta').textContent = meta;
  $('rSun').innerHTML = `<b>${chart.sun.sign}</b> · ${fmt(chart.sun.degInSign)}`;
  $('rMoon').innerHTML = `<b>${chart.moon.sign}</b> · ${fmt(chart.moon.degInSign)}`;
  $('rAsc').innerHTML = `<b>${chart.asc.sign}</b> · ${fmt(chart.asc.degInSign)}`;
  $('rMc').innerHTML = `<b>${chart.mc.sign}</b> · ${fmt(chart.mc.degInSign)}`;

  let rows = '';
  for (const p of chart.planets) {
    rows += `<tr><td>${GLYPH[p.name]} ${p.name}</td><td>${p.sign}</td><td>${fmt(p.degInSign)}</td><td>House ${p.house}</td></tr>`;
  }
  $('planetRows').innerHTML = rows;

  $('interp').innerHTML =
    `<h3>☉ Sun in ${chart.sun.sign}</h3><p>${SUN[chart.sun.sign]}</p>` +
    `<h3>☽ Moon in ${chart.moon.sign}</h3><p>${MOON[chart.moon.sign]}</p>` +
    `<h3>↑ Rising (Ascendant) in ${chart.asc.sign}</h3><p>${ASC[chart.asc.sign]}</p>`;

  $('wheel').innerHTML = buildWheel(chart);
  $('result').classList.add('show');
  $('result').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function pt(lonDeg, r) {
  const t = (-90 + lonDeg) * D2R;
  return { x: 180 + r * Math.cos(t), y: 180 + r * Math.sin(t) };
}
function buildWheel(chart) {
  let s = `<svg viewBox="0 0 360 360" width="100%" style="max-width:360px" role="img" aria-label="Zodiac wheel">`;
  s += `<circle cx="180" cy="180" r="150" fill="#120e26" stroke="#2c2547" stroke-width="2"/>`;
  // sign boundary lines + labels
  for (let i = 0; i < 12; i++) {
    const b = pt(i * 30, 150), b2 = pt(i * 30, 116);
    s += `<line x1="${b.x.toFixed(1)}" y1="${b.y.toFixed(1)}" x2="${b2.x.toFixed(1)}" y2="${b2.y.toFixed(1)}" stroke="#2c2547"/>`;
    const lab = pt(i * 30 + 15, 133);
    s += `<text x="${lab.x.toFixed(1)}" y="${(lab.y+4).toFixed(1)}" fill="${EL_COLOR[ELEMENT[i]]}" font-size="13" text-anchor="middle">${SIGN_ABBR[i]}</text>`;
  }
  s += `<circle cx="180" cy="180" r="112" fill="none" stroke="#2c2547"/>`;
  // ASC + MC lines
  const a = pt(chart.ascLon, 150), m = pt(chart.mcLon, 150);
  s += `<line x1="180" y1="180" x2="${a.x.toFixed(1)}" y2="${a.y.toFixed(1)}" stroke="#b388ff" stroke-width="2"/>`;
  s += `<line x1="180" y1="180" x2="${m.x.toFixed(1)}" y2="${m.y.toFixed(1)}" stroke="#7c5cff" stroke-width="2"/>`;
  // planets
  for (const p of chart.planets) {
    const q = pt(p.absDeg, 92);
    s += `<text x="${q.x.toFixed(1)}" y="${(q.y+4).toFixed(1)}" fill="#ece9ff" font-size="14" text-anchor="middle">${GLYPH[p.name]}</text>`;
  }
  // ASC / MC markers at rim
  const al = pt(chart.ascLon, 162), ml = pt(chart.mcLon, 162);
  s += `<text x="${al.x.toFixed(1)}" y="${(al.y+4).toFixed(1)}" fill="#b388ff" font-size="11" text-anchor="middle">ASC</text>`;
  s += `<text x="${ml.x.toFixed(1)}" y="${(ml.y+4).toFixed(1)}" fill="#7c5cff" font-size="11" text-anchor="middle">MC</text>`;
  s += `</svg>`;
  return s;
}

// ---------- Wire up UI ----------
window.addEventListener('DOMContentLoaded', () => {
  const $ = (id) => document.getElementById(id);
  $('searchBtn').addEventListener('click', async () => {
    const city = $('city').value.trim();
    if (!city) return;
    $('geoStatus').textContent = 'Searching…';
    try {
      const g = await geocode(city);
      $('lat').value = g.lat.toFixed(4);
      $('lon').value = g.lon.toFixed(4);
      $('off').value = g.offset;
      $('geoStatus').textContent = `✓ ${g.name}, ${g.country} (UTC${g.offset>=0?'+':''}${g.offset})`;
    } catch (e) {
      $('geoStatus').textContent = '⚠ ' + e.message;
    }
  });

  $('calcBtn').addEventListener('click', () => {
    const err = $('error'); err.textContent = '';
    const bd = $('bdate').value, bt = $('btime').value || '12:00';
    if (!bd) { err.textContent = 'Please enter your birth date.'; return; }
    const lat = parseFloat($('lat').value), lon = parseFloat($('lon').value), offH = parseFloat($('off').value);
    if (isNaN(lat) || isNaN(lon)) { err.textContent = 'Enter birth coordinates: search your city or fill them manually.'; return; }
    const [Y, M, D] = bd.split('-').map(Number);
    const [h, mi] = bt.split(':').map(Number);
    const tzOffSec = (isNaN(offH) ? 0 : offH) * 3600;
    const localMs = Date.UTC(Y, M - 1, D, h, mi, 0);
    const d = new Date(localMs - tzOffSec * 1000);
    try {
      const chart = buildChart(d, lat, lon);
      const meta = `Born ${bd} ${bt} (local) · ${lat.toFixed(2)}°, ${lon.toFixed(2)}° · UTC${offH>=0?'+':''}${offH}`;
      render(chart, meta);
    } catch (e) {
      err.textContent = 'Calculation error: ' + e.message;
    }
  });
});
