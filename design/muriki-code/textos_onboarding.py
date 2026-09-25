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
        naoChegou='Não chegou?', spam='olhe também o spam e as promoções.',
    ),
    'en-US': dict(
        titulo='Confirm your email', sub='We sent a 6-digit code to',
        codigoAria='Verification code, 6 digits', codigoLegenda='Code', verificar='Verify',
        expira='The code is valid for 10 minutes.', reenviarEm='Resend in 0:48', reenviar='Resend code',
        invalido='Invalid code. Check the digits and try again.',
        bloqueado='Too many attempts with this code. Ask for a new one to continue.',
        naoChegou='Didn’t get it?', spam='also check spam and promotions.',
    ),
    'es-ES': dict(
        titulo='Confirma tu email', sub='Enviamos un código de 6 dígitos a',
        codigoAria='Código de verificación, 6 dígitos', codigoLegenda='Código', verificar='Verificar',
        expira='El código vale 10 minutos.', reenviarEm='Reenviar en 0:48', reenviar='Reenviar código',
        invalido='Código inválido. Revisa los dígitos e inténtalo de nuevo.',
        bloqueado='Demasiados intentos con este código. Pide uno nuevo para continuar.',
        naoChegou='¿No te llegó?', spam='mira también en spam y promociones.',
    ),
}

PERFIL = {
    'pt-BR': dict(
        grupoVoce='Você', grupoDocs='Documento e contato', titulo='Um pouco sobre você', sub='Estes dados valem para a sua conta Muriki inteira, no Code e no Platform.',
        apelido='Como quer ser chamado', apelidoPh='Rafael', nome='Nome completo', nomePh='Rafael Moura',
        cpf='CPF', cpfPh='000.000.000-00', cpfNota='Um teste grátis do Pro por CPF.',
        telefone='Telefone', opcional='opcional', telefonePh='(11) 91234-5678',
        termosA='Li e aceito os', termos='termos de uso', termosE='e a', privacidade='política de privacidade',
    ),
    'en-US': dict(
        grupoVoce='You', grupoDocs='ID and contact', titulo='A little about you', sub='This applies to your whole Muriki account, in Code and in Platform.',
        apelido='What should we call you', apelidoPh='Rafael', nome='Full name', nomePh='Rafael Moura',
        cpf='CPF (Brazilian tax ID)', cpfPh='000.000.000-00', cpfNota='One free Pro trial per CPF.',
        telefone='Phone', opcional='optional', telefonePh='(11) 91234-5678',
        termosA='I have read and accept the', termos='terms of use', termosE='and the', privacidade='privacy policy',
    ),
    'es-ES': dict(
        grupoVoce='Tú', grupoDocs='Documento y contacto', titulo='Un poco sobre ti', sub='Estos datos valen para toda tu cuenta Muriki, en Code y en Platform.',
        apelido='Cómo quieres que te llamemos', apelidoPh='Rafael', nome='Nombre completo', nomePh='Rafael Moura',
        cpf='CPF (identificación fiscal de Brasil)', cpfPh='000.000.000-00', cpfNota='Una prueba gratis de Pro por CPF.',
        telefone='Teléfono', opcional='opcional', telefonePh='(11) 91234-5678',
        termosA='He leído y acepto los', termos='términos de uso', termosE='y la', privacidade='política de privacidad',
    ),
}

PREFERENCIAS = {
    'pt-BR': dict(
        titulo='Como você programa hoje?', sub='É só o ponto de partida: os exercícios e o Peer ajustam o resto.',
        experiencia='Experiência',
        learning='Aprendendo', learningDesc='Estou começando a programar.',
        beginner='Iniciante', beginnerDesc='Já faço projetos pequenos sozinho.',
        intermediate='Intermediário', intermediateDesc='Trabalho com código todo dia.',
        advanced='Avançado', advancedDesc='Decido arquitetura e reviso o time.',
        linguagens='Linguagens que você usa', emBreve='em breve',
        mainstream='Principais', web='Web', mobile='Mobile', systems='Sistemas',
        objetivos='O que você quer daqui', umATres='escolha de 1 a 3',
        learn='Aprender', learnDesc='Entender o porquê, não só fazer passar.',
        ship_faster='Entregar mais rápido', ship_fasterDesc='Menos ida e volta entre teste e revisão.',
        review_code='Revisar código', review_codeDesc='Ler o código dos outros com critério.',
        comecar='Começar', irPagamento='Ir para o pagamento',
        notaStarter='Você começa no Starter. O Pro fica no menu Plano.',
        notaPro='7 dias grátis do Pro. A cobrança só começa depois.',
    ),
    'en-US': dict(
        titulo='How do you code today?', sub='It’s only the starting point: exercises and the Peer adjust the rest.',
        experiencia='Experience',
        learning='Learning', learningDesc='I’m just starting to code.',
        beginner='Beginner', beginnerDesc='I build small projects on my own.',
        intermediate='Intermediate', intermediateDesc='I work with code every day.',
        advanced='Advanced', advancedDesc='I decide architecture and review the team.',
        linguagens='Languages you use', emBreve='soon',
        mainstream='Main', web='Web', mobile='Mobile', systems='Systems',
        objetivos='What you want from this', umATres='pick 1 to 3',
        learn='Learn', learnDesc='Understand the why, not just make it pass.',
        ship_faster='Ship faster', ship_fasterDesc='Less back and forth between tests and review.',
        review_code='Review code', review_codeDesc='Read other people’s code with judgment.',
        comecar='Start', irPagamento='Go to checkout',
        notaStarter='You start on Starter. Pro is in the Plan menu.',
        notaPro='7 days of Pro for free. Billing only starts after that.',
    ),
    'es-ES': dict(
        titulo='¿Cómo programas hoy?', sub='Es solo el punto de partida: los ejercicios y el Peer ajustan el resto.',
        experiencia='Experiencia',
        learning='Aprendiendo', learningDesc='Estoy empezando a programar.',
        beginner='Principiante', beginnerDesc='Hago proyectos pequeños por mi cuenta.',
        intermediate='Intermedio', intermediateDesc='Trabajo con código todos los días.',
        advanced='Avanzado', advancedDesc='Decido arquitectura y reviso al equipo.',
        linguagens='Lenguajes que usas', emBreve='pronto',
        mainstream='Principales', web='Web', mobile='Móvil', systems='Sistemas',
        objetivos='Qué quieres de aquí', umATres='elige de 1 a 3',
        learn='Aprender', learnDesc='Entender el porqué, no solo hacer que pase.',
        ship_faster='Entregar más rápido', ship_fasterDesc='Menos idas y vueltas entre pruebas y revisión.',
        review_code='Revisar código', review_codeDesc='Leer el código de otros con criterio.',
        comecar='Empezar', irPagamento='Ir al pago',
        notaStarter='Empiezas en Starter. Pro está en el menú Plan.',
        notaPro='7 días de Pro gratis. El cobro empieza después.',
    ),
}

PAGAMENTO = {
    'pt-BR': dict(
        confirmadoTitulo='Pagamento confirmado', confirmadoSub='O Pro está ativo. Os 7 dias grátis vão até 1º de outubro; a primeira cobrança vem depois disso.',
        comecarPrimeiro='Começar o primeiro exercício',
        canceladoTitulo='O pagamento não foi concluído', canceladoSub='Nada foi cobrado. Tente de novo, ou siga no Starter e assine o Pro depois, pelo menu Plano.',
        tentarDeNovo='Tentar de novo', seguirStarter='Seguir no Starter',
    ),
    'en-US': dict(
        confirmadoTitulo='Payment confirmed', confirmadoSub='Pro is active. Your 7 free days run until October 1; the first charge comes after that.',
        comecarPrimeiro='Start the first exercise',
        canceladoTitulo='The payment didn’t go through', canceladoSub='Nothing was charged. Try again, or stay on Starter and subscribe to Pro later from the Plan menu.',
        tentarDeNovo='Try again', seguirStarter='Stay on Starter',
    ),
    'es-ES': dict(
        confirmadoTitulo='Pago confirmado', confirmadoSub='Pro está activo. Tus 7 días gratis van hasta el 1 de octubre; el primer cobro llega después.',
        comecarPrimeiro='Empezar el primer ejercicio',
        canceladoTitulo='El pago no se completó', canceladoSub='No se cobró nada. Inténtalo de nuevo, o sigue en Starter y suscríbete a Pro después desde el menú Plan.',
        tentarDeNovo='Intentar de nuevo', seguirStarter='Seguir en Starter',
    ),
}
