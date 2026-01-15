"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ROUTES } from "@/lib/routes"
import {
    archiveExtraordinaryProject,
    deleteExtraordinaryProject,
    type ProjectDetail,
} from "@/lib/actions/extraordinary-projects"
import { ExtraPaymentGrid } from "@/components/dashboard/extraordinary-projects/ExtraPaymentGrid"
import dynamic from "next/dynamic"

// Dynamic Imports
const EditProjectModal = dynamic(
    () => import("@/components/dashboard/extraordinary-projects/EditProjectModal").then(mod => mod.EditProjectModal),
    { ssr: false }
)
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { useAsyncAction } from "@/hooks/useAsyncAction"

// Sub-components
import { ProjectDetailHeader } from "./components/ProjectDetailHeader"
import { ProjectDetailStats } from "./components/ProjectDetailStats"

interface ExtraProjectDetailProps {
    initialProject: ProjectDetail
    readOnly?: boolean
}

export function ExtraProjectDetail({ initialProject, readOnly = false }: ExtraProjectDetailProps) {
    const router = useRouter()
    const project = initialProject

    const [isEditing, setIsEditing] = useState(false)
    const [showArchiveConfirm, setShowArchiveConfirm] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    // Mutation actions
    const { execute: archiveAction } = useAsyncAction(archiveExtraordinaryProject, {
        onSuccess: () => router.push(ROUTES.DASHBOARD.EXTRAORDINARY),
        errorMessage: "Erro ao arquivar projeto"
    })

    const { execute: deleteAction } = useAsyncAction(deleteExtraordinaryProject, {
        onSuccess: () => router.push(ROUTES.DASHBOARD.EXTRAORDINARY),
        successMessage: "Projeto eliminado com sucesso",
        errorMessage: "Erro ao eliminar projeto"
    })

    const handleArchive = async (): Promise<void> => {
        await archiveAction(project.id)
        setShowArchiveConfirm(false)
    }

    const handleDelete = async (): Promise<void> => {
        await deleteAction(project.id)
        setShowDeleteConfirm(false)
    }

    const handleRefresh = () => {
        router.refresh()
    }

    const handleBack = () => {
        router.push(ROUTES.DASHBOARD.EXTRAORDINARY)
    }

    // Calculate stats for the new ProjectDetailStats interface
    const totalCollected = project.payments.reduce((sum, p) => sum + p.totalPaid, 0)
    const progressPercent = project.totalBudget > 0
        ? Math.round((totalCollected / project.totalBudget) * 100)
        : 0

    return (
        <div className="flex-1 overflow-y-auto p-1.5">
            {/* Edit Modal */}
            {isEditing && (
                <EditProjectModal
                    isOpen={true}
                    project={project}
                    onClose={() => setIsEditing(false)}
                    onSave={() => {
                        setIsEditing(false)
                        handleRefresh()
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
                setIsEditing={setIsEditing}
                setShowArchiveConfirm={setShowArchiveConfirm}
                setShowDeleteConfirm={setShowDeleteConfirm}
                loadProject={handleRefresh}
                onBack={handleBack}
            />

            <ProjectDetailStats
                totalBudget={project.totalBudget}
                totalPaid={totalCollected}
                progressPercent={progressPercent}
                numInstallments={project.numInstallments}
                apartmentsTotal={project.payments.length}
            />

            {/* Payment Grid */}
            <ErrorBoundary>
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
                    readOnly={readOnly}
                />
            </ErrorBoundary>
        </div>
    )
}
