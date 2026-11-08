// Monta um dos estudos do DS novo numa página só e abre no navegador.
//
//   cd design/ds-novo && bun ver.mjs            → faixas (o estudo aprovado)
//   cd design/ds-novo && bun ver.mjs elementos  → os elementos na linguagem
//
// O repo não tem o tailwindcss: na primeira vez ele é instalado numa pasta
// de trabalho fora do repo (/tmp/muriki-ds-novo), junto com a saída.

import { $ } from "bun"
import { mkdirSync, existsSync, writeFileSync, readFileSync } from "node:fs"
import { join, resolve } from "node:path"

const estudo = process.argv[2] ?? "faixas"
const aqui = import.meta.dir
const raiz = resolve(aqui, "../..")
const obra = "/tmp/muriki-ds-novo"
mkdirSync(obra, { recursive: true })

if (!existsSync(join(obra, "node_modules/tailwindcss"))) {
  await $`bun add -d tailwindcss@4 @tailwindcss/cli@4`.cwd(obra).quiet()
}

// o skeleton do tema mora no registry.json, como objeto CSS
const reg = JSON.parse(readFileSync(join(raiz, "registry.json"), "utf8"))
const css = (o) => Object.entries(o).map(([k, v]) => (typeof v === "object" ? `${k}{${css(v)}}` : `${k}:${v};`)).join("")
writeFileSync(join(obra, "skeleton.css"), css(reg.items.find((i) => i.name === "skeleton").css))

// o muriki.css importa "tailwindcss", que só resolve dentro da pasta de trabalho: vai copiado
// para lá, não importado do registry
writeFileSync(join(obra, "muriki.css"), readFileSync(join(raiz, "registry/muriki/theme/muriki.css")))

writeFileSync(
  join(obra, "in.css"),
  `@import "./muriki.css";
@import "./skeleton.css";
@import "${aqui}/faixas.css";
@custom-variant dark (&:is(.dark *));
@source "${raiz}/registry/muriki";
@source "${aqui}";
:root { --font-mono: "Geist Mono", ui-monospace, monospace; }
body { font-family: "Geist", system-ui, sans-serif; }
`
)

await $`bun build ${join(aqui, estudo + ".tsx")} --target browser --minify --define process.env.NODE_ENV='"production"' --outfile ${join(obra, "app.js")}`.cwd(raiz).quiet()
await $`bunx @tailwindcss/cli -i in.css -o out.css --minify`.cwd(obra).quiet()

const js = readFileSync(join(obra, "app.js"), "utf8").replaceAll("</script", "<\\/script")
const saida = join(obra, `${estudo}.html`)
writeFileSync(
  saida,
  `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Muriki · ${estudo}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>${readFileSync(join(obra, "out.css"), "utf8")}</style></head><body><div id="root"></div><script type="module">${js}</script></body></html>`
)
console.log(saida)
if (!process.env.SEM_ABRIR) await $`open ${saida}`
