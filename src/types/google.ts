import z from 'zod'

export const googleAuthCallBackParams = z.object({
  code: z.string()
})

export type GoogleAuthCallBackParams = z.infer<typeof googleAuthCallBackParams>

export interface TokenResponse {
  access_token: string
  expires_in: number
  refresh_token?: string
  scope: string
  token_type: string
  id_token: string
}

export interface UserInfo {
  id: string
  email: string
  verified_email: boolean
  name: string
  given_name: string
  family_name: string
  picture: string
  locale: string
}
