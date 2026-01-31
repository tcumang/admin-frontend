/**
 * Authentication API service.
 *
 * Handles login, logout, and future auth-related API calls.
 */

import type { LoginPayload, LoginResponse, TokenOptions } from "@/lib/types"
import { apiFetch } from "./client"
import { setToken, removeToken } from "@/lib/auth/token"

const AUTH_BASE = "/auth"

/**
 * Login to the admin panel.
 *
 * @param payload - Login credentials (email and password)
 * @param options - Token storage options (remember me)
 * @returns Login response with admin user and token
 *
 * @example
 * const response = await login({ email: "admin@example.com", password: "secret" })
 * console.log(response.data.admin)
 */
export async function login(
  payload: LoginPayload,
  options?: TokenOptions
): Promise<LoginResponse> {
  const response = await apiFetch<LoginResponse>(`${AUTH_BASE}/login`, {
    method: "POST",
    body: payload,
    anonymous: true, // Login doesn't require auth token
  })

  // Store token on successful login (syncs to cookie for middleware)
  if (response.success && response.data?.token) {
    setToken(response.data.token, options?.remember)
  }

  return response
}

/**
 * Logout from the admin panel.
 *
 * Calls the logout endpoint and clears local auth state.
 * Clears tokens even if the API call fails (e.g., token already expired).
 *
 * @example
 * await logout()
 */
export async function logout(): Promise<void> {
  try {
    await apiFetch<void>(`${AUTH_BASE}/logout`, { method: "POST" })
  } catch {
    // Clear local state even if API fails so user can still log out
  } finally {
    removeToken()
  }
}

/**
 * Refresh the authentication token.
 *
 * PLACEHOLDER: Implement when backend supports refresh tokens.
 * Will exchange refresh token for new access token.
 *
 * @example
 * const newToken = await refreshToken()
 */
export async function refreshToken(): Promise<{ token: string } | null> {
  // TODO: Implement when backend supports refresh tokens
  // const response = await apiFetch<{ token: string }>(`${AUTH_BASE}/refresh`, {
  //   method: "POST",
  // })
  // if (response.token) {
  //   setToken(response.token)
  // }
  // return response
  return null
}

/**
 * Verify current authentication token.
 *
 * PLACEHOLDER: Implement when backend supports token verification.
 * Useful for checking if current token is still valid.
 *
 * @example
 * const isValid = await verifyToken()
 */
export async function verifyToken(): Promise<boolean> {
  // TODO: Implement when backend supports token verification
  // try {
  //   await apiFetch<void>(`${AUTH_BASE}/verify`, { method: "GET" })
  //   return true
  // } catch {
  //   return false
  // }
  return false
}
