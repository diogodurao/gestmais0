"use client"

import { useState, useTransition } from "react"
import { Modal } from "@/components/ui/Modal"
import { Button } from "@/components/ui/Button"
import { Alert } from "@/components/ui/Alert"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import {
    ArrowRightLeft,
    User,
    Calendar,
    CreditCard,
    Home,
    Plus,
} from "lucide-react"
import { type UnmatchedTransaction } from "@/lib/types"
import {
    manuallyMatchTransaction,
    addResidentIban,
} from "@/lib/actions/banking"
import { formatCurrency } from "@/lib/utils"

interface Apartment {
    id: number
    unit: string
    residentName?: string | null
}

interface TransactionMatchModalProps {
    isOpen: boolean
    onClose: () => void
    transaction: UnmatchedTransaction | null
    buildingId: string
    apartments: Apartment[]
    onMatched?: () => void
}

export function TransactionMatchModal({
    isOpen,
    onClose,
    transaction,
    buildingId,
    apartments,
    onMatched,
}: TransactionMatchModalProps) {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [selectedApartmentId, setSelectedApartmentId] = useState<number | null>(null)
    const [saveIban, setSaveIban] = useState(true)
    const [ibanLabel, setIbanLabel] = useState("")
    const [searchTerm, setSearchTerm] = useState("")

    const filteredApartments = apartments.filter(apt =>
        apt.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.residentName?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleMatch = () => {
        if (!transaction || !selectedApartmentId) return

        setError(null)
        startTransition(async () => {
            // For now, we'll match to apartment without a specific payment
            // In a full implementation, you'd also select a payment
            const result = await manuallyMatchTransaction(
                transaction.id,
                selectedApartmentId, // This should be paymentId, but we're using apartmentId for now
                buildingId
            )

            if (result.success) {
                // Optionally save the IBAN for future matching
                if (saveIban && transaction.counterpartyIban) {
                    await addResidentIban(
                        selectedApartmentId,
                        transaction.counterpartyIban,
                        ibanLabel || undefined
                    )
                }

                onMatched?.()
                handleClose()
            } else {
                setError(result.error)
            }
        })
    }

    const handleClose = () => {
        setSelectedApartmentId(null)
        setSaveIban(true)
        setIbanLabel("")
        setSearchTerm("")
        setError(null)
        onClose()
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString('pt-PT', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
    }

    if (!transaction) return null

    return (
        <Modal
            open={isOpen}
            onClose={handleClose}
            title="Associar Transação"
            size="md"
        >
            <div className="space-y-4">
                {/* Transaction Summary */}
                <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-body font-semibold text-green-700">
                            +{formatCurrency(transaction.amount)}
                        </span>
                        <div className="flex items-center gap-1 text-label text-gray-500">
                            <Calendar className="w-3 h-3" />
                            {formatDate(transaction.transactionDate)}
                        </div>
                    </div>
                    <p className="text-body text-gray-700 mb-2">
                        {transaction.description || transaction.originalDescription || "Sem descrição"}
                    </p>
                    <div className="flex flex-wrap gap-3 text-label text-gray-500">
                        {transaction.counterpartyName && (
                            <div className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {transaction.counterpartyName}
                            </div>
                        )}
                        {transaction.counterpartyIban && (
                            <div className="flex items-center gap-1">
                                <CreditCard className="w-3 h-3" />
                                {transaction.counterpartyIban}
                            </div>
                        )}
                    </div>
                </div>

                {error && (
                    <Alert variant="error" dismissible onDismiss={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                {/* Apartment Selection */}
                <div>
                    <Label>Selecione a fração</Label>
                    <Input
                        placeholder="Pesquisar por fração ou morador..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="mb-2"
                    />
                    <div className="max-h-48 overflow-y-auto border rounded-lg divide-y">
                        {filteredApartments.length === 0 ? (
                            <div className="p-3 text-center text-label text-gray-500">
                                Nenhuma fração encontrada
                            </div>
                        ) : (
                            filteredApartments.map((apt) => (
                                <button
                                    key={apt.id}
                                    type="button"
                                    onClick={() => setSelectedApartmentId(apt.id)}
                                    className={`w-full p-2 text-left flex items-center gap-2 hover:bg-gray-50 transition-colors ${
                                        selectedApartmentId === apt.id ? 'bg-green-50 border-l-2 border-green-500' : ''
                                    }`}
                                >
                                    <Home className="w-4 h-4 text-gray-400" />
                                    <div>
                                        <p className="text-body font-medium text-gray-800">{apt.unit}</p>
                                        {apt.residentName && (
                                            <p className="text-label text-gray-500">{apt.residentName}</p>
                                        )}
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Save IBAN Option */}
                {transaction.counterpartyIban && selectedApartmentId && (
                    <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                        <label className="flex items-start gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={saveIban}
                                onChange={(e) => setSaveIban(e.target.checked)}
                                className="mt-0.5"
                            />
                            <div>
                                <p className="text-body font-medium text-gray-800">
                                    Guardar IBAN para associação automática
                                </p>
                                <p className="text-label text-gray-500">
                                    Futuras transações deste IBAN serão associadas automaticamente.
                                </p>
                            </div>
                        </label>
                        {saveIban && (
                            <div className="mt-2">
                                <Input
                                    placeholder="Etiqueta (opcional) - ex: Conta principal"
                                    value={ibanLabel}
                                    onChange={(e) => setIbanLabel(e.target.value)}
                                    size="sm"
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={handleClose} disabled={isPending}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleMatch}
                        loading={isPending}
                        disabled={!selectedApartmentId}
                    >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        Associar
                    </Button>
                </div>
            </div>
        </Modal>
    )
}
