"use client"

/**
 * O nome e o endereço do workspace no Platform.
 *
 * O slug segue o nome (suggestSlug, F4) enquanto está vazio ou é a sugestão do nome de antes; se a
 * pessoa escreveu outro slug, ele é dela e o nome não o muda mais (nextSlugOnNameChange). A regra
 * sai do valor a cada mudança, sem guardar "editado": o rascunho que o app restaurar, a qualquer
 * hora, e o formulário zerado seguem a mesma regra.
 *
 * O nome segue o isPlainText da API (workspaceNameIssue, F5): de 1 a 80 code points, sem
 * caractere de controle ou invisível. Vazio é o campo esperando, não erro.
 *
 * O slug é o mesmo campo do @usuário (HandleField), com o endereço inteiro na frente
 * (`platform.muriki.app/` + slug) e os mesmos estados: formato na hora, disponibilidade do app.
 *
 * Com `audience="personal"` o nome é o "do seu espaço", e o exemplo do campo muda junto: é o mesmo
 * que a WorkspacePreview mostra, apagado, enquanto o nome não chega (workspaceNameExample).
 */
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useTranslate } from "@/lib/i18n"
import { cn } from "@/lib/utils"

import { WORKSPACE_NAME_MAX, nextSlugOnNameChange, normalizeHandle, workspaceNameIssue, type HandleStatus } from "./handles"
import { DICA, HandleField } from "./username-field"
import type { WorkspaceAudience } from "./workspace-preview"

/** A chave do exemplo de nome de cada público: o placeholder do campo e o nome apagado da prévia. */
export const workspaceNameExample = (audience: WorkspaceAudience) =>
  audience === "personal" ? "platform.identity.workspace.name_example_personal" : "platform.identity.workspace.name_example"

export interface WorkspaceFormProps {
  name: string
  onNameChange: (name: string) => void
  /** Já normalizado. */
  slug: string
  onSlugChange: (slug: string) => void
  /** A disponibilidade do slug, do app. O formato inválido o campo mostra sozinho. */
  slugStatus: HandleStatus
  /** O `slug` da resposta de disponibilidade: `slugStatus` só vale para ele. */
  slugStatusFor?: string
  /** `personal` troca o rótulo e o exemplo do nome ("Nome do seu espaço"). Padrão: `team`. */
  audience?: WorkspaceAudience
  /** O endereço antes do slug. Padrão: `platform.muriki.app/`. */
  urlPrefix?: string
  disabled?: boolean
  className?: string
}

export function WorkspaceForm({
  name,
  onNameChange,
  slug,
  onSlugChange,
  slugStatus,
  slugStatusFor,
  audience = "team",
  urlPrefix = "platform.muriki.app/",
  disabled,
  className,
}: WorkspaceFormProps) {
  const t = useTranslate()
  // vazio não é erro: é o campo esperando
  const nomeErrado = name !== "" && workspaceNameIssue(name) !== null

  function mudarNome(novo: string) {
    onNameChange(novo)
    const proximo = nextSlugOnNameChange(name, slug, novo)
    if (proximo !== slug) onSlugChange(proximo)
  }

  return (
    <div data-slot="workspace-form" className={cn("flex flex-col gap-5", className)}>
      <Field disabled={disabled} invalid={nomeErrado}>
        <FieldLabel>
          {t(audience === "personal" ? "platform.identity.workspace.name_label_personal" : "platform.identity.workspace.name_label")}
        </FieldLabel>
        <Input
          size="touch"
          value={name}
          onChange={(e) => mudarNome(e.target.value)}
          placeholder={t("platform.identity.workspace.name_placeholder", { example: t(workspaceNameExample(audience)) })}
          autoComplete="organization"
        />
        {nomeErrado ? <FieldError className={DICA}>{t("platform.identity.workspace.name_invalid", { max: WORKSPACE_NAME_MAX })}</FieldError> : null}
      </Field>
      <HandleField
        kind="slug"
        prefix={urlPrefix}
        label={t("platform.identity.workspace.slug_label")}
        value={slug}
        onChange={(novo) => onSlugChange(normalizeHandle(novo))}
        status={slugStatus}
        statusFor={slugStatusFor}
        disabled={disabled}
      />
    </div>
  )
}
