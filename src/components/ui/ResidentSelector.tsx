"use client"

import { useState, useEffect, useId } from "react"
import { Check, ChevronDown, X, Users } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Resident {
    id: string
    name: string
    unit?: string
}

interface ResidentSelectorProps {
    buildingId: string
    value: 'all' | string[]
    onChange: (value: 'all' | string[]) => void
    disabled?: boolean
    fetchResidents: (buildingId: string) => Promise<Resident[]>
}

export function ResidentSelector({
    buildingId,
    value,
    onChange,
    disabled,
    fetchResidents,
}: ResidentSelectorProps) {
    const id = useId()
    const [residents, setResidents] = useState<Resident[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        async function loadResidents() {
            if (!buildingId) return
            setIsLoading(true)
            try {
                const data = await fetchResidents(buildingId)
                setResidents(data)
            } catch (error) {
                console.error("Failed to load residents:", error)
            } finally {
                setIsLoading(false)
            }
        }
        loadResidents()
    }, [buildingId, fetchResidents])

    const isAll = value === 'all'
    const selectedIds = isAll ? [] : value
    const selectedCount = isAll ? residents.length : selectedIds.length

    const handleToggleAll = () => {
        if (isAll) {
            onChange([])
        } else {
            onChange('all')
        }
    }

    const handleToggleResident = (residentId: string) => {
        if (isAll) {
            // Switch from all to specific selection, excluding this one
            const newSelection = residents.filter(r => r.id !== residentId).map(r => r.id)
            onChange(newSelection)
        } else {
            const isSelected = selectedIds.includes(residentId)
            if (isSelected) {
                onChange(selectedIds.filter(id => id !== residentId))
            } else {
                const newSelection = [...selectedIds, residentId]
                // If all are selected, switch to 'all'
                if (newSelection.length === residents.length) {
                    onChange('all')
                } else {
                    onChange(newSelection)
                }
            }
        }
    }

    const isResidentSelected = (residentId: string) => {
        return isAll || selectedIds.includes(residentId)
    }

    const getDisplayText = () => {
        if (isAll) return "Todos os residentes"
        if (selectedCount === 0) return "Selecionar residentes"
        if (selectedCount === 1) {
            const resident = residents.find(r => r.id === selectedIds[0])
            return resident?.name || "1 residente"
        }
        return `${selectedCount} residentes`
    }

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-left text-body transition-colors",
                    "hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1",
                    "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60",
                    isOpen && "border-primary ring-1 ring-primary"
                )}
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                id={id}
            >
                <span className="flex items-center gap-2 truncate">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className={selectedCount === 0 ? "text-gray-400" : "text-gray-700"}>
                        {isLoading ? "A carregar..." : getDisplayText()}
                    </span>
                </span>
                <ChevronDown className={cn(
                    "h-4 w-4 text-gray-400 transition-transform",
                    isOpen && "rotate-180"
                )} />
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown */}
                    <div className="absolute z-20 mt-1 w-full rounded-md border border-gray-200 bg-white py-1 shadow-md">
                        <div className="max-h-60 overflow-y-auto">
                            {/* All option */}
                            <button
                                type="button"
                                onClick={handleToggleAll}
                                className={cn(
                                    "flex w-full items-center gap-2 px-3 py-2 text-left text-body transition-colors hover:bg-gray-50",
                                    isAll && "bg-primary-light"
                                )}
                            >
                                <div className={cn(
                                    "flex h-4 w-4 items-center justify-center rounded border",
                                    isAll ? "border-primary bg-primary" : "border-gray-300 bg-white"
                                )}>
                                    {isAll && <Check className="h-3 w-3 text-white" />}
                                </div>
                                <span className="font-medium text-gray-700">Todos os residentes</span>
                                <span className="ml-auto text-gray-400">({residents.length})</span>
                            </button>

                            <div className="mx-3 my-1 border-t border-gray-100" />

                            {/* Individual residents */}
                            {residents.map(resident => (
                                <button
                                    key={resident.id}
                                    type="button"
                                    onClick={() => handleToggleResident(resident.id)}
                                    className={cn(
                                        "flex w-full items-center gap-2 px-3 py-1.5 text-left text-body transition-colors hover:bg-gray-50",
                                        isResidentSelected(resident.id) && !isAll && "bg-primary-light"
                                    )}
                                >
                                    <div className={cn(
                                        "flex h-4 w-4 items-center justify-center rounded border",
                                        isResidentSelected(resident.id) ? "border-primary bg-primary" : "border-gray-300 bg-white"
                                    )}>
                                        {isResidentSelected(resident.id) && <Check className="h-3 w-3 text-white" />}
                                    </div>
                                    <span className="truncate text-gray-700">{resident.name}</span>
                                    {resident.unit && (
                                        <span className="ml-auto text-gray-400">{resident.unit}</span>
                                    )}
                                </button>
                            ))}

                            {residents.length === 0 && !isLoading && (
                                <div className="px-3 py-4 text-center text-gray-400">
                                    Sem residentes
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

// Notification Options component that combines app notification, email, and recipient selection
interface NotificationOptionsProps {
    sendAppNotification: boolean
    onSendAppNotificationChange: (value: boolean) => void
    sendEmail: boolean
    onSendEmailChange: (value: boolean) => void
    recipients: 'all' | string[]
    onRecipientsChange: (value: 'all' | string[]) => void
    buildingId: string
    fetchResidents: (buildingId: string) => Promise<Resident[]>
    disabled?: boolean
}

export function NotificationOptionsSection({
    sendAppNotification,
    onSendAppNotificationChange,
    sendEmail,
    onSendEmailChange,
    recipients,
    onRecipientsChange,
    buildingId,
    fetchResidents,
    disabled,
}: NotificationOptionsProps) {
    const appNotificationId = useId()
    const emailId = useId()
    const recipientsId = useId()

    return (
        <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
            <div className="text-label font-medium text-gray-700">Notificações</div>

            {/* App Notification Toggle */}
            <label htmlFor={appNotificationId} className="flex cursor-pointer items-center gap-2">
                <div className="relative">
                    <input
                        type="checkbox"
                        id={appNotificationId}
                        checked={sendAppNotification}
                        onChange={(e) => onSendAppNotificationChange(e.target.checked)}
                        disabled={disabled}
                        className={cn(
                            "peer h-4 w-4 cursor-pointer appearance-none rounded border border-gray-300 bg-white transition-colors",
                            "checked:border-primary checked:bg-primary",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                            "disabled:cursor-not-allowed disabled:opacity-50"
                        )}
                    />
                    <Check className="pointer-events-none absolute left-0.5 top-0.5 h-3 w-3 text-white opacity-0 peer-checked:opacity-100" />
                </div>
                <span className="text-body text-gray-700">Enviar notificação na app</span>
            </label>

            {/* Email Toggle */}
            <label htmlFor={emailId} className="flex cursor-pointer items-center gap-2">
                <div className="relative">
                    <input
                        type="checkbox"
                        id={emailId}
                        checked={sendEmail}
                        onChange={(e) => onSendEmailChange(e.target.checked)}
                        disabled={disabled}
                        className={cn(
                            "peer h-4 w-4 cursor-pointer appearance-none rounded border border-gray-300 bg-white transition-colors",
                            "checked:border-primary checked:bg-primary",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                            "disabled:cursor-not-allowed disabled:opacity-50"
                        )}
                    />
                    <Check className="pointer-events-none absolute left-0.5 top-0.5 h-3 w-3 text-white opacity-0 peer-checked:opacity-100" />
                </div>
                <span className="text-body text-gray-700">Enviar email</span>
            </label>

            {/* Recipients Selector - only show if at least one notification type is enabled */}
            {(sendAppNotification || sendEmail) && (
                <div className="space-y-1.5">
                    <label htmlFor={recipientsId} className="text-label text-gray-500">
                        Destinatários
                    </label>
                    <ResidentSelector
                        buildingId={buildingId}
                        value={recipients}
                        onChange={onRecipientsChange}
                        disabled={disabled}
                        fetchResidents={fetchResidents}
                    />
                </div>
            )}
        </div>
    )
}
