import { type ApartmentPaymentData } from "@/app/actions/extraordinary"

export type CellStatus = "paid" | "pending" | "late" | "partial"
export type ToolMode = "markPaid" | "markPending" | "toggle" | null

export interface ProjectSummary {
    id: number
    name: string
    totalBudget: number
    numInstallments: number
    startMonth: number
    startYear: number
    status: string
}

export interface ExtraPaymentGridProps {
    project: ProjectSummary
    payments: ApartmentPaymentData[]
    onRefresh?: () => void
    readOnly?: boolean
}
