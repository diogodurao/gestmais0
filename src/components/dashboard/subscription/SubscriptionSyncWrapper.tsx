"use client"

import { Suspense } from "react"
import { SubscriptionSyncHandler } from "./SubscriptionSyncHandler"
import { ErrorBoundary } from "@/components/ErrorBoundary"

export function SubscriptionSyncWrapper({ buildingId }: { buildingId: string | null }) {
    return (
        <Suspense fallback={null}>
            <ErrorBoundary fallback={null}>
                <SubscriptionSyncHandler buildingId={buildingId} />
            </ErrorBoundary>
        </Suspense>
    )
}