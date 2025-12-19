import { Hono } from 'hono'
import { env } from '@/env'

const webhook = new Hono()

webhook.get('/', (c) => {
  const mode = c.req.query('hub.mode')
  const token = c.req.query('hub.verify_token')
  const challenge = c.req.query('hub.challenge')

  if (mode === 'subscribe' && token === env.WHATSAPP_WEBHOOK_TOKEN) {
    console.log('Webhook verificado com sucesso! ✅')

    return c.text(challenge || '')
  }

  return c.text('Forbidden', 403)
})

webhook.post('/', async (c) => {
  try {
    const body = await c.req.json()

    console.log('------------------------------------------------')
    console.log('🔥 PAYLOAD RECEBIDO (Raw JSON):')
    console.log(JSON.stringify(body, null, 2)) // O '2' deixa o JSON indentado e bonito
    console.log('------------------------------------------------')

    // Retorna 200 OK para o Facebook saber que chegou
    return c.text('Hello World - Recebido com sucesso!', 200)
  } catch (error) {
    console.error('Erro ao ler JSON:', error)
    return c.text('Erro no processamento', 500)
  }
})

export default webhook
