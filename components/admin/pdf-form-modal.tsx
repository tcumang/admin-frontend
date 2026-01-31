"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Upload, 
  X, 
  ImageIcon, 
  FileText, 
  User, 
  Type, 
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { PDFFormData, ModalMode, FormErrors } from "@/lib/types"

interface PDFFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: PDFFormData) => void | Promise<void>
  initialData?: PDFFormData | null
  mode: ModalMode
  submitError?: string | null
}

const DEFAULT_FORM_DATA: PDFFormData = {
  author: "",
  documentTitle: "",
  coverImagePreview: "",
  coverImageFile: null,
  documentFile: null,
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_PDF_SIZE = 50 * 1024 * 1024 // 50MB

export function PDFFormModal({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode,
  submitError: externalSubmitError,
}: PDFFormModalProps) {
  const [formData, setFormData] = useState<PDFFormData>(DEFAULT_FORM_DATA)
  const [isDraggingImage, setIsDraggingImage] = useState(false)
  const [isDraggingPdf, setIsDraggingPdf] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<FormErrors<PDFFormData>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  
  const imageInputRef = useRef<HTMLInputElement>(null)
  const pdfInputRef = useRef<HTMLInputElement>(null)

  // Reset form when modal opens/closes or initial data changes
  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData(initialData)
      } else {
        setFormData(DEFAULT_FORM_DATA)
      }
      setErrors({})
      setSubmitError(null)
    }
  }, [open, initialData])

  // Update submit error from external prop
  useEffect(() => {
    setSubmitError(externalSubmitError || null)
  }, [externalSubmitError])

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors<PDFFormData> = {}
    
    if (!formData.author.trim()) {
      newErrors.author = "Author name is required"
    } else if (formData.author.trim().length < 2) {
      newErrors.author = "Author name must be at least 2 characters"
    }
    
    if (!formData.documentTitle.trim()) {
      newErrors.documentTitle = "Document title is required"
    } else if (formData.documentTitle.trim().length < 3) {
      newErrors.documentTitle = "Title must be at least 3 characters"
    }
    
    if (!formData.documentFile && mode === "add") {
      newErrors.documentFile = "PDF file is required for new documents"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData, mode])

  const processImageFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrors(prev => ({ ...prev, coverImageFile: "Please upload a valid image file" }))
      return
    }
    
    if (file.size > MAX_IMAGE_SIZE) {
      setErrors(prev => ({ ...prev, coverImageFile: "Image must be less than 5MB" }))
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      setFormData(prev => ({ 
        ...prev, 
        coverImagePreview: result,
        coverImageFile: file 
      }))
      setErrors(prev => ({ ...prev, coverImageFile: undefined }))
    }
    reader.onerror = () => {
      setErrors(prev => ({ ...prev, coverImageFile: "Failed to read image file" }))
    }
    reader.readAsDataURL(file)
  }, [])

  const processPdfFile = useCallback((file: File) => {
    if (file.type !== "application/pdf") {
      setErrors(prev => ({ ...prev, documentFile: "Please upload a valid PDF file" }))
      return
    }
    
    if (file.size > MAX_PDF_SIZE) {
      setErrors(prev => ({ ...prev, documentFile: "PDF must be less than 50MB" }))
      return
    }

    setFormData(prev => ({
      ...prev,
      documentFile: file,
    }))
    setErrors(prev => ({ ...prev, documentFile: undefined }))
  }, [])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processImageFile(file)
  }

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processPdfFile(file)
  }

  const handleDragOver = (e: React.DragEvent, type: "image" | "pdf") => {
    e.preventDefault()
    e.stopPropagation()
    if (type === "image") setIsDraggingImage(true)
    else setIsDraggingPdf(true)
  }

  const handleDragLeave = (e: React.DragEvent, type: "image" | "pdf") => {
    e.preventDefault()
    e.stopPropagation()
    if (type === "image") setIsDraggingImage(false)
    else setIsDraggingPdf(false)
  }

  const handleDrop = (e: React.DragEvent, type: "image" | "pdf") => {
    e.preventDefault()
    e.stopPropagation()
    
    if (type === "image") {
      setIsDraggingImage(false)
      const file = e.dataTransfer.files?.[0]
      if (file) processImageFile(file)
    } else {
      setIsDraggingPdf(false)
      const file = e.dataTransfer.files?.[0]
      if (file) processPdfFile(file)
    }
  }

  const removeImage = () => {
    setFormData(prev => ({ ...prev, coverImagePreview: "", coverImageFile: null }))
    if (imageInputRef.current) imageInputRef.current.value = ""
  }

  const removePdf = () => {
    setFormData(prev => ({ ...prev, documentFile: null }))
    if (pdfInputRef.current) pdfInputRef.current.value = ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    setSubmitError(null)
    try {
      await onSubmit(formData)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save PDF"
      setSubmitError(message)
      console.error("[v0] Form submit error:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateField = (field: keyof PDFFormData, value: string) => {
    if (field === "author" || field === "documentTitle") {
      setFormData(prev => ({ ...prev, [field]: value }))
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: undefined }))
      }
    }
  }

  const isEditMode = mode === "edit"
  const modalTitle = isEditMode ? "Edit PDF Document" : "Upload New PDF"
  const modalDescription = isEditMode 
    ? "Update the document details below. Leave file fields empty to keep existing files."
    : "Fill in the details to upload a new PDF document."
  const submitButtonText = isEditMode ? "Save Changes" : "Upload PDF"
  const submittingText = isEditMode ? "Saving..." : "Uploading..."

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[580px] max-h-[90vh] overflow-y-auto bg-card border-border/50 shadow-2xl p-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/50 bg-gradient-to-b from-secondary/30 to-transparent">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 ring-1 ring-accent/20">
              <FileText className="h-6 w-6 text-accent" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-xl font-semibold text-foreground">
                {modalTitle}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {modalDescription}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5">
          <div className="space-y-6">
            {/* Author Name Field */}
            <div className="space-y-2">
              <Label 
                htmlFor="author" 
                className="text-sm font-medium text-foreground flex items-center gap-2"
              >
                <User className="h-4 w-4 text-muted-foreground" />
                Author Name
                <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="author"
                  placeholder="Enter author name"
                  value={formData.author}
                  onChange={e => updateField("author", e.target.value)}
                  className={cn(
                    "h-11 bg-secondary/30 border-border/50 text-foreground",
                    "placeholder:text-muted-foreground/60",
                    "focus:bg-secondary/50 focus:border-accent/50 focus:ring-1 focus:ring-accent/20",
                    "transition-all duration-200 rounded-xl",
                    errors.author && "border-destructive/50 focus:border-destructive focus:ring-destructive/20"
                  )}
                />
                {formData.author && !errors.author && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-accent" />
                )}
              </div>
              {errors.author && (
                <p className="text-xs text-destructive flex items-center gap-1 mt-1.5">
                  <AlertCircle className="h-3 w-3" />
                  {errors.author}
                </p>
              )}
            </div>

            {/* Document Title Field */}
            <div className="space-y-2">
              <Label 
                htmlFor="documentTitle" 
                className="text-sm font-medium text-foreground flex items-center gap-2"
              >
                <Type className="h-4 w-4 text-muted-foreground" />
                Document Title
                <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="documentTitle"
                  placeholder="Enter document title"
                  value={formData.documentTitle}
                  onChange={e => updateField("documentTitle", e.target.value)}
                  className={cn(
                    "h-11 bg-secondary/30 border-border/50 text-foreground",
                    "placeholder:text-muted-foreground/60",
                    "focus:bg-secondary/50 focus:border-accent/50 focus:ring-1 focus:ring-accent/20",
                    "transition-all duration-200 rounded-xl",
                    errors.documentTitle && "border-destructive/50 focus:border-destructive focus:ring-destructive/20"
                  )}
                />
                {formData.documentTitle && !errors.documentTitle && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-accent" />
                )}
              </div>
              {errors.documentTitle && (
                <p className="text-xs text-destructive flex items-center gap-1 mt-1.5">
                  <AlertCircle className="h-3 w-3" />
                  {errors.documentTitle}
                </p>
              )}
            </div>

            {/* Image Upload Field */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                Cover Image
                <span className="text-xs text-muted-foreground/70 font-normal ml-1">(Optional)</span>
              </Label>
              <div
                className={cn(
                  "relative border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer",
                  isDraggingImage
                    ? "border-accent bg-accent/10 scale-[1.01]"
                    : "border-border/50 hover:border-muted-foreground/30 hover:bg-secondary/20",
                  formData.coverImagePreview ? "p-3" : "p-6"
                )}
                onDragOver={e => handleDragOver(e, "image")}
                onDragLeave={e => handleDragLeave(e, "image")}
                onDrop={e => handleDrop(e, "image")}
                onClick={() => !formData.coverImagePreview && imageInputRef.current?.click()}
              >
                {formData.coverImagePreview ? (
                  <div className="relative group rounded-lg overflow-hidden">
                    <img
                      src={formData.coverImagePreview || "/placeholder.svg"}
                      alt="Cover preview"
                      className="w-full h-44 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-background/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={e => {
                          e.stopPropagation()
                          imageInputRef.current?.click()
                        }}
                        className="rounded-lg shadow-lg"
                      >
                        Replace
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={e => {
                          e.stopPropagation()
                          removeImage()
                        }}
                        className="rounded-lg shadow-lg"
                      >
                        Remove
                      </Button>
                    </div>
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation()
                        removeImage()
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-background/90 hover:bg-destructive hover:text-destructive-foreground text-foreground transition-colors shadow-md"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove image</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center py-2">
                    <div className="p-3 rounded-full bg-secondary/50 mb-3 ring-1 ring-border/50">
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-foreground font-medium mb-1">
                      Drop your image here
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">
                      PNG, JPG, GIF up to 5MB
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={e => {
                        e.stopPropagation()
                        imageInputRef.current?.click()
                      }}
                      className="bg-transparent border-border/50 text-foreground hover:bg-secondary/50 hover:text-foreground focus-visible:bg-secondary/50 focus-visible:text-foreground rounded-lg"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Browse Files
                    </Button>
                  </div>
                )}
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
              {errors.coverImageFile && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.coverImageFile}
                </p>
              )}
            </div>

            {/* PDF Upload Field */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                PDF Document
                <span className="text-destructive">*</span>
              </Label>
              <div
                className={cn(
                  "relative border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer",
                  isDraggingPdf
                    ? "border-accent bg-accent/10 scale-[1.01]"
                    : "border-border/50 hover:border-muted-foreground/30 hover:bg-secondary/20",
                  errors.documentFile && !isDraggingPdf && "border-destructive/50",
                  formData.documentFile ? "p-4" : "p-6"
                )}
                onDragOver={e => handleDragOver(e, "pdf")}
                onDragLeave={e => handleDragLeave(e, "pdf")}
                onDrop={e => handleDrop(e, "pdf")}
                onClick={() => !formData.documentFile && pdfInputRef.current?.click()}
              >
                {formData.documentFile ? (
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-500/20 to-red-500/5 ring-1 ring-red-500/20">
                      <FileText className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {formData.documentFile.name}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <CheckCircle2 className="h-3 w-3 text-accent" />
                        PDF Document Ready
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={e => {
                        e.stopPropagation()
                        removePdf()
                      }}
                      className="shrink-0 h-9 w-9 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove PDF</span>
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center py-2">
                    <div className="p-3 rounded-full bg-red-500/10 mb-3 ring-1 ring-red-500/20">
                      <FileText className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <p className="text-sm text-foreground font-medium mb-1">
                      Drop your PDF here
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">
                      PDF files up to 50MB
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={e => {
                        e.stopPropagation()
                        pdfInputRef.current?.click()
                      }}
                      className="bg-transparent border-border/50 text-foreground hover:bg-secondary/50 hover:text-foreground focus-visible:bg-secondary/50 focus-visible:text-foreground rounded-lg"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Browse Files
                    </Button>
                  </div>
                )}
                <input
                  ref={pdfInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handlePdfChange}
                  className="hidden"
                />
              </div>
              {errors.documentFile && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.documentFile}
                </p>
              )}
            </div>
          </div>

          {/* Submit Error Display */}
          {submitError && (
            <div className="mt-6 p-3 bg-destructive/10 border border-destructive/50 rounded-xl flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{submitError}</p>
            </div>
          )}

          {/* Footer */}
          <DialogFooter className="gap-3 pt-6 mt-6 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none bg-transparent border-border/50 text-foreground hover:bg-secondary/50 hover:text-foreground focus-visible:bg-secondary/50 focus-visible:text-foreground rounded-xl h-11"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 sm:flex-none min-w-[140px] bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl h-11 shadow-lg shadow-accent/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {submittingText}
                </>
              ) : (
                submitButtonText
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
