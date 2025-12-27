"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
    Plus,
    Hammer,
    Calendar,
    TrendingUp,
    ChevronRight,
} from "lucide-react"
import { formatCurrency, getMonthName } from "@/lib/extraordinary-calculations"
import { getExtraordinaryProjects, type ProjectListItem } from "@/app/actions/extraordinary"
import { ProgressBar } from "@/components/ui/ProgressBar"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { SkeletonHeader, SkeletonGrid } from "@/components/ui/Skeletons"
import { Skeleton } from "@/components/ui/Skeleton"

// ===========================================
// TYPES
// ===========================================

interface ExtraProjectsListProps {
    buildingId: string
    readOnly?: boolean
}

// ===========================================
// COMPONENT
// ===========================================

export function ExtraProjectsList({ buildingId, readOnly = false }: ExtraProjectsListProps) {
    const [projects, setProjects] = useState<ProjectListItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadProjects() {
            setIsLoading(true)
            const result = await getExtraordinaryProjects(buildingId)

            if (result.success) {
                setProjects(result.data)
                setError(null)
            } else {
                setError(result.error)
            }
            setIsLoading(false)
        }

        loadProjects()
    }, [buildingId])

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <SkeletonHeader />
                    <Skeleton className="h-9 w-32" />
                </div>
                <SkeletonGrid />
            </div>
        )
    }

    if (error) {
        return (
            <div className="tech-border p-8 text-center">
                <p className="text-[12px] text-rose-600">{error}</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Hammer className="w-4 sm:w-5 h-4 sm:h-5 text-slate-600" />
                        Quotas Extraordinárias
                    </h1>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">
                        Projetos de obras e pagamentos especiais
                    </p>
                </div>

                {!readOnly && (
                    <Link
                        href="/dashboard/extraordinary/new"
                        className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-wider hover:bg-slate-700 transition-colors w-full sm:w-auto"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Novo Projeto
                    </Link>
                )}
            </header>

            {/* Projects Grid */}
            {projects.length === 0 ? (
                <EmptyState readOnly={readOnly} />
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
            )}
        </div>
    )
}

// ===========================================
// PROJECT CARD
// ===========================================

function ProjectCard({ project }: { project: ProjectListItem }) {
    const startDate = `${getMonthName(project.startMonth, true)} ${project.startYear}`
    const endMonth = ((project.startMonth - 1 + project.numInstallments - 1) % 12) + 1
    const endYear = project.startYear + Math.floor((project.startMonth - 1 + project.numInstallments - 1) / 12)
    const endDate = `${getMonthName(endMonth, true)} ${endYear}`

    return (
        <Link
            href={`/dashboard/extraordinary/${project.id}`}
            className="group tech-border bg-white hover:border-slate-300 transition-colors"
        >
            {/* Header */}
            <div className="p-3 sm:p-4 border-b border-slate-100">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-[12px] sm:text-[13px] font-bold text-slate-900 truncate group-hover:text-slate-700">
                            {project.name}
                        </h3>
                        <span className="text-[9px] sm:text-[10px] text-slate-400 font-mono">
                            #EXTRA-{project.id}
                        </span>
                    </div>
                    <StatusBadge status={project.status} />
                </div>
            </div>

            {/* Budget */}
            <div className="p-3 sm:p-4 bg-slate-50/50">
                <div className="flex items-baseline justify-between mb-2 sm:mb-3">
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                        Orçamento
                    </span>
                    <span className="text-base sm:text-lg font-bold text-slate-900 font-mono">
                        {formatCurrency(project.totalBudget)}
                    </span>
                </div>

                {/* Progress */}
                <ProgressBar
                    value={project.totalCollected}
                    max={project.totalBudget}
                    showPercentage
                    size="sm"
                    variant="auto"
                />

                <div className="flex items-center justify-between mt-2 text-[9px] sm:text-[10px] text-slate-500">
                    <span>
                        Cobrado: <span className="font-medium text-emerald-600">
                            {formatCurrency(project.totalCollected)}
                        </span>
                    </span>
                    <span>
                        Falta: <span className="font-medium text-slate-700">
                            {formatCurrency(project.totalBudget - project.totalCollected)}
                        </span>
                    </span>
                </div>
            </div>

            {/* Footer */}
            <div className="px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between border-t border-slate-100">
                <div className="flex items-center gap-2 sm:gap-3 text-[9px] sm:text-[10px] text-slate-500">
                    <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span className="hidden sm:inline">{startDate} - {endDate}</span>
                        <span className="sm:hidden">{getMonthName(project.startMonth, true)}/{project.startYear}</span>
                    </span>
                    <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {project.numInstallments}x
                    </span>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </div>
        </Link>
    )
}


// ===========================================
// EMPTY STATE
// ===========================================

function EmptyState({ readOnly }: { readOnly?: boolean }) {
    return (
        <div className="tech-border bg-slate-50/50 p-12 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-4">
                <Hammer className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-[13px] font-bold text-slate-800 mb-1">
                Sem Projetos Extraordinários
            </h3>
            <p className="text-[11px] text-slate-500 mb-4 max-w-sm mx-auto">
                {readOnly
                    ? "Não existem projetos extraordinários ativos para este edifício."
                    : "Crie um novo projeto para gerir quotas extraordinárias de obras, manutenção ou outras despesas especiais do edifício."
                }
            </p>
            {!readOnly && (
                <Link
                    href="/dashboard/extraordinary/new"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 text-white text-[11px] font-bold uppercase tracking-wider hover:bg-slate-700 transition-colors"
                >
                    <Plus className="w-3.5 h-3.5" />
                    Criar Primeiro Projeto
                </Link>
            )}
        </div>
    )
}



export default ExtraProjectsList