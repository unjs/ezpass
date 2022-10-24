import { createApp, eventHandler, fromNodeMiddleware, toNodeListener } from 'h3'
import { listen } from 'listhen'
import { createAuthMiddleware } from '../src'

const app = createApp()

app.use(fromNodeMiddleware(createAuthMiddleware({
  bypass: true,
  provider: 'basic',
  username: 'test',
  password: 'test'
})))

// TODO: How to infer type here correctly?
// @ts-ignore
app.use(eventHandler(event => `Welcome ${event.req.auth?.session.user ?? 'guest'}!`))

listen(toNodeListener(app))
