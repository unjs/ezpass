import { createApp } from 'h3'
import { listen } from 'listhen'
import { createAuthMiddleware } from '../src'

const app = createApp()

app.use(createAuthMiddleware({
  bypass: true,
  provider: 'basic',
  username: 'test',
  password: 'test'
}))

app.use(req => `Welcome ${req.auth?.session ? 'user' : 'guest'}!`)

listen(app)
