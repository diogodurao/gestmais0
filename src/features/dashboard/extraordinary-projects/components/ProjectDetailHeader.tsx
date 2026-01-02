"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MoreVertical, Edit, RefreshCw, Archive, Trash2, FileText } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { archiveExtraordinaryProject } from "@/app/actions/extraordinary"
import { useToast } from "@/hooks/use-toast"

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
    isMenuOpen: boolean
    setIsMenuOpen: (open: boolean) => void
    setIsEditing: (editing: boolean) => void
    setShowArchiveConfirm: (show: boolean) => void
    setShowDeleteConfirm: (show: boolean) => void
    isDeleting: boolean
    loadProject: () => Promise<any>
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
    loadProject
}: ProjectDetailHeaderProps) {
    const router = useRouter()
    const { toast } = useToast()

    const handleArchive = async () => {
        try {
            const result = await archiveExtraordinaryProject(project.id)
            if (result.success) {
                router.refresh()
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Erro",
                description: "Falha ao arquivar projeto"
            })
        }
        setShowArchiveConfirm(false)
    }

    const handleDelete = async () => {
        // Deletion handling is typically deferred to the parent
    }

    const isManager = !readOnly

    return (
        <div className="flex items-center justify-between mb-6">
            <div>
                <h1 className="text-lg font-bold text-slate-800 uppercase tracking-wide">
                    {project.name}
                </h1>
                {project.description && (
                    <p className="text-xs text-slate-500 mt-1">{project.description}</p>
                )}
            </div>

            {isManager && (
                <div className="relative">
                    <Button
                        variant="outline"
                        size="xs"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <MoreVertical className="w-4 h-4" />
                    </Button>

                    {isMenuOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setIsMenuOpen(false)}
                            />
                            <div className="absolute right-0 top-full mt-1 bg-white tech-border shadow-lg z-50 py-1 w-48">
                                <button
                                    onClick={() => {
                                        setIsMenuOpen(false)
                                        setIsEditing(true)
                                    }}
                                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                >
                                    <Edit className="w-4 h-4 text-slate-400" />
                                    Editar Detalhes
                                </button>

                                <button
                                    onClick={() => {
                                        setIsMenuOpen(false)
                                        loadProject()
                                    }}
                                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                >
                                    <RefreshCw className="w-4 h-4 text-slate-400" />
                                    Atualizar Dados
                                </button>



                                <div className="h-px bg-slate-100 my-1" />

                                <button
                                    onClick={() => {
                                        setIsMenuOpen(false)
                                        setShowArchiveConfirm(true)
                                    }}
                                    className="w-full text-left px-3 py-2 text-xs text-amber-600 hover:bg-amber-50 flex items-center gap-2"
                                >
                                    <Archive className="w-4 h-4" />
                                    Arquivar Projeto
                                </button>

                                <button
                                    onClick={() => {
                                        setIsMenuOpen(false)
                                        setShowDeleteConfirm(true)
                                    }}
                                    className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Eliminar Projeto
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}