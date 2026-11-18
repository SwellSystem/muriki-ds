/**
 * Muriki Toaster.
 *
 * A PÍLULA: embaixo no centro, fundo de cartão, e o tipo dito pelo SELO — o
 * ícone num círculo no tom claro do tipo, como nos badges (info cinza,
 * sucesso verde, atenção laranja, erro vermelho, carregando azul). A cor fica
 * só no selo e na ação; o corpo é sempre o cartão, então quatro avisos
 * empilhados não viram um arco-íris.
 *
 * O que o Sonner já faz e aqui só ganha roupa: empilha (a mais nova na frente,
 * as outras espiando atrás, menores), abre a pilha no hover ou no foco e pausa
 * o tempo, e TROCA NO LUGAR pelo id — `toast.loading("Salvando…")` seguido de
 * `toast.success("Salvo", { id })` é o mesmo aviso mudando de selo e de texto.
 *
 * A largura acompanha o texto (a pílula estica quando "Salvando…" vira
 * "Tarefa salva"): `w-fit` centrado, e `interpolate-size` deixa a largura
 * animar onde o navegador já sabe (no resto, ela só troca). Sem descrição é
 * pílula redonda; com descrição vira cartão de 22px.
 *
 * `toast()` sem tipo sai sem selo, só o texto: serve ao aviso curtíssimo
 * ("Copiado"). Para o selo cinza, `toast.info()`.
 *
 * Erro com ação ("Tentar") não deve sumir sozinho: quem chama passa
 * `duration: Infinity`. Com uma barra embaixo no centro (as ações da seleção
 * da tabela), passe `offset` para a pilha subir acima dela.
 *
 * Não decide o tema: passe `theme` como prop, do seu provider. Assim o
 * componente não conhece a infraestrutura do app que o hospeda.
 */
import { cn } from "@/lib/utils"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import {
  CheckCircleIcon,
  InfoIcon,
  WarningIcon,
  XCircleIcon,
  SpinnerIcon,
} from "@phosphor-icons/react"

/*
 * O MOVIMENTO, igual ao protótipo aprovado:
 * - a pílula entra e sai desfocando (o Sonner já anima posição e opacidade;
 *   aqui o filtro entra na mesma transição);
 * - quando o aviso troca no lugar (loading → success), o ícone, o título e a
 *   descrição chegam desfocados. O truque: cada tipo usa uma keyframe de NOME
 *   diferente com o mesmo desenho; trocar o nome da animação faz ela rodar de
 *   novo, então mudar o tipo reanima o conteúdo sem remontar nada.
 * Com "reduzir movimento", tudo vira troca simples.
 */
const TYPES = ["default", "info", "success", "warning", "error", "loading"]
const MOTION_CSS =
  TYPES.map(
    (t) =>
      `@keyframes muriki-toast-in-${t}{from{opacity:0;filter:blur(8px);transform:translateY(4px) scale(.96)}}` +
      `[data-sonner-toast][data-type="${t}"] :is([data-title],[data-description]${t === "loading" ? "" : ",[data-icon]>svg"}){animation:muriki-toast-in-${t} .42s cubic-bezier(.16,1,.3,1)}`
  ).join("") +
  `[data-sonner-toast][data-styled="true"]{transition-property:transform,opacity,height,width,border-radius,box-shadow,filter}` +
  `[data-sonner-toast][data-mounted="false"],[data-sonner-toast][data-removed="true"]{filter:blur(10px)}` +
  `@media (prefers-reduced-motion:reduce){[data-sonner-toast] :is([data-title],[data-description],[data-icon]>svg){animation:none}[data-sonner-toast]{filter:none!important}}`

const Toaster = ({ className, ...props }: ToasterProps) => {
  return (
    <>
    <style>{MOTION_CSS}</style>
    <Sonner
      className={cn("toaster group", className)}
      position="bottom-center"
      visibleToasts={3}
      gap={8}
      icons={{
        success: <CheckCircleIcon weight="fill" className="size-[15px]" />,
        info: <InfoIcon weight="fill" className="size-[15px]" />,
        warning: <WarningIcon weight="fill" className="size-[15px]" />,
        error: <XCircleIcon weight="fill" className="size-[15px]" />,
        loading: <SpinnerIcon className="size-[15px] animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--card)",
          "--normal-text": "var(--card-foreground)",
          "--normal-border": "transparent",
          "--width": "min(100vw - 2rem, 25rem)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          // a pílula: largura do conteúdo; no centro fica centrada, no canto encosta nele. A altura o Sonner já anima, a largura anima com interpolate-size
          toast: cn(
            "cn-toast !right-0 !left-0 !mx-auto data-[x-position=right]:!mr-0 data-[x-position=left]:!ml-0 !w-fit !max-w-[var(--width)] !items-center !gap-2.5 !rounded-full !p-1.5 !pr-3",
            "!shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--foreground)_10%,transparent),var(--float)]",
            "[interpolate-size:allow-keywords] !duration-[400ms]",
            // com descrição, cartão: cantos de 22px e o selo no alto
            "has-[[data-description]]:!items-start has-[[data-description]]:!rounded-[22px] has-[[data-description]]:!p-2.5 has-[[data-description]]:!pr-3.5",
            // o selo: o ícone num círculo no tom do tipo
            "[&_[data-icon]]:!m-0 [&_[data-icon]]:!grid [&_[data-icon]]:!size-7 [&_[data-icon]]:!shrink-0 [&_[data-icon]]:!place-content-center [&_[data-icon]]:!place-items-center [&_[data-icon]]:rounded-full [&_[data-icon]_svg]:!m-0",
            "[&_[data-icon]]:bg-[var(--seal-bg)] [&_[data-icon]]:text-[var(--seal-fg)] [&_[data-icon]]:transition-colors [&_[data-icon]]:duration-300",
            "[--seal-bg:var(--tone-gray)] [--seal-fg:var(--tone-gray-foreground)] [--seal-ink:var(--tone-gray-foreground)]",
            "has-[[data-description]]:[&_[data-content]]:pt-1"
          ),
          title: "!text-sm !leading-5 !font-medium !whitespace-nowrap !text-foreground-strong",
          description: "!line-clamp-2 !max-w-[18.5rem] !text-[13px] !leading-[18px] !text-muted-foreground",
          // a ação no tom do selo, em pílula
          actionButton:
            "!h-7 !rounded-full !border-0 !bg-[var(--seal-bg)] !px-3 !text-[12.5px] !font-medium !text-[var(--seal-ink)] hover:!brightness-95",
          success: "[--seal-bg:var(--tone-green)] [--seal-fg:var(--tone-green-dot)] [--seal-ink:var(--tone-green-foreground)]",
          warning: "[--seal-bg:var(--tone-orange)] [--seal-fg:var(--tone-orange-dot)] [--seal-ink:var(--tone-orange-foreground)]",
          error: "[--seal-bg:var(--tone-red)] [--seal-fg:var(--tone-red-dot)] [--seal-ink:var(--tone-red-foreground)]",
          info: "[--seal-bg:var(--tone-gray)] [--seal-fg:var(--tone-gray-foreground)] [--seal-ink:var(--tone-gray-foreground)]",
          loading: "[--seal-bg:var(--primary-subtle)] [--seal-fg:var(--primary)] [--seal-ink:var(--primary)]",
        },
      }}
      {...props}
    />
    </>
  )
}

export { Toaster }
