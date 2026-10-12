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
        convidarTit='Chame o seu time', convidarSub='Cada pessoa recebe um convite por e-mail, que vale 7 dias.',
        emailPessoa='E-mail', papel='Papel', remover='Remover', adicionarPessoa='Adicionar outra pessoa',
        convidarBotao='Convidar', pular='Pular por agora', emailPessoaPh='nome@empresa.com',
        papelMaintainer='Maintainer', papelMember='Member', papelGuest='Guest',
        fraseConvites='Você e mais duas pessoas a caminho. Elas entram quando aceitarem o convite.',
        # aceite de convite
        conviteTitA='Seu convite para', conviteSubA='te chamou para participar como', enviadoPara='Enviado para',
        conviteDeslogadoA='Para aceitar, entre com a conta de', conviteDeslogadoB='ou crie uma com esse e-mail.',
        validade='O convite vale 7 dias.', aceitarBotao='Aceitar convite',
        conviteLogado='Ao aceitar, o workspace aparece na sua conta.',
        convitePrevia='Um lugar no time está esperando por você.',
        invalidoTit='Este convite não está disponível',
        invalidoTxt='Peça um convite novo a quem te chamou. Se você já faz parte do workspace, é só entrar.',
        irEntrar='Entrar no Muriki Platform',
    ),
    'en-US': dict(
        entrarBotao='Sign in', codigoAria='6-digit code', verificarBotao='Verify', criarBotao='Create account',
        codigoTit='Confirm your email', codigoSubA='We sent a 6-digit code to',
        expira='The code is valid for 10 minutes.', naoChegou='Didn’t get it?', reenviarEm='Resend in 0:48',
        spam='Also check spam and promotions.',
        jaContaTit='You already have a Muriki account',
        jaContaTxt='It’s the same one as Muriki Code, and your @username comes along. All that’s left is accepting the Platform terms and creating the workspace.',
        convidarTit='Bring in your team', convidarSub='Each person gets an invitation by email, valid for 7 days.',
        emailPessoa='Email', papel='Role', remover='Remove', adicionarPessoa='Add another person',
        convidarBotao='Invite', pular='Skip for now', emailPessoaPh='name@company.com',
        papelMaintainer='Maintainer', papelMember='Member', papelGuest='Guest',
        fraseConvites='You and two more people on the way. They join when they accept.',
        conviteTitA='Your invitation to', conviteSubA='invited you to join as', enviadoPara='Sent to',
        conviteDeslogadoA='To accept, sign in with the account for', conviteDeslogadoB='or create one with that email.',
        validade='The invitation is valid for 7 days.', aceitarBotao='Accept invitation',
        conviteLogado='Once you accept, the workspace shows up in your account.',
        convitePrevia='A seat on the team is waiting for you.',
        invalidoTit='This invitation isn’t available',
        invalidoTxt='Ask whoever invited you for a new one. If you’re already in the workspace, just sign in.',
        irEntrar='Sign in to Muriki Platform',
    ),
    'es-ES': dict(
        entrarBotao='Entrar', codigoAria='Código de 6 dígitos', verificarBotao='Verificar', criarBotao='Crear cuenta',
        codigoTit='Confirma tu email', codigoSubA='Enviamos un código de 6 dígitos a',
        expira='El código vale 10 minutos.', naoChegou='¿No te llegó?', reenviarEm='Reenviar en 0:48',
        spam='Mira también en spam y promociones.',
        jaContaTit='Ya tienes cuenta Muriki',
        jaContaTxt='Es la misma de Muriki Code, y tu @usuario viene con ella. Solo falta aceptar los términos de Platform y crear el workspace.',
        convidarTit='Trae a tu equipo', convidarSub='Cada persona recibe una invitación por email, que vale 7 días.',
        emailPessoa='Email', papel='Rol', remover='Quitar', adicionarPessoa='Añadir otra persona',
        convidarBotao='Invitar', pular='Saltar por ahora', emailPessoaPh='nombre@empresa.com',
        papelMaintainer='Maintainer', papelMember='Member', papelGuest='Guest',
        fraseConvites='Tú y dos personas más en camino. Entran cuando acepten la invitación.',
        conviteTitA='Tu invitación a', conviteSubA='te invitó a participar como', enviadoPara='Enviada a',
        conviteDeslogadoA='Para aceptar, entra con la cuenta de', conviteDeslogadoB='o crea una con ese email.',
        validade='La invitación vale 7 días.', aceitarBotao='Aceptar invitación',
        conviteLogado='Al aceptar, el workspace aparece en tu cuenta.',
        convitePrevia='Un lugar en el equipo te está esperando.',
        invalidoTit='Esta invitación no está disponible',
        invalidoTxt='Pide una invitación nueva a quien te invitó. Si ya eres parte del workspace, solo tienes que entrar.',
        irEntrar='Entrar en Muriki Platform',
    ),
}
