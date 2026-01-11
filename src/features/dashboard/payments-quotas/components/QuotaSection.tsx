"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/format"

interface QuotaSectionProps {
    icon: React.ComponentType<{ className?: string }>
    title: string
    subtitle?: string
    paid: number
    due: number
    balance: number
    overdueCount: number
    overdueLabel: string
    linkHref: string
}

export function QuotaSection({
    icon: Icon,
    title,
    subtitle,
    paid,
    due,
    balance,
    overdueCount,
    overdueLabel,
    linkHref,
}: QuotaSectionProps) {
    const progressPercent = due > 0 ? Math.round((paid / due) * 100) : 100

    return (
        <Link
            href={linkHref}
            className="block p-2 sm:p-3 border border-gray-200 hover:border-gray-300 hover:bg-gray-50/50 transition-colors group"
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 min-w-0">
                    <Icon className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                        <p className="text-label sm:text-body font-bold text-gray-700 uppercase tracking-tight">
                            {title}
                        </p>
                        {subtitle && (
                            <p className="text-micro sm:text-label text-gray-500 mt-0.5">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 flex-shrink-0" />
            </div>

            {/* Progress bar */}
            <div className="mt-2">
                <div className="h-1.5 bg-gray-200 overflow-hidden">
                    <div
                        className={cn(
                            "h-full transition-all",
                            progressPercent >= 100 ? "bg-emerald-500" :
                                progressPercent >= 50 ? "bg-warning-light0" : "bg-error-light0"
                        )}
                        style={{ width: `${Math.min(progressPercent, 100)}%` }}
                    />
                </div>
            </div>

            {/* Stats */}
            <div className="mt-2 flex items-center justify-between text-micro sm:text-label">
                <span className="text-gray-500">
                    Pago: <span className="font-mono font-medium text-emerald-600">{formatCurrency(paid)}</span>
                    <span className="text-gray-300 mx-1">/</span>
                    <span className="font-mono text-gray-600">{formatCurrency(due)}</span>
                </span>
                {balance > 0 ? (
                    <span className={cn(
                        "font-bold",
                        overdueCount > 0 ? "text-error" : "text-warning"
                    )}>
                        {overdueCount > 0 && `${overdueCount} ${overdueLabel} • `}
                        {formatCurrency(balance)} em falta
                    </span>
                ) : (
                    <span className="text-emerald-600 font-medium">Liquidado</span>
                )}
            </div>
        </Link>
    )
}
