// =============================================================================
// QUOTAS FEATURE COMPONENTS
// Feature-specific components for the payment quotas grid
// =============================================================================

// Types
export {
  type PaymentStatus,
  type Payment,
  type ApartmentData,
  type ToolType,
  formatCurrency,
  MONTHS,
  MONTHLY_QUOTA,
} from "./types"

// Mobile view
export { MobilePaymentCard } from "./mobile-payment-card"

// Desktop view
export {
  DesktopPaymentTable,
  PaymentGridSummary,
  PaymentGridLegend,
  EditModeIndicator,
} from "./desktop-payment-table"
