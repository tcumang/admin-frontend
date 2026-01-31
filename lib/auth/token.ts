/**
 * Token storage utilities.
 *
 * Manages authentication tokens with dual storage strategy:
 * - localStorage: For client-side API requests (Authorization header)
 * - Cookie: For server-side middleware authentication
 *
 * This dual approach ensures:
 * - SPA-like token access for API calls
 * - SSR/middleware can validate auth before page render
 */

import type { Admin } from "@/lib/types"
import { AUTH_COOKIE_NAME, AUTH_COOKIE_MAX_AGE, SESSION_COOKIE_MAX_AGE } from "./cookies"

const TOKEN_KEY = "admin_auth_token"
const USER_KEY = "admin_user"

/**
 * Check if running in browser environment.
 */
function isBrowser(): boolean {
  return typeof window !== "undefined"
}

/**
 * Set a cookie with the given parameters.
 */
function setCookie(name: string, value: string, maxAgeSeconds: number): void {
  if (!isBrowser()) return
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`
}

/**
 * Clear a cookie by setting its max-age to 0.
 */
function clearCookie(name: string): void {
  if (!isBrowser()) return
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`
}

/**
 * Get the authentication token from localStorage.
 */
export function getToken(): string | null {
  if (!isBrowser()) return null
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * Store the authentication token.
 * @param token - The JWT or auth token
 * @param remember - If true, token persists for AUTH_COOKIE_MAX_AGE (7 days)
 *                   If false, token expires after SESSION_COOKIE_MAX_AGE (24 hours)
 */
export function setToken(token: string, remember?: boolean): void {
  if (!isBrowser()) return
  localStorage.setItem(TOKEN_KEY, token)

  // Sync to cookie for middleware auth
  const maxAge = remember ? AUTH_COOKIE_MAX_AGE : SESSION_COOKIE_MAX_AGE
  setCookie(AUTH_COOKIE_NAME, token, maxAge)
}

/**
 * Remove the authentication token from all storage.
 */
export function removeToken(): void {
  if (!isBrowser()) return
  localStorage.removeItem(TOKEN_KEY)
  clearCookie(AUTH_COOKIE_NAME)
}

/**
 * Check if a valid token exists.
 */
export function hasToken(): boolean {
  return getToken() !== null
}

/**
 * Get the stored admin user from localStorage.
 * Used to restore user state after page refresh.
 */
export function getStoredUser(): Admin | null {
  if (!isBrowser()) return null
  try {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Admin
  } catch {
    return null
  }
}

/**
 * Store the admin user in localStorage.
 * @param user - The admin user object, or null to clear
 */
export function setStoredUser(user: Admin | null): void {
  if (!isBrowser()) return
  if (user === null) {
    localStorage.removeItem(USER_KEY)
  } else {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  }
}

/**
 * Clear all authentication data.
 * Utility for complete logout.
 */
export function clearAuthStorage(): void {
  removeToken()
  setStoredUser(null)
}
