// Atualiza a cópia do pdfcn em typecheck/pdfcn a partir do registry público.
// Só para o tsc do muriki-ds; quem instala recebe os arquivos do próprio pdfcn.
import { mkdir, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"

const ITENS = [
  "takumi/utils", "takumi/theme-provider", "takumi/text", "takumi/heading", "takumi/divider",
  "takumi/stack", "takumi/key-value", "takumi/alert", "takumi/badge", "takumi/card",
  "takumi/table", "takumi/data-table", "takumi/graph", "takumi/page-header", "takumi/page-footer",
  "takumi/page-number", "takumi/section", "takumi/keep-together", "theme-professional",
]
for (const nome of ITENS) {
  const item = await (await fetch(`https://pdfcn.dev/r/${nome}.json`)).json()
  for (const f of item.files) {
    const alvo = join("typecheck/pdfcn", (f.target ?? f.path).replace(/^registry\//, ""))
    await mkdir(dirname(alvo), { recursive: true })
    // código de terceiro: os tipos valem para quem importa, os erros de estilo dele não
    await writeFile(alvo, `// @ts-nocheck — pdfcn vendorizado, ver typecheck/pdfcn/README.md\n${f.content}`)
  }
  console.log("ok", nome)
}
