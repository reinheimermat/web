import { Hono } from 'hono'
import whatsapp from './whatsapp'

const app = new Hono()

app.route('/whatsapp', whatsapp)

export default app
