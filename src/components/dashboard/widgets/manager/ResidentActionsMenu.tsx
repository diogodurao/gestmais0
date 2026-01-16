"use client"

import { useState, useRef, useEffect, useTransition } from "react"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"
import { MoreVertical, Trash2, Home, UserX } from "lucide-react"
import { removeResidentFromBuilding, updateResidentUnit } from "@/lib/actions/residents"
import { Button } from "@/components/ui/Button"
import { Modal } from "@/components/ui/Modal"
import { getApartmentDisplayName } from "@/lib/utils"
import { useToast } from "@/components/ui/Toast"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import type { OnboardingApartmentSimple } from "@/lib/types"

type Resident = {
    user: {
        id: string
        name: string
        email: string
    }
    apartment: OnboardingApartmentSimple | null
}

export function ResidentActionsMenu({
    resident,
    buildingId,
    unclaimedApartments
}: {
    resident: Resident
    buildingId: string
    unclaimedApartments: OnboardingApartmentSimple[]
}) {
    const router = useRouter()
    const { addToast } = useToast()
    const [isPending, startTransition] = useTransition()
    const [isOpen, setIsOpen] = useState(false)
    const [showAssignModal, setShowAssignModal] = useState(false)
    const [showRemoveConfirm, setShowRemoveConfirm] = useState(false)
    const [showUnassignConfirm, setShowUnassignConfirm] = useState(false)
    const buttonRef = useRef<HTMLButtonElement>(null)
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })

    const toggleOpen = () => {
        if (!isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect()
            setMenuPosition({
                top: rect.bottom + window.scrollY,
                left: rect.right + window.scrollX - 192
            })
        }
        setIsOpen(!isOpen)
    }

    useEffect(() => {
        if (!isOpen) return
        const handleScroll = () => setIsOpen(false)
        window.addEventListener('scroll', handleScroll, true)
        return () => window.removeEventListener('scroll', handleScroll, true)
    }, [isOpen])

    const handleRemove = async () => {
        startTransition(async () => {
            try {
                const result = await removeResidentFromBuilding(resident.user.id, buildingId)
                if (result.success) {
                    setShowRemoveConfirm(false)
                    setIsOpen(false)
                    router.refresh()
                } else {
                    addToast({
                        title: "Erro",
                        description: result.error || "Ocorreu um erro inesperado",
                        variant: "error",
                    })
                }
            } catch (error) {
                console.error("Failed to remove resident", error)
                addToast({
                    title: "Erro",
                    description: "Ocorreu um erro inesperado",
                    variant: "error",
                })
            }
        })
    }

    const handleUnassignUnit = async () => {
        startTransition(async () => {
            try {
                const result = await updateResidentUnit(resident.user.id, null)
                if (result.success) {
                    setShowUnassignConfirm(false)
                    setIsOpen(false)
                    router.refresh()
                } else {
                    addToast({
                        title: "Erro",
                        description: result.error || "Ocorreu um erro inesperado",
                        variant: "error",
                    })
                }
            } catch (error) {
                addToast({
                    title: "Erro",
                    description: "Ocorreu um erro inesperado",
                    variant: "error",
                })
            }
        })
    }

    const handleAssignUnit = async (apartmentId: number) => {
        startTransition(async () => {
            try {
                const result = await updateResidentUnit(resident.user.id, apartmentId)
                if (result.success) {
                    setShowAssignModal(false)
                    setIsOpen(false)
                    router.refresh()
                } else {
                    addToast({
                        title: "Erro",
                        description: result.error || "Ocorreu um erro inesperado",
                        variant: "error",
                    })
                }
            } catch (error) {
                addToast({
                    title: "Erro",
                    description: "Ocorreu um erro inesperado",
                    variant: "error",
                })
            }
        })
    }

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                onClick={toggleOpen}
                className="p-1 hover:bg-gray-100 rounded-sm transition-colors"
            >
                <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>

            {isOpen && typeof document !== 'undefined' && createPortal(
                <>
                    <div
                        className="fixed inset-0 z-50"
                        onClick={() => setIsOpen(false)}
                    />
                    <div
                        className="absolute bg-white rounded-md border border-gray-200 shadow-md z-50 py-1 w-48"
                        style={{
                            top: `${menuPosition.top}px`,
                            left: `${menuPosition.left}px`
                        }}
                    >
                        <div className="px-3 py-1 text-label font-medium text-gray-500 uppercase border-b border-gray-200 mb-1">
                            Operações
                        </div>
                        <button
                            onClick={() => {
                                setIsOpen(false)
                                setShowAssignModal(true)
                            }}
                            className="w-full text-left px-4 py-1.5 text-body text-gray-700 hover:bg-gray-50 flex items-center gap-2 uppercase font-medium"
                        >
                            <Home className="w-4 h-4 text-gray-400" />
                            {resident.apartment ? "Mudar Fração" : "Atribuir Fração"}
                        </button>

                        {resident.apartment && (
                            <button
                                onClick={() => {
                                    setIsOpen(false)
                                    setShowUnassignConfirm(true)
                                }}
                                className="w-full text-left px-4 py-1.5 text-body text-warning hover:bg-warning-light flex items-center gap-2 uppercase font-medium"
                            >
                                <UserX className="w-4 h-4" />
                                Remover da Fração
                            </button>
                        )}

                        <div className="h-px bg-gray-200 my-1" />

                        <button
                            onClick={() => {
                                setIsOpen(false)
                                setShowRemoveConfirm(true)
                            }}
                            className="w-full text-left px-4 py-1.5 text-body text-error hover:bg-error-light flex items-center gap-2 uppercase font-medium"
                        >
                            <Trash2 className="w-4 h-4" />
                            Remover
                        </button>
                    </div>
                </>,
                document.body
            )}

            <ConfirmModal
                isOpen={showRemoveConfirm}
                title="Remover Residente"
                message={`Tem a certeza que deseja remover ${resident.user.name} deste edifício? Esta ação não pode ser desfeita.`}
                onConfirm={handleRemove}
                onCancel={() => setShowRemoveConfirm(false)}
                variant="danger"
                loading={isPending}
            />

            <ConfirmModal
                isOpen={showUnassignConfirm}
                title="Remover da Fração"
                message={`Tem a certeza que deseja remover ${resident.user.name} da sua fração atual?`}
                onConfirm={handleUnassignUnit}
                onCancel={() => setShowUnassignConfirm(false)}
                variant="neutral"
                loading={isPending}
            />

            <Modal
                open={showAssignModal}
                onClose={() => setShowAssignModal(false)}
                title={`Atribuir Fração: ${resident.user.name.toUpperCase()}`}
            >
                <div className="space-y-4">
                    <p className="text-body font-medium text-gray-500 uppercase">
                        Selecione uma fração disponível
                    </p>

                    <div className="max-h-[300px] overflow-y-auto rounded-md border border-gray-200 bg-gray-50">
                        {unclaimedApartments.length === 0 ? (
                            <p className="text-label text-gray-400 uppercase text-center py-8">
                                [ Sem frações disponíveis ]
                            </p>
                        ) : (
                            unclaimedApartments.map(apt => (
                                <button
                                    key={apt.id}
                                    onClick={() => handleAssignUnit(apt.id)}
                                    disabled={isPending}
                                    className="w-full text-left px-3 py-2 text-body hover:bg-white border-b border-gray-200 last:border-b-0 flex justify-between items-center group transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="font-medium text-gray-700 uppercase">
                                        {getApartmentDisplayName(apt)}
                                    </span>
                                    <span className="text-label font-medium text-gray-400 group-hover:text-primary uppercase">
                                        [ SELECIONAR ]
                                    </span>
                                </button>
                            ))
                        )}
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowAssignModal(false)}
                            disabled={isPending}
                        >
                            Cancelar
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}