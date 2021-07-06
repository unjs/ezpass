import cookie from 'cookie'
import jwt from 'jsonwebtoken'
import * as providers from './providers'
import { AuthProvider } from './types'

export interface CreateAuthOptions {
  sessionSecret?: string
  provider?: string
  providerOptions?: any
}

const noop = () => { }

export function createAuth(opts: CreateAuthOptions) {
  const providerCtor = providers[opts.provider || 'basic'] as AuthProvider
  const provider = providerCtor(opts.providerOptions)

  return {
    provider
  }
}

export function createAuthMiddleware(opts: CreateAuthOptions) {
  const auth = createAuth(opts)

  return async (req, res, next = noop) => {
    // Load Session
    const sessionStr = cookie.parse(req.headers.cookie || '').session
    const session = sessionStr ? jwt.verify(sessionStr, opts.sessionSecret) : {}

    // Populate req.auth
    req.auth = { session }

    // Check if user is authenticated
    const isAuthenticated = await auth.provider.check(req)
    if (isAuthenticated) {
      return next()
    }

    // Try to authenticate
    const authRes = await auth.provider.authorize(req)

    // Send headers
    if (authRes.headers) {
      for (const header in authRes.headers) {
        res.setHeader(header, authRes.headers[header])
      }
    }

    // Update session
    if (authRes.session) {
      Object.assign(session, authRes.session)
      res.setHeader('Set-Cookie', cookie.serialize('session', jwt.sign(session, opts.sessionSecret)))
    }

    // Check for redirect
    if (authRes.redirect) {
      res.statusCode = 302
      res.setHeader('Location', authRes.redirect)
      res.end(authRes.message || 'Redirecting to ' + authRes.redirect)
      return
    }

    // Check to render unauthenticated page
    if (!authRes.authorized) {
      res.statusCode = 401
      res.end(authRes.message || 'Unauthorized')
    }

    // Good to go
    return next()
  }
}
