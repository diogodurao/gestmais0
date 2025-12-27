"use client"

import { Modal } from "./Modal"
import { Button } from "./Button"
import { t } from "@/lib/translations"

interface ConfirmModalProps {
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
    onCancel: () => void
    variant?: "danger" | "neutral"
    confirmLabel?: string
    cancelLabel?: string
}

export function ConfirmModal({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    variant = "neutral",
    confirmLabel,
    cancelLabel
}: ConfirmModalProps) {
    return (
        <Modal isOpen={isOpen} onClose={onCancel} title={title}>
            <div className="space-y-4 text-center sm:text-left">
                <p className="text-sm text-slate-600">{message}</p>
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 mt-6">
                    <Button variant="ghost" size="sm" onClick={onCancel} className="w-full sm:w-auto uppercase text-[10px] font-bold">
                        {cancelLabel || t.common.cancel}
                    </Button>
                    <Button
                        variant={variant === "danger" ? "danger" : "primary"}
                        size="sm"
                        onClick={onConfirm}
                        className="w-full sm:w-auto uppercase text-[10px] font-bold"
                    >
                        {confirmLabel || t.common.save}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}
