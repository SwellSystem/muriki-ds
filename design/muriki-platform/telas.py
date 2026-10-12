# As telas do Muriki Platform. Cada uma é o desenho de um bloco do registry nos estados que o
# produto precisa ver; o estado é fixo por quadro (o canvas mostra um quadro por estado) e o
# idioma e o tema trocam no próprio quadro.
from pecas import (K, T, ic, pagina, pagina_identidade, cabecalho_passo, campo, caixa_marcar, botao_passo,  # noqa: F401
                   cartoes_escolha, esc, previa_workspace, PRODUTOS)
from textos_identidade import IDENTIDADE


# ── Onboarding · @usuário e workspace (bloco platform-identity) ─────────
# PlatformOnboardingIdentity: para quem é (Com o meu time / Só para mim), o @usuário, o nome e o
# endereço do workspace e o aceite dos termos, numa tela só e sem CPF nem plano. O formato é do
# componente; livre, ocupado e reservado vêm do app. O botão só liga com tudo livre e os termos
# aceitos. A partir do lg, a tela tem a altura da janela, sem rolar: o formulário à esquerda e, no
# palco azul à direita, a WorkspacePreview com os mesmos valores (CA4b, CA4c), no estado final.
IDENTIDADE_ESTADOS = {
    # para quem, usuário, status, nome, slug, status do slug, termos, a frase da prévia
    'vazio': ('team', '', 'idle', '', '', 'idle', False, 'previaVazio'),
    'ocupado': ('team', 'rafael', 'taken', 'Muriki', 'muriki', 'reserved', True, 'fraseOcupado'),
    'livre': ('team', 'rafael.moura', 'available', 'Moura & Filhos', 'moura-filhos', 'available', True, 'fraseLivre'),
    'foco': ('personal', 'rafael.moura', 'available', 'Rafael Moura', 'rafael-moura', 'available', True, 'fraseFoco'),
}


def tela_identidade(k, estado):
    publico, usuario, st_usuario, nome, slug, st_slug, termos, frase = IDENTIDADE_ESTADOS[estado]
    frase_usuario = {'idle': T('usuarioDica'), 'available': f'@{usuario} {T("usuarioLivre")}',
                     'taken': T('usuarioOcupado'), 'reserved': T('usuarioReservado')}[st_usuario]
    frase_slug = {'idle': T('enderecoDica'), 'available': T('enderecoLivre'),
                  'reserved': T('enderecoReservado')}[st_slug]
    link = lambda txt: f'<a href="#" style="color:{k["fg"]};font-weight:500;">{txt}</a>'
    formulario = (
        cabecalho_passo(k, 1, 2, T('titulo'))
        + '<form style="margin:0;display:flex;flex-direction:column;gap:20px;">'
        + cartoes_escolha(k, T('paraQuem'), [('team', T('comTime'), PRODUTOS['team']),
                                              ('personal', T('soMim'), PRODUTOS['personal'])], publico)
        + campo(k, 'usuario', T('usuario'), usuario, st_usuario, frase_usuario, afixo='@', mono=True)
        + campo(k, 'nome', T('nomeWorkspace'), nome, placeholder=T('nomePh'))
        + campo(k, 'endereco', T('endereco'), slug, st_slug, frase_slug, afixo='platform.muriki.app/', mono=True)
        + caixa_marcar(k, termos, f'{T("termosA")} {link(T("termos"))} {T("termosE")} {link(T("privacidade"))}.')
        + '</form>'
        + botao_passo(k, T('criar'), estado in ('livre', 'foco'))
    )
    return pagina_identidade(k, formulario, previa_workspace(k, publico, nome, T('previaNome'), T(frase)))


def montar(tela, tema):
    i = tela['id']
    if i.startswith('identidade_'):
        return pagina(tela['titulo'], tela_identidade(K, i.split('_', 1)[1]), tema, IDENTIDADE)
    raise ValueError(f'tela desconhecida: {i}')
