"use client"

import { useState, useEffect } from "react"
import { Modal } from "@/components/ui/Modal"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import { createDiscussion, updateDiscussion } from "@/app/actions/discussions"
import { Discussion } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

interface Props {
    isOpen: boolean
    onClose: () => void
    buildingId: string
    discussion?: Discussion | null // For edit mode
}

export function DiscussionModal({ isOpen, onClose, buildingId, discussion }: Props) {
    const { toast } = useToast()
    const isEditing = !!discussion

    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (discussion) {
            setTitle(discussion.title)
            setContent(discussion.content || "")
        } else {
            setTitle("")
            setContent("")
        }
    }, [discussion, isOpen])

    const handleClose = () => {
        setTitle("")
        setContent("")
        onClose()
    }

    const handleSubmit = async () => {
        if (!title.trim()) {
            toast({ title: "Erro", description: "Título é obrigatório", variant: "destructive" })
            return
        }

        setIsLoading(true)

        if (isEditing && discussion) {
            const result = await updateDiscussion(discussion.id, {
                title: title.trim(),
                content: content.trim() || null,
            })

            if (result.success) {
                toast({ title: "Sucesso", description: "Discussão atualizada" })
                handleClose()
            } else {
                toast({ title: "Erro", description: result.error, variant: "destructive" })
            }
        } else {
            const result = await createDiscussion({
                buildingId,
                title: title.trim(),
                content: content.trim() || undefined,
            })

            if (result.success) {
                toast({ title: "Sucesso", description: "Discussão criada" })
                handleClose()
            } else {
                toast({ title: "Erro", description: result.error, variant: "destructive" })
            }
        }

        setIsLoading(false)
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={isEditing ? "Editar Discussão" : "Nova Discussão"}
        >
            <div className="space-y-4">
                <Input
                    label="Título *"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Sugestão para melhorias no jardim"
                />

                <Textarea
                    label="Conteúdo"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Descreva o tema da discussão..."
                    rows={5}
                />

                <div className="flex gap-2 pt-2">
                    <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} isLoading={isLoading} className="flex-1">
                        {isEditing ? "Guardar" : "Criar Discussão"}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}