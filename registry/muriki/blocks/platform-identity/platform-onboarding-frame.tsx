/**
 * A moldura dos passos do primeiro acesso do Platform (o @usuário e o workspace, e o convidar), do
 * mesmo lado do login (AuthPage): a barra do topo por cima, o palco azul à esquerda e o formulário
 * à direita. Os passos só trazem o conteúdo de cada lado.
 *
 * A partir do `lg` a tela é uma grade da altura da janela (1.2fr / 1fr), sem rolar de 1280×720 a
 * 1920×1080: o palco é o primary-subtle com manchas desfocadas da marca no fundo, e o conteúdo
 * dele (a WorkspacePreview) fica centrado; o formulário fica numa coluna de 32rem centrada na
 * vertical, com espaços em `clamp()` pela altura (o título também: 40px em 720 de altura, 52px de
 * 930 para cima). Abaixo do `lg` o palco some e o passo é a coluna de formulário de sempre, que
 * pode rolar.
 */
import type { ReactNode } from "react"

// o fundo do palco: três manchas da cor da marca, largas e sem borda, como um desfoque
// espelhadas para o palco à esquerda: o azul forte fica na borda de fora, e a borda que encosta no
// formulário termina num degradê para o fundo da página, que apaga a divisa no claro e no escuro
const MANCHAS = [
  "linear-gradient(to right, transparent calc(100% - 11rem), var(--background))",
  "radial-gradient(45% 55% at 72% 22%, color-mix(in oklch, var(--primary) 44%, transparent), transparent 70%)",
  "radial-gradient(50% 60% at 12% 82%, color-mix(in oklch, var(--primary) 36%, transparent), transparent 70%)",
  "radial-gradient(35% 40% at 22% 12%, color-mix(in oklch, var(--primary) 24%, transparent), transparent 70%)",
].join(", ")

export interface PlatformOnboardingFrameProps {
  /** O que vai no palco azul (a prévia). Decorativo: quem passa marca `aria-hidden`. */
  stage: ReactNode
  /** A coluna do formulário: o cabeçalho do passo, o formulário e a ação. */
  children: ReactNode
  /** A marca, no canto de cima à esquerda. */
  brand?: ReactNode
  /** Idioma, tema e a conta, no canto de cima à direita. */
  utilities?: ReactNode
}

export function PlatformOnboardingFrame({ stage, children, brand, utilities }: PlatformOnboardingFrameProps) {
  return (
    <div className="relative flex min-h-svh flex-col bg-background lg:grid lg:h-dvh lg:min-h-[40rem] lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      {brand || utilities ? (
        <header className="z-10 flex h-16 shrink-0 items-center gap-3 px-6 md:px-8 lg:absolute lg:inset-x-0 lg:top-0">
          {brand}
          <div className="ml-auto flex items-center gap-1">{utilities}</div>
        </header>
      ) : null}

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-9 px-4 pt-8 pb-10 md:px-6 lg:max-w-[32rem] lg:justify-center lg:[&_h1]:text-[clamp(2.25rem,5.6vh,3.25rem)] lg:gap-[clamp(1.25rem,3.6vh,2.5rem)] lg:px-0 lg:pt-16 lg:pb-[clamp(1rem,3vh,2.5rem)]">
        {children}
      </main>

      {/* o palco, primeiro na grade e depois do formulário no DOM: a faixa azul da altura da tela, com
          manchas desfocadas da marca no fundo e o conteúdo da altura dele, centrado */}
      <div
        className="hidden min-h-0 items-center justify-center bg-primary-subtle px-[clamp(2rem,4vw,5rem)] pt-16 pb-[clamp(1.5rem,5vh,4rem)] lg:order-first lg:flex"
        style={{ backgroundImage: MANCHAS }}
      >
        {stage}
      </div>
    </div>
  )
}
