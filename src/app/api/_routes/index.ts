// index.ts
import { Hono } from 'hono'
import { authMiddleware } from '../_middlewares/auth-middleware'
import auth from './auth'
import whatsapp from './whatsapp'

const app = new Hono()

app.use('/whatsapp/*', authMiddleware)

// 😃
app.route('/auth', auth)

app.route('/whatsapp', whatsapp)

export default app
