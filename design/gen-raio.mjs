import { N, page } from './tokens.mjs';
import { btn, input, card, rr, CARD_R, HAIR } from './recipes.mjs';
const cap = t => `<span class="cap">${t}</span>`;

// espécime com raio forçado, para comparar
const bp = (r, h = 32) => `height:${h}px;padding:0 ${h < 30 ? 10 : h > 36 ? 18 : 12}px;border-radius:${r}px;font-size:${h < 30 ? 12.5 : h > 36 ? 15 : 13}px;font-weight:500;letter-spacing:-0.005em;display:inline-flex;align-items:center;justify-content:center;white-space:nowrap;box-sizing:border-box;background:${N.brand};color:#fff;`;
const ip = (r, h = 32) => `height:${h}px;padding:0 11px;border-radius:${r}px;font-size:13px;display:flex;align-items:center;box-sizing:border-box;background:${N.surface};color:${N.subtle};box-shadow:inset 0 0 0 1px ${HAIR};`;
const cp = (r) => `border-radius:${r}px;background:${N.surface};padding:13px;box-shadow:inset 0 0 0 1px ${HAIR};`;

const step = (r, cardR, quem, veredito, destaque) => `
<div style="display:flex;flex-direction:column;gap:11px;padding:18px 16px;border-radius:${CARD_R}px;${destaque ? `background:${N.brand50};box-shadow:inset 0 0 0 1px ${N.brand200};` : ''}">
  <div style="display:flex;align-items:baseline;gap:8px;">
    <span class="mono" style="font-size:15px;font-weight:500;color:${destaque ? N.brand : N.fg};">${r === 999 ? 'pill' : r + 'px'}</span>
    ${destaque ? `<span style="font-size:10.5px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;color:${N.brand};">fechado</span>` : ''}
  </div>
  <div style="${cp(cardR)}display:flex;flex-direction:column;gap:9px;">
    <div style="${ip(r)}">Buscar tarefa</div>
    <span style="${bp(r)}">Nova tarefa</span>
  </div>
  <div style="display:flex;flex-direction:column;gap:3px;">
    <span style="font-size:11.5px;line-height:15px;color:${N.muted};">${quem}</span>
    <span style="font-size:12px;line-height:16px;color:${N.body};">${veredito}</span>
  </div>
</div>`;

const escada = `
<div style="display:grid;grid-template-columns:repeat(5, minmax(0, 1fr));gap:10px;">
  ${step(4, 10, 'Stripe, Notion', 'Sério a ponto de ficar seco. Frio demais para um app de tarefa.', false)}
  ${step(6, CARD_R, 'Linear, Vercel', 'Arredondado, mas não muito. É onde “ferramenta de gente que trabalha” mora hoje.', true)}
  ${step(8, 12, 'ClickUp · o que eu tinha feito', 'Confortável e genérico — a média de quem não escolheu.', false)}
  ${step(12, 16, 'apps de consumo, 2021', 'Simpático. Some o ar de precisão que uma lista densa precisa.', false)}
  ${step(999, 20, 'Asana, só no CTA', 'Vira botão de marketing. Repetido em lista, cansa rápido.', false)}
</div>`;

const linha = (label, fn, nota) => `
<div style="display:flex;flex-direction:column;gap:10px;">
  <div style="display:flex;align-items:baseline;gap:10px;">
    <span style="font-size:13.5px;font-weight:600;color:${N.fg};">${label}</span>
    <span style="font-size:12px;color:${N.muted};">${nota}</span>
  </div>
  <div style="display:flex;align-items:flex-end;gap:14px;">
    ${[24, 28, 32, 36, 44].map(h => `<span style="display:inline-flex;flex-direction:column;gap:7px;align-items:center;"><span style="${bp(fn(h), h)}">Salvar</span>${cap(`${h} → ${fn(h)}px`)}</span>`).join('')}
  </div>
</div>`;

const proporcional = `
<div style="display:flex;flex-direction:column;gap:26px;">
  ${linha('Constante', () => 8, '8px em toda altura — o que quase todo design system faz')}
  ${linha('Proporcional', rr, 'r = altura ÷ 5 — a curva acompanha o corpo')}
  <div style="display:flex;gap:16px;padding:16px 18px;border-radius:${CARD_R}px;background:${N.acc100};box-shadow:inset 0 0 0 1px ${N.acc};">
    <div style="display:flex;flex-direction:column;gap:4px;">
      <span style="font-size:13.5px;font-weight:600;color:${N.fg};">Compare o 24 e o 44 nas duas linhas.</span>
      <span style="font-size:12.5px;line-height:18px;color:${N.body};max-width:740px;">Com raio constante, o botão de 24px parece inchado — a curva come metade da altura — e o de 44px parece quadrado. Com proporcional os cinco parecem <em>a mesma forma</em> em tamanhos diferentes, que é o que o olho espera de uma família. E no 32px, que é o padrão, dá <span class="mono" style="font-size:12px;">6px</span>: arredondado, mas não muito.</span>
    </div>
  </div>
</div>`;

const par = (ctlR, cardR, label, nota, bom) => `
<div style="display:flex;flex-direction:column;gap:10px;">
  <div style="${cp(cardR)}display:flex;flex-direction:column;gap:10px;">
    <span style="font-size:13px;font-weight:600;color:${N.fg};">Revisar contrato</span>
    <div style="${ip(ctlR)}">Adicionar comentário</div>
    <span style="${bp(ctlR, 28)}">Salvar</span>
  </div>
  <div style="display:flex;flex-direction:column;gap:2px;">
    <span style="font-size:12.5px;font-weight:600;color:${bom ? N.success800 : N.muted};">${label}</span>
    <span style="font-size:12px;line-height:16px;color:${N.muted};">${nota}</span>
  </div>
</div>`;
const assinatura = `
<div style="display:grid;grid-template-columns:repeat(3, minmax(0, 1fr));gap:22px;">
  ${par(12, 12, 'Controle e card no mesmo raio', 'Nada se destaca de nada — resultado de aplicar uma variável só em tudo.', false)}
  ${par(6, CARD_R, `Controle ${rr(32)}px, card ${CARD_R}px`, 'O contraste entre os dois é o que o olho lê como intenção. Confortável por fora, preciso por dentro.', true)}
  ${par(14, 6, 'O contrário', 'Controle mais macio que o recipiente empurra tudo para frente e some com a hierarquia.', false)}
</div>`;

const decisao = `
<div style="${card(22)}display:flex;gap:30px;align-items:center;">
  <div style="display:flex;flex-direction:column;gap:5px;flex-grow:1;">
    <span style="font-size:15px;font-weight:600;color:${N.fg};letter-spacing:-0.01em;">Fechado</span>
    <span style="font-size:13px;line-height:19px;color:${N.body};max-width:560px;">Controle com <strong style="font-weight:600;">raio = altura ÷ 5</strong> (6px no padrão de 32), recipiente fixo em <strong style="font-weight:600;">${CARD_R}px</strong>, pill reservado para badge e avatar. Já está aplicado nas sete pranchas.</span>
  </div>
  <div style="display:flex;gap:10px;flex-shrink:0;">
    ${btn('primary', 32)}Nova tarefa</span>${btn('neutral', 32)}Cancelar</span>${btn('accent', 32)}Concluir</span>
  </div>
</div>`;

const body = `
  ${decisao}
  <div style="display:flex;flex-direction:column;gap:14px;"><p class="sec-title">Onde a categoria está</p>${escada}</div>
  <div style="display:flex;flex-direction:column;gap:16px;"><p class="sec-title">Constante x proporcional</p>${proporcional}</div>
  <div style="display:flex;flex-direction:column;gap:14px;"><p class="sec-title">Onde mora a assinatura</p>${assinatura}</div>`;

const html = page('Raio',
  'Você pediu arredondado, mas não muito — e é exatamente onde a categoria séria está. O que faltava não era o número: era virar razão em vez de constante, e abrir distância entre o controle e o recipiente.',
  body);
await Bun.write('Raio.dc.html', html);
console.log('Raio.dc.html', html.length, 'bytes');
