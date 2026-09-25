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
    ('plano_inicial', 'PlanoInicial', 'Escolha do plano', 'Primeiro acesso · 1 · escolha do plano', 2, 0, 1),
    ('verificacao', 'Verificacao', 'Confirme seu email', 'Primeiro acesso · 2 · código por email', 3, 0, 1),
    ('perfil', 'Perfil', 'Seu perfil', 'Primeiro acesso · 3 · perfil (o mesmo do Platform)', 4, 0, 1),
    ('preferencias', 'Preferencias', 'Preferências', 'Primeiro acesso · 4 · experiência, linguagens e objetivos', 5, 0, 1),
    ('pagamento', 'Pagamento', 'Pagamento', 'Volta do pagamento · confirmado ou cancelado', 6, 0, 1),
    ('primeiro', 'PrimeiroExercicio', 'Primeiro exercício', 'Primeiro exercício · guia de três passos', 7, 0, 1),
    ('vazio', 'PerfilVazio', 'Perfil vazio', 'Evolução · perfil antes da primeira evidência', 8, 0, 1),
    ('evolucao', 'Main', 'Evolução', 'Evolução · declarado, observado e estado', 0, 2, 3),
    ('competencia', 'Competencia', 'Testing', 'Competência · Testing: caminho, histórico e trajetória', 1, 2, 3),
    ('exercicio', 'Exercicio', 'Exercício', 'Exercício · editor, testes e explicação', 2, 2, 3),
    ('avaliacao', 'Avaliacao', 'Avaliação', 'Avaliação · rubrica, explicação e o porquê', 3, 2, 3),
    ('playground', 'Playground', 'Playground', 'Playground · código livre com o Peer', 4, 2, 3),
    ('peer', 'Peer', 'Peer na IDE', 'Peer na IDE', 0, 4, 5),
    ('conectar', 'Conectar', 'Conectar IDE', 'Conectar IDE · código no navegador', 1, 4, 5),
    ('planos', 'Planos', 'Planos', 'Planos · Starter e Pro', 2, 4, 5),
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

largura = lambda n: n * W + (n - 1) * 80
notas = canvas.setdefault('notes', {})
for chave, lin, n, texto in [
    ('jornada', 0, 10, 'Entrada e primeiro acesso: plano, código por email, perfil, preferências, pagamento e o primeiro exercício'),
    ('jornadaEscuro', 1, 10, 'Entrada e primeiro acesso no tema escuro'),
    ('web', 2, 5, 'Code web: perfil, competência, exercício, avaliação e playground'),
    ('webEscuro', 3, 5, 'Code web no tema escuro'),
    ('ide', 4, 3, 'Peer na IDE, conta e plano'),
    ('ideEscuro', 5, 3, 'Peer na IDE, conta e plano no tema escuro'),
]:
    notas.setdefault(chave, {}).update(x=0, y=lin * LINHA_Y - 300, text=texto, kind='title1', maxW=largura(n))

json.dump(canvas, open(canvas_path, 'w'), ensure_ascii=False, indent=1)
print(f'{len(gerados)} quadros em {SAIDA}')
