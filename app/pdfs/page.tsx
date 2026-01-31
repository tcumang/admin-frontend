"use client"

import { useEffect, useState } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { PageHeader } from "@/components/admin/page-header"
import { ImagePreviewModal } from "@/components/admin/image-preview-modal"
import { PDFFormModal } from "@/components/admin/pdf-form-modal"
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import { Plus, Pencil, Trash2, Download, FileText, Eye, Search, AlertCircle } from "lucide-react"
import { useFetchPdfs, useCreatePdf, useUpdatePdf, useDeletePdf, useDownloadPdf } from "@/hooks/use-pdfs"
import { pdfItemToFormData, buildPdfCoverImageUrl } from "@/lib/api/pdfs"
import type { PDFItem, PDFFormData, ImagePreviewState, ModalMode, PDFPayload } from "@/lib/types"

export default function PDFsPage() {
  // Fetch PDFs list
  const { pdfs, isLoading, error, refresh } = useFetchPdfs({ page: 1, limit: 50 })

  // Mutations
  const { createPdf: apiCreatePdf } = useCreatePdf()
  const { updatePdf: apiUpdatePdf } = useUpdatePdf()
  const { deletePdf: apiDeletePdf, isDeleting } = useDeletePdf()
  const { downloadPdf } = useDownloadPdf()

  // UI state
  const [isBooting, setIsBooting] = useState(true)
  const [imagePreview, setImagePreview] = useState<ImagePreviewState>({
    open: false,
    url: "",
    title: "",
  })
  const [formModal, setFormModal] = useState<{
    open: boolean
    mode: ModalMode
    data: PDFFormData | null
  }>({
    open: false,
    mode: "add",
    data: null,
  })
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean
    pdfId: number | null
    pdfTitle: string
  }>({
    open: false,
    pdfId: null,
    pdfTitle: "",
  })

  const [searchQuery, setSearchQuery] = useState("")
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleAddPdf = () => {
    setFormModal({ open: true, mode: "add", data: null })
    setSubmitError(null)
  }

  const handleEditPdf = (pdf: PDFItem) => {
    setFormModal({
      open: true,
      mode: "edit",
      data: pdfItemToFormData(pdf),
    })
    setSubmitError(null)
  }

  const handleFormSubmit = async (data: PDFFormData) => {
    setSubmitError(null)
    try {
      const payload: PDFPayload = {
        author: data.author,
        documentTitle: data.documentTitle,
      }

      // Add files if they exist
      if (data.coverImageFile) {
        payload.coverImage = data.coverImageFile
      }
      if (data.documentFile) {
        payload.document = data.documentFile
      }

      if (formModal.mode === "add") {
        await apiCreatePdf(payload)
      } else if (formModal.mode === "edit" && data.id) {
        await apiUpdatePdf(data.id, payload)
      }

      setFormModal({ open: false, mode: "add", data: null })
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save PDF"
      setSubmitError(message)
      console.error("[v0] PDF save error:", err)
    }
  }

  const handleDeleteClick = (pdf: PDFItem) => {
    setDeleteConfirm({
      open: true,
      pdfId: pdf.id,
      pdfTitle: pdf.documentTitle,
    })
  }

  const handleDeleteConfirm = async () => {
    if (deleteConfirm.pdfId) {
      try {
        await apiDeletePdf(deleteConfirm.pdfId)
        setDeleteConfirm({ open: false, pdfId: null, pdfTitle: "" })
      } catch (err) {
        console.error("[v0] Delete error:", err)
      }
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const filteredPdfs = pdfs.filter((pdf) => {
    const query = searchQuery.toLowerCase().trim()
    if (!query) return true

    return (
      pdf.author.toLowerCase().includes(query) ||
      pdf.documentTitle.toLowerCase().includes(query) ||
      pdf.fileName.toLowerCase().includes(query)
    )
  })

  useEffect(() => {
    const t = setTimeout(() => setIsBooting(false), 450)
    return () => clearTimeout(t)
  }, [])

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          title="PDF Documents"
          description="Manage your PDF documents and files"
        >
          <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="pl-9 bg-secondary/40 border-border rounded-xl"
              />
            </div>
            <Button
              onClick={handleAddPdf}
              className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/20 rounded-xl"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add PDF
            </Button>
          </div>
        </PageHeader>

        {error && (
          <Card className="bg-destructive/10 border-destructive/50">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-destructive">Failed to load PDFs</p>
                <p className="text-xs text-destructive/70 mt-1">
                  {error.message || "An error occurred while fetching the documents"}
                </p>
              </div>
              <Button
                onClick={refresh}
                variant="outline"
                size="sm"
                className="ml-auto bg-destructive/10 border-destructive/50 text-destructive hover:bg-destructive/20"
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="bg-card border-border overflow-hidden">
          <CardHeader className="border-b border-border bg-secondary/30">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-accent" />
                All Documents
              </CardTitle>
              <span className="text-sm text-muted-foreground">
                Showing {filteredPdfs.length} of {pdfs.length} documents
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isBooting || isLoading ? (
              <div className="p-5 space-y-4">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 rounded-xl border border-border/60 bg-secondary/10 p-3"
                  >
                    <Skeleton className="h-7 w-7 rounded-lg bg-muted/60" />
                    <div className="flex-1 min-w-0 space-y-2">
                      <Skeleton className="h-4 w-1/2 bg-muted/60" />
                      <Skeleton className="h-3 w-1/3 bg-muted/60" />
                    </div>
                    <Skeleton className="h-12 w-16 rounded-lg bg-muted/60" />
                    <Skeleton className="h-7 w-28 rounded-md bg-muted/60" />
                    <Skeleton className="h-8 w-20 rounded-lg bg-muted/60" />
                  </div>
                ))}
              </div>
            ) : pdfs.length === 0 ? (
              <div className="p-6">
                <Empty className="border-border bg-secondary/10">
                  <EmptyHeader>
                    <EmptyMedia variant="icon" className="bg-secondary">
                      <FileText />
                    </EmptyMedia>
                    <EmptyTitle>No documents yet</EmptyTitle>
                    <EmptyDescription>
                      Upload your first PDF to start building your document library.
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button
                      type="button"
                      onClick={handleAddPdf}
                      className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/20 rounded-xl w-full"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add PDF
                    </Button>
                  </EmptyContent>
                </Empty>
              </div>
            ) : (
              <div className="max-h-[70vh] overflow-auto">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-secondary/60 backdrop-blur supports-[backdrop-filter]:bg-secondary/40">
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground font-semibold w-[60px] text-center">
                        #
                      </TableHead>
                      <TableHead className="text-muted-foreground font-semibold min-w-[190px]">
                        Author
                      </TableHead>
                      <TableHead className="text-muted-foreground font-semibold w-[100px]">
                        Cover
                      </TableHead>
                      <TableHead className="text-muted-foreground font-semibold min-w-[260px]">
                        Document Title
                      </TableHead>
                      <TableHead className="text-muted-foreground font-semibold w-[160px]">
                        File
                      </TableHead>
                      <TableHead className="text-muted-foreground font-semibold w-[130px] text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPdfs.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="py-10 text-center text-sm text-muted-foreground"
                        >
                          No documents match your search.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPdfs.map((pdf, index) => (
                        <TableRow
                          key={pdf.id}
                          className="border-border group hover:bg-secondary/40 transition-colors"
                        >
                          <TableCell className="text-center">
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-secondary text-xs font-medium text-muted-foreground ring-1 ring-border">
                              {index + 1}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-accent/30 to-accent/10 text-accent text-sm font-semibold ring-2 ring-accent/20">
                                {getInitials(pdf.author)}
                              </div>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="font-medium text-foreground max-w-[200px] truncate">
                                    {pdf.author}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="bg-popover border border-border text-foreground">
                                  {pdf.author}
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setImagePreview({
                                      open: true,
                                      url: buildPdfCoverImageUrl(pdf.coverImage),
                                      title: pdf.documentTitle,
                                    })
                                  }
                                  className="group/img relative overflow-hidden rounded-lg border border-border hover:border-accent/50 transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                  aria-label={`Preview cover for ${pdf.documentTitle}`}
                                >
                                  <img
                                    src={buildPdfCoverImageUrl(pdf.coverImage) || "/placeholder.svg"}
                                    alt={pdf.documentTitle}
                                    className="h-12 w-16 object-cover transition-transform group-hover/img:scale-110"
                                    crossOrigin="anonymous"
                                  />
                                  <div className="absolute inset-0 bg-accent/0 group-hover/img:bg-accent/30 transition-colors flex items-center justify-center">
                                    <Eye className="h-4 w-4 text-white opacity-0 group-hover/img:opacity-100 transition-opacity" />
                                  </div>
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="bg-popover border border-border text-foreground">
                                Preview cover
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-2 max-w-[260px]">
                                  <div className="p-1.5 rounded-lg bg-red-500/10">
                                    <FileText className="h-4 w-4 text-red-600 dark:text-red-400" />
                                  </div>
                                  <span className="font-medium text-foreground truncate">
                                    {pdf.documentTitle}
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-sm bg-popover border border-border text-foreground">
                                {pdf.documentTitle}
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => downloadPdf(pdf.id, pdf.fileName)}
                                  className="bg-transparent border-border text-muted-foreground hover:text-accent hover:border-accent/50 hover:bg-accent/10 gap-2 rounded-lg"
                                >
                                  <Download className="h-4 w-4" />
                                  <span className="hidden sm:inline">
                                    Download
                                  </span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                Download {pdf.fileName}
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEditPdf(pdf)}
                                    className="h-8 w-8 text-muted-foreground hover:text-accent hover:bg-accent/10 rounded-lg"
                                  >
                                    <Pencil className="h-4 w-4" />
                                    <span className="sr-only">
                                      Edit {pdf.documentTitle}
                                    </span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  Edit
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteClick(pdf)}
                                    disabled={isDeleting}
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg disabled:opacity-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">
                                      Delete {pdf.documentTitle}
                                    </span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  Delete
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Image Preview Modal */}
        <ImagePreviewModal
          preview={imagePreview}
          onClose={() => setImagePreview((prev) => ({ ...prev, open: false }))}
        />

        {/* PDF Form Modal */}
        <PDFFormModal
          open={formModal.open}
          onOpenChange={(open) => setFormModal((prev) => ({ ...prev, open }))}
          onSubmit={handleFormSubmit}
          initialData={formModal.data}
          mode={formModal.mode}
          submitError={submitError}
        />

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          open={deleteConfirm.open}
          onOpenChange={(open) =>
            setDeleteConfirm((prev) => ({ ...prev, open }))
          }
          title="Delete Document"
          description={`Are you sure you want to delete "${deleteConfirm.pdfTitle}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          isDangerous
          onConfirm={handleDeleteConfirm}
        />
      </div>
    </AdminLayout>
  )
}
