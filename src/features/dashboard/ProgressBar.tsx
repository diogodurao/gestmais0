import { ProgressBar } from "@/components/ui/ProgressBar"
import { formatCurrency } from "@/lib/extraordinary-calculations"

interface BudgetProgressProps {
    paid: number
    total: number
    name?: string
    detailed?: boolean
}

export function BudgetProgress({ paid, total, name, detailed }: BudgetProgressProps) {
    const percentage = (paid / total) * 100

    return (
        <div className="tech-border bg-white p-4">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                        Execução do Orçamento {name && `— ${name}`}
                    </h3>
                </div>
                <div className="text-right">
                    <span className="text-sm font-bold text-slate-900 font-mono">
                        {Math.round(percentage)}%
                    </span>
                </div>
            </div>

            <ProgressBar
                value={paid}
                max={total}
                variant="auto"
                size="md"
            />

            {detailed && (
                <div className="flex items-center justify-between mt-3 text-[10px]">
                    <div className="flex flex-col">
                        <span className="text-slate-400 uppercase font-bold tracking-tighter">Cobrado</span>
                        <span className="text-emerald-700 font-bold font-mono text-[12px]">
                            {formatCurrency(paid)}
                        </span>
                    </div>
                    <div className="flex flex-col text-right">
                        <span className="text-slate-400 uppercase font-bold tracking-tighter">Total Orçamentado</span>
                        <span className="text-slate-900 font-bold font-mono text-[12px]">
                            {formatCurrency(total)}
                        </span>
                    </div>
                </div>
            )}
        </div>
    )
}

