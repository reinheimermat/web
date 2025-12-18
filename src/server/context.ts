import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { env } from '@/env'
import { prisma } from '@/lib/prisma'

export async function createContext(opts: FetchCreateContextFnOptions) {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value

  let user = null

  if (token) {
    try {
      // Verifica o JWT
      const decoded = jwt.verify(token, env.JWT_SECRET) as {
        userId: string
        email: string
      }
      user = { id: decoded.userId, email: decoded.email }
    } catch (err) {
      // Token inválido ou expirado
      user = null
    }
  }

  return {
    user,
    prisma,
    headers: opts?.req.headers
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>
