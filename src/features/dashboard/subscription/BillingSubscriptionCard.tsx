"use client"

import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card"
import { CreditCard, Lock } from "lucide-react"
import { SubscribeButton, SyncSubscriptionButton } from "@/features/dashboard/subscription/SubscribeButton"
import { type SubscriptionStatus } from "@/lib/types"
import { DEFAULT_SUBSCRIPTION_PRICE_PER_UNIT } from "@/lib/constants"

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
    pricePerUnit = DEFAULT_SUBSCRIPTION_PRICE_PER_UNIT,
}: BillingSubscriptionCardProps) {
    const isActive = subscriptionStatus === 'active'

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    <CreditCard className="w-4 h-4" />
                    Subscrição de Serviço de Faturação
                </CardTitle>
                {isActive ? (
                    <span className="status-badge status-active">Subscrição Ativa</span>
                ) : (
                    <span className="status-badge status-alert">A Aguardar Sincronização</span>
                )}
            </CardHeader>
            <div className="p-0">
                <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] md:grid-cols-[140px_1fr] border-b border-slate-100">
                    <div className="label-col border-none text-label sm:text-body">Estado</div>
                    <div className="value-col border-none px-3 py-2">
                        <span className={`text-body font-bold uppercase ${isActive ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {subscriptionStatus || "Incompleto"}
                        </span>
                    </div>
                </div>

                <div className="p-4 bg-slate-50/50">
                    {isActive ? (
                        <div className="space-y-2">
                            <p className="text-body text-slate-600 uppercase font-bold tracking-tight">Subscrição Ativa</p>
                            <p className="text-body text-slate-500">Todas as funcionalidades estão desbloqueadas.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-amber-50 border border-amber-100 p-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <Lock className="w-4 h-4 text-amber-600" />
                                    <span className="text-body font-bold text-amber-800 uppercase">Funcionalidades Bloqueadas</span>
                                </div>
                                <p className="text-label text-amber-700 uppercase leading-tight">Subscreva para desbloquear todas as funcionalidades.</p>
                            </div>

                            {canSubscribe ? (
                                <div className="flex flex-col gap-4">
                                    <SubscribeButton buildingId={buildingId} quantity={totalApartments || 1} pricePerUnit={pricePerUnit} />
                                    <SyncSubscriptionButton buildingId={buildingId} />
                                </div>
                            ) : (
                                <div className="p-3 tech-border border-dashed text-center">
                                    <p className="text-label text-slate-400 font-bold uppercase tracking-widest">
                                        [ {!profileComplete ? "Valide o seu perfil" : !buildingComplete ? "Valide o edifício" : "Insira todas as frações"} para ativar a faturação ]
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <CardFooter>
                Processado por Stripe
            </CardFooter>
        </Card>
    )
}
