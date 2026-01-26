"use client"

import { useState, useTransition } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card"
import { BadgeWithDot } from "@/components/ui/Badge"
import { Alert } from "@/components/ui/Alert"
import { Button } from "@/components/ui/Button"
import { Landmark, RefreshCw, Unlink, ExternalLink } from "lucide-react"
import { type BankConnectionSummary, type BankConnectionStatus } from "@/lib/types"
import {
    initiateBankConnection,
    syncBankData,
    disconnectBank,
} from "@/lib/actions/banking"
import { formatCurrency, formatRelativeTime } from "@/lib/utils"
import { ConfirmModal } from "@/components/ui/ConfirmModal"

type StateConfig = {
    cardVariant: "default" | "success" | "warning" | "error"
    badgeVariant: "info" | "success" | "warning" | "error"
    badgeText: string
    alertVariant: "info" | "success" | "warning" | "error"
    alertMessage: string
}

const stateConfigs: Record<BankConnectionStatus | "none", StateConfig> = {
    none: {
        cardVariant: "default",
        badgeVariant: "info",
        badgeText: "Não ligado",
        alertVariant: "info",
        alertMessage: "Ligue a conta bancária do condomínio para sincronizar transações automaticamente.",
    },
    pending: {
        cardVariant: "default",
        badgeVariant: "warning",
        badgeText: "Pendente",
        alertVariant: "warning",
        alertMessage: "A ligação está pendente. Complete a autenticação no banco.",
    },
    active: {
        cardVariant: "success",
        badgeVariant: "success",
        badgeText: "Ativo",
        alertVariant: "success",
        alertMessage: "Conta bancária ligada. Sincronize para obter as últimas transações.",
    },
    expired: {
        cardVariant: "warning",
        badgeVariant: "warning",
        badgeText: "Expirado",
        alertVariant: "warning",
        alertMessage: "A ligação expirou. Reconecte a conta bancária para continuar.",
    },
    revoked: {
        cardVariant: "error",
        badgeVariant: "error",
        badgeText: "Revogado",
        alertVariant: "error",
        alertMessage: "A ligação foi revogada. Reconecte a conta bancária.",
    },
    error: {
        cardVariant: "error",
        badgeVariant: "error",
        badgeText: "Erro",
        alertVariant: "error",
        alertMessage: "Ocorreu um erro com a ligação. Tente reconectar.",
    },
}

interface BankConnectionCardProps {
    buildingId: string
    connectionStatus: BankConnectionSummary | null
}

export function BankConnectionCard({ buildingId, connectionStatus }: BankConnectionCardProps) {
    const [isPending, startTransition] = useTransition()
    const [showDisconnectModal, setShowDisconnectModal] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const status: BankConnectionStatus | "none" = connectionStatus?.status || "none"
    const config = stateConfigs[status]

    const handleConnect = () => {
        setError(null)
        startTransition(async () => {
            const result = await initiateBankConnection(buildingId)
            if (result.success) {
                // Redirect to Tink Link
                window.location.href = result.data.authUrl
            } else {
                setError(result.error)
            }
        })
    }

    const handleSync = () => {
        setError(null)
        startTransition(async () => {
            const result = await syncBankData(buildingId)
            if (!result.success) {
                setError(result.error)
            }
        })
    }

    const handleDisconnect = () => {
        setError(null)
        startTransition(async () => {
            const result = await disconnectBank(buildingId)
            if (result.success) {
                setShowDisconnectModal(false)
            } else {
                setError(result.error)
            }
        })
    }

    const renderNotConnectedContent = () => (
        <div className="space-y-4">
            <div className="p-4 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 text-center">
                <Landmark className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-body text-gray-600 mb-1">
                    Ligue a conta bancária do condomínio
                </p>
                <p className="text-label text-gray-400">
                    As transações serão importadas e associadas automaticamente às frações
                </p>
            </div>
            <Button onClick={handleConnect} loading={isPending} className="w-full">
                <ExternalLink className="w-3.5 h-3.5" />
                Ligar conta bancária
            </Button>
        </div>
    )

    const renderConnectedContent = () => (
        <div className="space-y-4">
            {/* Connection Info */}
            <div className="grid grid-cols-2 gap-3">
                <div className="p-2 rounded-lg bg-gray-50">
                    <p className="text-label text-gray-500 mb-0.5">Banco</p>
                    <p className="text-body font-medium text-gray-800">
                        {connectionStatus?.providerName || "Desconhecido"}
                    </p>
                </div>
                <div className="p-2 rounded-lg bg-gray-50">
                    <p className="text-label text-gray-500 mb-0.5">Contas</p>
                    <p className="text-body font-medium text-gray-800">
                        {connectionStatus?.accountCount || 0}
                    </p>
                </div>
                <div className="p-2 rounded-lg bg-gray-50">
                    <p className="text-label text-gray-500 mb-0.5">Saldo Total</p>
                    <p className="text-body font-medium text-gray-800">
                        {formatCurrency(connectionStatus?.totalBalance || 0)}
                    </p>
                </div>
                <div className="p-2 rounded-lg bg-gray-50">
                    <p className="text-label text-gray-500 mb-0.5">Última Sincronização</p>
                    <p className="text-body font-medium text-gray-800" suppressHydrationWarning>
                        {connectionStatus?.lastSyncAt
                            ? formatRelativeTime(connectionStatus.lastSyncAt)
                            : "Nunca"}
                    </p>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                <Button onClick={handleSync} loading={isPending} variant="outline" className="flex-1">
                    <RefreshCw className="w-3.5 h-3.5" />
                    Sincronizar
                </Button>
                <Button
                    onClick={() => setShowDisconnectModal(true)}
                    variant="ghost"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                    <Unlink className="w-3.5 h-3.5" />
                </Button>
            </div>
        </div>
    )

    const renderExpiredContent = () => (
        <div className="space-y-4">
            <p className="text-body text-gray-600">
                A ligação com o banco expirou. Reconecte para continuar a sincronizar transações.
            </p>
            <Button onClick={handleConnect} loading={isPending} className="w-full">
                <ExternalLink className="w-3.5 h-3.5" />
                Reconectar
            </Button>
        </div>
    )

    const renderContent = () => {
        switch (status) {
            case "active":
                return renderConnectedContent()
            case "expired":
            case "revoked":
            case "error":
                return renderExpiredContent()
            default:
                return renderNotConnectedContent()
        }
    }

    return (
        <>
            <Card variant={config.cardVariant}>
                <CardHeader className="flex flex-row items-center justify-between gap-2">
                    <CardTitle className="flex items-center gap-1.5">
                        <Landmark className="w-4 h-4" />
                        Open Banking
                    </CardTitle>
                    <BadgeWithDot variant={config.badgeVariant} size="md">
                        {config.badgeText}
                    </BadgeWithDot>
                </CardHeader>

                <CardContent className="space-y-4">
                    <Alert variant={config.alertVariant}>
                        {config.alertMessage}
                    </Alert>

                    {error && (
                        <Alert variant="error" dismissible onDismiss={() => setError(null)}>
                            {error}
                        </Alert>
                    )}

                    {renderContent()}
                </CardContent>

                <CardFooter className="text-label text-gray-400">
                    Processado por Tink
                </CardFooter>
            </Card>

            {/* Disconnect Confirmation Modal */}
            <ConfirmModal
                isOpen={showDisconnectModal}
                onCancel={() => setShowDisconnectModal(false)}
                onConfirm={handleDisconnect}
                title="Desligar conta bancária"
                message="Tem a certeza que deseja desligar a conta bancária? As transações já importadas serão mantidas, mas não serão sincronizadas novas transações."
                confirmText="Desligar"
                cancelText="Cancelar"
                variant="danger"
                loading={isPending}
            />
        </>
    )
}
