"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Modal } from "@/components/ui/Modal"
import { Drawer } from "@/components/ui/Drawer"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import { FormField, FormLabel, FormControl, FormError } from "@/components/ui/Form-Field"
import { createDiscussion, updateDiscussion } from "@/lib/actions/discussions"
import { Discussion } from "@/lib/types"
import { useToast } from "@/components/ui/Toast"
import { useAsyncAction } from "@/hooks/useAsyncAction"

interface Props {
    isOpen: boolean
    onClose: () => void
    buildingId: string
    discussion?: Discussion | null // For edit mode
}

export function DiscussionModal({ isOpen, onClose, buildingId, discussion }: Props) {
    const router = useRouter()
    const { addToast } = useToast()
    const isEditing = !!discussion

    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [isMobile, setIsMobile] = useState(false)

    // Check if mobile on mount and resize
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 640)
        checkMobile()
        window.addEventListener("resize", checkMobile)
        return () => window.removeEventListener("resize", checkMobile)
    }, [])

    // Reset form when discussion changes (for edit mode) or modal opens
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
        if (!discussion) {
            setTitle("")
            setContent("")
        }
        onClose()
    }

    const { execute: createDisc, isPending: isCreating } = useAsyncAction(
        async (data: { title: string; content: string }) => {
            return createDiscussion({
                buildingId,
                title: data.title,
                content: data.content || undefined,
            })
        },
        {
            successMessage: "Discussão criada com sucesso",
            onSuccess: () => {
                router.refresh()
                handleClose()
            }
        }
    )

    const { execute: updateDisc, isPending: isUpdating } = useAsyncAction(
        async (data: { id: number; title: string; content: string | null }) => {
            return updateDiscussion(data.id, {
                title: data.title,
                content: data.content,
            })
        },
        {
            successMessage: "Discussão atualizada com sucesso",
            onSuccess: () => {
                router.refresh()
                handleClose()
            }
        }
    )

    const isLoading = isCreating || isUpdating

    const handleSubmit = async () => {
        if (!title.trim()) {
            addToast({ title: "Erro", description: "Título é obrigatório", variant: "error" })
            return
        }

        if (isEditing && discussion) {
            await updateDisc({
                id: discussion.id,
                title: title.trim(),
                content: content.trim() || null,
            })
        } else {
            await createDisc({
                title: title.trim(),
                content: content.trim(),
            })
        }
    }

    // Form content (shared between Modal and Drawer)
    const FormContent = (
        <div className="space-y-4">
            <FormField required>
                <FormLabel>Título</FormLabel>
                <FormControl>
                    {(props) => (
                        <Input
                            {...props}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ex: Sugestão para melhorias no jardim"
                        />
                    )}
                </FormControl>
                <FormError />
            </FormField>

            <FormField>
                <FormLabel>Conteúdo</FormLabel>
                <FormControl>
                    {(props) => (
                        <Textarea
                            {...props}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Descreva o tema da discussão..."
                            rows={5}
                        />
                    )}
                </FormControl>
                <FormError />
            </FormField>
        </div>
    )

    // Footer buttons (shared)
    const FooterButtons = (
        <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                Cancelar
            </Button>
            <Button onClick={handleSubmit} loading={isLoading} className="flex-1">
                {isEditing ? "Guardar" : "Criar Discussão"}
            </Button>
        </div>
    )

    // Render mobile Drawer or desktop Modal
    if (isMobile) {
        return (
            <Drawer
                open={isOpen}
                onClose={handleClose}
                title={isEditing ? "Editar Discussão" : "Nova Discussão"}
                description="Inicie uma nova discussão com os condóminos."
            >
                {FormContent}
                {FooterButtons}
            </Drawer>
        )
    }

    return (
        <Modal
            open={isOpen}
            onClose={handleClose}
            title={isEditing ? "Editar Discussão" : "Nova Discussão"}
        >
            {FormContent}
            {FooterButtons}
        </Modal>
    )
}