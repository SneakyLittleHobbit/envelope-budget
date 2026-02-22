'use client'

import * as React from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  variant?: 'default' | 'destructive'
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  variant = 'default',
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className={
              variant === 'destructive'
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : undefined
            }
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Hook for easier usage
export function useConfirmDialog() {
  const [open, setOpen] = React.useState(false)
  const [config, setConfig] = React.useState<{
    title: string
    description?: string
    confirmLabel?: string
    onConfirm: () => void
    variant?: 'default' | 'destructive'
  } | null>(null)

  const confirm = React.useCallback(
    (options: {
      title: string
      description?: string
      confirmLabel?: string
      onConfirm: () => void
      variant?: 'default' | 'destructive'
    }) => {
      setConfig(options)
      setOpen(true)
    },
    []
  )

  const handleConfirm = React.useCallback(() => {
    if (config?.onConfirm) {
      config.onConfirm()
    }
    setOpen(false)
  }, [config])

  const dialog = config ? (
    <ConfirmDialog
      open={open}
      onOpenChange={setOpen}
      title={config.title}
      description={config.description}
      confirmLabel={config.confirmLabel}
      onConfirm={handleConfirm}
      variant={config.variant}
    />
  ) : null

  return { confirm, dialog }
}
