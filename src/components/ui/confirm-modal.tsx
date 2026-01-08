"use client"

import { useEffect } from "react"
import { cn } from "@/lib/utils"
import { X, AlertTriangle, Info } from "lucide-react"
import { Button } from "./button"

interface ConfirmModalProps {
    open: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    message: string
    variant?: "danger" | "warning" | "neutral"
    confirmLabel?: string
    cancelLabel?: string
    loading?: boolean
}

const variantConfig = {
    danger: {
        icon: AlertTriangle,
        iconBg: "bg-[#F9ECEE]",
        iconColor: "text-[#D4848C]",
        buttonVariant: "primary" as const,
        buttonClass: "bg-[#D4848C] hover:bg-[#C47880] text-white",
    },
    warning: {
        icon: AlertTriangle,
        iconBg: "bg-[#FBF6EC]",
        iconColor: "text-[#E5C07B]",
        buttonVariant: "primary" as const,
        buttonClass: "bg-[#E5C07B] hover:bg-[#D4AF6A] text-white",
    },
    neutral: {
        icon: Info,
        iconBg: "bg-[#E8F0EA]",
        iconColor: "text-[#8FB996]",
        buttonVariant: "primary" as const,
        buttonClass: "",
    },
}

export function ConfirmModal({
    open,
    onClose,
    onConfirm,
    title,
    message,
    variant = "neutral",
    confirmLabel = "Confirmar",
    cancelLabel = "Cancelar",
    loading = false,
}: ConfirmModalProps) {
    const config = variantConfig[variant]
    const Icon = config.icon

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !loading) onClose()
        }
        if (open) {
            document.addEventListener("keydown", handleEscape)
            document.body.style.overflow = "hidden"
        }
        return () => {
            document.removeEventListener("keydown", handleEscape)
            document.body.style.overflow = ""
        }
    }, [open, onClose, loading])

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-1.5">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/20"
                onClick={loading ? undefined : onClose}
                aria-hidden="true"
            />

            {/* Modal */}
            <div
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="confirm-title"
                aria-describedby="confirm-message"
                className="relative w-full max-w-sm rounded-lg border border-[#E9ECEF] bg-white shadow-lg"
            >
                {/* Header */}
                <div className="flex items-start gap-3 p-4">
                    {/* Icon */}
                    <div className={cn(
                        "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full",
                        config.iconBg
                    )}>
                        <Icon className={cn("h-5 w-5", config.iconColor)} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <h2
                            id="confirm-title"
                            className="text-[13px] font-semibold text-[#343A40]"
                        >
                            {title}
                        </h2>
                        <p
                            id="confirm-message"
                            className="mt-1 text-[11px] text-[#6C757D]"
                        >
                            {message}
                        </p>
                    </div>

                    {/* Close button */}
                    <button
                        onClick={loading ? undefined : onClose}
                        disabled={loading}
                        className="flex-shrink-0 rounded p-1 text-[#ADB5BD] hover:bg-[#F8F9FA] hover:text-[#6C757D] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-2 border-t border-[#E9ECEF] px-4 py-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onClose}
                        disabled={loading}
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        variant={config.buttonVariant}
                        size="sm"
                        onClick={onConfirm}
                        loading={loading}
                        className={config.buttonClass}
                    >
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </div>
    )
}
