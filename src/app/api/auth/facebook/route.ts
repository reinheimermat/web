import { NextResponse } from 'next/server'
import z from 'zod'
import { env } from '@/env'
import { prisma } from '@/lib/prisma'

const embeddedSignupSchema = z.object({
  code: z.string().nonempty(),
  waba_id: z.string().nonempty(),
  phone_number_id: z.string().nonempty(),
  barbershopId: z.string().nonempty()
})

const facebookOauthSchema = z.object({
  access_token: z.string().nonempty()
})

export async function POST(req: Request) {
  const url = 'https://graph.facebook.com/v22.0/oauth/access_token'
  const request = await req.json()

  const { code, waba_id, phone_number_id, barbershopId } = embeddedSignupSchema.parse(request)

  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({
      client_id: env.NEXT_PUBLIC_FACEBOOK_APP_ID,
      client_secret: env.FACEBOOK_APP_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri:
        'https://developers.facebook.com/es/oauth/callback/?business_id=3052701438450753&nonce=KDKkdHIIfWDVZFDFZ2vP8OCgEdnyoBdY'
    }),
    headers: { 'Content-Type': 'application/json' }
  })

  const data = await response.json()

  const { access_token } = facebookOauthSchema.parse(data)

  console.log(data)

  await prisma.barbershop.update({
    where: {
      id: barbershopId
    },
    data: {
      wabaId: waba_id,
      phoneId: phone_number_id,
      whatsappToken: access_token
    }
  })

  return NextResponse.json({
    success: true,
    access_token: access_token,
    waba_id,
    phone_number_id
  })
}
