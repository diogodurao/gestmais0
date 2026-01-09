"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ROUTES } from "@/lib/routes"
import {
    archiveExtraordinaryProject,
    deleteExtraordinaryProject,
    type ProjectDetail,
} from "@/app/actions/extraordinary"
import { ExtraPaymentGrid } from "@/features/dashboard/extraordinary-projects/ExtraPaymentGrid"
import dynamic from "next/dynamic"

// Dynamic Imports
const EditProjectModal = dynamic(
    () => import("@/features/dashboard/extraordinary-projects/EditProjectModal").then(mod => mod.EditProjectModal),
    { ssr: false }
)
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { useAsyncAction } from "@/hooks/useAsyncAction" // Keep this for mutations

// Sub-components
import { ProjectDetailHeader } from "./components/ProjectDetailHeader"
import { ProjectDetailStats } from "./components/ProjectDetailStats"

interface ExtraProjectDetailProps {
    initialProject: ProjectDetail // Data passed from server
    readOnly?: boolean
}

export function ExtraProjectDetail({ initialProject, readOnly = false }: ExtraProjectDetailProps) {
    const router = useRouter()
    
    // We use the prop as the source of truth. 
    // When router.refresh() runs, this prop will update with new server data.
    const project = initialProject

    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [showArchiveConfirm, setShowArchiveConfirm] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    // Mutation actions (Archive/Delete) still use useAsyncAction
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
        await archiveAction(project.id)
        setShowArchiveConfirm(false)
    }

    const handleDelete = async (): Promise<void> => {
        await deleteAction(project.id)
        setShowDeleteConfirm(false)
    }

    // This replaces "loadProject". 
    // It tells Next.js to re-run the server component (page.tsx) and send us fresh props.
    const handleRefresh = () => {
        router.refresh()
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
                        handleRefresh() // Refresh data after edit
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
                loadProject={handleRefresh}
            />

            <ProjectDetailStats stats={project.stats} />

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
                    onRefresh={handleRefresh} // Pass refresh handler
                    readOnly={readOnly}
                />
            </ErrorBoundary>
        </div>
    )
}