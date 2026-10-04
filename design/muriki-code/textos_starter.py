# Textos dos limites do Starter (2026-10-04), nos três idiomas da web. A API (muriki-api 2bebe4d):
# code.review — no Starter, o Peer não consulta a IA nos eventos do editor (peer.review "not_in_plan");
# code.history_days — a Evolução mostra só os últimos 7 dias (historyFrom), mas o nível, os desbloqueios e o
# catálogo continuam calculados de tudo. Nada aqui pode parecer erro.

TEXTOS = {
    'pt-BR': dict(
        stRevisaoPro='revisão da IA no Pro',
        stJanela='No Starter você vê os últimos 7 dias (desde 28 de set.). No Pro, o histórico inteiro.',
        stVerPro='Ver o Pro',
        stDesde='desde 28 de set.',
        stTempoSubJanela='O nível confirmado de cada competência nos últimos 7 dias. O nível de agora conta tudo o que você já fez.',
        stTrajVazia='A última aprovação desta etapa foi antes dos últimos 7 dias. No Pro, a trajetória inteira.',
        stHistVazio='Nenhuma mudança de nível nos últimos 7 dias. O seu nível de agora conta tudo o que você já fez.',
    ),
    'en-US': dict(
        stRevisaoPro='AI review on Pro',
        stJanela='On Starter you see the last 7 days (since Sep 28). On Pro, your whole history.',
        stVerPro='See Pro',
        stDesde='since Sep 28',
        stTempoSubJanela='The confirmed level of each competency over the last 7 days. Your current level counts everything you have done.',
        stTrajVazia='The latest pass of this step was before the last 7 days. On Pro, the whole trajectory.',
        stHistVazio='No level change in the last 7 days. Your current level counts everything you have done.',
    ),
    'es-ES': dict(
        stRevisaoPro='revisión de la IA en Pro',
        stJanela='En Starter ves los últimos 7 días (desde el 28 sept). En Pro, el historial entero.',
        stVerPro='Ver Pro',
        stDesde='desde el 28 sept',
        stTempoSubJanela='El nivel confirmado de cada competencia en los últimos 7 días. El nivel de ahora cuenta todo lo que ya hiciste.',
        stTrajVazia='La última aprobación de esta etapa fue antes de los últimos 7 días. En Pro, la trayectoria entera.',
        stHistVazio='Ningún cambio de nivel en los últimos 7 días. Tu nivel de ahora cuenta todo lo que ya hiciste.',
    ),
}
