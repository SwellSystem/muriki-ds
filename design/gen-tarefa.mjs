// Prancha da TAREFA: o task-modal na direção D aprovada (prototipos/tarefa-v2).
// Pílulas abaixo do título + trilho com todas as propriedades, decidido pelo
// espaço (760px de corpo), cada coluna rolando sozinha e o seletor de modo em
// três ícones. Claro em cima, escuro embaixo, o mesmo desenho.
//
//   cd design && bun gen-tarefa.mjs
import { N, page } from './tokens.mjs';
import { HAIR } from './buttons.mjs';
import { D, darkHalf, dcap } from './dark.mjs';

const cap = t => `<span class="cap">${t}</span>`;
const S = (p, w = 14) => `<svg width="${w}" height="${w}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
const I = {
  painel: S('<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><path d="M9 4.5v15"/>'),
  modal: S('<rect x="4.5" y="8.5" width="15" height="11" rx="2"/><path d="M6.5 5.5h11M8.5 3h7"/>'),
  cheia: S('<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><path d="M8 9V8h1M16 9V8h-1M8 15v1h1M16 15v1h-1"/>'),
  x: S('<path d="M6 6l12 12M18 6 6 18"/>'),
  caret: S('<path d="m9 6 6 6-6 6"/>', 11),
  status: S('<circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 1 0 16Z" fill="currentColor"/>'),
  prio: S('<path d="M5 19v-3M10 19v-6M15 19V9M20 19V5"/>'),
  user: S('<circle cx="12" cy="8.5" r="3.6"/><path d="M4.8 20c.9-3.4 3.8-5.4 7.2-5.4s6.3 2 7.2 5.4"/>'),
  cal: S('<rect x="4" y="5.5" width="16" height="14" rx="2"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>'),
  stack: S('<path d="m12 4 8 4-8 4-8-4Z"/><path d="m4 12 8 4 8-4M4 16l8 4 8-4"/>'),
  tag: S('<path d="M4 12V4.5h7.5L20 13l-7.5 7.5Z"/><circle cx="8.5" cy="8.5" r="1.2"/>'),
  pts: S('<path d="M5 19V13M10 19V9M15 19v-4M20 19V6"/>'),
};

// paletas: o mesmo desenho, a luz invertida
const CL = { bg: N.bg, card: N.surface, rail: 'oklch(97.6% 0.008 93)', fg: N.fg, body: N.body, muted: N.muted, hair: HAIR,
  chipBg: N.surface2, brand: N.brand, brandSub: N.brand100, brandInk: N.brand800, warn: 'oklch(52% 0.15 50)', scrim: 'oklch(32% 0.02 248.5 / 0.30)' };
const CE = { bg: D.bg, card: D.surface, rail: 'oklch(0.19 0.004 107)', fg: D.fg, body: D.body, muted: D.muted, hair: D.hair,
  chipBg: D.surface2, brand: D.brand, brandSub: D.brandSub, brandInk: D.brandInk, warn: 'oklch(80% 0.12 60)', scrim: 'oklch(0.09 0.003 107 / 0.62)' };

const pill = (P, inner) => `<span style="display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 11px;border-radius:999px;box-shadow:inset 0 0 0 1px ${P.hair};font-size:12.5px;color:${P.body};white-space:nowrap;">${inner}</span>`;
const statusChip = P => `<span style="display:inline-flex;align-items:center;gap:5px;height:20px;padding:0 8px;border-radius:999px;background:${P.brandSub};color:${P.brandInk};font-size:11.5px;font-weight:500;"><span style="width:5px;height:5px;border-radius:9px;background:${P.brand};"></span>Em andamento</span>`;
const av = (P, t) => `<span style="width:18px;height:18px;border-radius:99px;background:${P.brand};color:${P.card};font-size:8.5px;font-weight:600;display:inline-flex;align-items:center;justify-content:center;">${t}</span>`;
const VAL = P => ({
  status: statusChip(P),
  prio: `<span style="color:${P.warn};font-weight:500;">↗ Alta</span>`,
  user: `${av(P, 'AR')}Ana Ribeiro`,
  cal: `<span style="font-family:'Geist Mono',monospace;font-size:12px;">20/11/2026</span>`,
  stack: 'App 2.0',
  tag: `<span style="display:inline-flex;align-items:center;gap:5px;height:20px;padding:0 8px;border-radius:999px;background:${P.chipBg};font-size:11.5px;"><span style="width:5px;height:5px;border-radius:9px;background:${P.brand};"></span>Produto</span>`,
  pts: `<span style="color:${P.muted};">Vazio</span>`,
});
const LABEL = { status: 'Status', prio: 'Prioridade', user: 'Responsáveis', cal: 'Prazo', stack: 'Projeto', tag: 'Etiquetas', pts: 'Pontos' };
const row = (P, k) => `<div style="display:grid;grid-template-columns:112px minmax(0,1fr);align-items:center;min-height:30px;gap:8px;">
  <span style="display:flex;align-items:center;gap:8px;font-size:12.5px;font-weight:500;color:${P.muted};">${I[k]}${LABEL[k]}</span>
  <span style="display:flex;align-items:center;gap:6px;font-size:12.5px;color:${P.body};padding-left:8px;">${VAL(P)[k]}</span></div>`;

const modos = (P, ativo) => `<span style="display:inline-flex;gap:2px;padding:2px;border-radius:999px;background:${P.chipBg};">${['painel', 'modal', 'cheia'].map(k => `<span style="width:28px;height:24px;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;${k === ativo ? `background:${P.card};color:${P.fg};box-shadow:0 1px 2px oklch(0% 0 0 / 0.12);` : `color:${P.muted};`}">${I[k]}</span>`).join('')}</span>`;

const cabeca = (P, ativo, rolou) => `<div style="display:flex;align-items:center;gap:8px;height:46px;padding:0 14px 0 20px;${rolou ? `box-shadow:0 1px 0 ${P.hair};` : ''}position:relative;z-index:1;">
  <span style="font-family:'Geist Mono',monospace;font-size:11.5px;padding:2px 7px;border-radius:5px;background:${P.brandSub};color:${P.brandInk};">App 2.0</span>
  <span style="color:${P.muted};display:inline-flex;">${I.caret}</span>
  <span style="font-size:12.5px;font-weight:600;color:${P.fg};flex:1;">APP-142</span>
  ${modos(P, ativo)}<span style="color:${P.muted};display:inline-flex;margin-left:6px;">${I.x}</span></div>`;

const principal = (P, { titulo = 24, curta = false, deslocado = false, extra = '' } = {}) => `
  <div style="display:flex;flex-direction:column;gap:14px;padding:${deslocado ? '0' : '20px'} 22px 20px;${deslocado ? 'margin-top:-64px;' : ''}">
    ${deslocado ? '' : `<span style="font-family:'Geist Mono',monospace;font-size:11px;color:${P.muted};"># APP-142</span>
    <span style="font-size:${titulo}px;line-height:1.2;font-weight:600;letter-spacing:-0.02em;color:${P.fg};">Revisar fluxo de convite de membros</span>
    <div style="display:flex;flex-wrap:wrap;gap:6px;">${pill(P, statusChip(P))}${pill(P, VAL(P).prio)}${pill(P, VAL(P).user)}${pill(P, VAL(P).cal)}</div>
    ${curta ? `<div style="display:flex;flex-direction:column;gap:2px;">${['stack', 'tag', 'pts'].map(k => row(P, k)).join('')}</div>` : ''}`}
    <span style="font-size:13.5px;line-height:21px;color:${P.body};">Hoje o convite expira em 24 h e o e-mail não diz para qual time a pessoa vai. Revisar o texto, o prazo e o que acontece quando o link já foi usado.</span>
    <div style="display:flex;flex-direction:column;gap:8px;">
      <span style="font-family:'Geist Mono',monospace;font-size:10px;font-weight:600;letter-spacing:.12em;color:${P.muted};padding-bottom:7px;box-shadow:inset 0 -1px 0 ${P.hair};">SUBTASKS 2/4</span>
      ${['Mapear os e-mails atuais', 'Propor novo prazo de expiração', 'Escrever o texto do convite', 'Validar com o time de suporte'].map((t, i) => `<span style="display:flex;align-items:center;gap:9px;font-size:13px;color:${i < 2 ? P.muted : P.body};${i < 2 ? 'text-decoration:line-through;' : ''}"><span style="width:14px;height:14px;border-radius:4px;${i < 2 ? `background:${P.brand};` : `box-shadow:inset 0 0 0 1.5px ${P.hair};`}"></span>${t}</span>`).join('')}
    </div>
    ${extra}
  </div>`;

const trilho = P => `<div style="background:${P.rail};box-shadow:inset 1px 0 0 ${P.hair};padding:16px 16px;display:flex;flex-direction:column;gap:2px;">
  <span style="font-family:'Geist Mono',monospace;font-size:10px;font-weight:600;letter-spacing:.14em;color:${P.muted};padding-bottom:8px;">PROPRIEDADES</span>
  ${['status', 'prio', 'user', 'cal', 'stack', 'tag', 'pts'].map(k => row(P, k)).join('')}</div>`;

const rodape = P => `<div style="display:flex;align-items:center;gap:10px;padding:10px 18px;box-shadow:inset 0 1px 0 ${P.hair};">
  <span style="font-size:11.5px;color:${P.muted};flex:1;">☐ Criar mais</span>
  <span style="font-size:13px;color:${P.body};padding:0 10px;">Cancelar</span>
  <span style="font-size:13px;font-weight:500;color:${P.card};background:${P.brand};padding:7px 14px;border-radius:9px;">+ Criar task</span></div>`;

// largo: modal central, com o fundo desfocado atrás
const largo = (P, { rolou = false, extra = '' } = {}) => `
<div style="position:relative;border-radius:16px;overflow:hidden;padding:28px 36px;background:repeating-linear-gradient(${P.bg} 0 22px, color-mix(in oklab, ${P.fg} 6%, ${P.bg}) 22px 30px);">
  <div style="position:absolute;inset:0;background:${P.scrim};backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);"></div>
  <div style="position:relative;width:820px;height:${extra ? 640 : 470}px;margin:0 auto;border-radius:14px;background:${P.card};box-shadow:0 24px 60px -20px oklch(0% 0 0 / 0.35), 0 0 0 1px ${P.hair};display:flex;flex-direction:column;overflow:hidden;">
    ${cabeca(P, 'modal', rolou)}
    <div style="flex:1;min-height:0;display:grid;grid-template-columns:minmax(0,1fr) 290px;">
      <div style="position:relative;overflow:hidden;">${rolou ? `<span style="position:absolute;right:3px;top:30px;height:120px;width:4px;border-radius:4px;background:color-mix(in oklab, ${P.fg} 22%, transparent);"></span>` : ''}${principal(P, { deslocado: rolou, extra })}</div>
      ${trilho(P)}
    </div>
    ${rodape(P)}
  </div>
</div>`;

// estreito: painel lateral, sem desfoque — a lista continua à vista
const estreito = (P, { extra = '' } = {}) => `
<div style="width:400px;height:${extra ? 760 : 620}px;border-radius:14px;background:${P.card};box-shadow:0 18px 45px -24px oklch(0% 0 0 / 0.35), 0 0 0 1px ${P.hair};display:flex;flex-direction:column;overflow:hidden;">
  ${cabeca(P, 'painel', false)}
  <div style="flex:1;min-height:0;overflow:hidden;">${principal(P, { titulo: 20, curta: true, extra })}</div>
  ${rodape(P)}
</div>`;

const nota = (P, t, d) => `<div style="display:flex;flex-direction:column;gap:3px;max-width:820px;"><span style="font-size:12.5px;font-weight:600;color:${P.fg};">${t}</span><span style="font-size:12px;line-height:17px;color:${P.muted};">${d}</span></div>`;

const corpo = (extraLargo = '', extraEstreito = '', notasExtras = '') => `
<div style="display:flex;flex-direction:column;gap:12px;">
  ${cap('largo · modal central (≥ 760px de corpo) — fundo desfocado')}
  ${largo(CL, { extra: extraLargo })}
  ${nota(CL, 'Pílulas e trilho são o mesmo estado', 'Status, prioridade, responsáveis e prazo ficam à mão logo abaixo do título; o trilho repete tudo de propósito. Mudar num lugar muda no outro, porque os dois leem o mesmo value.')}
</div>
<div style="display:flex;gap:40px;align-items:flex-start;flex-wrap:wrap;">
  <div style="display:flex;flex-direction:column;gap:12px;">
    ${cap('estreito · painel lateral — sem desfoque')}
    ${estreito(CL, { extra: extraEstreito })}
  </div>
  <div style="display:flex;flex-direction:column;gap:22px;flex:1;min-width:360px;padding-top:24px;">
    ${nota(CL, 'Quem decide é o espaço', 'Container query no corpo: abaixo de 760px o trilho some e vira uma lista curta com o que as pílulas não têm (início, projeto, etiquetas, pontos).')}
    ${nota(CL, 'O conteúdo rola, a moldura não', 'A coluna principal e o trilho rolam cada um sozinho, com a barra fina que some em repouso. O cabeçalho só ganha o filete (0 1px 0) quando a principal saiu do topo.')}
    ${nota(CL, 'Três modos, do menor ao maior', 'Painel lateral, modal central e tela cheia, num controle segmentado de ícones. Só o modal central desfoca o fundo; o painel deixa a lista à vista; a tela cheia é a página.')}
    ${notasExtras}
  </div>
</div>
<div style="display:flex;flex-direction:column;gap:12px;">
  ${cap('rolado — o cabeçalho ganhou o filete; o trilho ficou parado')}
  ${largo(CL, { rolou: true })}
</div>
${darkHalf('No escuro', 'O mesmo desenho com a luz invertida: o trilho desce um degrau abaixo do cartão em vez de virar uma faixa clara, e o véu do modal central escurece além de desfocar.', `
  <div style="display:flex;flex-direction:column;gap:12px;">${dcap('largo · modal central')}${largo(CE, { extra: extraLargo })}</div>
  <div style="display:flex;gap:40px;align-items:flex-start;flex-wrap:wrap;">
    <div style="display:flex;flex-direction:column;gap:12px;">${dcap('estreito · painel lateral')}${estreito(CE, { extra: extraEstreito })}</div>
    <div style="display:flex;flex-direction:column;gap:12px;flex:1;min-width:360px;">${dcap('rolado')}<div style="zoom:0.62;">${largo(CE, { rolou: true })}</div></div>
  </div>`)}`;

{
  const html = page('Tarefa',
    'O detalhe da tarefa na direção D aprovada: o que muda toda hora em pílulas logo abaixo do título e, quando há espaço, o trilho com todas as propriedades ao lado. As duas são o mesmo estado.',
    corpo());
  await Bun.write('Tarefa.dc.html', html);
  console.log('Tarefa.dc.html', html.length, 'bytes');
}
