"use client"

import { useState } from "react"
import { Plus, X } from "lucide-react"
import { Modal } from "@/components/ui/Modal"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import { Select } from "@/components/ui/Select"
import { createPoll } from "@/app/actions/polls"
import { PollType, PollWeightMode } from "@/lib/types"
import { POLL_TYPE_CONFIG, WEIGHT_MODE_CONFIG } from "@/lib/constants"
import { useToast } from "@/hooks/use-toast"

interface Props {
    isOpen: boolean
    onClose: () => void
    buildingId: string
}

export function PollModal({ isOpen, onClose, buildingId }: Props) {
    const { toast } = useToast()

    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [type, setType] = useState<PollType>("yes_no")
    const [weightMode, setWeightMode] = useState<PollWeightMode>("equal")
    const [options, setOptions] = useState<string[]>(["", ""])
    const [isLoading, setIsLoading] = useState(false)

    const resetForm = () => {
        setTitle("")
        setDescription("")
        setType("yes_no")
        setWeightMode("equal")
        setOptions(["", ""])
    }

    const handleClose = () => {
        resetForm()
        onClose()
    }

    const addOption = () => {
        if (options.length < 10) {
            setOptions([...options, ""])
        }
    }

    const removeOption = (index: number) => {
        if (options.length > 2) {
            setOptions(options.filter((_, i) => i !== index))
        }
    }

    const updateOption = (index: number, value: string) => {
        const newOptions = [...options]
        newOptions[index] = value
        setOptions(newOptions)
    }

    const handleSubmit = async () => {
        if (!title.trim()) {
            toast({ title: "Erro", description: "Título é obrigatório", variant: "destructive" })
            return
        }

        if (type !== "yes_no") {
            const filledOptions = options.filter(o => o.trim())
            if (filledOptions.length < 2) {
                toast({ title: "Erro", description: "Adicione pelo menos 2 opções", variant: "destructive" })
                return
            }
        }

        setIsLoading(true)

        const result = await createPoll({
            buildingId,
            title: title.trim(),
            description: description.trim() || undefined,
            type,
            weightMode,
            options: type !== "yes_no" ? options.filter(o => o.trim()) : undefined,
        })

        if (result.success) {
            toast({ title: "Sucesso", description: "Votação criada" })
            handleClose()
        } else {
            toast({ title: "Erro", description: result.error, variant: "destructive" })
        }

        setIsLoading(false)
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Nova Votação">
            <div className="space-y-4">
                <Input
                    label="Título *"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Aprovação de obras no telhado"
                />

                <div>
                    <label className="block text-body font-bold text-slate-500 uppercase mb-1 tracking-wider">
                        Descrição
                    </label>
                    <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Descreva o assunto da votação..."
                        rows={3}
                    />
                </div>

                <div>
                    <label className="block text-body font-bold text-slate-500 uppercase mb-1 tracking-wider">
                        Tipo de votação
                    </label>
                    <Select
                        options={Object.entries(POLL_TYPE_CONFIG).map(([value, { label }]) => ({
                            value,
                            label,
                        }))}
                        value={type}
                        onChange={(e) => setType(e.target.value as PollType)}
                        fullWidth
                    />
                </div>

                <div>
                    <label className="block text-body font-bold text-slate-500 uppercase mb-1 tracking-wider">
                        Modo de contagem
                    </label>
                    <Select
                        options={Object.entries(WEIGHT_MODE_CONFIG).map(([value, { label, description }]) => ({
                            value,
                            label: `${label} — ${description}`,
                        }))}
                        value={weightMode}
                        onChange={(e) => setWeightMode(e.target.value as PollWeightMode)}
                        fullWidth
                    />
                </div>

                {type !== "yes_no" && (
                    <div className="space-y-2">
                        <label className="block text-body font-bold text-slate-500 uppercase">
                            Opções *
                        </label>
                        {options.map((option, index) => (
                            <div key={index} className="flex gap-2">
                                <Input
                                    value={option}
                                    onChange={(e) => updateOption(index, e.target.value)}
                                    placeholder={`Opção ${index + 1}`}
                                    className="flex-1"
                                />
                                {options.length > 2 && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => removeOption(index)}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                        {options.length < 10 && (
                            <Button variant="outline" size="sm" onClick={addOption}>
                                <Plus className="w-4 h-4 mr-1" /> Adicionar opção
                            </Button>
                        )}
                        <p className="text-label text-slate-400">
                            {type === "single_choice"
                                ? "Os votantes poderão escolher apenas uma opção"
                                : "Os votantes poderão escolher várias opções"}
                        </p>
                    </div>
                )}

                <div className="flex gap-2 pt-2">
                    <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} isLoading={isLoading} className="flex-1">
                        Criar Votação
                    </Button>
                </div>
            </div>
        </Modal>
    )
}