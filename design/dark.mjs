// Espelho do sistema claro. Regra: superfície sobe de luz, tinta desce; fundo de badge
// vai para L≈30% e a tinta para L≈85% — a mesma matiz, a luz invertida.
export const D = {
  bg:'oklch(19% 0.008 250)', surface:'oklch(22.5% 0.009 250)', surface2:'oklch(26.5% 0.010 250)',
  surface3:'oklch(30% 0.011 250)',
  fg:'oklch(96% 0.004 250)', body:'oklch(90% 0.006 250)', muted:'oklch(70% 0.012 250)', subtle:'oklch(56% 0.014 250)',
  hair:'oklch(31% 0.010 250)', hairStrong:'oklch(40% 0.012 250)',
  brand:'oklch(70% 0.145 262.6)', brandDim:'oklch(60% 0.16 262.6)',
  brandSub:'oklch(28% 0.060 262.6)', brandSubLine:'oklch(38% 0.090 262.6)', brandInk:'oklch(84% 0.100 262.6)',
  acc:'oklch(83% 0.165 93)', accInk:'oklch(20% 0.02 100)',
  danger:'oklch(68% 0.180 27)', dangerSub:'oklch(27% 0.060 27)', dangerSubLine:'oklch(37% 0.090 27)', dangerInk:'oklch(83% 0.100 27)',
  success:'oklch(72% 0.130 150)',
};
export const rr = h => Math.round(h / 5);
const SZ = { 24:[9,12], 28:[10,12.5], 32:[12,13], 36:[14,13.5], 44:[18,15] };
const S = {
  primary: {
    rest:`background:${D.brandSub};color:${D.brandInk};box-shadow:inset 0 0 0 1px ${D.brandSubLine};`,
    hover:`background:oklch(32% 0.07 262.6);color:${D.brandInk};box-shadow:inset 0 0 0 1px oklch(43% 0.10 262.6);`,
    active:`background:oklch(25% 0.055 262.6);color:${D.brandInk};box-shadow:inset 0 0 0 1px oklch(40% 0.095 262.6);`,
    focus:`background:${D.brandSub};color:${D.brandInk};box-shadow:inset 0 0 0 1px ${D.brand}, 0 0 0 2px ${D.bg}, 0 0 0 4px oklch(70% 0.145 262.6 / 0.4);`,
    disabled:`background:${D.brandSub};color:${D.brandInk};box-shadow:inset 0 0 0 1px ${D.brandSubLine};opacity:0.4;` },
  outline: {
    rest:`background:transparent;color:${D.body};box-shadow:inset 0 0 0 1px ${D.hairStrong};`,
    hover:`background:${D.surface2};color:${D.fg};box-shadow:inset 0 0 0 1px oklch(46% 0.013 250);`,
    active:`background:${D.surface};color:${D.fg};box-shadow:inset 0 0 0 1px oklch(44% 0.013 250);`,
    focus:`background:transparent;color:${D.body};box-shadow:inset 0 0 0 1px ${D.hairStrong}, 0 0 0 2px ${D.bg}, 0 0 0 4px oklch(70% 0.145 262.6 / 0.35);`,
    disabled:`background:transparent;color:${D.subtle};box-shadow:inset 0 0 0 1px ${D.hair};opacity:0.6;` },
  subtle: {
    rest:`background:${D.surface2};color:${D.body};`, hover:`background:${D.surface3};color:${D.fg};`,
    active:`background:${D.surface};color:${D.fg};`,
    focus:`background:${D.surface2};color:${D.body};box-shadow:0 0 0 2px ${D.bg}, 0 0 0 4px oklch(70% 0.145 262.6 / 0.35);`,
    disabled:`background:${D.surface2};color:${D.subtle};opacity:0.6;` },
  ghost: {
    rest:`background:transparent;color:${D.body};`, hover:`background:${D.surface2};color:${D.fg};`,
    active:`background:${D.surface};color:${D.fg};`,
    focus:`background:transparent;color:${D.body};box-shadow:0 0 0 2px ${D.bg}, 0 0 0 4px oklch(70% 0.145 262.6 / 0.35);`,
    disabled:`background:transparent;color:${D.subtle};opacity:0.6;` },
  link: {
    rest:`background:transparent;color:${D.brand};`, hover:`background:transparent;color:oklch(78% 0.12 262.6);text-decoration:underline;text-underline-offset:3px;`,
    active:`background:transparent;color:${D.brandDim};text-decoration:underline;text-underline-offset:3px;`,
    focus:`background:transparent;color:${D.brand};box-shadow:0 0 0 2px ${D.bg}, 0 0 0 4px oklch(70% 0.145 262.6 / 0.35);`,
    disabled:`background:transparent;color:${D.subtle};opacity:0.6;` },
  danger: {
    rest:`background:${D.dangerSub};color:${D.dangerInk};box-shadow:inset 0 0 0 1px ${D.dangerSubLine};`,
    hover:`background:oklch(31% 0.07 27);color:${D.dangerInk};box-shadow:inset 0 0 0 1px oklch(42% 0.10 27);`,
    active:`background:oklch(24% 0.055 27);color:${D.dangerInk};box-shadow:inset 0 0 0 1px oklch(39% 0.095 27);`,
    focus:`background:${D.dangerSub};color:${D.dangerInk};box-shadow:inset 0 0 0 1px ${D.danger}, 0 0 0 2px ${D.bg}, 0 0 0 4px oklch(68% 0.18 27 / 0.4);`,
    disabled:`background:${D.dangerSub};color:${D.dangerInk};box-shadow:inset 0 0 0 1px ${D.dangerSubLine};opacity:0.4;` },
  solid: {
    rest:`background:${D.brand};color:oklch(17% 0.03 262.6);`, hover:`background:oklch(75% 0.13 262.6);color:oklch(17% 0.03 262.6);`,
    active:`background:${D.brandDim};color:oklch(15% 0.03 262.6);`,
    focus:`background:${D.brand};color:oklch(17% 0.03 262.6);box-shadow:0 0 0 2px ${D.bg}, 0 0 0 4px oklch(70% 0.145 262.6 / 0.5);`,
    disabled:`background:${D.brand};color:oklch(17% 0.03 262.6);opacity:0.35;` },
};
export const dbtn = (v, h = 32, state = 'rest') => {
  const [px, fs] = SZ[h];
  return `<span style="height:${h}px;padding:0 ${v === 'link' ? 0 : px}px;border-radius:${rr(h)}px;font-size:${fs}px;font-weight:500;letter-spacing:-0.005em;display:inline-flex;align-items:center;justify-content:center;gap:6px;white-space:nowrap;flex-shrink:0;box-sizing:border-box;${S[v][state]}">`;
};
export const dibtn = (v, h = 32, state = 'rest', icon = '') =>
  `<span style="width:${h}px;height:${h}px;border-radius:${rr(h)}px;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;box-sizing:border-box;${S[v][state]}">${icon}</span>`;

// badges: mesma matiz do claro, luz invertida — fundo L 30%, tinta L 85%
export const DC = {
  cinza:    { bg:'oklch(29% 0.010 250)', fg:'oklch(85% 0.012 250)', dot:'oklch(62% 0.012 250)' },
  azul:     { bg:'oklch(29% 0.055 262)', fg:'oklch(85% 0.075 262)', dot:'oklch(68% 0.140 262)' },
  ciano:    { bg:'oklch(29% 0.050 205)', fg:'oklch(85% 0.065 205)', dot:'oklch(70% 0.095 205)' },
  verde:    { bg:'oklch(29% 0.055 150)', fg:'oklch(85% 0.075 150)', dot:'oklch(70% 0.120 150)' },
  amarelo:  { bg:'oklch(30% 0.055 88)',  fg:'oklch(87% 0.090 90)',  dot:'oklch(80% 0.140 90)'  },
  laranja:  { bg:'oklch(29% 0.060 55)',  fg:'oklch(86% 0.085 60)',  dot:'oklch(74% 0.150 58)'  },
  vermelho: { bg:'oklch(29% 0.060 27)',  fg:'oklch(85% 0.080 27)',  dot:'oklch(68% 0.180 27)'  },
  rosa:     { bg:'oklch(29% 0.055 350)', fg:'oklch(85% 0.075 350)', dot:'oklch(70% 0.160 350)' },
  roxo:     { bg:'oklch(29% 0.055 300)', fg:'oklch(85% 0.075 300)', dot:'oklch(68% 0.160 300)' },
};
export const dbg = (cor, txt, { size = 'md', dot = false } = {}) => {
  const c = DC[cor], h = size === 'sm' ? 18 : 22;
  return `<span style="display:inline-flex;align-items:center;gap:5px;height:${h}px;padding:0 ${size === 'sm' ? 7 : 9}px;border-radius:${rr(h)}px;background:${c.bg};color:${c.fg};font-size:${size === 'sm' ? 11 : 11.5}px;font-weight:500;white-space:nowrap;box-sizing:border-box;">${dot ? `<span style="width:5px;height:5px;border-radius:999px;background:${c.dot};flex-shrink:0;"></span>` : ''}${txt}</span>`;
};
export const dinput = (state = 'rest', h = 32) => {
  const [px, fs] = SZ[h];
  const V = {
    rest:`background:oklch(16.5% 0.007 250);box-shadow:inset 0 0 0 1px ${D.hair};`,
    focus:`background:oklch(16.5% 0.007 250);box-shadow:inset 0 0 0 1px ${D.brand}, 0 0 0 3px oklch(70% 0.145 262.6 / 0.22);`,
    error:`background:oklch(18% 0.03 27);box-shadow:inset 0 0 0 1px ${D.danger}, 0 0 0 3px oklch(68% 0.18 27 / 0.18);`,
    disabled:`background:${D.surface2};box-shadow:inset 0 0 0 1px ${D.hair};opacity:0.6;`,
  }[state];
  return `height:${h}px;padding:0 ${px - 1}px;border-radius:${rr(h)}px;font-size:${fs}px;display:flex;align-items:center;gap:8px;box-sizing:border-box;${V}`;
};
export const dcard = (pad = 20, r = 14) => `background:${D.surface};border-radius:${r}px;padding:${pad}px;box-shadow:inset 0 0 0 1px ${D.hair};`;

// Bloco escuro embutido numa prancha clara — a metade dark de cada folha.
export const darkHalf = (titulo, sub, inner) => `
<div style="background:${D.bg};border-radius:18px;padding:30px 32px;display:flex;flex-direction:column;gap:24px;margin-top:8px;">
  <div style="display:flex;flex-direction:column;gap:5px;">
    <div style="display:flex;align-items:center;gap:10px;">
      <span style="width:8px;height:8px;border-radius:999px;background:${D.brand};"></span>
      <span style="font-size:18px;font-weight:600;letter-spacing:-0.015em;color:${D.fg};">${titulo}</span>
    </div>
    <span style="font-size:13px;line-height:18px;color:${D.muted};max-width:680px;">${sub}</span>
  </div>
  ${inner}
</div>`;
export const dcap = t => `<span style="font-family:'Geist Mono',ui-monospace,monospace;font-size:10px;color:${D.muted};">${t}</span>`;
export const dgrp = (label, inner, g = 10) => `<div style="display:flex;flex-direction:column;gap:9px;">${dcap(label)}<div style="display:flex;align-items:center;gap:${g}px;flex-wrap:wrap;">${inner}</div></div>`;
