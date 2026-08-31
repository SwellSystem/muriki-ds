import { N, page } from './tokens.mjs';
import { rr, HAIR } from './buttons.mjs';
import { C } from './gen-badges.mjs';
import { D, darkHalf, dcap, rr as drr } from './dark.mjs';
const cap = t => `<span class="cap">${t}</span>`;
const S = (p, w = 15) => `<svg width="${w}" height="${w}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
const I = {
  pencil:S('<path d="M16.5 4.5a2.1 2.1 0 0 1 3 3L8 19l-4 1 1-4Z"/>'),
  copy:S('<rect x="8.5" y="8.5" width="11" height="11" rx="2"/><path d="M15.5 5.5h-9a2 2 0 0 0-2 2v9"/>'),
  move:S('<path d="M12 3.5v17M12 3.5 8.5 7M12 3.5 15.5 7M12 20.5 8.5 17M12 20.5l3.5-3.5"/>'),
  archive:S('<rect x="3.5" y="4.5" width="17" height="4" rx="1.4"/><path d="M5.2 8.5V19a1.5 1.5 0 0 0 1.5 1.5h10.6a1.5 1.5 0 0 0 1.5-1.5V8.5M10 12.5h4"/>'),
  trash:S('<path d="M4 6.5h16M9.5 6.5V4.8h5V6.5M6.5 6.5 7.4 20h9.2l.9-13.5"/>'),
  dots:`<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><circle cx="5.5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="18.5" cy="12" r="1.6"/></svg>`,
  link:S('<path d="M10 13.8a4 4 0 0 0 5.7 0l2.6-2.6a4 4 0 1 0-5.7-5.7l-1.3 1.3"/><path d="M14 10.2a4 4 0 0 0-5.7 0l-2.6 2.6a4 4 0 1 0 5.7 5.7l1.3-1.3"/>'),
  user:S('<circle cx="12" cy="8.5" r="3.6"/><path d="M4.8 20c.9-3.4 3.8-5.4 7.2-5.4s6.3 2 7.2 5.4"/>'),
  eyeOff:S('<path d="M3 3l18 18M10.6 6.1A9.4 9.4 0 0 1 12 6c6 0 9.5 6 9.5 6a15 15 0 0 1-3.1 3.7M6.4 8.3A15.4 15.4 0 0 0 2.5 12S6 18 12 18c1.2 0 2.3-.2 3.3-.6"/>'),
  pin:S('<path d="M9 3.5h6l-.8 5.2 3.3 3.3H6.5l3.3-3.3Z"/><path d="M12 12v8.5"/>'),
  arrowUp:S('<path d="M12 19.5V5M6 11l6-6 6 6"/>', 14),
  arrowDown:S('<path d="M12 4.5V19M18 13l-6 6-6-6"/>', 14),
  check:`<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 13 4.5 4.5L19 7"/></svg>`,
  x:S('<path d="M6 6l12 12M18 6 6 18"/>', 14),
};

const rail = (nome, meta, spec, last = false) => `
<div style="display:grid;grid-template-columns:158px 1fr;gap:28px;padding:24px 0;${last ? '' : `border-bottom:1px solid ${N.border};`}align-items:start;">
  <div style="display:flex;flex-direction:column;gap:3px;position:relative;top:2px;">
    <span style="font-size:14px;font-weight:600;color:${N.fg};letter-spacing:-0.008em;">${nome}</span>
    <span class="cap" style="line-height:15px;">${meta}</span>
  </div>
  <div style="display:flex;flex-direction:column;gap:18px;min-width:0;">${spec}</div>
</div>`;
const bloco = (titulo, nota, inner) => `
<div style="display:flex;flex-direction:column;gap:10px;">
  <div>${inner}</div>
  <div style="display:flex;flex-direction:column;gap:2px;"><span style="font-size:12.5px;font-weight:600;color:${N.fg};">${titulo}</span><span style="font-size:12px;line-height:16px;color:${N.muted};">${nota}</span></div>
</div>`;

// ── a ferramenta em si
const tool = (icon, { st = 'rest', h = 28, danger = false } = {}) => {
  const V = { rest:`background:transparent;color:${N.muted};`,
    hover:`background:${danger ? N.danger50 : N.surface2};color:${danger ? N.danger : N.fg};`,
    focus:`background:${N.surface2};color:${N.fg};box-shadow:0 0 0 2px ${N.surface}, 0 0 0 4px oklch(47% 0.185 262.6 / 0.4);`,
    active:`background:oklch(93% 0.012 96);color:${N.fg};` }[st];
  return `<span style="width:${h}px;height:${h}px;border-radius:${rr(h)}px;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;box-sizing:border-box;${V}">${icon}</span>`;
};
const barra = (opts = {}) => `<span style="display:inline-flex;align-items:center;gap:1px;${opts.wrap ? `padding:2px;border-radius:${rr(32)}px;background:${N.surface};box-shadow:inset 0 0 0 1px ${HAIR}, 0 2px 6px oklch(32% 0.02 248.5 / 0.07);` : ''}">
  ${tool(I.pencil, opts.hoverIdx === 0 ? { st:'hover' } : opts.focusIdx === 0 ? { st:'focus' } : {})}
  ${tool(I.copy, opts.hoverIdx === 1 ? { st:'hover' } : {})}
  ${tool(I.move, opts.hoverIdx === 2 ? { st:'hover' } : {})}
  ${tool(I.archive, opts.hoverIdx === 3 ? { st:'hover' } : {})}
  <span style="width:1px;height:16px;background:${N.border};margin:0 3px;"></span>
  ${tool(I.dots, opts.hoverIdx === 4 ? { st:'hover' } : {})}
</span>`;

const tip = (txt, kb = '') => `<span style="display:inline-flex;align-items:center;gap:7px;background:oklch(24% 0.02 250);color:oklch(97% 0.003 100);font-size:12px;padding:5px 9px;border-radius:7px;box-shadow:0 4px 12px oklch(32% 0.02 248.5 / 0.18);white-space:nowrap;">${txt}${kb ? `<span class="mono" style="font-size:11px;opacity:0.65;">${kb}</span>` : ''}</span>`;

const linha = (t, { hover = false, sel = false, tools = null, prio, label, status, h = 44 } = {}) => `
<div style="display:flex;align-items:center;gap:10px;height:${h}px;padding:0 12px;box-sizing:border-box;border-bottom:1px solid ${N.surface2};${sel ? `background:${N.brand50};` : hover ? `background:${N.surface2};` : ''}">
  <span style="width:16px;height:16px;border-radius:4px;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;${sel ? `background:${N.brand};color:#fff;` : `box-shadow:inset 0 0 0 1.5px oklch(84% 0.011 96);`}">${sel ? I.check : ''}</span>
  <span style="font-size:13.5px;color:${N.body};flex-grow:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${t}</span>
  ${tools ? tools : `<span style="display:inline-flex;align-items:center;gap:8px;">
    ${prio ? `<span style="display:inline-flex;align-items:center;height:18px;padding:0 7px;border-radius:4px;background:${C[prio[0]].bg};color:${C[prio[0]].fg};font-size:11px;font-weight:500;">${prio[1]}</span>` : ''}
    ${label ? `<span style="display:inline-flex;align-items:center;height:18px;padding:0 7px;border-radius:4px;background:${C[label[0]].bg};color:${C[label[0]].fg};font-size:11px;font-weight:500;">${label[1]}</span>` : ''}
    ${status ? `<span style="display:inline-flex;align-items:center;gap:5px;height:18px;padding:0 7px;border-radius:4px;background:${C[status[0]].bg};color:${C[status[0]].fg};font-size:11px;font-weight:500;"><span style="width:5px;height:5px;border-radius:999px;background:${C[status[0]].dot};"></span>${status[1]}</span>` : ''}
  </span>`}
</div>`;

const tabela = (linhas) => `<div style="background:${N.surface};border-radius:14px;box-shadow:inset 0 0 0 1px ${HAIR};overflow:hidden;">${linhas}</div>`;

// ── seções
const regra = `
<div style="display:grid;grid-template-columns:repeat(3, minmax(0, 1fr));gap:18px;">
  ${[['Tooltip não é opcional','Ícone sem rótulo é adivinhação. Toda ferramenta tem tooltip com o verbo, e <span class="mono" style="font-size:11.5px;">aria-label</span> com o mesmo texto — o leitor de tela não vê o desenho.'],
     ['Aparece no hover, some no resto','Em quarenta linhas, cinco ícones por linha são duzentos ícones. Eles só existem quando o cursor chega — ou quando o teclado chega, que é o caso que todo mundo esquece.'],
     ['No toque não há hover','Celular não tem cursor. Ou as ferramentas ficam sempre visíveis, ou viram um único botão de “mais”. Nunca copie o comportamento do desktop para lá.']].map(([t, d]) => `
  <div style="padding:16px 18px;border-radius:12px;background:${N.surface};box-shadow:inset 0 0 0 1px ${HAIR};display:flex;flex-direction:column;gap:5px;">
    <span style="font-size:13.5px;font-weight:600;color:${N.fg};">${t}</span>
    <span style="font-size:12.5px;line-height:18px;color:${N.muted};">${d}</span>
  </div>`).join('')}
</div>`;

const ferramentas = `
<div style="display:grid;grid-template-columns:1.35fr 1fr;gap:26px;align-items:start;">
  ${bloco('Os quatro estados da linha', 'Repouso mostra os metadados. O cursor troca metadado por ferramenta, no mesmo lugar — a linha não muda de altura nem empurra nada.',
    tabela(`
      ${linha('Revisar contrato OpenAPI do módulo focus', { prio:['laranja','Alta'], label:['ciano','backend'], status:['azul','Em andamento'] })}
      ${linha('Regenerar client Kubb no platform', { hover:true, tools:barra({ hoverIdx:0 }) })}
      ${linha('Subir migration de focus_task_labels', { tools:barra({ focusIdx:0 }) })}
      ${linha('Escrever teste do webhook de subscriptions', { sel:true, tools:barra({}) })}
    `) + `<div style="display:grid;grid-template-columns:repeat(4, minmax(0, 1fr));gap:8px;padding-top:9px;">${['repouso — metadado','hover — ferramenta','foco por teclado','linha selecionada'].map(t => cap(t)).join('')}</div>`)}
  ${bloco('A barra isolada', 'Cinco alvos de 28px, colados. O separador antes do “mais” não é decoração: ele diz que o que vem depois é outra categoria.',
    `<div style="display:flex;flex-direction:column;gap:16px;">
      <div style="padding:14px;border-radius:12px;background:${N.surface};box-shadow:inset 0 0 0 1px ${HAIR};display:flex;justify-content:center;">${barra({ wrap:true, hoverIdx:0 })}</div>
      <div style="display:grid;grid-template-columns:repeat(5, minmax(0, 1fr));gap:6px;text-align:center;">
        ${['editar','duplicar','mover','arquivar','mais'].map(t => cap(t)).join('')}
      </div>
      <div style="display:flex;flex-direction:column;gap:9px;align-items:center;">
        ${tip('Editar', 'E')}
        <span style="width:1px;height:8px;background:${N.borderStrong};"></span>
        ${tool(I.pencil, { st:'hover' })}
      </div>
      ${cap('tooltip aparece em 400ms, some na hora — e traz o atalho quando existe')}
    </div>`)}
</div>`;

const bulk = `
<div style="display:grid;grid-template-columns:1.35fr 1fr;gap:26px;align-items:start;">
  ${bloco('Seleção múltipla', 'A barra flutua sobre a tabela quando há seleção. Ícone para o que é reversível; texto para o que não é.',
    `<div style="position:relative;">
      ${tabela(`
        ${linha('Revisar contrato OpenAPI do módulo focus', { sel:true, prio:['laranja','Alta'], status:['azul','Em andamento'] })}
        ${linha('Regenerar client Kubb no platform', { sel:true, prio:['vermelho','Urgente'], status:['amarelo','Bloqueada'] })}
        ${linha('Subir migration de focus_task_labels', { prio:['cinza','Baixa'], status:['verde','Concluída'] })}
        ${linha('Escrever teste do webhook de subscriptions', { sel:true, prio:['azul','Média'], status:['cinza','A fazer'] })}
      `)}
      <div style="display:flex;justify-content:center;margin-top:-12px;position:relative;">
        <span style="display:inline-flex;align-items:center;gap:8px;padding:6px 8px 6px 14px;border-radius:12px;background:oklch(24% 0.02 250);box-shadow:0 10px 28px oklch(32% 0.02 248.5 / 0.28);">
          <span style="font-size:12.5px;font-weight:500;color:oklch(97% 0.003 100);">3 selecionadas</span>
          <span style="width:1px;height:16px;background:oklch(38% 0.02 250);"></span>
          ${['user','archive','move'].map(k => `<span style="width:26px;height:26px;border-radius:5px;display:inline-flex;align-items:center;justify-content:center;color:oklch(80% 0.006 100);">${I[k]}</span>`).join('')}
          <span style="display:inline-flex;align-items:center;gap:6px;height:26px;padding:0 9px;border-radius:5px;font-size:12.5px;font-weight:500;color:oklch(84% 0.09 27);background:oklch(30% 0.06 27);">${I.trash}Excluir</span>
          <span style="width:1px;height:16px;background:oklch(38% 0.02 250);"></span>
          <span style="width:26px;height:26px;border-radius:5px;display:inline-flex;align-items:center;justify-content:center;color:oklch(70% 0.006 100);">${I.x}</span>
        </span>
      </div>
    </div>`)}
  ${bloco('Menu de cabeçalho de coluna', 'Clicar no título ordena; a setinha ao lado abre o resto. Duas ações, dois alvos — nunca um menu que também ordena.',
    `<div style="display:flex;flex-direction:column;gap:12px;">
      <div style="display:flex;align-items:center;gap:6px;padding:8px 12px;border-radius:10px;background:${N.surface};box-shadow:inset 0 0 0 1px ${HAIR};">
        <span style="font-size:12px;font-weight:600;color:${N.fg};">Prazo</span>
        <span style="display:flex;color:${N.brand};">${I.arrowUp}</span>
        <span style="margin-left:auto;">${tool(I.dots, { st:'hover', h:22 })}</span>
      </div>
      <div style="width:212px;background:${N.surface};border-radius:12px;box-shadow:inset 0 0 0 1px ${HAIR}, 0 10px 30px oklch(32% 0.02 248.5 / 0.10);padding:5px;display:flex;flex-direction:column;gap:1px;">
        ${[[I.arrowUp,'Crescente',true],[I.arrowDown,'Decrescente',false],[I.pin,'Fixar coluna',false],[I.eyeOff,'Esconder',false]].map(([ic, t, sel]) => `
        <div style="height:30px;padding:0 8px;border-radius:7px;display:flex;align-items:center;gap:9px;font-size:13px;color:${N.body};${sel ? `background:${N.surface2};` : ''}"><span style="display:flex;color:${N.muted};">${ic}</span><span style="flex-grow:1;">${t}</span>${sel ? `<span style="display:flex;color:${N.brand};">${I.check}</span>` : ''}</div>`).join('')}
      </div>
    </div>`)}
</div>`;

const densidade = `
<div style="display:grid;grid-template-columns:repeat(3, minmax(0, 1fr));gap:24px;align-items:start;">
  ${bloco('Compacta — 36px', 'Ferramentas de 24px. É o limite: abaixo disso o alvo fica menor que o dedo, e no desktop já incomoda o mouse.',
    tabela(linha('Revisar contrato OpenAPI', { h:36, hover:true, tools:`<span style="display:inline-flex;gap:1px;">${tool(I.pencil, { h:24, st:'hover' })}${tool(I.copy, { h:24 })}${tool(I.dots, { h:24 })}</span>` }) + linha('Regenerar client Kubb', { h:36, prio:['cinza','Baixa'] })))}
  ${bloco('Padrão — 44px', 'Ferramentas de 28px. A densidade do produto, e a que está desenhada em toda a folha.',
    tabela(linha('Revisar contrato OpenAPI', { hover:true, tools:barra({ hoverIdx:0 }) }) + linha('Regenerar client Kubb', { prio:['cinza','Baixa'] })))}
  ${bloco('Toque — 56px', 'Sem hover: as ferramentas viram um único botão de 44px, sempre visível. O resto vai para o menu ou para o gesto de arrastar.',
    tabela(linha('Revisar contrato OpenAPI', { h:56, tools:`<span style="width:44px;height:44px;border-radius:9px;display:inline-flex;align-items:center;justify-content:center;color:${N.muted};background:${N.surface2};">${I.dots}</span>` }) + linha('Regenerar client Kubb', { h:56, tools:`<span style="width:44px;height:44px;border-radius:9px;display:inline-flex;align-items:center;justify-content:center;color:${N.muted};">${I.dots}</span>` })))}
</div>`;

// dark
const dtool = (icon, st = 'rest') => `<span style="width:28px;height:28px;border-radius:${drr(28)}px;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;${st === 'hover' ? `background:${D.surface2};color:${D.fg};` : `background:transparent;color:${D.muted};`}">${icon}</span>`;
const dlinha = (t, { hover = false, sel = false, tools = null, badges = '' } = {}) => `
<div style="display:flex;align-items:center;gap:10px;height:44px;padding:0 12px;box-sizing:border-box;border-bottom:1px solid ${D.hair};${sel ? `background:${D.brandSub};` : hover ? `background:${D.surface2};` : ''}">
  <span style="width:16px;height:16px;border-radius:4px;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;${sel ? `background:${D.brand};color:oklch(17% 0.03 262.6);` : `box-shadow:inset 0 0 0 1.5px ${D.hairStrong};`}">${sel ? I.check : ''}</span>
  <span style="font-size:13.5px;color:${D.body};flex-grow:1;">${t}</span>${tools || badges}
</div>`;
const meiaDark = darkHalf('No escuro', 'A ferramenta de linha é ghost nos dois temas — o que muda é o fundo do hover, que aqui sobe de luz em vez de descer. E a barra de seleção múltipla, que no claro era escura, aqui precisa ficar <em>mais clara</em> que a tabela para continuar flutuando.', `
  <div style="display:flex;gap:26px;align-items:flex-start;flex-wrap:wrap;">
    <div style="flex:1;min-width:400px;display:flex;flex-direction:column;gap:12px;">
      <div style="background:${D.surface};border-radius:14px;box-shadow:inset 0 0 0 1px ${D.hair};overflow:hidden;">
        ${dlinha('Revisar contrato OpenAPI do módulo focus', { badges:`<span style="display:inline-flex;gap:6px;">${['laranja:Alta','azul:Em andamento'].map(b => { const [c, t] = b.split(':'); const M = { laranja:['oklch(29% 0.060 55)','oklch(86% 0.085 60)'], azul:['oklch(29% 0.055 262)','oklch(85% 0.075 262)'] }[c]; return `<span style="display:inline-flex;align-items:center;height:18px;padding:0 7px;border-radius:4px;background:${M[0]};color:${M[1]};font-size:11px;font-weight:500;">${t}</span>`; }).join('')}</span>` })}
        ${dlinha('Regenerar client Kubb no platform', { hover:true, tools:`<span style="display:inline-flex;gap:1px;">${dtool(I.pencil, 'hover')}${dtool(I.copy)}${dtool(I.move)}${dtool(I.archive)}<span style="width:1px;height:16px;background:${D.hair};margin:0 3px;align-self:center;"></span>${dtool(I.dots)}</span>` })}
        ${dlinha('Subir migration de focus_task_labels', { sel:true, tools:`<span style="display:inline-flex;gap:1px;">${dtool(I.pencil)}${dtool(I.copy)}${dtool(I.dots)}</span>` })}
      </div>
      <div style="display:flex;justify-content:center;margin-top:-6px;">
        <span style="display:inline-flex;align-items:center;gap:8px;padding:6px 8px 6px 14px;border-radius:12px;background:${D.surface3};box-shadow:inset 0 0 0 1px ${D.hairStrong}, 0 12px 30px oklch(0% 0 0 / 0.5);">
          <span style="font-size:12.5px;font-weight:500;color:${D.fg};">3 selecionadas</span>
          <span style="width:1px;height:16px;background:${D.hairStrong};"></span>
          ${['user','archive','move'].map(k => `<span style="width:26px;height:26px;border-radius:5px;display:inline-flex;align-items:center;justify-content:center;color:${D.body};">${I[k]}</span>`).join('')}
          <span style="display:inline-flex;align-items:center;gap:6px;height:26px;padding:0 9px;border-radius:5px;font-size:12.5px;font-weight:500;color:${D.dangerInk};background:${D.dangerSub};">${I.trash}Excluir</span>
        </span>
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:12px;">
      ${dcap('tooltip no escuro — inverte para claro')}
      <div style="display:flex;flex-direction:column;gap:9px;align-items:center;">
        <span style="display:inline-flex;align-items:center;gap:7px;background:oklch(93% 0.005 100);color:oklch(21% 0.006 107);font-size:12px;padding:5px 9px;border-radius:7px;white-space:nowrap;">Editar<span style="font-family:'Geist Mono',monospace;font-size:11px;opacity:0.55;">E</span></span>
        <span style="width:1px;height:8px;background:${D.hairStrong};"></span>
        ${dtool(I.pencil, 'hover')}
      </div>
    </div>
  </div>
`);

const body = `
<div style="display:flex;flex-direction:column;gap:14px;"><p class="sec-title">Três regras que não se negociam</p>${regra}</div>
<div style="display:flex;flex-direction:column;margin-top:-4px;">
  ${rail('Ferramentas', 'da linha<br>só ícone', ferramentas)}
  ${rail('Em lote', 'seleção múltipla<br>cabeçalho', bulk)}
  ${rail('Densidade', 'compacta · padrão<br>toque', densidade, true)}
</div>
${meiaDark}`;

const html = page('Ferramentas de tabela',
  'O componente que faz a lista trabalhar: uma barra de ícones sem uma palavra escrita, que aparece na linha sob o cursor e some quando ele sai. Zero texto exige duas coisas em troca — tooltip em todas e <span class="mono" style="font-size:12.5px;">aria-label</span> em todas. Sem isso, é adivinhação com estilo.',
  body);
await Bun.write('Tabela.dc.html', html);
console.log('Tabela.dc.html', html.length, 'bytes');
