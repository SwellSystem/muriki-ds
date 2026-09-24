# pdfcn vendorizado (só typecheck)

Cópia das peças `@pdfcn/takumi/*` e do `@pdfcn/theme-professional` que os
itens de PDF do muriki-ds importam. Existe para o `tsc` do registry ter o que
resolver, como o `typecheck/utils.ts`. Não é item do registry: no projeto de
quem instala, estes arquivos vêm do pdfcn pelo CLI, e são eles que valem.

Atualizar: `bun run pdfcn:sync`.
