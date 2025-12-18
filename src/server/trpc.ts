import { initTRPC, TRPCError } from '@trpc/server'
import type { Context } from './context'

const t = initTRPC.context<Context>().create()

export const router = t.router

/**
 * Unprotected procedure
 */
export const publicProcedure = t.procedure

/**
 * Protected procedure
 */
export const protectedProcedure = t.procedure.use(function isAuthed(opts) {
  if (!opts.ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Você precisa estar logado para acessar isso.'
    })
  }

  return opts.next({
    ctx: {
      user: opts.ctx.user,
      prisma: opts.ctx.prisma
    }
  })
})
