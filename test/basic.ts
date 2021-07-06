import { createApp } from 'h3'
import { listen } from 'listhen'
import { createAuthMiddleware } from '../src'

const app = createApp()

app.useAsync(createAuthMiddleware({
  provider: 'basic',
  sessionSecret: 'secret',
  providerOptions: {
    username: 'test',
    password: 'test'
  }
}))

app.useAsync(req => `Welcome ${req.auth.session.user}!`)

listen(app)
