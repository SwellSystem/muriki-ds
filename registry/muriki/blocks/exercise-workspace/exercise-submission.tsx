"use client"

/**
 * O resultado do "Enviar solução" (ExerciseSubmission): um Modal (diálogo no desktop, folha que sobe
 * no celular) que o app abre ao enviar e alimenta com o estado.
 *
 * - `running` e `sending`: os dois passos, rodar os testes ocultos no navegador e enviar com a
 *   explicação. Não fecha no meio.
 * - `result`: passou ou não, "X de Y testes", a skill demonstrada, as mudanças de nível (a escala
 *   se enche até o nível novo, discreta), o retorno da avaliação e a nota da explicação. Os testes
 *   ocultos mostram só o nome e o status, nunca o esperado.
 * - `error`: `rate_limit` (429, com a contagem até poder enviar de novo), `runner` (os ocultos não
 *   rodaram) e `network`.
 *
 * O texto fala da tarefa e da explicação, não da pessoa: "Arrays confirmado em Junior", "a
 * explicação mostra o porquê".
 */
import * as React from "react"
import { CheckIcon, ClockIcon, WarningIcon, XIcon } from "@phosphor-icons/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Modal, ModalBody, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from "@/components/ui/modal"
import { Spinner } from "@/components/ui/spinner"
import { useTranslate } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export type ExerciseLevel = "fundamentos" | "junior" | "pleno" | "senior"

const NIVEIS: ExerciseLevel[] = ["fundamentos", "junior", "pleno", "senior"]

export interface ExerciseSubmissionResult {
  passed: boolean
  tests: { passed: number; total: number }
  /** Os testes ocultos: só o nome e o status. */
  items?: { name: string; status: "pass" | "fail" }[]
  /** A nota da explicação: 0, 1 ou 2; null quando não houve explicação. */
  understanding: 0 | 1 | 2 | null
  /** Um parágrafo de texto, nunca o gabarito. */
  feedback?: string
  /** O nome da skill do exercício, ex.: "Arrays". */
  skill?: string
  skillDemonstrated?: boolean
  /** O nome da competência já traduzido pelo app, ex.: "Arrays". */
  levelChanges?: { competency: string; from: ExerciseLevel | null; to: ExerciseLevel }[]
}

export interface ExerciseSubmissionError {
  kind: "rate_limit" | "runner" | "network"
  message?: string
  /** No rate_limit: em quantos segundos dá para enviar de novo. */
  retryIn?: number
}

export interface ExerciseSubmissionProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  state: "running" | "sending" | "result" | "error"
  result?: ExerciseSubmissionResult
  error?: ExerciseSubmissionError
  onRetry?: () => void
  /** "Voltar ao código". Sem isto, fecha. */
  onBackToCode?: () => void
  /** "Próxima etapa", quando passou. */
  onNext?: () => void
  /** A próxima etapa como link do roteador. Ganha de `onNext`. */
  nextRender?: React.ReactElement
  className?: string
}

export function ExerciseSubmission({
  open,
  onOpenChange,
  state,
  result,
  error,
  onRetry,
  onBackToCode,
  onNext,
  nextRender,
  className,
}: ExerciseSubmissionProps) {
  const t = useTranslate()
  const ocupado = state === "running" || state === "sending"
  const voltar = () => (onBackToCode ? onBackToCode() : onOpenChange(false))
  return (
    <Modal
      open={open}
      onOpenChange={(proximo) => {
        // enviando, não fecha: o resultado ainda vai chegar
        if (ocupado && !proximo) return
        onOpenChange(proximo)
      }}
    >
      <ModalContent showClose={!ocupado} className={cn("sm:max-w-[520px]", className)}>
        {ocupado ? (
          <Enviando state={state} />
        ) : state === "error" && error ? (
          <Erro error={error} onRetry={onRetry} onBack={voltar} />
        ) : result ? (
          <>
            <ModalHeader>
              <span className="flex items-center gap-3">
                <span
                  aria-hidden
                  className={cn(
                    "muriki-submit-pop flex size-10 shrink-0 items-center justify-center rounded-full",
                    result.passed ? "bg-tone-green text-tone-green-foreground" : "bg-destructive-subtle text-destructive-subtle-foreground"
                  )}
                >
                  {result.passed ? <CheckIcon weight="bold" className="size-5" /> : <XIcon weight="bold" className="size-5" />}
                </span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <ModalTitle>{result.passed ? t("exercise_workspace.submission.passed") : t("exercise_workspace.submission.failed")}</ModalTitle>
                  <ModalDescription>
                    {t("exercise_workspace.submission.tests", { passed: result.tests.passed, total: result.tests.total })}
                  </ModalDescription>
                </span>
              </span>
            </ModalHeader>
            <ModalBody className="flex flex-col gap-5">
              {result.skill && result.skillDemonstrated ? (
                <div className="flex items-center gap-2 text-[13px] text-foreground">
                  <Badge tone="green" dot>
                    {t("exercise_workspace.submission.skill_demonstrated", { skill: result.skill })}
                  </Badge>
                </div>
              ) : null}

              {result.levelChanges?.length ? (
                <ul aria-label={t("exercise_workspace.submission.levels")} className="m-0 flex list-none flex-col gap-2 p-0">
                  {result.levelChanges.map((mudanca, i) => (
                    <MudancaDeNivel key={`${mudanca.competency}-${i}`} {...mudanca} atraso={i} />
                  ))}
                </ul>
              ) : null}

              {!result.passed && result.items?.length ? (
                <section className="flex flex-col gap-2">
                  <Rotulo>{t("exercise_workspace.submission.hidden_tests")}</Rotulo>
                  <ul className="m-0 flex list-none flex-col gap-1 p-0">
                    {result.items.map((item) => (
                      <li key={item.name} className="flex items-start gap-2 text-[13px] leading-[18px]">
                        {item.status === "pass" ? (
                          <CheckIcon aria-hidden weight="bold" className="mt-0.5 size-3.5 shrink-0 text-success" />
                        ) : (
                          <XIcon aria-hidden weight="bold" className="mt-0.5 size-3.5 shrink-0 text-destructive" />
                        )}
                        <span className={item.status === "fail" ? "text-foreground-strong" : "text-foreground"}>
                          <span className="sr-only">
                            {item.status === "pass" ? t("exercise_workspace.tests.pass") : t("exercise_workspace.tests.fail")}:{" "}
                          </span>
                          {item.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <span className="text-xs text-muted-foreground">{t("exercise_workspace.submission.hidden_note")}</span>
                </section>
              ) : null}

              {result.feedback ? (
                <section className="flex flex-col gap-2">
                  <Rotulo>{t("exercise_workspace.submission.feedback")}</Rotulo>
                  <p className="m-0 text-sm leading-[22px] text-foreground">{result.feedback}</p>
                </section>
              ) : null}

              <Explicacao nota={result.understanding} />
            </ModalBody>
            <ModalFooter>
              <Button variant={result.passed ? "ghost" : "solid"} size="lg" onClick={voltar}>
                {t("exercise_workspace.submission.back")}
              </Button>
              {result.passed && (nextRender || onNext) ? (
                <Button variant="solid" size="lg" render={nextRender} onClick={nextRender ? undefined : onNext}>
                  {t("exercise_workspace.submission.next")}
                </Button>
              ) : null}
            </ModalFooter>
          </>
        ) : null}
      </ModalContent>
    </Modal>
  )
}

function Rotulo({ children }: { children: React.ReactNode }) {
  return <span className="font-mono text-[10px] font-medium tracking-[0.2em] text-muted-foreground uppercase">{children}</span>
}

function Enviando({ state }: { state: "running" | "sending" }) {
  const t = useTranslate()
  const passos = [
    { chave: "running", rotulo: t("exercise_workspace.submission.step_run") },
    { chave: "sending", rotulo: t("exercise_workspace.submission.step_send") },
  ] as const
  const atual = state === "running" ? 0 : 1
  return (
    <>
      <ModalHeader>
        <ModalTitle>{t("exercise_workspace.submission.sending_title")}</ModalTitle>
        <ModalDescription>{t("exercise_workspace.submission.sending_text")}</ModalDescription>
      </ModalHeader>
      <ModalBody>
        <ol className="m-0 flex list-none flex-col gap-3 p-0" aria-live="polite">
          {passos.map((p, i) => (
            <li key={p.chave} className="flex items-center gap-3 text-sm">
              <span className="flex size-6 shrink-0 items-center justify-center">
                {i < atual ? (
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <CheckIcon aria-hidden weight="bold" className="size-3" />
                  </span>
                ) : i === atual ? (
                  <Spinner className="size-5 text-primary" />
                ) : (
                  <span className="size-2 rounded-full bg-input" />
                )}
              </span>
              <span className={i > atual ? "text-muted-foreground" : "font-medium text-foreground-strong"}>{p.rotulo}</span>
            </li>
          ))}
        </ol>
      </ModalBody>
    </>
  )
}

function MudancaDeNivel({
  competency,
  from,
  to,
  atraso,
}: {
  competency: string
  from: ExerciseLevel | null
  to: ExerciseLevel
  atraso: number
}) {
  const t = useTranslate()
  const de = from ? NIVEIS.indexOf(from) : -1
  const ate = NIVEIS.indexOf(to)
  const subiu = ate > de
  return (
    <li className="flex flex-col gap-2 rounded-lg bg-primary-subtle px-3.5 py-3 text-primary-subtle-foreground">
      <span className="text-[13.5px] font-semibold">
        {t(subiu ? "exercise_workspace.submission.level_up" : "exercise_workspace.submission.level_set", {
          competency,
          level: t(`exercise_workspace.level.${to}`),
        })}
      </span>
      {/* a escala dos quatro níveis: o que já era fica cheio, o novo se enche depois (muriki-level-fill) */}
      <span className="flex items-center gap-2">
        <span className="flex gap-[3px]" aria-hidden>
          {NIVEIS.map((nivel, i) => (
            <span key={nivel} className="relative h-1.5 w-7 overflow-hidden rounded-[2px] bg-card">
              {i <= ate ? (
                <span
                  className={cn("absolute inset-0 bg-primary", i > de && "muriki-level-fill")}
                  style={i > de ? { animationDelay: `${600 + atraso * 250 + (i - de - 1) * 180}ms` } : undefined}
                />
              ) : null}
            </span>
          ))}
        </span>
        <span className="font-mono text-[11px]">
          {from ? `${t(`exercise_workspace.level.${from}`)} → ` : ""}
          {t(`exercise_workspace.level.${to}`)}
        </span>
      </span>
    </li>
  )
}

function Explicacao({ nota }: { nota: 0 | 1 | 2 | null }) {
  const t = useTranslate()
  const texto =
    nota === null
      ? t("exercise_workspace.submission.understanding_none")
      : t(`exercise_workspace.submission.understanding_${nota}`)
  return (
    <section className="flex flex-col gap-2 border-t border-muted pt-4">
      <Rotulo>{t("exercise_workspace.submission.understanding")}</Rotulo>
      <span className="flex items-center gap-2.5 text-[13px] text-foreground">
        {nota === null ? null : (
          <span className="flex gap-[3px]" aria-hidden>
            {[0, 1].map((i) => (
              <span key={i} className={cn("h-1.5 w-5 rounded-[2px]", i < nota ? "bg-primary" : "bg-sunken")} />
            ))}
          </span>
        )}
        <span>{texto}</span>
      </span>
    </section>
  )
}

function Erro({ error, onRetry, onBack }: { error: ExerciseSubmissionError; onRetry?: () => void; onBack: () => void }) {
  const t = useTranslate()
  // no 429, a contagem até poder enviar de novo; o botão só volta quando ela acaba
  const [faltam, setFaltam] = React.useState(error.kind === "rate_limit" ? (error.retryIn ?? 60) : 0)
  React.useEffect(() => {
    if (faltam <= 0) return
    const id = window.setTimeout(() => setFaltam((s) => s - 1), 1000)
    return () => window.clearTimeout(id)
  }, [faltam])
  const Icone = error.kind === "rate_limit" ? ClockIcon : WarningIcon
  return (
    <>
      <ModalHeader>
        <span className="flex items-center gap-3">
          <span
            aria-hidden
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-full",
              error.kind === "rate_limit" ? "bg-tone-yellow text-tone-yellow-foreground" : "bg-destructive-subtle text-destructive-subtle-foreground"
            )}
          >
            <Icone weight="bold" className="size-5" />
          </span>
          <span className="flex min-w-0 flex-col gap-0.5">
            <ModalTitle>{t(`exercise_workspace.submission.error.${error.kind}_title`)}</ModalTitle>
            <ModalDescription>
              {error.kind === "rate_limit"
                ? faltam > 0
                  ? t("exercise_workspace.submission.error.rate_limit_wait", { seconds: faltam })
                  : t("exercise_workspace.submission.error.rate_limit_ready")
                : t(`exercise_workspace.submission.error.${error.kind}_text`)}
            </ModalDescription>
          </span>
        </span>
      </ModalHeader>
      {error.message && error.kind !== "rate_limit" ? (
        <ModalBody>
          <p className="m-0 rounded-lg bg-sunken px-3 py-2.5 font-mono text-[11.5px] leading-4 break-words whitespace-pre-wrap text-foreground">
            {error.message}
          </p>
        </ModalBody>
      ) : null}
      <ModalFooter>
        <Button variant="ghost" size="lg" onClick={onBack}>
          {t("exercise_workspace.submission.back")}
        </Button>
        {onRetry ? (
          <Button variant="solid" size="lg" onClick={onRetry} disabled={faltam > 0}>
            {t("exercise_workspace.submission.retry")}
          </Button>
        ) : null}
      </ModalFooter>
    </>
  )
}
