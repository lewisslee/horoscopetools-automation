// 星座配对引擎 —— 计分规则全部透明，不藏黑箱。
// 三层：结构层（静态、可推导） + 当日行运层（真算、每天变）
import { SIGNS, ELEMENT_OF, OPPOSITE, MODALITY } from './reading.mjs';

export const ELEMENT_LABEL = { fire:'Fire', earth:'Earth', air:'Air', water:'Water' };
export const ELEMENT_CN = { fire:'火', earth:'土', air:'风', water:'水' };
export const ELEM_COLOR = { fire:'#ff7a7a', earth:'#7ad19a', air:'#ffd166', water:'#6fb7ff' };

// 元素关系矩阵（传统四元素相生相克）
const ELEMENT_REL = {
  //        火     土     风     水
  fire:  { fire: 78, earth: 52, air: 88, water: 38 },
  earth: { fire: 52, earth: 82, air: 44, water: 76 },
  air:   { fire: 88, earth: 44, air: 84, water: 58 },
  water: { fire: 38, earth: 76, air: 58, water: 80 },
};
const ELEMENT_WHY = {
  'fire|fire': 'Two of the same element. Double the drive, double the impatience — and nobody is holding the brake.',
  'fire|air': 'Fire needs air to burn. These two fuel each other, which is why the spark is usually instant.',
  'fire|earth': 'Heat meets resistance. One moves fast, one moves slow, and the friction is genuinely useful.',
  'fire|water': 'The classic difficult pairing. Fire feels steam-blasted by water; water feels drowned by fire.',
  'earth|earth': 'Solid ground under solid ground. Stable and slow, and extremely hard to move once settled.',
  'earth|air': 'Air scatters what earth tries to build. One plans, one talks about the plan.',
  'earth|water': 'Water feeds earth. This is the quietly nourishing pairing most people underestimate.',
  'air|air': 'Two minds, two directions. Brilliant conversation that forgets to land anywhere.',
  'air|water': 'Air lifts water into mist. Either you get insight, or you get vagueness.',
  'water|water': 'Same element, deep water. You understand each other too well to argue, and too well to be surprised.',
};
// 固定相生序 fire>earth>air>water 归一化，避免按字母序产生 earth|fire 这种查不到的 key
const ELEM_ORDER = ['fire','earth','air','water'];
const ekey = (a, b) => {
  const ea = ELEMENT_OF[a], eb = ELEMENT_OF[b];
  return ELEM_ORDER.indexOf(ea) <= ELEM_ORDER.indexOf(eb) ? `${ea}|${eb}` : `${eb}|${ea}`;
};

// 模式关系
function modalityRel(a, b) {
  const ma = MODALITY[SIGNS.indexOf(a)], mb = MODALITY[SIGNS.indexOf(b)];
  if (ma === mb) return {
    score: ma === 'Fixed' ? 58 : ma === 'Cardinal' ? 68 : 60,
    why: `Both ${ma.toLowerCase()}. ${ma === 'Fixed' ? 'Stubborn meets stubborn — nothing moves until something cracks.'
        : ma === 'Cardinal' ? 'Two initiators compete for the wheel, then usually end up going the same direction.'
        : 'Two adaptors keep reshaping the plan until nobody remembers the original.'}`,
  };
  const pairs = { 'Cardinal|Fixed': [66, 'One starts, one holds. It works until the holder stops moving.'],
                  'Cardinal|Mutable': [74, 'One starts, one adjusts. Usually the fastest-working combination.'],
                  'Fixed|Mutable': [70, 'One holds, one adapts. Complementary, as long as the holder forgives.'] };
  const k = [ma, mb].sort().join('|');
  return { score: pairs[k][0], why: pairs[k][1] };
}

/** 结构层评分 0-100 */
export function structural(a, b) {
  if (a === b) {
    return { score: 76, tier: 'Mirror',
      why: `Identical signs. You move through the world the same way and neither of you will ever be surprised by the other — which is exactly the risk. ${ELEMENT_WHY[ekey(a,b)]}`,
      element: ELEMENT_OF[a], modality: MODALITY[SIGNS.indexOf(a)] };
  }
  if (OPPOSITE[a] === b) {
    return { score: 80, tier: 'Axis',
      why: `Opposite signs — the two ends of the same axis. ${ELEMENT_WHY[ekey(a,b)]} The attraction is real and so is the friction; they come from the same place.`,
      element: ELEMENT_OF[a], modality: MODALITY[SIGNS.indexOf(a)] };
  }
  const ea = ELEMENT_REL[ELEMENT_OF[a]][ELEMENT_OF[b]];
  const ma = modalityRel(a, b);
  const score = Math.round(ea * 0.6 + ma.score * 0.4);
  return { score, tier: score >= 76 ? 'Easy' : score >= 58 ? 'Workable' : 'Growth',
    why: ELEMENT_WHY[ekey(a, b)], element: ELEMENT_OF[a], modality: MODALITY[SIGNS.indexOf(a)] };
}

export function tierOf(score) {
  return score >= 80 ? 'Exceptional' : score >= 72 ? 'Easy' : score >= 60 ? 'Workable' : 'Growth';
}

export function tierColor(score) {
  return score >= 78 ? '#f0d088' : score >= 68 ? '#a986ff' : score >= 56 ? '#7c8bb5' : '#5a5270';
}

/** 配对 slug：字母序，保证 a-t 与 t-a 指向同一页 */
export function pairSlug(a, b) {
  return [a, b].sort((x, y) => SIGNS.indexOf(x) - SIGNS.indexOf(y)).map(s => s.toLowerCase()).join('-');
}
export function pairNames(slug) {
  const [x, y] = slug.split('-');
  return [x[0].toUpperCase() + x.slice(1), y[0].toUpperCase() + y.slice(1)];
}
export function allPairs() {
  const out = [];
  for (let i = 0; i < 12; i++)
    for (let j = i + 1; j < 12; j++)
      out.push([SIGNS[i], SIGNS[j]]);
  return out;
}
export { SIGNS, ELEMENT_OF, OPPOSITE, MODALITY };

// ─────────────────────────────────────────────────────────
// 当日行运层：找出同时作用于两个星座的天体
// 这是配对页与静态内容站的真正区别——每天都不一样
// ─────────────────────────────────────────────────────────
import { planetOrder, GLYPH } from './transits.mjs';
import { relation } from './reading.mjs';

export function sharedTransits(positions, a, b, n = 3) {
  const ia = SIGNS.indexOf(a), ib = SIGNS.indexOf(b);
  const rows = [];
  for (const name of planetOrder) {
    const pos = positions[name];
    const ra = relation(name, pos, ia);
    const rb = relation(name, pos, ib);
    // 必须对双方都有可感知的作用
    if (ra.weight < 46 && rb.weight < 46) continue;
    const total = ra.weight + rb.weight;
    const both = ra.weight >= 56 && rb.weight >= 56;
    rows.push({
      name, glyph: GLYPH[name], sign: pos.sign, deg: pos.degInSign,
      a: ra, b: rb, total, both, score: total + (both ? 20 : 0),
    });
  }
  return rows.sort((x, y) => y.score - x.score).slice(0, n);
}

export function sharedHeadline(rows) {
  if (!rows.length) return 'Nothing in the sky is pressing on this pairing today.';
  const t = rows[0];
  if (t.both) return `${t.name} in ${t.sign} is working on both signs at once`;
  return `${t.name} in ${t.sign} is the main thing touching this pairing today`;
}
