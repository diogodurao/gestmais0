"use client"

import { formatCurrency } from "@/lib/format"
import { Card, CardContent } from "@/components/ui/Card"
import { Progress } from "@/components/ui/Progress"

interface BudgetProgressProps {
    totalCollected: number
    totalBudget: number
    progressPercent: number
}

export function BudgetProgress({ totalCollected, totalBudget, progressPercent }: BudgetProgressProps) {
    return (
        <Card className="mb-1.5">
            <CardContent>
                <div className="flex items-center justify-between mb-1">
                    <span className="text-label font-medium text-gray-500">Progresso do Orçamento</span>
                    <span className="text-body font-semibold text-gray-800">{progressPercent}%</span>
                </div>
                <Progress value={progressPercent} className="mb-1" />
                <div className="flex justify-between text-xs text-gray-500">
                    <span>Cobrado: <span className="font-medium text-primary-dark">{formatCurrency(totalCollected)}</span></span>
                    <span>Total: <span className="font-medium text-gray-700">{formatCurrency(totalBudget)}</span></span>
                </div>
            </CardContent>
        </Card>
    )
}
