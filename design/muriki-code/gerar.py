import json, os
from datetime import datetime, timezone
from telas import *

SAIDA = os.path.join(AQUI, 'project')
os.makedirs(SAIDA, exist_ok=True)

# (id, arquivo base, título da tela, título do quadro, coluna, fileira no claro, fileira no escuro)
TELAS = [
    ('entrar', 'Entrar', 'Entrar', 'Entrar · conta Muriki', 0, 0, 1),
    ('criar', 'CriarConta', 'Criar conta', 'Criar conta', 1, 0, 1),
    ('passkey', 'Passkey', 'Passkey', 'Entrar · passkey', 9, 0, 1),
    ('plano_inicial', 'PlanoInicial', 'Escolha do plano', 'Primeiro acesso · 3 · plano e cupom', 4, 0, 1),
    ('verificacao', 'Verificacao', 'Confirme seu email', 'Primeiro acesso · 1 · código por email', 2, 0, 1),
    ('perfil', 'Perfil', 'Seu perfil', 'Primeiro acesso · 2 · perfil (conclui o onboarding; 7 dias de Pro)', 3, 0, 1),
    ('preferencias', 'Preferencias', 'Perfil de aprendizado', 'Primeiro acesso · perfil de aprendizado (opcional)', 6, 0, 1),
    ('pagamento', 'Pagamento', 'Pagamento', 'Volta do pagamento · confirmado ou cancelado', 5, 0, 1),
    ('primeiro', 'PrimeiroExercicio', 'Primeiro exercício', 'Primeiro exercício · guia de três passos', 7, 0, 1),
    ('vazio', 'PerfilVazio', 'Perfil vazio', 'Evolução · perfil antes da primeira evidência', 8, 0, 1),
    ('evolucao', 'Main', 'Evolução', 'Evolução · declarado, observado e estado', 0, 2, 3),
    ('competencia', 'Competencia', 'Testing', 'Competência · Testing: caminho, histórico e trajetória', 1, 2, 3),
    ('exercicio', 'Exercicio', 'Exercício', 'Exercício · editor, testes e explicação', 2, 2, 3),
    ('avaliacao', 'Avaliacao', 'Avaliação', 'Avaliação · rubrica, explicação e o porquê', 3, 2, 3),
    ('playground', 'Playground', 'Playground', 'Playground · código livre com o Peer', 4, 2, 3),
    ('inicio', 'Inicio', 'Início', 'Início · o primeiro dia, antes de qualquer prática', 5, 2, 3),
    ('peer', 'Peer', 'Peer na IDE', 'Peer na IDE', 0, 4, 5),
    ('conectar', 'Conectar', 'Conectar IDE', 'Conectar IDE · código no navegador', 1, 4, 5),
    ('planos', 'Planos', 'Planos', 'Planos · Starter e Pro', 2, 4, 5),
    ('codigo', 'SegundoFator', 'Segundo fator', 'Entrar · segundo fator (app ou código de backup)', 0, 6, 7),
    ('esqueci', 'EsqueciSenha', 'Esqueci a senha', 'Conta · esqueci a senha', 1, 6, 7),
    ('criarSenha', 'CriarSenha', 'Criar senha', 'Conta · criar senha (link do email)', 2, 6, 7),
    ('redefinir', 'RedefinirSenha', 'Redefinir senha', 'Conta · redefinir senha (link do email)', 3, 6, 7),
    ('suspenso', 'Suspenso', 'Acesso suspenso', 'Conta · acesso ao Code suspenso pela equipe', 4, 6, 7),
    ('conta_dados', 'ContaDados', 'Minha conta', 'Minha conta · meus dados, email e excluir conta', 0, 8, 9),
    ('conta_aprendizado', 'ContaAprendizado', 'Minha conta', 'Minha conta · perfil de aprendizado', 1, 8, 9),
    ('conta_seguranca', 'ContaSeguranca', 'Minha conta', 'Minha conta · senha, segundo fator, passkeys e sessões', 2, 8, 9),
    ('conta_plano', 'ContaPlano', 'Minha conta', 'Minha conta · plano e portal do Stripe', 3, 8, 9),
    ('confirmar_email', 'ConfirmarEmail', 'Confirmar email', 'Minha conta · confirmar o email novo (link do email)', 4, 8, 9),
    ('conta_passkey', 'ContaPasskey', 'Minha conta', 'Minha conta · adicionar passkey', 5, 8, 9),
    ('conta_2fa', 'ContaAtivar2FA', 'Minha conta', 'Minha conta · ativar a verificação em duas etapas', 6, 8, 9),
    ('conta_codigos', 'ContaCodigos', 'Minha conta', 'Minha conta · códigos de backup novos', 7, 8, 9),
    ('conta_passkey_editar', 'ContaPasskeyEditar', 'Minha conta', 'Minha conta · renomear e remover passkey', 8, 8, 9),
    ('conta_sessoes', 'ContaSessoes', 'Minha conta', 'Minha conta · encerrar sessões', 9, 8, 9),
    ('trilhas_boas_vindas', 'TrilhasBoasVindas', 'Trilhas', 'Trilhas · boas-vindas: o começo montado pelo primeiro acesso, em três passos', 0, 12, 13),
    ('trilhas', 'Trilhas', 'Trilhas', 'Trilhas · a lista, com o continue de onde parou', 1, 12, 13),
    ('trilhas_vazia', 'TrilhasVazia', 'Trilhas', 'Trilhas · antes da primeira etapa: por onde começar', 6, 12, 13),
    ('trilha', 'Trilha', 'Testes que dão confiança', 'Trilha · o mapa: regiões, estações, você está aqui e os marcos de nível', 2, 12, 13),
    ('trilha_lista', 'TrilhaLista', 'Testes que dão confiança', 'Trilha · a lista: o mesmo caminho em linha', 3, 12, 13),
    ('catalogo', 'Exercicios', 'Exercícios', 'Exercícios · o catálogo, com filtros e o uso do mês', 4, 12, 13),
    ('peer_web', 'PeerWeb', 'Peer', 'Peer na web · conversas da IDE, o trecho visto e onde ele olha', 5, 12, 13),
    ('sem_internet', 'SemInternet', 'Sem internet', 'Sistema · sem internet', 0, 10, 11),
    ('nao_encontrada', 'NaoEncontrada', 'Página não encontrada', 'Sistema · página não encontrada (404)', 1, 10, 11),
    ('erro', 'ErroInesperado', 'Erro inesperado', 'Sistema · erro inesperado (500), com o código para o suporte', 2, 10, 11),
    ('sessao', 'SessaoExpirada', 'Sessão expirada', 'Sistema · sessão expirada (401)', 3, 10, 11),
    ('manutencao', 'Manutencao', 'Manutenção', 'Sistema · manutenção (503)', 4, 10, 11),
    ('nao_encontrada_backoffice', 'NaoEncontradaBackoffice', 'Página não encontrada', 'Sistema · a mesma 404 no Backoffice (só o produto muda)', 5, 10, 11),
]

PASSO_X, LINHA_Y = W + 80, H + 420

canvas_path = os.path.join(SAIDA, 'canvas.json')
canvas = json.load(open(canvas_path)) if os.path.exists(canvas_path) else {}
canvas.setdefault('v', 3)
canvas.setdefault('createdOnFiles', dict(v=1, at=datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')))
canvas.setdefault('title', 'Muriki Code')
canvas.setdefault('launch', dict(view='canvas'))
canvas.setdefault('pages', [])
canvas.setdefault('designSystems', [])
boards = canvas.setdefault('boards', {})
order = canvas.setdefault('order', [])

# a Jornada e o Ajuste viraram as Preferências (a API guarda experiência, linguagens e objetivos)
for velho in ('Jornada.dc.html', 'JornadaEscuro.dc.html', 'Ajuste.dc.html', 'AjusteEscuro.dc.html'):
    boards.pop(velho, None)
    if velho in order:
        order.remove(velho)
    if os.path.exists(os.path.join(SAIDA, velho)):
        os.remove(os.path.join(SAIDA, velho))

gerados = []
for id_, base_nome, titulo, quadro, col, lin_claro, lin_escuro in TELAS:
    for tema in ('claro', 'escuro'):
        arquivo = f'{base_nome}{"" if tema == "claro" else "Escuro"}.dc.html'
        tela = dict(id=id_, titulo=titulo)
        open(os.path.join(SAIDA, arquivo), 'w').write(montar(tela, tema))
        x = col * PASSO_X
        y = (lin_claro if tema == 'claro' else lin_escuro) * LINHA_Y
        b = boards.setdefault(arquivo, {})
        b.update(x=x, y=y, w=W, h=H, title=quadro if tema == 'claro' else f'{quadro} · escuro', is_interactive=True)
        if arquivo not in order:
            order.append(arquivo)
        gerados.append(arquivo)

# o canvas limita a nota a 8000 de largura e guarda w: 240; o gerador segue o mesmo para não desfazer
largura = lambda n: min(n * W + (n - 1) * 80, 8000)
notas = canvas.setdefault('notes', {})
for chave, lin, n, texto in [
    ('jornada', 0, 10, 'Entrada e primeiro acesso: código por email, perfil, plano, pagamento, perfil de aprendizado e o primeiro exercício'),
    ('jornadaEscuro', 1, 10, 'Entrada e primeiro acesso no tema escuro'),
    ('web', 2, 6, 'Code web: perfil, competência, exercício, avaliação, playground e o início do primeiro dia'),
    ('webEscuro', 3, 6, 'Code web no tema escuro'),
    ('ide', 4, 3, 'Peer na IDE, conta e plano'),
    ('ideEscuro', 5, 3, 'Peer na IDE, conta e plano no tema escuro'),
    ('conta', 6, 5, 'Conta: segundo fator, esqueci a senha, criar e redefinir senha pelo link do email, acesso suspenso'),
    ('contaEscuro', 7, 5, 'Conta no tema escuro'),
    ('minhaConta', 8, 10, 'Minha conta: meus dados, aprendizado, segurança, plano, confirmar o email novo e os fluxos da segurança'),
    ('minhaContaEscuro', 9, 10, 'Minha conta no tema escuro'),
    ('sistema', 10, 6, 'Páginas de sistema do hub: sem internet, 404, erro, sessão expirada e manutenção — as mesmas no Code, no Backoffice e no Platform'),
    ('sistemaEscuro', 11, 6, 'Páginas de sistema no tema escuro'),
    ('aprenderMais', 12, 7, 'Trilhas, catálogo de exercícios e Peer na web: o formato das trilhas é proposta (a visão ainda deixa em aberto)'),
    ('aprenderMaisEscuro', 13, 7, 'Trilhas, exercícios e Peer na web no tema escuro'),
]:
    notas.setdefault(chave, {}).update(x=0, y=lin * LINHA_Y - 300, text=texto, kind='title1', maxW=largura(n))
    notas[chave].setdefault('w', 240)

json.dump(canvas, open(canvas_path, 'w'), ensure_ascii=False, indent=1)
print(f'{len(gerados)} quadros em {SAIDA}')
