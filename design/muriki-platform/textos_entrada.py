# Textos do primeiro acesso e do convite do Platform (bloco A2): o código por e-mail, quem já tem
# conta Muriki, convidar o time e o aceite de convite. As telas de entrada (entrar, criar conta, a
# senha) não ficam aqui: o app usa a tela de login compartilhada do DS. Os papéis ficam com o nome
# do produto (Owner, Maintainer, Member, Guest) e passam pelo `t` para o app poder traduzir.
ENTRADA = {
    'pt-BR': dict(
        # os botões do aceite de convite e do código
        entrarBotao='Entrar', codigoAria='Código de 6 dígitos', verificarBotao='Verificar', criarBotao='Criar conta',
        # primeiro acesso: o código por e-mail
        codigoTit='Confirme seu e-mail', codigoSubA='Mandamos um código de 6 dígitos para',
        expira='O código vale por 10 minutos.', naoChegou='Não chegou?', reenviarEm='Reenviar em 0:48',
        spam='Olhe também o spam e as promoções.',
        # quem já tem conta Muriki
        jaContaTit='Você já tem conta Muriki',
        jaContaTxt='É a mesma do Muriki Code, e o seu @usuário vem junto. Aqui falta só aceitar os termos do Platform e criar o workspace.',
        # convidar o time
        convidarTit='Chame o seu time',
        papel='Papel', remover='Remover', pular='Pular por agora',
        papelMaintainer='Maintainer', papelMember='Member', papelGuest='Guest',
        # aceite de convite
        conviteTitA='te convidou para', conviteSubA='Você entra como', enviadoPara='Enviado para',
        conviteDeslogadoA='Para aceitar, entre com a conta de', conviteDeslogadoB='ou crie uma com esse e-mail.',
        validade='O convite vale até 19 de out., 14:30.', aceitarBotao='Aceitar convite',
        conviteLogado='Ao aceitar, o workspace aparece na sua conta.',
        convitePrevia='Um lugar no time está esperando por você.',
        invalidoTit='Este convite não está disponível',
        invalidoTxt='Peça um convite novo a quem te chamou. Se você já faz parte do workspace, é só entrar.',
        irEntrar='Entrar no Muriki Platform',
        # o passo do convidado: só o @usuário e os termos, antes do aceite
        convidadoTit='Quase lá: escolha seu @usuário', convidadoSubA='Depois disso, você entra em', convidadoSubB='como',
        convidadoBotao='Entrar em', convidadoPreviaA='Um lugar no time está esperando por',
    ),
    'en-US': dict(
        entrarBotao='Sign in', codigoAria='6-digit code', verificarBotao='Verify', criarBotao='Create account',
        codigoTit='Confirm your email', codigoSubA='We sent a 6-digit code to',
        expira='The code is valid for 10 minutes.', naoChegou='Didn’t get it?', reenviarEm='Resend in 0:48',
        spam='Also check spam and promotions.',
        jaContaTit='You already have a Muriki account',
        jaContaTxt='It’s the same one as Muriki Code, and your @username comes along. All that’s left is accepting the Platform terms and creating the workspace.',
        convidarTit='Bring in your team',
        papel='Role', remover='Remove', pular='Skip for now',
        papelMaintainer='Maintainer', papelMember='Member', papelGuest='Guest',
        conviteTitA='invited you to', conviteSubA='You join as', enviadoPara='Sent to',
        conviteDeslogadoA='To accept, sign in with the account for', conviteDeslogadoB='or create one with that email.',
        validade='The invitation is valid until Oct 19 at 2:30 PM.', aceitarBotao='Accept invitation',
        conviteLogado='Once you accept, the workspace shows up in your account.',
        convitePrevia='A seat on the team is waiting for you.',
        invalidoTit='This invitation isn’t available',
        invalidoTxt='Ask whoever invited you for a new one. If you’re already in the workspace, just sign in.',
        irEntrar='Sign in to Muriki Platform',
        convidadoTit='Almost there: pick your @username', convidadoSubA='Then you join', convidadoSubB='as',
        convidadoBotao='Join', convidadoPreviaA='A seat on the team is waiting for',
    ),
    'es-ES': dict(
        entrarBotao='Entrar', codigoAria='Código de 6 dígitos', verificarBotao='Verificar', criarBotao='Crear cuenta',
        codigoTit='Confirma tu email', codigoSubA='Enviamos un código de 6 dígitos a',
        expira='El código vale 10 minutos.', naoChegou='¿No te llegó?', reenviarEm='Reenviar en 0:48',
        spam='Mira también en spam y promociones.',
        jaContaTit='Ya tienes cuenta Muriki',
        jaContaTxt='Es la misma de Muriki Code, y tu @usuario viene con ella. Solo falta aceptar los términos de Platform y crear el workspace.',
        convidarTit='Trae a tu equipo',
        papel='Rol', remover='Quitar', pular='Saltar por ahora',
        papelMaintainer='Maintainer', papelMember='Member', papelGuest='Guest',
        conviteTitA='te invitó a', conviteSubA='Entras como', enviadoPara='Enviada a',
        conviteDeslogadoA='Para aceptar, entra con la cuenta de', conviteDeslogadoB='o crea una con ese email.',
        validade='La invitación vale hasta el 19 oct, 14:30.', aceitarBotao='Aceptar invitación',
        conviteLogado='Al aceptar, el workspace aparece en tu cuenta.',
        convitePrevia='Un lugar en el equipo te está esperando.',
        invalidoTit='Esta invitación no está disponible',
        invalidoTxt='Pide una invitación nueva a quien te invitó. Si ya eres parte del workspace, solo tienes que entrar.',
        irEntrar='Entrar en Muriki Platform',
        convidadoTit='Casi listo: elige tu @usuario', convidadoSubA='Después, entras en', convidadoSubB='como',
        convidadoBotao='Entrar en', convidadoPreviaA='Un lugar en el equipo está esperando a',
    ),
}

# Convidar o time: o campo de adicionar, a lista e as pessoas no plano. O preço sai em reais no pt-BR
# e em dólar no en e no es.
CONVIDAR = {
    'pt-BR': dict(
        cvSub='Cada pessoa recebe um convite por e-mail e entra quando aceitar.',
        cvCampo='E-mails', cvPh='nome@empresa.com', cvAdicionar='Adicionar', cvDica='Cole vários de uma vez.',
        cvLista='Quem vai ser convidado', cvInvalido='e-mail incompleto',
        cvBotao='Convidar 3 pessoas', cvVoce='Você', cvOwner='Owner',
        cvFrase='Você e mais 3 pessoas a caminho. Cada uma entra quando aceitar o convite.',
        cvMedidorA='4 pessoas no', cvMedidorConta='você + 3',
        cvZona='Até 5 pessoas no Free e no Pro',
        cvMedidorPreco='14 dias de Pro grátis. Depois do teste, as 4 pessoas cabem no Free; para seguir no Pro, 4 × R$ 29 = R$ 116/mês. Só conta quem aceitar o convite.',
    ),
    'en-US': dict(
        cvSub='Each person gets an invitation by email and joins when they accept.',
        cvCampo='Emails', cvPh='name@company.com', cvAdicionar='Add', cvDica='Paste several at once.',
        cvLista='People to invite', cvInvalido='incomplete email',
        cvBotao='Invite 3 people', cvVoce='You', cvOwner='Owner',
        cvFrase='You and 3 more people on the way. Each one joins when they accept.',
        cvMedidorA='4 people in', cvMedidorConta='you + 3',
        cvZona='Up to 5 people on Free and Pro',
        cvMedidorPreco='14 days of Pro free. After the trial, the 4 people fit in Free; to stay on Pro, 4 × $16 = $64/month. Only people who accept count.',
    ),
    'es-ES': dict(
        cvSub='Cada persona recibe una invitación por email y entra al aceptarla.',
        cvCampo='Emails', cvPh='nombre@empresa.com', cvAdicionar='Añadir', cvDica='Pega varios a la vez.',
        cvLista='Personas a invitar', cvInvalido='email incompleto',
        cvBotao='Invitar a 3 personas', cvVoce='Tú', cvOwner='Owner',
        cvFrase='Tú y 3 personas más en camino. Cada una entra cuando acepte la invitación.',
        cvMedidorA='4 personas en', cvMedidorConta='tú + 3',
        cvZona='Hasta 5 personas en Free y en Pro',
        cvMedidorPreco='14 días de Pro gratis. Después de la prueba, las 4 personas caben en Free; para seguir en Pro, 4 × US$ 16 = US$ 64/mes. Solo cuenta quien acepte la invitación.',
    ),
}
