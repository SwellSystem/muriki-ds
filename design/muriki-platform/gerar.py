import json, os
from telas import montar
from pecas import AQUI, W, H

SAIDA = os.path.join(AQUI, 'project')
os.makedirs(SAIDA, exist_ok=True)

# A ordem do canvas é a jornada: a entrada, o primeiro acesso e o convite, uma fileira cada, com a
# escura logo abaixo da clara. O número no título do quadro é o passo na jornada.
# (id, arquivo base, título da tela, título do quadro, coluna, fileira no claro, fileira no escuro)
JORNADA = [
    # a entrada: a tela de login compartilhada com o Code e o Backoffice, só com a marca do Platform
    ('entrar', 'Entrar', 'Entrar', 'Entrar · a tela compartilhada (auth-page + login-page)'),
    ('criar_conta', 'CriarConta', 'Criar conta', 'Criar conta · a tela compartilhada (nome + e-mail, Turnstile)'),
    # o primeiro acesso: do lado do login (o palco à esquerda, o formulário à direita)
    ('codigo', 'OnboardingCodigo', 'Primeiro acesso', 'Código por e-mail · 1 de 3 (só sem a prova da caixa)'),
    ('identidade_vazio', 'OnboardingIdentidade', 'Primeiro acesso', 'Workspace · vazio'),
    ('identidade_ocupado', 'OnboardingIdentidadeOcupado', 'Primeiro acesso', 'Workspace · o @usuário ocupado e o endereço reservado'),
    ('identidade_livre', 'OnboardingIdentidadeLivre', 'Primeiro acesso', 'Workspace · tudo livre, o botão ligado'),
    ('identidade_foco', 'OnboardingIdentidadeFoco', 'Primeiro acesso', 'Workspace · só para mim (Muriki Focus)'),
    ('identidade_movimento', 'OnboardingIdentidadeMovimento', 'Primeiro acesso', 'Workspace · movimento (Play)'),
    ('ja_tem_conta', 'OnboardingContaMuriki', 'Primeiro acesso',
     'Já tem conta Muriki · 2 de 3 (vem do Code: sem o campo do @usuário)'),
    ('convidar', 'OnboardingConvidar', 'Primeiro acesso', 'Convidar o time · 3 de 3: adicionar, a lista e as pessoas no plano'),
    # o convite
    ('convite', 'Convite', 'Convite', 'Convite · o aceite, sem sessão: entrar ou criar conta'),
    ('convite_logado', 'ConviteLogado', 'Convite', 'Convite · o aceite, com sessão: aceitar convite'),
    ('convidado', 'OnboardingConvidado', 'Primeiro acesso', 'Convidado · 1 de 1: o @usuário e os termos, antes do aceite (2 de 2 depois do código)'),
    ('convidado_ocupado', 'OnboardingConvidadoOcupado', 'Primeiro acesso', 'Convidado · o @usuário ocupado: fora da prévia, o botão desligado'),
    ('convite_invalido', 'ConviteInvalido', 'Convite', 'Convite · inválido ou vencido (o 422 uniforme, sem o motivo)'),
    # dentro do produto: as configurações do workspace (bloco platform-members)
    ('membros_owner', 'WorkspaceMembros', 'Membros', 'Membros · vista do owner (o único owner: "Sair" desligado, com o motivo)'),
    ('membros_maintainer', 'WorkspaceMembrosMaintainer', 'Membros', 'Membros · vista da maintainer (gere só member e guest)'),
    ('convites', 'WorkspaceConvites', 'Convites', 'Convites · pendente, vencido, aceito, revogado e substituído'),
    ('convidar_limite', 'WorkspaceConvidarLimite', 'Convidar', 'Convidar · o aviso de limite do Free e do Pro (5 pessoas)'),
    # dentro do produto: planos e cobrança (bloco platform-billing)
    ('planos_teste', 'WorkspacePlanos', 'Planos', 'Planos · workspace de empresa, mensal, no teste do Pro (a moeda ainda troca)'),
    ('planos_anual', 'WorkspacePlanosAnual', 'Planos', 'Planos · anual, por pessoa/ano como vem da API; a moeda travada'),
    ('planos_carregando', 'WorkspacePlanosCarregando', 'Planos', 'Planos · carregando (o esqueleto, o Pro já no destaque)'),
    ('planos_pessoal', 'WorkspacePlanosPessoal', 'Planos', 'Planos · workspace pessoal: Free e Pro, só você, sem o Enterprise'),
    ('assinar_pro', 'WorkspaceAssinarPro', 'Assinar o Pro', 'Assinar o Pro · empresa: o CNPJ e a razão social, por assento; o cupom fechado'),
    ('assinar_cupom', 'WorkspaceAssinarCupom', 'Assinar o Pro', 'Assinar o Pro · o cupom aplicado (só percentual): o desconto e o total riscado'),
    ('assinar_pessoal', 'WorkspaceAssinarProPessoal', 'Assinar o Pro', 'Assinar o Pro · workspace pessoal: o CPF e 1 assento, no anual'),
    ('assinar_erro', 'WorkspaceAssinarErro', 'Assinar o Pro', 'Assinar o Pro · o CNPJ com o dígito verificador errado'),
    ('assinar_eua', 'WorkspaceAssinarSemFiscal', 'Assinar o Pro', 'Assinar o Pro · empresa dos EUA: sem campo fiscal, em USD'),
    ('comercial', 'WorkspaceComercial', 'Falar com o comercial', 'Falar com o comercial · a página: quantas pessoas e a mensagem; o resumo do Enterprise e o que acontece depois'),
    ('comercial_enviado', 'WorkspaceComercialEnviado', 'Falar com o comercial', 'Falar com o comercial · enviado: a confirmação no lugar do formulário'),
    ('cobranca', 'WorkspaceCobranca', 'Cobrança', 'Cobrança · a próxima cobrança, os assentos e o que mudou no período'),
    ('cobranca_teste', 'WorkspaceCobrancaTeste', 'Cobrança', 'Cobrança · no teste do Pro: a contagem até o fim, sem cobrança prevista'),
]
FILEIRAS = [  # (chave da nota, quantas telas, texto da nota)
    ('entrada', 2, 'Entrada: a tela de login compartilhada com o Code e o Backoffice'),
    ('primeiroAcesso', 8, 'Primeiro acesso: o código por e-mail, o workspace (para quem é, o @usuário, o nome, o endereço e os termos '
                          'numa tela só, sem CPF e sem plano), quem já tem conta Muriki e convidar o time; do lado do login: o palco '
                          'com a prévia ao vivo à esquerda, o formulário à direita'),
    ('convite', 5, 'Convite: o aceite mostra quem convidou, o workspace, o papel e o e-mail mascarado; o token nunca aparece. '
                  'Quem ainda não tem o onboarding do Platform passa pelo passo do convidado antes do aceite'),
    ('membros', 4, 'Workspace · membros e convites: dentro do produto, nas configurações do workspace; cada papel só vê as '
                   'ações que pode usar'),
    ('cobranca', 13, 'Workspace · planos e cobrança: dentro do produto; o preço por pessoa, como vem da API; o Code Pro só no Pro e '
                     'no Enterprise, na assinatura paga. Assinar e falar com o comercial abrem uma página de dentro do workspace (não é etapa do onboarding)'),
]
TELAS, _i = [], 0
for fileira, (_, n, _) in enumerate(FILEIRAS):
    for col in range(n):
        id_, base_nome, titulo, quadro = JORNADA[_i]
        _i += 1
        TELAS.append((id_, base_nome, titulo, f'{_i} · {quadro}', col, 2 * fileira, 2 * fileira + 1))

PASSO_X, LINHA_Y = W + 80, H + 420

canvas_path = os.path.join(SAIDA, 'canvas.json')
canvas = json.load(open(canvas_path)) if os.path.exists(canvas_path) else {}
canvas.setdefault('v', 3)
# data fixa: o gerador é determinístico (rodar de novo dá os mesmos arquivos)
canvas.setdefault('createdOnFiles', dict(v=1, at='2026-10-11T00:00:00Z'))
canvas.setdefault('title', 'Muriki Platform')
canvas.setdefault('launch', dict(view='canvas'))
canvas.setdefault('pages', [])
canvas.setdefault('designSystems', [])
boards = canvas.setdefault('boards', {})
order = canvas.setdefault('order', [])

# o que este gerador já criou e não gera mais: as telas de entrada próprias do A2 (o app usa o login
# do DS, que Entrar e CriarConta mostram)
REMOVIDAS = ['EntrarPasskey', 'EntrarSegundoFator', 'EntrarCodigoBackup', 'EsqueciSenha', 'RedefinirSenha',
             'ConfiraEmail', 'CriarSenha',
             # as três variantes de convidar o time: a tela de cima ficou com a lista
             'OnboardingConvidarA', 'OnboardingConvidarB', 'OnboardingConvidarC',
             # o checkout da primeira rodada do C (as telas viraram WorkspaceAssinar*) e a variante B da
             # terceira, que virou o WorkspaceAssinarTeam
             'CheckoutFiscalSolo', 'CheckoutFiscalTeam', 'CheckoutFiscalTeamErro', 'WorkspaceAssinarTeamPagina',
             # o Solo e o Team saíram dos planos (F0): o checkout é sempre do Pro
             'WorkspaceAssinarTeam', 'WorkspaceAssinarSolo']
for base_nome in REMOVIDAS:
    for arquivo in (f'{base_nome}.dc.html', f'{base_nome}Escuro.dc.html'):
        boards.pop(arquivo, None)
        if arquivo in order:
            order.remove(arquivo)
        if os.path.exists(os.path.join(SAIDA, arquivo)):
            os.remove(os.path.join(SAIDA, arquivo))

gerados = []
for id_, base_nome, titulo, quadro, col, lin_claro, lin_escuro in TELAS:
    for tema in ('claro', 'escuro'):
        arquivo = f'{base_nome}{"" if tema == "claro" else "Escuro"}.dc.html'
        open(os.path.join(SAIDA, arquivo), 'w').write(montar(dict(id=id_, titulo=titulo), tema))
        b = boards.setdefault(arquivo, {})
        b.update(x=col * PASSO_X, y=(lin_claro if tema == 'claro' else lin_escuro) * LINHA_Y, w=W, h=H,
                 title=quadro if tema == 'claro' else f'{quadro} · escuro', is_interactive=True)
        gerados.append(arquivo)
# a ordem dos quadros é a da jornada; o que não é deste gerador fica depois
order[:] = gerados + [a for a in order if a not in gerados]

# o editor limita a largura de uma nota a 8000px e guarda w: 240
largura = lambda n: min(n * W + (n - 1) * 80, 8000)
notas = canvas.setdefault('notes', {})
# só as notas de título que este gerador criou; nota de outro tipo (posta à mão) fica
for chave in ('acesso', 'acessoEscuro', 'onboarding', 'onboardingEscuro', 'primeiroConvite', 'primeiroConviteEscuro',
              'convidarPlano', 'convidarPlanoEscuro'):
    if notas.get(chave, {}).get('kind') == 'title1':
        del notas[chave]
for fileira, (chave, n, texto) in enumerate(FILEIRAS):
    for lin, ch, tx in [(2 * fileira, chave, texto), (2 * fileira + 1, f'{chave}Escuro', f'{texto.split(":")[0]} no tema escuro')]:
        notas.setdefault(ch, {}).update(x=0, y=lin * LINHA_Y - 300, text=tx, kind='title1', maxW=largura(n))
        notas[ch].setdefault('w', 240)

# a nota da variante sem campo fiscal, em cima do quadro dela
_col, _lin = next((c, l) for i, _, _, _, c, l, _ in TELAS if i == 'assinar_eua')
notas.setdefault('semFiscal', {}).update(
    x=_col * PASSO_X, y=_lin * LINHA_Y - 190,
    text='Fora do Brasil não há campo fiscal: o país declarado no checkout manda (aqui, EUA, em USD), e o número fiscal da '
         'empresa, se houver, é pedido no Stripe. Nos Planos, antes da compra, a moeda segue a região do navegador, só para exibir.')
notas['semFiscal'].setdefault('w', 240)

# a nota do passo do convidado, em cima do primeiro quadro dele
_col, _lin = next((c, l) for i, _, _, _, c, l, _ in TELAS if i == 'convidado')
notas.setdefault('convidado', {}).update(
    x=_col * PASSO_X, y=_lin * LINHA_Y - 190,
    text='Aparece para o convidado sem o onboarding do Platform ou sem @usuário, antes do aceite: a API exige os dois. '
         'Não cria workspace; o botão conclui o onboarding e aceita o convite.')
notas['convidado'].setdefault('w', 240)

json.dump(canvas, open(canvas_path, 'w'), ensure_ascii=False, indent=2)
print(f'{len(gerados)} quadros em {SAIDA}')
