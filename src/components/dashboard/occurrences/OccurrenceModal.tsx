"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Modal } from "@/components/ui/Modal"
import { Drawer } from "@/components/ui/Drawer"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import { Select } from "@/components/ui/Select"
import { FormField, FormLabel, FormControl, FormError } from "@/components/ui/Form-Field"
import { PhotoUpload } from "./PhotoUpload"
import { createOccurrence, updateOccurrence } from "@/lib/actions/occurrences"
import { Occurrence, OccurrencePriority } from "@/lib/types"
import { MAX_PHOTOS_PER_OCCURRENCE } from "@/lib/constants/project"
import { OCCURRENCE_CATEGORY_OPTIONS, OCCURRENCE_PRIORITY_OPTIONS } from "@/lib/constants/ui"
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
    const { addToast } = useToast()
    const isEditing = !!occurrence

    const [title, setTitle] = useState(occurrence?.title || "")
    const [type, setType] = useState(occurrence?.type || "maintenance")
    const [priority, setPriority] = useState<OccurrencePriority>(occurrence?.priority || "medium")
    const [description, setDescription] = useState(occurrence?.description || "")
    const [photos, setPhotos] = useState<SelectedPhoto[]>([])
    const [isMobile, setIsMobile] = useState(false)

    // Check if mobile on mount and resize
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 640)
        checkMobile()
        window.addEventListener("resize", checkMobile)
        return () => window.removeEventListener("resize", checkMobile)
    }, [])

    // Reset form when occurrence changes (for edit mode)
    useEffect(() => {
        if (occurrence) {
            setTitle(occurrence.title)
            setType(occurrence.type)
            setPriority(occurrence.priority || "medium")
            setDescription(occurrence.description || "")
        }
    }, [occurrence])

    const resetForm = () => {
        if (!occurrence) {
            setTitle("")
            setType("maintenance")
            setPriority("medium")
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
        priority: OccurrencePriority
        description: string
        photos: SelectedPhoto[]
    }) => {
        const result = await createOccurrence({
            buildingId,
            title: data.title,
            type: data.type,
            priority: data.priority,
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
        async (data: { id: number; title: string; type: string; priority: OccurrencePriority; description?: string }) => {
            return updateOccurrence(data.id, {
                title: data.title,
                type: data.type,
                priority: data.priority,
                description: data.description,
            })
        },
        {
            successMessage: "Ocorrência atualizada com sucesso",
            onSuccess: () => {
                router.refresh()
                handleClose()
            }
        }
    )

    const isLoading = isCreating || isUpdating

    const handleSubmit = async () => {
        if (!title.trim() || !type.trim()) {
            addToast({ title: "Erro", description: "Preencha os campos obrigatórios", variant: "error" })
            return
        }

        if (isEditing && occurrence) {
            await updateOcc({
                id: occurrence.id,
                title: title.trim(),
                type: type.trim(),
                priority,
                description: description.trim() || undefined,
            })
        } else {
            await createOcc({
                title: title.trim(),
                type: type.trim(),
                priority,
                description: description.trim(),
                photos
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
                            placeholder="Ex: Elevador avariado"
                        />
                    )}
                </FormControl>
                <FormError />
            </FormField>

            <div className="grid grid-cols-2 gap-3">
                <FormField required>
                    <FormLabel>Categoria</FormLabel>
                    <FormControl>
                        {(props) => (
                            <Select
                                {...props}
                                value={type}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setType(e.target.value)}
                            >
                                {OCCURRENCE_CATEGORY_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </Select>
                        )}
                    </FormControl>
                    <FormError />
                </FormField>

                <FormField required>
                    <FormLabel>Prioridade</FormLabel>
                    <FormControl>
                        {(props) => (
                            <Select
                                {...props}
                                value={priority}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPriority(e.target.value as OccurrencePriority)}
                            >
                                {OCCURRENCE_PRIORITY_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </Select>
                        )}
                    </FormControl>
                    <FormError />
                </FormField>
            </div>

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
        </div>
    )

    // Footer buttons (shared)
    const FooterButtons = (
        <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                Cancelar
            </Button>
            <Button onClick={handleSubmit} loading={isLoading} className="flex-1">
                {isEditing ? "Guardar" : "Criar Ocorrência"}
            </Button>
        </div>
    )

    // Render mobile Drawer or desktop Modal
    if (isMobile) {
        return (
            <Drawer
                open={isOpen}
                onClose={handleClose}
                title={isEditing ? "Editar Ocorrência" : "Nova Ocorrência"}
                description="Registe um novo problema ou incidente."
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
            title={isEditing ? "Editar Ocorrência" : "Nova Ocorrência"}
        >
            {FormContent}
            {FooterButtons}
        </Modal>
    )
}