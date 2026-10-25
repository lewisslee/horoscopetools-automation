import SwissEph from '../lilith-sign-calculator/engine/swiss-api.js';

const signs = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const $ = id => document.getElementById(id);
const normalize = value => ((value % 360) + 360) % 360;
let engine = null;
let copyText = '';

function setState(text) { $('engine-state').textContent = text; }
function display(longitude) {
  let minutes = Math.round((normalize(longitude) % 30) * 60);
  let index = Math.floor(normalize(longitude) / 30);
  if (minutes === 1800) { minutes = 0; index = (index + 1) % 12; }
  return { sign: signs[index], degree: `${Math.floor(minutes / 60)}° ${String(minutes % 60).padStart(2, '0')}′`, longitude: normalize(longitude) };
}
function readTime(time) { const [hour, minute, second = 0] = time.split(':').map(Number); return hour + minute / 60 + second / 3600; }
function validDate(date) { const [year, month, day] = date.split('-').map(Number); const candidate = new Date(Date.UTC(year, month - 1, day)); return year >= 1800 && year <= 2399 && candidate.getUTCMonth() === month - 1 && candidate.getUTCDate() === day; }
function utcParts(date, localHour, offset) { const [year, month, day] = date.split('-').map(Number); const instant = new Date(Date.UTC(year, month - 1, day, 0, 0, 0) + (localHour - offset) * 3600000); return { year: instant.getUTCFullYear(), month: instant.getUTCMonth() + 1, day: instant.getUTCDate(), hour: instant.getUTCHours() + instant.getUTCMinutes() / 60 + instant.getUTCSeconds() / 3600, iso: instant.toISOString().replace('.000Z', 'Z') }; }
function validate(values) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(values.date) || !validDate(values.date)) throw new Error('Use a valid date from 1800 through 2399.');
  if (!values.birthplace.trim()) throw new Error('Enter a birth city label.');
  if (values.offset === '' || !Number.isFinite(Number(values.offset)) || Math.abs(Number(values.offset)) > 14) throw new Error('Enter the UTC offset at birth, between −14 and +14 hours.');
  if (!values.time) return { knownTime: false, offset: Number(values.offset) };
  if (!/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(values.time)) throw new Error('Enter a valid birth time.');
  if (!Number.isFinite(Number(values.lat)) || !Number.isFinite(Number(values.lon)) || Math.abs(Number(values.lat)) > 89.9 || Math.abs(Number(values.lon)) > 180) throw new Error('Add latitude and longitude to calculate a Rising sign.');
  return { knownTime: true, offset: Number(values.offset), lat: Number(values.lat), lon: Number(values.lon) };
}
function ascendantAt(date, localHour, offset, lat, lon) {
  const utc = utcParts(date, localHour, offset);
  const jd = engine.julday(utc.year, utc.month, utc.day, utc.hour);
  const ascendant = normalize(engine.houses(jd, lat, lon, 'P').ascmc[0]);
  return { utc, jd, ascendant, placement: display(ascendant) };
}
function receipt(values, data, later) {
  return `Rising sign calculation receipt\nBirth label: ${values.birthplace}\nLocal birth input: ${values.date} ${values.time}\nUTC offset at birth: ${values.offset >= 0 ? '+' : ''}${values.offset}\nUTC moment: ${data.utc.iso}\nCoordinates: ${values.lat}, ${values.lon}\nZodiac: tropical\nHorizon method: Placidus Ascendant\nSwiss Ephemeris Julian day: ${data.jd.toFixed(8)}\nAscendant: ${data.placement.sign} ${data.placement.degree} (${data.placement.longitude.toFixed(6)}°)\nSensitivity run: ${later.placement.sign} ${later.placement.degree} (${later.placement.longitude.toFixed(6)}°), local time +10 minutes`;
}
function renderUnresolved(values) {
  $('result').innerHTML = `<div class="unresolved"><p class="model-label">INPUT STATUS</p><h3>Rising sign not calculated</h3><p>Date and birth-city label are recorded. A Rising sign cannot be calculated without a recorded birth time, UTC offset, latitude and longitude.</p><p>Add those four inputs to create a calculation receipt and a ten-minute sensitivity check.</p></div>`;
  $('copy-result').hidden = true;
}
function render(values, initial, later) {
  const stable = initial.placement.sign === later.placement.sign;
  const verdict = stable ? `Stable in this check: both calculations return ${initial.placement.sign}.` : `Time-sensitive in this check: the sign changes from ${initial.placement.sign} to ${later.placement.sign} within ten minutes.`;
  $('result').innerHTML = `<div class="ascendant-card"><p class="model-label">ASCENDANT AT ENTERED TIME</p><h3>${initial.placement.sign}</h3><div class="degree">${initial.placement.degree}</div><p>${initial.placement.longitude.toFixed(6)}° tropical longitude</p></div><div class="compare"><div><span>Entered time</span><strong>${values.time}</strong><b>${initial.placement.sign} ${initial.placement.degree}</b></div><div><span>Ten minutes later</span><strong>${later.localTime}</strong><b>${later.placement.sign} ${later.placement.degree}</b></div></div><p class="result-note"><strong>${verdict}</strong></p><p class="result-note">UTC moment: ${initial.utc.iso} · Julian day ${initial.jd.toFixed(8)} · Placidus Ascendant · tropical zodiac.</p>`;
  copyText = receipt(values, initial, later);
  $('copy-result').hidden = false;
  $('copy-status').textContent = '';
}
async function initialise() { try { engine = new SwissEph(); await engine.initSwissEph(); setState('LOCAL MODEL READY'); $('calculate').disabled = false; } catch { setState('MODEL UNAVAILABLE'); $('form-error').textContent = 'The local ephemeris model could not start. No result was generated.'; $('form-error').hidden = false; } }
$('calculator-form').addEventListener('submit', event => { event.preventDefault(); if (!engine) return; try { const values = { date: $('birth-date').value, time: $('birth-time').value, birthplace: $('birthplace').value, offset: $('utc-offset').value, lat: $('latitude').value, lon: $('longitude').value }; const status = validate(values); values.offset = status.offset; if (!status.knownTime) { renderUnresolved(values); return; } values.lat = status.lat; values.lon = status.lon; const start = readTime(values.time); const initial = ascendantAt(values.date, start, values.offset, values.lat, values.lon); const laterTime = start + 10 / 60; const later = ascendantAt(values.date, laterTime, values.offset, values.lat, values.lon); const minutes = Math.floor((laterTime % 24) * 60); later.localTime = `${String(Math.floor(minutes / 60)).padStart(2,'0')}:${String(minutes % 60).padStart(2,'0')}`; render(values, initial, later); $('form-error').hidden = true; } catch (error) { $('form-error').textContent = error.message; $('form-error').hidden = false; $('copy-result').hidden = true; } });
$('calculator-form').addEventListener('input', () => { $('form-error').hidden = true; if (copyText) $('copy-status').textContent = 'Details changed. Calculate again to refresh your receipt.'; });
$('copy-result').addEventListener('click', async () => { try { await navigator.clipboard.writeText(copyText); $('copy-status').textContent = 'Copied. Ready to compare.'; } catch { $('copy-status').textContent = 'Clipboard unavailable. Select the receipt text and copy it manually.'; } });
initialise();
