# ezpass

> Dead simple password protection middleware

## Usage

```js
import { createAuthMiddleware } from 'ezpass'
import express from 'express'

const app = express()

app.use(createAuthMiddleware({
  provider: 'basic',
  providerOptions: { username: 'test', password: 'test' }
}))

app.use((_req, res) => { res.end(`Welcome ${req.auth.session.user}!`) })

app.listen(3000)
```

## Options

- `provider`
- `providerOptions`
- `sessionSecret`
- `bypass`

## Providers

### `basic`

**Options:**
- `username`
- `password`

**Example:**

```js
app.use(createAuthMiddleware({
  provider: 'basic',
  providerOptions: {
    username: 'test',
    password: 'test'
  }
}))
```

### `github`

**Options:**

- `clientId`
- `clientSecret`

**Example:**

```js
app.use(createAuthMiddleware({
  provider: 'github',
  sessionSecret: '...',
  providerOptions: {
    clientId: '...',
    clientSecret: '...',
  }
}))
```

## Development

- Clone Repository
- Install dependencies with `yarn install`
- Use `yarn dev test/basic` to start basic example

## License

MIT
