import { google } from 'googleapis'
import { env } from '@/env'

const CALLBACK_URL_LOGIN = `${env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`
const CALLBACK_URL_CALENDAR = `${env.NEXT_PUBLIC_APP_URL}/api/auth/google/calendar/callback`

export const getOAuthClient = () => {
  return new google.auth.OAuth2(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, CALLBACK_URL_LOGIN)
}

export const getCalendarOAuthClient = () => {
  return new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    CALLBACK_URL_CALENDAR
  )
}

export const GOOGLE_OAUTH_SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'openid' // Boa prática para ID Token
]

export const GOOGLE_CALENDAR_SCOPES = [
  'https://www.googleapis.com/auth/calendar', // Permissão total de calendar
  'https://www.googleapis.com/auth/userinfo.email'
]
