import { getCookie } from 'hono/cookie'
import { createMiddleware } from 'hono/factory'
import { verify } from 'hono/jwt'
import { env } from '@/env'

type AuthJwtPayload = {
  sub: string
}

export const authMiddleware = createMiddleware(async (c, next) => {
  const token = getCookie(c, 'barberfy-auth_token')

  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const payload = (await verify(token, env.JWT_SECRET)) as AuthJwtPayload

  c.set('userId', payload.sub)

  await next()
})
