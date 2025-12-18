// import { prisma } from '@/lib/prisma'
// import { sendMenu, sendText } from '@/lib/whatsapp'
// import { handleBookingFlow } from './steps/booking'
// import { botStorage } from './storage'

// export async function processMessage(
//   userPhone: string,
//   text: string | null,
//   payloadId: string | null
// ) {
//   // 1. Inicia Sessão
//   const session = await botStorage.get(userPhone)

//   // 2. Comandos de Saída
//   if (text && ['oi', 'ola', 'menu', 'cancelar'].includes(text.toLowerCase().trim())) {
//     session.step = 'NULL'
//     session.tempBooking = {}
//     await botStorage.set(userPhone, session)
//   }

//   // 3. Roteamento
//   switch (session.step) {
//     case 'NULL': {
//       // Procura a barbearia do dono (MVP: Pega a primeira do banco)
//       const shop = await prisma.barbershop.findFirst()
//       if (!shop) return sendText(userPhone, 'Sistema indisponível (sem barbearia).')

//       // Inicializa sessão
//       await botStorage.update(userPhone, { step: 'MENU_PRINCIPAL', barbershopId: shop.id })

//       // Mensagem 1
//       await sendText(userPhone, `Bem vindo a *${shop.name}*! ✂️`)
//       // Mensagem 2 (Menu)
//       await sendMenu(userPhone, 'Como podemos ajudar você hoje?')
//       break
//     }

//     case 'MENU_PRINCIPAL':
//       // Se clicou em "Agendar", o handleBookingFlow assume
//       // Se clicou em "Endereço", tratamos aqui
//       if (payloadId === 'option_endereco') {
//         const shop = await prisma.barbershop.findUnique({ where: { id: session.barbershopId } })
//         await sendText(userPhone, `📍 Estamos em: ${shop?.address || 'Endereço não cadastrado'}`)
//         await sendMenu(userPhone, 'Algo mais?')
//       } else if (payloadId === 'option_meus_horarios') {
//         await sendText(userPhone, 'Você não tem agendamentos futuros.')
//         await sendMenu(userPhone, 'Algo mais?')
//       } else {
//         // Passa a bola para o fluxo de agendamento
//         await handleBookingFlow(userPhone, text, payloadId, session)
//       }
//       break

//     case 'ESCOLHER_BARBEIRO':
//     case 'ESCOLHER_HORARIO':
//       await handleBookingFlow(userPhone, text, payloadId, session)
//       break
//   }
// }
