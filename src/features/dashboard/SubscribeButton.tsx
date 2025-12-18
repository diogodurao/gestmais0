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
    const router = useRouter()

    const handleSubscribe = () => {
        startTransition(async () => {
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
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-md border border-gray-100">
                <div>
                    <p className="font-medium text-gray-900">Total Calculation</p>
                    <p className="text-sm text-gray-500">{quantity} Units × €{(pricePerUnit / 100).toFixed(2)}</p>
                </div>
                <p className="text-2xl font-bold">€{total}</p>
            </div>

            <Button
                onClick={handleSubscribe}
                disabled={isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 text-lg"
            >
                {isPending ? "Redirecting..." : "Subscrever"}
            </Button>
            <p className="text-xs text-center text-gray-400">Secure payment via Stripe</p>
        </div>
    )
}

// Separate component for syncing subscription status (after payment)
interface SyncSubscriptionButtonProps {
    buildingId: string
}

export function SyncSubscriptionButton({ buildingId }: SyncSubscriptionButtonProps) {
    const [isPending, startTransition] = useTransition()
    const [result, setResult] = useState<{ status?: string; message?: string } | null>(null)
    const router = useRouter()

    const handleSync = () => {
        setResult(null)
        startTransition(async () => {
            try {
                const res = await syncSubscriptionStatus(buildingId)
                setResult({ status: res.status ?? undefined, message: res.message })
                if (res.status === 'active') {
                    router.refresh()
                }
            } catch (error: any) {
                setResult({ status: 'error', message: error.message })
            }
        })
    }

    return (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
            <div className="flex items-start gap-3">
                <RefreshCw className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900">Already paid?</p>
                    <p className="text-xs text-blue-700 mb-2">
                        If you completed payment but the status hasn&apos;t updated, click below to sync.
                    </p>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleSync}
                        disabled={isPending}
                        className="text-blue-700 border-blue-200 hover:bg-blue-100"
                    >
                        {isPending ? (
                            <>
                                <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                                Syncing...
                            </>
                        ) : (
                            "Sync Payment Status"
                        )}
                    </Button>
                    {result && (
                        <div className={`mt-2 flex items-center gap-1 text-xs ${result.status === 'active' ? 'text-green-700' : 'text-amber-700'}`}>
                            {result.status === 'active' ? (
                                <>
                                    <CheckCircle className="w-3 h-3" />
                                    Subscription activated!
                                </>
                            ) : (
                                <>
                                    <AlertCircle className="w-3 h-3" />
                                    {result.message || 'No active subscription found'}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
