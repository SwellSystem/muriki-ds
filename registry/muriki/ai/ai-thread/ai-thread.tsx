"use client"

/**
 * Muriki AI — A thread.
 *
 * O CONTÊINER DA CONVERSA, e o que ele resolve é uma coisa só: A ROLAGEM.
 * Mensagem, raciocínio e chamada de ferramenta já sabem se desenhar; o que
 * nenhum deles sabe é o que fazer quando o texto cresce embaixo de quem
 * está lendo.
 *
 * A REGRA DA ÂNCORA. Enquanto a resposta chega, a página desce sozinha —
 * mas SÓ SE VOCÊ JÁ ESTAVA NO FIM. Se você rolou para cima para reler algo,
 * a thread para de te arrastar e acende o botão de voltar. É a diferença
 * entre uma conversa que acompanha você e uma que te empurra: rolar para
 * cima é um pedido explícito de "quero ficar aqui", e nenhum token novo
 * tem o direito de desfazer isso.
 *
 * A MEDIDA VIVE AQUI. O turno do assistente limita o próprio corpo em 68ch,
 * mas quem centraliza a coluna e dá a mesma margem aos dois lados é a
 * thread — senão cada turno decidiria a própria largura e a conversa
 * ficaria torta. `--ai-thread-measure` deixa o app apertar ou alargar.
 *
 * O COMPOSER É DA THREAD, não da página. Ele fica no pé, fora da rolagem,
 * e o texto passa por baixo de um véu do próprio fundo — sem véu, a última
 * linha encosta no campo e a conversa parece cortada.
 *
 * A thread OCUPA A ALTURA DO PAI (h-full min-h-0). Numa tela cheia, dê
 * `h-dvh` ao pai; num painel, a altura do painel.
 */
import * as React from "react"
import { ArrowDown } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAiLabel } from "@/components/ai/ai-labels"

export interface AiThreadProps {
  /** Os turnos, em ordem. Vazio mostra o convite. */
  children?: React.ReactNode
  /** O campo, no pé da thread e fora da rolagem. */
  composer?: React.ReactNode
  /**
   * O que aparece quando não há turno nenhum. Sem isto, o convite padrão
   * do i18n (`ai.thread.empty_title` / `ai.thread.empty_hint`).
   */
  empty?: React.ReactNode
  /**
   * Resposta em curso. A thread só desce sozinha durante o streaming se a
   * âncora estiver presa — ver a regra acima.
   */
  streaming?: boolean
  /** Cabeçalho fixo acima da rolagem: título da conversa, ações, modelo. */
  header?: React.ReactNode
  className?: string
}

/** A que distância do fim ainda se considera "no fim", em px. Uma linha e
 *  meia de texto: o bastante para o arredondamento do navegador e para um
 *  arrasto de um pixel não soltar a âncora. */
const BOTTOM_SLACK = 24

function AiThread({
  children,
  composer,
  empty,
  streaming = false,
  header,
  className,
}: AiThreadProps) {
  const label = useAiLabel()
  const viewportRef = React.useRef<HTMLDivElement>(null)
  const contentRef = React.useRef<HTMLDivElement>(null)
  /** A âncora: presa = a thread acompanha o fim. Vive num ref porque o
   *  observador de tamanho lê o valor a cada quadro do streaming, e um
   *  estado daria um render por token. O estado abaixo é só para o botão. */
  const stuckRef = React.useRef(true)
  const [atBottom, setAtBottom] = React.useState(true)
  const isEmpty = React.Children.count(children) === 0

  const scrollToBottom = React.useCallback((behavior: ScrollBehavior = "smooth") => {
    const el = viewportRef.current
    if (!el) return
    stuckRef.current = true
    setAtBottom(true)
    el.scrollTo({ top: el.scrollHeight, behavior })
  }, [])

  // Quem move a âncora é a rolagem, e só ela. Rolar até o fim prende de
  // novo — voltar ao fim é o mesmo gesto de dizer "pode continuar".
  React.useEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const onScroll = () => {
      const distance = el.scrollHeight - el.scrollTop - el.clientHeight
      const stuck = distance <= BOTTOM_SLACK
      stuckRef.current = stuck
      setAtBottom((prev) => (prev === stuck ? prev : stuck))
    }
    onScroll()
    el.addEventListener("scroll", onScroll, { passive: true })
    return () => el.removeEventListener("scroll", onScroll)
  }, [])

  // O conteúdo cresce por fora do React: token que chega, imagem que
  // carrega, raciocínio que abre. Por isso quem dispara a descida é o
  // tamanho do conteúdo, não a lista de turnos.
  React.useEffect(() => {
    const el = viewportRef.current
    const content = contentRef.current
    if (!el || !content || typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(() => {
      if (!stuckRef.current) return
      // "auto", não "smooth": durante o streaming uma animação por token
      // vira tremor, e o navegador nem termina uma antes da próxima.
      el.scrollTo({ top: el.scrollHeight, behavior: "auto" })
    })
    observer.observe(content)
    return () => observer.disconnect()
  }, [])

  // Entrar na conversa é entrar no fim dela: o histórico já aconteceu.
  React.useEffect(() => {
    scrollToBottom("auto")
    // eslint-disable-next-line react-hooks/exhaustive-deps -- uma vez, na montagem
  }, [])

  return (
    <div
      data-slot="ai-thread"
      data-streaming={streaming ? "" : undefined}
      className={cn(
        "relative flex h-full min-h-0 flex-col",
        // A medida da conversa. Os turnos leem daqui, não o contrário.
        "[--ai-thread-measure:72ch]",
        className
      )}
    >
      {header ? <div className="shrink-0">{header}</div> : null}

      <div
        ref={viewportRef}
        data-slot="ai-thread-viewport"
        className={cn(
          "min-h-0 flex-1 overflow-y-auto overscroll-contain",
          // A barra de rolagem some enquanto o ponteiro está longe: numa
          // página de texto ela é ruído, e o botão do canto já diz onde
          // você está.
          "[scrollbar-color:var(--border)_transparent] [scrollbar-width:thin]"
        )}
      >
        <div
          ref={contentRef}
          className={cn(
            "mx-auto flex w-full flex-col gap-6",
            "max-w-[var(--ai-thread-measure)] px-4 pt-6 pb-4 sm:px-6",
            isEmpty && "h-full justify-center pb-10"
          )}
        >
          {isEmpty ? (empty ?? <AiThreadEmpty />) : children}
        </div>
      </div>

      {composer ? (
        <div data-slot="ai-thread-foot" className="relative shrink-0">
          {/* O véu: o texto some no fundo antes de encostar no campo. É o
              mesmo `--background` da página, então funciona nos dois temas
              sem cor nova. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -top-8 h-8 bg-gradient-to-b from-transparent to-background"
          />
          {/* O botão nasce colado no topo do pé (`bottom-full`), então ele
              sobe junto quando o campo cresce — sem medir altura nenhuma. */}
          <ToBottomButton
            hidden={atBottom}
            label={label("ai.thread.to_bottom")}
            onSelect={() => scrollToBottom()}
            className="absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2"
          />
          <div className="mx-auto w-full max-w-[var(--ai-thread-measure)] px-4 pb-4 sm:px-6">
            {composer}
          </div>
        </div>
      ) : (
        <ToBottomButton
          hidden={atBottom}
          label={label("ai.thread.to_bottom")}
          onSelect={() => scrollToBottom()}
          className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2"
        />
      )}
    </div>
  )
}

/**
 * O botão de voltar ao fim. Não desmonta quando a âncora prende: ele
 * desaparece por opacidade e escala, e volta pelo mesmo caminho. Um botão
 * que some do DOM pisca; este some do olho e continua no lugar.
 */
function ToBottomButton({
  hidden,
  label,
  onSelect,
  className,
}: {
  hidden: boolean
  label: string
  onSelect: () => void
  className?: string
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label={label}
      title={label}
      tabIndex={hidden ? -1 : 0}
      aria-hidden={hidden || undefined}
      onClick={onSelect}
      className={cn(
        "size-8 rounded-full bg-card shadow-md transition-all duration-200",
        hidden
          ? "pointer-events-none translate-y-1 scale-90 opacity-0"
          : "pointer-events-auto translate-y-0 scale-100 opacity-100",
        className
      )}
    >
      <ArrowDown aria-hidden size={15} weight="bold" />
    </Button>
  )
}

/**
 * O convite. Não é uma tela de erro nem um placeholder cinza: é a primeira
 * fala da conversa, e por isso usa a mesma tinta do resto.
 */
function AiThreadEmpty({
  title,
  hint,
  media,
  children,
  className,
}: {
  title?: React.ReactNode
  hint?: React.ReactNode
  /** Logo, mascote, o que o app quiser acima do texto. */
  media?: React.ReactNode
  /** Sugestões, atalhos — o que se pode apertar para começar. */
  children?: React.ReactNode
  className?: string
}) {
  const label = useAiLabel()
  return (
    <div
      data-slot="ai-thread-empty"
      className={cn("flex flex-col items-center gap-3 text-center", className)}
    >
      {media ? <div className="mb-1">{media}</div> : null}
      <h2 className="text-[15px] font-medium tracking-tight text-foreground-strong">
        {title ?? label("ai.thread.empty_title")}
      </h2>
      <p className="max-w-[46ch] text-[13px] leading-relaxed text-muted-foreground">
        {hint ?? label("ai.thread.empty_hint")}
      </p>
      {children ? <div className="mt-3">{children}</div> : null}
    </div>
  )
}

export { AiThread, AiThreadEmpty }
