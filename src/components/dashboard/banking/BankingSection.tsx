"use client"

import { useState, useEffect, useTransition } from "react"
import { BankConnectionCard } from "./BankConnectionCard"
import { UnmatchedTransactionsList } from "./UnmatchedTransactionsList"
import { TransactionMatchModal } from "./TransactionMatchModal"
import { type BankConnectionSummary, type UnmatchedTransaction } from "@/lib/types"
import { getUnmatchedTransactions } from "@/lib/actions/banking"

interface Apartment {
    id: number
    unit: string
    residentName?: string | null
}

interface BankingSectionProps {
    buildingId: string
    connectionStatus: BankConnectionSummary | null
    apartments: Apartment[]
}

export function BankingSection({
    buildingId,
    connectionStatus,
    apartments,
}: BankingSectionProps) {
    const [transactions, setTransactions] = useState<UnmatchedTransaction[]>([])
    const [selectedTransaction, setSelectedTransaction] = useState<UnmatchedTransaction | null>(null)
    const [isPending, startTransition] = useTransition()

    // Load transactions when connection is active
    useEffect(() => {
        if (connectionStatus?.status === 'active') {
            loadTransactions()
        }
    }, [connectionStatus?.status])

    const loadTransactions = () => {
        startTransition(async () => {
            const result = await getUnmatchedTransactions(buildingId)
            if (result.success) {
                setTransactions(result.data)
            }
        })
    }

    const handleMatchTransaction = (tx: UnmatchedTransaction) => {
        setSelectedTransaction(tx)
    }

    const handleMatched = () => {
        setSelectedTransaction(null)
        loadTransactions()
    }

    return (
        <div className="space-y-4">
            <BankConnectionCard
                buildingId={buildingId}
                connectionStatus={connectionStatus}
            />

            {connectionStatus?.status === 'active' && (
                <UnmatchedTransactionsList
                    buildingId={buildingId}
                    initialTransactions={transactions}
                    onMatchTransaction={handleMatchTransaction}
                />
            )}

            <TransactionMatchModal
                isOpen={!!selectedTransaction}
                onClose={() => setSelectedTransaction(null)}
                transaction={selectedTransaction}
                buildingId={buildingId}
                apartments={apartments}
                onMatched={handleMatched}
            />
        </div>
    )
}
