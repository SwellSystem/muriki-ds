import { N, page } from './tokens.mjs';
import { btn, input, card, btnG1, btnG2, inputG1, inputG2, rr, CARD_R, HAIR } from './recipes.mjs';
const cap = t => `<span class="cap">${t}</span>`;

const GER = [
  { tag:'1 · genérico', cor:N.muted, bg:N.surface2, veredito:'Chapado, raio 8 fixo, borda cinza dura. Não ofende e não assina nada.', mark:'' },
  { tag:'2 · texturizado', cor:N.danger800, bg:N.danger100, veredito:'Gradiente, brilho no topo, sombra. É a linguagem de 2013 — envelheceu e você viu na hora.', mark:'descartado' },
  { tag:'3 · definido', cor:N.brand800, bg:N.brand100, veredito:'Chapado de novo, mas com filete escolhido, raio proporcional à altura e foco com folga. Nada de textura.', mark:'é este' },
];

const coluna = (i, corpo, vd = false) => {
  const g = GER[i];
  return `<div style="display:flex;flex-direction:column;gap:13px;">
    <div style="display:flex;align-items:center;gap:8px;">
      <span style="font-size:11px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;color:${g.cor};background:${g.bg};padding:3px 8px;border-radius:5px;">${g.tag}</span>
      ${g.mark ? `<span style="font-size:11px;font-weight:600;color:${i === 1 ? N.danger : N.brand};">${g.mark}</span>` : ''}
    </div>
    ${corpo}
    ${vd ? `<span style="font-size:12.5px;line-height:17px;color:${N.muted};">${g.veredito}</span>` : ''}
  </div>`;
};

const trio = [
  `${btnG1('primary')}Nova tarefa</span>${btnG1('neutral')}Cancelar</span>${btnG1('accent')}Concluir</span>`,
  `${btnG2('primary')}Nova tarefa</span>${btnG2('neutral')}Cancelar</span>${btnG2('accent')}Concluir</span>`,
  `${btn('primary')}Nova tarefa</span>${btn('neutral')}Cancelar</span>${btn('accent')}Concluir</span>`,
];
const grande = [
  `${btnG1('primary', 44, 2)}Nova tarefa</span>`,
  `${btnG2('primary', 44, 2)}Nova tarefa</span>`,
  `${btn('primary', 44, 'rest', 2)}Nova tarefa</span>`,
];
const campo = [
  `<div style="${inputG1()}color:${N.subtle};">Buscar tarefa</div>`,
  `<div style="${inputG2()}color:${N.subtle};">Buscar tarefa</div>`,
  `<div style="${input('rest')}color:${N.subtle};">Buscar tarefa</div>`,
];

const linha = (titulo, nota, itens, vd = false, gap = 12) => `
<div style="display:flex;flex-direction:column;gap:14px;padding:26px 0;border-bottom:1px solid ${N.border};">
  <div style="display:flex;align-items:baseline;gap:12px;">
    <span style="font-size:16px;font-weight:600;color:${N.fg};letter-spacing:-0.01em;">${titulo}</span>
    <span style="font-size:13px;color:${N.muted};">${nota}</span>
  </div>
  <div style="display:grid;grid-template-columns:repeat(3, minmax(0, 1fr));gap:28px;">
    ${itens.map((it, i) => coluna(i, `<div style="display:flex;align-items:center;gap:${gap}px;flex-wrap:wrap;min-height:34px;">${it}</div>`, vd)).join('')}
  </div>
</div>`;

const detalhe = `
<div style="display:flex;flex-direction:column;gap:14px;padding:26px 0;border-bottom:1px solid ${N.border};">
  <div style="display:flex;align-items:baseline;gap:12px;">
    <span style="font-size:16px;font-weight:600;color:${N.fg};letter-spacing:-0.01em;">Em 2×</span>
    <span style="font-size:13px;color:${N.muted};">é aqui que a textura se entrega</span>
  </div>
  <div style="display:grid;grid-template-columns:repeat(3, minmax(0, 1fr));gap:28px;">
    ${grande.map((it, i) => coluna(i, `<div style="display:flex;align-items:center;min-height:88px;">${it}</div>`)).join('')}
  </div>
</div>`;

const regra = `
<div style="display:flex;flex-direction:column;gap:16px;padding-top:26px;">
  <span style="font-size:16px;font-weight:600;color:${N.fg};letter-spacing:-0.01em;">A regra que fecha o raio</span>
  <div style="display:grid;grid-template-columns:1.1fr 1fr;gap:28px;align-items:start;">
    <div style="display:flex;flex-direction:column;gap:12px;">
      <div style="display:flex;align-items:flex-end;gap:14px;">
        ${[24,28,32,36,44].map(h => `<span style="display:inline-flex;flex-direction:column;gap:7px;align-items:center;">${btn('primary', h)}Salvar</span>${cap(`${h} → ${rr(h)}px`)}</span>`).join('')}
      </div>
      <span style="font-size:13px;line-height:19px;color:${N.body};max-width:520px;">Raio é <strong style="font-weight:600;">altura ÷ 5</strong>, não um número fixo. No 32px isso dá <span class="mono" style="font-size:12.5px;">6px</span> — arredondado, mas não muito, que foi exatamente o que você pediu. E como é razão e não constante, os cinco tamanhos parecem a mesma forma.</span>
    </div>
    <div style="${card(18)}display:flex;flex-direction:column;gap:11px;">
      <span style="font-size:13.5px;font-weight:600;color:${N.fg};">Revisar contrato OpenAPI</span>
      <div style="${input('rest')}color:${N.subtle};">Adicionar comentário</div>
      <div style="display:flex;gap:7px;">${btn('primary', 28)}Salvar</span>${btn('ghost', 28)}Cancelar</span></div>
      <span class="cap" style="padding-top:2px;">controle ${rr(28)}-${rr(32)}px · card ${CARD_R}px — o recipiente é mais macio que o controle</span>
    </div>
  </div>
</div>`;

const body = `
<div style="display:flex;flex-direction:column;margin-top:-10px;">
  ${linha('Botão', 'tamanho real', trio, true)}
  ${detalhe}
  ${linha('Campo', 'sulco também é textura', campo)}
  ${regra}
</div>`;

const html = page('Direção do botão',
  'Três gerações lado a lado, sendo que a do meio é minha errada. Gradiente, brilho no topo e sombra em botão não são profundidade — são textura, e textura é o que faz uma interface parecer velha. O caminho é chapado, com o filete e a proporção certos.',
  body);
await Bun.write('Antes.dc.html', html);
console.log('Antes.dc.html', html.length, 'bytes');
