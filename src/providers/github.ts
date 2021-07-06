import requrl from 'requrl'
import { withQuery, getQuery, parseQuery } from 'ufo'
import { $fetch } from 'ohmyfetch/node'
import { defineAuthProvider } from '../types'

export interface GithubAuthOptions {
  clientId: string
  clientSecret: string
}

export const github = defineAuthProvider<GithubAuthOptions>((opts) => {
  return {
    name: 'github',
    check (req) {
      return !!req.auth.session.user
    },
    async authorize (req) {
      // Redirect
      if (!req.url.includes('__github_callback__')) {
        return {
          redirect: withQuery('https://github.com/login/oauth/authorize', {
            client_id: opts.clientId,
            scope: 'user',
            redirect_uri: withQuery(requrl(req), { __github_callback__: '' })
          }),
          session: {
            url: requrl(req, true)
          }
        }
      }

      // Handle callback
      // Request access token
      const q = getQuery(req.url)
      const res = parseQuery(await $fetch('https://github.com/login/oauth/access_token', {
        params: {
          client_id: opts.clientId,
          client_secret: opts.clientSecret,
          code: q.code
        }
      }))

      if (res.error || !res.access_token) {
        return {
          authorized: false,
          message: (res.error_description || res.error || 'Unknown error') as string
        }
      }

      const user = await $fetch('https://api.github.com/user', {
        headers: {
          Authorization: 'Bearer ' + res.access_token
        }
      })

      return {
        authorized: true,
        redirect: req.auth.session.redirect_url || requrl(req),
        session: {
          token: res.access_token as string,
          user: user.login,
          redirect_url: undefined
        }
      }
    }
  }
})
