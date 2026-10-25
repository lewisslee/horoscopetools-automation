import SwissEph from './engine/swiss-api.js';

const signs = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const $ = id => document.getElementById(id);
const normalize = value => ((value % 360) + 360) % 360;
let engine = null;
let copyText = '';

function setState(text) { $('engine-state').textContent = text; }

function hours(value) {
  const [hour, minute, second = 0] = value.split(':').map(Number);
  return hour + minute / 60 + second / 3600;
}

function formattedPlacement(longitude) {
  let totalMinutes = Math.round((normalize(longitude) % 30) * 60);
  let signIndex = Math.floor(normalize(longitude) / 30);
  if (totalMinutes === 1800) {
    totalMinutes = 0;
    signIndex = (signIndex + 1) % 12;
  }
  return {
    sign: signs[signIndex],
    degree: `${Math.floor(totalMinutes / 60)}° ${String(totalMinutes % 60).padStart(2, '0')}′`,
    longitude: normalize(longitude)
  };
}

function validate(values) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(values.date)) throw new Error('Enter a valid birth date.');
  const [year, month, day] = values.date.split('-').map(Number);
  const check = new Date(Date.UTC(year, month - 1, day));
  if (year < 1800 || year > 2399 || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) throw new Error('Use a valid date from 1800 through 2399.');
  if (!values.birthplace.trim()) throw new Error('Enter a birth city label.');
  if (values.offset === '' || !Number.isFinite(Number(values.offset)) || Math.abs(Number(values.offset)) > 14) throw new Error('Enter the UTC offset at birth, between −14 and +14 hours.');
  if (values.time && !/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(values.time)) throw new Error('Enter a valid birth time or leave it blank.');
  return { year, month, day, offset: Number(values.offset), hasTime: Boolean(values.time) };
}

function calcAt(year, month, day, utcHour, body) {
  const julianDay = engine.julday(year, month, day, utcHour);
  const longitude = normalize(engine.calc_ut(julianDay, body, engine.SEFLG_SWIEPH)[0]);
  return { julianDay, longitude };
}

function calculate(values) {
  const valid = validate(values);
  const localHour = valid.hasTime ? hours(values.time) : 12;
  const utcHour = localHour - valid.offset;
  const mean = calcAt(valid.year, valid.month, valid.day, utcHour, engine.SE_MEAN_APOG);
  const trueModel = calcAt(valid.year, valid.month, valid.day, utcHour, engine.SE_OSCU_APOG);
  return { values, valid, localHour, utcHour, mean, trueModel };
}

function modelCard(label, name, placement, className) {
  return `<article class="model-card ${className}"><div class="model-label">${label}</div><h3>${placement.sign}</h3><div class="degree">${placement.degree}</div><p>${name}</p><span>${placement.longitude.toFixed(6)}° tropical longitude</span></article>`;
}

function render(result) {
  const mean = formattedPlacement(result.mean.longitude);
  const trueModel = formattedPlacement(result.trueModel.longitude);
  const timeLine = result.valid.hasTime
    ? `Birth time used: ${result.values.time}; UTC ${(result.valid.offset >= 0 ? '+' : '') + result.valid.offset}.`
    : `Birth time unknown: 12:00 noon used as an estimate; UTC ${(result.valid.offset >= 0 ? '+' : '') + result.valid.offset}.`;
  const agreement = mean.sign === trueModel.sign
    ? `Both models return ${mean.sign}. Their degrees can still differ, so retain the model name with the result.`
    : `The model changes the displayed sign: Mean is ${mean.sign}; True is ${trueModel.sign}. Do not collapse them into one unlabelled “Lilith” result.`;
  $('result').innerHTML = `<div class="model-grid">${modelCard('MEAN', 'Mean Black Moon Lilith', mean, 'mean')}${modelCard('TRUE', 'True / osculating Black Moon Lilith', trueModel, 'true')}</div><p class="result-note"><strong>${agreement}</strong></p><p class="result-note">${timeLine}</p><p class="result-note">Tropical zodiac · geocentric lunar apogee · calculated locally with Swiss Ephemeris.</p>`;
  copyText = `Lilith sign calculator\nMean Black Moon Lilith: ${mean.sign} ${mean.degree} (${mean.longitude.toFixed(6)}°)\nTrue / osculating Black Moon Lilith: ${trueModel.sign} ${trueModel.degree} (${trueModel.longitude.toFixed(6)}°)\n${timeLine}\nTropical zodiac · geocentric lunar apogee · Swiss Ephemeris`;
  $('copy-result').hidden = false;
  $('copy-status').textContent = '';
}

async function initialise() {
  try {
    engine = new SwissEph();
    await engine.initSwissEph();
    setState('LOCAL MODEL READY');
    $('calculate').disabled = false;
  } catch (error) {
    setState('MODEL UNAVAILABLE');
    $('form-error').textContent = 'The local ephemeris model could not start. No result was generated.';
    $('form-error').hidden = false;
  }
}

$('calculator-form').addEventListener('submit', event => {
  event.preventDefault();
  if (!engine) return;
  try {
    const values = { date: $('birth-date').value, time: $('birth-time').value, birthplace: $('birthplace').value, offset: $('utc-offset').value };
    render(calculate(values));
    $('form-error').hidden = true;
  } catch (error) {
    $('form-error').textContent = error.message;
    $('form-error').hidden = false;
    $('copy-result').hidden = true;
  }
});

$('calculator-form').addEventListener('input', () => {
  $('form-error').hidden = true;
  if (copyText) $('copy-status').textContent = 'Details changed. Calculate again to refresh your result.';
});

$('copy-result').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(copyText);
    $('copy-status').textContent = 'Copied. Ready to paste.';
  } catch {
    $('copy-status').textContent = 'Clipboard unavailable. Select the displayed result and copy it manually.';
  }
});

initialise();
