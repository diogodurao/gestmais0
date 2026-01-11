"use client"

import { useState } from "react"
import { Modal } from "@/components/ui/Modal"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import { Select } from "@/components/ui/Select"
import { FormField, FormLabel, FormControl, FormError } from "@/components/ui/Form-Field"
import { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } from "./actions"
import { CalendarEvent } from "@/lib/types"
import { EVENT_TYPE_SUGGESTIONS } from "@/lib/constants/ui"
import { useToast } from "@/components/ui/Toast"

interface Props {
    isOpen: boolean
    onClose: () => void
    buildingId: string
    initialDate: string | null
    event: CalendarEvent | null
    readOnly?: boolean
}

export function EventModal({ isOpen, onClose, buildingId, initialDate, event, readOnly }: Props) {
    const { toast } = useToast()
    const isEditing = !!event

    const [title, setTitle] = useState(event?.title || "")
    const [type, setType] = useState(event?.type || "")
    const [description, setDescription] = useState(event?.description || "")
    const [startDate, setStartDate] = useState(event?.startDate || initialDate || "")
    const [endDate, setEndDate] = useState(event?.endDate || "")
    const [startTime, setStartTime] = useState(event?.startTime || "")
    const [recurrence, setRecurrence] = useState<"none" | "weekly" | "biweekly" | "monthly">("none")
    const [isLoading, setIsLoading] = useState(false)

    const resetForm = () => {
        setTitle(event?.title || "")
        setType(event?.type || "")
        setDescription(event?.description || "")
        setStartDate(event?.startDate || initialDate || "")
        setEndDate(event?.endDate || "")
        setStartTime(event?.startTime || "")
        setRecurrence("none")
    }

    const handleSubmit = async () => {
        if (!title || !type || !startDate) {
            toast({ title: "Erro", description: "Preencha os campos obrigatórios", variant: "destructive" })
            return
        }

        setIsLoading(true)

        if (isEditing && event) {
            const result = await updateCalendarEvent(event.id, {
                title, type, description, startDate,
                endDate: endDate || null,
                startTime: startTime || null,
            })
            if (result.success) {
                toast({ title: "Sucesso", description: "Evento atualizado" })
                onClose()
            } else {
                toast({ title: "Erro", description: result.error, variant: "destructive" })
            }
        } else {
            const result = await createCalendarEvent({
                buildingId, title, type, description, startDate,
                endDate: endDate || undefined,
                startTime: startTime || undefined,
                recurrence,
            })
            if (result.success) {
                toast({ title: "Sucesso", description: `${result.data.count} evento(s) criado(s)` })
                onClose()
            } else {
                toast({ title: "Erro", description: result.error, variant: "destructive" })
            }
        }

        setIsLoading(false)
    }

    const handleDelete = async () => {
        if (!event) return
        if (!confirm("Eliminar este evento?")) return

        setIsLoading(true)
        const result = await deleteCalendarEvent(event.id)
        if (result.success) {
            toast({ title: "Sucesso", description: "Evento eliminado" })
            onClose()
        } else {
            toast({ title: "Erro", description: result.error, variant: "destructive" })
        }
        setIsLoading(false)
    }

    return (
        <Modal open={isOpen} onClose={onClose} title={readOnly ? "Detalhes do Evento" : isEditing ? "Editar Evento" : "Novo Evento"}>
            <div className="space-y-4">
                <FormField required>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                        {(props) => (
                            <Input
                                {...props}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                disabled={readOnly}
                            />
                        )}
                    </FormControl>
                    <FormError />
                </FormField>

                <FormField required>
                    <FormLabel>Tipo</FormLabel>
                    <FormControl>
                        {(props) => (
                            <>
                                <input
                                    {...props}
                                    list="event-types"
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    className="input-sharp w-full"
                                    disabled={readOnly}
                                    placeholder="Selecione ou escreva..."
                                />
                                <datalist id="event-types">
                                    {EVENT_TYPE_SUGGESTIONS.map(t => <option key={t} value={t} />)}
                                </datalist>
                            </>
                        )}
                    </FormControl>
                    <FormError />
                </FormField>

                <FormField>
                    <FormControl>
                        {(props) => (
                            <Textarea
                                {...props}
                                placeholder="Descrição (opcional)"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={readOnly}
                            />
                        )}
                    </FormControl>
                    <FormError />
                </FormField>

                <div className="grid grid-cols-2 gap-3">
                    <FormField required>
                        <FormLabel>Data Início</FormLabel>
                        <FormControl>
                            {(props) => (
                                <Input
                                    {...props}
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    disabled={readOnly}
                                />
                            )}
                        </FormControl>
                        <FormError />
                    </FormField>
                    <FormField>
                        <FormLabel>Data Fim</FormLabel>
                        <FormControl>
                            {(props) => (
                                <Input
                                    {...props}
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    disabled={readOnly}
                                />
                            )}
                        </FormControl>
                        <FormError />
                    </FormField>
                </div>

                <FormField>
                    <FormLabel>Hora (opcional)</FormLabel>
                    <FormControl>
                        {(props) => (
                            <Input
                                {...props}
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                disabled={readOnly}
                            />
                        )}
                    </FormControl>
                    <FormError />
                </FormField>

                {!isEditing && !readOnly && (
                    <FormField>
                        <FormControl>
                            {(props) => (
                                <Select
                                    {...props}
                                    options={[
                                        { value: "none", label: "Não repetir" },
                                        { value: "weekly", label: "Semanal (4x)" },
                                        { value: "biweekly", label: "Quinzenal (4x)" },
                                        { value: "monthly", label: "Mensal (4x)" },
                                    ]}
                                    value={recurrence}
                                    onChange={(e) => setRecurrence(e.target.value as typeof recurrence)}
                                    fullWidth
                                />
                            )}
                        </FormControl>
                        <FormError />
                    </FormField>
                )}

                {!readOnly && (
                    <div className="flex gap-2 pt-2">
                        {isEditing && (
                            <Button variant="danger" onClick={handleDelete} disabled={isLoading}>
                                Eliminar
                            </Button>
                        )}
                        <div className="flex-1" />
                        <Button variant="outline" onClick={onClose} disabled={isLoading}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSubmit} loading={isLoading}>
                            {isEditing ? "Guardar" : "Criar"}
                        </Button>
                    </div>
                )}

                {readOnly && (
                    <Button variant="outline" onClick={onClose} fullWidth>
                        Fechar
                    </Button>
                )}
            </div>
        </Modal>
    )
}