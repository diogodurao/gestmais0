"use client"

import { X } from "lucide-react"
import { Button } from "./Button" // Assuming Button is in the same directory or adjust import

export function Modal({
    isOpen,
    onClose,
    title,
    children
}: {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode
}) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-4">
                    {children}
                </div>
            </div>
        </div>
    )
}
