import ky from 'ky'
import { env } from '@/env'
import type { WhatsAppMessagePayload } from '@/types/whatsapp'

export async function sendWhatsAppMessage(to: string, content: any, phoneId: string) {
  try {
    const payload: WhatsAppMessagePayload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to,
      ...content
    }

    await ky.post(`https://graph.facebook.com/v22.0/${phoneId}/messages`, {
      headers: {
        Authorization: `Bearer ${env.WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      },
      json: payload
    })
  } catch (error) {
    console.error('Erro ao enviar mensagem WhatsApp:', error)
    // Em produção, você pode querer salvar esse erro no banco ou Sentry
  }
}

// --- HELPERS PARA FACILITAR ---

// Enviar Texto Simples
export async function sendText(to: string, text: string, phoneId: string) {
  return sendWhatsAppMessage(
    to,
    {
      type: 'text',
      text: { body: text }
    },
    phoneId
  )
}

// Enviar Menu com Botões (Máximo 3 opções)
export async function sendMenu(to: string, text: string, phoneId: string) {
  return sendWhatsAppMessage(
    to,
    {
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text: text },
        action: {
          buttons: [
            { type: 'reply', reply: { id: 'option_agendar', title: '✂️ Agendar' } },
            { type: 'reply', reply: { id: 'option_meus_horarios', title: '📅 Meus Horários' } },
            { type: 'reply', reply: { id: 'option_endereco', title: '📍 Endereço' } }
          ]
        }
      }
    },
    phoneId
  )
}

// Enviar Lista (Menu Dropdown - Para muitos itens)
export async function sendList(
  to: string,
  phoneId: string,
  bodyText: string,
  buttonText: string,
  sections: { title: string; rows: { id: string; title: string; description?: string }[] }[]
) {
  return sendWhatsAppMessage(
    to,
    {
      type: 'interactive',
      interactive: {
        type: 'list',
        header: { type: 'text', text: 'Barberfy' }, // Título opcional
        body: { text: bodyText },
        footer: { text: 'Toque abaixo para selecionar' },
        action: {
          button: buttonText,
          sections: sections
        }
      }
    },
    phoneId
  )
}
