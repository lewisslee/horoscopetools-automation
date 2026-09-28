import { readdirSync, readFileSync, statSync } from 'fs';
import { allPairs, pairSlug } from './compat.mjs';
const R=(process.env.SITE_ROOT || '/workspace/site-audit') + '/compatibility';
let files=[]; for(const d of readdirSync(R)){ const p=`${R}/${d}/index.html`; try{statSync(p);files.push({d,p})}catch(e){} }
try{ statSync(`${R}/index.html`); files.push({d:'/ (hub)', p:`${R}/index.html`}); }catch(e){}
let bad=0, dead=0, minWords=1e9, total=0;
const syms='♈♉♊♋♌♍♎♏♐♑♒♓';
for(const f of files){
  const h=readFileSync(f.p,'utf8');
  // schema
  try{ for(const m of h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) JSON.parse(m[1]); }catch(e){ console.log('❌ JSON',f.d); bad++; }
  // 裸符号
  const naked=syms.split('').reduce((n,s)=>n+((h.match(new RegExp(s+'(?!︎)','g'))||[]).length),0);
  if(naked){ console.log('❌ 裸符号',f.d,naked); bad++; }
  // 锚点
  const ids=new Set([...h.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));
  const dang=[...new Set([...h.matchAll(/href="#([^"]+)"/g)].map(m=>m[1]))].filter(a=>!ids.has(a));
  if(dang.length){ console.log('❌ 悬空锚点',f.d,dang); bad++; }
  // 死链
  for(const m of h.matchAll(/href="(\/compatibility\/[a-z\-\/]*)"/g)){
    const raw=m[1].replace(/\/$/,'');
    const target = raw === '/compatibility' ? `${R}/index.html` : `${R}/${raw.split('/').pop()}/index.html`;
    try{ statSync(target); }catch(e){ console.log('❌ 死链',f.d,'→',m[1]); dead++; }
  }
  const body=h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g,'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
  const w=body.split(' ').length; total+=w; if(w<minWords) minWords=w;
}
console.log(`\n页面 ${files.length} · 平均 ${Math.round(total/files.length)} 词 · 最短 ${minWords} 词`);
console.log(`期望 ${1+12+allPairs().length} 页 · 实际 ${files.length} 页 ${files.length===1+12+allPairs().length?'✅':'❌'}`);
console.log(bad===0&&dead===0 ? '✅ 全部通过' : `❌ schema/符号/锚点 ${bad} 处 · 死链 ${dead} 处`);
process.exit(bad+dead===0?0:1);
