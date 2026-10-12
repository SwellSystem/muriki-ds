# As telas do Muriki Platform. Cada uma é o desenho de um bloco do registry nos estados que o
# produto precisa ver; o estado é fixo por quadro (o canvas mostra um quadro por estado) e o
# idioma e o tema trocam no próprio quadro.
from pecas import (K, T, ic, pagina, pagina_passo, cabecalho_passo, grupo, campo, caixa_marcar, botao_passo,  # noqa: F401
                   esc)
from textos_identidade import IDENTIDADE


# ── Onboarding · @usuário e workspace (bloco platform-identity) ─────────
# PlatformOnboardingIdentity: o @usuário, o nome e o endereço do workspace e o aceite dos termos,
# numa tela só e sem CPF nem plano. O formato é do componente; livre, ocupado e reservado vêm do
# app. O botão só liga com tudo livre e os termos aceitos.
IDENTIDADE_ESTADOS = {
    # usuário, status, nome, slug, status do slug, termos
    'vazio': ('', 'idle', '', '', 'idle', False),
    'ocupado': ('rafael', 'taken', 'Muriki', 'muriki', 'reserved', True),
    'livre': ('rafael.moura', 'available', 'Moura & Filhos', 'moura-filhos', 'available', True),
}


def tela_identidade(k, estado):
    usuario, st_usuario, nome, slug, st_slug, termos = IDENTIDADE_ESTADOS[estado]
    frase_usuario = {'idle': T('usuarioDica'), 'available': f'@{usuario} {T("usuarioLivre")}',
                     'taken': T('usuarioOcupado'), 'reserved': T('usuarioReservado')}[st_usuario]
    frase_slug = {'idle': T('enderecoDica'), 'available': T('enderecoLivre'),
                  'reserved': T('enderecoReservado')}[st_slug]
    link = lambda txt: f'<a href="#" style="color:{k["fg"]};font-weight:500;">{txt}</a>'
    corpo = (
        cabecalho_passo(k, 1, 2, T('titulo'), T('sub'))
        + '<form style="margin:0;display:flex;flex-direction:column;gap:32px;">'
        + grupo(k, T('secaoVoce'), campo(k, 'usuario', T('usuario'), usuario, st_usuario, frase_usuario, afixo='@', mono=True))
        + grupo(k, T('secaoWorkspace'),
                campo(k, 'nome', T('nomeWorkspace'), nome, placeholder=T('nomePh'))
                + campo(k, 'endereco', T('endereco'), slug, st_slug, frase_slug, afixo='platform.muriki.app/', mono=True))
        + caixa_marcar(k, termos, f'{T("termosA")} {link(T("termos"))} {T("termosE")} {link(T("privacidade"))}.')
        + '</form>'
        + botao_passo(k, T('continuar'), estado == 'livre')
    )
    return pagina_passo(k, corpo)


def montar(tela, tema):
    i = tela['id']
    if i.startswith('identidade_'):
        return pagina(tela['titulo'], tela_identidade(K, i.split('_', 1)[1]), tema, IDENTIDADE)
    raise ValueError(f'tela desconhecida: {i}')
