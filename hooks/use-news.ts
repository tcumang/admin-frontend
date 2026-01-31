/**
 * News data fetching and mutation hooks.
 *
 * Provides hooks for all News CRUD operations with proper
 * loading, error, and success states using SWR.
 *
 * @example
 * // Fetch news list
 * const { news, pagination, isLoading, error, refresh } = useFetchNews({ page: 1, search: "tech" })
 *
 * // Fetch single news
 * const { newsItem, isLoading } = useFetchSingleNews(1)
 *
 * // Create news
 * const { createNews, isCreating, createError } = useCreateNews()
 *
 * // Update news
 * const { updateNews, isUpdating, updateError } = useUpdateNews()
 *
 * // Delete news
 * const { deleteNews, isDeleting, deleteError } = useDeleteNews()
 */

import { useState, useCallback } from "react"
import useSWR, { mutate as globalMutate } from "swr"
import type {
  NewsItem,
  NewsListResponse,
  SingleNewsResponse,
  NewsPayload,
  NewsListParams,
  NewsPagination,
} from "@/lib/types"
import {
  getNewsList,
  getNewsById,
  createNews as apiCreateNews,
  updateNews as apiUpdateNews,
  deleteNews as apiDeleteNews,
} from "@/lib/api/news"

/**
 * Generate SWR cache key for news list with params.
 */
function getNewsListKey(params?: NewsListParams): string {
  const parts = ["news-list"]
  if (params?.page) parts.push(`page=${params.page}`)
  if (params?.limit) parts.push(`limit=${params.limit}`)
  if (params?.search) parts.push(`search=${params.search}`)
  return parts.join("-")
}

/**
 * Hook to fetch news list with pagination and search.
 * Calls GET /news/admin endpoint.
 *
 * @param params - Query parameters (page, limit, search)
 * @returns News list with loading and error states
 */
export function useFetchNews(params?: NewsListParams) {
  const cacheKey = getNewsListKey(params)

  const { data, error, isLoading, mutate } = useSWR<NewsListResponse>(
    cacheKey,
    () => getNewsList(params),
    {
      // Revalidate on focus for fresh data
      revalidateOnFocus: true,
      // Keep previous data while fetching new
      keepPreviousData: true,
    }
  )

  return {
    // Extract news array from nested response
    news: data?.data?.data ?? [],
    // Extract pagination info
    pagination: data?.data?.pagination ?? null,
    // Loading state
    isLoading,
    // Error state
    error: error as Error | undefined,
    // Refresh function to refetch data
    refresh: mutate,
    // Raw response for additional data
    response: data,
  }
}

/**
 * Hook to fetch a single news item by ID.
 * Calls GET /news/:id endpoint.
 * Used for edit modal to prefill form data.
 *
 * @param id - The news item ID (null to skip fetching)
 * @returns Single news item with loading and error states
 */
export function useFetchSingleNews(id: number | string | null) {
  const cacheKey = id ? `news-single-${id}` : null

  const { data, error, isLoading, mutate } = useSWR<SingleNewsResponse>(
    cacheKey,
    () => (id ? getNewsById(id) : Promise.reject("No ID provided")),
    {
      // Don't revalidate on focus for modal data
      revalidateOnFocus: false,
    }
  )

  return {
    // Extract news item from response
    newsItem: data?.data ?? null,
    // Loading state
    isLoading,
    // Error state
    error: error as Error | undefined,
    // Refresh function
    refresh: mutate,
    // Raw response
    response: data,
  }
}

/**
 * Hook for creating a new news item.
 * Calls POST /news endpoint.
 *
 * @returns Create function with loading and error states
 */
export function useCreateNews() {
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<Error | null>(null)

  /**
   * Create a new news item.
   * Invalidates the news list cache on success.
   *
   * @param payload - The news data to create
   * @returns The created news item
   */
  const createNews = useCallback(async (payload: NewsPayload): Promise<NewsItem | null> => {
    setIsCreating(true)
    setCreateError(null)

    try {
      const response = await apiCreateNews(payload)

      // Invalidate all news list caches to refresh data
      // This matches any key starting with "news-list"
      await globalMutate(
        (key) => typeof key === "string" && key.startsWith("news-list"),
        undefined,
        { revalidate: true }
      )

      return response.data
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to create news")
      setCreateError(error)
      throw error
    } finally {
      setIsCreating(false)
    }
  }, [])

  return {
    createNews,
    isCreating,
    createError,
    // Reset error state
    resetCreateError: useCallback(() => setCreateError(null), []),
  }
}

/**
 * Hook for updating an existing news item.
 * Calls PUT /news/:id endpoint.
 *
 * @returns Update function with loading and error states
 */
export function useUpdateNews() {
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateError, setUpdateError] = useState<Error | null>(null)

  /**
   * Update an existing news item.
   * Invalidates both the list cache and single item cache on success.
   *
   * @param id - The news item ID to update
   * @param payload - The news data to update
   * @returns The updated news item
   */
  const updateNews = useCallback(
    async (id: number | string, payload: NewsPayload): Promise<NewsItem | null> => {
      setIsUpdating(true)
      setUpdateError(null)

      try {
        const response = await apiUpdateNews(id, payload)

        // Invalidate the single item cache
        await globalMutate(`news-single-${id}`, undefined, { revalidate: true })

        // Invalidate all news list caches to refresh data
        await globalMutate(
          (key) => typeof key === "string" && key.startsWith("news-list"),
          undefined,
          { revalidate: true }
        )

        return response.data
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to update news")
        setUpdateError(error)
        throw error
      } finally {
        setIsUpdating(false)
      }
    },
    []
  )

  return {
    updateNews,
    isUpdating,
    updateError,
    // Reset error state
    resetUpdateError: useCallback(() => setUpdateError(null), []),
  }
}

/**
 * Hook for deleting a news item.
 * Calls DELETE /news/:id endpoint.
 *
 * @returns Delete function with loading and error states
 */
export function useDeleteNews() {
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<Error | null>(null)

  /**
   * Delete a news item.
   * Removes from cache and invalidates the list on success.
   *
   * @param id - The news item ID to delete
   * @returns Success boolean
   */
  const deleteNews = useCallback(async (id: number | string): Promise<boolean> => {
    setIsDeleting(true)
    setDeleteError(null)

    try {
      await apiDeleteNews(id)

      // Remove the single item from cache
      await globalMutate(`news-single-${id}`, undefined, { revalidate: false })

      // Invalidate all news list caches to refresh data
      await globalMutate(
        (key) => typeof key === "string" && key.startsWith("news-list"),
        undefined,
        { revalidate: true }
      )

      return true
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to delete news")
      setDeleteError(error)
      throw error
    } finally {
      setIsDeleting(false)
    }
  }, [])

  return {
    deleteNews,
    isDeleting,
    deleteError,
    // Reset error state
    resetDeleteError: useCallback(() => setDeleteError(null), []),
  }
}

// Re-export types for convenience
export type { NewsItem, NewsPagination, NewsPayload, NewsListParams }
