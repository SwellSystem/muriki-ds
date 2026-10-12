import json, os
from telas import montar
from pecas import AQUI, W, H

SAIDA = os.path.join(AQUI, 'project')
os.makedirs(SAIDA, exist_ok=True)

# (id, arquivo base, título da tela, título do quadro, coluna, fileira no claro, fileira no escuro)
TELAS = [
    ('identidade_vazio', 'OnboardingIdentidade', 'Primeiro acesso',
     'Onboarding · @usuário e workspace · vazio', 0, 0, 1),
    ('identidade_ocupado', 'OnboardingIdentidadeOcupado', 'Primeiro acesso',
     'Onboarding · @usuário e workspace · o @usuário ocupado e o endereço reservado', 1, 0, 1),
    ('identidade_livre', 'OnboardingIdentidadeLivre', 'Primeiro acesso',
     'Onboarding · @usuário e workspace · tudo livre, o botão ligado', 2, 0, 1),
    ('identidade_foco', 'OnboardingIdentidadeFoco', 'Primeiro acesso',
     'Onboarding · @usuário e workspace · só para mim (Muriki Focus)', 3, 0, 1),
    ('identidade_movimento', 'OnboardingIdentidadeMovimento', 'Primeiro acesso',
     'Onboarding · movimento (Play)', 4, 0, 1),
    # A2: o primeiro acesso que falta e o convite (fileiras 2 e 3)
    ('codigo', 'OnboardingCodigo', 'Primeiro acesso', 'Primeiro acesso · 1 de 3 · código por e-mail (só sem a prova da caixa)', 0, 2, 3),
    ('ja_tem_conta', 'OnboardingContaMuriki', 'Primeiro acesso',
     'Primeiro acesso · 2 de 3 · você já tem conta Muriki (vem do Code: sem o campo do @usuário)', 1, 2, 3),
    ('convidar', 'OnboardingConvidar', 'Primeiro acesso', 'Primeiro acesso · 3 de 3 · convidar o time: adicionar, a lista e as pessoas no plano', 2, 2, 3),
    ('convite', 'Convite', 'Convite', 'Convite · o aceite, sem sessão: entrar ou criar conta', 3, 2, 3),
    ('convite_logado', 'ConviteLogado', 'Convite', 'Convite · o aceite, com sessão: aceitar convite', 4, 2, 3),
    ('convite_invalido', 'ConviteInvalido', 'Convite', 'Convite · inválido ou vencido (o 422 uniforme, sem o motivo)', 5, 2, 3),
]

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

# o que este gerador já criou e não gera mais: as telas de entrada do A2 (o app usa o login do DS)
REMOVIDAS = ['Entrar', 'EntrarPasskey', 'EntrarSegundoFator', 'EntrarCodigoBackup', 'EsqueciSenha', 'RedefinirSenha',
             'CriarConta', 'ConfiraEmail', 'CriarSenha',
             # as três variantes de convidar o time: a tela de cima ficou com a lista
             'OnboardingConvidarA', 'OnboardingConvidarB', 'OnboardingConvidarC']
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
        if arquivo not in order:
            order.append(arquivo)
        gerados.append(arquivo)

# o editor limita a largura de uma nota a 8000px e guarda w: 240
largura = lambda n: min(n * W + (n - 1) * 80, 8000)
notas = canvas.setdefault('notes', {})
# só as notas de título que este gerador criou; nota de outro tipo (posta à mão) fica
for chave in ('entrada', 'entradaEscuro', 'convidarPlano', 'convidarPlanoEscuro'):
    if notas.get(chave, {}).get('kind') == 'title1':
        del notas[chave]
for chave, lin, n, texto in [
    ('onboarding', 0, 4, 'Onboarding do Platform: para quem é, o @usuário, o workspace e os termos numa tela só, sem CPF e sem plano; '
                         'cabe sem rolar; à direita, a prévia ao vivo: Muriki Projects (time) ou Muriki Focus (só para mim), no estado final'),
    ('onboardingEscuro', 1, 4, 'Onboarding no tema escuro'),
    ('primeiroConvite', 2, 6, 'Primeiro acesso e convite: o código por e-mail, quem já tem conta Muriki e convidar o time; '
                              'o aceite de convite mostra o workspace, o papel e o e-mail mascarado, e o token nunca aparece'),
    ('primeiroConviteEscuro', 3, 6, 'Primeiro acesso e convite no tema escuro'),
]:
    notas.setdefault(chave, {}).update(x=0, y=lin * LINHA_Y - 300, text=texto, kind='title1', maxW=largura(n))
    notas[chave].setdefault('w', 240)

json.dump(canvas, open(canvas_path, 'w'), ensure_ascii=False, indent=2)
print(f'{len(gerados)} quadros em {SAIDA}')
