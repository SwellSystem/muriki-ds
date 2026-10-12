# A tela de login compartilhada (auth-page + login-page do registry), a mesma do Code e do
# Backoffice: à esquerda o painel de detalhes (a marca, o pitch, o mascote espiando), à direita o
# formulário numa coluna de 440px. O desenho é o tela_acesso do canvas do Code; o que é do Platform
# é a marca no painel e o texto do pitch (o bloco lê tudo do i18n do app). Entrar tem passkey e
# e-mail com senha, sem Google nem GitHub (a API não tem); criar conta é nome, e-mail e o Turnstile.
import importlib.util, os, sys

from pecas import AQUI, K, casca, logica, juntar, COMUM, PROPS_IDIOMA, props_tema

CODE = os.path.join(AQUI, '..', 'muriki-code')


def _do_code(nome):
    # textos.py e telas.py do Code têm o nome dos daqui: carrega pelo caminho, com o textos do Code
    # no lugar do daqui enquanto o telas do Code importa as suas dependências
    textos_daqui = sys.modules.get('textos')
    spec = importlib.util.spec_from_file_location('textos', os.path.join(CODE, 'textos.py'))
    textos_code = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(textos_code)
    if nome == 'textos':
        return textos_code
    sys.modules['textos'] = textos_code
    try:
        spec = importlib.util.spec_from_file_location(f'{nome}_code', os.path.join(CODE, f'{nome}.py'))
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        return mod
    finally:
        sys.modules['textos'] = textos_daqui


_telas_code = _do_code('telas')
tela_acesso, antes_acesso, VALORES_ACESSO = _telas_code.tela_acesso, _telas_code.antes_acesso, _telas_code.VALORES_ACESSO
from textos_conta import CONTA  # noqa: E402  (do Code: o nome não colide)

# o pitch é o padrão do login.* no i18n do registry; a nota do criar conta deixa de falar de código
DO_PLATFORM = {
    'pt-BR': dict(pitch1='Notas viram tarefas,', pitch2='equipes viram tribos',
                  pitchTxt='Colaboração natural para equipes que fluem. Organize tarefas, crie calendários e transforme anotações em ações concretas.',
                  semTreino='Seus dados não são usados para treinar modelos de IA.'),
    'en-US': dict(pitch1='Notes become tasks,', pitch2='teams become tribes',
                  pitchTxt='Natural collaboration for teams in flow. Organize tasks, build calendars and turn notes into concrete actions.',
                  semTreino='Your data is not used to train AI models.'),
    'es-ES': dict(pitch1='Las notas se vuelven tareas,', pitch2='los equipos, tribus',
                  pitchTxt='Colaboración natural para equipos que fluyen. Organiza tareas, crea calendarios y convierte notas en acciones concretas.',
                  semTreino='Tus datos no se usan para entrenar modelos de IA.'),
}
_ACESSO = _do_code('textos').ACESSO
ACESSO = {l: {**_ACESSO[l], **CONTA[l], **DO_PLATFORM[l]} for l in _ACESSO}


def montar_acesso(tela, tema):
    sufixo = '' if tema == 'claro' else 'Escuro'
    modo = {'entrar': 'entrar', 'criar_conta': 'criar'}[tela['id']]
    props = {'estado': {'editor': 'enum', 'options': ['formulario', 'enviado'], 'default': 'formulario'}} if modo == 'criar' else {}
    antes = antes_acesso('Rafael Moura', 'rafael@moura.dev', '', 'criar') if modo == 'criar' else antes_acesso('', '', '')
    return casca(tela['titulo'], tela_acesso(K, modo, sufixo, marca='muriki / platform'),
                 logica(juntar(COMUM, ACESSO), tema, antes, VALORES_ACESSO), {**PROPS_IDIOMA, **props_tema(tema), **props})
