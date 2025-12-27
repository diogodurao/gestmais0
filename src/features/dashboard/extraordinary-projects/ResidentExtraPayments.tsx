"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import {
    Hammer,
    Calendar,
    CheckCircle,
    Clock,
    AlertCircle,
    ChevronDown,
    ChevronUp,
} from "lucide-react"
import { formatCurrency, getMonthName } from "@/lib/extraordinary-calculations"
import { getResidentExtraordinaryPayments, type ResidentProjectPayment } from "@/app/actions/extraordinary"
import { ProgressBar } from "@/components/ui/ProgressBar"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { SummaryCard } from "@/components/ui/SummaryCard"
import { SkeletonHeader, SkeletonCard } from "@/components/ui/Skeletons"
import { Skeleton } from "@/components/ui/Skeleton"
import { Dictionary } from "@/types/i18n"

// ===========================================
// MAIN COMPONENT
// ===========================================

export function ResidentExtraPayments({ dictionary }: { dictionary: Dictionary }) {
    const [projects, setProjects] = useState<ResidentProjectPayment[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadPayments() {
            setIsLoading(true)
            const result = await getResidentExtraordinaryPayments()

            if (result.success) {
                setProjects(result.data)
                setError(null)
            } else {
                setError(result.error)
            }
            setIsLoading(false)
        }

        loadPayments()
    }, [])

    if (isLoading) {
        return (
            <div className="space-y-6">
                <SkeletonHeader />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="tech-border p-3 h-20 bg-slate-50" />
                    ))}
                </div>
                <div className="space-y-4">
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="tech-border p-8 text-center bg-rose-50">
                <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
                <p className="text-[12px] text-rose-600 font-bold uppercase">{error}</p>
            </div>
        )
    }

    // Calculate totals across all projects
    const totalOwed = projects.reduce((sum, p) => sum + p.totalShare, 0)
    const totalPaid = projects.reduce((sum, p) => sum + p.totalPaid, 0)
    const totalBalance = totalOwed - totalPaid

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <header>
                <h1 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Hammer className="w-4 sm:w-5 h-4 sm:h-5 text-slate-600" />
                    As Minhas Quotas Extraordinárias
                </h1>
                <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">
                    Pagamentos relativos a obras e projetos especiais
                </p>
            </header>

            {/* Summary Cards */}
            {projects.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <SummaryCard
                        label="Total em Dívida"
                        value={formatCurrency(totalBalance)}
                        variant={totalBalance > 0 ? "warning" : "success"}
                        icon={totalBalance > 0 ? Clock : CheckCircle}
                    />
                    <SummaryCard
                        label="Total Pago"
                        value={formatCurrency(totalPaid)}
                        variant="success"
                        icon={CheckCircle}
                    />
                    <SummaryCard
                        label="Total Orçamentado"
                        value={formatCurrency(totalOwed)}
                        variant="neutral"
                        icon={Calendar}
                    />
                </div>
            )}

            {/* Projects List */}
            {projects.length === 0 ? (
                <EmptyState />
            ) : (
                <div className="space-y-4">
                    {projects.map((project) => (
                        <ProjectPaymentCard key={project.projectId} project={project} dictionary={dictionary} />
                    ))}
                </div>
            )}
        </div>
    )
}

// ===========================================
// PROJECT PAYMENT CARD
// ===========================================

function ProjectPaymentCard({ project, dictionary }: { project: ResidentProjectPayment, dictionary: Dictionary }) {
    const [isExpanded, setIsExpanded] = useState(false)

    const progressPercent = project.totalShare > 0
        ? Math.round((project.totalPaid / project.totalShare) * 100)
        : 0

    const isPaid = project.balance === 0
    const startDate = `${getMonthName(project.startMonth, true)} ${project.startYear}`

    // Calculate end date
    const endMonth = ((project.startMonth - 1 + project.numInstallments - 1) % 12) + 1
    const endYear = project.startYear + Math.floor((project.startMonth - 1 + project.numInstallments - 1) / 12)
    const endDate = `${getMonthName(endMonth, true)} ${endYear}`

    return (
        <div className="tech-border bg-white overflow-hidden">
            {/* Header */}
            <div
                className="p-3 sm:p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-[12px] sm:text-[13px] font-bold text-slate-900 truncate">
                                {project.projectName}
                            </h3>
                            <StatusBadge status={isPaid ? "complete" : "partial"} dictionary={dictionary} />
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 mt-1 text-[9px] sm:text-[10px] text-slate-500 flex-wrap">
                            <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span className="hidden sm:inline">{startDate} — {endDate}</span>
                                <span className="sm:hidden">{getMonthName(project.startMonth, true)}/{project.startYear}</span>
                            </span>
                            <span>{project.numInstallments}x</span>
                            <span className="font-mono">Fr: {project.apartmentUnit}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <div className="text-right">
                            <span className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-tight block">
                                A meu cargo
                            </span>
                            <span className="text-base sm:text-lg font-bold text-slate-900 font-mono">
                                {formatCurrency(project.totalShare)}
                            </span>
                        </div>
                        {isExpanded ? (
                            <ChevronUp className="w-4 sm:w-5 h-4 sm:h-5 text-slate-400" />
                        ) : (
                            <ChevronDown className="w-4 sm:w-5 h-4 sm:h-5 text-slate-400" />
                        )}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3 sm:mt-4">
                    <ProgressBar
                        value={project.totalPaid}
                        max={project.totalShare}
                        size="sm"
                        variant={isPaid ? "success" : "auto"}
                    />
                    <div className="flex items-center justify-between mt-1.5 sm:mt-2 text-[9px] sm:text-[10px]">
                        <span className="text-slate-500">
                            Pago: <span className="font-medium text-emerald-600">{formatCurrency(project.totalPaid)}</span>
                        </span>
                        <span className="text-slate-500">
                            {isPaid ? (
                                <span className="text-emerald-600 font-bold">Liquidado</span>
                            ) : (
                                <>Falta: <span className="font-medium text-amber-600">{formatCurrency(project.balance)}</span></>
                            )}
                        </span>
                    </div>
                </div>
            </div>

            {/* Expanded: Installments */}
            {isExpanded && (
                <div className="border-t border-slate-100 bg-slate-50/50">
                    <div className="p-2 sm:p-3 border-b border-slate-100">
                        <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                            Mapa de Prestações
                        </span>
                    </div>
                    <div className="p-2 sm:p-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1.5 sm:gap-2">
                        {project.installments.map((inst) => (
                            <InstallmentCell key={inst.id} installment={inst} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

// ===========================================
// INSTALLMENT CELL
// ===========================================

interface InstallmentCellProps {
    installment: ResidentProjectPayment["installments"][0]
}

function InstallmentCell({ installment }: InstallmentCellProps) {
    const isPaid = installment.status === "paid"
    const isOverdue = installment.status === "overdue"

    return (
        <div className={cn(
            "tech-border p-1.5 sm:p-2 text-center transition-colors",
            isPaid && "bg-emerald-50 border-emerald-200",
            isOverdue && "bg-rose-50 border-rose-200",
            !isPaid && !isOverdue && "bg-white"
        )}>
            <div className="text-[8px] sm:text-[9px] font-bold text-slate-500 uppercase">
                P{installment.number}
            </div>
            <div className="text-[7px] sm:text-[8px] text-slate-400">
                {getMonthName(installment.month, true)}/{String(installment.year).slice(-2)}
            </div>
            <div className={cn(
                "text-[10px] sm:text-[11px] font-mono font-bold mt-0.5 sm:mt-1",
                isPaid && "text-emerald-700",
                isOverdue && "text-rose-700",
                !isPaid && !isOverdue && "text-slate-600"
            )}>
                {formatCurrency(installment.expectedAmount).replace("€", "").trim()}€
            </div>
            <div className="mt-0.5 sm:mt-1">
                {isPaid && <CheckCircle className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-emerald-600 mx-auto" />}
                {isOverdue && <AlertCircle className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-rose-600 mx-auto" />}
                {!isPaid && !isOverdue && <Clock className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-slate-400 mx-auto" />}
            </div>
        </div>
    )
}

// ===========================================
// EMPTY STATE
// ===========================================

function EmptyState() {
    return (
        <div className="tech-border bg-slate-50/50 p-12 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-4">
                <Hammer className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-[13px] font-bold text-slate-800 mb-1">
                Sem Quotas Extraordinárias
            </h3>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                Não existem projetos extraordinários com pagamentos associados à sua fração.
            </p>
        </div>
    )
}

export default ResidentExtraPayments