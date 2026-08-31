<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="design/logo-dark.svg">
    <img src="design/logo.svg" alt="Muriki" width="140">
  </picture>
</p>

<h1 align="center">muriki-ds</h1>

<p align="center">Papel quente, tinta fria — o design system da Muriki.</p>

---

Duas metades que se alimentam:

| pasta | o que é |
| --- | --- |
| `design/` | as pranchas do canvas (`.dc.html`) e os generators que as produzem. É onde a decisão visual nasce e fica documentada. |
| `registry/` | os componentes de verdade, distribuídos como **registry do shadcn**. É o que entra no código. |
| `public/r/` | a saída do build — um `.json` por item, gerado pela Action e servido pelo Pages. É isso que o `shadcn add` consome. |

## Consumir

No projeto que vai instalar (ex.: `muriki-platform`), declare o registry em `components.json`:

```json
{
  "registries": {
    "@muriki": "https://swellsystem.github.io/muriki-ds/r/{name}.json"
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

## Exemplos

Botão — `outline` é o padrão; Base UI por baixo, então troca de elemento é
`render`, não `asChild`:

```tsx
import { Button } from "@/components/ui/button"

<Button>Salvar rascunho</Button>
<Button variant="primary">Adicionar linha</Button>
<Button variant="solid">Publicar</Button>              {/* exceção: uma por tela */}
<Button variant="ghost" size="icon" aria-label="Copiar"><Copy /></Button>
<Button variant="link" render={<a href="/planos" />}>Ver planos</Button>
```

Badge — nove tons, e os três acessórios: ponto, contador e remoção. O
tracejado é o sinal de ausência do sistema:

```tsx
import { Badge } from "@/components/ui/badge"

<Badge tone="green" dot>Ativo</Badge>
<Badge tone="blue" count>12</Badge>
<Badge variant="dashed">Sem responsável</Badge>
<Badge tone="purple" onRemove={tirarFiltro} removeLabel="Remover filtro Design">Design</Badge>
```

ViewToggle — controlado, genérico sobre o tipo do valor, `ariaLabel`
obrigatório no tipo:

```tsx
import { ViewToggle } from "@/components/ui/view-toggle"

const [view, setView] = useState<"lista" | "board">("lista")

<ViewToggle
  value={view}
  onChange={setView}
  ariaLabel="Modo de visualização"
  options={[
    { value: "lista", label: "Lista" },
    { value: "board", label: "Board" },
  ]}
/>
```

RowActions — a linha precisa da classe `group/row` (é o hover dela que
revela a barra), e `label` é obrigatório em cada ação:

```tsx
import { RowActions } from "@/components/row-actions"

<tr className="group/row">
  {/* ...células... */}
  <td>
    <RowActions
      actions={[
        { id: "editar", label: "Editar", icon: PencilSimple, onSelect: editar, shortcut: "E" },
        { id: "duplicar", label: "Duplicar", icon: Copy, onSelect: duplicar },
        { id: "excluir", label: "Excluir", icon: Trash, onSelect: excluir, destructive: true },
      ]}
    />
  </td>
</tr>
```

Controles de formulário — Base UI, API controlada:

```tsx
<Switch checked={ativo} onCheckedChange={setAtivo} />
<Checkbox checked={selecionado} onCheckedChange={setSelecionado} indeterminate={parcial} />
<Progress value={62} />
```

Toaster — monte uma vez no layout e dispare com o `toast` do sonner; o tema
vem do seu provider, o componente não adivinha:

```tsx
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"

<Toaster theme={theme} />

toast.success("Linha publicada")
toast.error("Sem conexão — nada foi salvo")
```

## Itens

| item | tipo | o que traz |
| --- | --- | --- |
| `@muriki/theme` | `registry:theme` | papel quente + tinta fria, azul e amarelo da logo, nove matizes de badge, claro e escuro |
| `@muriki/button` | `registry:ui` | sete variantes, seis sem fill; raio = altura ÷ 5; `solid` é exceção declarada — uma por tela |
| `@muriki/badge` | `registry:ui` | nove tons abafados, com ponto, contador e remoção |
| `@muriki/view-toggle` | `registry:ui` | controle segmentado com pill animada, genérico sobre o tipo do valor |
| `@muriki/switch` | `registry:ui` | trilho como encaixe, thumb como objeto elevado — não inverte no escuro, sobe por luz |
| `@muriki/checkbox` | `registry:ui` | vazio é encaixe, marcado é chapado — numa caixa de 16px, relevo vira sujeira |
| `@muriki/progress` | `registry:ui` | trilho como encaixe, preenchimento da marca dentro do sulco — sem sombra |
| `@muriki/sonner` | `registry:ui` | toaster vestido com a paleta: info neutro, success e warning tingidos, error sólido |
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
- **A luz vem de cima nos dois temas.** O que muda é o lado do plano: no claro a
  peça está por cima e desce sombra; no escuro ela assenta como encaixe, com o
  fio de luz no topo. E a peça selecionada é sempre a cor da própria página —
  papel no claro, grafite no escuro.
- **Superfície vira encaixe; objeto, não.** O trilho de switch e progress é
  encaixe. O thumb é objeto — não carrega nada e como encaixe sumiria: fica
  elevado nos dois temas, subindo por sombra no claro e por luz no escuro.
- **Ícone sem rótulo é adivinhação.** `RowAction.label` é obrigatório no tipo:
  vira tooltip e `aria-label` ao mesmo tempo.
