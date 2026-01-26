"use client"

import { useState, useTransition } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Alert } from "@/components/ui/Alert"
import { EmptyState } from "@/components/ui/Empty-State"
import {
    ArrowRightLeft,
    Ban,
    CheckCircle,
    User,
    Calendar,
    CreditCard,
    RefreshCw,
} from "lucide-react"
import { type UnmatchedTransaction } from "@/lib/types"
import {
    ignoreTransaction,
    runIbanMatching,
    getUnmatchedTransactions,
} from "@/lib/actions/banking"
import { formatCurrency, formatRelativeTime } from "@/lib/utils"
import { ConfirmModal } from "@/components/ui/ConfirmModal"

interface UnmatchedTransactionsListProps {
    buildingId: string
    initialTransactions: UnmatchedTransaction[]
    onMatchTransaction?: (transaction: UnmatchedTransaction) => void
}

export function UnmatchedTransactionsList({
    buildingId,
    initialTransactions,
    onMatchTransaction,
}: UnmatchedTransactionsListProps) {
    const [transactions, setTransactions] = useState(initialTransactions)
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [ignoreModalTx, setIgnoreModalTx] = useState<UnmatchedTransaction | null>(null)

    const handleIgnore = (tx: UnmatchedTransaction) => {
        setIgnoreModalTx(tx)
    }

    const confirmIgnore = () => {
        if (!ignoreModalTx) return

        setError(null)
        startTransition(async () => {
            const result = await ignoreTransaction(ignoreModalTx.id, buildingId)
            if (result.success) {
                setTransactions(prev => prev.filter(t => t.id !== ignoreModalTx.id))
                setSuccess("Transação ignorada")
                setTimeout(() => setSuccess(null), 3000)
            } else {
                setError(result.error)
            }
            setIgnoreModalTx(null)
        })
    }

    const handleRunMatching = () => {
        setError(null)
        startTransition(async () => {
            const result = await runIbanMatching(buildingId)
            if (result.success) {
                // Refresh the list
                const refreshResult = await getUnmatchedTransactions(buildingId)
                if (refreshResult.success) {
                    setTransactions(refreshResult.data)
                }
                if (result.data > 0) {
                    setSuccess(`${result.data} transações associadas automaticamente`)
                    setTimeout(() => setSuccess(null), 3000)
                }
            } else {
                setError(result.error)
            }
        })
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString('pt-PT', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
    }

    if (transactions.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-1.5">
                        <ArrowRightLeft className="w-4 h-4" />
                        Transações por Associar
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <EmptyState
                        icon={<CheckCircle className="w-8 h-8 text-green-500" />}
                        title="Tudo associado"
                        description="Não existem transações por associar."
                    />
                </CardContent>
            </Card>
        )
    }

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2">
                    <CardTitle className="flex items-center gap-1.5">
                        <ArrowRightLeft className="w-4 h-4" />
                        Transações por Associar
                        <Badge variant="warning" size="md">{transactions.length}</Badge>
                    </CardTitle>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRunMatching}
                        loading={isPending}
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Associar por IBAN
                    </Button>
                </CardHeader>

                <CardContent className="space-y-3">
                    {error && (
                        <Alert variant="error" dismissible onDismiss={() => setError(null)}>
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert variant="success" dismissible onDismiss={() => setSuccess(null)}>
                            {success}
                        </Alert>
                    )}

                    <div className="space-y-2">
                        {transactions.map((tx) => (
                            <div
                                key={tx.id}
                                className="p-3 rounded-lg border border-gray-200 bg-gray-50 space-y-2"
                            >
                                {/* Header: Amount and Date */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-body font-semibold text-green-600">
                                            +{formatCurrency(tx.amount)}
                                        </span>
                                        <Badge variant="info" size="sm">
                                            {tx.type === 'credit' ? 'Crédito' : 'Débito'}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-1 text-label text-gray-500">
                                        <Calendar className="w-3 h-3" />
                                        {formatDate(tx.transactionDate)}
                                    </div>
                                </div>

                                {/* Description */}
                                <p className="text-body text-gray-700">
                                    {tx.description || tx.originalDescription || "Sem descrição"}
                                </p>

                                {/* Counterparty Info */}
                                <div className="flex flex-wrap gap-3 text-label text-gray-500">
                                    {tx.counterpartyName && (
                                        <div className="flex items-center gap-1">
                                            <User className="w-3 h-3" />
                                            {tx.counterpartyName}
                                        </div>
                                    )}
                                    {tx.counterpartyIban && (
                                        <div className="flex items-center gap-1">
                                            <CreditCard className="w-3 h-3" />
                                            {tx.counterpartyIban}
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-1">
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() => onMatchTransaction?.(tx)}
                                        disabled={isPending}
                                    >
                                        <ArrowRightLeft className="w-3 h-3" />
                                        Associar
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleIgnore(tx)}
                                        disabled={isPending}
                                        className="text-gray-500"
                                    >
                                        <Ban className="w-3 h-3" />
                                        Ignorar
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Ignore Confirmation Modal */}
            <ConfirmModal
                isOpen={!!ignoreModalTx}
                onCancel={() => setIgnoreModalTx(null)}
                onConfirm={confirmIgnore}
                title="Ignorar transação"
                message={`Tem a certeza que deseja ignorar esta transação de ${ignoreModalTx ? formatCurrency(ignoreModalTx.amount) : ''}? Esta ação pode ser revertida mais tarde.`}
                confirmText="Ignorar"
                cancelText="Cancelar"
                variant="warning"
                loading={isPending}
            />
        </>
    )
}
