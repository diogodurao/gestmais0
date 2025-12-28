"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Layers, TrendingDown, TrendingUp } from "lucide-react"
import { getResidentExtraordinaryPayments, type ResidentProjectPayment } from "@/app/actions/extraordinary"

interface ResidentExtraPaymentsProps {
    userId: string
    apartmentId: number
}

export function ResidentExtraPayments({ userId, apartmentId }: ResidentExtraPaymentsProps) {
    const [payments, setPayments] = useState<ResidentProjectPayment[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        let isMounted = true
        const controller = new AbortController()

        const loadPayments = async () => {
            try {
                // The action infers the resident's apartment from the session
                const result = await getResidentExtraordinaryPayments()
                if (isMounted && result.success && result.data) {
                    setPayments(result.data)
                }
            } catch (error) {
                if (!controller.signal.aborted) {
                    console.error("Failed to load payments", error)
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
    }, []) // Dependency array empty as we don't depend on props for the fetch anymore

    // balance corresponds to the pending amount
    const totalDebt = payments.reduce((sum, p) => sum + p.balance, 0)
    const totalPaid = payments.reduce((sum, p) => sum + p.totalPaid, 0)

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    <Layers className="w-3.5 h-3.5" />
                    As Minhas Quotas Extraordinárias
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 border-b border-slate-100">
                    <div className="p-4 border-r border-slate-100 text-center">
                        <div className="flex items-center justify-center gap-1 text-rose-500 mb-1">
                            <TrendingDown className="w-3 h-3" />
                            <span className="text-[10px] font-bold uppercase">Total em Dívida</span>
                        </div>
                        <div className="text-xl font-bold font-mono text-rose-600">
                            {(totalDebt / 100).toLocaleString("pt-PT", {
                                style: "currency",
                                currency: "EUR"
                            })}
                        </div>
                    </div>
                    <div className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1 text-emerald-500 mb-1">
                            <TrendingUp className="w-3 h-3" />
                            <span className="text-[10px] font-bold uppercase">Total Pago</span>
                        </div>
                        <div className="text-xl font-bold font-mono text-emerald-600">
                            {(totalPaid / 100).toLocaleString("pt-PT", {
                                style: "currency",
                                currency: "EUR"
                            })}
                        </div>
                    </div>
                </div>

                {/* Project List */}
                {isLoading ? (
                    <div className="p-8 text-center">
                        <div className="animate-pulse text-[10px] text-slate-400 uppercase">
                            A carregar...
                        </div>
                    </div>
                ) : payments.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="text-xs text-slate-400">
                            Não existem projetos extraordinários ativos ou passados neste condomínio.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {payments.map((payment, idx) => (
                            <div key={idx} className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-bold text-slate-700 uppercase">
                                        {payment.projectName}
                                    </h3>
                                    <span className={`text-xs font-bold font-mono ${payment.balance > 0 ? "text-rose-600" : "text-emerald-600"
                                        }`}>
                                        {payment.balance > 0
                                            ? `-${(payment.balance / 100).toLocaleString("pt-PT", { style: "currency", currency: "EUR" })}`
                                            : "Liquidado"}
                                    </span>
                                </div>

                                <div className="flex gap-1 flex-wrap">
                                    {payment.installments.map((inst, instIdx) => (
                                        <span
                                            key={instIdx}
                                            className={`text-[9px] font-mono px-1.5 py-0.5 ${inst.status === "paid"
                                                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                                : inst.status === "overdue"
                                                    ? "bg-rose-50 text-rose-600 border border-rose-100"
                                                    : "bg-slate-50 text-slate-500 border border-slate-200"
                                                }`}
                                        >
                                            {inst.month}/{inst.year}
                                        </span>
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