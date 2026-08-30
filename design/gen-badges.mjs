import { N, page } from './tokens.mjs';
import { D, DC, dbg, darkHalf, dcap, dgrp } from './dark.mjs';
import { btn, HAIR } from './buttons.mjs';
const cap = t => `<span class="cap">${t}</span>`;

// Paleta abafada: fundo todo em L≈93.5, tinta toda em L≈43. Varia só a matiz.
export const C = {
  cinza:    { bg:'oklch(94.5% 0.008 96)',  fg:'oklch(42% 0.020 250)', dot:'oklch(62% 0.012 250)', h:96 },
  azul:     { bg:'oklch(93.5% 0.045 262)', fg:'oklch(42% 0.140 262)', dot:'oklch(55% 0.170 262)', h:262 },
  ciano:    { bg:'oklch(93.5% 0.045 205)', fg:'oklch(42% 0.090 205)', dot:'oklch(58% 0.105 205)', h:205 },
  verde:    { bg:'oklch(93.5% 0.050 150)', fg:'oklch(42% 0.110 150)', dot:'oklch(58% 0.130 150)', h:150 },
  amarelo:  { bg:'oklch(94.0% 0.075 95)',  fg:'oklch(44% 0.100 82)',  dot:'oklch(76% 0.150 90)',  h:95 },
  laranja:  { bg:'oklch(93.5% 0.060 62)',  fg:'oklch(44% 0.130 52)',  dot:'oklch(66% 0.170 55)',  h:62 },
  vermelho: { bg:'oklch(93.5% 0.045 27)',  fg:'oklch(43% 0.160 27)',  dot:'oklch(58% 0.200 27)',  h:27 },
  rosa:     { bg:'oklch(93.5% 0.040 350)', fg:'oklch(43% 0.150 350)', dot:'oklch(58% 0.190 350)', h:350 },
  roxo:     { bg:'oklch(93.5% 0.045 300)', fg:'oklch(43% 0.150 300)', dot:'oklch(56% 0.185 300)', h:300 },
};
const H = { sm:18, md:22 };
const bg = (cor, txt, { size = 'md', dot = false, icon = '', close = false, num = false } = {}) => {
  const c = C[cor], h = H[size], fs = size === 'sm' ? 11 : 11.5, px = num ? (size === 'sm' ? 5 : 6) : (size === 'sm' ? 7 : 9);
  return `<span style="display:inline-flex;align-items:center;gap:${size === 'sm' ? 4 : 5}px;height:${h}px;${num ? `min-width:${h}px;justify-content:center;` : ''}padding:0 ${px}px;border-radius:${Math.round(h/5)}px;background:${c.bg};color:${c.fg};font-size:${fs}px;font-weight:${num ? 600 : 500};letter-spacing:-0.002em;white-space:nowrap;box-sizing:border-box;">
    ${dot ? `<span style="width:5px;height:5px;border-radius:999px;background:${c.dot};flex-shrink:0;"></span>` : ''}${icon}${txt}${close ? `<span style="display:flex;opacity:0.55;margin-left:1px;"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></span>` : ''}</span>`;
};

const rail = (nome, meta, spec, last = false) => `
<div style="display:grid;grid-template-columns:158px 1fr;gap:28px;padding:24px 0;${last ? '' : `border-bottom:1px solid ${N.border};`}align-items:start;">
  <div style="display:flex;flex-direction:column;gap:3px;position:relative;top:2px;">
    <span style="font-size:14px;font-weight:600;color:${N.fg};letter-spacing:-0.008em;">${nome}</span>
    <span class="cap" style="line-height:15px;">${meta}</span>
  </div>
  <div style="display:flex;flex-direction:column;gap:18px;min-width:0;">${spec}</div>
</div>`;
const grp = (label, inner, g = 8) => `<div style="display:flex;flex-direction:column;gap:9px;">${cap(label)}<div style="display:flex;align-items:center;gap:${g}px;flex-wrap:wrap;">${inner}</div></div>`;

const paleta = `
<div style="display:grid;grid-template-columns:repeat(9, minmax(0, 1fr));gap:10px;">
  ${Object.entries(C).map(([nome, c]) => `
  <div style="display:flex;flex-direction:column;gap:8px;">
    <div style="height:46px;border-radius:9px;background:${c.bg};display:flex;align-items:center;justify-content:center;">
      <span style="font-size:12px;font-weight:600;color:${c.fg};">Aa</span>
    </div>
    <div style="display:flex;flex-direction:column;gap:1px;">
      <span style="font-size:12px;font-weight:500;color:${N.fg};">${nome}</span>
      <span class="cap" style="font-size:9.5px;">h ${c.h}</span>
    </div>
  </div>`).join('')}
</div>
<div style="display:flex;gap:14px;padding:14px 16px;border-radius:12px;background:${N.surface2};">
  <span style="font-size:12.5px;line-height:18px;color:${N.body};max-width:820px;">Os nove fundos estão todos em <span class="mono" style="font-size:12px;">L 93,5%</span> e todas as tintas em <span class="mono" style="font-size:12px;">L 43%</span>. Só a matiz muda. É por isso que nenhum grita mais alto que o outro numa lista — e é o que separa uma paleta de um punhado de cores.</span>
</div>`;

const semantica = `
${grp('status da tarefa', [
  bg('cinza', 'A fazer', { dot:true }), bg('azul', 'Em andamento', { dot:true }),
  bg('amarelo', 'Bloqueada', { dot:true }), bg('verde', 'Concluída', { dot:true }),
  bg('vermelho', 'Cancelada', { dot:true }), bg('roxo', 'Em revisão', { dot:true }),
].join(''))}
${grp('prioridade — forma junto da cor, nunca cor sozinha', [
  bg('cinza', 'Baixa', { icon:`<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 19V6M6 13l6 6 6-6"/></svg>` }),
  bg('azul', 'Média', { icon:`<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 12h14"/></svg>` }),
  bg('laranja', 'Alta', { icon:`<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v13M6 11l6-6 6 6"/></svg>` }),
  bg('vermelho', 'Urgente', { icon:`<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 4v10M12 19.4h.01"/></svg>` }),
].join(''))}
${grp('label do usuário — a cor vem do label, não do sistema', [
  bg('ciano', 'backend'), bg('roxo', 'contrato'), bg('rosa', 'design'),
  bg('verde', 'quick-win'), bg('laranja', 'cliente'), bg('cinza', 'sem label'),
].join(''))}`;

const formas = `
${grp('forma — soft é o padrão', [
  bg('azul', 'Em andamento'),
  bg('azul', 'Em andamento', { dot:true }),
  bg('azul', 'Em andamento', { icon:`<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 1.8"/></svg>` }),
  bg('azul', 'backend', { close:true }),
  bg('azul', '12', { num:true }),
  `<span style="display:inline-flex;align-items:center;height:22px;padding:0 9px;border-radius:4px;background:transparent;color:${N.muted};font-size:11.5px;font-weight:500;box-shadow:inset 0 0 0 1px ${HAIR};">outline</span>`,
].join(''))}
<div style="display:flex;gap:26px;">
  ${grp('tamanho', [
    `<span style="display:inline-flex;flex-direction:column;gap:7px;align-items:center;">${bg('verde', 'Concluída', { size:'sm', dot:true })}${cap('sm 18 — dentro de linha')}</span>`,
    `<span style="display:inline-flex;flex-direction:column;gap:7px;align-items:center;">${bg('verde', 'Concluída', { size:'md', dot:true })}${cap('md 22 — padrão')}</span>`,
  ].join(''), 14)}
  <div style="width:1px;background:${N.border};align-self:stretch;"></div>
  ${grp('contador', [bg('cinza','3',{num:true,size:'sm'}), bg('azul','12',{num:true}), bg('vermelho','99+',{num:true})].join(''))}
</div>`;

const evitar = `
<div style="display:grid;grid-template-columns:repeat(2, minmax(0, 1fr));gap:24px;">
  <div style="display:flex;flex-direction:column;gap:10px;">
    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:16px;border-radius:12px;background:${N.surface};box-shadow:inset 0 0 0 1px ${HAIR};">
      <span style="display:inline-flex;align-items:center;height:22px;padding:0 9px;border-radius:4px;background:oklch(55% 0.20 27);color:#fff;font-size:11.5px;font-weight:500;">Urgente</span>
      <span style="display:inline-flex;align-items:center;height:22px;padding:0 9px;border-radius:4px;background:oklch(58% 0.13 150);color:#fff;font-size:11.5px;font-weight:500;">Concluída</span>
      <span style="display:inline-flex;align-items:center;height:22px;padding:0 9px;border-radius:4px;background:oklch(47% 0.185 262.6);color:#fff;font-size:11.5px;font-weight:500;">Em andamento</span>
      <span style="display:inline-flex;align-items:center;height:22px;padding:0 9px;border-radius:4px;background:oklch(87.8% 0.18 93.9);color:oklch(26% 0.022 250);font-size:11.5px;font-weight:500;">Bloqueada</span>
    </div>
    <span style="font-size:12.5px;line-height:17px;color:${N.muted};"><strong style="color:${N.danger800};font-weight:600;">Sólido:</strong> numa lista de quarenta linhas isso vira uma árvore de natal. Cada badge disputa atenção com o título da tarefa, que é o que interessa.</span>
  </div>
  <div style="display:flex;flex-direction:column;gap:10px;">
    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:16px;border-radius:12px;background:${N.surface};box-shadow:inset 0 0 0 1px ${HAIR};">
      ${bg('vermelho','Urgente',{dot:true})}${bg('verde','Concluída',{dot:true})}${bg('azul','Em andamento',{dot:true})}${bg('amarelo','Bloqueada',{dot:true})}
    </div>
    <span style="font-size:12.5px;line-height:17px;color:${N.muted};"><strong style="color:${N.success800};font-weight:600;">Abafado:</strong> a cor continua legível e informando, o texto da tarefa continua sendo o mais forte da linha. O ponto colorido devolve a saturação onde ela custa barato.</span>
  </div>
</div>`;

const naLinha = `
<div style="background:${N.surface};border-radius:14px;box-shadow:inset 0 0 0 1px ${HAIR};overflow:hidden;">
  ${[
    ['Revisar contrato OpenAPI do módulo focus', 'azul', 'Em andamento', ['ciano','backend'], 'laranja', 'Alta'],
    ['Regenerar client Kubb no platform', 'amarelo', 'Bloqueada', ['roxo','contrato'], 'vermelho', 'Urgente'],
    ['Subir migration de focus_task_labels', 'verde', 'Concluída', ['ciano','backend'], 'cinza', 'Baixa'],
  ].map(([t, sc, st, [lc, lt], pc, pt], i) => `
  <div style="display:flex;align-items:center;gap:10px;height:44px;padding:0 14px;${i < 2 ? `border-bottom:1px solid ${N.surface2};` : ''}">
    <span style="width:16px;height:16px;border-radius:4px;box-shadow:inset 0 0 0 1.5px oklch(85% 0.011 96);flex-shrink:0;"></span>
    <span style="font-size:13.5px;color:${N.body};flex-grow:1;">${t}</span>
    ${bg(pc, pt, { size:'sm' })}${bg(lc, lt, { size:'sm' })}${bg(sc, st, { size:'sm', dot:true })}
  </div>`).join('')}
</div>
<span style="font-size:12.5px;line-height:17px;color:${N.muted};">Três badges na mesma linha e o título continua ganhando. Era isso ou nada.</span>`;


const meiaDark = darkHalf('No escuro', 'A matiz nunca muda entre os temas — só a luz inverte: o fundo sai de L 93,5% para L 29% e a tinta de L 43% para L 85%. É por isso que o amarelo continua significando "bloqueada" quando alguém troca o tema no meio do dia.', `
  <div style="display:grid;grid-template-columns:repeat(9, minmax(0, 1fr));gap:10px;">
    ${Object.entries(DC).map(([nome, c]) => `<div style="display:flex;flex-direction:column;gap:8px;"><div style="height:44px;border-radius:9px;background:${c.bg};display:flex;align-items:center;justify-content:center;"><span style="font-size:12px;font-weight:600;color:${c.fg};">Aa</span></div><span style="font-size:12px;font-weight:500;color:${D.fg};">${nome}</span></div>`).join('')}
  </div>
  ${dgrp('status', [dbg('cinza','A fazer',{dot:true}), dbg('azul','Em andamento',{dot:true}), dbg('amarelo','Bloqueada',{dot:true}), dbg('verde','Concluída',{dot:true}), dbg('vermelho','Cancelada',{dot:true}), dbg('roxo','Em revisão',{dot:true})].join(''), 8)}
  ${dgrp('prioridade e label', [dbg('cinza','Baixa'), dbg('azul','Média'), dbg('laranja','Alta'), dbg('vermelho','Urgente'), dbg('ciano','backend'), dbg('roxo','contrato'), dbg('rosa','design')].join(''), 8)}
  ${dgrp('tamanho e contador', [dbg('verde','Concluída',{size:'sm',dot:true}), dbg('verde','Concluída',{dot:true}), dbg('cinza','3',{size:'sm'}), dbg('azul','12'), dbg('vermelho','99+')].join(''), 10)}
  <div style="background:${D.surface};border-radius:14px;box-shadow:inset 0 0 0 1px ${D.hair};overflow:hidden;">
    ${[['Revisar contrato OpenAPI do módulo focus','laranja','Alta','ciano','backend','azul','Em andamento'],['Regenerar client Kubb no platform','vermelho','Urgente','roxo','contrato','amarelo','Bloqueada'],['Subir migration de focus_task_labels','cinza','Baixa','ciano','backend','verde','Concluída']].map(([t,pc,pt,lc,lt,sc,st], i) => `<div style="display:flex;align-items:center;gap:10px;height:44px;padding:0 14px;${i < 2 ? `border-bottom:1px solid ${D.hair};` : ''}"><span style="width:16px;height:16px;border-radius:4px;box-shadow:inset 0 0 0 1.5px ${D.hairStrong};flex-shrink:0;"></span><span style="font-size:13.5px;color:${D.body};flex-grow:1;">${t}</span>${dbg(pc,pt,{size:'sm'})}${dbg(lc,lt,{size:'sm'})}${dbg(sc,st,{size:'sm',dot:true})}</div>`).join('')}
  </div>
`);

const body = `
<div style="display:flex;gap:26px;align-items:center;padding:18px 20px;border-radius:14px;background:${N.brand50};box-shadow:inset 0 0 0 1px oklch(88% 0.05 262.6);">
  <div style="display:flex;flex-direction:column;gap:4px;flex-grow:1;">
    <span style="font-size:14px;font-weight:600;color:${N.fg};">Badge é estado. Botão é ação.</span>
    <span style="font-size:12.5px;line-height:18px;color:${N.body};max-width:660px;">Por isso o fill vive aqui e não lá: cor cheia comunica <em>o que uma coisa é</em>, não <em>o que você pode fazer com ela</em>. Badge não é clicável — a única exceção é o de filtro, que carrega o × para se remover.</span>
  </div>
  <div style="display:flex;gap:8px;flex-shrink:0;">${bg('azul','Em andamento',{dot:true})}${bg('laranja','Alta')}${bg('ciano','backend',{close:true})}</div>
</div>
<div style="display:flex;flex-direction:column;margin-top:-4px;">
  ${rail('Paleta', 'nove matizes<br>uma luz só', paleta)}
  ${rail('Semântica', 'status, prioridade<br>label', semantica)}
  ${rail('Forma', 'dot, ícone, contador<br>removível', formas)}
  ${rail('Sólido x abafado', 'por que abafado', evitar)}
  ${rail('Na linha', 'em tamanho real', naLinha, true)}
</div>
${meiaDark}`;

const html = page('Badges',
  'Aqui mora o preenchimento. Nove matizes abafados — fundo sempre em L 93,5% e tinta sempre em L 43%, variando só o tom — para que três badges caibam na mesma linha sem nenhum roubar a cena do título da tarefa.',
  body);
await Bun.write('Badges.dc.html', html);
console.log('Badges.dc.html', html.length, 'bytes');
