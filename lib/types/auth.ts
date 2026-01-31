/**
 * Authentication-related type definitions.
 * Centralized auth types for the admin panel.
 */

// Admin user entity returned from the API
export interface Admin {
  id: number
  firstName: string
  lastName: string
  email: string
  profilePicture: string | null
}

// Login request payload
export interface LoginPayload {
  email: string
  password: string
}

// Login API response shape
export interface LoginResponse {
  success: boolean
  message: string
  data: {
    admin: Admin
    token: string
  }
}

// Login options for the auth hook
export interface LoginOptions {
  redirectTo?: string
  remember?: boolean
}

// Auth context state and methods
export interface AuthContextType {
  user: Admin | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (payload: LoginPayload, options?: LoginOptions) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => void
}

// Token storage options
export interface TokenOptions {
  remember?: boolean
}
