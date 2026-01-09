"use client"

import { Modal } from "./Modal"
import { Button } from "./Button"
import { AlertTriangle, Info } from "lucide-react"

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => void | Promise<void>
  onCancel: () => void
  variant?: "danger" | "neutral" | "warning"
  confirmText?: string
  cancelText?: string
  loading?: boolean
}

const variantConfig = {
  danger: {
    icon: AlertTriangle,
    iconClassName: "text-error",
    confirmVariant: "primary" as const,
  },
  warning: {
    icon: AlertTriangle,
    iconClassName: "text-warning",
    confirmVariant: "primary" as const,
  },
  neutral: {
    icon: Info,
    iconClassName: "text-info",
    confirmVariant: "primary" as const,
  },
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  variant = "neutral",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  loading = false,
}: ConfirmModalProps) {
  const config = variantConfig[variant]
  const Icon = config.icon

  const handleConfirm = async () => {
    await onConfirm()
  }

  return (
    <Modal open={isOpen} onClose={onCancel} title={title} size="sm">
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <Icon className={`w-5 h-5 ${config.iconClassName}`} />
          </div>
          <p className="text-body leading-normal text-gray-700">{message}</p>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={config.confirmVariant}
            size="sm"
            onClick={handleConfirm}
            loading={loading}
            disabled={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
