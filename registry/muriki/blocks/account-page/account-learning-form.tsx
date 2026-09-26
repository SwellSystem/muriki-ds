"use client"

// O perfil de aprendizado, fora do onboarding (PUT /code/learning-profile
// substitui o perfil inteiro): a experiência, as linguagens do catálogo
// (GET /code/languages, com "em breve" para as sem suporte) e até três
// objetivos. Os mesmos campos do primeiro acesso, com a nota de que a
// experiência é o declarado de todas as competências da Evolução.
import { useState, type FormEvent } from "react"
import { TrendUpIcon } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { ChoiceCard, ChoiceCardGroup } from "@/components/ui/choice-card"
import { ChoiceChips, type ChoiceChipGroup } from "@/components/ui/choice-chips"
import { Separator } from "@/components/ui/separator"
import { useTranslate } from "@/lib/i18n"

import { AccountCard } from "./account-card"

export type LearningExperience = "junior" | "mid" | "senior" | "tech_lead" | "architect" | "unknown"
export type LearningGoal = "learn" | "ship_faster" | "review_code"

export interface AccountLearningValues {
  experience: LearningExperience
  languages: string[]
  goals: LearningGoal[]
}

export interface AccountLearningFormProps {
  values: AccountLearningValues
  /** O catálogo já agrupado por categoria, com `soon` nas que ainda não têm suporte. */
  languageGroups: ChoiceChipGroup[]
  onSubmit: (values: AccountLearningValues) => void
  saving?: boolean
  className?: string
}

const EXPERIENCIAS: LearningExperience[] = ["junior", "mid", "senior", "tech_lead", "architect", "unknown"]
const OBJETIVOS: LearningGoal[] = ["learn", "ship_faster", "review_code"]

export function AccountLearningForm({ values, languageGroups, onSubmit, saving = false, className }: AccountLearningFormProps) {
  const t = useTranslate()
  const [exp, setExp] = useState<LearningExperience>(values.experience)
  const [langs, setLangs] = useState<string[]>(values.languages)
  const [goals, setGoals] = useState<LearningGoal[]>(values.goals)

  const igual = (a: string[], b: string[]) => a.length === b.length && a.every((x) => b.includes(x))
  const mudou = exp !== values.experience || !igual(langs, values.languages) || !igual(goals, values.goals)

  function enviar(event: FormEvent) {
    event.preventDefault()
    if (mudou) onSubmit({ experience: exp, languages: langs, goals })
  }

  function descartar() {
    setExp(values.experience)
    setLangs(values.languages)
    setGoals(values.goals)
  }

  const Rotulo = ({ children, extra }: { children: string; extra?: string }) => (
    <div className="flex items-center gap-3">
      <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">{children}</span>
      {extra ? <span className="ml-auto text-xs text-muted-foreground">{extra}</span> : null}
    </div>
  )

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
