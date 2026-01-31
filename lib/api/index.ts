/**
 * API services exports.
 *
 * Central export file for all API services.
 * Import from here for cleaner imports.
 *
 * Usage:
 *   import { login, logout } from "@/lib/api"
 *   import { getNewsList, saveNews } from "@/lib/api"
 */

// Client utilities
export {
  apiFetch,
  saveWithModalMode,
  buildApiUrl,
  ApiError,
  API_BASE_URL,
  type ApiErrorShape,
  type RequestOptions,
} from "./client"

// Auth API
export { login, logout, refreshToken, verifyToken } from "./auth"

// News API
export { getNewsList, getNewsById, saveNews, deleteNews } from "./news"

// PDF API
export { getPdfList, getPdfById, savePdf, deletePdf } from "./pdfs"

// Settings API
export {
  updateProfile,
  getProfile,
  updateLogo,
  updatePassword,
} from "./settings"
