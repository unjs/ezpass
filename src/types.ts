import { IncomingMessage } from 'http'

export interface AuthContext {
  user: string;
  pass: string;
}

export type AuthSession = Record<string, string>
export type HTTPHeaders = Record<string, string>

export interface HTTPResponse {
  status: number
  headers: HTTPHeaders
  body: string
}

export interface HTTPRequest extends IncomingMessage {
  auth: { session: AuthSession }
}

export interface AuthorizeResult {
  authorized?: Boolean,
  message?: string,
  redirect?: string,
  headers?: HTTPHeaders
  session?: AuthSession
}

export interface AuthImplementation {
  name: string
  check: (req: HTTPRequest) => boolean | Promise<boolean>
  authorize: (req: HTTPRequest) => AuthorizeResult | Promise<AuthorizeResult>
}

export type AuthProvider<T = any> = (options: T) => AuthImplementation

export function defineAuthProvider<T = any> (provider: AuthProvider<T>): AuthProvider<T> {
  return provider
}

export interface CreateAuthOptions {
  sessionSecret?: string
  provider?: string
  providerOptions?: any
  bypass?: boolean
  onAuthorize?: (authReses: AuthorizeResult, req: IncomingMessage) => void | Promise<void>
  unauthorizedTemplate?: string
  [key: string]: any
}
