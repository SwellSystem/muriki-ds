# Textos do onboarding do Code no contrato da muriki-api: verificação por email, perfil (o mesmo do
# Platform), preferências (experiência, linguagens, objetivos) e a volta do pagamento.
# O cabeçalho de passo e o contador são comuns: passo1..passo4 dizem "Primeiro acesso · n de 4".

COMUM_ONB = {
    'pt-BR': dict(passoRotulo='Primeiro acesso', de='de', passosAria='Passo', continuar='Continuar'),
    'en-US': dict(passoRotulo='Getting started', de='of', passosAria='Step', continuar='Continue'),
    'es-ES': dict(passoRotulo='Primeros pasos', de='de', passosAria='Paso', continuar='Continuar'),
}

VERIFICACAO = {
    'pt-BR': dict(
        titulo='Confirme seu email', sub='Enviamos um código de 6 dígitos para',
        codigoAria='Código de verificação, 6 dígitos', codigoLegenda='Código', verificar='Verificar',
        expira='O código vale por 10 minutos.', reenviarEm='Reenviar em 0:48', reenviar='Reenviar código',
        invalido='Código inválido. Confira os dígitos e tente de novo.',
        bloqueado='Muitas tentativas com este código. Peça um novo para continuar.',
        naoChegou='Não chegou?', spam='Olhe também o spam e as promoções.',
    ),
    'en-US': dict(
        titulo='Confirm your email', sub='We sent a 6-digit code to',
        codigoAria='Verification code, 6 digits', codigoLegenda='Code', verificar='Verify',
        expira='The code is valid for 10 minutes.', reenviarEm='Resend in 0:48', reenviar='Resend code',
        invalido='Invalid code. Check the digits and try again.',
        bloqueado='Too many attempts with this code. Ask for a new one to continue.',
        naoChegou='Didn’t get it?', spam='Also check spam and promotions.',
    ),
    'es-ES': dict(
        titulo='Confirma tu email', sub='Enviamos un código de 6 dígitos a',
        codigoAria='Código de verificación, 6 dígitos', codigoLegenda='Código', verificar='Verificar',
        expira='El código vale 10 minutos.', reenviarEm='Reenviar en 0:48', reenviar='Reenviar código',
        invalido='Código inválido. Revisa los dígitos e inténtalo de nuevo.',
        bloqueado='Demasiados intentos con este código. Pide uno nuevo para continuar.',
        naoChegou='¿No te llegó?', spam='Mira también en spam y promociones.',
    ),
}

PERFIL = {
    'pt-BR': dict(
        grupoOrigem='Para a gente', origem='Como conheceu o Muriki', origemPh='Escolha uma opção',
        teste='7 dias de Pro', testeNota='Ao continuar, sua conta do Code começa com 7 dias de Pro grátis. Sem cartão.',
        tituloConfirmar='Confira seus dados', subConfirmar='Você já tem perfil na conta Muriki, do Platform. É só confirmar.',
        confirmarNota='Algo errado? Dá para corrigir depois, em Minha conta.', confirmar='Confirmar e continuar',
        grupoVoce='Você', grupoDocs='Documento e contato', titulo='Um pouco sobre você', sub='Estes dados valem para a sua conta Muriki inteira, no Code e no Platform.',
        apelido='Como quer ser chamado', apelidoPh='Rafael', nome='Nome completo', nomePh='Rafael Moura',
        cpf='CPF', cpfPh='000.000.000-00', cpfNota='Um teste grátis do Pro por CPF.',
        telefone='Telefone', opcional='opcional', telefonePh='(11) 91234-5678',
        termosA='Li e aceito os', termos='termos de uso', termosE='e a', privacidade='política de privacidade',
    ),
    'en-US': dict(
        grupoOrigem='For us', origem='How did you hear about Muriki', origemPh='Pick one',
        teste='7 days of Pro', testeNota='When you continue, your Code account starts with 7 days of Pro for free. No card.',
        tituloConfirmar='Check your details', subConfirmar='You already have a profile in your Muriki account, from Platform. Just confirm.',
        confirmarNota='Something wrong? You can fix it later in My account.', confirmar='Confirm and continue',
        grupoVoce='You', grupoDocs='ID and contact', titulo='A little about you', sub='This applies to your whole Muriki account, in Code and in Platform.',
        apelido='What should we call you', apelidoPh='Rafael', nome='Full name', nomePh='Rafael Moura',
        cpf='CPF (Brazilian tax ID)', cpfPh='000.000.000-00', cpfNota='One free Pro trial per CPF.',
        telefone='Phone', opcional='optional', telefonePh='(11) 91234-5678',
        termosA='I have read and accept the', termos='terms of use', termosE='and the', privacidade='privacy policy',
    ),
    'es-ES': dict(
        grupoOrigem='Para nosotros', origem='Cómo conociste Muriki', origemPh='Elige una opción',
        teste='7 días de Pro', testeNota='Al continuar, tu cuenta de Code empieza con 7 días de Pro gratis. Sin tarjeta.',
        tituloConfirmar='Revisa tus datos', subConfirmar='Ya tienes perfil en tu cuenta Muriki, de Platform. Solo confirma.',
        confirmarNota='¿Algo mal? Puedes corregirlo después en Mi cuenta.', confirmar='Confirmar y continuar',
        grupoVoce='Tú', grupoDocs='Documento y contacto', titulo='Un poco sobre ti', sub='Estos datos valen para toda tu cuenta Muriki, en Code y en Platform.',
        apelido='Cómo quieres que te llamemos', apelidoPh='Rafael', nome='Nombre completo', nomePh='Rafael Moura',
        cpf='CPF (identificación fiscal de Brasil)', cpfPh='000.000.000-00', cpfNota='Una prueba gratis de Pro por CPF.',
        telefone='Teléfono', opcional='opcional', telefonePh='(11) 91234-5678',
        termosA='He leído y acepto los', termos='términos de uso', termosE='y la', privacidade='política de privacidad',
    ),
}

PREFERENCIAS = {
    'pt-BR': dict(
        rotuloAprendizado='Primeiro acesso · opcional', titulo='Como você programa hoje?',
        sub='Ajuda o Code a escolher trilhas e o Peer a falar no seu nível. Tudo aqui é opcional, e dá para mudar depois no perfil.',
        experiencia='Experiência',
        junior='Junior', juniorDesc='Já programo e quero autonomia.',
        mid='Pleno', midDesc='Entrego sozinho; quero decidir melhor.',
        senior='Senior', seniorDesc='Decido no código; quero levar ao time.',
        tech_lead='Tech Lead', tech_leadDesc='Lidero um time e seus limites.',
        architect='Architect', architectDesc='Desenho sistemas e reviso decisões.',
        unknown='Ainda não sei', unknownDesc='Os primeiros exercícios mostram.',
        linguagens='Linguagens que você usa', emBreve='em breve',
        mainstream='Principais', web='Web', mobile='Mobile', systems='Sistemas',
        objetivos='O que você quer daqui', umATres='até 3, se quiser',
        learn='Aprender', learnDesc='Entender o porquê, não só fazer passar.',
        ship_faster='Entregar mais rápido', ship_fasterDesc='Menos ida e volta entre teste e revisão.',
        review_code='Revisar código', review_codeDesc='Ler o código dos outros com critério.',
        comecar='Começar', pular='Pular por agora', nadaObrigatorio='Nada aqui é obrigatório.',
    ),
    'en-US': dict(
        rotuloAprendizado='First access · optional', titulo='How do you code today?',
        sub='It helps Code pick tracks and the Peer talk at your level. Everything here is optional, and you can change it later in your profile.',
        experiencia='Experience',
        junior='Junior', juniorDesc='I code and want autonomy.',
        mid='Mid-level', midDesc='I ship on my own; I want to decide better.',
        senior='Senior', seniorDesc='I decide in code; I want to bring it to the team.',
        tech_lead='Tech Lead', tech_leadDesc='I lead a team and its boundaries.',
        architect='Architect', architectDesc='I design systems and review decisions.',
        unknown='Not sure yet', unknownDesc='The first exercises will tell.',
        linguagens='Languages you use', emBreve='soon',
        mainstream='Main', web='Web', mobile='Mobile', systems='Systems',
        objetivos='What you want from this', umATres='up to 3, if you like',
        learn='Learn', learnDesc='Understand the why, not just make it pass.',
        ship_faster='Ship faster', ship_fasterDesc='Less back and forth between tests and review.',
        review_code='Review code', review_codeDesc='Read other people’s code with judgment.',
        comecar='Start', pular='Skip for now', nadaObrigatorio='Nothing here is required.',
    ),
    'es-ES': dict(
        rotuloAprendizado='Primer acceso · opcional', titulo='¿Cómo programas hoy?',
        sub='Ayuda a Code a elegir trayectorias y al Peer a hablar a tu nivel. Todo aquí es opcional, y puedes cambiarlo después en tu perfil.',
        experiencia='Experiencia',
        junior='Junior', juniorDesc='Ya programo y quiero autonomía.',
        mid='Intermedio', midDesc='Entrego solo; quiero decidir mejor.',
        senior='Senior', seniorDesc='Decido en el código; quiero llevarlo al equipo.',
        tech_lead='Tech Lead', tech_leadDesc='Lidero un equipo y sus límites.',
        architect='Architect', architectDesc='Diseño sistemas y reviso decisiones.',
        unknown='Aún no lo sé', unknownDesc='Los primeros ejercicios lo mostrarán.',
        linguagens='Lenguajes que usas', emBreve='pronto',
        mainstream='Principales', web='Web', mobile='Móvil', systems='Sistemas',
        objetivos='Qué quieres de aquí', umATres='hasta 3, si quieres',
        learn='Aprender', learnDesc='Entender el porqué, no solo hacer que pase.',
        ship_faster='Entregar más rápido', ship_fasterDesc='Menos idas y vueltas entre pruebas y revisión.',
        review_code='Revisar código', review_codeDesc='Leer el código de otros con criterio.',
        comecar='Empezar', pular='Saltar por ahora', nadaObrigatorio='Nada aquí es obligatorio.',
    ),
}

PAGAMENTO = {
    'pt-BR': dict(
        confirmadoTitulo='Pagamento confirmado', confirmadoSub='O Pro está ativo. Os 7 dias grátis vão até 1º de outubro; a primeira cobrança vem depois disso.',
        comecarPrimeiro='Começar o primeiro exercício',
        canceladoTitulo='O pagamento não foi concluído', canceladoSub='Nada foi cobrado. Tente de novo, ou siga no Starter e assine o Pro quando quiser.',
        tentarDeNovo='Tentar de novo', seguirStarter='Seguir no Starter',
    ),
    'en-US': dict(
        confirmadoTitulo='Payment confirmed', confirmadoSub='Pro is active. Your 7 free days run until October 1; the first charge comes after that.',
        comecarPrimeiro='Start the first exercise',
        canceladoTitulo='The payment didn’t go through', canceladoSub='Nothing was charged. Try again, or stay on Starter and subscribe to Pro anytime.',
        tentarDeNovo='Try again', seguirStarter='Stay on Starter',
    ),
    'es-ES': dict(
        confirmadoTitulo='Pago confirmado', confirmadoSub='Pro está activo. Tus 7 días gratis van hasta el 1 de octubre; el primer cobro llega después.',
        comecarPrimeiro='Empezar el primer ejercicio',
        canceladoTitulo='El pago no se completó', canceladoSub='No se cobró nada. Inténtalo de nuevo, o sigue en Starter y suscríbete a Pro cuando quieras.',
        tentarDeNovo='Intentar de nuevo', seguirStarter='Seguir en Starter',
    ),
}
