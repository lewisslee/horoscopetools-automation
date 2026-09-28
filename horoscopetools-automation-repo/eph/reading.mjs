// 行运相关度引擎 —— 把"今天天上发生什么"翻译成"跟哪个星座有关、怎么有关"。
import { SIGNS, GLYPH, planetOrder } from './transits.mjs';

export const ELEMENTS = { fire:'Fire', earth:'Earth', air:'Air', water:'Water' };
export const ELEMENT_OF = {
  Aries:'fire', Leo:'fire', Sagittarius:'fire',
  Taurus:'earth', Virgo:'earth', Capricorn:'earth',
  Gemini:'air', Libra:'air', Aquarius:'air',
  Cancer:'water', Scorpio:'water', Pisces:'water',
};
export const OPPOSITE = { Aries:'Libra', Taurus:'Scorpio', Gemini:'Sagittarius',
  Cancer:'Capricorn', Leo:'Aquarius', Virgo:'Pisces', Libra:'Aries',
  Scorpio:'Taurus', Sagittarius:'Gemini', Capricorn:'Cancer',
  Aquarius:'Leo', Pisces:'Virgo' };

// 行星个性：决定这句话读起来像不像人话
const PLANET_NOTE = {
  Sun:    'identity, vitality and what you are consciously trying to be',
  Moon:   'emotional weather, memory and what you need in order to feel safe',
  Mercury:'communication, thinking and the shape your ideas take',
  Venus:  'attachment, money, taste and the things you find hard to want',
  Mars:   'drive, anger, desire and how you pursue what you want',
  Jupiter:'meaning, growth and where things expand by luck or nerve',
  Saturn: 'structure, limits and the things that cost effort to hold',
  Uranus: 'disruption, freedom and the impulse to break the pattern',
  Neptune:'doubt, imagination and the fog between feeling and fact',
  Pluto:  'power, compulsion and the thing underneath you cannot quite name',
};

const DEGREE_PHRASE = (d) => {
  if (d < 3)  return 'and has only just entered it';
  if (d < 7)  return 'and is applying strongly';
  if (d < 14) return 'and is applying';
  if (d < 21) return 'and is already separating';
  return 'and is deep in it';
};

/**
 * 判定某颗行星与目标星座的关系。
 * 返回 { weight, kind, label, why }
 */
export function relation(planet, pos, targetIdx) {
  const d = (pos.signIndex - targetIdx + 12) % 12;   // 相对星座
  const deg = pos.degInSign;
  const sameEl = ELEMENT_OF[SIGNS[pos.signIndex]] === ELEMENT_OF[SIGNS[targetIdx]];
  const sameMod = MODALITY[pos.signIndex] === MODALITY[targetIdx];

  if (d === 0) {
    const strength = deg < 7 ? 'direct' : 'wide';
    return { weight: strength === 'direct' ? 92 : 54, kind: 'in', label: 'is in',
      why: `It is moving through ${pos.sign} itself ${DEGREE_PHRASE(deg)}.` };
  }
  if (d === 6) {
    const strength = deg < 12 || deg > 18 ? 'direct' : 'wide';
    return { weight: strength === 'direct' ? 84 : 66, kind: 'opposition', label: 'is opposing',
      why: `It sits opposite in ${pos.sign} ${DEGREE_PHRASE(deg)} — the classic push-pull.` };
  }
  if (d === 3 || d === 9) {
    const strength = deg < 10 ? 'direct' : 'wide';
    return { weight: strength === 'direct' ? 70 : 56, kind: 'square', label: 'is squaring',
      why: `It stands at a right angle from ${pos.sign} ${DEGREE_PHRASE(deg)} — friction that forces movement.` };
  }
  if (d === 2 || d === 10) {
    const strength = deg < 8 ? 'direct' : 'wide';
    return { weight: strength === 'direct' ? 62 : 50, kind: 'sextile', label: 'is supporting',
      why: `It reaches ${pos.sign} by sextile ${DEGREE_PHRASE(deg)} — a low-effort opening.` };
  }
  if (d === 1 || d === 11) {
    return { weight: 58, kind: 'semi', label: 'is in a friendly aspect',
      why: `It sits beside ${pos.sign} ${DEGREE_PHRASE(deg)} — background support, nothing dramatic.` };
  }
  if (d === 4 || d === 8) {
    return { weight: 54, kind: 'semi', label: 'is in a workable aspect',
      why: `It connects to ${pos.sign} by semisextile ${DEGREE_PHRASE(deg)} — indirect but usable.` };
  }
  if (d === 5 || d === 7) {
    return { weight: 46, kind: 'quincunx', label: 'is out of phase',
      why: `It is quincunx to ${pos.sign} ${DEGREE_PHRASE(deg)} — you will not read it correctly.` };
  }
  // 相位 7、11 之外的远相位
  return { weight: 34, kind: 'far', label: 'is remote',
    why: `It is far from ${pos.sign} ${DEGREE_PHRASE(deg)} — background noise today.` };
}

export const MODALITY = ['Cardinal','Fixed','Mutable','Cardinal','Fixed','Mutable',
  'Cardinal','Fixed','Mutable','Cardinal','Fixed','Mutable'];

/** 为目标星座排出今日最值得说的 4-5 个行运 */
export function topTransits(positions, targetIdx, n = 5) {
  return planetOrder.map(name => {
    const pos = positions[name];
    const r = relation(name, pos, targetIdx);
    // 月亮与目标星座同元素 = 情绪共振，加权；火星 = 行动压力，加权
    let boost = 0;
    const near = pos.degInSign < 7 || pos.degInSign > 23;   // 紧合 / 拱
    if (name === 'Moon' && near) boost += 14;
    if (name === 'Moon' && ELEMENT_OF[pos.sign] === ELEMENT_OF[SIGNS[targetIdx]]) boost += 8;
    if (name === 'Mars' && (r.kind === 'opposition' || r.kind === 'square')) boost += 6;
    if (name === 'Venus' && r.kind === 'in' && pos.degInSign < 10) boost += 6;
    if (name === 'Sun' && r.kind === 'in' && pos.degInSign < 10) boost += 5;
    return { name, glyph: GLYPH[name], sign: pos.sign, deg: pos.degInSign, ...r, boost };
  })
  .map(t => ({ ...t, score: t.weight + t.boost }))
  .sort((a, b) => b.score - a.score || planetOrder.indexOf(a.name) - planetOrder.indexOf(b.name))
  .slice(0, n);
}

export function planetNote(name) { return PLANET_NOTE[name]; }

export const ORB = (t) => t.deg < 7 ? 'tight' : t.deg < 15 ? 'close' : 'wide';

export function headline(positions, targetIdx) {
  const moon = positions.Moon, sun = positions.Sun;
  const moonInTarget = moon.signIndex === targetIdx;
  const sunInTarget = sun.signIndex === targetIdx;
  const moonEl = ELEMENT_OF[moon.sign] === ELEMENT_OF[SIGNS[targetIdx]];

  if (moonInTarget) return `Moon in ${moon.sign}`;
  if (moonEl) return `Moon in ${moon.sign}, same element as ${SIGNS[targetIdx]}`;
  if (sunInTarget) return `Sun in ${SIGNS[targetIdx]}`;
  return `Moon in ${moon.sign} over ${SIGNS[targetIdx]}`;
}

export { SIGNS, GLYPH, planetOrder };
