"use client"

import { Button } from "@/components/ui/Button"
import { createCheckoutSession, syncSubscriptionStatus } from "@/app/actions/stripe"
import { useTransition, useState } from "react"
import { RefreshCw, CheckCircle, AlertCircle } from "lucide-react"
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
                if (result.success && result.url) {
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
            <div className="flex justify-between items-center bg-slate-50 p-3 tech-border">
                <div>
                    <p className="text-label font-bold text-slate-400 uppercase tracking-widest">Cálculo Total</p>
                    <p className="text-body text-slate-600 font-mono">{quantity} UNITS × €{(pricePerUnit / 100).toFixed(2)}</p>
                </div>
                <p className="text-xl font-bold font-mono text-slate-900">€{total}</p>
            </div>

            <Button
                onClick={handleSubscribe}
                disabled={isPending}
                fullWidth
                size="lg"
                variant="primary"
                className="h-12 text-sm tracking-widest"
            >
                {isPending ? "A redirecionar..." : "CONFIRMAR SUBSCRIÇÃO"}
            </Button>
            <p className="text-micro text-center text-slate-400 uppercase font-bold tracking-tighter">*valor sujeito a IVA*</p>
            <p className="text-micro text-center text-slate-400 uppercase font-bold tracking-tighter">Transação Segura via Stripe</p>
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
        <div className="p-3 bg-blue-50/50 tech-border border-blue-100 max-w-sm">
            <div className="flex items-start gap-3">
                <RefreshCw className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="flex-1">
                    <p className="text-body font-bold text-blue-900 uppercase">A Aguardar Sincronização</p>
                    <p className="text-label text-blue-700/70 mb-2 uppercase tracking-tight">
                        Se o pagamento foi concluído mas o estado não alterou, force a sincronização.
                    </p>
                    <Button
                        size="xs"
                        variant="outline"
                        onClick={handleSync}
                        disabled={isPending}
                        className="text-blue-700 border-blue-200 hover:bg-blue-100"
                    >
                        {isPending ? "A sincronizar..." : "Sincronizar Pagamento"}
                    </Button>
                    {result && (
                        <div className={`mt-2 flex items-center gap-1 text-label font-bold uppercase ${result.status === 'active' ? 'text-green-700' : 'text-amber-700'}`}>
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
