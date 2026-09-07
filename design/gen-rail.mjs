// Prancha do RAIL. As decisões de hoje só existiam no código e no readme —
// e decisão que não está desenhada some no próximo redesenho.
//
//   cd design && bun gen-rail.mjs
import { N, page } from './tokens.mjs';
import { HAIR } from './recipes.mjs';

const cap = t => `<span class="cap">${t}</span>`;

// Encostado, o rail RECUA: só o filete na borda livre. Quem recua não
// projeta. Escrito aqui igual ao do componente, para a prancha não divergir.
const ELEV_CLARO = `box-shadow:inset -1px 0 0 ${N.border};`;
const ELEV_ESCURO = 'box-shadow:inset -1px 0 0 oklch(0.28 0.005 107);';
// Solto, deixa de recuar: superfície de cartão e sombra de volta.
const ELEV_SOLTO = 'box-shadow:0 18px 45px -32px rgba(0,0,0,0.9), inset 0 0 0 1px rgba(0,0,0,0.08);';

const RAIL_CLARO = 'oklch(0.984 0.005 90)';    // marfim, entre a página e o cartão
const RAIL_ESCURO = 'oklch(0.195 0.004 107)';  // abaixo da página

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


// dois planos lado a lado, para comparar valor
const planos = (railBg, contBg, escuro, rotulo) => `
<span style="display:inline-flex;flex-direction:column;gap:7px;">
  <span style="display:flex;width:250px;height:78px;border-radius:10px;overflow:hidden;
    box-shadow:inset 0 0 0 1px ${escuro ? 'oklch(0.30 0.005 107)' : N.border};">
    <span style="width:96px;background:${railBg};"></span>
    <span style="flex:1;background:${contBg};"></span>
  </span>
  ${cap(rotulo)}
</span>`;

// um rail em miniatura, dentro de uma "tela"
const tela = ({ escuro = false, largura = 128, raio = '0', margem = 0, rotulos = true, solto = false }) => {
  const bg = escuro ? 'oklch(0.175 0.004 107)' : 'oklch(0.968 0.009 93)';
  const railBg = escuro ? RAIL_ESCURO : RAIL_CLARO;
  const elev = solto ? ELEV_SOLTO : (escuro ? ELEV_ESCURO : ELEV_CLARO);
  const sup = solto ? (escuro ? 'oklch(0.21 0.004 107)' : 'oklch(0.993 0.002 85)') : railBg;
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
  <div style="position:absolute;top:${margem}px;bottom:${margem}px;left:${margem}px;width:${largura}px;border-radius:${raio};background:${sup};${elev}padding:9px 7px;display:flex;flex-direction:column;gap:3px;box-sizing:border-box;">
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

    ${regra('03', 'Encostado não projeta; solto, vira cartão',
      'O rail recua, então uma sombra para fora diria o contrário do que a cor diz — encostado ele tem só o filete na borda livre, e o degrau de valor faz o resto. Quando descola da parede, deixa de recuar: a superfície passa a ser a do cartão e a sombra volta. É a mesma família de raciocínio da regra 02.',
      rotulado('encostado — só o filete', tela({})) +
      rotulado('errado — sombra em quem recua', tela({ raio: '0', margem: 0, solto: true })) +
      rotulado('flutuando — cartão e sombra', tela({ raio: '8px', margem: 8, solto: true })))}

    ${regra('04', 'O item ativo é tingido, com filete na borda',
      'Fundo do par tingido e a tinta correspondente — nunca fundo sólido, que roubaria o único sólido da tela. O filete de 3px encostado na borda é o que dá a leitura de "você está aqui" mesmo quando o rail recolhe e o rótulo some.',
      rotulado('aberto', tela({})) +
      rotulado('em ícones — o filete some, o fundo fica', tela({ largura: 46, rotulos: false })))}

    ${regra('05', 'O rail está na MESMA régua dos outros controles',
      'Altura 36, raio 9 (altura ÷ 4), texto 13, ícone 16 — o mesmo <em>lg</em> que a aba e o botão usam. O rail chegou portado com 40/8,4/16/18 e crescendo para 17 e 20 acima de 1536px: números que não existem em nenhum outro lugar da casa. Era a única superfície fora da régua, e por isso parecia grande demais ao lado de qualquer coisa na mesma tela.',
      rotulado('errado — o que veio portado', regua(40, 16, 8.4, 18, '40 · 16 · 8,4 · 18')) +
      rotulado('certo — a régua da casa', regua(36, 13, 9, 16, '36 · 13 · 9 · 16')) +
      rotulado('sub-item', regua(28, 12.5, 7, 16, '28 · 12,5 · 7 · 16')))}

    ${regra('06', 'O conteúdo nunca é o extremo; o rail fica de fora',
      'A página mora no MEIO da rampa, para o cartão ter espaço acima e o sunken abaixo. Foi ao quebrar isso que o rail passou a semana sem cor própria: com a página em 0,980 e o cartão em 0,993, o topo estava ocupado e sobrava para ele só o lugar abaixo. Com a página em 0,968 são cinco valores e cinco papéis — e o degrau do cartão até ela quase dobrou, de 0,013 para 0,025. No claro o rail cabe ENTRE a página e o cartão; em 0,998 ele ficava 0,4 acima do cartão, que é a mesma superfície de novo, e a quebra do branco para o papel era um corte.',
      rotulado('errado — rail quase branco', planos('oklch(0.998 0.002 85)', 'oklch(0.968 0.009 93)', false, 'rail 0,998 — acima do cartão')) +
      rotulado('certo — claro, rail entre os dois', planos(RAIL_CLARO, 'oklch(0.968 0.009 93)', false, 'rail 0,984 · página 0,968')) +
      rotulado('certo — escuro, rail abaixo', planos(RAIL_ESCURO, 'oklch(0.175 0.004 107)', true, 'rail 0,195 · página 0,175')))}
  </div>
</div>`;

const html = page('Rail',
  'O menu lateral do app. Dois eixos — posição e largura — mais um comportamento opcional: desafixado, ele some e volta quando o mouse encosta na borda. A superfície é o token --rail: no claro fica entre a página e o cartão, no escuro abaixo da página. Encostado ele não projeta, só o filete da borda livre; solto, vira cartão e a sombra volta.',
  body);
await Bun.write('Rail.dc.html', html);
console.log('Rail.dc.html', html.length, 'bytes');
