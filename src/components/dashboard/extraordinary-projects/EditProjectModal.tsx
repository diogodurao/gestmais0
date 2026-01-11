"use client"

import { useState, useEffect } from "react"
import { Modal } from "@/components/ui/Modal"
import { Button } from "@/components/ui/Button"
import { updateExtraordinaryProject } from "./actions"
import { useRouter } from "next/navigation"
import { useAsyncAction } from "@/hooks/useAsyncAction"
import { formatCurrency } from "@/lib/format"

type Project = {
    id: number
    name: string
    description: string | null
    totalBudget: number
    numInstallments: number
    startMonth: number
    startYear: number
}

interface EditProjectModalProps {
    isOpen: boolean
    onClose: () => void
    onSave?: () => void
    project: Project
}

export function EditProjectModal({ isOpen, onClose, onSave, project }: EditProjectModalProps) {
    const router = useRouter()
    const [error, setError] = useState("")

    const [formData, setFormData] = useState({
        name: project.name,
        description: project.description || ""
    })

    useEffect(() => {
        setFormData({
            name: project.name,
            description: project.description || ""
        })
    }, [project])

    const { execute: updateProject, isPending } = useAsyncAction(updateExtraordinaryProject, {
        successMessage: "Projeto atualizado com sucesso",
        onSuccess: () => {
            onClose()
            if (onSave) onSave()
            router.refresh()
        },
        onError: (msg) => setError(msg)
    })

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (!formData.name.trim()) {
            setError("O nome do projeto é obrigatório")
            return
        }

        await updateProject({
            projectId: project.id,
            name: formData.name,
            description: formData.description || undefined
        })
    }

    const budgetDisplay = formatCurrency(project.totalBudget)

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Editar Projeto"
            className="max-w-md"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-label font-bold text-gray-500 uppercase mb-1">
                        Nome do Projeto *
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 text-body border border-gray-200 focus:outline-none focus:border-gray-400"
                    />
                </div>

                <div>
                    <label className="block text-label font-bold text-gray-500 uppercase mb-1">
                        Descrição
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 text-body border border-gray-200 focus:outline-none focus:border-gray-400 resize-none"
                    />
                </div>

                <div className="bg-gray-50 p-3 border border-gray-200">
                    <p className="text-label font-bold text-gray-400 uppercase mb-2">
                        Campos Fixos (Não Editáveis)
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-body">
                        <div>
                            <span className="text-gray-400">Orçamento:</span>
                            <span className="ml-1 font-mono font-bold">{budgetDisplay}</span>
                        </div>
                        <div>
                            <span className="text-gray-400">Prestações:</span>
                            <span className="ml-1 font-mono font-bold">{project.numInstallments}</span>
                        </div>
                        <div className="col-span-2">
                            <span className="text-gray-400">Data de Início:</span>
                            <span className="ml-1 font-mono font-bold">
                                {project.startMonth}/{project.startYear}
                            </span>
                        </div>
                    </div>
                </div>

                {error && (
                    <p className="text-label text-error font-bold uppercase">{error}</p>
                )}

                <div className="flex gap-2 justify-end pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onClose}
                        disabled={isPending}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        size="sm"
                        disabled={isPending}
                    >
                        {isPending ? "A guardar..." : "Guardar"}
                    </Button>
                </div>
            </form>
        </Modal>
    )
}