import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import privateRoutes from '../_routes/private'
import authRoutes from '../_routes/public/auth'
import webhooks from '../_webhooks'

const app = new Hono().basePath('/api')

app.route('/auth', authRoutes)

app.route('/webhooks', webhooks)

app.route('/', privateRoutes)

export const GET = handle(app)
export const POST = handle(app)
export const PUT = handle(app)
export const DELETE = handle(app)
