import { N, R, page } from './tokens.mjs';
import { btn, input, HAIR, rr } from './recipes.mjs';

const cap = t => `<span class="cap">${t}</span>`;
const ico = {
  plus:`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`,
  chev:`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`,
  search:`<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>`,
  check:`<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 13 4.5 4.5L19 7"/></svg>`,
  alert:`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 8v5"/><circle cx="12" cy="16.6" r="0.6" fill="currentColor"/><path d="M10.3 3.9 2.5 18a1.9 1.9 0 0 0 1.7 2.9h15.6a1.9 1.9 0 0 0 1.7-2.9L13.7 3.9a1.9 1.9 0 0 0-3.4 0Z"/></svg>`,
  spin:`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 3a9 9 0 1 0 9 9" opacity="0.9"/><path d="M21 12a9 9 0 0 0-9-9" opacity="0.25"/></svg>`,
};

// trilho: nome à esquerda, espécime no papel, filete embaixo. Sem moldura.
const rail = (nome, meta, spec, last = false) => `
<div style="display:grid;grid-template-columns:150px 1fr;gap:28px;padding:22px 0;${last ? '' : `border-bottom:1px solid ${N.border};`}align-items:start;">
  <div style="display:flex;flex-direction:column;gap:3px;position:relative;top:2px;">
    <span style="font-size:14px;font-weight:600;color:${N.fg};letter-spacing:-0.008em;">${nome}</span>
    <span class="cap" style="line-height:15px;">${meta}</span>
  </div>
  <div style="display:flex;flex-direction:column;gap:16px;min-width:0;">${spec}</div>
</div>`;

const stack = (label, inner) => `<div style="display:flex;flex-direction:column;gap:8px;">${cap(label)}<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">${inner}</div></div>`;

// ---- Button
const VARIANTES = [['primary', 'Nova tarefa'], ['neutral', 'Editar'], ['ghost', 'Cancelar'], ['accent', 'Concluir'], ['danger', 'Excluir']];
const btnVariantes = stack('variantes', VARIANTES.map(([v, l]) => `${btn(v)}${l}</span>`).join(''));
const btnEstados = `<div style="display:flex;flex-direction:column;gap:8px;">${cap('estados — primary e neutral')}
  <div style="display:grid;grid-template-columns:repeat(5, max-content);gap:10px 14px;align-items:center;">
    ${['rest','hover','active','focus','disabled'].map(s => `<span class="cap" style="text-align:center;">${{rest:'repouso',hover:'hover',active:'pressionado',focus:'foco',disabled:'inativo'}[s]}</span>`).join('')}
    ${['rest','hover','active','focus','disabled'].map(s => `<span style="display:flex;justify-content:center;">${btn('primary', 32, s)}Salvar</span></span>`).join('')}
    ${['rest','hover','active','focus','disabled'].map(s => `<span style="display:flex;justify-content:center;">${btn('neutral', 32, s)}Salvar</span></span>`).join('')}
  </div></div>`;
const btnTamanhos = stack('tamanhos — 24 / 28 / 32 / 36 / 44', [24,28,32,36,44].map(h =>
  `<span style="display:inline-flex;flex-direction:column;gap:6px;align-items:center;">${btn('primary', h)}Salvar</span>${cap(h + 'px')}</span>`).join(''));
const btnComposicao = stack('composição', [
  `${btn('primary')}<span style="display:flex;">${ico.plus}</span>Nova tarefa</span>`,
  `<span style="width:32px;height:32px;border-radius:6px;display:inline-flex;align-items:center;justify-content:center;background:${N.surface};color:${N.body};box-shadow:0 0 0 1px ${HAIR}, none;">${ico.plus}</span>`,
  `${btn('primary')}<span style="display:flex;opacity:0.85;">${ico.spin}</span>Salvando</span>`,
  `<span style="display:inline-flex;box-shadow:0 0 0 1px ${HAIR}, none;border-radius:6px;overflow:hidden;"><span style="height:32px;padding:0 12px;font-size:13px;font-weight:500;display:inline-flex;align-items:center;background:${N.surface};color:${N.body};border-right:1px solid ${HAIR};">Criar</span><span style="width:30px;height:32px;display:inline-flex;align-items:center;justify-content:center;background:${N.surface};color:${N.muted};">${ico.chev}</span></span>`,
].join(''));

// ---- Input
const field = (lbl, inner, hint, hintColor) => `
<div style="display:flex;flex-direction:column;gap:6px;min-width:0;">
  ${lbl ? `<span style="font-size:14px;font-weight:500;line-height:1;color:${N.fg};">${lbl}</span>` : ''}
  ${inner}
  ${hint ? `<span style="font-size:11.5px;line-height:15px;color:${hintColor || N.muted};display:flex;align-items:center;gap:5px;">${hint}</span>` : ''}
</div>`;
const inputEstados = `
<div style="display:grid;grid-template-columns:repeat(3, minmax(0, 1fr));gap:16px 20px;">
  ${field('Título', `<div style="${input('rest')}color:${N.subtle};">Descreva a tarefa</div>`, 'repouso')}
  ${field('Título', `<div style="${input('hover')}color:${N.body};">Revisar contrato</div>`, 'hover')}
  ${field('Título', `<div style="${input('focus')}color:${N.body};">Revisar contrato<span style="width:1px;height:15px;background:${N.brand};margin-left:-6px;"></span></div>`, 'foco')}
  ${field('Título', `<div style="${input('error')}color:${N.body};">Re</div>`, `${ico.alert}Mínimo de 3 caracteres`, N.danger)}
  ${field('Título', `<div style="${input('disabled')}color:${N.subtle};">Bloqueado pelo plano</div>`, 'inativo')}
  ${field('Busca', `<div style="${input('rest')}color:${N.subtle};"><span style="color:${N.subtle};display:flex;">${ico.search}</span>Buscar tarefa ou doc</div>`, 'com ícone')}
</div>`;
const inputVariacoes = `
<div style="display:grid;grid-template-columns:repeat(3, minmax(0, 1fr));gap:16px 20px;">
  ${field('Estimativa', `<div style="${input('rest')}padding:0;gap:0;overflow:hidden;color:${N.body};"><span style="padding:0 10px;align-self:stretch;display:flex;align-items:center;background:${N.surface2};color:${N.muted};font-size:12.5px;border-right:1px solid ${HAIR};">h</span><span style="padding:0 11px;">4,5</span></div>`, 'com prefixo')}
  ${field('Status', `<div style="${input('rest')}justify-content:space-between;color:${N.body};"><span>Em andamento</span><span style="color:${N.muted};display:flex;">${ico.chev}</span></div>`, 'select · gatilho')}
  ${field('Descrição', `<div style="${input('rest')}height:74px;align-items:flex-start;padding-top:9px;line-height:19px;color:${N.body};">Sincronizar o spec e regenerar o client.</div>`, 'textarea')}
</div>`;

// ---- Seleção
const cb = (st) => ({
  vazio:`box-shadow:inset 0 0 0 1px ${HAIR};background:${N.surface};`,
  marcado:`background:${N.brand};box-shadow:none;color:#fff;`,
  foco:`background:${N.brand};box-shadow:0 0 0 1px ${N.brand}, 0 0 0 3px oklch(47% 0.185 262.6 / 0.22);color:#fff;`,
  inativo:`background:${N.surface2};box-shadow:0 0 0 1px ${HAIR};`,
}[st]);
const selRow = (ctl, txt, capt) => `<div style="display:flex;flex-direction:column;gap:7px;"><div style="display:flex;align-items:center;gap:9px;font-size:13.5px;color:${N.body};">${ctl}<span>${txt}</span></div>${cap(capt)}</div>`;
const selecao = `
<div style="display:grid;grid-template-columns:repeat(4, minmax(0, 1fr));gap:16px 20px;">
  ${selRow(`<span style="width:16px;height:16px;border-radius:4px;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;${cb('vazio')}"></span>`, 'Concluída', 'checkbox · vazio')}
  ${selRow(`<span style="width:16px;height:16px;border-radius:4px;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;${cb('marcado')}">${ico.check}</span>`, 'Concluída', 'marcado')}
  ${selRow(`<span style="width:16px;height:16px;border-radius:4px;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;${cb('foco')}">${ico.check}</span>`, 'Concluída', 'foco')}
  ${selRow(`<span style="width:16px;height:16px;border-radius:4px;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;${cb('inativo')}"></span>`, 'Concluída', 'inativo')}
  ${selRow(`<span style="width:16px;height:16px;border-radius:999px;flex-shrink:0;${cb('vazio')}"></span>`, 'Alta', 'radio · vazio')}
  ${selRow(`<span style="width:16px;height:16px;border-radius:999px;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;${cb('marcado')}"><span style="width:6px;height:6px;border-radius:999px;background:#fff;"></span></span>`, 'Alta', 'marcado')}
  ${selRow(`<span style="width:34px;height:20px;border-radius:999px;background:${N.surface2};box-shadow:inset 0 0 0 1px ${HAIR};display:inline-flex;align-items:center;padding:2px;box-sizing:border-box;flex-shrink:0;"><span style="width:16px;height:16px;border-radius:999px;background:#fff;"></span></span>`, 'Notificar', 'switch · desligado')}
  ${selRow(`<span style="width:34px;height:20px;border-radius:999px;background:${N.brand};box-shadow:none;display:inline-flex;align-items:center;justify-content:flex-end;padding:2px;box-sizing:border-box;flex-shrink:0;"><span style="width:16px;height:16px;border-radius:999px;background:#fff;box-shadow:0 1px 2px oklch(25% 0.12 262.6 / 0.2);"></span></span>`, 'Notificar', 'ligado')}
</div>`;

const body = `
<div style="display:flex;flex-direction:column;margin-top:-8px;">
  ${rail('Input', 'shadcn Input<br>Textarea · Select', [inputEstados, inputVariacoes].join(''))}
  ${rail('Checkbox<br>Radio · Switch', 'shadcn<br>seleção', selecao, true)}
</div>`;

const html = page('Campos e seleção',
  'Input, Textarea, Select, Checkbox, RadioGroup e Switch. O campo é chapado com filete de 1px por dentro — sem sulco, sem sombra. Botão tem prancha própria.',
  body);
await Bun.write('Controles.dc.html', html);
console.log('Controles.dc.html', html.length, 'bytes');
