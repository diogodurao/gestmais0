"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Modal } from "@/components/ui/Modal"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import { FormField, FormLabel, FormControl, FormError } from "@/components/ui/Form-Field"
import { PhotoUpload } from "./PhotoUpload"
import { createOccurrence, updateOccurrence } from "@/app/actions/occurrences"
import { Occurrence, UpdateOccurrenceInput } from "@/lib/types"
import { MAX_PHOTOS_PER_OCCURRENCE } from "@/lib/constants/project"
import { useToast } from "@/components/ui/Toast"
import { useAsyncAction } from "@/hooks/useAsyncAction"

interface SelectedPhoto {
    file: File
    preview: string
}

interface Props {
    isOpen: boolean
    onClose: () => void
    buildingId: string
    occurrence?: Occurrence | null // For edit mode (no photo edit)
}

export function OccurrenceModal({ isOpen, onClose, buildingId, occurrence }: Props) {
    const router = useRouter()
    const { toast } = useToast()
    const isEditing = !!occurrence

    const [title, setTitle] = useState(occurrence?.title || "")
    const [type, setType] = useState(occurrence?.type || "")
    const [description, setDescription] = useState(occurrence?.description || "")
    const [photos, setPhotos] = useState<SelectedPhoto[]>([])

    const resetForm = () => {
        if (!occurrence) {
            setTitle("")
            setType("")
            setDescription("")
            // Cleanup photo previews
            photos.forEach(p => URL.revokeObjectURL(p.preview))
            setPhotos([])
        }
    }

    const handleClose = () => {
        resetForm()
        onClose()
    }

    const { execute: createOcc, isPending: isCreating } = useAsyncAction(async (data: {
        title: string
        type: string
        description: string
        photos: SelectedPhoto[]
    }) => {
        const result = await createOccurrence({
            buildingId,
            title: data.title,
            type: data.type,
            description: data.description || undefined,
        })

        if (!result.success) {
            return result
        }

        // Upload photos if any
        if (data.photos.length > 0) {
            const formData = new FormData()
            formData.append('occurrenceId', result.data.id.toString())
            data.photos.forEach(p => formData.append('photos', p.file))

            try {
                await fetch('/api/occurrences/upload', {
                    method: 'POST',
                    body: formData,
                })
            } catch (error) {
                console.error('Photo upload error:', error)
                // Don't fail the whole operation
            }
        }

        return result
    }, {
        successMessage: "Ocorrência criada com sucesso",
        onSuccess: () => {
            router.refresh()
            handleClose()
        }
    })

    const { execute: updateOcc, isPending: isUpdating } = useAsyncAction(
        async (args: { id: number; data: UpdateOccurrenceInput }) => updateOccurrence(args.id, args.data),
        {
            successMessage: "Ocorrência atualizada com sucesso",
            onSuccess: () => {
                handleClose()
            }
        }
    )

    const isLoading = isCreating || isUpdating

    const handleSubmit = async () => {
        if (!title.trim() || !type.trim()) {
            toast({ title: "Erro", description: "Preencha os campos obrigatórios", variant: "destructive" })
            return
        }

        if (isEditing && occurrence) {
            await updateOcc({
                id: occurrence.id,
                data: {
                    title: title.trim(),
                    type: type.trim(),
                    description: description.trim() || undefined,
                }
            })
        } else {
            await createOcc({
                title: title.trim(),
                type: type.trim(),
                description: description.trim(),
                photos
            })
        }
    }

    return (
        <Modal
            open={isOpen}
            onClose={handleClose}
            title={isEditing ? "Editar Ocorrência" : "Nova Ocorrência"}
        >
            <div className="space-y-4">
                <FormField required>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                        {(props) => (
                            <Input
                                {...props}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Ex: Elevador avariado"
                            />
                        )}
                    </FormControl>
                    <FormError />
                </FormField>

                <FormField required>
                    <FormLabel>Tipo</FormLabel>
                    <FormControl>
                        {(props) => (
                            <Input
                                {...props}
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                placeholder="Ex: Manutenção, Ruído, Limpeza..."
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
                                placeholder="Descreva a ocorrência com mais detalhe..."
                                rows={4}
                            />
                        )}
                    </FormControl>
                    <FormError />
                </FormField>

                {/* Photos - only for new occurrences */}
                {!isEditing && (
                    <PhotoUpload
                        photos={photos}
                        onChange={setPhotos}
                        maxPhotos={MAX_PHOTOS_PER_OCCURRENCE}
                    />
                )}

                <div className="flex gap-2 pt-2">
                    <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} loading={isLoading} className="flex-1">
                        {isEditing ? "Guardar" : "Criar Ocorrência"}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}