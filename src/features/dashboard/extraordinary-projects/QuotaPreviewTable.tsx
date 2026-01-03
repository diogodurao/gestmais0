import { useMemo } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { formatCurrency } from "@/lib/format"

type Apartment = {
    id: number
    unit: string
    permillage: number
}

interface QuotaPreviewTableProps {
    apartments: Apartment[]
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
                className="flex items-center gap-2 text-[10px] font-bold text-blue-600 uppercase hover:text-blue-800"
            >
                {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {isOpen ? "Ocultar" : "Mostrar"} Previsão de Quotas ({apartments.length} frações)
            </button>

            {isOpen && (
                <div className="bg-slate-50 border border-slate-200 max-h-48 overflow-y-auto">
                    <table className="w-full text-xs">
                        <thead className="bg-slate-100 sticky top-0">
                            <tr>
                                <th className="text-left p-2 font-bold text-slate-500 uppercase">Fração</th>
                                <th className="text-right p-2 font-bold text-slate-500 uppercase">Permilagem</th>
                                <th className="text-right p-2 font-bold text-slate-500 uppercase">Quota Total</th>
                                <th className="text-right p-2 font-bold text-slate-500 uppercase">/Prestação</th>
                            </tr>
                        </thead>
                        <tbody>
                            {quotaPreview.map((row, idx) => (
                                <tr key={idx} className="border-t border-slate-100">
                                    <td className="p-2 font-mono font-bold">{row.unit}</td>
                                    <td className="p-2 text-right font-mono">{row.permillage}‰</td>
                                    <td className="p-2 text-right font-mono">
                                        {formatCurrency(row.totalShare)}
                                    </td>
                                    <td className="p-2 text-right font-mono text-blue-600">
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
