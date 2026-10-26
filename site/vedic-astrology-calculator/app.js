import SwissEph from '../lilith-sign-calculator/engine/swiss-api.js';

const signs = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const planets = [['Sun', 0], ['Moon', 1], ['Mercury', 2], ['Venus', 3], ['Mars', 4], ['Jupiter', 5], ['Saturn', 6]];
const $ = id => document.getElementById(id);
const normalize = value => ((value % 360) + 360) % 360;
let engine = null;
let copyText = '';

function setState(text) { $('engine-state').textContent = text; }
function hours(value) { const [h, m, s = 0] = value.split(':').map(Number); return h + m / 60 + s / 3600; }
function display(longitude) {
  let minutes = Math.round((normalize(longitude) % 30) * 60);
  let index = Math.floor(normalize(longitude) / 30);
  if (minutes === 1800) { minutes = 0; index = (index + 1) % 12; }
  return { sign: signs[index], degree: `${Math.floor(minutes / 60)}° ${String(minutes % 60).padStart(2, '0')}′`, longitude: normalize(longitude) };
}
function validDate(date) { const [y, m, d] = date.split('-').map(Number); const check = new Date(Date.UTC(y, m - 1, d)); return y >= 1800 && y <= 2399 && check.getUTCMonth() === m - 1 && check.getUTCDate() === d; }
function toUtc(date, localHour, offset) {
  const [year, month, day] = date.split('-').map(Number);
  const instant = new Date(Date.UTC(year, month - 1, day) + (localHour - offset) * 3600000);
  return { year: instant.getUTCFullYear(), month: instant.getUTCMonth() + 1, day: instant.getUTCDate(), hour: instant.getUTCHours() + instant.getUTCMinutes() / 60 + instant.getUTCSeconds() / 3600, iso: instant.toISOString().replace('.000Z', 'Z') };
}
function validate(values) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(values.date) || !validDate(values.date)) throw new Error('Use a valid date from 1800 through 2399.');
  if (values.offset === '' || !Number.isFinite(Number(values.offset)) || Math.abs(Number(values.offset)) > 14) throw new Error('Enter the UTC offset at birth, between −14 and +14 hours.');
  if (values.time && !/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(values.time)) throw new Error('Enter a valid birth time or leave it blank.');
  const hasCoordinates = values.lat !== '' || values.lon !== '';
  if (hasCoordinates && (!Number.isFinite(Number(values.lat)) || !Number.isFinite(Number(values.lon)) || Math.abs(Number(values.lat)) > 89.9 || Math.abs(Number(values.lon)) > 180)) throw new Error('Enter valid latitude and longitude together.');
  return { offset: Number(values.offset), hasTime: Boolean(values.time), hasCoordinates, lat: Number(values.lat), lon: Number(values.lon) };
}
function calculate(values) {
  const valid = validate(values);
  const localHour = valid.hasTime ? hours(values.time) : 12;
  const utc = toUtc(values.date, localHour, valid.offset);
  const jd = engine.julday(utc.year, utc.month, utc.day, utc.hour);
  engine.set_sid_mode(engine.SE_SIDM_LAHIRI, 0, 0);
  const flags = engine.SEFLG_SWIEPH | engine.SEFLG_SIDEREAL;
  const placements = planets.map(([name, body]) => ({ name, placement: display(engine.calc_ut(jd, body, flags)[0]) }));
  const lagna = valid.hasTime && valid.hasCoordinates ? display(engine.houses_ex(jd, flags, valid.lat, valid.lon, 'P').ascmc[0]) : null;
  return { valid, localHour, utc, jd, placements, lagna };
}
function render(values, data) {
  const cards = data.placements.map(({ name, placement }) => `<article class="planet"><span>${name}</span><strong>${placement.sign}</strong><b>${placement.degree}</b><small>${placement.longitude.toFixed(6)}°</small></article>`).join('');
  const timeNote = data.valid.hasTime ? `Recorded time used: ${values.time}.` : 'Time unknown: 12:00 noon used for the planetary baseline only.';
  const lagna = data.lagna ? `<article class="lagna"><span>Sidereal Ascendant</span><strong>${data.lagna.sign} ${data.lagna.degree}</strong><small>${data.lagna.longitude.toFixed(6)}° · Placidus horizon</small></article>` : `<article class="lagna unresolved"><span>Sidereal Ascendant</span><strong>Not calculated</strong><small>Add recorded time, latitude and longitude.</small></article>`;
  $('result').innerHTML = `<div class="result-banner"><p class="model-label">LAHIRI SIDEREAL / SWISS EPHEMERIS</p><h3>Seven planetary placements, with settings shown.</h3><p>${timeNote} UTC moment: ${data.utc.iso} · Julian day ${data.jd.toFixed(8)}.</p></div><div class="planet-grid">${cards}</div>${lagna}<p class="result-note">This is a calculation baseline, not a Navamsha, Dasha or interpretation report. Compare the zodiac and ayanamsa setting before comparing signs across services.</p>`;
  copyText = `Vedic astrology calculation receipt\nZodiac: sidereal\nAyanamsa: Lahiri\nEphemeris: Swiss Ephemeris\nBirth label: ${values.birthplace || 'not supplied'}\nLocal input: ${values.date} ${data.valid.hasTime ? values.time : 'time unknown; noon estimate'}\nUTC offset: ${data.valid.offset >= 0 ? '+' : ''}${data.valid.offset}\nUTC moment: ${data.utc.iso}\nJulian day: ${data.jd.toFixed(8)}\n${data.placements.map(({name, placement}) => `${name}: ${placement.sign} ${placement.degree} (${placement.longitude.toFixed(6)}°)`).join('\n')}\nSidereal Ascendant: ${data.lagna ? `${data.lagna.sign} ${data.lagna.degree} (${data.lagna.longitude.toFixed(6)}°), Placidus` : 'not calculated; recorded time and coordinates required'}`;
  $('copy-result').hidden = false; $('copy-status').textContent = '';
}
async function initialise() { try { engine = new SwissEph(); await engine.initSwissEph(); setState('LOCAL MODEL READY'); $('calculate').disabled = false; } catch { setState('MODEL UNAVAILABLE'); $('form-error').textContent = 'The local ephemeris model could not start. No result was generated.'; $('form-error').hidden = false; } }
$('calculator-form').addEventListener('submit', event => { event.preventDefault(); if (!engine) return; try { const values = { date: $('birth-date').value, time: $('birth-time').value, birthplace: $('birthplace').value, offset: $('utc-offset').value, lat: $('latitude').value, lon: $('longitude').value }; render(values, calculate(values)); $('form-error').hidden = true; } catch (error) { $('form-error').textContent = error.message; $('form-error').hidden = false; $('copy-result').hidden = true; } });
$('calculator-form').addEventListener('input', () => { $('form-error').hidden = true; if (copyText) $('copy-status').textContent = 'Details changed. Calculate again to refresh your receipt.'; });
$('copy-result').addEventListener('click', async () => { try { await navigator.clipboard.writeText(copyText); $('copy-status').textContent = 'Copied. Ready to compare.'; } catch { $('copy-status').textContent = 'Clipboard unavailable. Select the result and copy it manually.'; } });
initialise();
