/**
 * Recovery Codes Document — os códigos de recuperação do 2FA em PDF.
 *
 * É o papel que a pessoa guarda na gaveta ou no cofre de senhas, então ele
 * precisa ser reconhecível de longe e à prova de engano:
 *
 * - a faixa azul da marca em cima, com o macaco espiando, diz de onde é;
 * - os códigos vivem num cartão tracejado, que dá para recortar, com
 *   número, código em mono espaçado e um quadrado para riscar o usado;
 * - "como usar" vem em três passos, e o aviso vem numa caixa amarela, sem
 *   borda lateral.
 *
 * A data chega em ISO e sai por extenso, no horário de Brasília. Ninguém
 * lê "2026-09-24T14:32:00Z" no papel.
 *
 * Renderize com o tema Muriki e as fontes Geist e Geist Mono registradas.
 */
import { MurikiLogo } from "@/components/ui/muriki-logo"
import { PdfcnThemeProvider } from "@/components/pdf/theme-provider"
import { Document, Page, Text, View } from "@/lib/pdf-primitives"
import { Path, Svg } from "@/lib/pdf-svg"
import { MURIKI_BLUE, MURIKI_INK, MURIKI_MONO, MURIKI_YELLOW, murikiTheme } from "@/lib/pdf-themes/muriki"

export type RecoveryCodesDocumentProps = {
  codes: readonly string[]
  email: string
  name: string | null
  /** Instante em ISO; sai por extenso no horário de Brasília. */
  generatedAt: string
  /** O produto no cabeçalho e no rodapé. Padrão: "Backoffice". */
  product?: string
  /** O que fazer se perder tudo. Muda por produto: na equipe é um admin, no Code é o suporte. */
  lostAccessHint?: string
}

const MUTED = murikiTheme.colors.mutedForeground
const RULE = "#e3e1da"
const AZUL_CLARO = "#EEF3FD"
const AMARELO_CLARO = "#FFF6D6"
const MARGEM = 44

export function formatGeneratedAt(iso: string) {
  const data = new Date(iso)
  if (Number.isNaN(data.getTime())) return iso
  const dia = new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  }).format(data)
  const hora = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(data)
  return `${dia}, ${hora} (Brasília)`
}

function Rotulo({ children, color = MUTED }: { children: string; color?: string }) {
  return (
    <Text
      style={{
        fontFamily: MURIKI_MONO,
        fontSize: 8.5,
        letterSpacing: 1.8,
        textTransform: "uppercase",
        color,
      }}
    >
      {children}
    </Text>
  )
}

function Faixa({ product }: { product: string }) {
  return (
    <View
      style={{
        position: "relative",
        overflow: "hidden",
        backgroundColor: MURIKI_BLUE,
        paddingTop: 28,
        paddingBottom: 28,
        paddingLeft: MARGEM,
        paddingRight: MARGEM,
        gap: 18,
      }}
    >
      {/* dois anéis de luz atrás do macaco, e o macaco grande espiando pelo canto */}
      <View
        style={{
          position: "absolute",
          right: -70,
          bottom: -170,
          width: 380,
          height: 380,
          borderRadius: 999,
          borderWidth: 36,
          borderColor: "rgba(255,255,255,0.07)",
        }}
      />
      <View
        style={{
          position: "absolute",
          right: 10,
          bottom: -90,
          width: 220,
          height: 220,
          borderRadius: 999,
          backgroundColor: "rgba(255,255,255,0.06)",
        }}
      />
      <View style={{ position: "absolute", right: 28, bottom: -46, transform: "rotate(-8deg)" }}>
        <MurikiLogo width={176} height={165} />
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={{ padding: 4, borderRadius: 10, backgroundColor: "#ffffff" }}>
            <MurikiLogo width={26} height={24} />
          </View>
          <View style={{ gap: 1 }}>
            <Text style={{ fontSize: 12, fontWeight: 600, color: "#ffffff" }}>Muriki</Text>
            <Text style={{ fontSize: 9.5, color: "rgba(255,255,255,0.72)" }}>{product}</Text>
          </View>
        </View>
        <View
          style={{
            paddingTop: 5,
            paddingBottom: 5,
            paddingLeft: 10,
            paddingRight: 10,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.45)",
          }}
        >
          <Rotulo color="#ffffff">Confidencial</Rotulo>
        </View>
      </View>

      <View style={{ gap: 10, maxWidth: 470 }}>
        <Rotulo color={MURIKI_YELLOW}>Verificação em duas etapas</Rotulo>
        <Text style={{ fontSize: 30, lineHeight: 1.08, fontWeight: 600, letterSpacing: -0.6, color: "#ffffff" }}>
          Seus códigos de recuperação
        </Text>
        <Text style={{ maxWidth: 340, fontSize: 11, lineHeight: 1.55, color: "rgba(255,255,255,0.82)" }}>
          Perdeu o celular com o app autenticador? Entre com um destes códigos no lugar dos 6 dígitos.
        </Text>
      </View>
    </View>
  )
}

function Dado({ rotulo, valor, mono = false, largo = false }: { rotulo: string; valor: string; mono?: boolean; largo?: boolean }) {
  return (
    <View style={{ flex: largo ? 1.5 : 1, gap: 4 }}>
      <Rotulo>{rotulo}</Rotulo>
      <Text style={{ fontSize: 10.5, color: MURIKI_INK, fontFamily: mono ? MURIKI_MONO : undefined }}>{valor}</Text>
    </View>
  )
}

function Codigo({ indice, codigo }: { indice: number; codigo: string }) {
  return (
    <View
      style={{
        width: "48%",
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingTop: 7,
        paddingBottom: 7,
        borderBottomWidth: 1,
        borderBottomColor: RULE,
      }}
    >
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 999,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: AZUL_CLARO,
        }}
      >
        <Text style={{ fontFamily: MURIKI_MONO, fontSize: 9, color: MURIKI_BLUE }}>{String(indice + 1)}</Text>
      </View>
      <Text style={{ flexGrow: 1, fontFamily: MURIKI_MONO, fontSize: 15, letterSpacing: 2, color: MURIKI_INK }}>
        {codigo}
      </Text>
      <View style={{ width: 13, height: 13, borderRadius: 3, borderWidth: 1.2, borderColor: "#b9b5aa" }} />
    </View>
  )
}

function Passo({ n, titulo, texto }: { n: number; titulo: string; texto: string }) {
  return (
    <View style={{ flex: 1, gap: 6 }}>
      <View
        style={{
          width: 24,
          height: 24,
          borderRadius: 999,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: MURIKI_BLUE,
        }}
      >
        <Text style={{ fontSize: 11, fontWeight: 600, color: "#ffffff" }}>{String(n)}</Text>
      </View>
      <Text style={{ fontSize: 10.5, fontWeight: 600, color: MURIKI_INK }}>{titulo}</Text>
      <Text style={{ fontSize: 9.5, lineHeight: 1.5, color: MUTED }}>{texto}</Text>
    </View>
  )
}

function Escudo() {
  return (
    <Svg width={18} height={18} viewBox="0 0 16 16">
      <Path
        d="M8 1.8l5.2 2v4c0 3.2-2.2 5.4-5.2 6.4-3-1-5.2-3.2-5.2-6.4v-4z"
        fill="none"
        stroke="#6E4C00"
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
      <Path d="M5.8 8.2l1.6 1.6 3-3" fill="none" stroke="#6E4C00" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}

/**
 * Passe estas opções no `render()` do takumi: a faixa azul vai até a borda,
 * então a página não tem margem. O documento cuida dos próprios respiros.
 */
export const RECOVERY_CODES_RENDER_OPTIONS = { size: "a4", margin: 0 } as const

export function RecoveryCodesDocument({
  codes,
  email,
  name,
  generatedAt,
  product = "Backoffice",
  lostAccessHint = "Usou todos ou perdeu este papel? Peça a um admin para redefinir seu autenticador. Os códigos antigos deixam de valer quando você configura um novo.",
}: RecoveryCodesDocumentProps) {
  return (
    <Document title={`Códigos de recuperação · Muriki ${product}`}>
      <Page size="A4" style={{ position: "relative", minHeight: "100%", backgroundColor: "#ffffff" }}>
        <PdfcnThemeProvider theme={murikiTheme}>
          <Faixa product={product} />

          <View style={{ paddingTop: 22, paddingLeft: MARGEM, paddingRight: MARGEM, paddingBottom: 64, gap: 16 }}>
            <View style={{ flexDirection: "row", gap: 20 }}>
              {name ? <Dado rotulo="Nome" valor={name} /> : null}
              <Dado rotulo="Conta" valor={email} mono />
              <Dado rotulo="Gerados em" valor={formatGeneratedAt(generatedAt)} largo />
            </View>

            <View
              style={{
                gap: 6,
                paddingTop: 18,
                paddingBottom: 14,
                paddingLeft: 22,
                paddingRight: 22,
                borderRadius: 16,
                borderWidth: 1.5,
                borderStyle: "dashed",
                borderColor: "#c9c5ba",
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Rotulo color={MURIKI_BLUE}>{`${codes.length} códigos · cada um vale uma vez`}</Rotulo>
                <Rotulo>Recorte e guarde</Rotulo>
              </View>
              <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
                {codes.map((codigo, i) => (
                  <Codigo key={codigo} indice={i} codigo={codigo} />
                ))}
              </View>
            </View>

            <View style={{ gap: 12 }}>
              <Rotulo>Como usar</Rotulo>
              <View style={{ flexDirection: "row", gap: 22 }}>
                <Passo n={1} titulo="Na tela do código" texto='Toque em "Use um código de recuperação".' />
                <Passo n={2} titulo="Digite um código" texto="Qualquer um da lista, com ou sem hífen." />
                <Passo n={3} titulo="Risque o usado" texto="Ele não entra de novo." />
              </View>
            </View>

            <View
              style={{
                flexDirection: "row",
                gap: 12,
                paddingTop: 14,
                paddingBottom: 14,
                paddingLeft: 16,
                paddingRight: 16,
                borderRadius: 12,
                backgroundColor: AMARELO_CLARO,
              }}
            >
              <Escudo />
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={{ fontSize: 10.5, fontWeight: 600, color: "#6E4C00" }}>Guarde como uma senha</Text>
                <Text style={{ fontSize: 9.5, lineHeight: 1.5, color: "#6E4C00" }}>
                  Imprima e guarde num lugar seguro, ou salve num cofre de senhas. Não mande por e-mail ou chat: a equipe da
                  Muriki nunca pede estes códigos.
                </Text>
              </View>
            </View>

            <Text style={{ fontSize: 9.5, lineHeight: 1.5, color: MUTED }}>{lostAccessHint}</Text>
          </View>

          <View
            fixed
            style={{
              position: "absolute",
              left: MARGEM,
              right: MARGEM,
              bottom: 26,
              flexDirection: "row",
              justifyContent: "space-between",
              paddingTop: 10,
              borderTopWidth: 1,
              borderTopColor: RULE,
            }}
          >
            <Rotulo>{`muriki / ${product.toLowerCase()}`}</Rotulo>
            <Rotulo>Documento pessoal · não compartilhe</Rotulo>
          </View>
        </PdfcnThemeProvider>
      </Page>
    </Document>
  )
}
