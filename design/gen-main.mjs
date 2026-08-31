import { N, R, SHADOW, page } from './tokens.mjs';
const logo = await Bun.file('logo.svg').text();
const cap = t => `<span class="cap">${t}</span>`;

const sw = (c, name, star, dark) => `<div style="display:flex;flex-direction:column;gap:5px;"><div style="height:48px;border-radius:8px;background:${c};${star ? `box-shadow:0 0 0 2px ${star};` : ''}${dark ? `border:1px dashed ${N.borderStrong};` : ''}"></div><span class="mono" style="font-size:10px;color:${star ? N.fg : N.muted};${star ? 'font-weight:500;' : ''}">${name}</span></div>`;
const ramp = (title, note, items) => `
<div style="display:flex;flex-direction:column;gap:7px;">
  <div style="display:flex;align-items:baseline;gap:10px;">
    <span style="font-size:14px;font-weight:600;color:${N.fg};">${title}</span>
    <span style="font-size:12px;color:${N.muted};">${note}</span>
  </div>
  <div style="display:grid;grid-template-columns:repeat(${items.length}, minmax(0, 1fr));gap:6px;">${items.join('')}</div>
</div>`;

const rampas = `
<div style="display:flex;flex-direction:column;gap:16px;">
  ${ramp('Superfície — quente', 'hue 82-100 · o papel. É o que dá o repouso que você viu no platform.', [
    sw('oklch(100% 0 0)', 'popover'), sw('oklch(99.3% 0.002 85)', 'card'), sw(N.bg, 'bg ★', N.acc),
    sw('oklch(97% 0.01 93.5)', 'muted'), sw('oklch(94.5% 0.011 96)', '2'), sw(N.border, 'border'),
    sw('oklch(88% 0.012 98)', 'strong'), sw('oklch(74% 0.012 98)', '400'),
  ])}
  ${ramp('Tinta — fria', 'hue ~250 · nunca preto. É a outra metade do efeito.', [
    sw('oklch(18% 0.02 252)', '950'), sw('oklch(26% 0.022 250)', 'título'), sw(N.body, 'corpo ★', N.acc),
    sw(N.muted, 'muted'), sw(N.subtle, 'subtle'), sw('oklch(70% 0.02 255)', '400'),
    sw('oklch(84% 0.014 255)', '300'), sw('oklch(93% 0.008 255)', '200'),
  ])}
  ${ramp('Azul — a marca', 'o 600 é literalmente o azul do símbolo', [
    sw('oklch(97% 0.015 262.6)', '50'), sw(N.brand100, '100'), sw(N.brand200, '200'), sw('oklch(79% 0.10 262.6)', '300'),
    sw('oklch(66% 0.15 262.6)', '400'), sw('oklch(56% 0.175 262.6)', '500'), sw(N.brand, '600 ★', N.acc),
    sw(N.brandH, '700'), sw(N.brand800, '800'), sw('oklch(66% 0.155 262.6)', 'dark', null, true),
  ])}
  ${ramp('Amarelo — o acento', 'só preenchimento, nunca texto', [
    sw('oklch(98.5% 0.02 94)', '50'), sw(N.acc100, '100'), sw('oklch(94% 0.10 94)', '200'), sw('oklch(91% 0.15 94)', '300'),
    sw(N.acc, '400 ★', N.brand), sw(N.accH, '500'), sw(N.accA, '600'), sw(N.acc700, '700'),
    sw('oklch(46% 0.10 80)', '800'), sw('oklch(83% 0.165 93)', 'dark', null, true),
  ])}
</div>`;

// papel e tinta — a resposta
const chip = (hex, c, t) => `<div style="display:flex;align-items:center;gap:9px;"><span style="width:34px;height:34px;border-radius:8px;background:${c};border:1px solid ${N.border};flex-shrink:0;"></span><div style="display:flex;flex-direction:column;gap:1px;"><span class="mono" style="font-size:11.5px;color:${N.fg};">${hex}</span><span style="font-size:11.5px;color:${N.muted};">${t}</span></div></div>`;
const papelTinta = `
<div style="display:grid;grid-template-columns:1.15fr 1fr;gap:22px;">
  <div style="background:${N.surface};border:1px solid ${N.border};border-radius:${R.card};padding:22px 24px;display:flex;flex-direction:column;gap:16px;">
    <div style="font-size:14px;font-weight:600;color:${N.fg};">O que você estava vendo</div>
    <div style="display:flex;flex-direction:column;gap:12px;">
      ${chip('#FAF8F5', N.bg, 'o fundo não é branco — é papel, com um traço de quente')}
      ${chip('#2B343D', N.body, 'o texto não é preto — é azul-ardósia a 32% de luz')}
      ${chip('#ECEBE4', N.border, 'a linha é quente e baixíssima, quase só uma sombra')}
    </div>
    <div style="font-size:13px;line-height:19px;color:${N.body};">Papel quente com tinta fria. As duas temperaturas puxam para lados opostos e nenhuma domina — é isso que tira a dureza do preto-no-branco. E o texto a 32% dá <span class="mono" style="font-size:12px;">12:1</span> de contraste em vez dos <span class="mono" style="font-size:12px;">15:1</span> de um quase-preto: passa folgado em acessibilidade e cansa menos.</div>
  </div>
  <div style="display:flex;flex-direction:column;gap:12px;">
    <div style="display:flex;flex-direction:column;gap:7px;flex-grow:1;">
      <div style="background:#FFFFFF;border:1px solid ${N.border};border-radius:${R.card};padding:16px 18px;flex-grow:1;display:flex;flex-direction:column;justify-content:center;gap:4px;">
        <span style="font-size:15px;font-weight:600;color:#111111;">Revisar contrato OpenAPI</span>
        <span style="font-size:13px;line-height:18px;color:#555555;">Branco puro com quase-preto. Funciona, mas bate de frente com o olho.</span>
      </div>
      ${cap('branco #FFFFFF + tinta #111111')}
    </div>
    <div style="display:flex;flex-direction:column;gap:7px;flex-grow:1;">
      <div style="background:${N.bg};border:1px solid ${N.border};border-radius:${R.card};padding:16px 18px;flex-grow:1;display:flex;flex-direction:column;justify-content:center;gap:4px;">
        <span style="font-size:15px;font-weight:600;color:${N.fg};">Revisar contrato OpenAPI</span>
        <span style="font-size:13px;line-height:18px;color:${N.muted};">O mesmo texto, no papel quente com a tinta fria. Nada gritou, e ainda assim lê melhor.</span>
      </div>
      ${cap('papel #FAF8F5 + tinta #2B343D')}
    </div>
  </div>
</div>`;

// papéis semânticos
const rowTok = (c, name, val, fg) => `<div style="display:flex;align-items:center;gap:10px;"><span style="width:24px;height:24px;border-radius:6px;background:${c};border:1px solid ${fg ? 'oklch(40% 0.006 250)' : N.border};flex-shrink:0;"></span><span style="font-size:12.5px;flex-grow:1;">${name}</span><span class="mono" style="font-size:10.5px;color:${fg || N.muted};">${val}</span></div>`;
const semantica = `
<div style="display:grid;grid-template-columns:repeat(2, minmax(0, 1fr));gap:20px;">
  <div style="background:${N.surface};border:1px solid ${N.border};border-radius:${R.card};padding:20px;display:flex;flex-direction:column;gap:12px;">
    <div style="font-size:13px;font-weight:600;color:${N.fg};">Light</div>
    <div style="display:flex;flex-direction:column;gap:7px;">
      ${rowTok(N.bg, 'background', '#FAF8F5')}
      ${rowTok('oklch(99.3% 0.002 85)', 'card', 'quase branco')}
      ${rowTok(N.surface2, 'muted · preenchido', '#F7F5EE')}
      ${rowTok('oklch(95.5% 0.012 95)', 'sunken · afundado', 'trilho, busca')}
      ${rowTok(N.border, 'border', '#ECEBE4')}
      ${rowTok(N.fg, 'foreground · título', '26% .022 250')}
      ${rowTok(N.body, 'foreground · corpo', '#2B343D')}
      ${rowTok(N.muted, 'muted-foreground', '#4B5666')}
      ${rowTok(N.brand, 'primary', 'azul 600')}
      ${rowTok(N.acc, 'accent', 'amarelo 400')}
      ${rowTok(N.success, 'success', '58% .13 150')}
      ${rowTok(N.warning, 'warning', '66% .17 55')}
      ${rowTok(N.danger, 'destructive', '55% .20 27')}
    </div>
  </div>
  <div style="background:oklch(19% 0.008 250);border:1px solid oklch(30% 0.008 250);border-radius:${R.card};padding:20px;display:flex;flex-direction:column;gap:12px;color:oklch(95% 0.005 250);">
    <div style="font-size:13px;font-weight:600;">Dark — o papel esfria junto</div>
    <div style="display:flex;flex-direction:column;gap:7px;">
      ${rowTok('oklch(19% 0.008 250)', 'background', '19% .008 250', 'oklch(72% 0.01 250)')}
      ${rowTok('oklch(22.5% 0.009 250)', 'card', '22.5% .009 250', 'oklch(72% 0.01 250)')}
      ${rowTok('oklch(26.5% 0.01 250)', 'muted · preenchido', '26.5% .01 250', 'oklch(72% 0.01 250)')}
      ${rowTok('oklch(15.5% 0.007 250)', 'sunken · afundado', '15.5% .007 250', 'oklch(72% 0.01 250)')}
      ${rowTok('oklch(32% 0.01 250)', 'border', '32% .01 250', 'oklch(72% 0.01 250)')}
      ${rowTok('oklch(96% 0.004 250)', 'foreground · título', '96% .004 250', 'oklch(72% 0.01 250)')}
      ${rowTok('oklch(90% 0.006 250)', 'foreground · corpo', '90% .006 250', 'oklch(72% 0.01 250)')}
      ${rowTok('oklch(70% 0.012 250)', 'muted-foreground', '70% .012 250', 'oklch(72% 0.01 250)')}
      ${rowTok('oklch(66% 0.155 262.6)', 'primary', 'clareado', 'oklch(72% 0.01 250)')}
      ${rowTok('oklch(83% 0.165 93)', 'accent', 'abafado', 'oklch(72% 0.01 250)')}
      ${rowTok('oklch(70% 0.13 150)', 'success', '70% .13 150', 'oklch(72% 0.01 250)')}
      ${rowTok('oklch(75% 0.15 60)', 'warning', '75% .15 60', 'oklch(72% 0.01 250)')}
      ${rowTok('oklch(66% 0.18 27)', 'destructive', '66% .18 27', 'oklch(72% 0.01 250)')}
    </div>
  </div>
</div>`;

const amarelo = `
<div style="background:${N.surface};border:1px solid ${N.border};border-left:3px solid ${N.acc};border-radius:${R.card};padding:20px 22px;display:flex;gap:28px;align-items:center;">
  <div style="flex-grow:1;display:flex;flex-direction:column;gap:6px;max-width:480px;">
    <div style="font-size:14px;font-weight:600;color:${N.fg};">O amarelo é fundo, nunca é texto.</div>
    <div style="font-size:13px;line-height:1.55;color:${N.muted};">A 87,8% de luz ele não alcança contraste contra branco em combinação nenhuma. Só funciona preenchido, com a tinta escura por cima — e aí fica ótimo. Por isso o warning é laranja (hue 55): senão a cor da marca e a cor de alerta viram a mesma coisa.</div>
  </div>
  <div style="display:flex;gap:12px;flex-shrink:0;">
    <div style="display:flex;flex-direction:column;gap:7px;align-items:center;">
      <div style="width:126px;height:36px;border-radius:${R.ctl};background:${N.acc};color:oklch(26% 0.022 250);display:flex;align-items:center;justify-content:center;font-size:13.5px;font-weight:600;">Concluir</div>
      <span style="font-size:11px;color:${N.success800};font-weight:500;">tinta sobre amarelo</span>
    </div>
    <div style="display:flex;flex-direction:column;gap:7px;align-items:center;">
      <div style="width:126px;height:36px;border-radius:${R.ctl};background:${N.acc};color:#ffffff;display:flex;align-items:center;justify-content:center;font-size:13.5px;font-weight:600;">Concluir</div>
      <span style="font-size:11px;color:${N.danger};font-weight:500;">branco sobre amarelo</span>
    </div>
  </div>
</div>`;

const tipoRow = (m, size, lh, w, ls, txt, color, extra = '') => `
<div style="display:flex;align-items:baseline;gap:20px;">
  <span class="mono" style="font-size:10.5px;color:${N.muted};width:118px;flex-shrink:0;">${m}</span>
  <span style="font-size:${size}px;line-height:${lh}px;font-weight:${w};letter-spacing:${ls};color:${color};${extra}">${txt}</span>
</div>`;
const tipografia = `
<div class="card" style="display:flex;flex-direction:column;gap:16px;">
  ${tipoRow('display · 32/36 · 600', 32, 36, 600, '-0.022em', 'Quinta-feira, 14 tarefas', N.fg)}
  ${tipoRow('h1 · 24/30 · 600', 24, 30, 600, '-0.016em', 'Projeto Muriki API', N.fg)}
  ${tipoRow('h2 · 20/26 · 600', 20, 26, 600, '-0.011em', 'Em andamento', N.fg)}
  ${tipoRow('h3 · 16/22 · 600', 16, 22, 600, '-0.006em', 'Revisar contrato OpenAPI', N.fg)}
  ${tipoRow('body · 14/20 · 400', 14, 20, 400, '0', 'O padrão da interface. Catorze pixels porque a tela é densa e cheia de lista — dezesseis empurra linha demais para fora da dobra.', N.body, 'max-width:560px;text-wrap:pretty;')}
  ${tipoRow('label · 14/14 · 500', 14, 14, 500, '0', 'Data de entrega', N.fg)}
  ${tipoRow('small · 12.5/17 · 400', 12.5, 17, 400, '0', 'Atualizado há 3 minutos por Guilherme', N.muted)}
  ${tipoRow('caption · 11/14 · 600', 11, 14, 600, '0.07em', 'Estimativa', N.muted, 'text-transform:uppercase;')}
  ${tipoRow('mono · 13/18 · 400', 13, 18, 400, '0', 'MRK-1284 · 4h 12m · R$ 1.240,00', N.body, 'font-family:"Geist Mono",ui-monospace,monospace;')}
</div>`;

const metricas = `
<div style="display:grid;grid-template-columns:0.85fr 0.85fr 1.3fr;gap:20px;">
  <div class="card" style="padding:20px;display:flex;flex-direction:column;gap:14px;">
    <div style="font-size:13px;font-weight:600;color:${N.fg};">Raio</div>
    <div style="display:flex;gap:10px;align-items:flex-end;">
      <div style="display:flex;flex-direction:column;gap:6px;align-items:center;"><div style="width:44px;height:44px;background:${N.brand200};border-radius:6px;"></div><span class="mono" style="font-size:10px;color:${N.fg};font-weight:500;">6 ★</span></div>
      <div style="display:flex;flex-direction:column;gap:6px;align-items:center;"><div style="width:44px;height:44px;background:${N.brand100};border-radius:8px;"></div><span class="mono" style="font-size:10px;color:${N.muted};">8</span></div>
      <div style="display:flex;flex-direction:column;gap:6px;align-items:center;"><div style="width:44px;height:44px;background:${N.brand200};border-radius:14px;"></div><span class="mono" style="font-size:10px;color:${N.fg};font-weight:500;">14 ★</span></div>
      <div style="display:flex;flex-direction:column;gap:6px;align-items:center;"><div style="width:44px;height:44px;background:${N.brand100};border-radius:16px;"></div><span class="mono" style="font-size:10px;color:${N.muted};">16</span></div>
    </div>
    <div style="font-size:12.5px;line-height:1.5;color:${N.muted};">Raio de controle é <strong style="font-weight:600;">altura ÷ 5</strong>, não constante: 6px no padrão de 32. Recipiente fixo em <span class="mono" style="font-size:11.5px;">14px</span> — mais macio que o controle de propósito.</div>
  </div>

  <div class="card" style="padding:20px;display:flex;flex-direction:column;gap:14px;">
    <div style="font-size:13px;font-weight:600;color:${N.fg};">Espaçamento — base 4</div>
    <div style="display:flex;flex-direction:column;gap:6px;">
      ${[[4, '1'], [8, '2'], [12, '3'], [16, '4'], [24, '6'], [32, '8'], [48, '12'], [64, '16']].map(([px, n], i) =>
        `<div style="display:flex;align-items:center;gap:10px;"><span style="height:9px;width:${px}px;background:${i < 3 ? 'oklch(66% 0.15 262.6)' : i < 6 ? 'oklch(56% 0.175 262.6)' : N.brand};border-radius:2px;"></span><span class="mono" style="font-size:10.5px;color:${N.muted};">${n} · ${px}px</span></div>`).join('')}
    </div>
  </div>

  <div class="card" style="padding:20px;display:flex;flex-direction:column;gap:14px;">
    <div style="display:flex;align-items:baseline;gap:9px;">
      <span style="font-size:13px;font-weight:600;color:${N.fg};">Altura de controle</span>
      <span style="font-size:12px;color:${N.muted};">quando usar cada uma → prancha “Contorno e altura”</span>
    </div>
    <div style="display:flex;flex-direction:column;gap:9px;">
      ${[[24, 'xs', 'toolbar de canvas'], [28, 'sm', 'linha de tabela, filtro'], [32, 'md', 'padrão do sistema'], [36, 'lg', 'ação principal da página'], [44, 'touch', 'piso no mobile']].map(([h, n, t]) =>
        `<div style="display:flex;align-items:center;gap:12px;"><div style="height:${h}px;padding:0 ${h < 30 ? 9 : 13}px;border-radius:${Math.round(h / 5)}px;border:1px solid ${N.borderInput};background:${N.surface};display:flex;align-items:center;font-size:${h < 30 ? 12 : 13.5}px;color:${N.body};">${n}</div><span class="mono" style="font-size:10.5px;color:${N.muted};">${h}px · ${t}</span></div>`).join('')}
    </div>
  </div>
</div>

<div class="card" style="display:flex;gap:24px;align-items:center;">
  <div style="font-size:13px;font-weight:600;width:88px;flex-shrink:0;color:${N.fg};">Elevação</div>
  <div style="display:flex;gap:20px;flex-grow:1;">
    <div style="display:flex;flex-direction:column;gap:8px;align-items:center;flex-grow:1;"><div style="width:100%;height:48px;background:${N.surface};border-radius:10px;border:1px solid ${N.border};"></div>${cap('flat · linha só')}</div>
    <div style="display:flex;flex-direction:column;gap:8px;align-items:center;flex-grow:1;"><div style="width:100%;height:48px;background:${N.surface};border-radius:10px;box-shadow:${SHADOW.sm};"></div>${cap('sm · card')}</div>
    <div style="display:flex;flex-direction:column;gap:8px;align-items:center;flex-grow:1;"><div style="width:100%;height:48px;background:${N.surface};border-radius:10px;box-shadow:${SHADOW.md};"></div>${cap('md · dropdown')}</div>
    <div style="display:flex;flex-direction:column;gap:8px;align-items:center;flex-grow:1;"><div style="width:100%;height:48px;background:${N.surface};border-radius:10px;box-shadow:${SHADOW.lg};"></div>${cap('lg · dialog')}</div>
  </div>
</div>`;

const body = `
  <div style="display:flex;flex-direction:column;gap:14px;"><p class="sec-title">O papel e a tinta</p>${papelTinta}</div>
  <div style="display:flex;flex-direction:column;gap:16px;"><p class="sec-title">Rampas</p>${rampas}</div>
  <div style="display:flex;flex-direction:column;gap:14px;"><p class="sec-title">Papéis semânticos</p>${semantica}</div>
  <div style="display:flex;flex-direction:column;gap:14px;"><p class="sec-title">A regra do amarelo</p>${amarelo}</div>
  <div style="display:flex;flex-direction:column;gap:14px;"><p class="sec-title">Tipografia — Geist &amp; Geist Mono</p>${tipografia}</div>
  <div style="display:flex;flex-direction:column;gap:14px;"><p class="sec-title">Raio, espaçamento, altura e elevação</p>${metricas}</div>`;

let html = page('Muriki DS — Fundações',
  'Duas famílias de neutro em vez de uma: a superfície é quente (o papel que você viu no platform) e a tinta é fria. As cores de marca saem das três do símbolo. As alturas e o raio são os que o platform já pratica.',
  body);
html = html.replace('<div style="display:flex;flex-direction:column;gap:5px;">',
  `<div style="display:flex;align-items:flex-start;gap:18px;"><div style="width:52px;height:52px;flex-shrink:0;">${logo}</div><div style="display:flex;flex-direction:column;gap:5px;">`);
html = html.replace('</div>\n\n  <div style="display:flex;flex-direction:column;gap:14px;"><p class="sec-title">O papel e a tinta</p>',
  '</div></div>\n\n  <div style="display:flex;flex-direction:column;gap:14px;"><p class="sec-title">O papel e a tinta</p>');
await Bun.write('Main.dc.html', html);
console.log('Main.dc.html', html.length, 'bytes');
