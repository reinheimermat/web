import z from 'zod'

export const googleAuthCallBackParams = z.object({
  code: z.string()
})

export const googleCalendarCallbackParams = googleAuthCallBackParams.extend({
  state: z.cuid()
})

export const connectGoogleCalendarParams = z.object({
  barberId: z.cuid()
})

export const googleUserSchema = z.object({
  id: z.string().nonempty(),
  name: z.string().nonempty(),
  email: z.email().nonempty()
})

export type ConnectGoogleCalendarParams = z.infer<typeof connectGoogleCalendarParams>

export type GoogleCalendarCallbackParams = z.infer<typeof googleCalendarCallbackParams>

export type GoogleAuthCallBackParams = z.infer<typeof googleAuthCallBackParams>
