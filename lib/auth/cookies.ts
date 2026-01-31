/**
 * Authentication cookie configuration.
 *
 * Defines cookie names and expiration settings for auth tokens.
 * Middleware reads this cookie to validate authentication before page render.
 */

/** Cookie name for the authentication token */
export const AUTH_COOKIE_NAME = "admin_auth_token"

/** Cookie max-age for "remember me" sessions (7 days in seconds) */
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7

/** Cookie max-age for session-only tokens (24 hours in seconds) */
export const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24

/** Refresh token cookie name (for future implementation) */
export const REFRESH_COOKIE_NAME = "admin_refresh_token"

/** Refresh token max-age (30 days in seconds) */
export const REFRESH_COOKIE_MAX_AGE = 60 * 60 * 24 * 30
