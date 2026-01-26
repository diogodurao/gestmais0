import { useMemo } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { formatCurrency } from "@/lib/format"
import type { OnboardingApartment } from "@/lib/types"

interface QuotaPreviewTableProps {
    apartments: OnboardingApartment[]
    budgetCents: number
    installmentCount: number
    isOpen: boolean
    onToggle: () => void
}

export function QuotaPreviewTable({
    apartments,
    budgetCents,
    installmentCount,
    isOpen,
    onToggle
}: QuotaPreviewTableProps) {

    const quotaPreview = useMemo(() => {
        if (!budgetCents || apartments.length === 0) return []

        return apartments.map(apt => {
            const share = (apt.permillage / 1000) * budgetCents
            const perInstallment = share / installmentCount
            return {
                unit: apt.unit,
                permillage: apt.permillage,
                totalShare: share,
                perInstallment
            }
        })
    }, [budgetCents, apartments, installmentCount])

    if (apartments.length === 0 || budgetCents <= 0) {
        return null
    }

    return (
        <div className="space-y-2">
            <button
                type="button"
                onClick={onToggle}
                className="flex items-center gap-2 text-label font-bold text-info uppercase hover:text-info"
            >
                {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {isOpen ? "Ocultar" : "Mostrar"} Previsão de Quotas ({apartments.length} frações)
            </button>

            {isOpen && (
                <div className="bg-gray-50 border border-gray-200 max-h-48 overflow-y-auto">
                    <table className="w-full text-xs">
                        <thead className="bg-gray-100 sticky top-0">
                            <tr>
                                <th className="text-left p-2 font-bold text-gray-500 uppercase">Fração</th>
                                <th className="text-right p-2 font-bold text-gray-500 uppercase">Permilagem</th>
                                <th className="text-right p-2 font-bold text-gray-500 uppercase">Quota Total</th>
                                <th className="text-right p-2 font-bold text-gray-500 uppercase">/Prestação</th>
                            </tr>
                        </thead>
                        <tbody>
                            {quotaPreview.map((row, idx) => (
                                <tr key={idx} className="border-t border-gray-100">
                                    <td className="p-2 font-mono font-bold">{row.unit}</td>
                                    <td className="p-2 text-right font-mono">{row.permillage}%</td>
                                    <td className="p-2 text-right font-mono">
                                        {formatCurrency(row.totalShare)}
                                    </td>
                                    <td className="p-2 text-right font-mono text-info">
                                        {formatCurrency(row.perInstallment)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
