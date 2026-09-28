import { readdirSync, readFileSync } from 'fs';
let ok = true;
const R=(process.env.SITE_ROOT || '/workspace/site-audit') + '/horoscope';
const dirs = readdirSync(R);
console.log('页面'.padEnd(30),'schema  锚点  符号  内部链接  字数');
for (const d of dirs) {
  const f = `${R}/${d}/daily/index.html`;
  const h = readFileSync(f,'utf8');
  let sc='—';
  try {
    const blocks = [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
    const t = blocks.flatMap(b=>b['@graph']||[]).map(n=>n['@type']);
    sc = t.length+'类'+(t.length?'✅':'❌'); if(!t.length) ok=false;
  } catch(e){ sc='❌'; ok=false; }
  const ids = new Set([...h.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));
  const anc = new Set([...h.matchAll(/href="#([^"]+)"/g)].map(m=>m[1]));
  const bad = [...anc].filter(a=>!ids.has(a));
  const syms='♈♉♊♋♌♍♎♏♐♑♒♓', naked=syms.split('').reduce((n,s)=>n+((h.match(new RegExp(s+'(?!︎)','g'))||[]).length),0);
  const il = new Set([...h.matchAll(/href="(\/[^"]+)"/g)].map(m=>m[1])).size;
  const body = h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g,'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
  console.log(`/horoscope/${d}/daily/`.padEnd(30), sc.padEnd(6), (bad.length?'❌'+bad.length:'✅').padEnd(5), (naked?'❌'+naked:'✅').padEnd(5), String(il).padStart(4), String(body.split(' ').length).padStart(6));
  if(bad.length||naked) ok=false;
}
console.log('\n'+(ok?'✅ 12 个 daily 页全部通过':'❌ 有问题'));
process.exit(ok?0:1);
