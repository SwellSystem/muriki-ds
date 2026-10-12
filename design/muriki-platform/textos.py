# Os textos comuns do canvas do Muriki Platform, nos três idiomas do produto: a barra do topo
# (idioma e tema). Cada tela traz os seus em textos_*.py; juntar() confere que os três idiomas
# têm as mesmas chaves e que nenhuma se repete entre as partes.
IDIOMAS = ['pt-BR', 'en-US', 'es-ES']

COMUM = {
    'pt-BR': dict(
        lang='pt-BR', idiomaCurto='PT', idiomaNome='Português', idiomaMenu='Idioma', trocarIdioma='Idioma: português. Trocar idioma',
        paraEscuro='Tema claro. Mudar para o escuro', paraClaro='Tema escuro. Mudar para o claro',
    ),
    'en-US': dict(
        lang='en-US', idiomaCurto='EN', idiomaNome='English', idiomaMenu='Language', trocarIdioma='Language: English. Change language',
        paraEscuro='Light theme. Switch to dark', paraClaro='Dark theme. Switch to light',
    ),
    'es-ES': dict(
        lang='es-ES', idiomaCurto='ES', idiomaNome='Español', idiomaMenu='Idioma', trocarIdioma='Idioma: español. Cambiar idioma',
        paraEscuro='Tema claro. Cambiar a oscuro', paraClaro='Tema oscuro. Cambiar a claro',
    ),
}


def juntar(*partes):
    textos = {}
    for idioma in IDIOMAS:
        d = {}
        for p in partes:
            repetidas = set(d) & set(p[idioma])
            assert not repetidas, f'chave repetida: {repetidas}'
            d.update(p[idioma])
        textos[idioma] = d
    assert all(set(v) == set(textos['pt-BR']) for v in textos.values()), 'chaves diferentes entre idiomas'
    return textos
