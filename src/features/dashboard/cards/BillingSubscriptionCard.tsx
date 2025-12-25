"use client"

import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card"
import { CreditCard, Lock } from "lucide-react"
import { SubscribeButton, SyncSubscriptionButton } from "@/features/dashboard/subscription/SubscribeButton"

interface BillingSubscriptionCardProps {
    subscriptionStatus: string | null
    buildingId: string
    totalApartments?: number
    canSubscribe: boolean
    profileComplete: boolean
    buildingComplete: boolean
    pricePerUnit?: number
}

export function BillingSubscriptionCard({
    subscriptionStatus,
    buildingId,
    totalApartments = 0,
    canSubscribe,
    profileComplete,
    buildingComplete,
    pricePerUnit = 300
}: BillingSubscriptionCardProps) {
    const isActive = subscriptionStatus === 'active'

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    <CreditCard className="w-3.5 h-3.5" />
                    BILLING_SERVICE_SUBSCRIPTION
                </CardTitle>
                {isActive ? (
                    <span className="status-badge status-active">Live_Subscription</span>
                ) : (
                    <span className="status-badge status-alert">Awaiting_Sync</span>
                )}
            </CardHeader>
            <div className="p-0">
                <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] md:grid-cols-[140px_1fr] border-b border-slate-100">
                    <div className="label-col border-none text-[10px] sm:text-xs">Status</div>
                    <div className="value-col border-none px-3 py-2">
                        <span className={`text-[11px] font-bold uppercase ${isActive ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {subscriptionStatus || 'Incomplete'}
                        </span>
                    </div>
                </div>

                <div className="p-4 bg-slate-50/50">
                    {isActive ? (
                        <div className="space-y-2">
                            <p className="text-xs text-slate-600 uppercase font-bold tracking-tight">Subscription_Active</p>
                            <p className="text-[11px] text-slate-500">Your building features are fully unlocked. Billing cycle is managed via Stripe.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-amber-50 border border-amber-100 p-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                                    <span className="text-[11px] font-bold text-amber-800 uppercase">Feature_Lock_Active</span>
                                </div>
                                <p className="text-[10px] text-amber-700 uppercase leading-tight">Complete subscription to unlock resident management and financials.</p>
                            </div>

                            {canSubscribe ? (
                                <div className="flex flex-col gap-4">
                                    <SubscribeButton buildingId={buildingId} quantity={totalApartments || 1} pricePerUnit={pricePerUnit} />
                                    <SyncSubscriptionButton buildingId={buildingId} />
                                </div>
                            ) : (
                                <div className="p-3 tech-border border-dashed text-center">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                        [ {!profileComplete ? "VALIDATE_PROFILE" : !buildingComplete ? "VALIDATE_BUILDING" : "INSERT_ALL_UNITS"} TO_ENABLE_BILLING ]
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <CardFooter>
                POWERED_BY_STRIPE_CONNECT
            </CardFooter>
        </Card>
    )
}
