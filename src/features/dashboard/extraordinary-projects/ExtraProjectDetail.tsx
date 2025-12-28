"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ROUTES } from "@/lib/routes"
import {
    ArrowLeft,
} from "lucide-react"
import {
    getExtraordinaryProjectDetail,
    archiveExtraordinaryProject,
    deleteExtraordinaryProject,
    type ProjectDetail,
} from "@/app/actions/extraordinary"
import { ExtraPaymentGrid } from "@/features/dashboard/extraordinary-projects/ExtraPaymentGrid"
import { EditProjectModal } from "@/features/dashboard/extraordinary-projects/EditProjectModal"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { Skeleton } from "@/components/ui/Skeleton"
import { SkeletonCard } from "@/components/ui/Skeletons"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { useAsyncData } from "@/hooks/useAsyncData"
import { useAsyncAction } from "@/hooks/useAsyncAction"

// Sub-components
import { ProjectDetailHeader } from "./components/ProjectDetailHeader"
import { ProjectDetailStats } from "./components/ProjectDetailStats"

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

    const {
        data: project,
        isLoading,
        error,
        refetch: loadProject
    } = useAsyncData(() => getExtraordinaryProjectDetail(projectId).then(res => {
        if (!res.success) throw new Error(res.error)
        return res.data
    }), [projectId])

    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [showArchiveConfirm, setShowArchiveConfirm] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    const { execute: archiveAction } = useAsyncAction(archiveExtraordinaryProject, {
        onSuccess: () => router.push(ROUTES.DASHBOARD.EXTRAORDINARY),
        errorMessage: "Erro ao arquivar projeto"
    })

    const { execute: deleteAction, isPending: isDeleting } = useAsyncAction(deleteExtraordinaryProject, {
        onSuccess: () => router.push(ROUTES.DASHBOARD.EXTRAORDINARY),
        successMessage: "Projeto eliminado com sucesso",
        errorMessage: "Erro ao eliminar projeto"
    })

    const handleArchive = async (): Promise<void> => {
        await archiveAction(projectId)
        setShowArchiveConfirm(false)
    }

    const handleDelete = async (): Promise<void> => {
        await deleteAction(projectId)
        setShowDeleteConfirm(false)
    }

    if (isLoading) {
        return (
            <div className="space-y-4">
                <SkeletonCard hasHeader={true} />
                <div className="grid grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="tech-border bg-slate-50 p-3">
                            <Skeleton className="h-3 w-20 bg-slate-200" />
                            <Skeleton className="h-6 w-24 bg-slate-200 mt-2" />
                        </div>
                    ))}
                </div>
                <div className="tech-border bg-white p-4">
                    <Skeleton className="h-64 bg-slate-100" />
                </div>
            </div>
        )
    }

    if (error || !project) {
        return (
            <div className="tech-border p-8 text-center">
                <p className="text-[12px] text-rose-600">{error || "Projeto não encontrado"}</p>
                <Link
                    href={ROUTES.DASHBOARD.EXTRAORDINARY}
                    className="inline-flex items-center gap-2 mt-4 text-[11px] text-blue-600 hover:underline"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Voltar
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-3 sm:space-y-4">
            {/* Edit Modal */}
            {isEditing && (
                <EditProjectModal
                    isOpen={true}
                    project={project}
                    onClose={() => setIsEditing(false)}
                    onSave={() => {
                        setIsEditing(false)
                        loadProject()
                    }}
                />
            )}

            <ConfirmModal
                isOpen={showArchiveConfirm}
                title="Arquivar Projeto"
                message="Tem a certeza que deseja arquivar este projeto?"
                onConfirm={handleArchive}
                onCancel={() => setShowArchiveConfirm(false)}
                variant="neutral"
            />

            <ConfirmModal
                isOpen={showDeleteConfirm}
                title="Eliminar Projeto"
                message="ATENÇÃO: Esta ação é irreversível. Eliminar o projeto e todos os pagamentos associados?"
                onConfirm={handleDelete}
                onCancel={() => setShowDeleteConfirm(false)}
                variant="danger"
            />

            <ProjectDetailHeader
                project={project}
                readOnly={readOnly}
                isMenuOpen={isMenuOpen}
                setIsMenuOpen={setIsMenuOpen}
                setIsEditing={setIsEditing}
                setShowArchiveConfirm={setShowArchiveConfirm}
                setShowDeleteConfirm={setShowDeleteConfirm}
                isDeleting={isDeleting}
                loadProject={loadProject}
            />

            <ProjectDetailStats stats={project.stats} />

            {/* Payment Grid */}
            <ErrorBoundary fallback={
                <div className="tech-border p-8 text-center bg-white">
                    <p className="text-rose-600 mb-2">Erro ao carregar pagamentos</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="text-sm text-blue-600 hover:underline"
                    >
                        Tentar novamente
                    </button>
                </div>
            }>
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
            </ErrorBoundary>
        </div>
    )
}

export default ExtraProjectDetail