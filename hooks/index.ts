/**
 * Custom hooks exports.
 *
 * Central export file for all custom hooks.
 *
 * Usage:
 *   import { useNews, usePdfs, useToast, useMobile } from "@/hooks"
 */

// UI hooks
export { useToast } from "./use-toast"
export { useMobile } from "./use-mobile"

// Data hooks - News
export {
  useFetchNews,
  useFetchSingleNews,
  useCreateNews,
  useUpdateNews,
  useDeleteNews,
} from "./use-news"

// Data hooks - PDFs
export { usePdfs, usePdfItem } from "./use-pdfs"

// Data hooks - Settings
export {
  useFetchLogo,
  useUpdateLogo,
  useChangePassword,
  // Legacy exports
  useProfileUpdate,
  useLogoUpdate,
  usePasswordUpdate,
} from "./use-settings"
