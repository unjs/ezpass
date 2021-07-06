import { defineAuthProvider } from '../types'

export interface BasicAuthOptions {
  username: string
  password: string
}

export const basic = defineAuthProvider<BasicAuthOptions>((opts) => {
  return {
    name: 'basic',
    check(req) {
      const [type, token] = (req.headers.authorization || '').split(' ')
      if (type === 'Basic') {
        const [user, pass] = Buffer.from(token, 'base64').toString().split(':')
        req.auth.session.user = user
        return user === opts.username && pass === opts.password
      }
      return false
    },
    authorize() {
      return {
        authorized: false,
        message: 'Login Required',
        headers: { 'WWW-Authenticate': 'Basic realm="Login Required"' }
      }
    }
  }
})
