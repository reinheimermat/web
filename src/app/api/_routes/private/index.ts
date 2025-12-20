import { Hono } from 'hono'
import { authMiddleware } from '../../_middlewares/auth-middleware'
import barbers from './barbers'
import services from './services'

const app = new Hono()

app.use('*', authMiddleware)

app.route('/barbers', barbers)
app.route('/services', services)

export default app
