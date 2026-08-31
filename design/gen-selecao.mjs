import { N, page } from './tokens.mjs';
import { btn, rr, HAIR } from './buttons.mjs';
import { C } from './gen-badges.mjs';
import { D, dbtn, dinput, dcard, darkHalf, dcap, dgrp, rr as drr } from './dark.mjs';
const cap = t => `<span class="cap">${t}</span>`;
const I = {
  chev:`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`,
  chevR:`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>`,
  check:`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m5 13 4.5 4.5L19 7"/></svg>`,
  minus:`<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"><path d="M6 12h12"/></svg>`,
  search:`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>`,
  pencil:`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M16.5 4.5a2.1 2.1 0 0 1 3 3L8 19l-4 1 1-4Z"/></svg>`,
  copy:`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="8.5" y="8.5" width="11" height="11" rx="2"/><path d="M15.5 5.5h-9a2 2 0 0 0-2 2v9"/></svg>`,
  trash:`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6.5h16M9.5 6.5V4.8h5V6.5M6.5 6.5 7.4 20h9.2l.9-13.5"/></svg>`,
  x:`<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>`,
  user:`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8.5" r="3.6"/><path d="M4.8 20c.9-3.4 3.8-5.4 7.2-5.4s6.3 2 7.2 5.4"/></svg>`,
};
const rail = (nome, meta, spec, last = false) => `
<div style="display:grid;grid-template-columns:158px 1fr;gap:28px;padding:24px 0;${last ? '' : `border-bottom:1px solid ${N.border};`}align-items:start;">
  <div style="display:flex;flex-direction:column;gap:3px;position:relative;top:2px;">
    <span style="font-size:14px;font-weight:600;color:${N.fg};letter-spacing:-0.008em;">${nome}</span>
    <span class="cap" style="line-height:15px;">${meta}</span>
  </div>
  <div style="display:flex;flex-direction:column;gap:18px;min-width:0;">${spec}</div>
</div>`;

const menu = (inner, w = 224) => `<div style="width:${w}px;background:${N.surface};border-radius:12px;box-shadow:inset 0 0 0 1px ${HAIR}, 0 10px 30px oklch(32% 0.02 248.5 / 0.10), 0 2px 6px oklch(32% 0.02 248.5 / 0.05);padding:5px;display:flex;flex-direction:column;gap:1px;box-sizing:border-box;">${inner}</div>`;
const item = (txt, { icon = '', kb = '', sel = false, hl = false, dis = false, danger = false, sub = false, desc = '' } = {}) => `
<div style="height:${desc ? 42 : 30}px;padding:0 8px;border-radius:7px;display:flex;align-items:center;gap:9px;font-size:13px;box-sizing:border-box;
  ${hl ? `background:${danger ? N.danger50 : N.surface2};` : ''}color:${dis ? N.subtle : danger ? N.danger800 : N.body};${dis ? 'opacity:0.65;' : ''}">
  ${icon ? `<span style="display:flex;color:${dis ? N.subtle : danger ? N.danger : N.muted};flex-shrink:0;">${icon}</span>` : ''}
  <div style="display:flex;flex-direction:column;gap:1px;flex-grow:1;min-width:0;"><span>${txt}</span>${desc ? `<span style="font-size:11.5px;color:${N.muted};">${desc}</span>` : ''}</div>
  ${sel ? `<span style="display:flex;color:${N.brand};">${I.check}</span>` : ''}
  ${sub ? `<span style="display:flex;color:${N.muted};">${I.chevR}</span>` : ''}
  ${kb ? `<span class="mono" style="font-size:11px;color:${N.subtle};">${kb}</span>` : ''}
</div>`;
const sep = () => `<div style="height:1px;background:${N.border};margin:4px 6px;"></div>`;
const lbl = t => `<div style="padding:6px 8px 3px;font-size:10.5px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:${N.muted};">${t}</div>`;
const bloco = (titulo, nota, inner) => `
<div style="display:flex;flex-direction:column;gap:10px;">
  <div style="min-height:30px;">${inner}</div>
  <div style="display:flex;flex-direction:column;gap:2px;"><span style="font-size:12.5px;font-weight:600;color:${N.fg};">${titulo}</span><span style="font-size:12px;line-height:16px;color:${N.muted};">${nota}</span></div>
</div>`;

// ── Dropdown
const dropdown = `
<div style="display:grid;grid-template-columns:repeat(4, minmax(0, 1fr));gap:24px;align-items:start;">
  ${bloco('Ações', 'Ícone à esquerda, atalho à direita, destrutiva no fim e separada.',
    menu(`${item('Editar', { icon:I.pencil, kb:'E' })}${item('Duplicar', { icon:I.copy, kb:'⌘D', hl:true })}${item('Mover para…', { icon:I.chevR, sub:true })}${sep()}${item('Excluir', { icon:I.trash, kb:'⌫', danger:true })}`))}
  ${bloco('Com seção e escolha', 'Rótulo de seção em caixa alta, item escolhido marcado com o check à direita.',
    menu(`${lbl('Ordenar por')}${item('Prazo', { sel:true })}${item('Prioridade')}${item('Criação')}${sep()}${lbl('Direção')}${item('Crescente', { sel:true })}${item('Decrescente')}`))}
  ${bloco('Com descrição', 'Só quando o rótulo sozinho é ambíguo. Dois níveis, 42px de altura.',
    menu(`${item('Arquivar', { icon:I.copy, desc:'Some da lista, fica na busca' })}${item('Excluir', { icon:I.trash, desc:'Não dá para desfazer', danger:true, hl:true })}`))}
  ${bloco('Item desabilitado', 'Cinza e sem hover — mas continua legível. Nunca some: sumir esconde a existência da ação.',
    menu(`${item('Editar', { icon:I.pencil })}${item('Compartilhar', { icon:I.user, dis:true })}${item('Excluir', { icon:I.trash, danger:true })}`))}
</div>`;

// ── Select / Listbox / Combobox
const trigger = (txt, { open = false, ph = false, w = 220 } = {}) => `
<div style="width:${w}px;height:32px;padding:0 11px;border-radius:${rr(32)}px;font-size:13px;display:flex;align-items:center;gap:8px;box-sizing:border-box;background:${N.surface};color:${ph ? N.subtle : N.body};box-shadow:inset 0 0 0 1px ${open ? N.brand : HAIR}${open ? ', 0 0 0 3px oklch(47% 0.185 262.6 / 0.16)' : ''};">
  <span style="flex-grow:1;">${txt}</span><span style="display:flex;color:${N.muted};${open ? 'transform:rotate(180deg);' : ''}">${I.chev}</span></div>`;
const dot = c => `<span style="width:8px;height:8px;border-radius:999px;background:${c};flex-shrink:0;"></span>`;
const selects = `
<div style="display:grid;grid-template-columns:repeat(4, minmax(0, 1fr));gap:24px;align-items:start;">
  ${bloco('Fechado', 'Três estados: vazio com placeholder, preenchido, aberto com o anel de foco.',
    `<div style="display:flex;flex-direction:column;gap:9px;">${trigger('Selecione um status', { ph:true })}${trigger('Em andamento')}${trigger('Em andamento', { open:true })}</div>`)}
  ${bloco('Listbox aberto', 'Marcador de cor à esquerda, check à direita. Item sob o cursor com fundo, nunca com borda.',
    menu(`${item('A fazer', { icon:dot(N.subtle) })}${item('Em andamento', { icon:dot(N.brand), sel:true, hl:true })}${item('Bloqueada', { icon:dot(N.warning) })}${item('Concluída', { icon:dot(N.success) })}${item('Cancelada', { icon:dot(N.danger) })}`, 220))}
  ${bloco('Combobox — com busca', 'A partir de ~8 opções a busca deixa de ser luxo. O campo fica dentro do painel, colado no topo.',
    menu(`<div style="padding:3px 3px 6px;"><div style="height:30px;padding:0 9px;border-radius:7px;font-size:12.5px;display:flex;align-items:center;gap:8px;background:${N.surface2};color:${N.body};"><span style="display:flex;color:${N.subtle};">${I.search}</span>cont<span style="width:1px;height:14px;background:${N.brand};margin-left:-6px;"></span></div></div>${item('Contrato OpenAPI', { hl:true })}${item('Contratos — jurídico')}${item('Refatorar contrato do Kubb')}<div style="padding:8px;font-size:12px;color:${N.muted};text-align:center;">3 de 41 projetos</div>`, 236))}
  ${bloco('Múltipla escolha', 'O escolhido volta como chip removível no gatilho. Acima de três, vira “+N”.',
    `<div style="display:flex;flex-direction:column;gap:9px;">
      <div style="width:220px;min-height:32px;padding:4px 8px;border-radius:${rr(32)}px;display:flex;align-items:center;gap:5px;flex-wrap:wrap;box-sizing:border-box;background:${N.surface};box-shadow:inset 0 0 0 1px ${HAIR};">
        <span style="display:inline-flex;align-items:center;gap:4px;height:20px;padding:0 6px;border-radius:4px;background:${C.ciano.bg};color:${C.ciano.fg};font-size:11px;font-weight:500;">backend<span style="opacity:0.55;display:flex;">${I.x}</span></span>
        <span style="display:inline-flex;align-items:center;gap:4px;height:20px;padding:0 6px;border-radius:4px;background:${C.roxo.bg};color:${C.roxo.fg};font-size:11px;font-weight:500;">contrato<span style="opacity:0.55;display:flex;">${I.x}</span></span>
        <span style="font-size:12px;color:${N.subtle};">+2</span>
        <span style="margin-left:auto;display:flex;color:${N.muted};">${I.chev}</span>
      </div>
      ${menu(`${item('backend', { icon:`<span style="width:15px;height:15px;border-radius:4px;background:${N.brand};color:#fff;display:inline-flex;align-items:center;justify-content:center;">${I.check}</span>` })}${item('contrato', { icon:`<span style="width:15px;height:15px;border-radius:4px;background:${N.brand};color:#fff;display:inline-flex;align-items:center;justify-content:center;">${I.check}</span>` })}${item('design', { icon:`<span style="width:15px;height:15px;border-radius:4px;box-shadow:inset 0 0 0 1.5px ${N.borderStrong};display:inline-block;"></span>`, hl:true })}`, 220)}
    </div>`)}
</div>`;

// ── Checkbox
const cbx = (st, sz = 16) => {
  const S = { vazio:`background:oklch(95.5% 0.012 95);box-shadow:inset 0 1px 2px rgba(0,0,0,0.09), inset 0 0 0 1px ${N.borderInput};`,
    marcado:`background:${N.brand};color:#fff;`, meio:`background:${N.brand};color:#fff;`,
    foco:`background:${N.brand};color:#fff;box-shadow:0 0 0 2px ${N.bg}, 0 0 0 4px oklch(47% 0.185 262.6 / 0.35);`,
    inativo:`background:oklch(95.5% 0.012 95);box-shadow:inset 0 1px 2px rgba(0,0,0,0.09), inset 0 0 0 1px ${N.borderInput};opacity:0.55;` }[st];
  const g = st === 'meio' ? I.minus : (st === 'marcado' || st === 'foco') ? I.check : '';
  return `<span style="width:${sz}px;height:${sz}px;border-radius:4px;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;box-sizing:border-box;${S}">${g}</span>`;
};
const checkboxes = `
<div style="display:grid;grid-template-columns:0.85fr 1fr 1.15fr;gap:26px;align-items:start;">
  ${bloco('Estados', 'Vazio, marcado, indeterminado, foco e inativo. O indeterminado é traço, nunca meio-check.',
    `<div style="display:flex;flex-direction:column;gap:11px;">
      ${['vazio','marcado','meio','foco','inativo'].map((s, i) => `<span style="display:inline-flex;align-items:center;gap:9px;font-size:13.5px;color:${s === 'inativo' ? N.subtle : N.body};">${cbx(s)}${['Concluída','Concluída','Alguns itens','Concluída','Bloqueado pelo plano'][i]}</span>`).join('')}
    </div>`)}
  ${bloco('Grupo com pai indeterminado', 'O pai reflete os filhos. Marcar o pai marca todos; desmarcar limpa todos.',
    `<div style="display:flex;flex-direction:column;gap:9px;">
      <span style="display:inline-flex;align-items:center;gap:9px;font-size:13.5px;font-weight:500;color:${N.fg};">${cbx('meio')}Notificações</span>
      <div style="display:flex;flex-direction:column;gap:9px;padding-left:25px;">
        <span style="display:inline-flex;align-items:center;gap:9px;font-size:13.5px;color:${N.body};">${cbx('marcado')}Tarefa atribuída a mim</span>
        <span style="display:inline-flex;align-items:center;gap:9px;font-size:13.5px;color:${N.body};">${cbx('marcado')}Comentário na minha tarefa</span>
        <span style="display:inline-flex;align-items:center;gap:9px;font-size:13.5px;color:${N.body};">${cbx('vazio')}Qualquer mudança no projeto</span>
      </div>
    </div>`)}
  ${bloco('Lista de filtro — com contagem', 'Dentro de um popover de filtro. Linha inteira clicável, contagem alinhada à direita.',
    menu(`${lbl('Responsável')}
      ${['Guilherme Teodoro:12:marcado','Rafael Souza:8:vazio','Ana Lima:5:vazio','Sem responsável:3:vazio'].map((r, i) => { const [n, c, s] = r.split(':'); return `
      <div style="height:30px;padding:0 8px;border-radius:7px;display:flex;align-items:center;gap:9px;font-size:13px;color:${N.body};${i === 0 ? `background:${N.surface2};` : ''}">${cbx(s, 15)}<span style="flex-grow:1;">${n}</span><span class="mono" style="font-size:11px;color:${N.subtle};">${c}</span></div>`; }).join('')}`, 244))}
</div>
<div style="display:grid;grid-template-columns:repeat(2, minmax(0, 1fr));gap:26px;align-items:start;">
  ${bloco('Cartão selecionável', 'Quando a escolha tem consequência e precisa de explicação. A caixa fica, o cartão inteiro é o alvo.',
    `<div style="display:flex;gap:12px;">
      ${[['Somente eu','Ninguém mais vê este quadro','marcado',true],['Todo o workspace','Qualquer membro pode abrir','vazio',false]].map(([t, d, s, on]) => `
      <div style="flex:1;padding:13px;border-radius:12px;display:flex;gap:10px;align-items:flex-start;box-sizing:border-box;background:${on ? N.brand50 : N.surface};box-shadow:inset 0 0 0 1px ${on ? 'oklch(85% 0.06 262.6)' : HAIR};">
        ${cbx(s)}<div style="display:flex;flex-direction:column;gap:2px;"><span style="font-size:13px;font-weight:500;color:${N.fg};">${t}</span><span style="font-size:11.5px;line-height:16px;color:${N.muted};">${d}</span></div>
      </div>`).join('')}
    </div>`)}
  ${bloco('Radio e switch', 'Radio quando as opções se excluem e cabem na tela. Switch quando o efeito é imediato — sem botão de salvar.',
    `<div style="display:flex;gap:34px;align-items:flex-start;">
      <div style="display:flex;flex-direction:column;gap:10px;">
        ${[['Baixa',false],['Alta',true],['Urgente',false]].map(([t, on]) => `<span style="display:inline-flex;align-items:center;gap:9px;font-size:13.5px;color:${N.body};"><span style="width:16px;height:16px;border-radius:999px;flex-shrink:0;box-sizing:border-box;${on ? `background:${N.brand};display:inline-flex;align-items:center;justify-content:center;` : `box-shadow:inset 0 0 0 1.5px oklch(84% 0.011 96);background:${N.surface};`}">${on ? `<span style="width:6px;height:6px;border-radius:999px;background:#fff;"></span>` : ''}</span>${t}</span>`).join('')}
      </div>
      <div style="display:flex;flex-direction:column;gap:12px;">
        ${[['Notificar por e-mail',true],['Resumo semanal',false]].map(([t, on]) => `
        <span style="display:inline-flex;align-items:center;gap:10px;font-size:13.5px;color:${N.body};">
          <span style="width:34px;height:20px;border-radius:999px;display:inline-flex;align-items:center;padding:2px;box-sizing:border-box;flex-shrink:0;${on ? `background:${N.brand};justify-content:flex-end;` : `background:${N.surface2};box-shadow:inset 0 0 0 1px ${HAIR};`}"><span style="width:16px;height:16px;border-radius:999px;background:#fff;box-shadow:0 1px 2px oklch(32% 0.02 248.5 / 0.22);"></span></span>${t}</span>`).join('')}
      </div>
    </div>`)}
</div>`;

const quando = `
<div style="display:grid;grid-template-columns:repeat(4, minmax(0, 1fr));gap:18px;">
  ${[['Dropdown','Ações que acontecem ao clicar. Nunca guarda estado — quem guarda é o select.'],
     ['Select / Listbox','Uma escolha entre poucas, com o valor visível no gatilho depois.'],
     ['Combobox','A mesma coisa acima de ~8 opções, ou quando a lista vem da API.'],
     ['Checkbox','Escolhas independentes. Se as opções se excluem, é radio — trocar isso confunde de verdade.']].map(([t, d]) => `
  <div style="padding:16px;border-radius:12px;background:${N.surface};box-shadow:inset 0 0 0 1px ${HAIR};display:flex;flex-direction:column;gap:4px;">
    <span style="font-size:13px;font-weight:600;color:${N.fg};">${t}</span>
    <span style="font-size:12px;line-height:17px;color:${N.muted};">${d}</span>
  </div>`).join('')}
</div>`;

// ── dark
const ditem = (txt, { icon = '', sel = false, hl = false, danger = false, kb = '' } = {}) => `
<div style="height:30px;padding:0 8px;border-radius:7px;display:flex;align-items:center;gap:9px;font-size:13px;box-sizing:border-box;${hl ? `background:${danger ? D.dangerSub : D.surface2};` : ''}color:${danger ? D.dangerInk : D.body};">
  ${icon ? `<span style="display:flex;color:${danger ? D.danger : D.muted};flex-shrink:0;">${icon}</span>` : ''}<span style="flex-grow:1;">${txt}</span>
  ${sel ? `<span style="display:flex;color:${D.brand};">${I.check}</span>` : ''}${kb ? `<span style="font-family:'Geist Mono',monospace;font-size:11px;color:${D.subtle};">${kb}</span>` : ''}</div>`;
const dmenu = (inner, w = 224) => `<div style="width:${w}px;background:${D.surface};border-radius:12px;box-shadow:inset 0 0 0 1px ${D.hair}, 0 12px 32px oklch(0% 0 0 / 0.45);padding:5px;display:flex;flex-direction:column;gap:1px;box-sizing:border-box;">${inner}</div>`;
const dcbx = (st, sz = 16) => {
  const S = { vazio:`background:oklch(14% 0.004 107);box-shadow:inset 0 1px 0 rgba(255,255,255,0.045), inset 0 0 0 1px oklch(0.325 0.006 107);`, marcado:`background:${D.brand};color:oklch(17% 0.03 262.6);`,
    meio:`background:${D.brand};color:oklch(17% 0.03 262.6);`, inativo:`background:oklch(14% 0.004 107);box-shadow:inset 0 1px 0 rgba(255,255,255,0.045), inset 0 0 0 1px oklch(0.325 0.006 107);opacity:0.55;` }[st];
  return `<span style="width:${sz}px;height:${sz}px;border-radius:4px;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;box-sizing:border-box;${S}">${st === 'meio' ? I.minus : st === 'marcado' ? I.check : ''}</span>`;
};
const meiaDark = darkHalf('No escuro', 'O painel flutuante é a peça que mais sofre no dark: sem sombra visível contra fundo escuro, ele precisa de um degrau de superfície — o card sobe para L 22,5% contra o fundo de 19% — e de um filete. Sombra sozinha não separa nada aqui.', `
  <div style="display:flex;gap:26px;align-items:flex-start;flex-wrap:wrap;">
    ${dmenu(`${ditem('Editar', { icon:I.pencil, kb:'E' })}${ditem('Duplicar', { icon:I.copy, kb:'⌘D', hl:true })}<div style="height:1px;background:${D.hair};margin:4px 6px;"></div>${ditem('Excluir', { icon:I.trash, danger:true })}`)}
    ${dmenu(`${ditem('A fazer', { icon:`<span style="width:8px;height:8px;border-radius:999px;background:${D.subtle};"></span>` })}${ditem('Em andamento', { icon:`<span style="width:8px;height:8px;border-radius:999px;background:${D.brand};"></span>`, sel:true, hl:true })}${ditem('Bloqueada', { icon:`<span style="width:8px;height:8px;border-radius:999px;background:oklch(74% 0.15 58);"></span>` })}${ditem('Concluída', { icon:`<span style="width:8px;height:8px;border-radius:999px;background:${D.success};"></span>` })}`)}
    <div style="display:flex;flex-direction:column;gap:11px;">
      ${dcap('gatilho e seleção')}
      <div style="width:220px;height:32px;padding:0 11px;border-radius:${drr(32)}px;font-size:13px;display:flex;align-items:center;gap:8px;box-sizing:border-box;${dinput('rest')}color:${D.body};"><span style="flex-grow:1;">Em andamento</span><span style="display:flex;color:${D.muted};">${I.chev}</span></div>
      <div style="display:flex;flex-direction:column;gap:10px;">
        ${['vazio','marcado','meio','inativo'].map((s, i) => `<span style="display:inline-flex;align-items:center;gap:9px;font-size:13.5px;color:${s === 'inativo' ? D.subtle : D.body};">${dcbx(s)}${['Concluída','Concluída','Alguns itens','Bloqueado'][i]}</span>`).join('')}
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:11px;">
      ${dcap('cartão selecionável e switch')}
      <div style="width:230px;padding:13px;border-radius:12px;display:flex;gap:10px;align-items:flex-start;box-sizing:border-box;background:${D.brandSub};box-shadow:inset 0 0 0 1px ${D.brandSubLine};">
        ${dcbx('marcado')}<div style="display:flex;flex-direction:column;gap:2px;"><span style="font-size:13px;font-weight:500;color:${D.fg};">Somente eu</span><span style="font-size:11.5px;line-height:16px;color:${D.muted};">Ninguém mais vê este quadro</span></div>
      </div>
      <span style="display:inline-flex;align-items:center;gap:10px;font-size:13.5px;color:${D.body};"><span style="width:34px;height:20px;border-radius:999px;background:${D.brand};display:inline-flex;align-items:center;justify-content:flex-end;padding:2px;box-sizing:border-box;"><span style="width:16px;height:16px;border-radius:999px;background:oklch(17% 0.03 262.6);"></span></span>Notificar por e-mail</span>
    </div>
  </div>
`);

const body = `
<div style="display:flex;flex-direction:column;gap:14px;"><p class="sec-title">Qual usar</p>${quando}</div>
<div style="display:flex;flex-direction:column;margin-top:-4px;">
  ${rail('Dropdown', 'shadcn<br>DropdownMenu', dropdown)}
  ${rail('Select', 'shadcn Select<br>Combobox', selects)}
  ${rail('Checkbox', 'Radio · Switch<br>e os tipos', checkboxes, true)}
</div>
${meiaDark}`;

const html = page('Seleção e menus',
  'Dropdown, select, listbox, combobox, checkbox, radio e switch — com o critério de qual usar no topo, porque trocar checkbox por radio é o erro que mais confunde usuário de verdade. Painel flutuante tem raio 12, filete por dentro e a sombra grande; item sob o cursor ganha fundo, nunca borda.',
  body);
await Bun.write('Selecao.dc.html', html);
console.log('Selecao.dc.html', html.length, 'bytes');
