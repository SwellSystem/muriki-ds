// Amostragem dos blocos para o README — capturada de um app consumidor
// REAL rodando os itens do registry (por padrão o muriki-poc em
// localhost:3000, na rota /blocos, em modo sem cromo via ?chrome=0).
// Honestidade de amostra: o que aparece no README é o que o `shadcn add`
// entrega.
//
//   cd design && bun gen-blocos.mjs [url-do-consumidor]
//
// Gera ../.github/readme/bloco-{tabela,timeline,board}-{clara,escura}.png
// em 2x. Requer o app consumidor de pé e o Chrome na máquina.
import { mkdirSync } from 'node:fs';

import { acharChrome } from './chrome.mjs';

const CHROME = acharChrome();
const BASE = process.argv[2] ?? 'http://localhost:3000';
const VIEWS = [
  ['tabela', 580],
  ['timeline', 700],
  ['board', 640],
];

const outDir = new URL('../.github/readme/', import.meta.url).pathname;
mkdirSync(outDir, { recursive: true });

for (const [view, h] of VIEWS) {
  for (const escuro of [false, true]) {
    const png = `${outDir}bloco-${view}-${escuro ? 'escura' : 'clara'}.png`;
    const url = `${BASE}/blocos?view=${view}&chrome=0${escuro ? '&dark=1' : ''}`;
    // `--run-all-compositor-stages-before-draw` não é firula: sem ele o
    // board sai em branco de vez em quando — a foto é tirada antes do
    // primeiro paint e o PNG vira só o fundo.
    const p = Bun.spawnSync([CHROME, '--headless=new', '--disable-gpu', '--hide-scrollbars',
      '--run-all-compositor-stages-before-draw',
      '--force-device-scale-factor=2', '--virtual-time-budget=15000',
      `--window-size=1180,${h}`, `--screenshot=${png}`, url]);
    if (p.exitCode !== 0) { console.error(p.stderr.toString()); process.exit(1); }
    console.log(`bloco ${view} ${escuro ? 'escura' : 'clara'} → ${png}`);
  }
}
