"use client"

import { useState } from "react"
import { Plus, X } from "lucide-react"
import { Modal } from "@/components/ui/Modal"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import { Select } from "@/components/ui/Select"
import { FormField, FormLabel, FormControl, FormError, FormDescription } from "@/components/ui/Form-Field"
import { createPoll } from "@/lib/actions/polls"
import { PollType, PollWeightMode } from "@/lib/types"
import { POLL_TYPE_CONFIG, WEIGHT_MODE_CONFIG } from "@/lib/constants"
import { useToast } from "@/components/ui/Toast"

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
                <FormField required>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                        {(props) => (
                            <Input
                                {...props}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Ex: Aprovação de obras no telhado"
                            />
                        )}
                    </FormControl>
                    <FormError />
                </FormField>

                <FormField>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                        {(props) => (
                            <Textarea
                                {...props}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Descreva o assunto da votação..."
                                rows={3}
                            />
                        )}
                    </FormControl>
                    <FormError />
                </FormField>

                <FormField required>
                    <FormLabel>Tipo de votação</FormLabel>
                    <FormControl>
                        {(props) => (
                            <Select
                                {...props}
                                options={Object.entries(POLL_TYPE_CONFIG).map(([value, { label }]) => ({
                                    value,
                                    label,
                                }))}
                                value={type}
                                onChange={(e) => setType(e.target.value as PollType)}
                                fullWidth
                            />
                        )}
                    </FormControl>
                    <FormError />
                </FormField>

                <FormField required>
                    <FormLabel>Modo de contagem</FormLabel>
                    <FormControl>
                        {(props) => (
                            <Select
                                {...props}
                                options={Object.entries(WEIGHT_MODE_CONFIG).map(([value, { label, description }]) => ({
                                    value,
                                    label: `${label} — ${description}`,
                                }))}
                                value={weightMode}
                                onChange={(e) => setWeightMode(e.target.value as PollWeightMode)}
                                fullWidth
                            />
                        )}
                    </FormControl>
                    <FormError />
                </FormField>

                {type !== "yes_no" && (
                    <div className="space-y-2">
                        <FormLabel>Opções</FormLabel>
                        {options.map((option, index) => (
                            <div key={index} className="flex gap-2">
                                <FormField className="flex-1">
                                    <FormControl>
                                        {(props) => (
                                            <Input
                                                {...props}
                                                value={option}
                                                onChange={(e) => updateOption(index, e.target.value)}
                                                placeholder={`Opção ${index + 1}`}
                                            />
                                        )}
                                    </FormControl>
                                </FormField>
                                {options.length > 2 && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => removeOption(index)}
                                        className="mt-0.5"
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
                        <FormDescription>
                            {type === "single_choice"
                                ? "Os votantes poderão escolher apenas uma opção"
                                : "Os votantes poderão escolher várias opções"}
                        </FormDescription>
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