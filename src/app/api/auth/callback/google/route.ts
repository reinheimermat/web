import jwt from 'jsonwebtoken'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!
const JWT_SECRET = process.env.JWT_SECRET! // Crie isso no .env

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')

  if (!code) return NextResponse.redirect(new URL('/login?error=no_code', req.url))

  try {
    // 1. Trocar Code por Tokens do Google
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/google`
      })
    })

    const tokenData = await tokenResponse.json()

    // 2. Pegar dados do Usuário no Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    })
    const googleUser = await userResponse.json()

    if (!googleUser.email) throw new Error('Email não fornecido pelo Google')

    // 3. Upsert no Prisma (Cria ou Atualiza)
    const user = await prisma.user.upsert({
      where: { email: googleUser.email },
      update: {
        googleId: googleUser.id,
        avatarUrl: googleUser.picture,
        name: googleUser.name,
        refreshToken: tokenData.refresh_token
      },
      create: {
        email: googleUser.email,
        name: googleUser.name,
        googleId: googleUser.id,
        avatarUrl: googleUser.picture,
        refreshToken: tokenData.refresh_token
      }
    })

    // 4. Gerar o JWT da SUA aplicação
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d'
    })

    // 5. Criar a resposta e setar o Cookie HTTP-Only
    const response = NextResponse.redirect(new URL('/', req.url))

    response.cookies.set('auth_token', token, {
      httpOnly: true, // JavaScript não lê (segurança contra XSS)
      secure: process.env.NODE_ENV === 'production', // Só HTTPS em prod
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 dias
    })

    return response
  } catch (error) {
    console.error(error)
    return NextResponse.redirect(new URL('/login?error=auth_failed', req.url))
  }
}
