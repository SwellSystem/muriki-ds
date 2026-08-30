import { N, R, H, SHADOW, page } from './tokens.mjs';

const cap = t => `<span class="cap">${t}</span>`;
const ico = {
  search:`<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>`,
  chev:`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`,
  pencil:`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M16.5 4.5a2.1 2.1 0 0 1 3 3L8 19l-4 1 1-4Z"/></svg>`,
  check:`<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 13 4.5 4.5L19 7"/></svg>`,
  x:`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>`,
  plus:`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`,
  filter:`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 5.5h17l-6.5 7.6V19l-4 1.6v-8Z"/></svg>`,
};

// ---- receitas
const btn = (h, { variant = 'primary', label = 'Salvar', icon = '', fs } = {}) => {
  const size = { 24:{px:9,fs:12,r:'5px',g:5}, 28:{px:10,fs:12.5,r:'6px',g:6}, 32:{px:12,fs:13,r:'6px',g:6}, 36:{px:14,fs:13.5,r:'7px',g:7}, 44:{px:18,fs:15,r:'9px',g:8} }[h];
  const V = {
    primary:`background:${N.brand};color:#fff;border:1px solid transparent;`,
    outline:`background:${N.surface};color:${N.body};border:1px solid ${N.borderStrong};`,
    ghost:`background:transparent;color:${N.body};border:1px solid transparent;`,
    subtle:`background:${N.surface2};color:${N.body};border:1px solid transparent;`,
    danger:`background:${N.danger100};color:${N.danger800};border:1px solid transparent;`,
  }[variant];
  return `<span style="height:${h}px;padding:0 ${size.px}px;border-radius:${size.r};font-size:${fs || size.fs}px;font-weight:500;display:inline-flex;align-items:center;justify-content:center;gap:${size.g}px;white-space:nowrap;flex-shrink:0;${V}">${icon}${label}</span>`;
};
const inputAt = (h, level, { value, placeholder, icon = '', focus = false, w = '100%' } = {}) => {
  const size = { 24:{px:9,fs:12,r:'5px'}, 28:{px:10,fs:12.5,r:'6px'}, 32:{px:11,fs:13,r:'6px'}, 36:{px:13,fs:13.5,r:'7px'}, 44:{px:17,fs:15,r:'9px'} }[h];
  const L = {
    0:`background:transparent;border:1px solid transparent;`,
    1:`background:${N.surface};border:1px solid ${N.borderInput};`,
    2:`background:${N.surface2};border:1px solid transparent;`,
  }[level];
  const f = focus ? `border-color:${N.brand};box-shadow:0 0 0 3px oklch(47% 0.185 262.6 / 0.16);background:${N.surface};` : '';
  return `<span style="height:${h}px;padding:0 ${size.px}px;border-radius:${size.r};font-size:${size.fs}px;display:flex;align-items:center;gap:8px;width:${w};box-sizing:border-box;color:${value ? N.body : N.subtle};${L}${f}">${icon}${value || placeholder}${focus ? `<span style="width:1px;height:${size.fs + 3}px;background:${N.brand};margin-left:-6px;"></span>` : ''}</span>`;
};
const label = (t, size = 14) => `<span style="font-size:${size}px;font-weight:500;line-height:1;color:${N.fg};">${t}</span>`;

// ---- 1. níveis de contorno
const levelCard = (n, name, when, why, demo) => `
<div style="background:${N.surface};border:1px solid ${N.border};border-radius:14px;padding:20px;display:flex;flex-direction:column;gap:14px;">
  <div style="display:flex;align-items:baseline;gap:8px;">
    <span class="mono" style="font-size:11px;color:${N.brand};font-weight:500;">nível ${n}</span>
    <span style="font-size:14px;font-weight:600;color:${N.fg};">${name}</span>
  </div>
  <div style="background:${N.bg};border-radius:10px;padding:16px;display:flex;flex-direction:column;gap:11px;min-height:112px;justify-content:center;">${demo}</div>
  <div style="display:flex;flex-direction:column;gap:5px;">
    <span style="font-size:12.5px;line-height:17px;color:${N.body};"><strong style="font-weight:600;">Onde:</strong> ${when}</span>
    <span style="font-size:12.5px;line-height:17px;color:${N.muted};">${why}</span>
  </div>
</div>`;

const niveis = `
<div style="display:grid;grid-template-columns:repeat(3, minmax(0, 1fr));gap:20px;">
  ${levelCard(0, 'Invisível', 'edição no lugar — título de tarefa, célula de tabela, bloco de doc, rótulo no canvas.',
    'Em superfície densa cada borda é multiplicada por N linhas. O campo só se revela quando o cursor chega.', `
    <div style="display:flex;flex-direction:column;gap:7px;">
      <div style="display:flex;align-items:center;gap:8px;">${inputAt(28, 0, { value: 'Revisar contrato OpenAPI' })}</div>
      ${cap('repouso — parece texto')}
      <div style="display:flex;align-items:center;gap:8px;"><span style="height:28px;padding:0 9px;border-radius:7px;font-size:12.5px;display:flex;align-items:center;gap:8px;width:100%;box-sizing:border-box;background:${N.surface2};border:1px solid transparent;color:${N.body};">Revisar contrato OpenAPI<span style="margin-left:auto;color:${N.subtle};display:flex;">${ico.pencil}</span></span></div>
      ${cap('hover — ganha fundo')}
      <div style="display:flex;align-items:center;gap:8px;">${inputAt(28, 1, { value: 'Revisar contrato OpenAPI', focus: true })}</div>
      ${cap('foco — vira campo de verdade')}
    </div>`)}
  ${levelCard(1, 'Linha', 'formulário, modal, painel de configuração — onde o usuário veio para preencher.',
    'A linha diz “isto é editável” antes do clique. É o único nível que aguenta um formulário longo sem virar caça ao campo.', `
    <div style="display:flex;flex-direction:column;gap:6px;">
      ${label('Título', 13)}
      ${inputAt(32, 1, { value: 'Revisar contrato' })}
      <div style="display:flex;gap:8px;margin-top:4px;">${btn(28, { variant: 'primary', label: 'Salvar' })}${btn(28, { variant: 'ghost', label: 'Cancelar' })}</div>
    </div>`)}
  ${levelCard(2, 'Preenchido', 'busca global, barra de filtro, campo dentro de card branco ou sobre superfície escura.',
    'Onde a linha sumiria — sobre branco ou sobre escuro — o contraste vem do fundo. Também é o nível que pesa menos visualmente.', `
    <div style="display:flex;flex-direction:column;gap:9px;">
      ${inputAt(32, 2, { placeholder: 'Buscar tarefa, doc ou projeto', icon: `<span style="color:${N.subtle};display:flex;">${ico.search}</span>` })}
      <div style="display:flex;gap:7px;">
        ${btn(28, { variant: 'subtle', label: 'Meus', icon: `<span style="color:${N.muted};display:flex;">${ico.filter}</span>` })}
        ${btn(28, { variant: 'subtle', label: 'Esta semana' })}
      </div>
    </div>`)}
</div>`;

// ---- 2. uma superfície, um nível
const mixedForm = (mixed) => `
<div style="background:${N.surface};border:1px solid ${N.border};border-radius:14px;padding:18px;display:flex;flex-direction:column;gap:13px;">
  <div style="display:flex;flex-direction:column;gap:6px;">${label('Título', 13)}${inputAt(32, 1, { value: 'Revisar contrato OpenAPI' })}</div>
  <div style="display:flex;flex-direction:column;gap:6px;">${label('Projeto', 13)}${inputAt(32, mixed ? 2 : 1, { value: 'Muriki API', icon: '' })}</div>
  <div style="display:flex;flex-direction:column;gap:6px;">${label('Responsável', 13)}${inputAt(32, mixed ? 0 : 1, { value: 'Guilherme Teodoro' })}</div>
  <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:2px;">
    ${btn(32, { variant: 'ghost', label: 'Cancelar' })}${btn(32, { variant: 'primary', label: 'Criar tarefa' })}
  </div>
</div>`;
const coerencia = `
<div style="display:grid;grid-template-columns:repeat(2, minmax(0, 1fr));gap:22px;">
  <div style="display:flex;flex-direction:column;gap:9px;">
    <div style="display:flex;align-items:center;gap:7px;"><span style="width:16px;height:16px;border-radius:999px;background:${N.danger100};color:${N.danger800};display:inline-flex;align-items:center;justify-content:center;">${ico.x}</span><span style="font-size:13px;font-weight:600;color:${N.fg};">Três níveis no mesmo formulário</span></div>
    ${mixedForm(true)}
    <span style="font-size:12.5px;line-height:17px;color:${N.muted};">Cada campo parece um componente diferente. O olho lê hierarquia onde não existe nenhuma — os três têm exatamente o mesmo peso.</span>
  </div>
  <div style="display:flex;flex-direction:column;gap:9px;">
    <div style="display:flex;align-items:center;gap:7px;"><span style="width:16px;height:16px;border-radius:999px;background:${N.success100};color:${N.success800};display:inline-flex;align-items:center;justify-content:center;">${ico.check}</span><span style="font-size:13px;font-weight:600;color:${N.fg};">Um nível, do começo ao fim</span></div>
    ${mixedForm(false)}
    <span style="font-size:12.5px;line-height:17px;color:${N.muted};">A superfície escolhe o nível, não o campo. Trocar de nível dentro de um formulário só se justifica quando o campo faz outra coisa — busca, por exemplo.</span>
  </div>
</div>`;

// ---- 3. altura por cenário
const heightRow = (h, cenario, nota, level) => `
<div style="display:grid;grid-template-columns:56px 1fr 190px 1.1fr;gap:18px;align-items:center;padding:14px 0;border-bottom:1px solid ${N.border};">
  <span class="mono" style="font-size:12px;color:${N.brand};font-weight:500;">${h}px</span>
  <div style="display:flex;align-items:center;gap:10px;">
    ${label(h >= 32 ? 'Título' : 'Título', h >= 32 ? 13 : 12)}
    ${inputAt(h, level, { value: 'Revisar contrato', w: '190px' })}
    ${btn(h, { variant: 'primary', label: 'Salvar' })}
  </div>
  <span style="font-size:13px;font-weight:500;color:${N.fg};">${cenario}</span>
  <span style="font-size:12.5px;line-height:17px;color:${N.muted};">${nota}</span>
</div>`;
const alturas = `
<div style="display:flex;flex-direction:column;">
  ${heightRow(24, 'Toolbar de canvas', 'Só ícone ou palavra curta. Nunca recebe label acima — o rótulo vira tooltip.', 2)}
  ${heightRow(28, 'Linha de tabela, filtro', 'A altura padrão de tudo que vive dentro de uma lista. Label vira coluna, não fica acima.', 0)}
  ${heightRow(32, 'Formulário, modal, header', 'O padrão do sistema. Se você está em dúvida, é este.', 1)}
  ${heightRow(36, 'Ação principal de página', 'Um por tela. O CTA do estado vazio, o “Criar” do header.', 1)}
  ${heightRow(44, 'Mobile e busca global', 'Piso de toque. No desktop só a busca global merece — ela quer ser encontrada de longe.', 2)}
</div>`;

// ---- 4. peso não é altura
const taskRowDemo = (bigBtn) => `
<div style="background:${N.surface};border:1px solid ${N.border};border-radius:14px;overflow:hidden;">
  ${[['Revisar contrato OpenAPI do módulo focus', false], ['Regenerar client Kubb no platform', true], ['Subir migration de focus_task_labels', false]].map(([t, hl]) => `
  <div style="display:flex;align-items:center;gap:11px;height:${bigBtn ? 52 : 44}px;padding:0 12px;border-bottom:1px solid ${N.surface2};${hl ? `background:${N.brand50};` : ''}">
    <span style="width:16px;height:16px;border-radius:5px;border:1.5px solid ${N.borderStrong};flex-shrink:0;"></span>
    <span style="font-size:13.5px;flex-grow:1;">${t}</span>
    ${hl ? btn(bigBtn ? 36 : 28, { variant: 'primary', label: 'Retomar' }) : `<span style="font-size:12px;color:${N.muted};">4h</span>`}
  </div>`).join('')}
</div>`;
const peso = `
<div style="display:grid;grid-template-columns:repeat(2, minmax(0, 1fr));gap:22px;">
  <div style="display:flex;flex-direction:column;gap:9px;">
    <div style="display:flex;align-items:center;gap:7px;"><span style="width:16px;height:16px;border-radius:999px;background:${N.danger100};color:${N.danger800};display:inline-flex;align-items:center;justify-content:center;">${ico.x}</span><span style="font-size:13px;font-weight:600;color:${N.fg};">Ação importante ganhou altura</span></div>
    ${taskRowDemo(true)}
    <span style="font-size:12.5px;line-height:17px;color:${N.muted};">O botão de 36px empurra a linha inteira para 52px e desalinha a lista. A importância vazou para a métrica errada.</span>
  </div>
  <div style="display:flex;flex-direction:column;gap:9px;">
    <div style="display:flex;align-items:center;gap:7px;"><span style="width:16px;height:16px;border-radius:999px;background:${N.success100};color:${N.success800};display:inline-flex;align-items:center;justify-content:center;">${ico.check}</span><span style="font-size:13px;font-weight:600;color:${N.fg};">Ação importante ganhou variante</span></div>
    ${taskRowDemo(false)}
    <span style="font-size:12.5px;line-height:17px;color:${N.muted};">Mesma altura da superfície, peso vindo da cor. A linha continua no ritmo e a ação continua óbvia.</span>
  </div>
</div>`;

// ---- 5. label
const labelCase = (title, when, demo) => `
<div style="display:flex;flex-direction:column;gap:10px;">
  <div style="background:${N.bg};border:1px solid ${N.border};border-radius:10px;padding:16px;min-height:92px;display:flex;align-items:center;">${demo}</div>
  <div style="display:flex;flex-direction:column;gap:3px;">
    <span style="font-size:13px;font-weight:600;color:${N.fg};">${title}</span>
    <span style="font-size:12.5px;line-height:17px;color:${N.muted};">${when}</span>
  </div>
</div>`;
const labels = `
<div style="display:grid;grid-template-columns:repeat(4, minmax(0, 1fr));gap:20px;">
  ${labelCase('Acima · 14px medium', 'O padrão. Formulário, modal, qualquer campo que o usuário veio preencher.',
    `<div style="display:flex;flex-direction:column;gap:6px;width:100%;">${label('Título')}${inputAt(32, 1, { value: 'Revisar contrato' })}</div>`)}
  ${labelCase('Ao lado · coluna fixa', 'Configuração longa, onde o par nome/valor lê melhor em duas colunas do que empilhado.',
    `<div style="display:flex;flex-direction:column;gap:9px;width:100%;">
      <div style="display:flex;align-items:center;gap:12px;"><span style="font-size:13px;font-weight:500;color:${N.muted};width:74px;flex-shrink:0;">Projeto</span>${inputAt(28, 1, { value: 'Muriki API' })}</div>
      <div style="display:flex;align-items:center;gap:12px;"><span style="font-size:13px;font-weight:500;color:${N.muted};width:74px;flex-shrink:0;">Prazo</span>${inputAt(28, 1, { value: '12 set' })}</div>
    </div>`)}
  ${labelCase('Caption · 11px caixa alta', 'Painel de propriedades denso, onde o label é referência e não instrução.',
    `<div style="display:flex;flex-direction:column;gap:5px;width:100%;"><span style="font-size:11px;font-weight:600;letter-spacing:0.07em;text-transform:uppercase;color:${N.muted};">Estimativa</span>${inputAt(28, 0, { value: '4h 30m' })}</div>`)}
  ${labelCase('Sem label', 'Só busca e edição no lugar — onde o contexto já diz o que é. O nome vive no aria-label.',
    `<div style="width:100%;">${inputAt(32, 2, { placeholder: 'Buscar…', icon: `<span style="color:${N.subtle};display:flex;">${ico.search}</span>` })}</div>`)}
</div>
<div style="background:${N.acc100};border:1px solid ${N.acc};border-radius:14px;padding:16px 18px;display:flex;gap:14px;align-items:center;margin-top:4px;">
  <div style="display:flex;flex-direction:column;gap:3px;flex-grow:1;">
    <span style="font-size:13.5px;font-weight:600;color:${N.fg};">Label nunca é placeholder.</span>
    <span style="font-size:12.5px;line-height:17px;color:${N.body};max-width:560px;">O placeholder some quando o usuário digita — junto com ele some o nome do campo, e quem for revisar o formulário não sabe mais o que preencheu. Placeholder é exemplo do formato, não o nome da coisa.</span>
  </div>
  <div style="display:flex;gap:14px;flex-shrink:0;">
    <div style="display:flex;flex-direction:column;gap:6px;">${inputAt(32, 1, { placeholder: 'Data de entrega', w: '150px' })}${cap('placeholder como nome')}</div>
    <div style="display:flex;flex-direction:column;gap:6px;"><div style="display:flex;flex-direction:column;gap:5px;">${label('Data de entrega', 12)}${inputAt(32, 1, { placeholder: '12/09/2026', w: '150px' })}</div>${cap('nome + exemplo')}</div>
  </div>
</div>`;

const body = `
  <div style="display:flex;flex-direction:column;gap:14px;">
    <p class="sec-title">Contorno — três níveis, e só três</p>
    ${niveis}
  </div>
  <div style="display:flex;flex-direction:column;gap:14px;">
    <p class="sec-title">Uma superfície, um nível</p>
    ${coerencia}
  </div>
  <div style="display:flex;flex-direction:column;gap:14px;">
    <p class="sec-title">Altura — o cenário escolhe, não a importância</p>
    <div class="card" style="padding:8px 26px 14px;">${alturas}</div>
  </div>
  <div style="display:flex;flex-direction:column;gap:14px;">
    <p class="sec-title">Peso vem da variante, nunca da altura</p>
    ${peso}
  </div>
  <div style="display:flex;flex-direction:column;gap:14px;">
    <p class="sec-title">Label — quatro posições</p>
    ${labels}
  </div>`;

const html = page('Contorno e altura',
  'A pergunta que decide se o sistema parece moderno ou remendado. Três níveis de contorno, cinco alturas, quatro posições de label — e a regra de quando usar cada um. As alturas são as que o <span class="mono" style="font-size:12.5px;">muriki-platform</span> já usa hoje (24/28/32/36 no <span class="mono" style="font-size:12.5px;">buttonVariants</span>); o que faltava era dizer <em>quando</em>.',
  body);
await Bun.write('Contorno.dc.html', html);
console.log('Contorno.dc.html', html.length, 'bytes');
