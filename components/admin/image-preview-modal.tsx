"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { X } from "lucide-react"
import type { ImagePreviewState } from "@/lib/types"

interface ImagePreviewModalProps {
  preview: ImagePreviewState
  onClose: () => void
}

export function ImagePreviewModal({ preview, onClose }: ImagePreviewModalProps) {
  return (
    <Dialog open={preview.open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] bg-card border-border p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="text-foreground pr-8 text-balance">
            {preview.title}
          </DialogTitle>
        </DialogHeader>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 opacity-70 ring-offset-background transition-all hover:opacity-100 hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        <div className="p-4 pt-2">
          <div className="relative overflow-hidden rounded-lg border border-border bg-secondary/30">
            <img
              src={preview.url || "/placeholder.svg"}
              alt={preview.title}
              className="w-full h-auto max-h-[400px] object-contain"
              crossOrigin="anonymous"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
