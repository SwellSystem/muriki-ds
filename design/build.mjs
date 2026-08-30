// Re-gera as pranchas. Rode de dentro de design/.
// Alguns generators não são versionados (ver .gitignore) — são pulados em silêncio.
const gens = ['main','antes','raio','contorno','controles','dados','dark','botoes','badges','auth','selecao','tabela'];
for (const g of gens) {
  const f = `./gen-${g}.mjs`;
  if (!(await Bun.file(f).exists())) { console.log(`· gen-${g}.mjs ausente, pulando`); continue; }
  await import(f);
}
console.log('\npranchas geradas. Semeie o canvas com seed-canvas.mjs --out ../muriki-ds.html');
