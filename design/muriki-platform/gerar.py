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
for chave, lin, n, texto in [
    ('onboarding', 0, 3, 'Onboarding do Platform: o @usuário, o workspace e os termos numa tela só, sem CPF e sem plano; '
                         'o formato é validado na hora, a disponibilidade vem do app'),
    ('onboardingEscuro', 1, 3, 'Onboarding no tema escuro'),
]:
    notas.setdefault(chave, {}).update(x=0, y=lin * LINHA_Y - 300, text=texto, kind='title1', maxW=largura(n))
    notas[chave].setdefault('w', 240)

json.dump(canvas, open(canvas_path, 'w'), ensure_ascii=False, indent=2)
print(f'{len(gerados)} quadros em {SAIDA}')
