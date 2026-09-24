import json, os
from datetime import datetime, timezone
from telas import *  # noqa: F401,F403
from pecas import AQUI, W, H

SAIDA = os.path.join(AQUI, 'project')
os.makedirs(SAIDA, exist_ok=True)

# (id, arquivo base, título da tela, título do quadro, coluna, fileira no claro, fileira no escuro)
TELAS = [
    ('entrar', 'Entrar', 'Entrar', 'Entrar · e-mail e senha', 0, 0, 1),
    ('totp', 'SegundoFator', 'Segundo fator', 'Segundo fator · um quadrado por dígito', 1, 0, 1),
    ('esqueci', 'EsqueciSenha', 'Esqueci a senha', 'Esqueci a senha · o link por e-mail', 2, 0, 1),
    ('novasenha', 'NovaSenha', 'Senha nova', 'Senha nova · vinda do link', 3, 0, 1),
    ('convite', 'Convite', 'Convite', 'Primeiro acesso · aceitar o convite', 4, 0, 1),
    ('autenticador', 'Autenticador', 'Autenticador', 'Primeiro acesso · configurar o autenticador', 5, 0, 1),
    ('codigos', 'CodigosRecuperacao', 'Códigos de recuperação', 'Primeiro acesso · dez códigos, uma vez', 6, 0, 1),
    ('inicio', 'Inicio', 'Início', 'Início · clientes, vendido até agora e planos', 0, 2, 3),
    ('clientes', 'Clientes', 'Clientes', 'Clientes · o molde do CRUD', 1, 2, 3),
    ('cliente', 'ClienteEditar', 'Editar cliente', 'Clientes · editar no sheet (criar é o mesmo, vazio)', 2, 2, 3),
    ('revogar', 'Revogar', 'Revogar acesso', 'Clientes · revogar acesso no alert-dialog', 3, 2, 3),
    ('planos', 'Planos', 'Planos', 'Planos · lista', 0, 4, 5),
    ('plano', 'Plano', 'Pro', 'Plano · dados e features', 1, 4, 5),
    ('features', 'Features', 'Matriz de features', 'Planos · matriz de features', 2, 4, 5),
    ('cupons', 'Cupons', 'Cupons', 'Cupons · lista', 3, 4, 5),
    ('cupom', 'CupomNovo', 'Novo cupom', 'Cupons · novo cupom no sheet', 4, 4, 5),
]

PASSO_X, LINHA_Y = W + 80, H + 420

canvas_path = os.path.join(SAIDA, 'canvas.json')
canvas = json.load(open(canvas_path)) if os.path.exists(canvas_path) else {}
canvas.setdefault('v', 3)
canvas.setdefault('createdOnFiles', dict(v=1, at=datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')))
canvas.setdefault('title', 'Muriki Backoffice')
canvas.setdefault('launch', dict(view='canvas'))
canvas.setdefault('pages', [])
canvas.setdefault('designSystems', [])
boards = canvas.setdefault('boards', {})
order = canvas.setdefault('order', [])

for velho in ('Passkey.dc.html', 'PasskeyEscuro.dc.html'):
    boards.pop(velho, None)
    if velho in order:
        order.remove(velho)
    if os.path.exists(os.path.join(SAIDA, velho)):
        os.remove(os.path.join(SAIDA, velho))

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

largura = lambda n: n * W + (n - 1) * 80
notas = canvas.setdefault('notes', {})
for chave, lin, n, texto in [
    ('acesso', 0, 7, 'Entrada: e-mail e senha, depois o código TOTP num POST só; senha esquecida; e o primeiro acesso, do convite aos códigos de recuperação'),
    ('acessoEscuro', 1, 7, 'Entrada no tema escuro'),
    ('clientes', 2, 4, 'Início e clientes: a lista é o molde do CRUD, criar e editar no sheet, revogar no alert-dialog'),
    ('clientesEscuro', 3, 4, 'Início e clientes no tema escuro'),
    ('planos', 4, 5, 'Planos, features e cupons: o mesmo CRUD; feature nasce uma vez, o plano só escolhe o valor'),
    ('planosEscuro', 5, 5, 'Planos, features e cupons no tema escuro'),
]:
    notas.setdefault(chave, {}).update(x=0, y=lin * LINHA_Y - 300, text=texto, kind='title1', maxW=largura(n))

json.dump(canvas, open(canvas_path, 'w'), ensure_ascii=False, indent=1)
print(f'{len(gerados)} quadros em {SAIDA}')
