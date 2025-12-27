import { useState } from "react"
import { X, Loader2 } from "lucide-react"
import { type ProjectDetail, updateExtraordinaryProject } from "@/app/actions/extraordinary"
import { Button } from "@/components/ui/Button"
import { formatCurrency } from "@/lib/extraordinary-calculations"

interface EditProjectModalProps {
    project: ProjectDetail
    onClose: () => void
    onSave: () => void
}

export function EditProjectModal({ project, onClose, onSave }: EditProjectModalProps) {
    const [formData, setFormData] = useState({
        name: project.name,
        description: project.description || "",
    })
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
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
                        aria-label="Fechar modal"
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
