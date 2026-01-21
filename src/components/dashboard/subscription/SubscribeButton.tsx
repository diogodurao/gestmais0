"use client"

import { Button } from "@/components/ui/Button"
import { createCheckoutSession, syncSubscriptionStatus, createBillingPortalSession } from "@/lib/actions/stripe"
import { useTransition, useState } from "react"
import { RefreshCw, CheckCircle, AlertCircle, CreditCard } from "lucide-react"
import { useRouter } from "next/navigation"

interface SubscribeButtonProps {
    buildingId: string
    quantity: number
    pricePerUnit: number // in cents
}

export function SubscribeButton({ buildingId, quantity, pricePerUnit }: SubscribeButtonProps) {
    const [isPending, startTransition] = useTransition()

    const handleSubscribe = () => {
        startTransition(async (): Promise<void> => {
            try {
                const result = await createCheckoutSession(buildingId)
                if (result.success) {
                    window.location.href = result.url
                } else {
                    alert(result.error || "Falha ao realizar pagamento. Por favor tente novamente.")
                }
            } catch (error) {
                console.error("Subscription failed:", error)
                alert("Ocorreu um erro inesperado. Por favor tente novamente.")
            }
        })
    }

    const total = ((quantity * pricePerUnit) / 100).toFixed(2);

    return (
        <div className="space-y-3 w-full max-w-sm">
            <div className="flex justify-between items-center bg-gray-50 p-3 tech-border">
                <div>
                    <p className="text-label font-bold text-gray-400 uppercase tracking-widest">Cálculo Total</p>
                    <p className="text-body text-gray-600 font-mono">{quantity} UNITS × €{(pricePerUnit / 100).toFixed(2)}</p>
                </div>
                <p className="text-xl font-bold font-mono text-gray-900">€{total}</p>
            </div>

            <Button
                onClick={handleSubscribe}
                disabled={isPending}
                size="md"
                variant="primary"
                className="w-full h-12 text-sm tracking-widest"
            >
                {isPending ? "A redirecionar..." : "CONFIRMAR SUBSCRIÇÃO"}
            </Button>
            <p className="text-micro text-center text-gray-400 uppercase font-bold tracking-tighter">*valor sujeito a IVA*</p>
            <p className="text-micro text-center text-gray-400 uppercase font-bold tracking-tighter">Transação Segura via Stripe</p>
        </div>
    )
}

interface SyncSubscriptionButtonProps {
    buildingId: string
}

export function SyncSubscriptionButton({ buildingId }: SyncSubscriptionButtonProps) {
    const [isPending, startTransition] = useTransition()
    const [result, setResult] = useState<{ status?: string; message?: string } | null>(null)
    const router = useRouter()

    const handleSync = () => {
        setResult(null)
        startTransition(async (): Promise<void> => {
            try {
                const res = await syncSubscriptionStatus(buildingId)
                setResult({ status: res.status ?? undefined, message: res.message })
                if (res.status === 'active') {
                    router.refresh()
                }
            } catch (error) {
                const msg = error instanceof Error ? error.message : "Unknown error"
                setResult({ status: 'error', message: msg })
            }
        })
    }

    return (
        <div className="p-3 bg-info-light/50 tech-border border-gray-200 max-w-sm">
            <div className="flex items-start gap-3">
                <RefreshCw className="w-4 h-4 text-info mt-0.5" />
                <div className="flex-1">
                    <p className="text-body font-bold text-info uppercase">A Aguardar Sincronização</p>
                    <p className="text-label text-info/70 mb-2 uppercase tracking-tight">
                        Se o pagamento foi concluído mas o estado não alterou, force a sincronização.
                    </p>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleSync}
                        disabled={isPending}
                        className="text-info border-gray-200 hover:bg-info-light"
                    >
                        {isPending ? "A sincronizar..." : "Sincronizar Pagamento"}
                    </Button>
                    {result && (
                        <div className={`mt-2 flex items-center gap-1 text-label font-bold uppercase ${result.status === 'active' ? 'text-success' : 'text-warning'}`}>
                            {result.status === 'active' ? (
                                <><CheckCircle className="w-3 h-3" /> Estado: Ativo</>
                            ) : (
                                <><AlertCircle className="w-3 h-3" /> {result.message || "Sem sessão encontrada"}</>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

interface ManageSubscriptionButtonProps {
    buildingId: string
    variant?: "default" | "urgent"
}

export function ManageSubscriptionButton({ buildingId, variant = "default" }: ManageSubscriptionButtonProps) {
    const [isPending, startTransition] = useTransition()

    const handleManage = () => {
        startTransition(async (): Promise<void> => {
            try {
                const result = await createBillingPortalSession(buildingId)
                if (result.success) {
                    window.location.href = result.url
                } else {
                    alert(result.error || "Falha ao abrir portal de pagamento.")
                }
            } catch (error) {
                console.error("Failed to open billing portal:", error)
                alert("Ocorreu um erro inesperado. Por favor tente novamente.")
            }
        })
    }

    return (
        <Button
            onClick={handleManage}
            disabled={isPending}
            size="sm"
            variant="outline"
            className={variant === "urgent"
                ? "gap-1.5 bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                : "gap-1.5"
            }
        >
            <CreditCard className="w-3.5 h-3.5" />
            {isPending ? "A abrir..." : "Atualizar Pagamento"}
        </Button>
    )
}