"use client"

import { MoreVertical, Edit, RefreshCw, Archive, Trash2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { IconButton } from "@/components/ui/Icon-Button"
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem, DropdownSeparator } from "@/components/ui/Dropdown"

type Project = {
    id: number
    name: string
    description: string | null
    totalBudget: number
    numInstallments: number
    startMonth: number
    startYear: number
    status: string
}

interface ProjectDetailHeaderProps {
    project: Project
    readOnly?: boolean
    setIsEditing: (editing: boolean) => void
    setShowArchiveConfirm: (show: boolean) => void
    setShowDeleteConfirm: (show: boolean) => void
    loadProject: () => void
    onBack: () => void
}

export function ProjectDetailHeader({
    project,
    readOnly,
    setIsEditing,
    setShowArchiveConfirm,
    setShowDeleteConfirm,
    loadProject,
    onBack
}: ProjectDetailHeaderProps) {
    const isManager = !readOnly

    return (
        <div className="mb-1.5 flex items-center gap-1.5">
            <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-3 w-3" />
            </Button>
            <div className="flex-1">
                <h1 className="text-heading font-semibold text-gray-800">{project.name}</h1>
                {project.description && (
                    <p className="text-label text-gray-500">{project.description}</p>
                )}
            </div>

            {isManager && (
                <Dropdown>
                    <DropdownTrigger asChild>
                        <IconButton
                            variant="default"
                            size="sm"
                            icon={<MoreVertical className="h-3 w-3" />}
                            label="Opções"
                        />
                    </DropdownTrigger>
                    <DropdownContent align="end">
                        <DropdownItem
                            icon={<Edit className="h-3 w-3" />}
                            onClick={() => setIsEditing(true)}
                        >
                            Editar Projeto
                        </DropdownItem>
                        <DropdownItem
                            icon={<RefreshCw className="h-3 w-3" />}
                            onClick={loadProject}
                        >
                            Atualizar Dados
                        </DropdownItem>
                        <DropdownSeparator />
                        <DropdownItem
                            icon={<Archive className="h-3 w-3" />}
                            onClick={() => setShowArchiveConfirm(true)}
                        >
                            Arquivar Projeto
                        </DropdownItem>
                        <DropdownItem
                            icon={<Trash2 className="h-3 w-3" />}
                            onClick={() => setShowDeleteConfirm(true)}
                            destructive
                        >
                            Eliminar Projeto
                        </DropdownItem>
                    </DropdownContent>
                </Dropdown>
            )}
        </div>
    )
}
