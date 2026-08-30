import { N as T, R } from './tokens.mjs';
const N = {
  bg:T.bg, surface:T.surface, fg:T.body, fgTitle:T.fg,
  muted:T.muted, subtle:T.subtle,
  b100:T.surface2, b200:T.surface3, b300:T.borderStrong,
  border:T.border, borderInput:T.borderInput,
  brand:T.brand, brandH:T.brandH, brandA:T.brandA,
  brand50:T.brand50, brand100:T.brand100, brand200:T.brand200, brand800:T.brand800,
  acc:T.acc, accH:T.accH, accA:T.accA, acc100:T.acc100, acc700:T.acc700,
  danger:T.danger, dangerH:'oklch(48% 0.19 27)', dangerA:'oklch(42% 0.17 27)',
  danger50:T.danger50, danger100:T.danger100, danger800:T.danger800,
  success:T.success, success50:T.success50, success100:T.success100,
  warning:T.warning, warning50:T.warning50, warning100:T.warning100, warning700:T.warning700,
};
const cap = t => `<span class="cap">${t}</span>`;
const shadow = { sm:`0 1px 2px oklch(32% 0.02 248.5 / 0.06), 0 1px 1px oklch(32% 0.02 248.5 / 0.04)`,
                 md:`0 4px 10px oklch(32% 0.02 248.5 / 0.07), 0 1px 2px oklch(32% 0.02 248.5 / 0.05)`,
                 lg:`0 12px 28px oklch(32% 0.02 248.5 / 0.11), 0 2px 6px oklch(32% 0.02 248.5 / 0.06)` };

const ico = {
  doc:`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z"/><path d="M14 3v5h5"/></svg>`,
  chevR:`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>`,
  check:`<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 13 4.5 4.5L19 7"/></svg>`,
  alert:`<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M12 8v5"/><circle cx="12" cy="16.6" r="0.7" fill="currentColor"/><path d="M10.3 3.9 2.5 18a1.9 1.9 0 0 0 1.7 2.9h15.6a1.9 1.9 0 0 0 1.7-2.9L13.7 3.9a1.9 1.9 0 0 0-3.4 0Z"/></svg>`,
  info:`<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><circle cx="12" cy="7.8" r="0.7" fill="currentColor"/></svg>`,
  circCheck:`<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m8.2 12.3 2.6 2.6 5-5.2"/></svg>`,
  flag:`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V4.5"/><path d="M5 5.2h10.5l-1.6 3.4 1.6 3.4H5"/></svg>`,
  clock:`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7.2V12l3 1.8"/></svg>`,
  msg:`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5a2.5 2.5 0 0 1-2.5 2.5H9l-4 3.5v-3.5H6.5A2.5 2.5 0 0 1 4 14.5v-8A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5Z"/></svg>`,
  grip:`<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/></svg>`,
  inbox:`<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 13h4l1.6 2.6h6.8L17 13h4"/><path d="M4.6 5.6 3 13v4.5A1.5 1.5 0 0 0 4.5 19h15a1.5 1.5 0 0 0 1.5-1.5V13l-1.6-7.4A1.5 1.5 0 0 0 17.9 4.4H6.1a1.5 1.5 0 0 0-1.5 1.2Z"/></svg>`,
};

// Badges
const badge = (bg, fg, txt, bd) => `<span style="display:inline-flex;align-items:center;gap:5px;height:22px;padding:0 9px;border-radius:6px;background:${bg};color:${fg};font-size:11.5px;font-weight:500;${bd?`border:1px solid ${bd};`:''}">${txt}</span>`;
const dot = c => `<span style="width:6px;height:6px;border-radius:999px;background:${c};flex-shrink:0;"></span>`;
const badges = `
<div style="display:flex;flex-direction:column;gap:18px;">
  <div style="display:flex;flex-direction:column;gap:8px;">
    ${cap('status · subtle — o padrão em lista e board')}
    <div style="display:flex;gap:8px;flex-wrap:wrap;">
      ${badge(N.b100, N.muted, `${dot(N.subtle)}A fazer`)}
      ${badge(N.brand100, 'oklch(33% 0.13 262.6)', `${dot(N.brand)}Em andamento`)}
      ${badge(N.warning100, N.warning700, `${dot(N.warning)}Bloqueada`)}
      ${badge(N.success100, 'oklch(42% 0.11 150)', `${dot(N.success)}Concluída`)}
      ${badge(N.danger100, 'oklch(42% 0.17 27)', `${dot(N.danger)}Cancelada`)}
    </div>
  </div>
  <div style="display:flex;flex-direction:column;gap:8px;">
    ${cap('solid — só onde o status é a informação principal')}
    <div style="display:flex;gap:8px;flex-wrap:wrap;">
      ${badge(N.b200, N.fg, 'A fazer')}
      ${badge(N.brand, '#fff', 'Em andamento')}
      ${badge(N.acc, N.fg, 'Bloqueada')}
      ${badge(N.success, '#fff', 'Concluída')}
      ${badge(N.danger, '#fff', 'Cancelada')}
    </div>
  </div>
  <div style="display:flex;flex-direction:column;gap:8px;">
    ${cap('outline · tag de label — cor vem do label, não do sistema')}
    <div style="display:flex;gap:8px;flex-wrap:wrap;">
      ${badge(N.surface, N.muted, 'backend', N.b300)}
      ${badge(N.surface, N.muted, 'contrato', N.b300)}
      ${badge(N.surface, N.muted, 'urgente-cliente', N.b300)}
      ${badge(N.surface, N.muted, `<span style="font-family:'Geist Mono',monospace;font-size:11px;">MRK-1284</span>`, N.b300)}
    </div>
  </div>
  <div style="display:flex;flex-direction:column;gap:8px;">
    ${cap('prioridade — forma + cor, nunca cor sozinha')}
    <div style="display:flex;gap:8px;flex-wrap:wrap;">
      <span style="display:inline-flex;align-items:center;gap:5px;height:22px;padding:0 9px;border-radius:6px;background:${N.b100};color:${N.subtle};font-size:11.5px;font-weight:500;">${ico.flag}Baixa</span>
      <span style="display:inline-flex;align-items:center;gap:5px;height:22px;padding:0 9px;border-radius:6px;background:${N.brand100};color:oklch(33% 0.13 262.6);font-size:11.5px;font-weight:500;">${ico.flag}Média</span>
      <span style="display:inline-flex;align-items:center;gap:5px;height:22px;padding:0 9px;border-radius:6px;background:${N.warning100};color:${N.warning700};font-size:11.5px;font-weight:500;">${ico.flag}Alta</span>
      <span style="display:inline-flex;align-items:center;gap:5px;height:22px;padding:0 9px;border-radius:6px;background:${N.danger100};color:oklch(42% 0.17 27);font-size:11.5px;font-weight:600;">${ico.flag}Urgente</span>
    </div>
  </div>
</div>`;

// Avatares
const av = (size, fs, bg, fg, txt) => `<span style="width:${size}px;height:${size}px;border-radius:999px;background:${bg};color:${fg};display:inline-flex;align-items:center;justify-content:center;font-size:${fs}px;font-weight:600;flex-shrink:0;">${txt}</span>`;
const avatars = `
<div style="display:flex;flex-direction:column;gap:18px;">
  <div style="display:flex;flex-direction:column;gap:8px;">
    ${cap('tamanhos · 20 / 24 / 32 / 40')}
    <div style="display:flex;gap:10px;align-items:center;">
      ${av(20,9,N.brand200,'oklch(27% 0.09 262.6)','GT')}
      ${av(24,10,N.brand200,'oklch(27% 0.09 262.6)','GT')}
      ${av(32,12,N.brand,'#fff','GT')}
      ${av(40,15,N.brand,'#fff','GT')}
    </div>
  </div>
  <div style="display:flex;flex-direction:column;gap:8px;">
    ${cap('grupo empilhado · overflow numérico')}
    <div style="display:flex;align-items:center;">
      <span style="display:flex;">
        <span style="box-shadow:0 0 0 2px ${N.surface};border-radius:999px;">${av(28,11,N.brand,'#fff','GT')}</span>
        <span style="box-shadow:0 0 0 2px ${N.surface};border-radius:999px;margin-left:-9px;">${av(28,11,'oklch(58% 0.12 82)','#fff','RS')}</span>
        <span style="box-shadow:0 0 0 2px ${N.surface};border-radius:999px;margin-left:-9px;">${av(28,11,N.success,'#fff','AL')}</span>
        <span style="box-shadow:0 0 0 2px ${N.surface};border-radius:999px;margin-left:-9px;">${av(28,10,N.b200,N.muted,'+4')}</span>
      </span>
    </div>
  </div>
  <div style="display:flex;flex-direction:column;gap:8px;">
    ${cap('com presença')}
    <div style="display:flex;gap:14px;align-items:center;">
      <span style="position:relative;display:inline-flex;">${av(32,12,N.brand,'#fff','GT')}<span style="position:absolute;right:-1px;bottom:-1px;width:10px;height:10px;border-radius:999px;background:${N.success};box-shadow:0 0 0 2px ${N.surface};"></span></span>
      <span style="position:relative;display:inline-flex;">${av(32,12,'oklch(58% 0.12 82)','#fff','RS')}<span style="position:absolute;right:-1px;bottom:-1px;width:10px;height:10px;border-radius:999px;background:${N.subtle};box-shadow:0 0 0 2px ${N.surface};"></span></span>
    </div>
  </div>
</div>`;

// Navegação
const nav = `
<div style="display:flex;flex-direction:column;gap:20px;">
  <div style="display:flex;flex-direction:column;gap:8px;">
    ${cap('tabs · sublinhado')}
    <div style="display:flex;gap:2px;border-bottom:1px solid ${N.border};">
      <span style="padding:0 12px;height:34px;display:inline-flex;align-items:center;font-size:13.5px;font-weight:500;color:${N.fg};box-shadow:inset 0 -2px 0 ${N.brand};">Lista</span>
      <span style="padding:0 12px;height:34px;display:inline-flex;align-items:center;font-size:13.5px;color:${N.muted};">Board</span>
      <span style="padding:0 12px;height:34px;display:inline-flex;align-items:center;font-size:13.5px;color:${N.muted};">Timeline</span>
      <span style="padding:0 12px;height:34px;display:inline-flex;align-items:center;font-size:13.5px;color:${N.muted};gap:6px;">Calendário${badge(N.b100,N.muted,'3')}</span>
    </div>
  </div>
  <div style="display:flex;flex-direction:column;gap:8px;">
    ${cap('segmented · troca de densidade')}
    <div style="display:inline-flex;background:${N.b100};border-radius:9px;padding:3px;gap:2px;align-self:flex-start;">
      <span style="padding:0 12px;height:26px;display:inline-flex;align-items:center;font-size:12.5px;font-weight:500;background:${N.surface};border-radius:7px;box-shadow:${shadow.sm};">Compacto</span>
      <span style="padding:0 12px;height:26px;display:inline-flex;align-items:center;font-size:12.5px;color:${N.muted};">Confortável</span>
    </div>
  </div>
  <div style="display:flex;flex-direction:column;gap:8px;">
    ${cap('breadcrumb de árvore · docs e canvas')}
    <div style="display:flex;align-items:center;gap:6px;font-size:12.5px;color:${N.muted};">
      <span>Muriki</span><span style="display:flex;color:${N.subtle};">${ico.chevR}</span>
      <span>Engenharia</span><span style="display:flex;color:${N.subtle};">${ico.chevR}</span>
      <span style="display:inline-flex;align-items:center;gap:5px;color:${N.fg};font-weight:500;">${ico.doc}Contrato OpenAPI</span>
    </div>
  </div>
  <div style="display:flex;flex-direction:column;gap:8px;">
    ${cap('tooltip')}
    <div style="display:inline-flex;align-self:flex-start;background:oklch(24% 0.02 250);color:oklch(96.5% 0.004 107);font-size:12px;padding:6px 9px;border-radius:7px;box-shadow:${shadow.md};">Atalho: <span style="font-family:'Geist Mono',monospace;font-size:11.5px;opacity:0.85;">⌘K</span></div>
  </div>
  <div style="display:flex;flex-direction:column;gap:8px;">
    ${cap('progresso · meta do dia')}
    <div style="display:flex;align-items:center;gap:10px;">
      <div style="flex-grow:1;height:6px;border-radius:999px;background:${N.b200};overflow:hidden;"><div style="width:62%;height:100%;border-radius:999px;background:${N.brand};"></div></div>
      <span style="font-family:'Geist Mono',monospace;font-size:11.5px;color:${N.muted};">8/13</span>
    </div>
  </div>
</div>`;

// Alertas
const alert = (bg, bd, icoColor, icon, title, body) => `
<div style="background:${bg};border:1px solid ${bd};border-radius:10px;padding:12px 14px;display:flex;gap:10px;align-items:flex-start;">
  <span style="color:${icoColor};display:flex;flex-shrink:0;margin-top:1px;">${icon}</span>
  <div style="display:flex;flex-direction:column;gap:2px;">
    <span style="font-size:13px;font-weight:600;line-height:18px;">${title}</span>
    <span style="font-size:12.5px;line-height:17px;color:${N.muted};">${body}</span>
  </div>
</div>`;
const alerts = `
<div style="display:grid;grid-template-columns:repeat(2, minmax(0, 1fr));gap:14px;">
  ${alert(N.brand50, N.brand200, N.brand, ico.info, 'Contrato dessincronizado', 'O spec da API mudou. Rode o sync antes de mexer na tela.')}
  ${alert(N.success50, N.success100, N.success, ico.circCheck, 'Tudo sincronizado', 'O client foi regenerado há 2 minutos.')}
  ${alert(N.warning50, N.warning100, N.warning, ico.alert, 'Tarefa bloqueada há 3 dias', 'Ninguém foi notificado do bloqueio ainda.')}
  ${alert(N.danger50, N.danger100, N.danger, ico.alert, 'Falha ao salvar', 'A conexão caiu. Suas alterações estão guardadas localmente.')}
</div>
<div style="display:flex;flex-direction:column;gap:8px;margin-top:4px;">
  ${cap('toast')}
  <div style="align-self:flex-start;background:${N.surface};border:1px solid ${N.border};border-radius:11px;padding:12px 14px;display:flex;gap:11px;align-items:center;box-shadow:${shadow.lg};min-width:320px;">
    <span style="color:${N.success};display:flex;">${ico.circCheck}</span>
    <div style="display:flex;flex-direction:column;gap:1px;flex-grow:1;">
      <span style="font-size:13px;font-weight:500;">Tarefa movida para Concluída</span>
      <span style="font-size:12px;color:${N.muted};">MRK-1284 · Revisar contrato OpenAPI</span>
    </div>
    <span style="font-size:12.5px;font-weight:500;color:${N.brand};">Desfazer</span>
  </div>
</div>`;

// Task row + card + skeleton + empty
const taskRow = (checked, title, extra) => `
<div style="display:flex;align-items:center;gap:11px;height:44px;padding:0 12px;border-bottom:1px solid ${N.b100};${extra||''}">
  <span style="color:${N.b300};display:flex;flex-shrink:0;">${ico.grip}</span>
  <span style="width:16px;height:16px;border-radius:5px;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;${checked?`background:${N.brand};color:#fff;`:`border:1.5px solid ${N.b300};background:${N.surface};`}">${checked?ico.check:''}</span>
  <span style="font-size:13.5px;flex-grow:1;${checked?`color:${N.subtle};text-decoration:line-through;`:''}">${title}</span>
  ${badge(N.b100, N.muted, 'backend', '')}
  <span style="display:inline-flex;align-items:center;gap:4px;font-size:12px;color:${N.muted};">${ico.clock}4h</span>
  <span style="display:inline-flex;align-items:center;gap:4px;font-size:12px;color:${N.muted};">${ico.msg}2</span>
  ${av(22,9,N.brand,'#fff','GT')}
</div>`;

const composites = `
<div style="display:grid;grid-template-columns:1.45fr 1fr;gap:24px;">
  <div style="display:flex;flex-direction:column;gap:8px;">
    ${cap('linha de tarefa · densidade compacta 44px')}
    <div style="background:${N.surface};border:1px solid ${N.border};border-radius:11px;overflow:hidden;">
      ${taskRow(false, 'Revisar contrato OpenAPI do módulo focus')}
      ${taskRow(false, 'Regenerar client Kubb no platform', `background:${N.brand50};`)}
      ${taskRow(true, 'Subir migration de focus_task_labels')}
      ${taskRow(false, 'Escrever teste do webhook de subscriptions', 'border-bottom:none;')}
    </div>
    <div style="display:flex;flex-direction:column;gap:8px;margin-top:10px;">
      ${cap('skeleton · carregando')}
      <div style="background:${N.surface};border:1px solid ${N.border};border-radius:11px;padding:12px;display:flex;flex-direction:column;gap:11px;">
        <div style="display:flex;gap:11px;align-items:center;"><span style="width:16px;height:16px;border-radius:5px;background:${N.b200};"></span><span style="height:9px;border-radius:5px;background:${N.b200};flex-grow:1;max-width:280px;"></span><span style="height:9px;width:48px;border-radius:5px;background:${N.b100};"></span></div>
        <div style="display:flex;gap:11px;align-items:center;"><span style="width:16px;height:16px;border-radius:5px;background:${N.b200};"></span><span style="height:9px;border-radius:5px;background:${N.b200};flex-grow:1;max-width:200px;"></span><span style="height:9px;width:48px;border-radius:5px;background:${N.b100};"></span></div>
      </div>
    </div>
  </div>

  <div style="display:flex;flex-direction:column;gap:8px;">
    ${cap('card de board')}
    <div style="background:${N.surface};border:1px solid ${N.border};border-radius:11px;padding:13px;display:flex;flex-direction:column;gap:10px;box-shadow:${shadow.sm};">
      <div style="display:flex;align-items:flex-start;gap:8px;">
        <span style="font-size:13.5px;font-weight:500;line-height:19px;flex-grow:1;text-wrap:pretty;">Regenerar o client Kubb depois do sync do spec</span>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;">
        ${badge(N.surface, N.muted, 'backend', N.b300)}
        ${badge(N.surface, N.muted, 'contrato', N.b300)}
      </div>
      <div style="height:1px;background:${N.b100};"></div>
      <div style="display:flex;align-items:center;gap:10px;">
        <span style="display:inline-flex;align-items:center;gap:4px;font-size:11.5px;color:${N.warning700};font-weight:500;">${ico.flag}Alta</span>
        <span style="display:inline-flex;align-items:center;gap:4px;font-size:11.5px;color:${N.muted};">${ico.clock}4h</span>
        <span style="margin-left:auto;">${av(22,9,N.brand,'#fff','GT')}</span>
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:8px;margin-top:10px;">
      ${cap('estado vazio')}
      <div style="background:${N.surface};border:1px dashed ${N.b300};border-radius:11px;padding:28px 20px;display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center;">
        <span style="color:${N.subtle};display:flex;">${ico.inbox}</span>
        <span style="font-size:13.5px;font-weight:600;">Nada para hoje</span>
        <span style="font-size:12.5px;line-height:17px;color:${N.muted};max-width:230px;">Quando alguém te atribuir uma tarefa com data de hoje, ela aparece aqui.</span>
        <span style="height:30px;padding:0 13px;border-radius:9px;background:${N.brand};color:#fff;font-size:13px;font-weight:500;display:inline-flex;align-items:center;margin-top:2px;">Criar tarefa</span>
      </div>
    </div>
  </div>
</div>`;

const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap">
  <style>
    body { margin: 0; font-family: "Geist", ui-sans-serif, system-ui, sans-serif; }
    a { color: ${N.brand}; text-decoration: none; }
    a:hover { color: ${N.brandH}; }
    .sec-title { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: ${N.muted}; margin: 0; }
    .cap { font-family: "Geist Mono", ui-monospace, monospace; font-size: 10px; color: ${N.muted}; }
    .card { background: ${N.surface}; border: 1px solid ${N.border}; border-radius: 12px; padding: 24px 26px; }
  </style>
</helmet>
<div style="background:${N.bg};color:${N.fg};padding:44px 48px 56px;display:flex;flex-direction:column;gap:38px;">

  <div style="display:flex;flex-direction:column;gap:5px;">
    <div style="font-size:26px;font-weight:600;letter-spacing:-0.02em;line-height:1.1;">Dados e feedback</div>
    <div style="font-size:14px;line-height:1.5;color:${N.muted};max-width:660px;">Badge, Avatar, Tabs, Tooltip, Progress, Alert, Toast, Card e Skeleton. Os exemplos usam o vocabulário real do produto — tarefa, label, contrato, board — porque componente medido com texto genérico esconde onde a linha quebra.</div>
  </div>

  <div style="display:grid;grid-template-columns:1.25fr 1fr;gap:22px;">
    <div style="display:flex;flex-direction:column;gap:14px;"><p class="sec-title">Badge, tag e prioridade</p><div class="card" style="flex-grow:1;">${badges}</div></div>
    <div style="display:flex;flex-direction:column;gap:14px;"><p class="sec-title">Avatar</p><div class="card" style="flex-grow:1;">${avatars}</div></div>
  </div>

  <div style="display:grid;grid-template-columns:1fr 1.25fr;gap:22px;">
    <div style="display:flex;flex-direction:column;gap:14px;"><p class="sec-title">Navegação e progresso</p><div class="card" style="flex-grow:1;">${nav}</div></div>
    <div style="display:flex;flex-direction:column;gap:14px;"><p class="sec-title">Alerta e toast</p><div class="card" style="flex-grow:1;display:flex;flex-direction:column;gap:14px;">${alerts}</div></div>
  </div>

  <div style="display:flex;flex-direction:column;gap:14px;">
    <p class="sec-title">Compostos — onde os primitivos se encontram</p>
    <div class="card">${composites}</div>
  </div>

</div>
</x-dc>
</body>
</html>
`;
await Bun.write('Dados.dc.html', html);
console.log('Dados.dc.html', html.length, 'bytes');
