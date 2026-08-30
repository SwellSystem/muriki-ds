import { N, page } from './tokens.mjs';
import { D, dbtn, dibtn, darkHalf, dcap, dgrp, rr as drr } from './dark.mjs';
import { btn, ibtn, rr, HAIR, V, SIZES } from './buttons.mjs';
const cap = t => `<span class="cap">${t}</span>`;
const I = {
  plus:`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`,
  chev:`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`,
  dots:`<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="5.5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="18.5" cy="12" r="1.6"/></svg>`,
  trash:`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6.5h16M9.5 6.5V4.8h5V6.5M6.5 6.5 7.4 20h9.2l.9-13.5"/></svg>`,
  spin:`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 3a9 9 0 1 0 9 9" opacity="0.9"/><path d="M21 12a9 9 0 0 0-9-9" opacity="0.2"/></svg>`,
  filter:`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 5.5h17l-6.5 7.6V19l-4 1.6v-8Z"/></svg>`,
  list:`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M8 6.5h12M8 12h12M8 17.5h12M4 6.5h.01M4 12h.01M4 17.5h.01"/></svg>`,
  board:`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="4.5" width="6" height="15" rx="1.4"/><rect x="14.5" y="4.5" width="6" height="9" rx="1.4"/></svg>`,
};

const rail = (nome, meta, spec, last = false) => `
<div style="display:grid;grid-template-columns:158px 1fr;gap:28px;padding:24px 0;${last ? '' : `border-bottom:1px solid ${N.border};`}align-items:start;">
  <div style="display:flex;flex-direction:column;gap:3px;position:relative;top:2px;">
    <span style="font-size:14px;font-weight:600;color:${N.fg};letter-spacing:-0.008em;">${nome}</span>
    <span class="cap" style="line-height:15px;">${meta}</span>
  </div>
  <div style="display:flex;flex-direction:column;gap:18px;min-width:0;">${spec}</div>
</div>`;
const grp = (label, inner, wrap = 12) => `<div style="display:flex;flex-direction:column;gap:9px;">${cap(label)}<div style="display:flex;align-items:center;gap:${wrap}px;flex-wrap:wrap;">${inner}</div></div>`;

// regra
const regra = `
<div style="display:flex;gap:26px;align-items:center;padding:18px 20px;border-radius:14px;background:${N.acc100};box-shadow:inset 0 0 0 1px ${N.acc};">
  <div style="display:flex;flex-direction:column;gap:4px;flex-grow:1;">
    <span style="font-size:14px;font-weight:600;color:${N.fg};">Botão não tem fill. Badge tem.</span>
    <span style="font-size:12.5px;line-height:18px;color:${N.body};max-width:640px;">Seis das sete variantes vivem de filete, tinta e fundo tênue. A sólida existe, mas é <strong style="font-weight:600;">exceção declarada: uma por tela</strong> — se aparecem duas, nenhuma é principal. Cor cheia é linguagem de estado (badge), não de ação.</span>
  </div>
  <div style="display:flex;gap:9px;flex-shrink:0;">${btn('primary')}Nova tarefa</span>${btn('outline')}Filtrar</span>${btn('ghost')}Cancelar</span></div>
</div>`;

// variantes
const MAP = { primary:'—  (novo)', outline:'outline', subtle:'secondary', ghost:'ghost', link:'link', danger:'destructive', solid:'default' };
const LBL = { primary:'Nova tarefa', outline:'Filtrar', subtle:'Exportar', ghost:'Cancelar', link:'Ver histórico', danger:'Excluir', solid:'Publicar' };
const variantes = `
<div style="display:grid;grid-template-columns:repeat(7, minmax(0, 1fr));gap:14px;">
  ${Object.keys(V).map(v => `
  <div style="display:flex;flex-direction:column;gap:9px;${v === 'solid' ? `padding:12px 10px;border-radius:12px;background:${N.surface2};margin:-12px -10px;` : ''}">
    <div style="min-height:34px;display:flex;align-items:center;">${btn(v, 32)}${LBL[v]}</span></div>
    <div style="display:flex;flex-direction:column;gap:2px;">
      <span style="font-size:12.5px;font-weight:600;color:${N.fg};">${v}</span>
      <span style="font-size:11.5px;line-height:15px;color:${N.muted};">${V[v].rot}</span>
      <span class="cap" style="padding-top:2px;">shadcn: ${MAP[v]}</span>
    </div>
  </div>`).join('')}
</div>`;

// estados
const ESTADOS = [['rest','repouso'],['hover','hover'],['active','pressionado'],['focus','foco'],['disabled','inativo']];
const estados = `
<div style="display:grid;grid-template-columns:88px repeat(5, minmax(0, 1fr));gap:12px 14px;align-items:center;">
  <span></span>${ESTADOS.map(([, l]) => `<span class="cap" style="text-align:center;">${l}</span>`).join('')}
  ${['primary','outline','subtle','ghost','danger','solid'].map(v =>
    `<span style="font-size:12px;font-weight:500;color:${N.fg};">${v}</span>` +
    ESTADOS.map(([s]) => `<span style="display:flex;justify-content:center;">${btn(v, 32, s)}Salvar</span></span>`).join('')
  ).join('')}
</div>`;

// tamanhos
const tamanhos = `
${grp('altura — raio acompanha (÷5)', SIZES.map(h => `<span style="display:inline-flex;flex-direction:column;gap:7px;align-items:center;">${btn('primary', h)}Nova tarefa</span>${cap(`${h} · r${rr(h)}`)}</span>`).join(''), 14)}
${grp('só ícone — quadrado na mesma altura', SIZES.map(h => `<span style="display:inline-flex;flex-direction:column;gap:7px;align-items:center;">${ibtn('outline', h, 'rest', I.plus)}${cap(`${h}²`)}</span>`).join(''), 14)}`;

// composição
const composicao = `
${grp('ícone à esquerda · à direita · só ícone · menu', [
  `${btn('primary')}<span style="display:flex;">${I.plus}</span>Nova tarefa</span>`,
  `${btn('outline')}Ordenar<span style="display:flex;opacity:0.7;">${I.chev}</span></span>`,
  `${ibtn('ghost', 32, 'rest', I.dots)}`,
  `${btn('danger')}<span style="display:flex;">${I.trash}</span>Excluir</span>`,
].join(''))}
${grp('carregando · desabilitado', [
  `${btn('primary', 32, 'rest')}<span style="display:flex;opacity:0.8;">${I.spin}</span>Salvando</span>`,
  `${btn('outline', 32, 'disabled')}Indisponível no plano</span>`,
].join(''))}
${grp('grupo segmentado · split · barra de ferramentas', [
  `<span style="display:inline-flex;background:${N.surface2};border-radius:${rr(32)+2}px;padding:3px;gap:2px;">
     <span style="height:26px;padding:0 11px;border-radius:${rr(32)}px;font-size:12.5px;font-weight:500;display:inline-flex;align-items:center;gap:6px;background:${N.surface};color:${N.fg};box-shadow:inset 0 0 0 1px ${HAIR};">${I.list}Lista</span>
     <span style="height:26px;padding:0 11px;border-radius:${rr(32)}px;font-size:12.5px;display:inline-flex;align-items:center;gap:6px;color:${N.muted};">${I.board}Board</span>
   </span>`,
  `<span style="display:inline-flex;border-radius:${rr(32)}px;box-shadow:inset 0 0 0 1px ${HAIR};overflow:hidden;background:${N.surface};">
     <span style="height:32px;padding:0 12px;font-size:13px;font-weight:500;display:inline-flex;align-items:center;color:${N.body};border-right:1px solid ${HAIR};">Criar</span>
     <span style="width:28px;height:32px;display:inline-flex;align-items:center;justify-content:center;color:${N.muted};">${I.chev}</span>
   </span>`,
  `<span style="display:inline-flex;gap:2px;padding:3px;border-radius:${rr(32)+2}px;background:${N.surface2};">
     ${ibtn('ghost', 26, 'rest', I.filter)}${ibtn('ghost', 26, 'hover', I.list)}${ibtn('ghost', 26, 'rest', I.dots)}
   </span>`,
].join(''))}`;

// uma tela, um sólido
const tela = `
<div style="display:grid;grid-template-columns:repeat(2, minmax(0, 1fr));gap:24px;">
  <div style="display:flex;flex-direction:column;gap:10px;">
    <div style="background:${N.surface};border-radius:14px;box-shadow:inset 0 0 0 1px ${HAIR};overflow:hidden;">
      <div style="display:flex;align-items:center;gap:9px;padding:13px 14px;border-bottom:1px solid ${N.surface2};">
        <span style="font-size:14px;font-weight:600;color:${N.fg};flex-grow:1;">Focus — hoje</span>
        ${btn('ghost', 28)}<span style="display:flex;">${I.filter}</span>Filtrar</span>
        ${btn('outline', 28)}Exportar</span>
        ${btn('primary', 28)}<span style="display:flex;">${I.plus}</span>Nova</span>
      </div>
      <div style="padding:13px 14px;display:flex;flex-direction:column;gap:9px;">
        <span style="font-size:13px;color:${N.muted};">Nenhum botão compete com o outro. A ação principal ganha por tinta, não por bloco de cor.</span>
      </div>
    </div>
    <span style="font-size:12.5px;line-height:17px;color:${N.muted};">Cabeçalho real: três ações, zero fill. É assim na maior parte do produto.</span>
  </div>
  <div style="display:flex;flex-direction:column;gap:10px;">
    <div style="background:${N.surface};border-radius:14px;box-shadow:inset 0 0 0 1px ${HAIR}, 0 8px 24px oklch(32% 0.02 248.5 / 0.08);padding:18px;display:flex;flex-direction:column;gap:13px;">
      <div style="display:flex;flex-direction:column;gap:4px;">
        <span style="font-size:15px;font-weight:600;color:${N.fg};">Publicar o design system?</span>
        <span style="font-size:13px;line-height:18px;color:${N.muted};">Todos os consumidores passam a receber os tokens novos.</span>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end;">${btn('ghost')}Cancelar</span>${btn('solid')}Publicar</span></div>
    </div>
    <span style="font-size:12.5px;line-height:17px;color:${N.muted};">O sólido só aparece aqui: um diálogo com uma decisão só. É o que o torna legível quando aparece.</span>
  </div>
</div>`;


const ESTADOS_D = [['rest','repouso'],['hover','hover'],['active','pressionado'],['focus','foco'],['disabled','inativo']];
const meiaDark = darkHalf('No escuro', 'A mesma família, com o tingido trocando de andar — fundo vai para L 28%, tinta para L 84% — e o sólido invertendo: fundo claro, texto escuro.', `
  ${dgrp('variantes', ['primary','outline','subtle','ghost','link','danger','solid'].map(v => `${dbtn(v)}${{primary:'Nova tarefa',outline:'Filtrar',subtle:'Exportar',ghost:'Cancelar',link:'Ver histórico',danger:'Excluir',solid:'Publicar'}[v]}</span>`).join(''))}
  <div style="display:flex;flex-direction:column;gap:9px;">${dcap('estados')}
    <div style="display:grid;grid-template-columns:80px repeat(5, minmax(0, 1fr));gap:11px 13px;align-items:center;">
      <span></span>${ESTADOS_D.map(([, l]) => `<span style="font-family:'Geist Mono',monospace;font-size:10px;color:${D.muted};text-align:center;">${l}</span>`).join('')}
      ${['primary','outline','subtle','ghost','danger','solid'].map(v =>
        `<span style="font-size:12px;font-weight:500;color:${D.fg};">${v}</span>` +
        ESTADOS_D.map(([s]) => `<span style="display:flex;justify-content:center;">${dbtn(v, 32, s)}Salvar</span></span>`).join('')).join('')}
    </div>
  </div>
  ${dgrp('tamanho e só-ícone', [
    ...[24,28,32,36,44].map(h => `<span style="display:inline-flex;flex-direction:column;gap:6px;align-items:center;">${dbtn('primary', h)}Salvar</span>${dcap(`${h}·r${drr(h)}`)}</span>`),
    `<span style="width:1px;height:40px;background:${D.hair};"></span>`,
    ...[24,28,32,36,44].map(h => dibtn('outline', h, 'rest', '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>')),
  ].join(''), 12)}
`);

const body = `
${regra}
<div style="display:flex;flex-direction:column;margin-top:-4px;">
  ${rail('Variantes', 'sete<br>seis sem fill', variantes)}
  ${rail('Estados', 'repouso → inativo', estados)}
  ${rail('Tamanhos', '24 · 28 · 32<br>36 · 44', tamanhos)}
  ${rail('Composição', 'ícone, grupo<br>split, toolbar', composicao)}
  ${rail('Na tela', 'onde cada uma<br>aparece', tela, true)}
</div>
${meiaDark}`;

const html = page('Botões',
  'A família inteira sem preenchimento sólido: filete, tinta e fundo tênue fazem todo o trabalho. Os nomes seguem o shadcn onde existe equivalente — <span class="mono" style="font-size:12.5px;">outline</span>, <span class="mono" style="font-size:12.5px;">secondary</span>, <span class="mono" style="font-size:12.5px;">ghost</span>, <span class="mono" style="font-size:12.5px;">link</span>, <span class="mono" style="font-size:12.5px;">destructive</span> — e <span class="mono" style="font-size:12.5px;">primary</span> entra como variante nova, que é a azul tingida.',
  body);
await Bun.write('Botoes.dc.html', html);
console.log('Botoes.dc.html', html.length, 'bytes');
