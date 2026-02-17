export interface User {
  id: string
  email: string
  username?: string
  avatar_url?: string
}

export interface AuthError {
  error: string
  fieldErrors?: Record<string, string[]>
}

export interface AuthSuccess {
  success: true
  message: string
}

export type AuthResult = AuthError | AuthSuccess | void
