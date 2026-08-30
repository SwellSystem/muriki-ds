import { N, R } from './tokens.mjs';
const INK = 'oklch(32% 0.02 248.5';
export const HAIR = 'oklch(89% 0.009 96)';

// ── A REGRA: raio proporcional à altura. r = round(h/5)
export const rr = h => Math.round(h / 5);          // 24→5 28→6 32→6 36→7 44→9
export const CARD_R = 14;                           // recipiente mais macio que o controle

const SZ = { 24:[9,12], 28:[10,12.5], 32:[12,13], 36:[14,13.5], 44:[18,15] };

// ── v2 (atual): CHAPADO. sem gradiente, sem brilho, sem sombra em botão.
export const btn = (variant, h = 32, state = 'rest', k = 1) => {
  const [px, fs] = [SZ[h][0] * k, SZ[h][1] * k];
  const hair = `inset 0 0 0 ${k}px ${HAIR}`;
  const focus = c => `0 0 0 ${2*k}px ${N.bg}, 0 0 0 ${4*k}px ${c}`;
  const V = {
    primary: { rest:`background:${N.brand};color:#fff;`, hover:`background:oklch(52% 0.185 262.6);color:#fff;`,
      active:`background:oklch(42% 0.175 262.6);color:#fff;`,
      focus:`background:${N.brand};color:#fff;box-shadow:${focus('oklch(47% 0.185 262.6 / 0.45)')};`,
      disabled:`background:${N.brand};color:#fff;opacity:0.38;` },
    neutral: { rest:`background:${N.surface};color:${N.body};box-shadow:${hair};`,
      hover:`background:${N.surface2};color:${N.fg};box-shadow:inset 0 0 0 ${k}px oklch(86% 0.01 96);`,
      active:`background:oklch(94.5% 0.011 96);color:${N.fg};box-shadow:inset 0 0 0 ${k}px oklch(84% 0.011 96);`,
      focus:`background:${N.surface};color:${N.body};box-shadow:${hair}, ${focus('oklch(47% 0.185 262.6 / 0.35)')};`,
      disabled:`background:${N.surface};color:${N.subtle};box-shadow:${hair};opacity:0.55;` },
    ghost: { rest:`background:transparent;color:${N.body};`, hover:`background:${N.surface2};color:${N.fg};`,
      active:`background:oklch(94.5% 0.011 96);color:${N.fg};`,
      focus:`background:transparent;color:${N.body};box-shadow:${focus('oklch(47% 0.185 262.6 / 0.35)')};`,
      disabled:`background:transparent;color:${N.subtle};opacity:0.6;` },
    accent: { rest:`background:${N.acc};color:oklch(26% 0.022 250);`, hover:`background:oklch(91% 0.178 95);color:oklch(26% 0.022 250);`,
      active:`background:${N.accH};color:oklch(26% 0.022 250);`,
      focus:`background:${N.acc};color:oklch(26% 0.022 250);box-shadow:${focus('oklch(75% 0.16 90 / 0.55)')};`,
      disabled:`background:${N.acc};color:oklch(26% 0.022 250);opacity:0.38;` },
    danger: { rest:`background:${N.danger};color:#fff;`, hover:`background:oklch(59% 0.20 27);color:#fff;`,
      active:`background:oklch(49% 0.19 27);color:#fff;`,
      focus:`background:${N.danger};color:#fff;box-shadow:${focus('oklch(55% 0.20 27 / 0.45)')};`,
      disabled:`background:${N.danger};color:#fff;opacity:0.38;` },
  }[variant][state];
  const press = state === 'active' ? 'transform:translateY(0.5px);' : '';
  return `<span style="height:${h*k}px;padding:0 ${px}px;border-radius:${rr(h)*k}px;font-size:${fs}px;font-weight:500;letter-spacing:-0.005em;display:inline-flex;align-items:center;justify-content:center;gap:${6*k}px;white-space:nowrap;flex-shrink:0;box-sizing:border-box;${V}${press}">`;
};

export const input = (state = 'rest', h = 32, k = 1) => {
  const [px, fs] = [SZ[h][0] * k - 1, SZ[h][1] * k];
  const hair = c => `inset 0 0 0 ${k}px ${c}`;
  const V = {
    rest:`background:${N.surface};box-shadow:${hair(HAIR)};`,
    hover:`background:${N.surface};box-shadow:${hair('oklch(84% 0.011 96)')};`,
    focus:`background:${N.surface};box-shadow:${hair(N.brand)}, 0 0 0 ${3*k}px oklch(47% 0.185 262.6 / 0.16);`,
    error:`background:${N.surface};box-shadow:${hair(N.danger)}, 0 0 0 ${3*k}px oklch(55% 0.20 27 / 0.13);`,
    disabled:`background:${N.surface2};box-shadow:${hair(HAIR)};opacity:0.7;`,
  }[state];
  return `height:${h*k}px;padding:0 ${px}px;border-radius:${rr(h)*k}px;font-size:${fs}px;display:flex;align-items:center;gap:${8*k}px;box-sizing:border-box;${V}`;
};

export const card = (pad = 20, r = CARD_R) => `background:${N.surface};border-radius:${r}px;padding:${pad}px;box-shadow:inset 0 0 0 1px ${HAIR};`;
export const raised = (pad = 20, r = CARD_R) => `background:${N.surface};border-radius:${r}px;padding:${pad}px;box-shadow:inset 0 0 0 1px ${HAIR}, 0 4px 14px ${INK} / 0.06), 0 1px 3px ${INK} / 0.04);`;

// ── gerações anteriores, só para a prancha de comparação ──
// g1: chapado genérico, raio 8 constante, borda cinza dura
export const btnG1 = (variant, h = 32, k = 1) => {
  const [px, fs] = [SZ[h][0] * k, SZ[h][1] * k];
  const V = { primary:`background:${N.brand};color:#fff;border:1px solid transparent;`,
    neutral:`background:${N.surface};color:${N.body};border:1px solid ${N.borderStrong};`,
    accent:`background:${N.acc};color:oklch(26% 0.022 250);border:1px solid transparent;` }[variant];
  return `<span style="height:${h*k}px;padding:0 ${px}px;border-radius:${8*k}px;font-size:${fs}px;font-weight:500;display:inline-flex;align-items:center;justify-content:center;gap:${6*k}px;white-space:nowrap;box-sizing:border-box;${V}">`;
};
// g2: a textura que não colou — gradiente, brilho no topo, sombra
export const btnG2 = (variant, h = 32, k = 1) => {
  const [px, fs] = [SZ[h][0] * k, SZ[h][1] * k];
  const V = {
    primary:`background:linear-gradient(180deg, oklch(51% 0.185 262.6), oklch(45% 0.185 262.6));color:#fff;box-shadow:inset 0 1px 0 oklch(100% 0 0 / 0.18), 0 0 0 1px oklch(41% 0.17 262.6), 0 1px 2px ${INK} / 0.20);`,
    neutral:`background:linear-gradient(180deg, oklch(100% 0 0), ${N.surface});color:${N.body};box-shadow:0 0 0 1px ${HAIR}, 0 1px 2px ${INK} / 0.06);`,
    accent:`background:linear-gradient(180deg, oklch(90% 0.175 95), ${N.acc});color:oklch(26% 0.022 250);box-shadow:inset 0 1px 0 oklch(100% 0 0 / 0.45), 0 0 0 1px oklch(78% 0.16 90), 0 1px 2px ${INK} / 0.16);`,
  }[variant];
  return `<span style="height:${h*k}px;padding:0 ${px}px;border-radius:${8*k}px;font-size:${fs}px;font-weight:500;display:inline-flex;align-items:center;justify-content:center;gap:${6*k}px;white-space:nowrap;box-sizing:border-box;${V}">`;
};
export const inputG1 = (h = 32, k = 1) => `height:${h*k}px;padding:0 ${11*k}px;border-radius:${8*k}px;font-size:${13*k}px;display:flex;align-items:center;box-sizing:border-box;background:${N.surface};border:1px solid ${N.borderInput};`;
export const inputG2 = (h = 32, k = 1) => `height:${h*k}px;padding:0 ${11*k}px;border-radius:${8*k}px;font-size:${13*k}px;display:flex;align-items:center;box-sizing:border-box;background:${N.surface};box-shadow:inset 0 1px 2px ${INK} / 0.055), 0 0 0 1px ${HAIR};`;
