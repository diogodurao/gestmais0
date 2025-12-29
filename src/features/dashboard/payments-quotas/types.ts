import { PaymentData } from "@/app/actions/payments"

/**
 * Payment status type - matches database schema
 * Fixed: 'overdue' changed to 'late' to match DB values
 */
export type PaymentStatus = "paid" | "pending" | "late" | "partial"

/**
 * Tool modes for the payment grid
 */
export type ToolType = "paid" | "late" | "clear" | null

/**
 * Filter modes for displaying payments
 */
export type FilterMode = "all" | "paid" | "late" | "pending"

/**
 * Map UI tool names to DB status values
 */
export const TOOL_TO_STATUS = {
    paid: 'paid',
    late: 'late',
    clear: 'pending',
} as const

/**
 * Stats calculated from payment data
 */
export interface PaymentStats {
    totalCollected: number
    totalOverdue: number
    paidCount: number
    overdueCount: number
    total: number
}

/**
 * Props for the main PaymentGrid component
 */
export interface PaymentGridProps {
    data: PaymentData[]
    monthlyQuota: number
    buildingId: string
    year: number
    readOnly?: boolean
}

/**
 * Props for PaymentDesktopTable
 */
export interface PaymentDesktopTableProps {
    data: PaymentData[]
    monthlyQuota: number
    readOnly: boolean
    activeTool: ToolType
    highlightedId: number | null
    onCellClick: (aptId: number, monthIdx: number) => void
    onDelete: (aptId: number) => void
}

/**
 * Props for PaymentMobileCards
 */
export interface PaymentMobileCardsProps {
    data: PaymentData[]
    monthlyQuota: number
    isEditing: boolean
    activeTool: ToolType
    onCellClick: (aptId: number, monthIdx: number) => void
}

/**
 * Row data for virtualized list
 */
export interface RowData {
    items: PaymentData[]
    monthlyQuota: number
    readOnly: boolean
    activeTool: ToolType
    highlightedId: number | null
    onCellClick: (aptId: number, monthIdx: number) => void
}