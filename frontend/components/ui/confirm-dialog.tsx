"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  confirmLabel?: string
  /** Pass undefined to hide the cancel button */
  cancelLabel?: string | null
  variant?: "default" | "destructive"
  onConfirm: () => void
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title = "确认操作",
  description,
  confirmLabel = "确认",
  cancelLabel = "取消",
  variant = "destructive",
  onConfirm,
}: Props) {
  function handleConfirm() {
    onConfirm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DialogFooter>
          {cancelLabel !== null && (
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              {cancelLabel ?? "取消"}
            </Button>
          )}
          <Button variant={variant} onClick={handleConfirm}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
