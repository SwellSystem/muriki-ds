// Prancha do Kanban: o quadro aprovado no DS (prototipos/kanban), em claro e escuro.
// O mesmo desenho sai das duas paletas — `quadro(T)` recebe o tema e devolve o HTML.
import { N, page } from './tokens.mjs';
import { D, darkHalf } from './dark.mjs';

const TONS = {
  claro: {
    gray:   ['oklch(94.5% 0.008 96)', 'oklch(42% 0.020 250)', 'oklch(62% 0.012 250)'],
    blue:   ['oklch(93.5% 0.045 262)', 'oklch(42% 0.140 262)', 'oklch(55% 0.170 262)'],
    green:  ['oklch(93.5% 0.050 150)', 'oklch(42% 0.110 150)', 'oklch(58% 0.130 150)'],
    yellow: ['oklch(94% 0.075 95)', 'oklch(44% 0.100 82)', 'oklch(76% 0.150 90)'],
    orange: ['oklch(93.5% 0.060 62)', 'oklch(44% 0.130 52)', 'oklch(64.6% 0.170 55)'],
    red:    ['oklch(93.5% 0.045 27)', 'oklch(43% 0.160 27)', 'oklch(58% 0.200 27)'],
    pink:   ['oklch(93.5% 0.040 350)', 'oklch(43% 0.150 350)', 'oklch(58% 0.190 350)'],
    purple: ['oklch(93.5% 0.045 300)', 'oklch(43% 0.150 300)', 'oklch(56% 0.185 300)'],
  },
  escuro: {
    gray:   ['oklch(29% 0.006 107)', 'oklch(85% 0.006 100)', 'oklch(62% 0.008 107)'],
    blue:   ['oklch(29% 0.055 262)', 'oklch(85% 0.075 262)', 'oklch(68% 0.140 262)'],
    green:  ['oklch(29% 0.055 150)', 'oklch(85% 0.075 150)', 'oklch(70% 0.120 150)'],
    yellow: ['oklch(30% 0.055 88)', 'oklch(87% 0.090 90)', 'oklch(80% 0.140 90)'],
    orange: ['oklch(29% 0.060 55)', 'oklch(86% 0.085 60)', 'oklch(74% 0.150 58)'],
    red:    ['oklch(29% 0.060 27)', 'oklch(85% 0.080 27)', 'oklch(68% 0.180 27)'],
    pink:   ['oklch(29% 0.055 350)', 'oklch(85% 0.075 350)', 'oklch(70% 0.160 350)'],
    purple: ['oklch(29% 0.055 300)', 'oklch(85% 0.075 300)', 'oklch(68% 0.160 300)'],
  },
};
const TEMA = {
  claro: { nome: 'claro', panel: 'oklch(98.4% 0.005 90)', card: N.surface, fg: N.fg, body: N.body, muted: N.muted, hair: 'oklch(32% 0.02 248.5 / 0.12)', hairStrong: 'oklch(32% 0.02 248.5 / 0.2)', muted2: 'oklch(95.8% 0.010 94)', primary: N.brand, shadow: '0 1px 2px rgba(12,16,14,.06)', tons: TONS.claro },
  escuro: { nome: 'escuro', panel: 'oklch(19.2% 0.004 107)', card: D.surface, fg: D.fg, body: D.body, muted: D.muted, hair: 'oklch(92.5% 0.004 100 / 0.12)', hairStrong: 'oklch(92.5% 0.004 100 / 0.2)', muted2: D.surface2, primary: D.brand, shadow: '0 1px 2px rgba(0,0,0,.4)', tons: TONS.escuro },
};

const ic = (p, s = 14, fill = 'none') => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="${fill}" stroke="${fill === 'none' ? 'currentColor' : 'none'}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
const I = {
  clip: ic('<path d="M15.5 7.5 8.6 14.4a2 2 0 0 0 2.8 2.8l7-7a4 4 0 0 0-5.6-5.6l-7 7a6 6 0 0 0 8.5 8.5l6.2-6.2"/>', 13),
  chat: ic('<path d="M7.5 19.5 4 21l1.2-3.6A8.5 8.5 0 1 1 7.5 19.5Z"/>', 13),
  cal: ic('<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 9.5h16M8.5 3v4M15.5 3v4"/>', 13),
  warn: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><path d="M12 7v6M12 16.5v.01" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/></svg>`,
  clock: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><path d="M12 7v5l3 2" fill="none" stroke="oklch(27% 0.07 55)" stroke-width="2" stroke-linecap="round"/></svg>`,
  lock: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="4.5" y="10" width="15" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="2.2"/></svg>`,
  plus: ic('<path d="M12 5v14M5 12h14"/>', 14),
};
// ícone de status, o mesmo do bloco (forma diz o estado)
const status = (s, T, size = 15) => {
  const cor = { backlog: T.tons.gray[2], todo: T.tons.gray[1], progress: T.tons.blue[2], review: T.tons.purple[2], done: T.tons.green[2], canceled: T.tons.gray[2] }[s];
  const anel = `<circle cx="7" cy="7" r="5.5" fill="none" stroke="currentColor" stroke-width="1.5"/>`;
  const f = {
    backlog: `<circle cx="7" cy="7" r="5.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2.2 2"/>`,
    todo: anel,
    progress: anel + `<path d="M7 3.5 A3.5 3.5 0 0 1 7 10.5 Z" fill="currentColor"/>`,
    review: anel + `<path d="M7 7 L7 3.5 A3.5 3.5 0 1 1 3.5 7 Z" fill="currentColor"/>`,
    done: `<circle cx="7" cy="7" r="6.25" fill="currentColor"/><path d="M4.4 7.2 L6.2 9 L9.6 5.4" fill="none" stroke="${T.card}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`,
    canceled: `<circle cx="7" cy="7" r="6.25" fill="currentColor"/><path d="M5 5 L9 9 M9 5 L5 9" fill="none" stroke="${T.card}" stroke-width="1.5" stroke-linecap="round"/>`,
  }[s];
  return `<svg width="${size}" height="${size}" viewBox="0 0 14 14" style="color:${cor};flex:none;display:block;">${f}</svg>`;
};
const COR = { backlog: 'gray', todo: 'gray', progress: 'blue', review: 'purple', done: 'green', canceled: 'red' };
const mix = (c, p, b = 'transparent') => `color-mix(in oklch, ${c} ${p}%, ${b})`;

const badge = (T, tom, txt) => `<span style="display:inline-flex;align-items:center;height:20px;padding:0 6px;border-radius:4px;background:${T.tons[tom][0]};color:${T.tons[tom][1]};font-size:11px;font-weight:500;">${txt}</span>`;
const avatar = (T, ini, tom) => `<span style="width:20px;height:20px;border-radius:999px;background:${T.tons[tom][0]};color:${T.tons[tom][1]};font-size:9px;font-weight:600;display:inline-grid;place-items:center;">${ini}</span>`;
const prazo = (T, txt, tom) => `<span style="display:inline-flex;align-items:center;gap:5px;height:22px;padding:0 7px 0 6px;border-radius:6px;font-size:12px;font-weight:500;${tom ? `background:${T.tons[tom][0]};color:${T.tons[tom][1]};` : `color:${T.muted};`}">${I.cal}${txt}</span>`;
const anel = (T, a, b) => { const r = 5.5, c = 2 * Math.PI * r; return `<svg width="14" height="14" viewBox="0 0 14 14" style="transform:rotate(-90deg);flex:none;"><circle cx="7" cy="7" r="${r}" fill="none" stroke-width="2.2" stroke="${mix(T.body, 14)}"/><circle cx="7" cy="7" r="${r}" fill="none" stroke-width="2.2" stroke-linecap="round" stroke="${T.primary}" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - a / b)}"/></svg>`; };

// cartão: o alerta é contorno + faixa embaixo (bloqueada listrada), nunca fundo tingido
const cartao = (T, c) => {
  const al = c.alerta && { overdue: T.tons.red[2], today: T.tons.orange[2], blocked: mix(T.tons.red[2], 82, 'black') }[c.alerta.k];
  const fundo = c.alerta?.k === 'blocked' ? `repeating-linear-gradient(-45deg, ${mix(al, 4, T.card)} 0 7px, ${mix(al, 11, T.card)} 7px 14px)` : T.card;
  const sombra = !al ? `${T.shadow}, inset 0 0 0 1px ${T.hair}` : c.alerta.k === 'blocked' ? `inset 0 0 0 1.5px ${al}` : `0 8px 20px -12px ${al}, inset 0 0 0 1.5px ${al}`;
  const faixaFundo = c.alerta?.k === 'blocked' ? `repeating-linear-gradient(-45deg, ${al} 0 7px, ${mix(al, 86, 'black')} 7px 14px)` : al;
  const faixaTinta = c.alerta?.k === 'today' ? 'oklch(27% 0.07 55)' : '#fff';
  const apagado = c.done || c.alerta?.k === 'blocked';
  return `
<div style="display:grid;grid-template-columns:minmax(0,1fr);gap:8px;overflow:hidden;padding:11px 12px;border-radius:12px;background:${fundo};box-shadow:${sombra};${c.lift ? `transform:rotate(1.6deg);box-shadow:-3px 22px 44px -14px ${mix(T.body, 34)}, 0 4px 10px -4px ${mix(T.body, 16)}, inset 0 0 0 1px ${T.hairStrong};` : ''}">
  <div style="display:flex;align-items:center;gap:7px;height:18px;">${status(c.s, T)}<span style="font:500 11.5px 'Geist Mono',monospace;color:${T.muted};">${c.code}</span></div>
  <div style="font-size:13.5px;line-height:19px;font-weight:500;color:${apagado ? T.muted : T.fg};">${c.t}</div>
  ${c.next ? `<div style="display:flex;align-items:center;gap:7px;padding:6px 8px;margin:0 -2px;border-radius:8px;background:${al ? mix(T.card, 70) : mix(T.muted2, 70, T.card)};font-size:12px;color:${T.body};">${anel(T, c.sub[0], c.sub[1])}<span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"><span style="color:${T.muted};">Próximo: </span>${c.next}</span><span style="margin-left:auto;flex:none;font-size:11.5px;color:${T.muted};">${c.sub[0]} de ${c.sub[1]}</span></div>` : ''}
  <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;"><span style="display:inline-flex;align-items:center;gap:5px;font-size:12px;color:${T.muted};"><i style="width:7px;height:7px;border-radius:2px;background:${T.tons[c.proj[1]][2]};"></i>${c.proj[0]}</span>${(c.tags || []).map(([t, tom]) => badge(T, tom, t)).join('')}</div>
  <div style="display:flex;align-items:center;gap:6px;min-height:22px;">${c.who ? avatar(T, c.who[0], c.who[1]) : `<span style="width:20px;height:20px;border-radius:999px;box-sizing:border-box;border:1.5px dashed ${T.hairStrong};"></span>`}${c.due && !(c.alerta && c.alerta.k !== 'blocked') ? prazo(T, c.due[0], c.due[1]) : ''}
    <span style="margin-left:auto;display:inline-flex;gap:10px;font-size:12px;color:${T.muted};">${c.clip ? `<span style="display:inline-flex;align-items:center;gap:4px;">${I.clip}${c.clip}</span>` : ''}${c.chat ? `<span style="display:inline-flex;align-items:center;gap:4px;${c.unread ? `color:${T.primary};` : ''}">${I.chat}${c.chat}</span>` : ''}</span></div>
  ${al ? `<div style="display:flex;align-items:center;gap:6px;margin:2px -12px -11px;padding:7px 12px;font-size:12px;font-weight:600;background:${faixaFundo};color:${faixaTinta};">${{ overdue: I.warn, today: I.clock, blocked: I.lock }[c.alerta.k]}<span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${c.alerta.txt}${c.alerta.sub ? `<span style="font-weight:400;opacity:.8;"> · ${c.alerta.sub}</span>` : ''}</span></div>` : ''}
</div>`;
};

// coluna sem caixa, só tingida: contador, fio colorido, rodapé com a barra
const coluna = (T, s, nome, cards, { limite, alertas = 0, rodape, ph } = {}) => {
  const tom = T.tons[COR[s]];
  const n = cards.length + (ph ? 1 : 0);
  return `
<div style="width:268px;flex:none;display:flex;flex-direction:column;box-sizing:border-box;padding:12px 10px 10px;border-radius:16px;background:${mix(tom[2], ph ? 12 : 6, T.panel)};box-shadow:inset 0 0 0 ${ph ? 1.5 : 1}px ${mix(tom[2], ph ? 45 : 12)};">
  <div style="display:flex;align-items:center;gap:8px;height:28px;padding:0 2px 10px 4px;">${status(s, T)}<b style="font-size:14px;font-weight:600;color:${T.fg};">${nome}</b>
    <span style="min-width:22px;height:20px;padding:0 6px;box-sizing:border-box;border-radius:99px;display:inline-grid;place-items:center;background:${tom[0]};color:${T.fg};font-size:11.5px;font-weight:600;">${limite ? `${n}/${limite}` : n}</span>
    <span style="flex:1"></span>${alertas ? `<span style="display:inline-flex;align-items:center;gap:4px;font-size:12px;font-weight:600;color:${T.tons.red[1]};">${I.warn.replace('#fff', T.panel)}${alertas}</span>` : ''}<span style="color:${T.muted};display:inline-flex;">${I.plus}</span></div>
  <div style="height:3px;margin:0 4px 12px;border-radius:3px;background:${tom[2]};"></div>
  <div style="display:flex;flex-direction:column;gap:8px;">${cards.join('')}${ph ? `<div style="height:${ph}px;border-radius:12px;box-shadow:inset 0 0 0 1.5px ${mix(tom[2], 40)};background:${mix(tom[2], 10)};"></div>` : ''}</div>
  ${rodape ? `<div style="display:grid;gap:7px;margin-top:10px;padding:10px 4px 2px;box-shadow:inset 0 1px 0 ${mix(tom[2], 18)};">
    <div style="display:flex;align-items:baseline;gap:6px;font-size:12px;color:${T.muted};"><b style="font-size:13px;color:${T.fg};">${cards.length}</b>${cards.length > 1 ? 'tarefas' : 'tarefa'}${rodape.pct != null ? `<span style="margin-left:auto;"><b style="font-size:13px;color:${T.fg};">${rodape.pct}%</b> das subtarefas</span>` : ''}</div>
    <div style="display:flex;gap:2px;height:4px;">${rodape.segs.map(([q, c]) => `<span style="flex-grow:${q};border-radius:9px;background:${c};"></span>`).join('')}</div>
    ${rodape.legenda ? `<div style="display:flex;gap:12px;font-size:11.5px;color:${T.muted};">${rodape.segs.map(([q, c, l]) => `<span style="display:inline-flex;align-items:center;gap:5px;"><i style="width:6px;height:6px;border-radius:2px;background:${c};"></i>${q} ${l}</span>`).join('')}</div>` : ''}
  </div>` : ''}
</div>`;
};

const quadro = T => {
  const C = (o) => cartao(T, o);
  const red = T.tons.red[2], seg = (tom, p) => mix(T.tons[tom][2], p);
  return `
<div style="background:${T.panel};border-radius:16px;box-shadow:inset 0 0 0 1px ${T.hair};overflow:hidden;">
  <div style="display:flex;align-items:center;gap:8px;height:52px;padding:0 18px;box-shadow:inset 0 -1px 0 ${T.hair};">
    <b style="font-size:14px;color:${T.fg};">Lançamento do app</b><span style="font-size:12.5px;color:${T.muted};"><b style="color:${T.fg};">3</b> de 15 concluídas</span>
  </div>
  <div style="display:flex;align-items:flex-start;gap:18px;padding:16px 20px 18px;">
    ${coluna(T, 'todo', 'A fazer', [
      C({ s: 'todo', code: 'APP-148', t: 'Corrigir sincronização do Google Agenda', proj: ['App 2.0', 'blue'], tags: [['Bug', 'red']], who: ['RC', 'pink'], clip: 2, chat: 4, unread: true, alerta: { k: 'today', txt: 'Vence hoje às 18h' } }),
      C({ s: 'todo', code: 'APP-150', t: 'Ajustar contraste dos estados de status', proj: ['App 2.0', 'blue'], tags: [['Design', 'pink']], who: ['AR', 'blue'], due: ['Sábado'], alerta: { k: 'blocked', txt: 'Bloqueada por APP-148', sub: 'Corrigir sincronização' } }),
      C({ s: 'todo', code: 'MKT-12', t: 'Roteiro do vídeo de lançamento', proj: ['Marketing', 'purple'], who: ['DL', 'orange'], due: ['Amanhã', 'yellow'], next: 'Gravar a locução', sub: [1, 4], chat: 2 }),
    ], { alertas: 2, rodape: { pct: 25, legenda: true, segs: [[1, seg('gray', 70), 'no prazo'], [2, red, 'com alerta']] } })}
    ${coluna(T, 'progress', 'Em andamento', [
      C({ s: 'progress', code: 'OPS-77', t: 'Fechar contrato do novo fornecedor de nuvem', proj: ['Operações', 'green'], who: ['RC', 'pink'], next: 'Revisar a cláusula de saída', sub: [1, 2], clip: 3, chat: 6, alerta: { k: 'overdue', txt: 'Atrasada 2 dias' } }),
      C({ s: 'progress', code: 'APP-155', t: 'Atalhos de teclado na lista', proj: ['App 2.0', 'blue'], who: ['JM', 'green'], due: ['Segunda', null], next: 'Mover tarefa entre colunas', sub: [3, 5] }),
    ], { limite: 4, alertas: 1, rodape: { pct: 57, legenda: true, segs: [[1, seg('blue', 70), 'no prazo'], [1, red, 'com alerta']] } })}
    ${coluna(T, 'review', 'Em revisão', [
      C({ s: 'review', code: 'APP-139', t: 'Skeleton do quadro com osso azul', proj: ['App 2.0', 'blue'], tags: [['Produto', 'blue']], who: ['JM', 'green'], due: ['Amanhã', 'yellow'], chat: 1, lift: true }),
    ], { limite: 3, ph: 96, rodape: { pct: 100, legenda: true, segs: [[1, seg('purple', 70), 'no prazo']] } })}
    ${coluna(T, 'done', 'Concluído', [
      C({ s: 'done', done: true, code: 'APP-131', t: 'Toast em pílula', proj: ['App 2.0', 'blue'], who: ['AR', 'blue'], due: ['15 nov'] }),
    ], { rodape: { pct: 100, segs: [[1, T.tons.green[2], 'concluídas']] } })}
  </div>
</div>`;
};

const nota = (T, titulo, txt) => `<div style="display:flex;flex-direction:column;gap:3px;max-width:300px;"><span style="font-size:12.5px;font-weight:600;color:${T.fg};">${titulo}</span><span style="font-size:12px;line-height:17px;color:${T.muted};">${txt}</span></div>`;
const notas = T => `<div style="display:flex;gap:32px;flex-wrap:wrap;">
  ${nota(T, 'Coluna sem caixa', 'Só tingida pela cor do status, com o fio colorido embaixo do cabeçalho. O contador vira n/limite e fica laranja quando passa.')}
  ${nota(T, 'Alerta = contorno + faixa', 'Atrasada vermelha, vence hoje laranja com texto escuro, bloqueada listrada. Nunca fundo tingido: numa coluna cheia, fundo vermelho vira mancha.')}
  ${nota(T, 'Próximo passo', 'O anel das subtarefas com a próxima a fazer. "2 de 4" sozinho não diz o que fazer agora.')}
  ${nota(T, 'Arrasto com peso', 'O cartão segue o ponteiro com um atraso mínimo, inclina pela velocidade (base 1,6°) com sombra funda; o espaço cresce no destino e o pouso endireita. Na faixa recolhida, ele voa até ela.')}
</div>`;


// para os lados: lingueta (padrão), páginas, lombadas, régua — e a faixa recolhida
const caixa = (T, rot, inner) => `<div style="display:flex;flex-direction:column;gap:9px;"><span style="font:10px 'Geist Mono',monospace;color:${T.muted};">${rot}</span>${inner}</div>`;
const pill = (T, inner, extra = '') => `<span style="display:inline-flex;align-items:center;gap:8px;height:36px;padding:0 12px;border-radius:99px;background:${T.card};color:${T.fg};font-size:12.5px;box-shadow:0 6px 18px -8px ${mix(T.body, 35)}, inset 0 0 0 1px ${T.hairStrong};${extra}">${inner}</span>`;
const nome = (T, s, n) => `<span style="display:inline-flex;align-items:center;gap:5px;">${status(s, T, 13)}${n}</span>`;
const navegacao = T => `<div style="display:flex;gap:36px;flex-wrap:wrap;align-items:flex-start;">
  ${caixa(T, 'lingueta · repouso e perto da borda', `<div style="display:flex;align-items:center;gap:18px;"><span style="width:19px;height:48px;border-radius:10px 0 0 10px;background:${T.card};box-shadow:inset 0 0 0 1px ${T.hairStrong};display:inline-grid;place-items:center;color:${T.fg};">›</span>${pill(T, `<b>2</b>${nome(T, 'done', 'Concluído')}${nome(T, 'canceled', 'Cancelado')}<span>›</span>`)}</div>`)}
  ${caixa(T, 'páginas na barra de status', `<div style="display:flex;align-items:center;gap:10px;font-size:12px;color:${T.muted};">Página <b style="color:${T.fg};">1</b> de 2 <span style="display:flex;gap:6px;"><i style="width:22px;height:8px;border-radius:99px;background:${T.primary};"></i><i style="width:8px;height:8px;border-radius:99px;background:${mix(T.body, 18)};"></i></span> Backlog, A fazer, Em andamento</div>`)}
  ${caixa(T, 'lombadas · cabeçalhos que saíram', `<div style="display:flex;gap:4px;padding:4px;border-radius:13px;background:${mix(T.panel, 85)};box-shadow:0 6px 18px -10px ${mix(T.body, 30)};">${['done:3', 'canceled:1'].map(x => { const [s, n] = x.split(':'); return `<span style="display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 9px;border-radius:9px;background:${T.card};color:${T.fg};font-size:12.5px;box-shadow:inset 0 0 0 1px ${T.hair}, inset 0 -2px 0 ${T.tons[COR[s]][2]};">${status(s, T, 14)}<b>${n}</b></span>`; }).join('')}</div>`)}
  ${caixa(T, 'régua de colunas', `<div style="display:flex;gap:4px;width:460px;">${[['todo', 'A fazer', 4, 1], ['progress', 'Em andamento', 3, 1], ['done', 'Concluído', 3, 0]].map(([s, n, q, v]) => `<span style="position:relative;flex:1;display:flex;align-items:center;gap:7px;height:32px;padding:0 10px;border-radius:9px;font-size:12.5px;white-space:nowrap;${v ? `background:${T.card};color:${T.fg};box-shadow:inset 0 0 0 1px ${T.hair};` : `color:${T.muted};`}">${status(s, T, 14)}${n}<b style="margin-left:auto;">${q}</b>${v ? `<i style="position:absolute;left:10px;right:10px;bottom:-1px;height:2px;border-radius:2px;background:${T.tons[COR[s]][2]};"></i>` : ''}</span>`).join('')}</div>`)}
  ${caixa(T, 'coluna recolhida (só à mão)', `<div style="width:48px;padding:16px 0 12px;border-radius:16px;background:${mix(T.tons.green[2], 6, T.panel)};box-shadow:inset 0 0 0 1px ${mix(T.tons.green[2], 12)};display:flex;flex-direction:column;align-items:center;gap:10px;">${status('done', T)}<span style="min-width:22px;height:20px;border-radius:99px;background:${T.tons.green[0]};color:${T.fg};font-size:11.5px;font-weight:600;display:inline-grid;place-items:center;">3</span><b style="writing-mode:vertical-rl;font-size:13.5px;color:${T.fg};">Concluído</b></div>`)}
</div>`;

const body = `
${quadro(TEMA.claro)}
${notas(TEMA.claro)}
<p class="sec-title">Para os lados</p>
${navegacao(TEMA.claro)}
${darkHalf('No escuro', 'A coluna tinge 6% da cor do status sobre o painel; a faixa do alerta continua sólida, e o "vence hoje" mantém o texto escuro no laranja.', quadro(TEMA.escuro) + navegacao(TEMA.escuro))}`;

const html = page('Kanban',
  'O quadro aprovado: colunas tingidas pelo status, cartão que diz o próximo passo, alerta em contorno + faixa e arrasto com peso. Sem barra de rolagem: o fundo arrasta, e a lingueta (ou páginas, lombadas, régua) mostra o que ficou de fora.',
  body);
await Bun.write('Kanban.dc.html', html);
console.log('Kanban.dc.html', html.length, 'bytes');
