import { createApp } from 'h3'
import { listen } from 'listhen'
import { createAuthMiddleware } from '../src'

const app = createApp()

app.use(createAuthMiddleware({
  provider: 'basic',
  sessionSecret: 'secret',
  username: 'test',
  password: 'test'
}))

app.use(req => `Welcome ${req.auth.session.user}!`)

listen(app)
