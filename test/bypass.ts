import { createApp } from 'h3'
import { listen } from 'listhen'
import { createAuthMiddleware } from '../src'

const app = createApp()

app.useAsync(createAuthMiddleware({
  bypass: true,
  provider: 'basic',
  providerOptions: {
    username: 'test',
    password: 'test'
  }
}))

app.useAsync(req => `Welcome ${req.auth}!`)

listen(app)
