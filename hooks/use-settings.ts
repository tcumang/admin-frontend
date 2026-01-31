/**
 * Settings hooks.
 *
 * Hooks for settings operations (logo, password).
 *
 * @example
 * // Fetch logo
 * const { logoUrl, isLoading, error, refetch } = useFetchLogo()
 *
 * // Update logo
 * const { updateLogo, isUpdating, error } = useUpdateLogo()
 *
 * // Change password
 * const { changePassword, isChanging, error } = useChangePassword()
 */

import { useState, useCallback } from "react"
import useSWR from "swr"
import type { ChangePasswordPayload } from "@/lib/types"
import {
  getLogo as apiGetLogo,
  updateLogo as apiUpdateLogo,
  changePassword as apiChangePassword,
  buildLogoUrl,
} from "@/lib/api/settings"

// ============================================================
// Logo Hooks
// ============================================================

/**
 * SWR key for logo fetching
 */
const LOGO_SWR_KEY = "/settings/logo"

/**
 * Hook to fetch the current app logo.
 * Uses SWR for caching and revalidation.
 *
 * @returns Logo URL, loading state, error, and refetch function
 *
 * @example
 * const { logoUrl, isLoading, error, refetch } = useFetchLogo()
 *
 * if (isLoading) return <Spinner />
 * if (error) return <Error message={error.message} />
 * return <img src={logoUrl} alt="App Logo" />
 */
export function useFetchLogo() {
  const { data, error, isLoading, mutate } = useSWR(
    LOGO_SWR_KEY,
    async () => {
      const response = await apiGetLogo()
      return response
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  )

  // Build full URL from the logo filename
  const logoUrl = data?.data?.appLogo ? buildLogoUrl(data.data.appLogo) : ""

  return {
    /** Full URL to the logo image */
    logoUrl,
    /** Raw logo filename from API */
    logoFilename: data?.data?.appLogo ?? null,
    /** Loading state */
    isLoading,
    /** Error object if fetch failed */
    error: error as Error | null,
    /** Refetch the logo */
    refetch: mutate,
    /** Raw API response */
    response: data,
  }
}

/**
 * Hook for logo update operations.
 * Handles file upload with FormData.
 *
 * @returns Update function, loading state, and error
 *
 * @example
 * const { updateLogo, isUpdating, error } = useUpdateLogo()
 *
 * const handleSubmit = async (file: File) => {
 *   try {
 *     await updateLogo(file)
 *     toast({ title: "Logo updated!" })
 *   } catch (err) {
 *     toast({ title: "Failed to update logo", variant: "destructive" })
 *   }
 * }
 */
export function useUpdateLogo() {
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { refetch } = useFetchLogo()

  const updateLogo = useCallback(
    async (file: File) => {
      setIsUpdating(true)
      setError(null)
      try {
        const result = await apiUpdateLogo(file)
        // Revalidate the logo cache after successful update
        await refetch()
        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to update logo")
        setError(error)
        throw error
      } finally {
        setIsUpdating(false)
      }
    },
    [refetch]
  )

  return {
    /** Function to update the logo with a file */
    updateLogo,
    /** Loading state while updating */
    isUpdating,
    /** Error object if update failed */
    error,
  }
}

// ============================================================
// Password Hook
// ============================================================

/**
 * Hook for password change operations.
 *
 * @returns Change password function, loading state, and error
 *
 * @example
 * const { changePassword, isChanging, error } = useChangePassword()
 *
 * const handleSubmit = async (data: ChangePasswordPayload) => {
 *   try {
 *     await changePassword(data)
 *     toast({ title: "Password changed!" })
 *   } catch (err) {
 *     toast({ title: "Failed to change password", variant: "destructive" })
 *   }
 * }
 */
export function useChangePassword() {
  const [isChanging, setIsChanging] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const changePassword = useCallback(async (payload: ChangePasswordPayload) => {
    setIsChanging(true)
    setError(null)
    try {
      const result = await apiChangePassword(payload)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to change password")
      setError(error)
      throw error
    } finally {
      setIsChanging(false)
    }
  }, [])

  return {
    /** Function to change the password */
    changePassword,
    /** Loading state while changing */
    isChanging,
    /** Error object if change failed */
    error,
  }
}

// ============================================================
// Legacy exports (kept for backward compatibility)
// ============================================================

import type {
  UpdateProfilePayload,
  UpdateLogoPayload,
  UpdatePasswordPayload,
} from "@/lib/types"
import {
  updateProfile as apiUpdateProfile,
  updateLogoLegacy as apiUpdateLogoLegacy,
  updatePassword as apiUpdatePassword,
} from "@/lib/api/settings"

/**
 * @deprecated Use useUpdateLogo instead
 */
export function useProfileUpdate() {
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const updateProfile = useCallback(async (payload: UpdateProfilePayload) => {
    setIsUpdating(true)
    setError(null)
    try {
      const result = await apiUpdateProfile(payload)
      return result
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to update profile"))
      throw err
    } finally {
      setIsUpdating(false)
    }
  }, [])

  return { updateProfile, isUpdating, error }
}

/**
 * @deprecated Use useUpdateLogo instead
 */
export function useLogoUpdate() {
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const updateLogo = useCallback(async (payload: UpdateLogoPayload) => {
    setIsUpdating(true)
    setError(null)
    try {
      const result = await apiUpdateLogoLegacy(payload)
      return result
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to update logo"))
      throw err
    } finally {
      setIsUpdating(false)
    }
  }, [])

  return { updateLogo, isUpdating, error }
}

/**
 * @deprecated Use useChangePassword instead
 */
export function usePasswordUpdate() {
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const updatePassword = useCallback(async (payload: UpdatePasswordPayload) => {
    setIsUpdating(true)
    setError(null)
    try {
      const result = await apiUpdatePassword(payload)
      return result
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to update password"))
      throw err
    } finally {
      setIsUpdating(false)
    }
  }, [])

  return { updatePassword, isUpdating, error }
}
