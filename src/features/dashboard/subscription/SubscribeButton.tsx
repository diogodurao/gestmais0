"use client"

import { Button } from "@/components/ui/Button"
import { createCheckoutSession, syncSubscriptionStatus } from "@/app/actions/stripe"
import { useTransition, useState } from "react"
import { RefreshCw, CheckCircle, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { t } from "@/lib/translations"

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
                const url = await createCheckoutSession(buildingId)
                if (url) {
                    window.location.href = url
                }
            } catch (error) {
                console.error("Subscription failed:", error)
                alert("Failed to start checkout. Please try again.")
            }
        })
    }

    const total = ((quantity * pricePerUnit) / 100).toFixed(2);

    return (
        <div className="space-y-3 w-full max-w-sm">
            <div className="flex justify-between items-center bg-slate-50 p-3 tech-border">
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.subscription.totalCalculation}</p>
                    <p className="text-[11px] text-slate-600 font-mono">{quantity} UNITS × €{(pricePerUnit / 100).toFixed(2)}</p>
                </div>
                <p className="text-xl font-bold font-mono text-slate-900">€{total}</p>
            </div>

            <Button
                onClick={handleSubscribe}
                disabled={isPending}
                fullWidth
                size="lg"
                className="h-12 text-sm tracking-widest"
            >
                {isPending ? t.subscription.redirecting : t.subscription.commitSubscription}
            </Button>
            <p className="text-[9px] text-center text-slate-400 uppercase font-bold tracking-tighter">{t.subscription.secureTransaction}</p>
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
                    <p className="text-[11px] font-bold text-blue-900 uppercase">{t.subscription.awaitingSync}</p>
                    <p className="text-[10px] text-blue-700/70 mb-2 uppercase tracking-tight">
                        If payment is complete but state is unchanged, trigger manual synchronization.
                    </p>
                    <Button
                        size="xs"
                        variant="outline"
                        onClick={handleSync}
                        disabled={isPending}
                        className="text-blue-700 border-blue-200 hover:bg-blue-100"
                    >
                        {isPending ? t.subscription.syncing : t.subscription.syncPayment}
                    </Button>
                    {result && (
                        <div className={`mt-2 flex items-center gap-1 text-[10px] font-bold uppercase ${result.status === 'active' ? 'text-green-700' : 'text-amber-700'}`}>
                            {result.status === 'active' ? (
                                <><CheckCircle className="w-3 h-3" /> {t.subscription.stateActive}</>
                            ) : (
                                <><AlertCircle className="w-3 h-3" /> {result.message || t.subscription.noSession}</>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
