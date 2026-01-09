"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { AlertCircle } from "lucide-react"
import {
    getResidentPaymentStatus,
    getApartmentPaymentStatus,
    getBuildingPaymentStatus,
    type PaymentStatusSummary
} from "@/app/actions/payment-status"
import { SkeletonCompactCard } from "@/components/ui/Skeleton"
import { PaymentStatusDisplay } from "./components/PaymentStatusDisplay"

interface PaymentStatusCardProps {
    userId?: string
    apartmentId?: number
    buildingId?: string
    className?: string
}

export function PaymentStatusCard({
    userId,
    apartmentId,
    buildingId,
    className
}: PaymentStatusCardProps) {
    const [data, setData] = useState<PaymentStatusSummary | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const controller = new AbortController()

        const loadStatus = async () => {
            setIsLoading(true)
            setError(null)

            let result
            try {
                if (buildingId) {
                    result = await getBuildingPaymentStatus(buildingId)
                } else if (userId) {
                    result = await getResidentPaymentStatus(userId)
                } else if (apartmentId) {
                    result = await getApartmentPaymentStatus(apartmentId)
                } else {
                    setError("Sem identificador definido")
                    setIsLoading(false)
                    return
                }

                if (controller.signal.aborted) return

                if (result.success) {
                    setData(result.data)
                } else {
                    setError(result.error)
                }
            } catch {
                if (controller.signal.aborted) return
                setError("Erro ao carregar dados")
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false)
                }
            }
        }

        loadStatus()
        return () => controller.abort()
    }, [userId, apartmentId, buildingId])

    if (isLoading) {
        return <SkeletonCompactCard className={className} />
    }

    if (error || !data) {
        // If it's a "No Unit" error for a manager, we might want to handle it gracefully,
        // but for now, showing the error in a small card is acceptable behavior.
        // We just ensure it doesn't break layout.
        return (
            <div className={cn("bg-gray-50 border border-gray-300 rounded-md p-4", className)}>
                <div className="flex items-center gap-3 text-gray-500">
                    <AlertCircle className="w-5 h-5" />
                    <p className="text-body">{error || "Erro ao carregar dados"}</p>
                </div>
            </div>
        )
    }

    return (
        <PaymentStatusDisplay
            data={data}
            className={className}
        />
    )
}

export default PaymentStatusCard