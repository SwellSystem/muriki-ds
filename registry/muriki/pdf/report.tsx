/**
 * Muriki Report — a casca dos relatórios gerenciais em PDF.
 *
 * Todo relatório da Muriki tem o mesmo esqueleto, e só o miolo muda:
 *
 * - a CAPA é um cartão azul da marca no topo da primeira página: o que é,
 *   o período, quem gerou e quando. Não é uma página inteira de capa;
 *   relatório gerencial começa a dizer coisa logo na primeira folha;
 * - os KPIs vêm em linha, com o número grande e a variação contra o
 *   período anterior, em verde ou vermelho com seta, nunca só na cor;
 * - as SEÇÕES têm título e uma frase do que respondem, e levam as tabelas
 *   (DataTable do pdfcn) e os gráficos (Graph do pdfcn) com o tema Muriki;
 * - o CABEÇALHO (da página 2 em diante) e o RODAPÉ (em todas, com
 *   "página N de M") são bandas do takumi: passe `reportRenderOptions()` no
 *   `render()` e elas repetem sozinhas.
 *
 * Tudo em papel branco, tinta azulada, azul de destaque e o amarelo só no
 * detalhe, como o tema.
 */
import { Children, type ReactNode } from "react"
import { PageNumber, TotalPages } from "takumi-pdf/primitives"

import { MurikiLogo } from "@/components/ui/muriki-logo"
import { PdfcnThemeProvider } from "@/components/pdf/theme-provider"
import { Document, Page, Text, View } from "@/lib/pdf-primitives"
import { Path, Svg } from "@/lib/pdf-svg"
import { MURIKI_BLUE, MURIKI_INK, MURIKI_MONO, MURIKI_YELLOW, murikiTheme } from "@/lib/pdf-themes/muriki"

const MUTED = murikiTheme.colors.mutedForeground
const RULE = "#e3e1da"
const OK = "#1f7a4d"
const RUIM = "#b42318"
const MARGEM_LADO = 48

function Rotulo({ children, color = MUTED }: { children: ReactNode; color?: string }) {
  return (
    <Text style={{ fontFamily: MURIKI_MONO, fontSize: 8.5, letterSpacing: 1.8, textTransform: "uppercase", color }}>
      {children}
    </Text>
  )
}

/** "24 de setembro de 2026, 11:32" no horário de Brasília. */
export function formatDateTime(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const dia = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Sao_Paulo" }).format(d)
  const hora = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" }).format(d)
  return `${dia}, ${hora}`
}

/** R$ 1.234,56 — ou sem centavos quando `cents` é false. */
export function formatBRL(valor: number, cents = true) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
  }).format(valor)
}

export interface ReportMeta {
  title: string
  /** "1 a 30 de setembro de 2026", já por extenso. */
  period: string
  /** O produto, no cabeçalho e no rodapé. Padrão: "Backoffice". */
  product?: string
}

function CabecalhoBanda({ title, period, product = "Backoffice" }: ReportMeta) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: 22,
        paddingBottom: 10,
        paddingLeft: MARGEM_LADO,
        paddingRight: MARGEM_LADO,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <MurikiLogo width={18} height={17} />
        <Text style={{ fontSize: 9.5, fontWeight: 600, color: MURIKI_INK }}>{title}</Text>
      </View>
      <Rotulo>{`${product} · ${period}`}</Rotulo>
    </View>
  )
}

function RodapeBanda({ title, product = "Backoffice" }: ReportMeta) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginLeft: MARGEM_LADO,
        marginRight: MARGEM_LADO,
        paddingTop: 10,
        paddingBottom: 22,
        borderTopWidth: 1,
        borderTopColor: RULE,
      }}
    >
      <Rotulo>{`muriki / ${product.toLowerCase()} · ${title} · confidencial`}</Rotulo>
      <Text style={{ fontFamily: MURIKI_MONO, fontSize: 8.5, letterSpacing: 1.2, color: MUTED }}>
        {"página "}
        <PageNumber />
        {" de "}
        <TotalPages />
      </Text>
    </View>
  )
}

/**
 * As opções do `render()` do takumi para um relatório: A4, margem lateral de
 * 48 e as bandas. A primeira página não tem cabeçalho, porque a capa já diz
 * tudo; o rodapé com a página vale em todas.
 */
export function reportRenderOptions(meta: ReportMeta) {
  return {
    size: "a4",
    margin: { left: MARGEM_LADO, right: MARGEM_LADO, top: "auto", bottom: "auto" },
    header: <CabecalhoBanda {...meta} />,
    footer: <RodapeBanda {...meta} />,
    pages: { first: { header: false } },
  } as const
}

export type ReportMotif = "money" | "shield" | "people" | "chart" | "none"

const TINTA_MOTIVO = "rgba(255,255,255,0.08)"

function Motivo({ motif }: { motif: ReportMotif }) {
  if (motif === "none") return null
  if (motif === "money") {
    return (
      <View style={{ position: "absolute", right: 58, top: -30, transform: "rotate(-8deg)" }}>
        <Text style={{ fontSize: 230, lineHeight: 1, fontWeight: 700, letterSpacing: -10, color: TINTA_MOTIVO }}>R$</Text>
      </View>
    )
  }
  const caminhos: Record<Exclude<ReportMotif, "money" | "none">, string[]> = {
    shield: ["M8 1.8l5.2 2v4c0 3.2-2.2 5.4-5.2 6.4-3-1-5.2-3.2-5.2-6.4v-4z", "M5.8 8.2l1.6 1.6 3-3"],
    people: ["M6 3.2a2.4 2.4 0 1 1 0 4.8a2.4 2.4 0 1 1 0-4.8z", "M1.8 13.4c.5-2.4 2.2-3.8 4.2-3.8s3.7 1.4 4.2 3.8", "M10.4 3.4a2.4 2.4 0 0 1 0 4.4", "M11.8 9.8c1.3.5 2.2 1.7 2.4 3.6"],
    chart: ["M2.5 13.5h11", "M4.5 11.5v-3", "M8 11.5v-6", "M11.5 11.5v-8"],
  }
  return (
    <View style={{ position: "absolute", right: 40, top: -40, transform: "rotate(-8deg)" }}>
      <Svg width={250} height={250} viewBox="0 0 16 16">
        {caminhos[motif].map((d) => (
          <Path key={d} d={d} fill="none" stroke={TINTA_MOTIVO} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
        ))}
      </Svg>
    </View>
  )
}

export interface ReportDocumentProps extends ReportMeta {
  /** Acima do título, em mono. Padrão: "Relatório gerencial". */
  eyebrow?: string
  /** Quem gerou (nome) e quando (ISO). */
  generatedBy: string
  generatedAt: string
  /** Uma ou duas frases do que o relatório mostra, na capa. */
  summary?: string
  /**
   * O desenho grande e translúcido atrás do macaco na capa, que diz o assunto antes do título:
   * `money` (R$) para vendas, receita e cupons; `shield` para segurança; `people` para equipe e
   * clientes; `chart` para o resto. Padrão: `chart`.
   */
  motif?: ReportMotif
  children: ReactNode
}

export function ReportDocument({
  title,
  period,
  product = "Backoffice",
  eyebrow = "Relatório gerencial",
  generatedBy,
  generatedAt,
  summary,
  motif = "chart",
  children,
}: ReportDocumentProps) {
  return (
    <Document title={`${title} · Muriki ${product}`}>
      <Page size="A4" style={{ backgroundColor: "#ffffff" }}>
        <PdfcnThemeProvider theme={murikiTheme}>
          <View style={{ gap: 26 }}>
            {/* a capa: cartão da marca no topo da primeira página */}
            <View
              style={{
                position: "relative",
                overflow: "hidden",
                borderRadius: 18,
                backgroundColor: MURIKI_BLUE,
                paddingTop: 26,
                paddingBottom: 26,
                paddingLeft: 28,
                paddingRight: 28,
                gap: 18,
              }}
            >
              <Motivo motif={motif} />
              <View style={{ position: "absolute", right: 24, bottom: -30, transform: "rotate(-8deg)" }}>
                <MurikiLogo width={112} height={105} />
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <View style={{ padding: 3, borderRadius: 8, backgroundColor: "#ffffff" }}>
                  <MurikiLogo width={18} height={17} />
                </View>
                <Text style={{ fontSize: 10.5, fontWeight: 600, color: "#ffffff" }}>{`Muriki ${product}`}</Text>
              </View>
              <View style={{ gap: 8, maxWidth: 380 }}>
                <Rotulo color={MURIKI_YELLOW}>{eyebrow}</Rotulo>
                <Text style={{ fontSize: 26, lineHeight: 1.1, fontWeight: 600, letterSpacing: -0.5, color: "#ffffff" }}>
                  {title}
                </Text>
                {summary ? (
                  <Text style={{ fontSize: 10.5, lineHeight: 1.55, color: "rgba(255,255,255,0.82)" }}>{summary}</Text>
                ) : null}
              </View>
              <View style={{ flexDirection: "row", gap: 24 }}>
                {[
                  ["Período", period],
                  ["Gerado por", generatedBy],
                  ["Gerado em", formatDateTime(generatedAt)],
                ].map(([rotulo, valor]) => (
                  <View key={rotulo} style={{ gap: 3 }}>
                    <Rotulo color="rgba(255,255,255,0.6)">{rotulo}</Rotulo>
                    <Text style={{ fontSize: 10, color: "#ffffff" }}>{valor}</Text>
                  </View>
                ))}
              </View>
            </View>
            {children}
          </View>
        </PdfcnThemeProvider>
      </Page>
    </Document>
  )
}

export interface ReportKpi {
  label: string
  value: string
  /** Variação contra o período anterior, já formatada: "+6,8%". */
  delta?: string
  /** Se a variação é boa, ruim ou neutra — para a cor E a seta. */
  trend?: "up" | "down" | "neutral"
  /** Linha de apoio: "contra agosto", "412 pagantes". */
  hint?: string
}

export function ReportKpis({ items }: { items: ReportKpi[] }) {
  return (
    <View style={{ flexDirection: "row", gap: 10, breakInside: "avoid" }}>
      {items.map((k) => {
        const cor = k.trend === "up" ? OK : k.trend === "down" ? RUIM : MUTED
        const seta = k.trend === "up" ? "↑ " : k.trend === "down" ? "↓ " : ""
        return (
          <View
            key={k.label}
            style={{
              flex: 1,
              gap: 6,
              paddingTop: 14,
              paddingBottom: 14,
              paddingLeft: 14,
              paddingRight: 14,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: RULE,
            }}
          >
            <Text
              style={{ fontFamily: MURIKI_MONO, fontSize: 8.5, letterSpacing: 1.6, textTransform: "uppercase", color: MUTED, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
            >
              {k.label}
            </Text>
            <Text style={{ fontSize: 20, fontWeight: 600, letterSpacing: -0.4, color: MURIKI_INK }}>{k.value}</Text>
            {k.delta || k.hint ? (
              <Text style={{ fontSize: 9, color: MUTED }}>
                {k.delta ? <Text style={{ fontWeight: 600, color: cor }}>{`${seta}${k.delta}`}</Text> : null}
                {k.delta && k.hint ? " " : null}
                {k.hint ?? null}
              </Text>
            ) : null}
          </View>
        )
      })}
    </View>
  )
}

export interface ReportSectionProps {
  title: string
  /** A pergunta que a seção responde, numa frase. */
  description?: string
  /** Começa numa página nova. */
  breakBefore?: boolean
  /** Não quebra a seção no meio: bom para gráfico com legenda. */
  keepTogether?: boolean
  children: ReactNode
}

export function ReportSection({ title, description, breakBefore, keepTogether, children }: ReportSectionProps) {
  const cabecalho = (
    <View style={{ gap: 4, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: RULE }}>
      <Text style={{ fontSize: 14, fontWeight: 600, color: MURIKI_INK }}>{title}</Text>
      {description ? <Text style={{ fontSize: 9.5, lineHeight: 1.5, color: MUTED }}>{description}</Text> : null}
    </View>
  )
  // o título nunca fica sozinho no pé da página: ele e o primeiro bloco não se separam
  // (o takumi não tem break-after: avoid, então o par vira um grupo que não quebra)
  const [primeiro, ...resto] = Children.toArray(children)
  return (
    <View style={{ gap: 12, breakBefore: breakBefore ? "page" : undefined, breakInside: keepTogether ? "avoid" : undefined }}>
      <View style={{ gap: 12, breakInside: "avoid" }}>
        {cabecalho}
        {primeiro}
      </View>
      {resto}
    </View>
  )
}

export function ReportNote({ tone = "info", children }: { tone?: "info" | "warning"; children: ReactNode }) {
  const fundo = tone === "warning" ? "#FFF6D6" : "#EEF3FD"
  const tinta = tone === "warning" ? "#6E4C00" : "#0C2E77"
  return (
    <View style={{ paddingTop: 10, paddingBottom: 10, paddingLeft: 14, paddingRight: 14, borderRadius: 10, backgroundColor: fundo }}>
      <Text style={{ fontSize: 9.5, lineHeight: 1.5, color: tinta }}>{children}</Text>
    </View>
  )
}

export interface ReportBarDatum {
  label: string
  value: number
}

export interface ReportBarChartProps {
  data: ReportBarDatum[]
  /** Altura da área das barras, em px. */
  height?: number
  /** Como escrever um valor: nos ticks do eixo e no rótulo do pico. */
  formatValue?: (valor: number) => string
  /** Mostra um rótulo do eixo X a cada N barras. Padrão: o que couber, até 10. */
  labelEvery?: number
  /** Escreve o valor em cima da maior barra. */
  labelMax?: boolean
  /** Nome acessível do gráfico. */
  title?: string
}

/**
 * Barras de uma série só, no azul da marca: magnitude ao longo do tempo
 * (vendas por dia, clientes por mês). Sem legenda, porque uma série não
 * precisa; o título da seção diz o que é. Quatro linhas de grade leves,
 * ticks em mono, barras com a ponta arredondada presas na base, e o valor
 * escrito só no pico, nunca em todas.
 *
 * Feito de View, não de SVG: o Graph do pdfcn, no takumi, duplica os
 * rótulos do eixo X e sobrepõe os do Y.
 */
export function ReportBarChart({
  data,
  height = 160,
  formatValue = (v) => new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 }).format(v),
  labelEvery,
  labelMax = true,
  title,
}: ReportBarChartProps) {
  const maior = Math.max(1, ...data.map((d) => d.value))
  // teto que divide redondo em quartos (1, 2, 4, 6 ou 8 × 10^n), para os ticks não virarem "3,8 mil"
  const ordem = Math.pow(10, Math.floor(Math.log10(maior)))
  const teto = [1, 2, 4, 6, 8, 10].map((m) => m * ordem).find((v) => v >= maior) ?? maior
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * teto)
  const cada = labelEvery ?? Math.max(1, Math.ceil(data.length / 10))
  const iMaior = data.findIndex((d) => d.value === maior)
  const EIXO = 44

  return (
    <View style={{ gap: 6, breakInside: "avoid" }} aria-label={title}>
      <View style={{ flexDirection: "row", height }}>
        <View style={{ width: EIXO, position: "relative" }}>
          {ticks.map((t) => (
            <Text
              key={t}
              style={{
                position: "absolute",
                right: 8,
                bottom: (t / teto) * height - 5,
                fontFamily: MURIKI_MONO,
                fontSize: 7.5,
                color: MUTED,
              }}
            >
              {formatValue(t)}
            </Text>
          ))}
        </View>
        <View style={{ flex: 1, position: "relative" }}>
          {ticks.map((t) => (
            <View
              key={t}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: (t / teto) * height,
                height: 1,
                backgroundColor: t === 0 ? "#c9c5ba" : "#efede7",
              }}
            />
          ))}
          <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, top: 0, flexDirection: "row", alignItems: "flex-end", gap: 3 }}>
            {data.map((d, i) => (
              <View key={d.label + i} style={{ flex: 1, alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
                {labelMax && i === iMaior ? (
                  <Text style={{ fontSize: 7.5, fontWeight: 600, color: MURIKI_INK, marginBottom: 3, whiteSpace: "nowrap" }}>
                    {formatValue(d.value)}
                  </Text>
                ) : null}
                <View
                  style={{
                    width: "100%",
                    height: Math.max(1, (d.value / teto) * height),
                    backgroundColor: MURIKI_BLUE,
                    borderTopLeftRadius: 3,
                    borderTopRightRadius: 3,
                  }}
                />
              </View>
            ))}
          </View>
        </View>
      </View>
      <View style={{ flexDirection: "row", paddingLeft: EIXO, gap: 3 }}>
        {data.map((d, i) => (
          <View key={d.label + i} style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ fontFamily: MURIKI_MONO, fontSize: 7.5, color: MUTED, whiteSpace: "nowrap" }}>
              {i % cada === 0 || i === data.length - 1 ? d.label : ""}
            </Text>
          </View>
        ))}
      </View>
    </View>
  )
}
