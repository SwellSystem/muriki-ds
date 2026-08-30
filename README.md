# muriki-ds

O design system da Muriki, em duas metades que se alimentam:

| pasta | o que é |
| --- | --- |
| `design/` | as pranchas do canvas (`.dc.html`) e os generators que as produzem. É onde a decisão visual nasce e fica documentada. |
| `registry/` | os componentes de verdade, distribuídos como **registry do shadcn**. É o que entra no código. |
| `public/r/` | a saída do build — um `.json` por item, é isso que o `shadcn add` consome. |

## Consumir

No projeto que vai instalar (ex.: `muriki-platform`), declare o registry em `components.json`:

```json
{
  "registries": {
    "@muriki": "https://<host-do-registry>/r/{name}.json"
  }
}
```

E instale:

```bash
bunx shadcn@latest add @muriki/button @muriki/badge @muriki/row-actions
```

O `@muriki/theme` vem junto como dependência — ele injeta os tokens claro e escuro
no CSS do projeto e gera os mapeamentos `--color-*`, então `bg-tone-blue` e
`text-primary-subtle-foreground` passam a existir como classe do Tailwind.

## Itens

| item | tipo | o que traz |
| --- | --- | --- |
| `@muriki/theme` | `registry:theme` | papel quente + tinta fria, azul e amarelo da logo, nove matizes de badge, claro e escuro |
| `@muriki/button` | `registry:ui` | sete variantes, seis sem fill; raio = altura ÷ 5 |
| `@muriki/badge` | `registry:ui` | nove tons abafados, com ponto, contador e remoção |
| `@muriki/row-actions` | `registry:block` | barra de ferramentas de linha, só ícone, com tooltip e `aria-label` obrigatórios na API |

## Desenvolver

```bash
bun install
bun run registry:build     # gera public/r/*.json
```

Para testar a instalação antes de hospedar, sirva o `public/` e aponte o
`registries` do projeto consumidor para `http://localhost:PORTA/r/{name}.json`.
O `shadcn` **não** aceita `file://` — precisa ser HTTP.

Para regerar as pranchas do canvas:

```bash
cd design && bun build.mjs
```

## Decisões que o código carrega

Estão desenhadas e justificadas nas pranchas, e implementadas aqui:

- **Botão não tem fill.** Seis variantes vivem de filete, tinta e fundo tênue.
  `solid` é exceção declarada — uma por tela. Cor cheia é linguagem de estado
  (badge), não de ação.
- **Raio é razão, não constante.** Controle usa altura ÷ 5 (6px no padrão de 32);
  recipiente fica em 14px. O contraste entre os dois é o que lê como intenção.
- **Duas famílias de neutro.** Superfície quente (hue 82-100), tinta fria
  (hue ~250). Não existe cinza puro no sistema.
- **Dark não é o claro invertido.** O sólido troca de polaridade, o tingido troca
  de andar (fundo L 28%, tinta L 84%) e o campo fica mais escuro que o card.
- **Ícone sem rótulo é adivinhação.** `RowAction.label` é obrigatório no tipo:
  vira tooltip e `aria-label` ao mesmo tempo.
