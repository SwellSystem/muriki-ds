"use client"

/**
 * Muriki QR Code — o QR com cara de marca, e ainda escaneável.
 *
 * A matriz vem do `qrcode` com correção de erro H (~30% recuperável), e é
 * isso que paga o resto: módulos desenhados como pontos, os três olhos
 * arredondados na tinta da marca e um logo no meio, numa janela branca que
 * cobre bem menos do que a correção aguenta.
 *
 * A PLACA É SEMPRE BRANCA, no tema escuro também. Leitor de QR precisa de
 * módulo escuro sobre fundo claro; um QR invertido falha em metade dos
 * apps. A zona quieta (margem sem módulo) é parte da placa.
 *
 * Os olhos na cor da marca não atrapalham a leitura: o azul do DS tem
 * luminância baixa o bastante para contar como escuro.
 */
import * as React from "react"
import QRCode from "qrcode"

import { cn } from "@/lib/utils"

export interface QrCodeProps extends Omit<React.ComponentProps<"div">, "children"> {
  /** O que o QR carrega — para 2FA, o `otpauthUri`. */
  value: string
  /** Lado do desenho em px, sem a placa. */
  size?: number
  /** No meio do QR: em geral <MurikiLogo />. Sem ele, os pontos ocupam tudo. */
  logo?: React.ReactNode
  /** Nome acessível. O leitor de tela não lê o QR, então diga o que ele é. */
  label?: string
  /** Tinta dos pontos e dos olhos. Padrão: quase preto e o azul da marca. */
  dotColor?: string
  eyeColor?: string
}

/** Módulos de margem branca em volta: o mínimo que os leitores aceitam bem. */
const MARGEM = 2

function QrCode({
  value,
  size = 168,
  logo,
  label = "QR code",
  dotColor = "#1C252E",
  eyeColor = "#1B50C0",
  className,
  ...props
}: QrCodeProps) {
  const qr = React.useMemo(() => QRCode.create(value, { errorCorrectionLevel: "H" }), [value])
  const n = qr.modules.size
  const total = n + MARGEM * 2
  const cel = size / total

  // a janela do logo: ~22% do lado, alinhada a módulos inteiros e ímpar para centrar
  let janela = Math.round(n * 0.22)
  if (janela % 2 === 0) janela += 1
  const ini = Math.floor((n - janela) / 2)
  const fim = ini + janela - 1

  const olho = (x: number, y: number) => (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7)
  const noLogo = (x: number, y: number) => !!logo && x >= ini && x <= fim && y >= ini && y <= fim

  const pontos: React.ReactNode[] = []
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (!qr.modules.get(y, x) || olho(x, y) || noLogo(x, y)) continue
      pontos.push(
        <circle key={`${x}-${y}`} cx={(x + MARGEM + 0.5) * cel} cy={(y + MARGEM + 0.5) * cel} r={cel * 0.42} />
      )
    }
  }

  const canto = (x: number, y: number) => {
    const ox = (x + MARGEM) * cel
    const oy = (y + MARGEM) * cel
    return (
      <g key={`olho-${x}-${y}`} fill={eyeColor}>
        <rect
          x={ox + cel / 2}
          y={oy + cel / 2}
          width={6 * cel}
          height={6 * cel}
          rx={2.1 * cel}
          fill="none"
          stroke={eyeColor}
          strokeWidth={cel}
        />
        <rect x={ox + 2 * cel} y={oy + 2 * cel} width={3 * cel} height={3 * cel} rx={1.1 * cel} />
      </g>
    )
  }

  const lado = janela * cel
  const origem = (ini + MARGEM) * cel

  return (
    <div
      data-slot="qr-code"
      className={cn("inline-flex shrink-0 rounded-[14px] bg-white p-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.06),inset_0_0_0_1px_var(--border)]", className)}
      {...props}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg role="img" aria-label={label} viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="block">
          <g fill={dotColor}>{pontos}</g>
          {canto(0, 0)}
          {canto(n - 7, 0)}
          {canto(0, n - 7)}
          {logo ? <rect x={origem} y={origem} width={lado} height={lado} rx={lado * 0.28} fill="#fff" /> : null}
        </svg>
        {logo ? (
          <div
            aria-hidden
            className="absolute flex items-center justify-center [&>*]:size-full"
            style={{ left: origem + cel * 0.8, top: origem + cel * 0.8, width: lado - cel * 1.6, height: lado - cel * 1.6 }}
          >
            {logo}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export { QrCode }
