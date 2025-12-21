"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
    ArrowLeft,
    Settings,
    FileText,
    Calendar,
    Download,
    MoreVertical,
    Archive,
    RefreshCw,
    ExternalLink,
    Loader2,
} from "lucide-react"
import { formatCurrency, getMonthName } from "@/lib/extraordinary-calculations"
import {
    getExtraordinaryProjectDetail,
    archiveExtraordinaryProject,
    type ProjectDetail,
} from "@/app/actions/extraordinary"
import { ExtraPaymentGrid } from "@/features/dashboard/ExtraordinaryProjects/ExtraPaymentGrid"
// import { useToast } from "@/components/ui/Toast"
// import { useConfirm } from "@/components/ui/ConfirmDialog"

// ===========================================
// TYPES
// ===========================================

interface ExtraProjectDetailProps {
    projectId: number
}

// ===========================================
// COMPONENT
// ===========================================

export function ExtraProjectDetail({ projectId }: ExtraProjectDetailProps) {
    // const toast = useToast()
    // const { confirm } = useConfirm()
    
    const [project, setProject] = useState<ProjectDetail | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const loadProject = async () => {
        setIsLoading(true)
        const result = await getExtraordinaryProjectDetail(projectId)
        
        if (result.success) {
            setProject(result.data)
            setError(null)
        } else {
            setError(result.error)
        }
        setIsLoading(false)
    }

    useEffect(() => {
        loadProject()
    }, [projectId])

    const handleArchive = async () => {
        // const confirmed = await confirm({
        //     title: "Arquivar Projeto",
        //     message: "Tem a certeza que deseja arquivar este projeto? Poderá ser recuperado mais tarde.",
        //     confirmText: "Arquivar",
        //     variant: "warning",
        // })
        // 
        // if (!confirmed) return

        const result = await archiveExtraordinaryProject(projectId)
        if (result.success) {
            // toast.success("Projeto arquivado")
        } else {
            // toast.error("Erro", result.error)
        }
    }

    if (isLoading) {
        return <ProjectDetailSkeleton />
    }

    if (error || !project) {
        return (
            <div className="tech-border p-8 text-center">
                <p className="text-[12px] text-rose-600">{error || "Projeto não encontrado"}</p>
                <Link
                    href="/dashboard/extraordinary"
                    className="inline-flex items-center gap-2 mt-4 text-[11px] text-blue-600 hover:underline"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Voltar à lista
                </Link>
            </div>
        )
    }

    const startDate = `${getMonthName(project.startMonth)} ${project.startYear}`
    const endMonth = ((project.startMonth - 1 + project.numInstallments - 1) % 12) + 1
    const endYear = project.startYear + Math.floor((project.startMonth - 1 + project.numInstallments - 1) / 12)
    const endDate = `${getMonthName(endMonth)} ${endYear}`

    return (
        <div className="space-y-4">
            {/* Header */}
            <header className="tech-border bg-white p-4">
                <div className="flex items-start justify-between">
                    {/* Left: Back + Title */}
                    <div className="flex items-start gap-4">
                        <Link
                            href="/dashboard/extraordinary"
                            className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-lg font-bold text-slate-900">
                                    {project.name}
                                </h1>
                                <StatusBadge status={project.status} />
                            </div>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                #EXTRA-{project.id}
                            </p>
                            {project.description && (
                                <p className="text-[11px] text-slate-600 mt-2 max-w-xl">
                                    {project.description}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Right: Budget + Actions */}
                    <div className="flex items-start gap-4">
                        {/* Budget */}
                        <div className="text-right">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                Orçamento
                            </span>
                            <div className="font-mono font-bold text-slate-900 text-xl">
                                {formatCurrency(project.totalBudget)}
                            </div>
                        </div>

                        {/* Actions Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                            >
                                <MoreVertical className="w-5 h-5" />
                            </button>

                            {isMenuOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setIsMenuOpen(false)}
                                    />
                                    <div className="absolute right-0 mt-1 py-1 bg-white border border-slate-200 shadow-lg z-20 min-w-[180px]">
                                        <button
                                            onClick={() => {
                                                loadProject()
                                                setIsMenuOpen(false)
                                            }}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-[11px] text-slate-700 hover:bg-slate-50 transition-colors"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                            Atualizar dados
                                        </button>
                                        {project.documentUrl && (
                                            <a
                                                href={project.documentUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full flex items-center gap-2 px-3 py-2 text-[11px] text-slate-700 hover:bg-slate-50 transition-colors"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                                Ver documento
                                            </a>
                                        )}
                                        <hr className="my-1 border-slate-100" />
                                        <button
                                            onClick={() => {
                                                handleArchive()
                                                setIsMenuOpen(false)
                                            }}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-[11px] text-amber-700 hover:bg-amber-50 transition-colors"
                                        >
                                            <Archive className="w-4 h-4" />
                                            Arquivar projeto
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Info Row */}
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-6 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                            {startDate} — {endDate}
                        </span>
                    </div>
                    <div>
                        <span className="font-medium text-slate-700">
                            {project.numInstallments}
                        </span>{" "}
                        prestações
                    </div>
                    <div>
                        <span className="font-medium text-slate-700">
                            {project.stats.apartmentsTotal}
                        </span>{" "}
                        frações
                    </div>
                    {project.documentUrl && (
                        <a
                            href={project.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-blue-600 hover:underline"
                        >
                            <FileText className="w-3.5 h-3.5" />
                            {project.documentName || "Ver orçamento"}
                        </a>
                    )}
                </div>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard
                    label="Total Esperado"
                    value={formatCurrency(project.stats.totalExpected)}
                    variant="neutral"
                />
                <StatCard
                    label="Total Cobrado"
                    value={formatCurrency(project.stats.totalPaid)}
                    variant="success"
                />
                <StatCard
                    label="Em Dívida"
                    value={formatCurrency(project.stats.totalExpected - project.stats.totalPaid)}
                    variant={project.stats.totalExpected - project.stats.totalPaid > 0 ? "warning" : "neutral"}
                />
                <StatCard
                    label="Frações Liquidadas"
                    value={`${project.stats.apartmentsCompleted}/${project.stats.apartmentsTotal}`}
                    subValue={`${Math.round((project.stats.apartmentsCompleted / project.stats.apartmentsTotal) * 100)}%`}
                    variant="info"
                />
            </div>

            {/* Payment Grid */}
            <ExtraPaymentGrid
                project={{
                    id: project.id,
                    name: project.name,
                    totalBudget: project.totalBudget,
                    numInstallments: project.numInstallments,
                    startMonth: project.startMonth,
                    startYear: project.startYear,
                    status: project.status,
                }}
                payments={project.payments}
                onRefresh={loadProject}
            />
        </div>
    )
}

// ===========================================
// STATUS BADGE
// ===========================================

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        active: "bg-emerald-50 text-emerald-700 border-emerald-200",
        completed: "bg-blue-50 text-blue-700 border-blue-200",
        cancelled: "bg-slate-100 text-slate-500 border-slate-200",
        archived: "bg-slate-100 text-slate-500 border-slate-200",
    }

    const labels: Record<string, string> = {
        active: "Ativo",
        completed: "Concluído",
        cancelled: "Cancelado",
        archived: "Arquivado",
    }

    return (
        <span className={cn(
            "px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border",
            styles[status] || styles.active
        )}>
            {labels[status] || status}
        </span>
    )
}

// ===========================================
// STAT CARD
// ===========================================

interface StatCardProps {
    label: string
    value: string
    subValue?: string
    variant: "neutral" | "success" | "warning" | "info"
}

function StatCard({ label, value, subValue, variant }: StatCardProps) {
    const variants = {
        neutral: "bg-slate-50 border-slate-200",
        success: "bg-emerald-50 border-emerald-200",
        warning: "bg-amber-50 border-amber-200",
        info: "bg-blue-50 border-blue-200",
    }

    const valueColors = {
        neutral: "text-slate-800",
        success: "text-emerald-700",
        warning: "text-amber-700",
        info: "text-blue-700",
    }

    return (
        <div className={cn("tech-border p-3", variants[variant])}>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                {label}
            </p>
            <div className="flex items-baseline gap-2 mt-1">
                <p className={cn("text-lg font-bold font-mono", valueColors[variant])}>
                    {value}
                </p>
                {subValue && (
                    <span className="text-[11px] text-slate-500">{subValue}</span>
                )}
            </div>
        </div>
    )
}

// ===========================================
// SKELETON
// ===========================================

function ProjectDetailSkeleton() {
    return (
        <div className="space-y-4">
            <div className="tech-border bg-white p-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                        <div className="w-9 h-9 bg-slate-200 skeleton" />
                        <div>
                            <div className="h-6 w-48 bg-slate-200 skeleton" />
                            <div className="h-3 w-24 bg-slate-100 skeleton mt-2" />
                        </div>
                    </div>
                    <div className="h-8 w-32 bg-slate-200 skeleton" />
                </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="tech-border p-3">
                        <div className="h-3 w-20 bg-slate-200 skeleton" />
                        <div className="h-6 w-24 bg-slate-200 skeleton mt-2" />
                    </div>
                ))}
            </div>

            <div className="tech-border bg-white p-4">
                <div className="h-64 bg-slate-100 skeleton" />
            </div>
        </div>
    )
}

export default ExtraProjectDetail