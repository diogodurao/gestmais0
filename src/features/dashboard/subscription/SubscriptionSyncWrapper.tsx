"use client"

import { Suspense } from "react"
import { SubscriptionSyncHandler } from "./SubscriptionSyncHandler"

export function SubscriptionSyncWrapper({ buildingId }: { buildingId: string | null }) {
    return (
        <Suspense fallback={null}>
            <SubscriptionSyncHandler buildingId={buildingId} />
        </Suspense>
    )
}