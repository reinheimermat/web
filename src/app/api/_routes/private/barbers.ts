import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { prisma } from '@/lib/prisma'
import { createBarberInputSchema, updateBarberInputSchema } from '@/types/barber'
import { PrismaClientKnownRequestError } from '../../../../../generated/prisma/internal/prismaNamespace'

const app = new Hono()

app.get('/', async (c) => {
  try {
    const barbershopId = c.get('barbershopId')

    const barbers = await prisma.barber.findMany({
      where: {
        barbershopId
      }
    })

    return c.json({
      data: barbers
    })
  } catch (error) {
    console.error(error)
    return c.json({ error: 'Internal Server Error' }, 500)
  }
})

app.post('/', zValidator('json', createBarberInputSchema), async (c) => {
  const barbershopId = c.get('barbershopId')

  console.log('barbershopId', barbershopId)

  try {
    const data = c.req.valid('json')

    await prisma.barber.create({
      data: {
        ...data
      }
    })

    return c.body(null, 201)
  } catch (error) {
    console.error(error)

    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        return c.json({ error: 'Barbershop not found' }, 400)
      }
    }

    return c.json({ error: 'Internal Server Error' }, 500)
  }
})

app.put('/:id', zValidator('json', updateBarberInputSchema), async (c) => {
  try {
    const data = c.req.valid('json')
    const id = c.req.param('id')

    if (!id) {
      return c.json({ error: 'Invalid ID' }, 400)
    }

    await prisma.barber.update({
      where: { id },
      data
    })

    return c.body(null, 204)
  } catch (error) {
    console.error(error)
    return c.json({ error: 'Internal Server Error' }, 500)
  }
})

app.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id')

    if (!id) {
      return c.json({ error: 'Invalid ID' }, 400)
    }

    await prisma.barber.delete({
      where: { id }
    })

    return c.body(null, 204)
  } catch (error) {
    console.error(error)
    return c.json({ error: 'Internal Server Error' }, 500)
  }
})

export default app
