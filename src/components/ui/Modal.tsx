"use client"

import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { type Size } from "@/lib/utils"

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    children: React.ReactNode
    className?: string
    size?: Size | "xl" | "2xl" | "full"
}

const sizeClasses: Record<string, string> = {
    xs: "max-w-xs",
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    full: "max-w-[95vw]",
}

export function Modal({
    isOpen,
    onClose,
    title,
    children,
    className,
    size = "sm"
}: ModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] p-4 animate-in fade-in duration-200">
            <div
                className={cn(
                    "bg-white rounded-sm shadow-xl w-full overflow-hidden animate-in zoom-in-95 duration-200 tech-border flex flex-col",
                    sizeClasses[size],
                    className
                )}
            >
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50/80">
                    <h3 className="font-bold text-slate-800 uppercase tracking-tight text-body">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-1 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-sm transition-all"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="p-4 overflow-y-auto max-h-[85vh]">
                    {children}
                </div>
            </div>
        </div>
    )
}
