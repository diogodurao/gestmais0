"use client"

import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card"
import { CreditCard, Lock } from "lucide-react"
import { SubscribeButton, SyncSubscriptionButton } from "@/features/dashboard/subscription/SubscribeButton"
import { Dictionary } from "@/types/i18n"

interface BillingSubscriptionCardProps {
    subscriptionStatus: string | null
    buildingId: string
    totalApartments?: number
    canSubscribe: boolean
    profileComplete: boolean
    buildingComplete: boolean
    pricePerUnit?: number
    dictionary: Dictionary
}

export function BillingSubscriptionCard({
    subscriptionStatus,
    buildingId,
    totalApartments = 0,
    canSubscribe,
    profileComplete,
    buildingComplete,
    pricePerUnit = 300,
    dictionary
}: BillingSubscriptionCardProps) {
    const isActive = subscriptionStatus === 'active'

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    <CreditCard className="w-3.5 h-3.5" />
                    {dictionary.subscription.billingServiceSubscription}
                </CardTitle>
                {isActive ? (
                    <span className="status-badge status-active">{dictionary.subscription.liveSubscription}</span>
                ) : (
                    <span className="status-badge status-alert">{dictionary.subscription.awaitingSyncBadge}</span>
                )}
            </CardHeader>
            <div className="p-0">
                <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] md:grid-cols-[140px_1fr] border-b border-slate-100">
                    <div className="label-col border-none text-[10px] sm:text-xs">{dictionary.subscription.colStatus}</div>
                    <div className="value-col border-none px-3 py-2">
                        <span className={`text-[11px] font-bold uppercase ${isActive ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {subscriptionStatus || dictionary.subscription.statusIncomplete}
                        </span>
                    </div>
                </div>

                <div className="p-4 bg-slate-50/50">
                    {isActive ? (
                        <div className="space-y-2">
                            <p className="text-xs text-slate-600 uppercase font-bold tracking-tight">{dictionary.subscription.subscriptionActive}</p>
                            <p className="text-[11px] text-slate-500">{dictionary.subscription.featureUnlockMessage}</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-amber-50 border border-amber-100 p-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                                    <span className="text-[11px] font-bold text-amber-800 uppercase">{dictionary.subscription.featureLockActive}</span>
                                </div>
                                <p className="text-[10px] text-amber-700 uppercase leading-tight">{dictionary.subscription.subscribeUnlockMessage}</p>
                            </div>

                            {canSubscribe ? (
                                <div className="flex flex-col gap-4">
                                    <SubscribeButton buildingId={buildingId} quantity={totalApartments || 1} pricePerUnit={pricePerUnit} dictionary={dictionary} />
                                    <SyncSubscriptionButton buildingId={buildingId} dictionary={dictionary} />
                                </div>
                            ) : (
                                <div className="p-3 tech-border border-dashed text-center">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                        [ {!profileComplete ? dictionary.subscription.validateProfile : !buildingComplete ? dictionary.subscription.validateBuilding : dictionary.subscription.insertAllUnits} {dictionary.subscription.toEnableBilling} ]
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <CardFooter>
                {dictionary.subscription.poweredByStripe}
            </CardFooter>
        </Card>
    )
}
