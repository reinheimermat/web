import { Hono } from 'hono'
import { prisma } from '@/lib/prisma'

const app = new Hono()

app.get('/', async (c) => {
  try {
    const barbershopId = c.get('barbershopId')

    const services = await prisma.service.findMany({
      where: {
        barbershopId
      }
    })

    return c.json({
      data: services
    })
  } catch (error) {
    console.error(error)
    return c.json({ error: 'Internal Server Error' }, 500)
  }
})

export default app
