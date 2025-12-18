import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import routes from '../_routes'

const app = new Hono().basePath('/api')

app.route('/', routes)

export const GET = handle(app)
export const POST = handle(app)
export const PUT = handle(app)
export const DELETE = handle(app)
