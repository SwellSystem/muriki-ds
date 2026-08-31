// Vitrine do README — a foto dos componentes que abre o repositório.
// Lê os tokens do registry.json (fonte única) e traduz as receitas visuais
// dos componentes reais (button-variants, switch, checkbox, progress,
// view-toggle) e das pranchas (campos e radio, que ainda não têm código)
// para HTML estático, nos dois temas. Renderiza com o Chrome headless em
// 2x e grava em ../.github/readme/.
//
//   cd design && bun gen-vitrine.mjs
//
// Curadoria, não inventário: botões, badges, campos e controles.
// O README continua sendo a doc — isto aqui é só a primeira impressão.

import { mkdtempSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const reg = await Bun.file(new URL('../registry.json', import.meta.url)).json();
const theme = reg.items.find(i => i.type === 'registry:theme');

// ── geometria (a mesma dos componentes: h32 r6, badge h22 r4, card r14)
const W = 840, PAD = 32, CAP = 22, GAP = 26;
const ROWS = [32, 22, 32, 36]; // botões · badges · campos · controles
const H = PAD * 2 + ROWS.reduce((s, r) => s + CAP + r, 0) + GAP * (ROWS.length - 1);

const vitrine = (mode) => {
  const t = theme.cssVars[mode];
  const dark = mode === 'dark';

  // valores que os componentes carregam como classe dark: (não são tokens)
  const fx = dark ? {
    trackTrilho: `background:oklch(0.26 0.005 107);box-shadow:inset 0 1px 0 rgba(255,255,255,0.045), inset 0 0 0 1px oklch(0.325 0.006 107);`,
    pill: `background:oklch(0.172 0.004 107);box-shadow:inset 0 1px 3px rgba(0,0,0,0.65), inset 0 -1px 0 rgba(255,255,255,0.06), inset 0 0 0 1px oklch(0.135 0.004 107);`,
    encaixe: (ring) => `background:${t['sunken']};box-shadow:inset 0 1px 0 rgba(255,255,255,0.045), inset 0 0 0 1px oklch(0.325 0.006 107);`,
    thumb: `background:oklch(0.86 0.004 100);box-shadow:inset 0 1px 0 rgba(255,255,255,0.35), 0 1px 2px rgba(0,0,0,0.5);`,
    // campo: mais escuro que o card, filete no hair (prancha de Campos + regra do dark)
    campo: `background:${t['sunken']};box-shadow:inset 0 0 0 1px ${t['border']};`,
    campoFoco: `background:${t['sunken']};box-shadow:inset 0 0 0 1px ${t['primary']}, 0 0 0 3px oklch(0.7 0.145 262.6 / 0.22);`,
    placeholder: 'oklch(0.555 0.007 100)',
  } : {
    trackTrilho: `background:${t['sunken']};box-shadow:inset 0 1px 2px rgba(0,0,0,0.07), inset 0 0 0 1px ${t['border']};`,
    pill: `background:${t['card']};box-shadow:0 1px 2px rgba(0,0,0,0.14), 0 2px 6px rgba(0,0,0,0.07), inset 0 0 0 1px ${t['input']};`,
    encaixe: (ring) => `background:${t['sunken']};box-shadow:inset 0 1px 2px rgba(0,0,0,0.09), inset 0 0 0 1px ${t[ring]};`,
    thumb: `background:${t['card']};box-shadow:0 1px 2px rgba(0,0,0,0.28), 0 0 0 0.5px rgba(0,0,0,0.06);`,
    // campo: chapado com filete de 1px por dentro — sem sulco, sem sombra
    campo: `background:${t['card']};box-shadow:inset 0 0 0 1px ${t['input']};`,
    campoFoco: `background:${t['card']};box-shadow:inset 0 0 0 1px ${t['primary']}, 0 0 0 3px oklch(0.47 0.185 262.6 / 0.16);`,
    placeholder: 'oklch(0.58 0.025 255)',
  };

  const btnBase = `height:32px;padding:0 12px;border-radius:6px;font-size:13px;font-weight:500;letter-spacing:-0.005em;display:inline-flex;align-items:center;box-sizing:border-box;white-space:nowrap;`;
  const btn = {
    primary: (l) => `<span style="${btnBase}background:${t['primary-subtle']};color:${t['primary-subtle-foreground']};box-shadow:inset 0 0 0 1px ${t['primary-subtle-border']};">${l}</span>`,
    outline: (l) => `<span style="${btnBase}background:${t['card']};color:${t['foreground']};box-shadow:inset 0 0 0 1px ${t['input']};">${l}</span>`,
    ghost: (l) => `<span style="${btnBase}background:transparent;color:${t['foreground']};">${l}</span>`,
    destructive: (l) => `<span style="${btnBase}background:${t['destructive-subtle']};color:${t['destructive-subtle-foreground']};box-shadow:inset 0 0 0 1px ${t['destructive-subtle-border']};">${l}</span>`,
    solid: (l) => `<span style="${btnBase}background:${t['primary']};color:${t['primary-foreground']};">${l}</span>`,
  };

  const badgeBase = `height:22px;border-radius:4px;font-size:11.5px;font-weight:500;letter-spacing:-0.002em;display:inline-flex;align-items:center;gap:6px;box-sizing:border-box;white-space:nowrap;`;
  const badge = (tone, label, dot = false) =>
    `<span style="${badgeBase}padding:0 8px;background:${t[`tone-${tone}`]};color:${t[`tone-${tone}-foreground`]};">` +
    (dot ? `<span style="width:5px;height:5px;border-radius:99px;background:${t[`tone-${tone}-dot`]};"></span>` : '') +
    `${label}</span>`;
  const badgeCount = (tone, n) =>
    `<span style="${badgeBase}justify-content:center;min-width:22px;padding:0 6px;font-weight:600;font-variant-numeric:tabular-nums;background:${t[`tone-${tone}`]};color:${t[`tone-${tone}-foreground`]};">${n}</span>`;
  const badgeDashed = (label) =>
    `<span style="${badgeBase}padding:0 8px;border:1px dashed ${t['input']};background:transparent;color:${t['muted-foreground']};">${label}</span>`;

  const chevron = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${t['muted-foreground']}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`;
  const campoBase = `width:230px;height:32px;padding:0 11px;border-radius:6px;font-size:13px;display:inline-flex;align-items:center;gap:8px;box-sizing:border-box;white-space:nowrap;`;
  const campos =
    `<span style="${campoBase}${fx.campo}color:${fx.placeholder};">Descreva a tarefa</span>` +
    `<span style="${campoBase}${fx.campoFoco}color:${t['foreground']};">Revisar contrato<span style="width:1px;height:15px;background:${t['primary']};margin-left:-6px;"></span></span>` +
    `<span style="${campoBase}${fx.campo}color:${t['foreground']};justify-content:space-between;"><span>Em andamento</span>${chevron}</span>`;

  const toggle =
    `<span style="display:inline-flex;align-items:center;padding:2px;border-radius:999px;${fx.trackTrilho}">` +
    `<span style="height:32px;padding:0 14px;border-radius:999px;font-size:13px;font-weight:500;display:inline-flex;align-items:center;color:${t['primary']};${fx.pill}">Lista</span>` +
    `<span style="height:32px;padding:0 14px;border-radius:999px;font-size:13px;font-weight:500;display:inline-flex;align-items:center;color:${t['muted-foreground']};">Board</span>` +
    `</span>`;

  const sw = (on) =>
    `<span style="position:relative;display:inline-block;width:34px;height:20px;border-radius:999px;${on ? `background:${t['primary']};box-shadow:inset 0 1px 2px rgba(0,0,0,0.18);` : fx.encaixe('border')}">` +
    `<span style="position:absolute;top:2px;left:${on ? 16 : 2}px;width:16px;height:16px;border-radius:999px;${fx.thumb}"></span></span>`;

  const radio = (on) =>
    `<span style="width:16px;height:16px;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;${on ? `background:${t['primary']};` : fx.encaixe('input')}">` +
    (on ? `<span style="width:6px;height:6px;border-radius:999px;background:${t['primary-foreground']};"></span>` : '') + `</span>`;

  const check = `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="${t['primary-foreground']}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 13 4.5 4.5L19 7"/></svg>`;
  const cb = (checked) =>
    `<span style="width:16px;height:16px;border-radius:4px;display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;${checked ? `background:${t['primary']};` : fx.encaixe('input')}">${checked ? check : ''}</span>`;

  const progress =
    `<span style="display:inline-block;width:180px;height:6px;border-radius:999px;overflow:hidden;position:relative;${fx.encaixe('border')}">` +
    `<span style="position:absolute;inset:0;width:62%;border-radius:999px;background:${t['primary']};"></span></span>`;

  const cap = (l) => `<div style="height:${CAP}px;box-sizing:border-box;padding-bottom:12px;font-family:'Geist Mono',ui-monospace,monospace;font-size:10px;font-weight:500;letter-spacing:0.08em;text-transform:uppercase;color:${t['muted-foreground']};">${l}</div>`;
  const row = (h, gap, inner) => `<div style="display:flex;align-items:center;gap:${gap}px;height:${h}px;">${inner}</div>`;
  const par = (gap, inner) => `<span style="display:inline-flex;align-items:center;gap:${gap}px;">${inner}</span>`;

  return `<!doctype html>
<html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500&display=swap">
<style>html,body{margin:0;background:transparent;}</style></head>
<body><div style="width:${W}px;height:${H}px;box-sizing:border-box;padding:${PAD}px;border-radius:14px;background:${t['background']};box-shadow:inset 0 0 0 1px ${t['border']};font-family:'Geist',ui-sans-serif,system-ui,sans-serif;display:flex;flex-direction:column;gap:${GAP}px;">
<div>${cap('botões')}${row(ROWS[0], 10,
  btn.primary('Adicionar linha') + btn.outline('Salvar rascunho') + btn.ghost('Cancelar') + btn.destructive('Excluir') + btn.solid('Publicar'))}</div>
<div>${cap('badges')}${row(ROWS[1], 8,
  badge('green', 'Ativo', true) + badge('blue', 'Em revisão') + badge('yellow', 'Pendente') + badge('red', 'Bloqueado', true) + badge('purple', 'Design') + badgeCount('blue', 12) + badgeDashed('Sem responsável'))}</div>
<div>${cap('campos')}${row(ROWS[2], 24, campos)}</div>
<div>${cap('controles')}${row(ROWS[3], 26,
  toggle + par(8, sw(true) + sw(false)) + par(10, radio(true) + radio(false)) + par(10, cb(true) + cb(false)) + progress)}</div>
</div></body></html>`;
};

// ── render
const tmp = mkdtempSync(join(tmpdir(), 'vitrine-'));
const outDir = new URL('../.github/readme/', import.meta.url).pathname;
mkdirSync(outDir, { recursive: true });

for (const mode of ['light', 'dark']) {
  const html = join(tmp, `${mode}.html`);
  const png = join(outDir, `vitrine-${mode === 'light' ? 'clara' : 'escura'}.png`);
  await Bun.write(html, vitrine(mode));
  const p = Bun.spawnSync(['google-chrome', '--headless=new', '--disable-gpu', '--hide-scrollbars',
    '--force-device-scale-factor=2', '--default-background-color=00000000',
    '--virtual-time-budget=10000', `--window-size=${W},${H}`,
    `--screenshot=${png}`, `file://${html}`]);
  if (p.exitCode !== 0) { console.error(p.stderr.toString()); process.exit(1); }
  console.log(`vitrine ${mode} → ${png} (${W}×${H} @2x)`);
}
