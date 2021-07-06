import { createApp } from 'h3'
import { listen } from 'listhen'
import { createAuthMiddleware } from '../src'

const app = createApp()

app.useAsync(createAuthMiddleware({
  provider: 'github',
  sessionSecret: 'secret',
  providerOptions: {
    clientId: 'e41eb9a028ccaae6358a',
    clientSecret: '16a88f9887fa7b24bc7290d8986b2c204f7878a9'
  }
}))

app.useAsync(req => `Welcome ${req.auth.session.user}!`)

listen(app)
