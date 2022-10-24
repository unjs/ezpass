import { createApp, eventHandler, fromNodeMiddleware, toNodeListener } from 'h3'
import { listen } from 'listhen'
import { createAuthMiddleware } from '../src'

const app = createApp()

app.use(fromNodeMiddleware(createAuthMiddleware({
  provider: 'github',
  sessionSecret: 'secret',
  clientId: 'e41eb9a028ccaae6358a',
  clientSecret: '16a88f9887fa7b24bc7290d8986b2c204f7878a9'
})))

// TODO: How to infer type here correctly?
// @ts-ignore
app.use(eventHandler(event => `Welcome ${event.req.auth.session.user}!`))

listen(toNodeListener(app))
