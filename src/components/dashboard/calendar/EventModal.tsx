"use client"

import { useState, useCallback } from "react"
import { Modal } from "@/components/ui/Modal"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import { Select } from "@/components/ui/Select"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { FormField, FormLabel, FormControl, FormError } from "@/components/ui/Form-Field"
import { NotificationOptionsSection, type Resident } from "@/components/ui/ResidentSelector"
import { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } from "@/lib/actions/calendar"
import { getBuildingResidentsForSelector } from "@/lib/actions/notification"
import { CalendarEvent, NotificationOptions } from "@/lib/types"
import { EVENT_TYPE_SUGGESTIONS } from "@/lib/constants/ui"
import { useToast } from "@/components/ui/Toast"

interface Props {
    isOpen: boolean
    onClose: () => void
    buildingId: string
    initialDate: string | null
    event: CalendarEvent | null
    readOnly?: boolean
    isManager?: boolean
}

export function EventModal({ isOpen, onClose, buildingId, initialDate, event, readOnly, isManager }: Props) {
    const { addToast } = useToast()
    const isEditing = !!event

    const [title, setTitle] = useState(event?.title || "")
    const [type, setType] = useState(event?.type || "")
    const [description, setDescription] = useState(event?.description || "")
    const [startDate, setStartDate] = useState(event?.startDate || initialDate || "")
    const [endDate, setEndDate] = useState(event?.endDate || "")
    const [startTime, setStartTime] = useState(event?.startTime || "")
    const [recurrence, setRecurrence] = useState<"none" | "weekly" | "biweekly" | "monthly">("none")
    const [isLoading, setIsLoading] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    // Notification options (only for creating new events as manager)
    const [sendAppNotification, setSendAppNotification] = useState(true)
    const [sendEmail, setSendEmail] = useState(false)
    const [recipients, setRecipients] = useState<'all' | string[]>('all')

    const fetchResidents = useCallback(async (buildingId: string): Promise<Resident[]> => {
        return getBuildingResidentsForSelector(buildingId)
    }, [])

    const showNotificationOptions = isManager && !isEditing && !readOnly

    const resetForm = () => {
        setTitle(event?.title || "")
        setType(event?.type || "")
        setDescription(event?.description || "")
        setStartDate(event?.startDate || initialDate || "")
        setEndDate(event?.endDate || "")
        setStartTime(event?.startTime || "")
        setRecurrence("none")
        setSendAppNotification(true)
        setSendEmail(false)
        setRecipients('all')
    }

    const handleSubmit = async () => {
        if (!title || !type || !startDate) {
            addToast({ title: "Erro", description: "Preencha os campos obrigatórios", variant: "error" })
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
                addToast({ title: "Sucesso", description: "Evento atualizado", variant: "success" })
                onClose()
            } else {
                addToast({ title: "Erro", description: result.error, variant: "error" })
            }
        } else {
            // Build notification options for new events
            const notificationOptions: NotificationOptions | undefined = showNotificationOptions
                ? {
                    sendAppNotification,
                    sendEmail,
                    recipients,
                }
                : undefined

            const result = await createCalendarEvent({
                buildingId, title, type, description, startDate,
                endDate: endDate || undefined,
                startTime: startTime || undefined,
                recurrence,
                notificationOptions,
            })
            if (result.success) {
                addToast({ title: "Sucesso", description: `${result.data.count} evento(s) criado(s)`, variant: "success" })
                onClose()
            } else {
                addToast({ title: "Erro", description: result.error, variant: "error" })
            }
        }

        setIsLoading(false)
    }

    const handleDeleteClick = () => {
        if (!event) return
        setShowDeleteConfirm(true)
    }

    const confirmDelete = async () => {
        if (!event) return

        setIsLoading(true)
        const result = await deleteCalendarEvent(event.id)
        if (result.success) {
            addToast({ title: "Sucesso", description: "Evento eliminado", variant: "success" })
            onClose()
        } else {
            addToast({ title: "Erro", description: result.error, variant: "error" })
        }
        setIsLoading(false)
        setShowDeleteConfirm(false)
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
                                type="text"
                                placeholder="Ex: 19:00"
                                pattern="^([01]?[0-9]|2[0-3]):[0-5][0-9]$"
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
                                    value={recurrence}
                                    onChange={(e) => setRecurrence(e.target.value as typeof recurrence)}
                                >
                                    <option value="none">Não repetir</option>
                                    <option value="weekly">Semanal (4x)</option>
                                    <option value="biweekly">Quinzenal (4x)</option>
                                    <option value="monthly">Mensal (4x)</option>
                                </Select>
                            )}
                        </FormControl>
                        <FormError />
                    </FormField>
                )}

                {/* Notification Options (manager only, create mode) */}
                {showNotificationOptions && (
                    <NotificationOptionsSection
                        sendAppNotification={sendAppNotification}
                        onSendAppNotificationChange={setSendAppNotification}
                        sendEmail={sendEmail}
                        onSendEmailChange={setSendEmail}
                        recipients={recipients}
                        onRecipientsChange={setRecipients}
                        buildingId={buildingId}
                        fetchResidents={fetchResidents}
                        disabled={isLoading}
                    />
                )}

                {!readOnly && (
                    <div className="flex gap-2 pt-2">
                        {isEditing && (
                            <Button variant="outline" className="text-error border-error-light hover:bg-error-light" onClick={handleDeleteClick} disabled={isLoading}>
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
                    <Button variant="outline" onClick={onClose} className="w-full">
                        Fechar
                    </Button>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={showDeleteConfirm}
                title="Eliminar evento"
                message="Tem a certeza que deseja eliminar este evento?"
                variant="danger"
                confirmText="Eliminar"
                onConfirm={confirmDelete}
                onCancel={() => setShowDeleteConfirm(false)}
                loading={isLoading}
            />
        </Modal>
    )
}