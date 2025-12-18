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
