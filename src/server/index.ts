import { authRouter } from './routers/auth-router'
import { barbershopRouter } from './routers/barbershop-router'
import { router } from './trpc'

export const appRouter = router({
  auth: authRouter,
  barbershop: barbershopRouter
})

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter
