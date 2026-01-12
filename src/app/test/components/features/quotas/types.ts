// =============================================================================
// PAYMENT GRID TYPES
// Shared types for the quotas payment grid components
// =============================================================================

export type PaymentStatus = "paid" | "pending" | "late"

export interface Payment {
  status: PaymentStatus
  amount: number
}

export interface ApartmentData {
  id: number
  unit: string
  residentName: string | null
  payments: Record<number, Payment>
  totalPaid: number
  balance: number
}

export type ToolType = "markPaid" | "markPending" | "markLate" | null

// Utility
export function formatCurrency(cents: number): string {
  return `€${(cents / 100).toFixed(0)}`
}

// Constants
export const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
export const MONTHLY_QUOTA = 8500 // in cents (85€)
