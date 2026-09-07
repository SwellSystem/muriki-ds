// Captura da tela de login para o README — feita de um app consumidor REAL
// rodando o item do registry (por padrão o muriki-poc em localhost:3000,
// na rota /login). Mesma honestidade de amostra dos blocos: o que aparece
// no README é o que o `shadcn add` entrega.
//
//   cd design && bun gen-login.mjs [url-do-consumidor]
//
// Gera ../.github/readme/tela-login-{clara,escura}.png em 2x.
// Requer o app consumidor de pé e o Chrome na máquina.
import { mkdirSync } from 'node:fs';

import { acharChrome } from './chrome.mjs';

const BASE = process.argv[2] ?? 'http://localhost:3000';
const W = 1180, H = 920;

const chrome = acharChrome();

const outDir = new URL('../.github/readme/', import.meta.url).pathname;
mkdirSync(outDir, { recursive: true });

for (const escuro of [false, true]) {
  const png = `${outDir}tela-login-${escuro ? 'escura' : 'clara'}.png`;
  const url = `${BASE}/login${escuro ? '?dark=1' : ''}`;
  const p = Bun.spawnSync([chrome, '--headless=new', '--disable-gpu', '--hide-scrollbars',
    '--force-device-scale-factor=2', '--virtual-time-budget=15000',
    `--window-size=${W},${H}`, `--screenshot=${png}`, url]);
  if (p.exitCode !== 0) { console.error(p.stderr.toString()); process.exit(1); }
  console.log(`login ${escuro ? 'escura' : 'clara'} → ${png}`);
}
