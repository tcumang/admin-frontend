/**
 * PDF data fetching and mutation hooks.
 *
 * Provides hooks for all PDF CRUD operations with proper
 * loading, error, and success states using SWR.
 *
 * @example
 * // Fetch PDF list
 * const { pdfs, pagination, isLoading, error, refresh } = useFetchPdfs({ page: 1, search: "tech" })
 *
 * // Fetch single PDF
 * const { pdfItem, isLoading } = useFetchSinglePdf(1)
 *
 * // Create PDF
 * const { createPdf, isCreating, createError } = useCreatePdf()
 *
 * // Update PDF
 * const { updatePdf, isUpdating, updateError } = useUpdatePdf()
 *
 * // Delete PDF
 * const { deletePdf, isDeleting, deleteError } = useDeletePdf()
 *
 * // Update status
 * const { updateStatus, isUpdating, statusError } = useUpdatePdfStatus()
 *
 * // Download PDF
 * const { downloadPdf, isDownloading, downloadError } = useDownloadPdf()
 */

import { useState, useCallback } from "react"
import useSWR, { mutate as globalMutate } from "swr"
import type {
  PDFItem,
  PDFListResponse,
  SinglePDFResponse,
  PDFPayload,
  PDFListParams,
  PDFPagination,
} from "@/lib/types"
import {
  getPdfList,
  getPdfById,
  createPdf as apiCreatePdf,
  updatePdf as apiUpdatePdf,
  deletePdf as apiDeletePdf,
  updatePdfStatus as apiUpdatePdfStatus,
  downloadPdf as apiDownloadPdf,
} from "@/lib/api/pdfs"

/**
 * Generate SWR cache key for PDF list with params.
 */
function getPdfListKey(params?: PDFListParams): string {
  const parts = ["pdf-list"]
  if (params?.page) parts.push(`page=${params.page}`)
  if (params?.limit) parts.push(`limit=${params.limit}`)
  if (params?.search) parts.push(`search=${params.search}`)
  return parts.join("-")
}

/**
 * Hook to fetch PDF list with pagination and search.
 * Calls GET /pdf endpoint.
 *
 * @param params - Query parameters (page, limit, search)
 * @returns PDF list with loading and error states
 */
export function useFetchPdfs(params?: PDFListParams) {
  const cacheKey = getPdfListKey(params)

  const { data, error, isLoading, mutate } = useSWR<PDFListResponse>(
    cacheKey,
    () => getPdfList(params),
    {
      // Revalidate on focus for fresh data
      revalidateOnFocus: true,
      // Keep previous data while fetching new
      keepPreviousData: true,
    }
  )

  return {
    // Extract PDF array from nested response
    pdfs: data?.data?.data ?? [],
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
 * Hook to fetch a single PDF item by ID.
 * Calls GET /pdf/:id endpoint.
 * Used for edit modal to prefill form data.
 *
 * @param id - The PDF item ID (null to skip fetching)
 * @returns Single PDF item with loading and error states
 */
export function useFetchSinglePdf(id: number | string | null) {
  const cacheKey = id ? `pdf-single-${id}` : null

  const { data, error, isLoading, mutate } = useSWR<SinglePDFResponse>(
    cacheKey,
    () => (id ? getPdfById(id) : Promise.reject("No ID provided")),
    {
      // Don't revalidate on focus for modal data
      revalidateOnFocus: false,
    }
  )

  return {
    // Extract PDF item from response
    pdfItem: data?.data ?? null,
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
 * Hook for creating a new PDF item.
 * Calls POST /pdf endpoint.
 *
 * @returns Create function with loading and error states
 */
export function useCreatePdf() {
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<Error | null>(null)

  /**
   * Create a new PDF item.
   * Invalidates the PDF list cache on success.
   *
   * @param payload - The PDF data to create
   * @returns The created PDF item
   */
  const createPdf = useCallback(async (payload: PDFPayload): Promise<PDFItem | null> => {
    setIsCreating(true)
    setCreateError(null)

    try {
      const response = await apiCreatePdf(payload)

      // Invalidate all PDF list caches to refresh data
      // This matches any key starting with "pdf-list"
      await globalMutate(
        (key) => typeof key === "string" && key.startsWith("pdf-list"),
        undefined,
        { revalidate: true }
      )

      return response.data
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to create PDF")
      setCreateError(error)
      throw error
    } finally {
      setIsCreating(false)
    }
  }, [])

  return {
    createPdf,
    isCreating,
    createError,
    // Reset error state
    resetCreateError: useCallback(() => setCreateError(null), []),
  }
}

/**
 * Hook for updating an existing PDF item.
 * Calls PUT /pdf/:id endpoint.
 *
 * @returns Update function with loading and error states
 */
export function useUpdatePdf() {
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateError, setUpdateError] = useState<Error | null>(null)

  /**
   * Update an existing PDF item.
   * Invalidates both the list cache and single item cache on success.
   *
   * @param id - The PDF item ID to update
   * @param payload - The PDF data to update
   * @returns The updated PDF item
   */
  const updatePdf = useCallback(
    async (id: number | string, payload: PDFPayload): Promise<PDFItem | null> => {
      setIsUpdating(true)
      setUpdateError(null)

      try {
        const response = await apiUpdatePdf(id, payload)

        // Invalidate the single item cache
        await globalMutate(`pdf-single-${id}`, undefined, { revalidate: true })

        // Invalidate all PDF list caches to refresh data
        await globalMutate(
          (key) => typeof key === "string" && key.startsWith("pdf-list"),
          undefined,
          { revalidate: true }
        )

        return response.data
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to update PDF")
        setUpdateError(error)
        throw error
      } finally {
        setIsUpdating(false)
      }
    },
    []
  )

  return {
    updatePdf,
    isUpdating,
    updateError,
    // Reset error state
    resetUpdateError: useCallback(() => setUpdateError(null), []),
  }
}

/**
 * Hook for deleting a PDF item.
 * Calls DELETE /pdf/:id endpoint.
 *
 * @returns Delete function with loading and error states
 */
export function useDeletePdf() {
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<Error | null>(null)

  /**
   * Delete a PDF item.
   * Removes from cache and invalidates the list on success.
   *
   * @param id - The PDF item ID to delete
   * @returns Success boolean
   */
  const deletePdf = useCallback(async (id: number | string): Promise<boolean> => {
    setIsDeleting(true)
    setDeleteError(null)

    try {
      await apiDeletePdf(id)

      // Remove the single item from cache
      await globalMutate(`pdf-single-${id}`, undefined, { revalidate: false })

      // Invalidate all PDF list caches to refresh data
      await globalMutate(
        (key) => typeof key === "string" && key.startsWith("pdf-list"),
        undefined,
        { revalidate: true }
      )

      return true
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to delete PDF")
      setDeleteError(error)
      throw error
    } finally {
      setIsDeleting(false)
    }
  }, [])

  return {
    deletePdf,
    isDeleting,
    deleteError,
    // Reset error state
    resetDeleteError: useCallback(() => setDeleteError(null), []),
  }
}

/**
 * Hook for updating PDF status (active/inactive).
 * Calls PATCH /pdf/:id/status endpoint.
 *
 * @returns Update function with loading and error states
 */
export function useUpdatePdfStatus() {
  const [isUpdating, setIsUpdating] = useState(false)
  const [statusError, setStatusError] = useState<Error | null>(null)

  /**
   * Update PDF status.
   * Invalidates list cache on success for instant UI update.
   *
   * @param id - The PDF item ID
   * @param status - The new status (true for ACTIVE, false for INACTIVE)
   * @returns Success boolean
   */
  const updateStatus = useCallback(
    async (id: number | string, status: boolean): Promise<boolean> => {
      setIsUpdating(true)
      setStatusError(null)

      try {
        await apiUpdatePdfStatus(id, status)

        // Invalidate all PDF list caches to refresh data
        await globalMutate(
          (key) => typeof key === "string" && key.startsWith("pdf-list"),
          undefined,
          { revalidate: true }
        )

        return true
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to update PDF status")
        setStatusError(error)
        throw error
      } finally {
        setIsUpdating(false)
      }
    },
    []
  )

  return {
    updateStatus,
    isUpdating,
    statusError,
    // Reset error state
    resetStatusError: useCallback(() => setStatusError(null), []),
  }
}

/**
 * Hook for downloading PDF files.
 * Calls GET /pdf/:id/download endpoint.
 *
 * @returns Download function with loading and error states
 */
export function useDownloadPdf() {
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<Error | null>(null)

  /**
   * Download a PDF file.
   * Triggers browser download automatically.
   *
   * @param id - The PDF item ID to download
   * @param fileName - The file name for the download (optional)
   * @returns Success boolean
   */
  const downloadPdf = useCallback(async (id: number | string, fileName?: string): Promise<boolean> => {
    setIsDownloading(true)
    setDownloadError(null)

    try {
      const blob = await apiDownloadPdf(id)

      // Create blob URL and trigger download
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = fileName ?? `document-${id}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      return true
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to download PDF")
      setDownloadError(error)
      throw error
    } finally {
      setIsDownloading(false)
    }
  }, [])

  return {
    downloadPdf,
    isDownloading,
    downloadError,
    // Reset error state
    resetDownloadError: useCallback(() => setDownloadError(null), []),
  }
}

// Re-export types for convenience
export type { PDFItem, PDFPagination, PDFPayload, PDFListParams }
