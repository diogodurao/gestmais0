"use client"

import { useEffect, useState, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { syncSubscriptionStatus } from "@/app/actions/stripe"
import { CheckCircle, Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { TIMING } from "@/lib/constants/timing"

export function SubscriptionSyncHandler({ buildingId }: { buildingId: string | null }) {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [status, setStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState("")
    const [retryCount, setRetryCount] = useState(0)

    const isSuccess = searchParams.get('success') === 'true'

    const doSync = useCallback(async (): Promise<void> => {
        if (!buildingId) {
            setStatus('error')
            setMessage("No building ID found")
            return
        }

        setStatus('syncing')

        try {
            if (process.env.NODE_ENV === 'development') {
                console.log("[Sync] Starting sync for building:", buildingId)
            }
            const result = await syncSubscriptionStatus(buildingId)
            if (process.env.NODE_ENV === 'development') {
                console.log("[Sync] Result:", result)
            }

            if (result.status === 'active') {
                setStatus('success')
                setMessage("Subscription activated successfully!")

                // Force a hard navigation to clear query params and refresh data
                setTimeout(() => {
                    router.refresh()
                    router.push('/dashboard')
                }, TIMING.REDIRECT_DELAY)
            } else {
                setStatus('error')
                setMessage(result.message || "Subscription not yet active. Click retry to check again.")
            }
        } catch (error: any) {
            if (process.env.NODE_ENV === 'development') {
                console.error("[Sync] Error:", error)
            }
            setStatus('error')
            setMessage(error.message || "Failed to verify subscription. Click retry to try again.")
        }
    }, [buildingId, router])

    useEffect(() => {
        if (isSuccess && buildingId && status === 'idle') {
            // Initial delay to allow webhook to process
            const timer = setTimeout(() => {
                doSync()
            }, TIMING.SYNC_INITIAL_DELAY)

            return () => clearTimeout(timer)
        }
    }, [isSuccess, buildingId, status, doSync])

    const handleRetry = () => {
        setRetryCount(prev => prev + 1)
        doSync()
    }

    const handleManualRefresh = () => {
        router.refresh()
        router.push('/dashboard')
    }

    if (!isSuccess || !buildingId) return null

    return (
        <div className={`mb-6 p-4 rounded-lg border ${status === 'success'
            ? 'bg-green-50 border-green-200'
            : status === 'error'
                ? 'bg-amber-50 border-amber-200'
                : 'bg-blue-50 border-blue-200'
            }`}>
            <div className="flex items-start gap-3">
                {status === 'idle' || status === 'syncing' ? (
                    <>
                        <Loader2 className="w-5 h-5 text-blue-600 animate-spin shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="font-medium text-blue-900">Verifying your payment...</p>
                            <p className="text-sm text-blue-700">Please wait while we activate your subscription.</p>
                        </div>
                    </>
                ) : null}

                {status === 'success' && (
                    <>
                        <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="font-medium text-green-900">{message}</p>
                            <p className="text-sm text-green-700">Redirecting to your dashboard...</p>
                        </div>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="font-medium text-amber-900">Payment verification pending</p>
                            <p className="text-sm text-amber-700 mb-3">{message}</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleRetry}
                                    className="inline-flex items-center gap-1 text-sm bg-amber-100 text-amber-800 px-3 py-1.5 rounded-md hover:bg-amber-200 transition-colors"
                                >
                                    <RefreshCw className="w-3 h-3" />
                                    Retry ({retryCount})
                                </button>
                                <button
                                    onClick={handleManualRefresh}
                                    className="text-sm text-amber-700 underline hover:text-amber-900"
                                >
                                    Refresh page manually
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}