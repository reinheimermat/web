import { zValidator } from '@hono/zod-validator'
import { google } from 'googleapis'
import { Hono } from 'hono'
import { setCookie } from 'hono/cookie'
import { sign } from 'hono/jwt'
import { env } from '@/env'
import {
  GOOGLE_CALENDAR_SCOPES,
  GOOGLE_OAUTH_SCOPES,
  getCalendarOAuthClient,
  getOAuthClient
} from '@/lib/google'
import { prisma } from '@/lib/prisma'
import {
  connectGoogleCalendarParams,
  googleAuthCallBackParams,
  googleCalendarCallbackParams,
  googleUserSchema
} from '@/types/google'

const app = new Hono()

app.get('/google', (c) => {
  const oauth2Client = getOAuthClient()

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: GOOGLE_OAUTH_SCOPES,
    prompt: 'consent',
    include_granted_scopes: true
  })

  return c.redirect(authUrl)
})

app.get('/google/callback', zValidator('query', googleAuthCallBackParams), async (c) => {
  try {
    const { code } = c.req.valid('query')
    const oauth2Client = getOAuthClient()

    const { tokens } = await oauth2Client.getToken(code)

    oauth2Client.setCredentials(tokens)

    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client })
    const userInfoResponse = await oauth2.userinfo.get()
    const googleUser = userInfoResponse.data

    const { id, name, email } = googleUserSchema.parse(googleUser)

    const { user, barbershop } = await prisma.$transaction(async (tx) => {
      const user = await tx.user.upsert({
        where: { email },
        update: {
          googleId: googleUser.id,
          avatarUrl: googleUser.picture,
          name: googleUser.name || 'User',
          refreshToken: tokens.refresh_token
        },
        create: {
          name,
          email,
          googleId: id,
          refreshToken: tokens.refresh_token
        }
      })

      const barbershop = await tx.barbershop.upsert({
        where: { ownerId: user.id },
        update: {},
        create: {
          name: 'Barbearia default',
          ownerId: user.id,
          address: '123 Main St'
        }
      })

      return { user, barbershop }
    })

    const payload = {
      sub: user.id,
      barbershopId: barbershop.id,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 // 7 days
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
  } catch (error) {
    console.error(error)
    return c.redirect('/login?error=auth')
  }
})

app.get('/google/calendar', zValidator('query', connectGoogleCalendarParams), async (c) => {
  const barberId = c.req.valid('query').barberId
  const oAuth2Client = getCalendarOAuthClient()

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: GOOGLE_CALENDAR_SCOPES,
    prompt: 'consent',
    state: barberId
  })

  return c.redirect(authUrl)
})

app.get(
  '/google/calendar/callback',
  zValidator('query', googleCalendarCallbackParams),
  async (c) => {
    try {
      const { code, state: barberId } = c.req.valid('query')

      console.log(barberId)

      const oauth2Client = getCalendarOAuthClient()

      const { tokens } = await oauth2Client.getToken(code)

      oauth2Client.setCredentials(tokens)

      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client })

      const userInfo = await oauth2.userinfo.get()

      const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

      const barber = await prisma.barber.findUnique({
        where: { id: barberId },
        include: { barbershop: true }
      })

      console.log('Barbeiro', barber)

      if (!barber) {
        c.status(404)
        return c.text('Barber not found')
      }

      const calendarName = `Barberfy - ${barber.barbershop?.name}`

      const newCalendar = await calendar.calendars.insert({
        requestBody: {
          summary: calendarName,
          description: 'Agenda automatizada pelo Barberfy',
          timeZone: 'America/Sao_Paulo'
        }
      })

      const createdCalendarId = newCalendar.data.id

      await prisma.barber.update({
        where: { id: barberId },
        data: {
          googleRefreshToken: tokens.refresh_token,
          googleEmail: userInfo.data.email,
          googleCalendarId: createdCalendarId
        }
      })

      return c.redirect('/dashboard')
    } catch (error) {
      console.error(error)
      c.status(500)
      return c.text('Internal Server Error')
    }
  }
)

export default app
