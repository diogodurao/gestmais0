"use client"

import { useState, useEffect } from "react"

export function PaymentGridFooter() {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    return (
        <footer className="bg-gray-50 border-t border-gray-200 px-4 py-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-micro text-gray-500 shrink-0">
            {/* Legend */}
            <div className="flex items-center gap-3">
                <span className="font-bold text-gray-600 uppercase">Legenda:</span>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-emerald-100 border border-emerald-300 rounded-sm" />
                    <span>Pago</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-error-light border border-gray-300 rounded-sm" />
                    <span>Dívida</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-white border border-gray-200 rounded-sm" />
                    <span>Pendente</span>
                </div>
            </div>

            {/* Timestamp */}
            <div className="ml-auto font-mono text-micro uppercase text-gray-400 hidden sm:block">
                {mounted ? `Atualizado ${new Date().toLocaleTimeString('pt-PT')}` : "..."}
            </div>
        </footer>
    )
}