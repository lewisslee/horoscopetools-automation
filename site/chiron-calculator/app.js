import SwissEph from './engine/swiss-api.js';

const signs=['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const $=id=>document.getElementById(id);
const norm=x=>((x%360)+360)%360;
let engine=null, copyText='';

function hours(value){const [hour,minute]=value.split(':').map(Number);return hour+minute/60}
function displayDegree(longitude){const degree=norm(longitude)%30;return `${degree.toFixed(2)}° ${signs[Math.floor(norm(longitude)/30)]}`}
function localDayBounds(date,offset){const [year,month,day]=date.split('-').map(Number);return {year,month,day,startUtc:-offset,endUtc:24-offset}}
function ready(){return engine!==null}
function setState(text){$('engine-state').textContent=text}

async function initialise(){
  try{
    engine=new SwissEph();
    await engine.initSwissEph();
    setState('LOCAL MODEL READY');
    $('calculate').disabled=false;
  }catch(error){
    setState('MODEL UNAVAILABLE');
    $('form-error').textContent='The local calculation model could not start. No result was generated.';
    $('form-error').hidden=false;
  }
}

function validate(values){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(values.date))throw new Error('Enter a valid birth date.');
  const [year,month,day]=values.date.split('-').map(Number);
  const check=new Date(Date.UTC(year,month-1,day));
  if(year<1800||year>2399||check.getUTCMonth()!==month-1||check.getUTCDate()!==day)throw new Error('Use a valid date from 1800 through 2399.');
  if(values.offset===''||!Number.isFinite(Number(values.offset))||Math.abs(Number(values.offset))>14)throw new Error('Enter the UTC offset at birth, between −14 and +14 hours.');
  if(values.time&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(values.time))throw new Error('Enter a valid birth time or leave it blank.');
  const coordinatePresent=values.lat!==''||values.lon!=='';
  if(coordinatePresent&&(!Number.isFinite(Number(values.lat))||!Number.isFinite(Number(values.lon))||Math.abs(Number(values.lat))>89.9||Math.abs(Number(values.lon))>180))throw new Error('Use latitude −89.9 to +89.9 and longitude −180 to +180.');
  return {year,month,day,offset:Number(values.offset),withTime:Boolean(values.time),withCoordinates:coordinatePresent};
}

function chironAt(year,month,day,utcHour){
  const julianDay=engine.julday(year,month,day,utcHour);
  return norm(engine.calc_ut(julianDay,engine.SE_CHIRON,engine.SEFLG_SWIEPH)[0]);
}

function calculate(values){
  const valid=validate(values);
  const {year,month,day,offset,withTime,withCoordinates}=valid;
  const at=withTime?hours(values.time)-offset:null;
  const longitude=withTime?chironAt(year,month,day,at):null;
  const bounds=localDayBounds(values.date,offset);
  const start=withTime?longitude:chironAt(bounds.year,bounds.month,bounds.day,bounds.startUtc);
  const end=withTime?longitude:chironAt(bounds.year,bounds.month,bounds.day,bounds.endUtc);
  let house=null, houseNote='Cannot determine — add a birth time and both coordinates.';
  if(withTime&&withCoordinates){
    const jd=engine.julday(year,month,day,at);
    const houses=engine.houses(jd,Number(values.lat),Number(values.lon),'P');
    const ascendant=norm(houses.ascmc[0]);
    house=((Math.floor(longitude/30)-Math.floor(ascendant/30)+12)%12)+1;
    houseNote='Whole Sign house · ascendant from Placidus horizon calculation';
  }else if(withTime){houseNote='Cannot determine — add both coordinates for a house.'}
  return {values,valid,start,end,longitude,house,houseNote};
}

function resultLabel(result){
  if(result.valid.withTime)return {sign:signs[Math.floor(result.longitude/30)],degree:displayDegree(result.longitude),note:`Birth time: ${result.values.time}. UTC ${(result.valid.offset>=0?'+':'')+result.valid.offset}.`};
  const sameSign=Math.floor(result.start/30)===Math.floor(result.end/30);
  return {sign:sameSign?signs[Math.floor(result.start/30)]:'Cannot determine',degree:`${displayDegree(result.start)} – ${displayDegree(result.end)} · local-day range`,note:`Birth time unknown. Range covers the local calendar day at UTC ${(result.valid.offset>=0?'+':'')+result.valid.offset}.`};
}

function render(result){
  const label=resultLabel(result);
  const meaning=label.sign==='Cannot determine'?'The local-day range crosses a sign boundary. Add a recorded birth time to resolve the sign.':`Chiron is shown in the tropical zodiac at the calculated longitude above. Interpret the sign only after confirming your birth details.`;
  $('result').innerHTML=`<div class="placement-card"><div class="kicker"><span>Chiron</span><span class="symbol" aria-hidden="true">⚷</span></div><h3>${label.sign}</h3><div class="degree">${label.degree}</div><p class="house">${result.house?`House ${result.house} · ${result.houseNote}`:result.houseNote}</p></div><p class="result-note">${label.note}</p><p class="result-note">${meaning}</p><p class="result-note">Tropical zodiac · geocentric Chiron · locally calculated</p>`;
  copyText=`Chiron: ${label.sign} ${label.degree}\n${result.house?`Whole Sign house: ${result.house}`:result.houseNote}\n${label.note}\nTropical zodiac · geocentric Chiron`;
  $('copy-result').hidden=false;$('copy-status').textContent='';
}

$('calculator-form').addEventListener('submit',event=>{
  event.preventDefault();
  if(!ready())return;
  try{
    const values={date:$('birth-date').value,time:$('birth-time').value,offset:$('utc-offset').value,lat:$('latitude').value,lon:$('longitude').value};
    render(calculate(values));
    $('form-error').hidden=true;
  }catch(error){$('form-error').textContent=error.message;$('form-error').hidden=false;$('copy-result').hidden=true;}
});
$('calculator-form').addEventListener('input',()=>{$('form-error').hidden=true; if(copyText)$('copy-status').textContent='Details changed. Calculate again to refresh your result.';});
$('copy-result').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(copyText);$('copy-status').textContent='Copied. Ready to paste.'}catch{$('copy-status').textContent='Clipboard unavailable. Select the result text and copy it manually.'}});

initialise();
