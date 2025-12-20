import z from 'zod'

export const createBarberInputSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().min(2).max(100)
})

export const updateBarberInputSchema = z.object({
  name: z.string().min(2).max(100)
})
