import { parse, serialize } from 'cookie'
import jwt from 'jsonwebtoken'
import * as providers from './providers'
import { CreateAuthOptions, AuthProvider } from './types'

const noop = () => { }

export function createAuth (opts: CreateAuthOptions) {
  // eslint-disable-next-line import/namespace
  const providerCtor = providers[opts.provider || 'basic'] as AuthProvider
  const provider = providerCtor(opts.providerOptions || opts)

  return {
    provider
  }
}

export function createAuthMiddleware (opts: CreateAuthOptions) {
  if (opts.bypass === true) {
    return (_req, _res, next = noop) => next()
  }
  const auth = createAuth(opts)

  return async (req, res, next = noop) => {
    // Load Session
    const sessionStr = parse(req.headers.cookie || '').session
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

    // Allow hooking on authorize
    if (typeof opts.onAuthorize === 'function') {
      await opts.onAuthorize(authRes, req)
    }

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
      res.setHeader('Set-Cookie', serialize('session', jwt.sign(session, opts.sessionSecret)))
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
      // TODO: Support {message} and dynamic load
      res.end(opts.unauthorizedTemplate || authRes.message || 'Unauthorized')
      return
    }

    // Good to go
    return next()
  }
}
