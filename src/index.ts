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

export function createAuth (opts: CreateAuthOptions) {
  const providerCtor = providers[opts.provider || 'basic'] as AuthProvider
  const provider = providerCtor(opts.providerOptions)

  return {
    provider
  }
}

export function createAuthMiddleware (opts: CreateAuthOptions) {
  const auth = createAuth(opts)

  return async (req, res, next = noop) => {
    // Load Session
    const sessionStr = cookie.parse(req.headers.cookie || '').session
    let session = {}
    if (sessionStr) {
      try {
        session = jwt.verify(sessionStr, opts.sessionSecret)
      } catch (err) {
        // Ignore error and re-validate the session
      }
    }
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
      if (!opts.sessionSecret) {
        throw new Error('[ezpass] Session secret is required (`sessionSecret`)')
      }
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
      return
    }

    // Good to go
    return next()
  }
}
