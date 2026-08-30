// Fonte única dos generators. Papel quente + tinta fria — ver Fundações.
export const N = {
  // superfícies (quentes, hue 82-100)
  bg:'oklch(98% 0.004 82)',            // #FAF8F5 papel
  surface:'oklch(99.3% 0.002 85)',     // card
  surface2:'oklch(97% 0.01 93.5)',     // #F7F5EE preenchimento
  surface3:'oklch(94.5% 0.011 96)',
  popover:'oklch(100% 0 0)',
  // tinta (fria, hue ~250)
  fg:'oklch(26% 0.022 250)',           // título
  body:'oklch(32% 0.02 248.5)',        // #2B343D corpo
  muted:'oklch(45% 0.03 257.7)',       // #4B5666 secundário
  subtle:'oklch(58% 0.025 255)',       // placeholder
  // linhas
  border:'oklch(94% 0.01 100)',        // #ECEBE4
  borderInput:'oklch(92% 0.01 98)',
  borderStrong:'oklch(88% 0.012 98)',
  // marca
  brand:'oklch(47% 0.185 262.6)', brandH:'oklch(41% 0.17 262.6)', brandA:'oklch(35% 0.15 262.6)',
  brand50:'oklch(97% 0.015 262.6)', brand100:'oklch(93.5% 0.035 262.6)', brand200:'oklch(88% 0.06 262.6)',
  brand800:'oklch(33% 0.13 262.6)',
  acc:'oklch(87.8% 0.18 93.9)', accH:'oklch(80% 0.16 90)', accA:'oklch(70% 0.14 86)',
  acc100:'oklch(97% 0.05 94)', acc700:'oklch(58% 0.12 82)',
  // semânticos
  danger:'oklch(55% 0.20 27)', danger50:'oklch(97% 0.02 27)', danger100:'oklch(93% 0.05 27)', danger800:'oklch(42% 0.17 27)',
  success:'oklch(58% 0.13 150)', success50:'oklch(97% 0.02 150)', success100:'oklch(93% 0.05 150)', success800:'oklch(42% 0.11 150)',
  warning:'oklch(66% 0.17 55)', warning50:'oklch(97.5% 0.02 60)', warning100:'oklch(93% 0.06 60)', warning700:'oklch(50% 0.13 52)',
};
// forma
export const R = { ctl:'8px', card:'12px', pill:'999px', sm:'6px' };
export const H = { xs:24, sm:28, md:32, lg:36, touch:44 };
export const SHADOW = {
  sm:'0 1px 2px oklch(32% 0.02 248.5 / 0.05), 0 1px 1px oklch(32% 0.02 248.5 / 0.04)',
  md:'0 4px 10px oklch(32% 0.02 248.5 / 0.06), 0 1px 2px oklch(32% 0.02 248.5 / 0.04)',
  lg:'0 12px 28px oklch(32% 0.02 248.5 / 0.10), 0 2px 6px oklch(32% 0.02 248.5 / 0.05)',
};
export const ring = c => `0 0 0 3px ${c}`;
export const FONTS = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap">`;
export const page = (title, sub, body, bg = N.bg, fg = N.body) => `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  ${FONTS}
  <style>
    body { margin: 0; background: ${bg}; font-family: "Geist", ui-sans-serif, system-ui, sans-serif; }
    a { color: ${N.brand}; text-decoration: none; }
    a:hover { color: ${N.brandH}; }
    .sec-title { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: ${N.muted}; margin: 0; }
    .cap { font-family: "Geist Mono", ui-monospace, monospace; font-size: 10px; color: ${N.muted}; }
    .mono { font-family: "Geist Mono", ui-monospace, monospace; }
    .card { background: ${N.surface}; border: 1px solid ${N.border}; border-radius: ${R.card}; padding: 24px 26px; }
  </style>
</helmet>
<div style="background:${bg};color:${fg};padding:44px 48px 56px;display:flex;flex-direction:column;gap:38px;">
  <div style="display:flex;flex-direction:column;gap:5px;">
    <div style="font-size:26px;font-weight:600;letter-spacing:-0.02em;line-height:1.1;color:${bg === N.bg ? N.fg : fg};">${title}</div>
    <div style="font-size:14px;line-height:1.5;color:${bg === N.bg ? N.muted : fg};max-width:680px;">${sub}</div>
  </div>
${body}
</div>
</x-dc>
</body>
</html>
`;
