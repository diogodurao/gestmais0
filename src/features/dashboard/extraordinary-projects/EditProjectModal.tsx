"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { updateExtraordinaryProject } from "@/app/actions/extraordinary"
import { useRouter } from "next/navigation"

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
    const [isLoading, setIsLoading] = useState(false)
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

    if (!isOpen) return null

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
                projectId: project.id,
                name: formData.name,
                description: formData.description || undefined
            })

            if (result.success) {
                onClose()
                if (onSave) onSave()
                router.refresh()
            } else {
                setError(result.error || "Ocorreu um erro inesperado")
            }
        } catch (err) {
            setError("Ocorreu um erro inesperado")
        } finally {
            setIsLoading(false)
        }
    }

    const budgetDisplay = (project.totalBudget / 100).toLocaleString("pt-PT", {
        style: "currency",
        currency: "EUR"
    })

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white tech-border w-full max-w-md">
                <div className="flex items-center justify-between p-4 border-b border-slate-200">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                        Editar Projeto
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-slate-100 rounded transition-colors"
                    >
                        <X className="w-4 h-4 text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                            Nome do Projeto *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-3 py-2 text-sm border border-slate-200 focus:outline-none focus:border-blue-400"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                            Descrição
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            rows={3}
                            className="w-full px-3 py-2 text-sm border border-slate-200 focus:outline-none focus:border-blue-400 resize-none"
                        />
                    </div>

                    <div className="bg-slate-50 p-3 border border-slate-200">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">
                            Campos Fixos (Não Editáveis)
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                                <span className="text-slate-400">Orçamento:</span>
                                <span className="ml-1 font-mono font-bold">{budgetDisplay}</span>
                            </div>
                            <div>
                                <span className="text-slate-400">Prestações:</span>
                                <span className="ml-1 font-mono font-bold">{project.numInstallments}</span>
                            </div>
                            <div className="col-span-2">
                                <span className="text-slate-400">Data de Início:</span>
                                <span className="ml-1 font-mono font-bold">
                                    {project.startMonth}/{project.startYear}
                                </span>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <p className="text-[10px] text-rose-600 font-bold uppercase">{error}</p>
                    )}

                    <div className="flex gap-2 justify-end pt-2">
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
            </div>
        </div>
    )
}