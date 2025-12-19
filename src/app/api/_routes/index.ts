// index.ts
import { Hono } from 'hono'
import { authMiddleware } from '../_middlewares/auth-middleware'
import webhooks from '../_webhooks'
import auth from './auth'
import whatsapp from './whatsapp'

const app = new Hono()

app.use('/whatsapp/*', authMiddleware)

// 😃
app.route('/auth', auth)

app.route('/whatsapp', whatsapp)

app.route('/webhooks', webhooks)

export default app
