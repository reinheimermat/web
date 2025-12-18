import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import ky from 'ky'
import { env } from '@/env'
import { prisma } from '@/lib/prisma'
import type { TokenResponse } from '@/types/google'
import { embeddedSignupSchema } from '@/types/whatsapp'

const app = new Hono()

app.post('/embedded-signup', zValidator('json', embeddedSignupSchema), async (c) => {
  const { code, waba_id, phone_number_id } = c.req.valid('json')
  const userId = c.get('userId')

  const params = new URLSearchParams({
    client_id: env.NEXT_PUBLIC_FACEBOOK_APP_ID,
    client_secret: env.FACEBOOK_APP_SECRET,
    code,
    grant_type: 'authorization_code',
    redirect_uri:
      'https://developers.facebook.com/es/oauth/callback/?business_id=3052701438450753&nonce=KDKkdHIIfWDVZFDFZ2vP8OCgEdnyoBdY'
  })

  const response = await ky
    .post('https://graph.facebook.com/v22.0/oauth/access_token', {
      body: params.toString(),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .json<TokenResponse>()

  if (!response.access_token) {
    return c.json(
      {
        error: 'Failed to exchange code',
        meta: response
      },
      400
    )
  }

  await prisma.barbershop.update({
    where: {
      ownerId: userId
    },
    data: {
      wabaId: waba_id,
      phoneId: phone_number_id,
      whatsappToken: response.access_token
    }
  })

  return c.status(200)
})

export default app
