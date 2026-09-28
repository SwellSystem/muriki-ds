"use client"

// O perfil de aprendizado, fora do onboarding (PUT /code/learning-profile
// substitui o perfil inteiro): quanto a pessoa programa, as linguagens do
// catálogo (GET /code/languages, com "em breve" para as sem suporte), a
// familiaridade por família de linguagem e até três objetivos. Os mesmos
// campos do primeiro acesso.
//
// A familiaridade é por família (hoje só `js`, que cobre JavaScript e
// TypeScript; outra chave a API recusa com 422): a pergunta "E em …?" só
// aparece quando alguma linguagem da família está marcada, é opcional, e
// desmarcar a família inteira tira a resposta do valor.
import { useState, type FormEvent } from "react"
import { TrendUpIcon } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { ChoiceCard, ChoiceCardGroup } from "@/components/ui/choice-card"
import { ChoiceChips, type ChoiceChipGroup } from "@/components/ui/choice-chips"
import { Separator } from "@/components/ui/separator"
import { useTranslate } from "@/lib/i18n"

import { AccountCard } from "./account-card"

export type LearningExperience =
  | "never"
  | "learning"
  | "under_2_years"
  | "from_2_to_5_years"
  | "over_5_years"
  | "unknown"
export type LearningFamiliarity = "never_used" | "basics" | "daily" | "expert"
export type LearningGoal = "learn" | "ship_faster" | "review_code"

export interface LearningFamily {
  /** A chave que a API conhece, ex.: "js". */
  key: string
  /** O nome na pergunta, ex.: "JavaScript/TypeScript". */
  label: string
  /** As linguagens do catálogo que fazem a pergunta aparecer. */
  languages: string[]
}

export interface AccountLearningValues {
  experience: LearningExperience
  languages: string[]
  /** Por família; só as famílias com alguma linguagem marcada. */
  familiarity?: Record<string, LearningFamiliarity>
  goals: LearningGoal[]
}

export interface AccountLearningFormProps {
  values: AccountLearningValues
  /** O catálogo já agrupado por categoria, com `soon` nas que ainda não têm suporte. */
  languageGroups: ChoiceChipGroup[]
  /** As famílias com a pergunta de familiaridade. Padrão: só JavaScript/TypeScript. */
  families?: LearningFamily[]
  onSubmit: (values: AccountLearningValues) => void
  saving?: boolean
  className?: string
}

const EXPERIENCIAS: LearningExperience[] = ["never", "learning", "under_2_years", "from_2_to_5_years", "over_5_years", "unknown"]
const FAMILIARIDADES: LearningFamiliarity[] = ["never_used", "basics", "daily", "expert"]
const OBJETIVOS: LearningGoal[] = ["learn", "ship_faster", "review_code"]
const FAMILIAS_PADRAO: LearningFamily[] = [{ key: "js", label: "JavaScript/TypeScript", languages: ["javascript", "typescript"] }]

export function AccountLearningForm({
  values,
  languageGroups,
  families = FAMILIAS_PADRAO,
  onSubmit,
  saving = false,
  className,
}: AccountLearningFormProps) {
  const t = useTranslate()
  const [exp, setExp] = useState<LearningExperience>(values.experience)
  const [langs, setLangs] = useState<string[]>(values.languages)
  const [fam, setFam] = useState<Record<string, LearningFamiliarity>>(values.familiarity ?? {})
  const [goals, setGoals] = useState<LearningGoal[]>(values.goals)

  // só as famílias com alguma linguagem marcada perguntam e entram no valor
  const ativas = families.filter((f) => f.languages.some((l) => langs.includes(l)))
  const familiaridade = Object.fromEntries(
    ativas.filter((f) => fam[f.key]).map((f) => [f.key, fam[f.key]])
  ) as Record<string, LearningFamiliarity>

  const igual = (a: string[], b: string[]) => a.length === b.length && a.every((x) => b.includes(x))
  const igualFam = (a: Record<string, string>, b: Record<string, string>) =>
    igual(Object.keys(a), Object.keys(b)) && Object.keys(a).every((k) => a[k] === b[k])
  const mudou =
    exp !== values.experience ||
    !igual(langs, values.languages) ||
    !igualFam(familiaridade, values.familiarity ?? {}) ||
    !igual(goals, values.goals)

  function enviar(event: FormEvent) {
    event.preventDefault()
    if (mudou) onSubmit({ experience: exp, languages: langs, familiarity: familiaridade, goals })
  }

  function descartar() {
    setExp(values.experience)
    setLangs(values.languages)
    setFam(values.familiarity ?? {})
    setGoals(values.goals)
  }

  return (
    <AccountCard title={t("account.learning.title")} description={t("account.learning.description")} className={className}>
      <form onSubmit={enviar} className="flex flex-col gap-4.5">
        <div className="flex flex-col gap-3">
          <Rotulo>{t("account.learning.experience")}</Rotulo>
          <ChoiceCardGroup value={exp} onValueChange={(v) => setExp(v as LearningExperience)} aria-label={t("account.learning.experience")}>
            {EXPERIENCIAS.map((e) => (
              <ChoiceCard key={e} value={e} title={t(`account.learning.exp.${e}`)} description={t(`account.learning.exp.${e}_hint`)} />
            ))}
          </ChoiceCardGroup>
          <p className="flex items-start gap-2 text-[12.5px] leading-[18px] text-muted-foreground">
            <TrendUpIcon aria-hidden className="mt-px size-3.5 shrink-0" />
            {t("account.learning.declared_note")}
          </p>
        </div>
        <Separator />
        <div className="flex flex-col gap-3">
          <Rotulo>{t("account.learning.languages")}</Rotulo>
          <ChoiceChips groups={languageGroups} value={langs} onValueChange={setLangs} soonLabel={t("account.learning.soon")} />
        </div>
        {ativas.map((f) => {
          const pergunta = t("account.learning.familiarity", { family: f.label })
          return (
            <div key={f.key} className="flex flex-col gap-3">
              <Rotulo extra={t("account.learning.optional")}>{pergunta}</Rotulo>
              <ChoiceCardGroup
                value={fam[f.key] ?? null}
                onValueChange={(v) => setFam((atual) => ({ ...atual, [f.key]: v as LearningFamiliarity }))}
                aria-label={pergunta}
              >
                {FAMILIARIDADES.map((n) => (
                  <ChoiceCard key={n} value={n} title={t(`account.learning.fam.${n}`)} description={t(`account.learning.fam.${n}_hint`)} />
                ))}
              </ChoiceCardGroup>
            </div>
          )
        })}
        <Separator />
        <div className="flex flex-col gap-3">
          <Rotulo extra={t("account.learning.goals_limit")}>{t("account.learning.goals")}</Rotulo>
          <ChoiceCardGroup
            type="multiple"
            max={3}
            value={goals}
            onValueChange={(v) => setGoals(v as LearningGoal[])}
            aria-label={t("account.learning.goals")}
          >
            {OBJETIVOS.map((g) => (
              <ChoiceCard key={g} value={g} title={t(`account.learning.goal.${g}`)} description={t(`account.learning.goal.${g}_hint`)} />
            ))}
          </ChoiceCardGroup>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={descartar} disabled={!mudou || saving}>
            {t("account.discard")}
          </Button>
          <Button type="submit" variant="primary" loading={saving} disabled={!mudou}>
            {t("account.save")}
          </Button>
        </div>
      </form>
    </AccountCard>
  )
}

// fora do render: um componente criado dentro de outro é recriado a cada
// render e perde o estado e o foco dos filhos
function Rotulo({ children, extra }: { children: string; extra?: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">{children}</span>
      {extra ? <span className="ml-auto text-xs text-muted-foreground">{extra}</span> : null}
    </div>
  )
}
