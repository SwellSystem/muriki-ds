"use client"

/**
 * A árvore de arquivos do exercício (design/muriki-code/telas.py, arvore()).
 *
 * Recebe os caminhos (`src/solution.js`) e monta as pastas sozinha. O que veio do exercício e é só
 * leitura leva o cadeado; o que a pessoa criou leva o ponto verde e, no hover ou no foco, renomear
 * e excluir. Criar e renomear são um input na própria linha: ↵ confirma, Esc cancela.
 *
 * Só os callbacks: a validação do nome é do app. `onCreate` e `onRename` podem devolver uma
 * mensagem de erro (string): o input fica aberto e mostra a mensagem embaixo.
 */
import * as React from "react"
import {
  ArrowsInLineVerticalIcon,
  CaretDownIcon,
  CaretRightIcon,
  FileIcon,
  FilePlusIcon,
  FolderIcon,
  LockIcon,
  PencilSimpleIcon,
  TrashIcon,
} from "@phosphor-icons/react"

import { useTranslate } from "@/lib/i18n"
import { cn } from "@/lib/utils"

import { ExerciseSection } from "./exercise-workspace"

export interface ExerciseFile {
  /** O caminho relativo à raiz do exercício, ex.: "src/solution.js". */
  path: string
  /** Veio do exercício e não se edita: cadeado, cinza. */
  readOnly?: boolean
  /** A pessoa criou: ponto verde, e só estes renomeiam e excluem. */
  createdByUser?: boolean
}

type Erro = string | void | undefined | null

export interface ExerciseFileTreeProps {
  files: ExerciseFile[]
  /** O caminho do arquivo aberto no editor. */
  selected?: string
  onSelect?: (path: string) => void
  /** Sem isto, o botão de novo arquivo some. Devolva uma mensagem para manter o input aberto. */
  onCreate?: (path: string) => Erro | Promise<Erro>
  onRename?: (from: string, to: string) => Erro | Promise<Erro>
  onDelete?: (path: string) => void
  /** A pasta de cima, ex.: o slug do exercício. Sem isto, os arquivos ficam na raiz. */
  rootLabel?: string
  /** O que o input de novo arquivo sugere, ex.: "src/utils.js". */
  createPlaceholder?: string
  className?: string
}

interface No {
  nome: string
  caminho: string
  arquivo?: ExerciseFile
  filhos: No[]
}

// pastas antes de arquivos, cada grupo em ordem alfabética
function montar(files: ExerciseFile[]): No[] {
  const raiz: No = { nome: "", caminho: "", filhos: [] }
  for (const file of files) {
    const partes = file.path.split("/").filter(Boolean)
    let atual = raiz
    partes.forEach((parte, i) => {
      const caminho = partes.slice(0, i + 1).join("/")
      const ultimo = i === partes.length - 1
      let filho = atual.filhos.find((f) => f.nome === parte && !f.arquivo === !ultimo)
      if (!filho) {
        filho = { nome: parte, caminho, arquivo: ultimo ? file : undefined, filhos: [] }
        atual.filhos.push(filho)
      }
      atual = filho
    })
  }
  const ordenar = (nos: No[]) => {
    nos.sort((a, b) => (!a.arquivo === !b.arquivo ? a.nome.localeCompare(b.nome) : a.arquivo ? 1 : -1))
    nos.forEach((n) => ordenar(n.filhos))
  }
  ordenar(raiz.filhos)
  return raiz.filhos
}

function pastas(nos: No[]): string[] {
  return nos.flatMap((n) => (n.arquivo ? [] : [n.caminho, ...pastas(n.filhos)]))
}

const RECUO = 12

export function ExerciseFileTree({
  files,
  selected,
  onSelect,
  onCreate,
  onRename,
  onDelete,
  rootLabel,
  createPlaceholder = "src/utils.js",
  className,
}: ExerciseFileTreeProps) {
  const t = useTranslate()
  const arvore = React.useMemo(() => montar(files), [files])
  const [fechadas, setFechadas] = React.useState<Set<string>>(() => new Set())
  const [raizFechada, setRaizFechada] = React.useState(false)
  const [criando, setCriando] = React.useState(false)
  const [renomeando, setRenomeando] = React.useState<string | null>(null)

  const alternar = (caminho: string) =>
    setFechadas((atual) => {
      const nova = new Set(atual)
      if (nova.has(caminho)) nova.delete(caminho)
      else nova.add(caminho)
      return nova
    })

  const base = rootLabel ? 1 : 0

  const linhas = (nos: No[], nivel: number): React.ReactNode[] =>
    nos.flatMap((no) => {
      const recuo = 10 + nivel * RECUO
      if (!no.arquivo) {
        const aberta = !fechadas.has(no.caminho)
        return [
          <li key={`d:${no.caminho}`}>
            <button
              type="button"
              aria-expanded={aberta}
              onClick={() => alternar(no.caminho)}
              style={{ paddingLeft: recuo }}
              className="flex h-7 w-full items-center gap-1.5 rounded-md pr-1.5 text-left text-[12.5px] text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
            >
              <Caret aberta={aberta} />
              <FolderIcon aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate">{no.nome}</span>
            </button>
          </li>,
          ...(aberta ? linhas(no.filhos, nivel + 1) : []),
        ]
      }
      const file = no.arquivo
      if (renomeando === file.path && onRename) {
        return [
          <NomeNaLinha
            key={`r:${file.path}`}
            recuo={recuo}
            inicial={file.path}
            rotulo={`${t("exercise_workspace.tree.rename")} ${no.nome}`}
            onConfirmar={(novo) => (novo === file.path ? undefined : onRename(file.path, novo))}
            onFechar={() => setRenomeando(null)}
          />,
        ]
      }
      const aberto = file.path === selected
      const editavel = file.createdByUser && (onRename || onDelete)
      return [
        <li
          key={`f:${file.path}`}
          className={cn(
            "group/arquivo flex h-7 items-center rounded-md",
            aberto ? "bg-primary-subtle text-primary-subtle-foreground" : "hover:bg-muted",
            file.readOnly && !aberto && "text-muted-foreground"
          )}
        >
          <button
            type="button"
            aria-current={aberto ? "true" : undefined}
            onClick={() => onSelect?.(file.path)}
            title={file.path}
            style={{ paddingLeft: recuo }}
            className="flex h-full min-w-0 flex-1 items-center gap-1.5 rounded-md pr-1.5 text-left text-[12.5px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
          >
            <span aria-hidden className="w-3 shrink-0" />
            <FileIcon aria-hidden className={cn("size-3.5 shrink-0", !aberto && "text-muted-foreground")} />
            <span className="truncate">{no.nome}</span>
            {file.createdByUser ? (
              <span className="ml-1 size-1.5 shrink-0 rounded-full bg-success">
                <span className="sr-only">{t("exercise_workspace.tree.created_by_user")}</span>
              </span>
            ) : null}
            {file.readOnly ? (
              <span className="ml-auto flex shrink-0" title={t("exercise_workspace.tree.read_only")}>
                <LockIcon aria-hidden className="size-3 text-muted-foreground" />
                <span className="sr-only">{t("exercise_workspace.tree.read_only")}</span>
              </span>
            ) : null}
          </button>
          {editavel ? (
            <span className="mr-1 flex shrink-0 items-center gap-0.5 opacity-0 group-hover/arquivo:opacity-100 group-focus-within/arquivo:opacity-100">
              {onRename ? (
                <AcaoDaArvore
                  rotulo={`${t("exercise_workspace.tree.rename")} ${no.nome}`}
                  onClick={() => setRenomeando(file.path)}
                  tamanho="size-[22px]"
                >
                  <PencilSimpleIcon />
                </AcaoDaArvore>
              ) : null}
              {onDelete ? (
                <AcaoDaArvore
                  rotulo={`${t("exercise_workspace.tree.delete")} ${no.nome}`}
                  onClick={() => onDelete(file.path)}
                  tamanho="size-[22px]"
                >
                  <TrashIcon />
                </AcaoDaArvore>
              ) : null}
            </span>
          ) : null}
        </li>,
      ]
    })

  const acoes = (
    <>
      {onCreate ? (
        <AcaoDaArvore rotulo={t("exercise_workspace.tree.new_file")} onClick={() => setCriando(true)}>
          <FilePlusIcon />
        </AcaoDaArvore>
      ) : null}
      <AcaoDaArvore
        rotulo={t("exercise_workspace.tree.collapse_all")}
        onClick={() => setFechadas(new Set(pastas(arvore)))}
      >
        <ArrowsInLineVerticalIcon />
      </AcaoDaArvore>
    </>
  )

  const conteudo = [
    ...linhas(arvore, base),
    criando && onCreate ? (
      <NomeNaLinha
        key="novo"
        recuo={10 + base * RECUO}
        inicial=""
        placeholder={createPlaceholder}
        rotulo={t("exercise_workspace.tree.new_file_name")}
        onConfirmar={onCreate}
        onFechar={() => setCriando(false)}
      />
    ) : null,
  ]

  return (
    <ExerciseSection title={t("exercise_workspace.tree.title")} end={acoes} divider={false} className={className}>
      <ul
        aria-label={t("exercise_workspace.tree.structure")}
        className="m-0 flex list-none flex-col gap-px px-1.5 pb-2"
      >
        {rootLabel ? (
          <>
            <li>
              <button
                type="button"
                aria-expanded={!raizFechada}
                onClick={() => setRaizFechada((v) => !v)}
                className="flex h-7 w-full items-center gap-1.5 rounded-md pr-1.5 pl-2.5 text-left text-[12.5px] font-semibold text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
              >
                <Caret aberta={!raizFechada} />
                <FolderIcon aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate">{rootLabel}</span>
              </button>
            </li>
            {raizFechada ? null : conteudo}
          </>
        ) : (
          conteudo
        )}
      </ul>
    </ExerciseSection>
  )
}

function Caret({ aberta }: { aberta: boolean }) {
  const Icone = aberta ? CaretDownIcon : CaretRightIcon
  return <Icone aria-hidden className="size-3 shrink-0 text-muted-foreground" />
}

function AcaoDaArvore({
  rotulo,
  onClick,
  tamanho = "size-6",
  children,
}: {
  rotulo: string
  onClick: () => void
  tamanho?: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={rotulo}
      title={rotulo}
      onClick={onClick}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35 [&_svg]:size-3.5",
        tamanho
      )}
    >
      {children}
    </button>
  )
}

function NomeNaLinha({
  recuo,
  inicial,
  placeholder,
  rotulo,
  onConfirmar,
  onFechar,
}: {
  recuo: number
  inicial: string
  placeholder?: string
  rotulo: string
  onConfirmar: (nome: string) => Erro | Promise<Erro>
  onFechar: () => void
}) {
  const t = useTranslate()
  const [valor, setValor] = React.useState(inicial)
  const [erro, setErro] = React.useState<string | null>(null)
  const enviando = React.useRef(false)
  const id = React.useId()

  const confirmar = async () => {
    const nome = valor.trim()
    if (!nome || enviando.current) return
    enviando.current = true
    try {
      const resultado = await onConfirmar(nome)
      if (typeof resultado === "string" && resultado) setErro(resultado)
      else onFechar()
    } finally {
      enviando.current = false
    }
  }

  return (
    <li className="flex flex-col gap-[3px] pt-0.5 pr-2 pb-1" style={{ paddingLeft: recuo }}>
      <span className="flex items-center gap-1.5">
        <span aria-hidden className="w-3 shrink-0" />
        <FileIcon aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />
        <input
          type="text"
          autoFocus
          aria-label={rotulo}
          aria-invalid={erro ? true : undefined}
          aria-describedby={`${id}-dica`}
          value={valor}
          placeholder={placeholder}
          spellCheck={false}
          onChange={(e) => {
            setValor(e.target.value)
            setErro(null)
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              void confirmar()
            } else if (e.key === "Escape") {
              e.preventDefault()
              onFechar()
            }
          }}
          onBlur={() => {
            if (!enviando.current) onFechar()
          }}
          className={cn(
            "h-6 min-w-0 flex-1 rounded-[5px] bg-card px-1.5 text-[12.5px] text-foreground-strong outline-none",
            erro ? "shadow-[inset_0_0_0_1.5px_var(--destructive)]" : "shadow-[inset_0_0_0_1.5px_var(--primary)]"
          )}
        />
      </span>
      <span
        id={`${id}-dica`}
        className={cn("pl-[38px] font-mono text-[10.5px]", erro ? "text-destructive" : "text-muted-foreground")}
      >
        {erro ?? t("exercise_workspace.tree.create_hint")}
      </span>
    </li>
  )
}
