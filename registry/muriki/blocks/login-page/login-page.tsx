"use client"

/**
 * Muriki LoginPage — a tela de entrada, herdada do platform e vestida
 * com a paleta.
 *
 * Layout editorial em duas metades: à esquerda o painel-encaixe (sunken)
 * com a atmosfera azul-e-amarelo da marca, o pitch e o mascote espiando
 * pelo canto; à direita o formulário. No mobile o painel some e a
 * atmosfera vira um véu no topo.
 *
 * O bloco não conhece roteador, i18next nem API: recebe callbacks, slots
 * e o mascote por prop — o registry não carrega binário. `brandHidden` é
 * o mascote de olhos fechados: entra quando a senha fica visível.
 *
 * Só um botão sólido na tela: o "Entrar". Todo o resto é filete.
 *
 * A moldura de duas metades é o AuthPage (bloco auth-page), a mesma das
 * outras telas de conta; aqui ela recebe o LoginForm.
 */
import { useState } from "react"

// Do arquivo, nunca do barril: o `shadcn add` reescreve o caminho para o alvo do item.
import { AuthPage } from "@/components/blocks/auth-page/auth-page"

import { LoginForm } from "./login-form"
import type { LoginPageProps } from "./types"

export function LoginPage({
  brand,
  brandHidden,
  mascot,
  mascotHidden,
  utilities,
  year,
  className,
  ...form
}: LoginPageProps) {
  const [passwordVisible, setPasswordVisible] = useState(false)

  return (
    <AuthPage
      brand={brand}
      brandHidden={brandHidden}
      mascot={mascot}
      mascotHidden={mascotHidden}
      hidden={passwordVisible}
      utilities={utilities}
      year={year}
      className={className}
    >
      <LoginForm {...form} onPasswordVisibilityChange={setPasswordVisible} className="w-full" />
    </AuthPage>
  )
}
