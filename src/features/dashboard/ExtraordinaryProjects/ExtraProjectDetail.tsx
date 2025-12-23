"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    ArrowLeft,
    FileText,
    Calendar,
    MoreVertical,
    Archive,
    RefreshCw,
    ExternalLink,
    Trash2,
    Pencil,
    X,
    Loader2,
} from "lucide-react"
import { formatCurrency, getMonthName } from "@/lib/extraordinary-calculations"
import {
    getExtraordinaryProjectDetail,
    updateExtraordinaryProject,
    archiveExtraordinaryProject,
    deleteExtraordinaryProject,
    type ProjectDetail,
} from "@/app/actions/extraordinary"
import { ExtraPaymentGrid } from "@/features/dashboard/ExtraordinaryProjects/ExtraPaymentGrid"
import { Button } from "@/components/ui/Button"

// ===========================================
// TYPES
// ===========================================

interface ExtraProjectDetailProps {
    projectId: number
    readOnly?: boolean
}

// ===========================================
// COMPONENT
// ===========================================

export function ExtraProjectDetail({ projectId, readOnly = false }: ExtraProjectDetailProps) {
    const router = useRouter()
    
    const [project, setProject] = useState<ProjectDetail | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

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
        if (!confirm("Tem a certeza que deseja arquivar este projeto?")) return
        
        const result = await archiveExtraordinaryProject(projectId)
        if (result.success) {
            router.push("/dashboard/extraordinary")
        } else {
            alert(result.error)
        }
    }

    const handleDelete = async () => {
        if (!confirm("ATENÇÃO: Esta ação é irreversível. Eliminar o projeto e todos os pagamentos associados?")) return
        
        setIsDeleting(true)
        const result = await deleteExtraordinaryProject(projectId)
        setIsDeleting(false)
        
        if (result.success) {
            router.push("/dashboard/extraordinary")
        } else {
            alert(result.error)
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
        <div className="space-y-3 sm:space-y-4">
            {/* Edit Modal */}
            {isEditing && (
                <EditProjectModal
                    project={project}
                    onClose={() => setIsEditing(false)}
                    onSave={() => {
                        setIsEditing(false)
                        loadProject()
                    }}
                />
            )}

            {/* Header */}
            <header className="tech-border bg-white p-3 sm:p-4">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 sm:gap-4 min-w-0 flex-1">
                        <Link
                            href="/dashboard/extraordinary"
                            className="p-1.5 sm:p-2 -ml-1 sm:-ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
                        >
                            <ArrowLeft className="w-4 sm:w-5 h-4 sm:h-5" />
                        </Link>
                        
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                                    {project.name}
                                </h1>
                                <StatusBadge status={project.status} />
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

                        {/* Actions Menu */}
                        {!readOnly && (
                            <div className="relative">
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                                >
                                    <MoreVertical className="w-4 sm:w-5 h-4 sm:h-5" />
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
                                                    handleArchive()
                                                    setIsMenuOpen(false)
                                                }}
                                                className="w-full flex items-center gap-2 px-3 py-2 text-[11px] text-amber-700 hover:bg-amber-50 transition-colors"
                                            >
                                                <Archive className="w-4 h-4" />
                                                Arquivar projeto
                                            </button>
                                            <button
                                                onClick={() => {
                                                    handleDelete()
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

                {/* Mobile Budget Display */}
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

                {/* Info Row */}
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

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
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
                readOnly={readOnly}
            />
        </div>
    )
}

// ===========================================
// EDIT PROJECT MODAL
// ===========================================

interface EditProjectModalProps {
    project: ProjectDetail
    onClose: () => void
    onSave: () => void
}

function EditProjectModal({ project, onClose, onSave }: EditProjectModalProps) {
    const [formData, setFormData] = useState({
        name: project.name,
        description: project.description || "",
    })
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!formData.name.trim()) {
            setError("Nome é obrigatório")
            return
        }
        
        setIsSaving(true)
        setError(null)
        
        const result = await updateExtraordinaryProject({
            projectId: project.id,
            name: formData.name.trim(),
            description: formData.description.trim(),
        })
        
        setIsSaving(false)
        
        if (result.success) {
            onSave()
        } else {
            setError(result.error)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white tech-border shadow-xl w-full max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
                    <h3 className="text-[12px] font-bold text-slate-800 uppercase tracking-tight">
                        Editar Projeto
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-tight mb-1">
                            Nome do Projeto *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-3 py-2 border border-slate-200 text-[12px] focus:outline-none focus:border-slate-400"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-tight mb-1">
                            Descrição
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            rows={3}
                            className="w-full px-3 py-2 border border-slate-200 text-[12px] focus:outline-none focus:border-slate-400 resize-none"
                        />
                    </div>

                    {/* Read-only fields */}
                    <div className="bg-slate-50 p-3 tech-border border-dashed space-y-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                            Campos fixos (não editáveis)
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div>
                                <span className="text-slate-500">Orçamento:</span>
                                <span className="font-mono font-bold text-slate-700 ml-1">
                                    {formatCurrency(project.totalBudget)}
                                </span>
                            </div>
                            <div>
                                <span className="text-slate-500">Prestações:</span>
                                <span className="font-bold text-slate-700 ml-1">
                                    {project.numInstallments}
                                </span>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <p className="text-[11px] text-rose-600 font-bold">{error}</p>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={onClose}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-3 h-3 animate-spin mr-1" />
                                    A guardar...
                                </>
                            ) : (
                                "Guardar"
                            )}
                        </Button>
                    </div>
                </form>
            </div>
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
        <div className={cn("tech-border p-2 sm:p-3", variants[variant])}>
            <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                {label}
            </p>
            <div className="flex items-baseline gap-1 sm:gap-2 mt-0.5 sm:mt-1">
                <p className={cn("text-base sm:text-lg font-bold font-mono", valueColors[variant])}>
                    {value}
                </p>
                {subValue && (
                    <span className="text-[10px] sm:text-[11px] text-slate-500">{subValue}</span>
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