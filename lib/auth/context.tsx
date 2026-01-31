"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import type { Admin, LoginPayload, LoginOptions, AuthContextType } from "@/lib/types"
import { getToken, hasToken, removeToken, getStoredUser, setStoredUser } from "./token"
import { login as apiLogin, logout as apiLogout } from "@/lib/api/auth"
import { ApiError } from "@/lib/api/client"
import { DEFAULT_REDIRECT_AFTER_LOGIN } from "./config"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Authentication Provider Component.
 * Manages authentication state and provides auth methods to the app.
 *
 * Features:
 * - Persists user session across page refreshes
 * - Syncs token to cookie for middleware auth
 * - Handles login/logout with proper redirects
 * - Prepared for future refresh token support
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Admin | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  /**
   * Check authentication status.
   * Validates token existence and restores user from storage.
   */
  const checkAuth = useCallback(() => {
    const token = getToken()
    if (!token) {
      setUser(null)
      setIsLoading(false)
      return
    }
    // Restore user from localStorage if token exists
    const storedUser = getStoredUser()
    setUser(storedUser)
    setIsLoading(false)
  }, [])

  // Initialize auth state on mount
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  /**
   * Login handler.
   * Authenticates user and redirects on success.
   */
  const login = useCallback(
    async (payload: LoginPayload, options?: LoginOptions) => {
      const response = await apiLogin(payload, { remember: options?.remember })

      // Validate response structure
      if (!response?.success || !response?.data?.token || !response?.data?.admin) {
        const msg =
          response?.data && typeof response.data === "object" && "message" in response.data
            ? String((response.data as { message?: string }).message)
            : "Login failed. Please try again."
        throw new ApiError(msg, 400, response)
      }

      // Store user in state and localStorage
      const admin = response.data.admin
      setUser(admin)
      setStoredUser(admin)

      // Determine redirect destination
      const redirectTo =
        options?.redirectTo && options.redirectTo.startsWith("/")
          ? options.redirectTo
          : DEFAULT_REDIRECT_AFTER_LOGIN

      router.replace(redirectTo)
    },
    [router]
  )

  /**
   * Logout handler.
   * Clears auth state and redirects to login.
   */
  const logout = useCallback(async () => {
    try {
      await apiLogout()
    } catch {
      // Clear local state even if API fails (e.g., 401 expired token)
    } finally {
      removeToken()
      setUser(null)
      setStoredUser(null)
      router.replace("/login")
    }
  }, [router])

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isLoading,
      isAuthenticated: hasToken(),
      login,
      logout,
      checkAuth,
    }),
    [user, isLoading, login, logout, checkAuth]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Hook to access authentication context.
 * Must be used within an AuthProvider.
 *
 * @example
 * const { user, login, logout, isAuthenticated } = useAuth()
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Re-export for convenience
export { AuthContext }
