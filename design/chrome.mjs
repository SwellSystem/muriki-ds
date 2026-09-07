// Onde mora o Chrome. O binário não tem o mesmo nome nos dois sistemas, e
// os generators de captura rodam tanto no mac de quem desenha quanto no
// Linux de quem automatiza.
import { existsSync } from 'node:fs';

const CANDIDATOS = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
];

export function acharChrome() {
  const bin = CANDIDATOS.find(existsSync) ?? Bun.which('google-chrome') ?? Bun.which('chromium');
  if (!bin) {
    console.error('Chrome não encontrado. Instale o Google Chrome ou aponte CHROME_BIN.');
    process.exit(1);
  }
  return process.env.CHROME_BIN ?? bin;
}
