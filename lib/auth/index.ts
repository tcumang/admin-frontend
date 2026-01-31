/**
 * Authentication module exports.
 *
 * Provides a clean public API for the auth module.
 *
 * Usage:
 *   import { useAuth, AuthProvider } from "@/lib/auth"
 *   import { getToken, setToken, removeToken } from "@/lib/auth"
 */

// Context and hook
export { AuthProvider, useAuth, AuthContext } from "./context"

// Token management
export {
  getToken,
  setToken,
  removeToken,
  hasToken,
  getStoredUser,
  setStoredUser,
  clearAuthStorage,
} from "./token"

// Cookie configuration
export {
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_MAX_AGE,
  SESSION_COOKIE_MAX_AGE,
  REFRESH_COOKIE_NAME,
  REFRESH_COOKIE_MAX_AGE,
} from "./cookies"

// Route configuration
export {
  LOGIN_PATH,
  DEFAULT_REDIRECT_AFTER_LOGIN,
  CALLBACK_URL_PARAM,
  PUBLIC_PATHS,
  UNPROTECTED_PREFIXES,
  isPublicPath,
  isLoginPath,
  buildLoginUrl,
} from "./config"
