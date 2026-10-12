/**
 * A prévia ao vivo do primeiro acesso (CA4b): o app do Platform em miniatura, montando-se enquanto
 * a pessoa digita. A barra de endereço mostra `platform.muriki.app/<slug>`; a barra lateral, o
 * avatar do workspace (a sigla na cor estável do nome, workspaceInitials e workspaceTone) e o nome;
 * o palco, a saudação com o @usuário. Campo vazio vira um placeholder discreto.
 *
 * O resto do app são linhas e blocos de esqueleto, sem nome: as funcionalidades ainda não foram
 * definidas e a prévia não promete nada. Esqueleto parado, sem a varredura do Skeleton, porque
 * aqui nada está carregando.
 *
 * É decorativa: `aria-hidden`, nada focável, sem clique. O leitor de tela já tem os campos.
 */
import { useTranslate } from "@/lib/i18n"
import { cn } from "@/lib/utils"

import { workspaceInitials, workspaceTone, type WorkspaceTone } from "./handles"

// os tons do Badge, escritos por inteiro para o Tailwind achar as classes
const TOM: Record<WorkspaceTone, string> = {
  blue: "bg-tone-blue text-tone-blue-foreground",
  cyan: "bg-tone-cyan text-tone-cyan-foreground",
  green: "bg-tone-green text-tone-green-foreground",
  yellow: "bg-tone-yellow text-tone-yellow-foreground",
  orange: "bg-tone-orange text-tone-orange-foreground",
  red: "bg-tone-red text-tone-red-foreground",
  pink: "bg-tone-pink text-tone-pink-foreground",
  purple: "bg-tone-purple text-tone-purple-foreground",
}

// larguras variadas: lê como lista, não como régua. No escuro o rail é quase o sunken: as linhas
// dele sobem para o muted
const LINHAS = ["w-[62%]", "w-[48%]", "w-[70%]", "w-[40%]"]

export interface WorkspacePreviewProps {
  workspaceName: string
  slug: string
  /** Sem ela, a saudação fica sem @. */
  username?: string
  /** O endereço antes do slug. Padrão: `platform.muriki.app/`. */
  urlPrefix?: string
  className?: string
}

export function WorkspacePreview({
  workspaceName,
  slug,
  username,
  urlPrefix = "platform.muriki.app/",
  className,
}: WorkspacePreviewProps) {
  const t = useTranslate()
  const nome = workspaceName.trim()
  const tom = workspaceTone(nome)
  const sigla = workspaceInitials(nome)

  return (
    <div
      aria-hidden
      data-slot="workspace-preview"
      className={cn(
        "pointer-events-none overflow-hidden rounded-[var(--radius-float)] bg-card shadow-float ring-1 ring-border select-none",
        className
      )}
    >
      {/* a moldura da janela: os três pontos e a barra de endereço */}
      <div className="flex h-10 items-center gap-3 border-b border-divider px-3.5">
        <div className="flex w-12 shrink-0 gap-1.5">
          <span className="size-2.5 rounded-full bg-sunken" />
          <span className="size-2.5 rounded-full bg-sunken" />
          <span className="size-2.5 rounded-full bg-sunken" />
        </div>
        <div className="mx-auto flex h-6 min-w-0 max-w-[80%] items-center rounded-md bg-sunken px-3 font-mono text-[11px] text-muted-foreground">
          <span className="truncate">
            {urlPrefix}
            <span className={slug ? "text-foreground-strong" : "text-muted-foreground/60"}>
              {slug || t("platform.identity.preview.slug_placeholder")}
            </span>
          </span>
        </div>
        <div className="w-12 shrink-0" />
      </div>

      <div className="flex h-[22rem]">
        {/* a barra lateral: o workspace em cima e os itens, sem nome */}
        <div className="flex w-[38%] shrink-0 flex-col gap-5 bg-rail px-3 py-3.5 shadow-[2px_0_10px_-7px_rgba(0,0,0,0.30)] dark:shadow-[2px_0_12px_-7px_rgba(0,0,0,0.7)]">
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-[8px] text-[11.5px] font-semibold",
                tom ? TOM[tom] : "border border-dashed border-input"
              )}
            >
              {sigla}
            </span>
            <span
              className={cn(
                "truncate text-[13px] font-semibold",
                nome ? "text-foreground-strong" : "font-medium text-muted-foreground/60"
              )}
            >
              {nome || t("platform.identity.preview.name_placeholder")}
            </span>
          </div>
          <div className="flex flex-col gap-3.5 px-1">
            {LINHAS.map((largura) => (
              <div key={largura} className="flex items-center gap-2.5">
                <span className="size-3.5 shrink-0 rounded-[4px] bg-sunken dark:bg-muted" />
                <span className={cn("h-2 rounded-full bg-sunken dark:bg-muted", largura)} />
              </div>
            ))}
          </div>
        </div>

        {/* o palco: a saudação e blocos de esqueleto */}
        <div className="flex min-w-0 flex-1 flex-col gap-4 bg-background p-5">
          <p className="truncate text-[17px] leading-6 font-semibold tracking-[-0.01em] text-foreground-strong">
            {username
              ? t("platform.identity.preview.greeting", { username: `@${username}` })
              : t("platform.identity.preview.greeting_anonymous")}
          </p>
          <span className="-mt-1 h-2 w-2/5 rounded-full bg-sunken" />
          <div className="grid grid-cols-2 gap-3">
            {[0, 1].map((i) => (
              <div key={i} className="flex flex-col gap-2.5 rounded-lg bg-card p-3 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                <span className="h-2 w-3/5 rounded-full bg-sunken" />
                <span className="h-5 w-2/5 rounded-[6px] bg-sunken" />
              </div>
            ))}
          </div>
          <div className="flex flex-1 flex-col gap-3 rounded-lg bg-card p-3 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            {["w-[72%]", "w-[54%]", "w-[64%]"].map((largura) => (
              <span key={largura} className={cn("h-2 rounded-full bg-sunken", largura)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
