/**
 * Route authentication configuration.
 *
 * Central place for defining public routes, login paths, and redirect behavior.
 * Used by both middleware (server-side) and client-side navigation.
 */

/** Path for the login page */
export const LOGIN_PATH = "/login"

/** Default redirect destination after successful login */
export const DEFAULT_REDIRECT_AFTER_LOGIN = "/"

/** Query parameter used to store the original URL for post-login redirect */
export const CALLBACK_URL_PARAM = "callbackUrl"

/**
 * Routes that do NOT require authentication.
 * Middleware allows these paths without a valid token.
 */
export const PUBLIC_PATHS: readonly string[] = [LOGIN_PATH]

/**
 * Path prefixes that are always allowed (Next.js internals, static assets, API routes).
 * Matched by prefix in middleware.
 */
export const UNPROTECTED_PREFIXES: readonly string[] = [
  "/_next",
  "/api/", // Next.js API routes
  "/favicon",
  "/icon",
  "/apple-icon",
  "/placeholder",
]

/**
 * Check if a pathname is public (no authentication required).
 * @param pathname - The URL pathname to check
 */
export function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true
  return UNPROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

/**
 * Check if a pathname is the login page.
 * @param pathname - The URL pathname to check
 */
export function isLoginPath(pathname: string): boolean {
  return pathname === LOGIN_PATH
}

/**
 * Build the login URL with an optional callback URL.
 * @param callbackUrl - The URL to redirect to after login
 */
export function buildLoginUrl(callbackUrl?: string): string {
  if (!callbackUrl || !callbackUrl.startsWith("/")) {
    return LOGIN_PATH
  }
  const url = new URL(LOGIN_PATH, "http://localhost")
  url.searchParams.set(CALLBACK_URL_PARAM, callbackUrl)
  return `${url.pathname}${url.search}`
}
