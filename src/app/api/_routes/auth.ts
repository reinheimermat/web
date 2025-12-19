import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { setCookie } from 'hono/cookie'
import { sign } from 'hono/jwt'
import ky from 'ky'
import { env } from '@/env'
import { prisma } from '@/lib/prisma'
import { googleAuthCallBackParams, type UserInfo } from '@/types/google'

const app = new Hono()

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo'

const redirectUri = `http://${env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`

app.get('/google', (c) => {
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'email profile https://www.googleapis.com/auth/calendar',
    access_type: 'offline',
    prompt: 'consent'
  })

  return c.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`)
})

app.get('/google/callback', zValidator('query', googleAuthCallBackParams), async (c) => {
  const code = c.req.valid('query').code

  const tokenRes = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    })
  })

  const tokenData = await tokenRes.json()

  const googleUser = await ky
    .get(USERINFO_URL, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`
      }
    })
    .json<UserInfo>()

  const user = await prisma.$transaction(async (tx) => {
    const user = await tx.user.upsert({
      where: { email: googleUser.email },
      update: {
        googleId: googleUser.id,
        avatarUrl: googleUser.picture,
        name: googleUser.name,
        refreshToken: tokenData.refresh_token
      },
      create: {
        name: googleUser.name,
        email: googleUser.email,
        googleId: googleUser.id,
        refreshToken: tokenData.refresh_token
      }
    })

    await tx.barbershop.upsert({
      where: { ownerId: user.id },
      update: {},
      create: {
        name: 'Barbearia default',
        ownerId: user.id,
        address: '123 Main St'
      }
    })

    return user
  })

  const payload = {
    sub: user.id,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7
  }

  const jwt = await sign(payload, env.JWT_SECRET)

  setCookie(c, 'barberfy-auth_token', jwt, {
    httpOnly: true,
    path: '/',
    maxAge: 604800, // 7 days
    sameSite: 'Lax',
    secure: env.NODE_ENV === 'production'
  })

  return c.redirect('/')
})

export default app
