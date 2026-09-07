// Prancha do RAIL. As decisões de hoje só existiam no código e no readme —
// e decisão que não está desenhada some no próximo redesenho.
//
//   cd design && bun gen-rail.mjs
import { N, page } from './tokens.mjs';
import { HAIR } from './recipes.mjs';

const cap = t => `<span class="cap">${t}</span>`;

// A elevação do rail é a MESMA do cursor do view-toggle. Escrita aqui igual
// à do componente, para a prancha não divergir do código.
const ELEV_CLARO = `box-shadow:0 1px 2px rgba(0,0,0,0.14), 0 2px 6px rgba(0,0,0,0.07), inset 0 0 0 1px ${N.borderInput};`;
const ELEV_ESCURO = 'box-shadow:inset 0 1px 3px rgba(0,0,0,0.65), inset 0 -1px 0 rgba(255,255,255,0.06), inset 0 0 0 1px oklch(0.135 0.004 107);';

const RAIL_CLARO = 'oklch(0.993 0.002 85)';
const RAIL_ESCURO = 'oklch(0.155 0.004 107)';

const item = (txt, ativo = false, escuro = false) => `
<div style="display:flex;align-items:center;gap:9px;height:30px;padding:0 9px;border-radius:8px;font-size:12.5px;position:relative;
  ${ativo
    ? escuro
      ? `background:oklch(0.275 0.055 262.6);color:oklch(0.84 0.1 262.6);`
      : `background:${N.brand50};color:${N.brand800};`
    : `color:${escuro ? 'oklch(0.70 0.006 100)' : N.muted};`}">
  ${ativo ? `<span style="position:absolute;left:0;top:6px;bottom:6px;width:3px;border-radius:999px;background:${escuro ? 'oklch(0.7 0.145 262.6)' : N.brand};"></span>` : ''}
  <span style="width:15px;height:15px;border-radius:4px;background:currentColor;opacity:0.35;flex-shrink:0;"></span>
  ${txt}
</div>`;


// linha da régua: um item desenhado na escala pedida
const regua = (altura, fonte, raio, icone, rotulo) => `
<span style="display:inline-flex;flex-direction:column;gap:7px;align-items:flex-start;">
  <span style="display:flex;align-items:center;height:44px;">
  <span style="display:flex;align-items:center;gap:10px;height:${altura}px;padding:0 10px;border-radius:${raio}px;
    background:${N.brand50};color:${N.brand800};font-size:${fonte}px;box-sizing:border-box;">
    <span style="width:${icone}px;height:${icone}px;border-radius:4px;background:${N.brand};opacity:0.75;flex-shrink:0;"></span>
    Perfil
  </span>
  </span>
  ${cap(rotulo)}
</span>`;

// um rail em miniatura, dentro de uma "tela"
const tela = ({ escuro = false, largura = 128, raio = '0', margem = 0, rotulos = true }) => {
  const bg = escuro ? 'oklch(0.175 0.004 107)' : N.bg;
  const railBg = escuro ? RAIL_ESCURO : RAIL_CLARO;
  const elev = escuro ? ELEV_ESCURO : ELEV_CLARO;
  const itens = rotulos
    ? [item('Perfil', true, escuro), item('Workspace', false, escuro), item('Membros', false, escuro)].join('')
    : ['', '', ''].map((_, i) => `
      <div style="display:flex;align-items:center;justify-content:center;height:30px;border-radius:8px;position:relative;
        ${i === 0
          ? escuro ? 'background:oklch(0.275 0.055 262.6);' : `background:${N.brand50};`
          : ''}">
        <span style="width:15px;height:15px;border-radius:4px;background:${i === 0 ? (escuro ? 'oklch(0.7 0.145 262.6)' : N.brand) : (escuro ? 'oklch(0.70 0.006 100)' : N.muted)};opacity:${i === 0 ? 0.9 : 0.35};"></span>
      </div>`).join('');
  return `
<div style="position:relative;width:268px;height:158px;border-radius:10px;overflow:hidden;background:${bg};box-shadow:inset 0 0 0 1px ${escuro ? 'oklch(0.30 0.005 107)' : N.border};">
  <div style="position:absolute;top:${margem}px;bottom:${margem}px;left:${margem}px;width:${largura}px;border-radius:${raio};background:${railBg};${elev}padding:9px 7px;display:flex;flex-direction:column;gap:3px;box-sizing:border-box;">
    ${itens}
  </div>
</div>`;
};

const regra = (n, titulo, texto, demo) => `
<div style="display:flex;flex-direction:column;gap:12px;padding:18px;border-radius:14px;background:${N.surface};box-shadow:inset 0 0 0 1px ${HAIR};">
  <div style="display:flex;align-items:baseline;gap:8px;">
    <span class="mono" style="font-size:11px;color:${N.brand};font-weight:500;">${n}</span>
    <span style="font-size:13.5px;font-weight:600;color:${N.fg};">${titulo}</span>
  </div>
  <div style="display:flex;gap:14px;align-items:flex-start;flex-wrap:wrap;">${demo}</div>
  <span style="font-size:12.5px;line-height:17px;color:${N.muted};">${texto}</span>
</div>`;

const rotulado = (t, inner) => `<span style="display:inline-flex;flex-direction:column;gap:7px;">${inner}${cap(t)}</span>`;

const body = `
<div style="display:flex;flex-direction:column;gap:14px;">
  <p class="sec-title">Os dois eixos, e o comportamento que anda por cima</p>
  <div style="display:flex;flex-direction:column;gap:18px;">
    ${regra('01', 'Posição e largura são eixos SEPARADOS',
      'Posição diz onde o rail mora; largura diz quanto ele mostra. Colapsar um rail flutuante é a combinação mais útil em tela apertada — e ela deixaria de existir se os dois virassem valores de uma lista só.',
      rotulado('encostado + rótulos', tela({})) +
      rotulado('encostado + ícones', tela({ largura: 46, rotulos: false })) +
      rotulado('flutuando + ícones', tela({ largura: 46, rotulos: false, raio: '8px', margem: 8 })))}

    ${regra('02', 'Encostado não tem raio',
      'O rail toca três bordas da tela. Arredondar só a quarta o faz parecer um cartão que não chegou na parede — é a mesma regra que o Sheet já declara, e que o rail contradizia. Flutuando, o raio volta: aí a peça está solta de verdade.',
      rotulado('errado — raio encostado', tela({ raio: '0 14px 14px 0' })) +
      rotulado('certo — sem raio', tela({})) +
      rotulado('certo — flutuando, com raio', tela({ raio: '8px', margem: 8 })))}

    ${regra('03', 'A elevação é a MESMA do cursor do toggle',
      'Não uma parecida. Sombra caindo com o filete por dentro no claro; encaixe com fio de luz no escuro. Uma sombra lateral própria dá aresta dura, que é outra linguagem — e duas maneiras de dizer "isto está por cima" acabam divergindo.',
      rotulado('claro — sombra caindo', tela({})) +
      rotulado('escuro — encaixe com fio de luz', tela({ escuro: true })))}

    ${regra('04', 'O item ativo é tingido, com filete na borda',
      'Fundo do par tingido e a tinta correspondente — nunca fundo sólido, que roubaria o único sólido da tela. O filete de 3px encostado na borda é o que dá a leitura de "você está aqui" mesmo quando o rail recolhe e o rótulo some.',
      rotulado('aberto', tela({})) +
      rotulado('em ícones — o filete some, o fundo fica', tela({ largura: 46, rotulos: false })))}

    ${regra('05', 'O rail está na MESMA régua dos outros controles',
      'Altura 36, raio 9 (altura ÷ 4), texto 13, ícone 16 — o mesmo <em>lg</em> que a aba e o botão usam. O rail chegou portado com 40/8,4/16/18 e crescendo para 17 e 20 acima de 1536px: números que não existem em nenhum outro lugar da casa. Era a única superfície fora da régua, e por isso parecia grande demais ao lado de qualquer coisa na mesma tela.',
      rotulado('errado — o que veio portado', regua(40, 16, 8.4, 18, '40 · 16 · 8,4 · 18')) +
      rotulado('certo — a régua da casa', regua(36, 13, 9, 16, '36 · 13 · 9 · 16')) +
      rotulado('sub-item', regua(28, 12.5, 7, 16, '28 · 12,5 · 7 · 16')))}
  </div>
</div>`;

const html = page('Rail',
  'O menu lateral do app. Dois eixos — posição e largura — mais um comportamento opcional: desafixado, ele some e volta quando o mouse encosta na borda. Sem paleta própria: a superfície é o token --rail e o relevo é o do cursor do view-toggle.',
  body);
await Bun.write('Rail.dc.html', html);
console.log('Rail.dc.html', html.length, 'bytes');
