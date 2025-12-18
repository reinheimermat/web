import z from 'zod'

export type WhatsAppMessagePayload = {
  messaging_product: 'whatsapp'
  recipient_type: 'individual'
  to: string
  type: 'text' | 'interactive'
  text?: { body: string }
  interactive?: {
    type: 'button' | 'list'
    header?: { type: 'text'; text: string }
    body: { text: string }
    footer?: { text: string }
    action: {
      button?: string
      buttons?: { type: 'reply'; reply: { id: string; title: string } }[]
      sections?: { title: string; rows: { id: string; title: string; description?: string }[] }[]
    }
  }
}

export const embeddedSignupSchema = z.object({
  code: z.string().min(10),
  waba_id: z.string().min(5),
  phone_number_id: z.string().min(5),
  barbeariaId: z.string()
})

export interface TokenResponse {
  access_token: string
}
