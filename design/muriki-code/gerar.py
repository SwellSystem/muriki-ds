import json, os
from datetime import datetime, timezone
from telas import *
from movel_code import WM, ALTURAS as ALTURAS_MOVEL
ALTURA_MOVEL_MAX = max(ALTURAS_MOVEL.values())

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
    ('vazio', 'PerfilVazio', 'Evolução', 'Evolução · o primeiro dia: só o declarado, antes de qualquer exercício', 8, 0, 1),
    ('evolucao', 'Main', 'Evolução', 'Evolução · fatia 1: competências com nível, origem e caminho na trilha, e o progresso nas trilhas', 0, 2, 3),
    ('competencia', 'Competencia', 'Funções e escopo', 'Competência · Funções e escopo: caminho na trilha, histórico do nível e trajetória', 1, 2, 3),
    ('exercicio', 'Exercicio', 'Exercício', 'Exercício · editor, testes e explicação', 2, 2, 3),
    ('peer_testes', 'ExercicioPeerTestes', 'Exercício', 'Peer no exercício · a pergunta embaixo do teste que falhou', 8, 2, 3),
    ('peer_faixa', 'ExercicioPeerFaixa', 'Exercício', 'Peer no exercício · a dica de uma pausa, acima da barra de status', 9, 2, 3),
    ('peer_retorno', 'ExercicioPeerRetorno', 'Exercício', 'Peer no exercício · o retorno do envio na voz do Peer', 10, 2, 3),
    ('licao', 'LicaoPassoAPasso', 'Lição', 'Lição · a execução passo a passo (anterior, próximo, recomeçar) e o Você sabia?', 11, 2, 3),
    ('guia_voce_sabia', 'GuiaVoceSabia', 'Guia de sintaxe', 'Guia de sintaxe · o Você sabia? junto do recurso', 12, 2, 3),
    ('peer_voce_sabia', 'ExercicioPeerVoceSabia', 'Exercício', 'Peer no exercício · a armadilha no código vira um Você sabia?', 13, 2, 3),
    ('avaliacao', 'Avaliacao', 'Avaliação', 'Avaliação · rubrica, explicação e o porquê', 3, 2, 3),
    ('playground', 'Playground', 'Playground', 'Playground · o tipo Código livre (em breve): código fora do exercício, com o Peer', 4, 2, 3),
    ('inicio', 'Inicio', 'Início', 'Início · o primeiro dia, antes de qualquer prática', 5, 2, 3),
    ('evolucao_tempo', 'EvolucaoNoTempo', 'Evolução', 'Evolução, rolada · fatia 2: evolução no tempo e trajetória', 7, 2, 3),
    ('arquitetura', 'ExercicioArquitetura', 'Exercício de arquitetura', 'Exercício de arquitetura · a bancada: peças, ligações, regras e Verificar', 6, 2, 3),
    ('starter_exercicio', 'ExercicioStarter', 'Exercício', 'Starter · o Peer sem a revisão da IA nos eventos: um complemento fixo no "Peer acompanhando"', 14, 2, 3),
    ('starter_evolucao', 'EvolucaoStarter', 'Evolução', 'Starter · a Evolução nos últimos 7 dias: o aviso, a linha do tempo com a borda e a trajetória fora da janela', 15, 2, 3),
    ('starter_competencia', 'CompetenciaStarter', 'Funções e escopo', 'Starter · a competência nos últimos 7 dias: o histórico sem mudança na janela e a trajetória fora dela', 16, 2, 3),
    ('exercicio_console', 'ExercicioConsole', 'Exercício', 'Exercício · o editor expandido e o Console: o que o código imprimiu, por teste', 18, 2, 3),
    ('arquitetura_simular', 'ExercicioArquiteturaSimular', 'Exercício de arquitetura', 'Exercício de arquitetura · Simular: a API derrubada, o pulso para nela e o resumo do que ficou sem caminho', 19, 2, 3),
    ('playground_desenhos', 'PlaygroundDesenhos', 'Playground', 'Playground · os tipos e Seus desenhos, o Novo sempre ativo', 20, 2, 3),
    ('playground_limite', 'PlaygroundLimite', 'Playground', 'Playground · o limite do plano: o Novo com 3 desenhos no Starter abre o modal com o Pro', 21, 2, 3),
    ('desenho_livre', 'DesenhoLivre', 'Farmácia fora do ar', 'Desenho livre · a bancada sem regras e sem Verificar, com notas, título e salvo', 22, 2, 3),
    ('arquitetura_defeito', 'ExercicioArquiteturaDefeito', 'Exercício de arquitetura', 'Achar o defeito · marcar a peça que derruba o sistema, os números no Responda e a bancada só leitura', 23, 2, 3),
    ('arquitetura_nuvem', 'ExercicioArquiteturaNuvem', 'Exercício de arquitetura', 'Exercício de arquitetura na nuvem · AWS: região, VPC e sub-redes, os ícones oficiais e o serviço da peça', 17, 2, 3),
    ('peer', 'Peer', 'Peer na IDE', 'Peer na IDE', 0, 4, 5),
    ('conectar', 'Conectar', 'Conectar IDE', 'Conectar IDE · código no navegador', 1, 4, 5),
    ('planos', 'Planos', 'Planos', 'Planos · Starter e Pro', 2, 4, 5),
    ('planos_escolha', 'PlanosEscolha', 'Escolha seu plano', 'Planos · escolha obrigatória: Starter, o teste do Pro e o Pro pago', 3, 4, 5),
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
    ('desb_trilhas', 'DesbloqueioTrilhas', 'Trilhas', 'Trilhas · Arquitetura bloqueada: o caminho até Pleno e o abrir mesmo assim', 7, 12, 13),
    ('desb_trilha', 'DesbloqueioTrilha', 'Arquitetura de sistemas', 'Trilha acima do seu nível · o aviso above_level, que não trava', 8, 12, 13),
    ('desb_liberada', 'TrilhaLiberada', 'Trilha liberada', 'Ganho de trilha · o momento, uma vez, quando o nível alcança o startTier', 9, 12, 13),
    ('troca_ida', 'TrocaLinguagem', 'Trocar de linguagem', 'Troca de linguagem · Starter: JavaScript congela e Python se abre (Trocar anima)', 10, 12, 13),
    ('troca_volta', 'TrocaLinguagemVolta', 'Trocar de linguagem', 'Troca de linguagem · a volta: Python congela e JavaScript recomeça do zero (regra B)', 11, 12, 13),
    ('troca_plano', 'TrocaLinguagemPlano', 'Trocar de linguagem', 'Troca de linguagem · not_in_plan: a data só ao clicar, o quadro do Pro e a linha de quem chegou por link direto', 12, 12, 13),
    # o Code no celular (390), na fileira 14 (claro) e 15 (escuro); o tamanho vem de movel.ALTURAS
    ('menu_movel', 'MenuMovel', 'Menu', 'Celular · a barra de topo e a gaveta do menu', 0, 14, 15),
    ('inicio_movel', 'InicioMovel', 'Início', 'Celular · o Início do primeiro dia', 1, 14, 15),
    ('trilhas_movel', 'TrilhasMovel', 'Trilhas', 'Celular · Trilhas com o minimapa', 2, 14, 15),
    ('trilha_movel', 'TrilhaMovel', 'Testes que dão confiança', 'Celular · a trilha em mapa vertical', 3, 14, 15),
    ('trilha_lista_movel', 'TrilhaListaMovel', 'Testes que dão confiança', 'Celular · a trilha em lista: a linha inteira abre a etapa', 7, 14, 15),
    ('exercicios_movel', 'ExerciciosMovel', 'Exercícios', 'Celular · o catálogo em cartões', 4, 14, 15),
    ('conta_movel', 'ContaMovel', 'Minha conta', 'Celular · Minha conta, meus dados', 5, 14, 15),
    ('evolucao_movel', 'EvolucaoMovel', 'Evolução', 'Celular · a Evolução inteira, em cartões', 8, 14, 15),
    ('liberada_movel', 'TrilhaLiberadaMovel', 'Trilha liberada', 'Celular · o ganho de trilha numa folha', 9, 14, 15),
    ('planos_escolha_movel', 'PlanosEscolhaMovel', 'Escolha seu plano', 'Celular · a escolha obrigatória de plano', 10, 14, 15),
    ('licao_movel', 'LicaoMovel', 'Lição', 'Celular · a lição com o passo a passo empilhado', 11, 14, 15),
    ('troca_movel', 'TrocaLinguagemMovel', 'Trocar de linguagem', 'Celular · a troca de linguagem numa folha: os cartões empilham e as setas descem', 12, 14, 15),
    ('boas_vindas_movel', 'BoasVindasMovel', 'Trilhas', 'Celular · as boas-vindas às trilhas numa folha que sobe de baixo', 6, 14, 15),
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
        w, h = W, H
        if id_.endswith('_movel'):
            # o celular: 390 de largura, a altura da página, e as colunas mais juntas
            chave = {'menu_movel': 'menu', 'inicio_movel': 'inicio', 'trilhas_movel': 'trilhas', 'trilha_movel': 'trilha', 'trilha_lista_movel': 'trilha_lista',
                     'exercicios_movel': 'exercicios', 'conta_movel': 'conta', 'boas_vindas_movel': 'boas_vindas', 'evolucao_movel': 'evolucao', 'liberada_movel': 'liberada', 'planos_escolha_movel': 'planos_escolha', 'licao_movel': 'licao', 'troca_movel': 'troca'}[id_]
            x, w, h = col * (WM + 80), WM, ALTURAS_MOVEL[chave]
            y = (14 * LINHA_Y) if tema == 'claro' else (14 * LINHA_Y + ALTURA_MOVEL_MAX + 420)
        b = boards.setdefault(arquivo, {})
        b.update(x=x, y=y, w=w, h=h, title=quadro if tema == 'claro' else f'{quadro} · escuro', is_interactive=True)
        if arquivo not in order:
            order.append(arquivo)
        gerados.append(arquivo)

# o canvas limita a nota a 8000 de largura e guarda w: 240; o gerador segue o mesmo para não desfazer
largura = lambda n: min(n * W + (n - 1) * 80, 8000)
notas = canvas.setdefault('notes', {})
for chave, lin, n, texto in [
    ('jornada', 0, 10, 'Entrada e primeiro acesso: código por email, perfil, plano, pagamento, perfil de aprendizado e o primeiro exercício'),
    ('jornadaEscuro', 1, 10, 'Entrada e primeiro acesso no tema escuro'),
    ('web', 2, 24, 'Code web: evolução, competência, exercício, avaliação, playground, o início do primeiro dia, o exercício com o editor expandido e o Console, o exercício de arquitetura (genérico, na nuvem com grupos e Simular), o Playground com tipos e o desenho livre, o achar o defeito, a evolução rolada, o Peer no exercício (testes, faixa, retorno e Você sabia?), a lição passo a passo, o guia de sintaxe e os limites do Starter (Peer sem revisão da IA, Evolução de 7 dias)'),
    ('webEscuro', 3, 8, 'Code web no tema escuro'),
    ('ide', 4, 3, 'Peer na IDE, conta e plano'),
    ('ideEscuro', 5, 3, 'Peer na IDE, conta e plano no tema escuro'),
    ('conta', 6, 5, 'Conta: segundo fator, esqueci a senha, criar e redefinir senha pelo link do email, acesso suspenso'),
    ('contaEscuro', 7, 5, 'Conta no tema escuro'),
    ('minhaConta', 8, 10, 'Minha conta: meus dados, aprendizado, segurança, plano, confirmar o email novo e os fluxos da segurança'),
    ('minhaContaEscuro', 9, 10, 'Minha conta no tema escuro'),
    ('sistema', 10, 6, 'Páginas de sistema do hub: sem internet, 404, erro, sessão expirada e manutenção — as mesmas no Code, no Backoffice e no Platform'),
    ('sistemaEscuro', 11, 6, 'Páginas de sistema no tema escuro'),
    ('aprenderMais', 12, 13, 'Trilhas, catálogo de exercícios, Peer na web, a trilha bloqueada com o ganho de trilha e a troca de linguagem do Starter'),
    ('aprenderMaisEscuro', 13, 10, 'Trilhas, exercícios e Peer na web no tema escuro'),
]:
    notas.setdefault(chave, {}).update(x=0, y=lin * LINHA_Y - 300, text=texto, kind='title1', maxW=largura(n))
    notas[chave].setdefault('w', 240)
# as notas do celular: a fileira escura começa depois do quadro mais alto do claro
for chave, y, texto in [
    ('celular', 14 * LINHA_Y - 300, 'Code no celular (390): barra de topo e gaveta, tudo empilhado, a trilha em mapa vertical, as boas-vindas numa folha e a Evolução'),
    ('celularEscuro', 14 * LINHA_Y + ALTURA_MOVEL_MAX + 120, 'Code no celular no tema escuro'),
]:
    notas.setdefault(chave, {}).update(x=0, y=y, text=texto, kind='title1', maxW=min(10 * (WM + 80), 8000))
    notas[chave].setdefault('w', 240)

json.dump(canvas, open(canvas_path, 'w'), ensure_ascii=False, indent=1)
print(f'{len(gerados)} quadros em {SAIDA}')
