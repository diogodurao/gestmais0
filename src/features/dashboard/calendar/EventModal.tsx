"use client"

import { useState } from "react"
import { Modal } from "@/components/ui/Modal"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import { Select } from "@/components/ui/Select"
import { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } from "@/app/actions/calendar"
import { CalendarEvent } from "@/lib/types"
import { EVENT_TYPE_SUGGESTIONS } from "@/lib/constants"
import { useToast } from "@/hooks/use-toast"

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
        <Modal isOpen={isOpen} onClose={onClose} title={readOnly ? "Detalhes do Evento" : isEditing ? "Editar Evento" : "Novo Evento"}>
            <div className="space-y-4">
                <Input
                    label="Título *"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={readOnly}
                />

                <div>
                    <label className="block text-body font-bold text-slate-500 uppercase mb-1">Tipo *</label>
                    <input
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
                </div>

                <Textarea
                    placeholder="Descrição (opcional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={readOnly}
                />

                <div className="grid grid-cols-2 gap-3">
                    <Input
                        label="Data Início *"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        disabled={readOnly}
                    />
                    <Input
                        label="Data Fim"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        disabled={readOnly}
                    />
                </div>

                <Input
                    label="Hora (opcional)"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    disabled={readOnly}
                />

                {!isEditing && !readOnly && (
                    <Select
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
                        <Button onClick={handleSubmit} isLoading={isLoading}>
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