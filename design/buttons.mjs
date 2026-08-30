import { N } from './tokens.mjs';
export const rr = h => Math.round(h / 5);
export const HAIR = 'oklch(89% 0.009 96)';
const SZ = { 24:[9,12,13], 28:[10,12.5,14], 32:[12,13,15], 36:[14,13.5,16], 44:[18,15,18] };

// Família sem fill. `solid` existe, mas é exceção declarada — uma por tela.
export const V = {
  primary:   { rot:'ação principal', fill:false },
  outline:   { rot:'ação padrão',    fill:false },
  subtle:    { rot:'em superfície densa', fill:false },
  ghost:     { rot:'terciária, toolbar', fill:false },
  link:      { rot:'navegação inline', fill:false },
  danger:    { rot:'destrutiva',     fill:false },
  solid:     { rot:'exceção — uma por tela', fill:true },
};

const S = {
  primary: {
    rest:`background:${N.brand50};color:${N.brand800};box-shadow:inset 0 0 0 1px oklch(87% 0.055 262.6);`,
    hover:`background:oklch(95% 0.03 262.6);color:${N.brand800};box-shadow:inset 0 0 0 1px oklch(82% 0.075 262.6);`,
    active:`background:oklch(92.5% 0.045 262.6);color:${N.brand800};box-shadow:inset 0 0 0 1px oklch(78% 0.09 262.6);`,
    focus:`background:${N.brand50};color:${N.brand800};box-shadow:inset 0 0 0 1px ${N.brand}, 0 0 0 2px ${N.bg}, 0 0 0 4px oklch(47% 0.185 262.6 / 0.35);`,
    disabled:`background:${N.brand50};color:${N.brand800};box-shadow:inset 0 0 0 1px oklch(87% 0.055 262.6);opacity:0.45;`,
  },
  outline: {
    rest:`background:${N.surface};color:${N.body};box-shadow:inset 0 0 0 1px ${HAIR};`,
    hover:`background:${N.surface2};color:${N.fg};box-shadow:inset 0 0 0 1px oklch(85% 0.011 96);`,
    active:`background:oklch(94.5% 0.011 96);color:${N.fg};box-shadow:inset 0 0 0 1px oklch(82% 0.012 96);`,
    focus:`background:${N.surface};color:${N.body};box-shadow:inset 0 0 0 1px ${HAIR}, 0 0 0 2px ${N.bg}, 0 0 0 4px oklch(47% 0.185 262.6 / 0.3);`,
    disabled:`background:${N.surface};color:${N.subtle};box-shadow:inset 0 0 0 1px ${HAIR};opacity:0.55;`,
  },
  subtle: {
    rest:`background:${N.surface2};color:${N.body};`,
    hover:`background:oklch(94.5% 0.011 96);color:${N.fg};`,
    active:`background:oklch(92% 0.012 96);color:${N.fg};`,
    focus:`background:${N.surface2};color:${N.body};box-shadow:0 0 0 2px ${N.bg}, 0 0 0 4px oklch(47% 0.185 262.6 / 0.3);`,
    disabled:`background:${N.surface2};color:${N.subtle};opacity:0.6;`,
  },
  ghost: {
    rest:`background:transparent;color:${N.body};`,
    hover:`background:${N.surface2};color:${N.fg};`,
    active:`background:oklch(94.5% 0.011 96);color:${N.fg};`,
    focus:`background:transparent;color:${N.body};box-shadow:0 0 0 2px ${N.bg}, 0 0 0 4px oklch(47% 0.185 262.6 / 0.3);`,
    disabled:`background:transparent;color:${N.subtle};opacity:0.6;`,
  },
  link: {
    rest:`background:transparent;color:${N.brand};`, hover:`background:transparent;color:${N.brandH};text-decoration:underline;text-underline-offset:3px;`,
    active:`background:transparent;color:oklch(35% 0.15 262.6);text-decoration:underline;text-underline-offset:3px;`,
    focus:`background:transparent;color:${N.brand};box-shadow:0 0 0 2px ${N.bg}, 0 0 0 4px oklch(47% 0.185 262.6 / 0.3);`,
    disabled:`background:transparent;color:${N.subtle};opacity:0.6;`,
  },
  danger: {
    rest:`background:${N.danger50};color:${N.danger800};box-shadow:inset 0 0 0 1px oklch(89% 0.045 27);`,
    hover:`background:oklch(95% 0.035 27);color:${N.danger800};box-shadow:inset 0 0 0 1px oklch(85% 0.065 27);`,
    active:`background:oklch(92.5% 0.05 27);color:${N.danger800};box-shadow:inset 0 0 0 1px oklch(81% 0.08 27);`,
    focus:`background:${N.danger50};color:${N.danger800};box-shadow:inset 0 0 0 1px ${N.danger}, 0 0 0 2px ${N.bg}, 0 0 0 4px oklch(55% 0.20 27 / 0.32);`,
    disabled:`background:${N.danger50};color:${N.danger800};box-shadow:inset 0 0 0 1px oklch(89% 0.045 27);opacity:0.45;`,
  },
  solid: {
    rest:`background:${N.brand};color:#fff;`, hover:`background:oklch(52% 0.185 262.6);color:#fff;`,
    active:`background:oklch(42% 0.175 262.6);color:#fff;`,
    focus:`background:${N.brand};color:#fff;box-shadow:0 0 0 2px ${N.bg}, 0 0 0 4px oklch(47% 0.185 262.6 / 0.45);`,
    disabled:`background:${N.brand};color:#fff;opacity:0.38;`,
  },
};

export const btn = (variant, h = 32, state = 'rest', k = 1) => {
  const [px, fs] = [SZ[h][0] * k, SZ[h][1] * k];
  const pad = variant === 'link' ? 0 : px;
  return `<span style="height:${h*k}px;padding:0 ${pad}px;border-radius:${rr(h)*k}px;font-size:${fs}px;font-weight:500;letter-spacing:-0.005em;display:inline-flex;align-items:center;justify-content:center;gap:${6*k}px;white-space:nowrap;flex-shrink:0;box-sizing:border-box;${S[variant][state]}">`;
};
export const ibtn = (variant, h = 32, state = 'rest', icon = '') =>
  `<span style="width:${h}px;height:${h}px;border-radius:${rr(h)}px;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;box-sizing:border-box;${S[variant][state]}">${icon}</span>`;
export const SIZES = [24, 28, 32, 36, 44];
