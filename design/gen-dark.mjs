import { page } from './tokens.mjs';
import { D, DC, dbtn, dibtn, dbg, dinput, dcard, rr } from './dark.mjs';
const cap = t => `<span class="cap" style="color:${D.muted};">${t}</span>`;
const I = {
  finger:`<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 11v3.5a6 6 0 0 1-1.2 3.6"/><path d="M8.5 11a3.5 3.5 0 0 1 7 0v2.2c0 1.4-.3 2.8-.9 4.1"/><path d="M5.4 13.6A7 7 0 0 1 5 11a7 7 0 0 1 10.6-6"/><path d="M19 11v2c0 1.1-.1 2.2-.4 3.3"/></svg>`,
  mail:`<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5.5" width="18" height="13" rx="2.2"/><path d="m3.6 7 7.3 5.3a2 2 0 0 0 2.2 0L20.4 7"/></svg>`,
  plus:`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`,
  chev:`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`,
  check:`<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 13 4.5 4.5L19 7"/></svg>`,
};

const rail = (nome, meta, spec, last = false) => `
<div style="display:grid;grid-template-columns:158px 1fr;gap:28px;padding:24px 0;${last ? '' : `border-bottom:1px solid ${D.hair};`}align-items:start;">
  <div style="display:flex;flex-direction:column;gap:3px;position:relative;top:2px;">
    <span style="font-size:14px;font-weight:600;color:${D.fg};letter-spacing:-0.008em;">${nome}</span>
    <span class="cap" style="line-height:15px;color:${D.muted};">${meta}</span>
  </div>
  <div style="display:flex;flex-direction:column;gap:18px;min-width:0;">${spec}</div>
</div>`;
const grp = (label, inner, g = 10) => `<div style="display:flex;flex-direction:column;gap:9px;">${cap(label)}<div style="display:flex;align-items:center;gap:${g}px;flex-wrap:wrap;">${inner}</div></div>`;

// regras da tradução
const regra = (n, titulo, texto, demo) => `
<div style="display:flex;flex-direction:column;gap:12px;padding:18px;border-radius:14px;background:${D.surface};box-shadow:inset 0 0 0 1px ${D.hair};">
  <div style="display:flex;align-items:baseline;gap:8px;">
    <span class="mono" style="font-size:11px;color:${D.brand};font-weight:500;">${n}</span>
    <span style="font-size:13.5px;font-weight:600;color:${D.fg};">${titulo}</span>
  </div>
  <div style="min-height:44px;display:flex;align-items:center;">${demo}</div>
  <span style="font-size:12.5px;line-height:17px;color:${D.muted};">${texto}</span>
</div>`;
const regras = `
<div style="display:grid;grid-template-columns:repeat(3, minmax(0, 1fr));gap:18px;">
  ${regra('01', 'O sólido inverte', 'No claro ele é fundo escuro com texto branco. No escuro vira fundo claro com texto escuro — porque um azul de 47% sobre fundo de 19% não tem contraste nenhum.',
    `<div style="display:flex;gap:10px;align-items:center;">${dbtn('solid')}Publicar</span>${dbtn('primary')}Nova tarefa</span></div>`)}
  ${regra('02', 'O tingido troca de andar', 'O fundo do <span style="font-weight:500;color:' + D.fg + '">primary</span> sai de L 97% para L 28%, e a tinta sai de L 33% para L 84%. Mesma matiz, andares trocados.',
    `<div style="display:flex;gap:10px;align-items:center;">${dbtn('primary')}Nova tarefa</span>${dbtn('danger')}Excluir</span></div>`)}
  ${regra('03', 'O campo fica mais escuro que o card', 'Ao contrário do claro, onde ele é mais claro. No escuro o buraco vai para baixo — L 16,5% dentro de um card de 22,5%.',
    `<div style="width:100%;"><div style="${dinput('rest')}color:${D.subtle};">Descreva a tarefa</div></div>`)}
</div>`;

const ESTADOS = [['rest','repouso'],['hover','hover'],['active','pressionado'],['focus','foco'],['disabled','inativo']];
const botoes = `
${grp('variantes', ['primary','outline','subtle','ghost','link','danger','solid'].map(v =>
  `${dbtn(v)}${{primary:'Nova tarefa',outline:'Filtrar',subtle:'Exportar',ghost:'Cancelar',link:'Ver histórico',danger:'Excluir',solid:'Publicar'}[v]}</span>`).join(''))}
<div style="display:flex;flex-direction:column;gap:9px;">${cap('estados')}
  <div style="display:grid;grid-template-columns:80px repeat(5, minmax(0, 1fr));gap:11px 13px;align-items:center;">
    <span></span>${ESTADOS.map(([, l]) => `<span class="cap" style="text-align:center;color:${D.muted};">${l}</span>`).join('')}
    ${['primary','outline','subtle','danger','solid'].map(v =>
      `<span style="font-size:12px;font-weight:500;color:${D.fg};">${v}</span>` +
      ESTADOS.map(([s]) => `<span style="display:flex;justify-content:center;">${dbtn(v, 32, s)}Salvar</span></span>`).join('')).join('')}
  </div>
</div>
${grp('tamanho e composição', [
  ...[24,28,32,36,44].map(h => `<span style="display:inline-flex;flex-direction:column;gap:6px;align-items:center;">${dbtn('primary', h)}Salvar</span>${cap(`${h}·r${rr(h)}`)}</span>`),
  `<span style="width:1px;height:40px;background:${D.hair};"></span>`,
  dibtn('outline', 32, 'rest', I.plus),
  `${dbtn('outline')}Ordenar<span style="display:flex;opacity:0.7;">${I.chev}</span></span>`,
].join(''), 12)}`;

const badges = `
<div style="display:grid;grid-template-columns:repeat(9, minmax(0, 1fr));gap:10px;">
  ${Object.entries(DC).map(([nome, c]) => `
  <div style="display:flex;flex-direction:column;gap:8px;">
    <div style="height:44px;border-radius:9px;background:${c.bg};display:flex;align-items:center;justify-content:center;"><span style="font-size:12px;font-weight:600;color:${c.fg};">Aa</span></div>
    <span style="font-size:12px;font-weight:500;color:${D.fg};">${nome}</span>
  </div>`).join('')}
</div>
${grp('status', [dbg('cinza','A fazer',{dot:true}), dbg('azul','Em andamento',{dot:true}), dbg('amarelo','Bloqueada',{dot:true}), dbg('verde','Concluída',{dot:true}), dbg('vermelho','Cancelada',{dot:true}), dbg('roxo','Em revisão',{dot:true})].join(''), 8)}
<div style="display:flex;gap:14px;padding:14px 16px;border-radius:12px;background:${D.surface2};">
  <span style="font-size:12.5px;line-height:18px;color:${D.body};max-width:840px;">No claro os fundos vivem em <span class="mono" style="font-size:12px;">L 93,5%</span> e as tintas em <span class="mono" style="font-size:12px;">L 43%</span>. Aqui é o espelho: fundo em <span class="mono" style="font-size:12px;">L 29%</span>, tinta em <span class="mono" style="font-size:12px;">L 85%</span>. A matiz é a mesma nos dois temas — é isso que faz o amarelo continuar sendo “bloqueada” quando o usuário troca o tema no meio do dia.</span>
</div>`;

const campos = `
<div style="display:grid;grid-template-columns:repeat(4, minmax(0, 1fr));gap:16px;">
  ${[['rest','repouso','Descreva a tarefa',true],['focus','foco','Revisar contrato',false],['error','erro','Re',false],['disabled','inativo','Bloqueado pelo plano',true]].map(([st, l, v, ph]) =>
    `<div style="display:flex;flex-direction:column;gap:6px;"><span style="font-size:14px;font-weight:500;color:${D.fg};">Título</span><div style="${dinput(st)}color:${ph ? D.subtle : D.body};">${v}</div>${cap(l)}</div>`).join('')}
</div>
${grp('seleção', [
  `<span style="display:inline-flex;align-items:center;gap:9px;font-size:13.5px;color:${D.body};"><span style="width:16px;height:16px;border-radius:4px;box-shadow:inset 0 0 0 1.5px ${D.hairStrong};flex-shrink:0;"></span>Concluída</span>`,
  `<span style="display:inline-flex;align-items:center;gap:9px;font-size:13.5px;color:${D.body};"><span style="width:16px;height:16px;border-radius:4px;background:${D.brand};color:oklch(17% 0.03 262.6);display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;">${I.check}</span>Concluída</span>`,
  `<span style="display:inline-flex;align-items:center;gap:9px;font-size:13.5px;color:${D.body};"><span style="width:34px;height:20px;border-radius:999px;background:${D.surface3};display:inline-flex;align-items:center;padding:2px;box-sizing:border-box;flex-shrink:0;"><span style="width:16px;height:16px;border-radius:999px;background:${D.muted};"></span></span>Notificar</span>`,
  `<span style="display:inline-flex;align-items:center;gap:9px;font-size:13.5px;color:${D.body};"><span style="width:34px;height:20px;border-radius:999px;background:${D.brand};display:inline-flex;align-items:center;justify-content:flex-end;padding:2px;box-sizing:border-box;flex-shrink:0;"><span style="width:16px;height:16px;border-radius:999px;background:oklch(17% 0.03 262.6);"></span></span>Notificar</span>`,
].join(''), 22)}`;

const login = `
<div style="display:flex;gap:26px;align-items:flex-start;flex-wrap:wrap;">
  <div style="${dcard(24)}display:flex;flex-direction:column;gap:16px;width:320px;box-sizing:border-box;">
    <div style="display:flex;flex-direction:column;gap:5px;">
      <span style="font-size:18px;font-weight:600;letter-spacing:-0.015em;color:${D.fg};">Entrar na Muriki</span>
      <span style="font-size:13px;line-height:18px;color:${D.muted};">Seu trabalho de hoje, do jeito que você deixou.</span>
    </div>
    <span style="height:44px;padding:0 16px;border-radius:${rr(44)}px;font-size:14.5px;font-weight:500;display:inline-flex;align-items:center;justify-content:center;gap:9px;background:${D.brandSub};color:${D.brandInk};box-shadow:inset 0 0 0 1px ${D.brandSubLine};">${I.finger}Entrar com passkey</span>
    <div style="display:flex;align-items:center;gap:12px;"><span style="height:1px;flex-grow:1;background:${D.hair};"></span><span class="cap" style="font-size:10px;color:${D.muted};">ou com e-mail</span><span style="height:1px;flex-grow:1;background:${D.hair};"></span></div>
    <div style="display:flex;flex-direction:column;gap:6px;"><span style="font-size:14px;font-weight:500;color:${D.fg};">E-mail</span><div style="${dinput('rest', 36)}color:${D.subtle};"><span style="color:${D.subtle};display:flex;">${I.mail}</span>voce@empresa.com</div></div>
    <div style="display:flex;flex-direction:column;gap:6px;"><span style="font-size:14px;font-weight:500;color:${D.fg};">Senha</span><div style="${dinput('rest', 36)}color:${D.body};">••••••••••</div><div style="display:flex;justify-content:flex-end;"><span style="font-size:12px;color:${D.brand};">Esqueci a senha</span></div></div>
    <span style="height:36px;border-radius:${rr(36)}px;font-size:14px;font-weight:500;display:inline-flex;align-items:center;justify-content:center;background:${D.brand};color:oklch(17% 0.03 262.6);">Entrar</span>
    <span style="font-size:12.5px;text-align:center;color:${D.muted};">Não tem conta? <span style="color:${D.brand};">Criar agora</span></span>
  </div>
  <div style="display:flex;flex-direction:column;gap:14px;flex-grow:1;min-width:340px;">
    <div style="background:${D.surface};border-radius:14px;box-shadow:inset 0 0 0 1px ${D.hair};overflow:hidden;">
      <div style="display:flex;align-items:center;gap:9px;padding:13px 14px;border-bottom:1px solid ${D.hair};">
        <span style="font-size:14px;font-weight:600;color:${D.fg};flex-grow:1;">Focus — hoje</span>
        ${dbtn('ghost', 28)}Filtrar</span>${dbtn('outline', 28)}Exportar</span>${dbtn('primary', 28)}<span style="display:flex;">${I.plus}</span>Nova</span>
      </div>
      ${[['Revisar contrato OpenAPI do módulo focus','laranja','Alta','azul','Em andamento'],
         ['Regenerar client Kubb no platform','vermelho','Urgente','amarelo','Bloqueada'],
         ['Subir migration de focus_task_labels','cinza','Baixa','verde','Concluída']].map(([t, pc, pt, sc, st], i) => `
      <div style="display:flex;align-items:center;gap:10px;height:44px;padding:0 14px;${i < 2 ? `border-bottom:1px solid ${D.hair};` : ''}">
        <span style="width:16px;height:16px;border-radius:4px;box-shadow:inset 0 0 0 1.5px ${D.hairStrong};flex-shrink:0;"></span>
        <span style="font-size:13.5px;color:${D.body};flex-grow:1;">${t}</span>
        ${dbg(pc, pt, { size:'sm' })}${dbg(sc, st, { size:'sm', dot:true })}
      </div>`).join('')}
    </div>
    <span style="font-size:12.5px;line-height:17px;color:${D.muted};">O mesmo cabeçalho e a mesma linha da prancha de Botões, no escuro. Se algo parece diferente aqui, é bug de tema — não decisão.</span>
  </div>
</div>`;

const body = `
<div style="display:flex;flex-direction:column;gap:14px;">
  <p class="sec-title" style="color:${D.muted};">As três regras da tradução</p>
  ${regras}
</div>
<div style="display:flex;flex-direction:column;margin-top:-4px;">
  ${rail('Botões', 'a família<br>inteira', botoes)}
  ${rail('Badges', 'nove matizes<br>luz invertida', badges)}
  ${rail('Campos', 'e seleção', campos)}
  ${rail('Na tela', 'login e lista<br>em paridade', login, true)}
</div>`;

const html = page('Dark',
  'Paridade com o claro, não um retoque. Toda decisão nova — família de botão sem fill, nove badges abafados, raio proporcional — chega aqui na mesma entrega. As três regras de tradução estão no topo para que a próxima cor não precise de palpite.',
  body, D.bg, D.body);
await Bun.write('Dark.dc.html', html);
console.log('Dark.dc.html', html.length, 'bytes');
