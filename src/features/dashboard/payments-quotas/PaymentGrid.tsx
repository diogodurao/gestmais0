"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useDebouncedCallback } from "use-debounce"
import { updatePaymentStatus, PaymentData } from "@/app/actions/payments"
import { deleteApartment } from "@/app/actions/building"
import { PaymentDesktopTable } from "./PaymentDesktopTable"
import { PaymentMobileCards } from "./PaymentMobileCards"
import { PaymentGridHeader } from "./components/PaymentGridHeader"
import { PaymentGridToolbar } from "./components/PaymentGridToolbar"
import { PaymentGridFooter } from "./components/PaymentGridFooter"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { useToast } from "@/hooks/use-toast"
import { useAsyncAction } from "@/hooks/useAsyncAction"
import { type ToolType, type FilterMode, type PaymentStats, TOOL_TO_STATUS } from "./types"

interface PaymentGridProps {
    data: PaymentData[]
    monthlyQuota: number
    buildingId: string
    year: number
    readOnly?: boolean
}

export function PaymentGrid({
    data,
    monthlyQuota,
    buildingId,
    year,
    readOnly = false,
}: PaymentGridProps) {
    const router = useRouter()
    const { toast } = useToast()
    
    // Local state for optimistic updates
    const [localData, setLocalData] = useState<PaymentData[]>(data)
    const [searchTerm, setSearchTerm] = useState("")
    const [highlightedId, setHighlightedId] = useState<number | null>(null)
    const [activeTool, setActiveTool] = useState<ToolType>(null)
    const [filterMode, setFilterMode] = useState<FilterMode>("all")
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null)

    // Sync local data when props change (after server refresh)
    useEffect(() => {
        setLocalData(data)
    }, [data])

    // Clear highlight after delay
    useEffect(() => {
        if (highlightedId !== null) {
            const timer = setTimeout(() => setHighlightedId(null), 3000)
            return () => clearTimeout(timer)
        }
    }, [highlightedId])

    // Async actions with rollback on error
    const { execute: updateStatus, isPending: isSaving } = useAsyncAction(updatePaymentStatus, {
        onSuccess: () => {
            router.refresh()
        },
        onError: () => {
            // Rollback to server state on error
            setLocalData(data)
            toast({
                title: "Erro",
                description: "Não foi possível atualizar o pagamento",
                variant: "destructive"
            })
        }
    })

    const { execute: removeApartment } = useAsyncAction(deleteApartment, {
        onSuccess: () => {
            router.refresh()
            toast({
                title: "Sucesso",
                description: "Fração removida com sucesso"
            })
        },
        onError: () => {
            toast({
                title: "Erro",
                description: "Não foi possível remover a fração",
                variant: "destructive"
            })
        }
    })

    // Filter and search logic (memoized)
    const filteredData = useMemo(() => {
        let result = localData

        // Apply search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            result = result.filter(apt =>
                apt.unit.toLowerCase().includes(term) ||
                apt.residentName?.toLowerCase().includes(term)
            )
        }

        // Apply status filter
        if (filterMode !== "all") {
            result = result.filter(apt => {
                if (filterMode === "paid") return apt.balance === 0
                if (filterMode === "late") return apt.balance > 0
                if (filterMode === "pending") {
                    const hasAnyPending = Object.values(apt.payments).some(p => p.status === 'pending')
                    return hasAnyPending
                }
                return true
            })
        }

        return result
    }, [localData, searchTerm, filterMode])

    // Calculate stats (memoized)
    const stats = useMemo<PaymentStats>(() => {
        const totalCollected = localData.reduce((acc, apt) => acc + apt.totalPaid, 0)
        const totalOverdue = localData.reduce((acc, apt) => acc + apt.balance, 0)
        const paidCount = localData.filter(apt => apt.balance === 0).length
        const overdueCount = localData.filter(apt => apt.balance > 0).length
        return { totalCollected, totalOverdue, paidCount, overdueCount, total: localData.length }
    }, [localData])

    // Debounced cell click handler - prevents rapid-fire API calls
    const handleCellClick = useDebouncedCallback(async (
        aptId: number,
        monthIdx: number
    ): Promise<void> => {
        if (!activeTool || readOnly) return

        const dbStatus = TOOL_TO_STATUS[activeTool]
        const monthNum = monthIdx + 1

        // Optimistic update - update UI immediately
        setLocalData(prev => prev.map(apt => {
            if (apt.apartmentId !== aptId) return apt

            const newPayments = {
                ...apt.payments,
                [monthNum]: {
                    status: dbStatus,
                    amount: dbStatus === 'paid' ? monthlyQuota : 0
                }
            }

            // Recalculate totals
            const totalPaid = Object.values(newPayments).reduce((sum, p) => 
                sum + (p.status === 'paid' ? (p.amount || monthlyQuota) : 0), 0
            )
            const expectedTotal = 12 * monthlyQuota
            const balance = Math.max(0, expectedTotal - totalPaid)

            return {
                ...apt,
                payments: newPayments,
                totalPaid,
                balance
            }
        }))

        // Fire API call (errors handled by useAsyncAction with rollback)
        await updateStatus(aptId, monthNum, year, dbStatus as any)
    }, 150)

    // Search handler
    const handleSearch = useCallback((e: React.FormEvent) => {
        e.preventDefault()
        if (!searchTerm) return
        
        const match = filteredData[0]
        if (match) {
            setHighlightedId(match.apartmentId)
            toast({
                title: "Fração encontrada",
                description: `${match.unit} - ${match.residentName || 'Sem residente'}`,
            })
        } else {
            toast({
                title: "Não encontrado",
                description: "Nenhuma fração corresponde à pesquisa",
                variant: "destructive"
            })
        }
    }, [searchTerm, filteredData, toast])

    // Delete handlers
    const handleDeleteClick = useCallback((aptId: number) => {
        setDeleteTargetId(aptId)
        setShowDeleteConfirm(true)
    }, [])

    const handleDeleteConfirm = async (): Promise<void> => {
        if (!deleteTargetId) return
        await removeApartment(deleteTargetId)
        setShowDeleteConfirm(false)
        setDeleteTargetId(null)
    }

    return (
        <div className="flex flex-col h-full min-h-0 bg-white tech-border overflow-hidden">
            <ConfirmModal
                isOpen={showDeleteConfirm}
                title="Eliminar Fração"
                message="Tem a certeza que deseja eliminar esta fração? Todos os pagamentos associados serão também eliminados. Esta ação é irreversível."
                onConfirm={handleDeleteConfirm}
                onCancel={() => setShowDeleteConfirm(false)}
                variant="danger"
                confirmLabel="Eliminar"
                cancelLabel="Cancelar"
            />

            <PaymentGridHeader
                year={year}
                stats={stats}
            />

            {!readOnly && (
                <PaymentGridToolbar
                    activeTool={activeTool}
                    onToolChange={setActiveTool}
                    filterMode={filterMode}
                    onFilterChange={setFilterMode}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    onSearchSubmit={handleSearch}
                    isSaving={isSaving}
                />
            )}

            {/* Content */}
            <div className="flex-1 overflow-auto relative">
                <PaymentDesktopTable
                    data={filteredData}
                    monthlyQuota={monthlyQuota}
                    readOnly={readOnly}
                    activeTool={activeTool}
                    highlightedId={highlightedId}
                    onCellClick={handleCellClick}
                    onDelete={handleDeleteClick}
                />

                <div className="md:hidden">
                    <PaymentMobileCards
                        data={filteredData}
                        monthlyQuota={monthlyQuota}
                        isEditing={!readOnly && !!activeTool}
                        activeTool={activeTool}
                        onCellClick={handleCellClick}
                    />
                </div>
            </div>

            <PaymentGridFooter />
        </div>
    )
}

export default PaymentGrid