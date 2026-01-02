"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Modal } from "@/components/ui/Modal"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import { PhotoUpload } from "./PhotoUpload"
import { createOccurrence, updateOccurrence } from "@/app/actions/occurrences"
import { Occurrence } from "@/lib/types"
import { MAX_PHOTOS_PER_OCCURRENCE } from "@/lib/constants"
import { useToast } from "@/hooks/use-toast"

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
    const [isLoading, setIsLoading] = useState(false)

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

    const handleSubmit = async () => {
        if (!title.trim() || !type.trim()) {
            toast({ title: "Erro", description: "Preencha os campos obrigatórios", variant: "destructive" })
            return
        }

        setIsLoading(true)

        if (isEditing && occurrence) {
            const result = await updateOccurrence(occurrence.id, {
                title: title.trim(),
                type: type.trim(),
                description: description.trim() || undefined,
            })

            if (result.success) {
                toast({ title: "Sucesso", description: "Ocorrência atualizada" })
                handleClose()
            } else {
                toast({ title: "Erro", description: result.error, variant: "destructive" })
            }
        } else {
            // Create occurrence first
            const result = await createOccurrence({
                buildingId,
                title: title.trim(),
                type: type.trim(),
                description: description.trim() || undefined,
            })

            if (result.success) {
                // Upload photos if any
                if (photos.length > 0) {
                    const formData = new FormData()
                    formData.append('occurrenceId', result.data.id.toString())
                    photos.forEach(p => formData.append('photos', p.file))

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

                toast({ title: "Sucesso", description: "Ocorrência criada" })
                router.refresh()
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
            title={isEditing ? "Editar Ocorrência" : "Nova Ocorrência"}
        >
            <div className="space-y-4">
                <Input
                    label="Título *"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Elevador avariado"
                />

                <Input
                    label="Tipo *"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    placeholder="Ex: Manutenção, Ruído, Limpeza..."
                />

                <Textarea
                    label="Descrição"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descreva a ocorrência com mais detalhe..."
                    rows={4}
                />

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
                    <Button onClick={handleSubmit} isLoading={isLoading} className="flex-1">
                        {isEditing ? "Guardar" : "Criar Ocorrência"}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}