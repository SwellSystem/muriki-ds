// Renderiza os PDFs de exemplo do canvas a partir do código do registry (registry/muriki/pdf).
// bun run design/muriki-backoffice/pdf/render.tsx  →  design/muriki-backoffice/pdf/out/*.pdf
// Para o canvas: pdftoppm -png -r 144 out/<nome>.pdf out/<nome>, e sobe as páginas como assets.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import * as takumi from "takumi-pdf"

import { DataTable } from "@/components/pdf/data-table/data-table"
import { RecoveryCodesDocument, RECOVERY_CODES_RENDER_OPTIONS } from "@/components/pdf-documents/recovery-codes-document"
import {
  ReportBarChart,
  ReportDocument,
  ReportKpis,
  ReportNote,
  ReportSection,
  formatBRL,
  reportRenderOptions,
} from "@/components/pdf-documents/report"

const AQUI = dirname(new URL(import.meta.url).pathname)
const SAIDA = join(AQUI, "out")
mkdirSync(SAIDA, { recursive: true })

const fonte = (p: string) => new Uint8Array(readFileSync(require.resolve("@fontsource/" + p)))
const fonts = [400, 500, 600, 700].map((w) => ({ name: "Geist", weight: w, data: fonte(`geist/files/geist-latin-${w}-normal.woff2`) }))
fonts.push({ name: "Geist Mono", weight: 400, data: fonte("geist-mono/files/geist-mono-latin-400-normal.woff2") })
const render = (takumi as unknown as { render: (n: unknown, o: object) => Promise<Uint8Array> }).render

const codigos = ["7K2F-9QXM", "B4TN-3WLC", "H8PD-6ZRA", "M2VQ-5JYE", "R9CX-1NGT", "T3WB-8KFH", "W6LM-4DPS", "X1ZR-7QAV", "Y5HE-2CBN", "Z7GJ-0UTL"]
writeFileSync(
  join(SAIDA, "codigos.pdf"),
  await render(
    <RecoveryCodesDocument codes={codigos} email="ana.lima@muriki.app" name="Ana Lima" generatedAt="2026-09-24T14:32:00Z" />,
    { ...RECOVERY_CODES_RENDER_OPTIONS, fonts, fontFamilies: ["Geist"] }
  )
)

const meta = { title: "Vendas de setembro", period: "1 a 30 de setembro de 2026", product: "Backoffice" }
const dias = Array.from({ length: 30 }, (_, i) => ({ label: String(i + 1), value: Math.round(900 + 700 * Math.sin(i / 3) + i * 60) }))
const planos = [
  { plano: "Pro mensal", vendas: 312, receita: 15288, ticket: 49, share: "45%" },
  { plano: "Pro anual", vendas: 41, receita: 19270, ticket: 470, share: "32%" },
  { plano: "Team mensal", vendas: 22, receita: 3278, ticket: 149, share: "9%" },
  { plano: "Team anual", vendas: 6, receita: 8580, ticket: 1430, share: "14%" },
]
const vendas = Array.from({ length: 30 }, (_, i) => ({
  data: `${String(30 - Math.floor(i / 2)).padStart(2, "0")}/09`, cliente: ["Helena Duarte", "Sofia Martins", "Camila Rocha", "Marina Costa", "Rafael Moura"][i % 5],
  plano: ["Pro mensal", "Pro anual", "Team mensal"][i % 3], cupom: i % 4 === 0 ? "BEMVINDO20" : "—", valor: [49, 470, 149][i % 3],
}))

const relatorio = (
  <ReportDocument {...meta} generatedBy="Ana Lima" generatedAt="2026-09-24T14:32:00Z"
    summary="Quanto entrou, por quais planos e com quais cupons. Valores já sem os descontos." motif="business">
    <ReportKpis items={[
      { label: "Vendido", value: formatBRL(46416, false), delta: "+8,2%", tone: "good", hint: "contra agosto" },
      { label: "Vendas", value: "381", delta: "+5,1%", tone: "good", hint: "contra agosto" },
      { label: "Ticket médio", value: formatBRL(121.8), delta: "+2,9%", tone: "good" },
      { label: "Descontos", value: formatBRL(3120, false), delta: "+14%", tone: "bad", hint: "mais caro" },
    ]} />
    <ReportSection title="Vendas por dia" description="Quanto entrou em cada dia do mês, em reais." keepTogether>
      <ReportBarChart data={dias} height={170} title="Vendas por dia" />
    </ReportSection>
    <ReportSection title="Por plano" description="Qual plano puxou a receita do mês.">
      <DataTable size="compact" columns={[
        { key: "plano", header: "Plano" },
        { key: "vendas", header: "Vendas", align: "right" },
        { key: "receita", header: "Receita", align: "right", render: (v) => formatBRL(Number(v), false) },
        { key: "ticket", header: "Ticket médio", align: "right", render: (v) => formatBRL(Number(v), false) },
        { key: "share", header: "Participação", align: "right" },
      ]} data={planos} footer={{ plano: "Total", vendas: 381, receita: formatBRL(46416, false) }} />
      <ReportNote>O Pro anual vende pouco, mas é um terço da receita: cada venda vale quase dez mensais.</ReportNote>
    </ReportSection>
    <ReportSection title="Todas as vendas" description="Uma linha por venda, da mais recente para a mais antiga." breakBefore>
      <DataTable size="compact" stripe columns={[
        { key: "data", header: "Data" }, { key: "cliente", header: "Cliente" }, { key: "plano", header: "Plano" },
        { key: "cupom", header: "Cupom" }, { key: "valor", header: "Valor", align: "right", render: (v) => formatBRL(Number(v)) },
      ]} data={vendas} />
    </ReportSection>
  </ReportDocument>
)
writeFileSync(join(SAIDA, "relatorio.pdf"), await render(relatorio, { ...reportRenderOptions(meta), fonts, fontFamilies: ["Geist"] }))
console.log("ok", SAIDA)
