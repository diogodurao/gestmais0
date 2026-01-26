"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Layers, TrendingDown, TrendingUp } from "lucide-react"
import { getResidentExtraordinaryPayments, type ResidentProjectPayment } from "@/lib/actions/extraordinary-projects"
import { formatCurrency } from "@/lib/format"
import { useToast } from "@/components/ui/Toast"
import { Skeleton } from "@/components/ui/Skeleton"

export function ResidentExtraPayments() {
    const [payments, setPayments] = useState<ResidentProjectPayment[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const { addToast } = useToast()

    useEffect(() => {
        let isMounted = true
        const controller = new AbortController()

        const loadPayments = async () => {
            try {
                const result = await getResidentExtraordinaryPayments()
                if (isMounted && result.success && result.data) {
                    setPayments(result.data)
                }
            } catch (error) {
                if (!controller.signal.aborted) {
                    addToast({
                        variant: "error",
                        title: "Erro",
                        description: "Não foi possível carregar os dados. Por favor tente novamente."
                    })
                }
            } finally {
                if (isMounted) setIsLoading(false)
            }
        }

        loadPayments()

        return () => {
            isMounted = false
            controller.abort()
        }
    }, [])

    const totalDebt = payments.reduce((sum, p) => sum + p.balance, 0)
    const totalPaid = payments.reduce((sum, p) => sum + p.totalPaid, 0)

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    <Layers className="w-4 h-4" />
                    As Minhas Quotas Extraordinárias
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 border-b border-gray-200">
                    <div className="p-1.5 border-r border-gray-200 text-center">
                        <div className="flex items-center justify-center gap-1 text-error mb-0.5">
                            <TrendingDown className="w-3 h-3" />
                            <span className="text-label font-medium uppercase">Total em Dívida</span>
                        </div>
                        <div className="text-body font-bold font-mono text-error">
                            {formatCurrency(totalDebt)}
                        </div>
                    </div>
                    <div className="p-1.5 text-center">
                        <div className="flex items-center justify-center gap-1 text-primary-dark mb-0.5">
                            <TrendingUp className="w-3 h-3" />
                            <span className="text-label font-medium uppercase">Total Pago</span>
                        </div>
                        <div className="text-body font-bold font-mono text-primary-dark">
                            {formatCurrency(totalPaid)}
                        </div>
                    </div>
                </div>

                {/* Project List */}
                {isLoading ? (
                    <div className="p-1.5 space-y-1.5">
                        {[1, 2].map((i) => (
                            <div key={i} className="space-y-1">
                                <div className="flex justify-between">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-4 w-20" />
                                </div>
                                <div className="flex gap-1">
                                    <Skeleton className="h-5 w-16" />
                                    <Skeleton className="h-5 w-16" />
                                    <Skeleton className="h-5 w-16" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : payments.length === 0 ? (
                    <div className="p-4 text-center">
                        <p className="text-body text-gray-400">
                            Não existem projetos extraordinários ativos ou passados neste condomínio.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {payments.map((payment, idx) => (
                            <div key={idx} className="p-1.5">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="text-body font-medium text-gray-700">
                                        {payment.projectName}
                                    </h3>
                                    <span className={`text-label font-bold font-mono ${payment.balance > 0 ? "text-error" : "text-primary-dark"}`}>
                                        {payment.balance > 0
                                            ? `-${formatCurrency(payment.balance)}`
                                            : "Liquidado"}
                                    </span>
                                </div>

                                <div className="flex gap-1 flex-wrap">
                                    {payment.installments.map((inst, instIdx) => (
                                        <Badge
                                            key={instIdx}
                                            variant={
                                                inst.status === "paid"
                                                    ? "success"
                                                    : inst.status === "late"
                                                        ? "error"
                                                        : "default"
                                            }
                                            size="sm"
                                        >
                                            {inst.month}/{inst.year}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
