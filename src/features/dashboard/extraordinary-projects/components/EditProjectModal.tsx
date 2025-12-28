"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Modal } from "@/components/ui/Modal"
import { Button } from "@/components/ui/Button"
import { updateExtraordinaryProject } from "@/app/actions/extraordinary"

type Project = {
    id: string
    name: string
    description: string | null
    budget: number
    installments: number
    startMonth: number
    startYear: number
    documentUrl: string | null
    status: string
}

interface EditProjectModalProps {
    isOpen: boolean
    onClose: () => void
    project: Project
}

export function EditProjectModal({ isOpen, onClose, project }: EditProjectModalProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    // We only allow editing name and description for now to avoid complex recoil on payments
    // If business logic allows editing budget/installments of active projects, that would be more complex
    const [formData, setFormData] = useState({
        name: project.name,
        description: project.description || "",
    })

    useEffect(() => {
        if (isOpen) {
            setFormData({
                name: project.name,
                description: project.description || "",
            })
            setError("")
        }
    }, [isOpen, project])

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (error) setError("")
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (!formData.name.trim()) {
            setError("O nome do projeto é obrigatório")
            return
        }

        setIsLoading(true)

        try {
            const result = await updateExtraordinaryProject({
                projectId: parseInt(project.id),
                name: formData.name,
                description: formData.description || undefined,
            })

            if (result.success) {
                router.refresh()
                onClose()
            } else {
                setError(result.error || "Ocorreu um erro inesperado")
            }
        } catch (err) {
            setError("Ocorreu um erro inesperado")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Editar Projeto">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                        Nome do Projeto *
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-200 focus:outline-none focus:border-blue-400"
                        placeholder="Nome do Projeto"
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                        Descrição
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => handleChange("description", e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 text-sm border border-slate-200 focus:outline-none focus:border-blue-400 resize-none"
                    />
                </div>

                {error && (
                    <p className="text-[10px] text-rose-600 font-bold uppercase">{error}</p>
                )}

                <div className="flex gap-2 justify-end pt-4 border-t border-slate-100 mt-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        size="sm"
                        disabled={isLoading}
                    >
                        {isLoading ? "A guardar..." : "Guardar"}
                    </Button>
                </div>
            </form>
        </Modal>
    )
}
