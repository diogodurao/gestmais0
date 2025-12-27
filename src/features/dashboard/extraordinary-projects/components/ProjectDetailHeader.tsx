"use client"

import Link from "next/link"
import { ArrowLeft, MoreVertical, Pencil, RefreshCw, ExternalLink, Archive, Trash2, Calendar, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { ROUTES } from "@/lib/routes"
import { UI_DIMENSIONS } from "@/lib/constants/ui"
import { formatCurrency, getMonthName } from "@/lib/extraordinary-calculations"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { type ProjectDetail } from "@/app/actions/extraordinary"
import { Dictionary } from "@/types/i18n"

interface ProjectDetailHeaderProps {
    project: ProjectDetail
    readOnly: boolean
    isMenuOpen: boolean
    setIsMenuOpen: (open: boolean) => void
    setIsEditing: (editing: boolean) => void
    setShowArchiveConfirm: (show: boolean) => void
    setShowDeleteConfirm: (show: boolean) => void
    isDeleting: boolean
    loadProject: () => void
    dictionary: Dictionary
}

export function ProjectDetailHeader({
    project,
    readOnly,
    isMenuOpen,
    setIsMenuOpen,
    setIsEditing,
    setShowArchiveConfirm,
    setShowDeleteConfirm,
    isDeleting,
    loadProject,
    dictionary
}: ProjectDetailHeaderProps) {
    const startDate = `${getMonthName(project.startMonth)} ${project.startYear}`
    const endMonth = ((project.startMonth - 1 + project.numInstallments - 1) % 12) + 1
    const endYear = project.startYear + Math.floor((project.startMonth - 1 + project.numInstallments - 1) / 12)
    const endDate = `${getMonthName(endMonth)} ${endYear}`

    return (
        <header className="tech-border bg-white p-3 sm:p-4">
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 sm:gap-4 min-w-0 flex-1">
                    <Link
                        href={ROUTES.DASHBOARD.EXTRAORDINARY}
                        className="p-1.5 sm:p-2 -ml-1 sm:-ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
                    >
                        <ArrowLeft className="w-4 sm:w-5 h-4 sm:h-5" />
                    </Link>

                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                                {project.name}
                            </h1>
                            <StatusBadge status={project.status} dictionary={dictionary} />
                        </div>
                        <p className="text-[9px] sm:text-[10px] text-slate-400 font-mono mt-0.5">
                            #EXTRA-{project.id}
                        </p>
                        {project.description && (
                            <p className="text-[10px] sm:text-[11px] text-slate-600 mt-1.5 sm:mt-2 line-clamp-2 sm:line-clamp-none">
                                {project.description}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-start gap-2 sm:gap-4 shrink-0">
                    <div className="text-right hidden sm:block">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                            Orçamento
                        </span>
                        <div className="font-mono font-bold text-slate-900 text-xl">
                            {formatCurrency(project.totalBudget)}
                        </div>
                    </div>

                    {!readOnly && (
                        <div className="relative">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                                aria-label="Opções do projeto"
                            >
                                <MoreVertical className="w-4 sm:w-5 h-4 sm:h-5" />
                            </button>

                            {isMenuOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setIsMenuOpen(false)}
                                    />
                                    <div className={`absolute right-0 mt-1 py-1 bg-white border border-slate-200 shadow-lg z-20 ${UI_DIMENSIONS.MENU_WIDTH}`}>
                                        <button
                                            onClick={() => {
                                                setIsEditing(true)
                                                setIsMenuOpen(false)
                                            }}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-[11px] text-slate-700 hover:bg-slate-50 transition-colors"
                                        >
                                            <Pencil className="w-4 h-4" />
                                            Editar detalhes
                                        </button>
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
                                                setShowArchiveConfirm(true)
                                                setIsMenuOpen(false)
                                            }}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-[11px] text-amber-700 hover:bg-amber-50 transition-colors"
                                        >
                                            <Archive className="w-4 h-4" />
                                            Arquivar projeto
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowDeleteConfirm(true)
                                                setIsMenuOpen(false)
                                            }}
                                            disabled={isDeleting}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-[11px] text-rose-700 hover:bg-rose-50 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            {isDeleting ? "A eliminar..." : "Eliminar projeto"}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="sm:hidden mt-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                        Orçamento Total
                    </span>
                    <div className="font-mono font-bold text-slate-900 text-lg">
                        {formatCurrency(project.totalBudget)}
                    </div>
                </div>
            </div>

            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3 sm:gap-6 text-[10px] sm:text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                    <Calendar className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                    <span className="hidden sm:inline">{startDate} — {endDate}</span>
                    <span className="sm:hidden">{getMonthName(project.startMonth, true)}/{project.startYear}</span>
                </div>
                <div>
                    <span className="font-medium text-slate-700">{project.numInstallments}</span>x
                </div>
                <div>
                    <span className="font-medium text-slate-700">{project.stats.apartmentsTotal}</span> frações
                </div>
                {project.documentUrl && (
                    <a
                        href={project.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-blue-600 hover:underline"
                    >
                        <FileText className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                        <span className="hidden sm:inline">{project.documentName || "Ver orçamento"}</span>
                        <span className="sm:hidden">Doc</span>
                    </a>
                )}
            </div>
        </header>
    )
}
