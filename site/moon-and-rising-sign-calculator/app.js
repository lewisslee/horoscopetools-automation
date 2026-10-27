import SwissEph from '../lilith-sign-calculator/engine/swiss-api.js';

const signs = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const $ = id => document.getElementById(id);
const normal = value => ((value % 360) + 360) % 360;
let engine;
let receipt = '';

function placement(longitude) {
  const value = normal(longitude); let minutes = Math.round((value % 30) * 60); let index = Math.floor(value / 30);
  if (minutes === 1800) { minutes = 0; index = (index + 1) % 12; }
  return { sign: signs[index], degree: `${Math.floor(minutes / 60)}° ${String(minutes % 60).padStart(2, '0')}′`, longitude: value };
}
function dateOK(value) { const [year, month, day] = value.split('-').map(Number); const test = new Date(Date.UTC(year, month - 1, day)); return year >= 1800 && year <= 2399 && test.getUTCFullYear() === year && test.getUTCMonth() === month - 1 && test.getUTCDate() === day; }
function utc(date, hour, offset) { const [year, month, day] = date.split('-').map(Number); const instant = new Date(Date.UTC(year, month - 1, day) + (hour - offset) * 3600000); return { year: instant.getUTCFullYear(), month: instant.getUTCMonth() + 1, day: instant.getUTCDate(), hour: instant.getUTCHours() + instant.getUTCMinutes() / 60 + instant.getUTCSeconds() / 3600, iso: instant.toISOString().replace('.000Z', 'Z') }; }
function clock(value) { const [hours, minutes, seconds = 0] = value.split(':').map(Number); return hours + minutes / 60 + seconds / 3600; }
function at(date, hour, offset) { const moment = utc(date, hour, offset); const jd = engine.julday(moment.year, moment.month, moment.day, moment.hour); return { moment, jd, sun: placement(engine.calc_ut(jd, engine.SE_SUN, engine.SEFLG_SWIEPH)[0]), moon: placement(engine.calc_ut(jd, engine.SE_MOON, engine.SEFLG_SWIEPH)[0]) }; }
function ascendant(jd, lat, lon) { return placement(engine.houses(jd, lat, lon, 'P').ascmc[0]); }
function validate(v) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v.date) || !dateOK(v.date)) throw new Error('Use a valid date from 1800 through 2399.');
  if (!v.birthplace.trim()) throw new Error('Enter a birth-city label.');
  if (v.offset === '' || !Number.isFinite(Number(v.offset)) || Math.abs(Number(v.offset)) > 14) throw new Error('Enter the UTC offset at birth, between −14 and +14.');
  if (v.time && !/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(v.time)) throw new Error('Enter a valid birth time.');
  if (v.time && (!Number.isFinite(Number(v.lat)) || !Number.isFinite(Number(v.lon)) || Math.abs(Number(v.lat)) > 89.9 || Math.abs(Number(v.lon)) > 180)) throw new Error('Add latitude and longitude to calculate a Rising sign.');
}
function cards(items) { return `<div class="cards">${items.map(item => `<article><p>${item.label}</p><h3>${item.sign}</h3><b>${item.degree || item.detail}</b>${item.note ? `<small>${item.note}</small>` : ''}</article>`).join('')}</div>`; }
function render(v) {
  const offset = Number(v.offset);
  if (v.time) {
    const value = at(v.date, clock(v.time), offset); const rising = ascendant(value.jd, Number(v.lat), Number(v.lon));
    $('result').innerHTML = `${cards([{label:'SUN', ...value.sun},{label:'MOON', ...value.moon},{label:'RISING', ...rising, note:'Placidus Ascendant'}])}<p class="result-note">Calculated at ${value.moment.iso}. Moon and Rising are calculated from the recorded moment; the Rising result uses ${v.lat}, ${v.lon}.</p><p class="result-note">If another service differs, compare its zodiac type, UTC offset, coordinates, house method, and whether it treats the time as recorded or estimated.</p>`;
    receipt = `Moon and Rising calculation receipt\nBirth label: ${v.birthplace}\nLocal input: ${v.date} ${v.time}\nUTC offset: ${offset >= 0 ? '+' : ''}${offset}\nUTC moment: ${value.moment.iso}\nCoordinates: ${v.lat}, ${v.lon}\nZodiac: tropical\nSwiss Ephemeris Julian day: ${value.jd.toFixed(8)}\nSun: ${value.sun.sign} ${value.sun.degree} (${value.sun.longitude.toFixed(6)}°)\nMoon: ${value.moon.sign} ${value.moon.degree} (${value.moon.longitude.toFixed(6)}°)\nRising: ${rising.sign} ${rising.degree} (${rising.longitude.toFixed(6)}°), Placidus`;
  } else {
    const start = at(v.date, 0, offset); const end = at(v.date, 23 + 59 / 60, offset); const sameMoon = start.moon.sign === end.moon.sign;
    const moonCard = sameMoon ? {label:'MOON — DATE-STABLE', ...start.moon, note:'Same sign at the first and last local minute'} : {label:'MOON — TIME NEEDED', sign:`${start.moon.sign} → ${end.moon.sign}`, detail:'Changes sign during this local date', note:'Use the recorded time before assigning one sign'};
    $('result').innerHTML = `${cards([{label:'SUN', ...start.sun, note:'Calculated at local 00:00'}, moonCard, {label:'RISING', sign:'Unresolved', detail:'A time and coordinates are required', note:'No noon substitute used'}])}<p class="result-note">The no-time check compares ${start.moment.iso} and ${end.moment.iso}. It does not turn an unknown birth time into a Rising sign.</p>`;
    receipt = `Moon and Rising calculation receipt\nBirth label: ${v.birthplace}\nLocal input: ${v.date}; birth time not recorded\nUTC offset: ${offset >= 0 ? '+' : ''}${offset}\nZodiac: tropical\nMoon first local minute: ${start.moon.sign} ${start.moon.degree} (${start.moon.longitude.toFixed(6)}°)\nMoon last local minute: ${end.moon.sign} ${end.moon.degree} (${end.moon.longitude.toFixed(6)}°)\nRising: unresolved — no recorded time or coordinates`;
  }
  $('copy-result').hidden = false; $('copy-status').textContent = '';
}
async function init() { try { engine = new SwissEph(); await engine.initSwissEph(); $('engine-state').textContent = 'LOCAL MODEL READY'; $('calculate').disabled = false; } catch { $('engine-state').textContent = 'MODEL UNAVAILABLE'; $('form-error').textContent = 'The local ephemeris model did not start. No result was generated.'; $('form-error').hidden = false; } }
$('calculator-form').addEventListener('submit', event => { event.preventDefault(); if (!engine) return; try { const values = { date:$('birth-date').value, time:$('birth-time').value, offset:$('utc-offset').value, birthplace:$('birthplace').value, lat:$('latitude').value, lon:$('longitude').value }; validate(values); render(values); $('form-error').hidden = true; } catch (error) { $('form-error').textContent = error.message; $('form-error').hidden = false; $('copy-result').hidden = true; } });
$('copy-result').addEventListener('click', async () => { try { await navigator.clipboard.writeText(receipt); $('copy-status').textContent = 'Copied. Keep the settings with the result.'; } catch { $('copy-status').textContent = 'Clipboard unavailable. Select the receipt text and copy it manually.'; } });
init();
