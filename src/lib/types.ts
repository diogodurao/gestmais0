import { calendarEvents } from "@/db/schema"

export type PaymentStatus = "paid" | "pending" | "late" | "partial"
export type ProjectStatus = "active" | "completed" | "cancelled" | "archived"
export type UserRole = "manager" | "resident"
export type ComponentSize = "xs" | "sm" | "md" | "lg"

/**
 * Payment data for a single apartment in the payment grid
 * Matches the return type from getPaymentMap action
 */
export interface PaymentData {
    apartmentId: number
    unit: string
    residentName?: string | null
    payments: Record<number, { status: string; amount: number }>
    totalPaid: number
    balance: number
}

/**
 * Tool modes for the payment grid
 */
export type PaymentToolType = "markPaid" | "markPending" | "markLate" | null

/**
 * Filter modes for displaying payments
 */
export type PaymentFilterMode = "all" | "paid" | "late" | "pending"

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
 * Tool modes for the extraordinary payment grid
 */
export type ExtraordinaryToolMode = "markPaid" | "markPending" | "markLate" | null

/**
 * Summary of an extraordinary project
 */
export interface ExtraordinaryProjectSummary {
    id: number
    name: string
    totalBudget: number
    numInstallments: number
    startMonth: number
    startYear: number
    status: string
}



export interface ApartmentPaymentData {
    apartmentId: number
    unit: string
    residentName: string | null
    permillage: number
    totalShare: number
    totalPaid: number
    balance: number
    status: "complete" | "partial" | "pending"
    installments: Array<{
        id: number
        number: number
        month: number
        year: number
        expectedAmount: number
        paidAmount: number
        status: "paid" | "pending" | "late" | "partial"
    }>
}

// ==========================================
// BUILDING TYPES
// ==========================================

export type QuotaMode = "global" | "permillage"

export type BuildingStatus = "active" | "inactive" | "pending"

// ==========================================
// ONBOARDING TYPES
// ==========================================

export type OnboardingUserData = {
    id: string
    name: string
    email: string
    nif: string | null
    iban: string | null
    buildingId?: string | null
}

export type OnboardingBuildingData = {
    id: string
    name: string
    nif: string
    iban: string | null
    street: string | null
    number: string | null
    city: string | null
    quotaMode: string | null
    monthlyQuota: number | null
    totalApartments: number | null
}

export type OnboardingApartment = {
    id: number
    unit: string
    permillage: number
}

export type OnboardingApartmentSimple = {
    id: number
    unit: string
}

export type OnboardingBuildingInfo = {
    id: string
    name: string
}

// ==========================================
// USER & SESSION TYPES
// ==========================================



/**
 * Session user type - use this for type-safe session access
 */
export type SessionUser = {
    id: string
    name: string
    email: string
    role: UserRole
    buildingId: string | null      // For residents: their building
    activeBuildingId: string | null // For managers: currently selected building
    nif: string | null
    iban: string | null
    preferredLanguage: 'pt' | 'en' | null
}

// ==========================================
// SUBSCRIPTION TYPES
// ==========================================

export type SubscriptionStatus =
    | "active"
    | "canceled"
    | "incomplete"
    | "incomplete_expired"
    | "past_due"
    | "paused"
    | "trialing"
    | "unpaid"

export type SubscriptionSyncStatus = 'idle' | 'syncing' | 'success' | 'error'

// ==========================================
// API RESPONSE TYPES
// ==========================================

export type ActionResult<T> =
    | { success: true; data: T }
    | { success: false; error: string; code?: ErrorCode }

// ==========================================
// RESULT HELPERS
// ==========================================

export function Ok<T>(data: T): ActionResult<T> {
    return { success: true, data }
}

export function Err(error: string, code?: ErrorCode): ActionResult<never> {
    return { success: false, error, code }
}

// ==========================================
// ERROR CODES
// ==========================================

export const ErrorCodes = {
    // Generic
    NOT_FOUND: 'NOT_FOUND',
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    VALIDATION_FAILED: 'VALIDATION_FAILED',
    INTERNAL_ERROR: 'INTERNAL_ERROR',

    // Building
    BUILDING_NOT_FOUND: 'BUILDING_NOT_FOUND',
    INVALID_BUILDING_CODE: 'INVALID_BUILDING_CODE',
    BUILDING_INACTIVE: 'BUILDING_INACTIVE',
    BUILDING_ACCESS_DENIED: 'BUILDING_ACCESS_DENIED',

    // Apartment
    APARTMENT_NOT_FOUND: 'APARTMENT_NOT_FOUND',
    APARTMENT_ALREADY_CLAIMED: 'APARTMENT_ALREADY_CLAIMED',
    UNIT_ALREADY_EXISTS: 'UNIT_ALREADY_EXISTS',
    MISSING_REQUIRED_FIELDS: 'MISSING_REQUIRED_FIELDS',

    // User
    USER_NOT_FOUND: 'USER_NOT_FOUND',
    NO_APARTMENT_ASSIGNED: 'NO_APARTMENT_ASSIGNED',

    // Payment / Stripe
    PAYMENT_FAILED: 'PAYMENT_FAILED',
    SUBSCRIPTION_NOT_FOUND: 'SUBSCRIPTION_NOT_FOUND',
    CHECKOUT_FAILED: 'CHECKOUT_FAILED',
    STRIPE_CUSTOMER_ERROR: 'STRIPE_CUSTOMER_ERROR',

    // Calendar
    EVENT_NOT_FOUND: 'EVENT_NOT_FOUND',

    // Documents
    DOCUMENT_NOT_FOUND: 'DOCUMENT_NOT_FOUND',

    // Polls
    POLL_NOT_FOUND: 'POLL_NOT_FOUND',
    POLL_HAS_VOTES: 'POLL_HAS_VOTES',

    // Occurrences
    OCCURRENCE_NOT_FOUND: 'OCCURRENCE_NOT_FOUND',

    // Discussions
    DISCUSSION_NOT_FOUND: 'DISCUSSION_NOT_FOUND',
    COMMENT_NOT_FOUND: 'COMMENT_NOT_FOUND',

    // Banking / Open Banking
    BANK_CONNECTION_NOT_FOUND: 'BANK_CONNECTION_NOT_FOUND',
    BANK_CONNECTION_EXPIRED: 'BANK_CONNECTION_EXPIRED',
    BANK_CONNECTION_ERROR: 'BANK_CONNECTION_ERROR',
    BANK_SYNC_FAILED: 'BANK_SYNC_FAILED',
    BANK_ACCOUNT_NOT_FOUND: 'BANK_ACCOUNT_NOT_FOUND',
    BANK_TRANSACTION_NOT_FOUND: 'BANK_TRANSACTION_NOT_FOUND',
} as const

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes]

// ==========================================
// DASHBOARD TYPES
// ==========================================

export type ManagedBuilding = {
    building: {
        id: string
        name: string
        code: string
        subscriptionStatus?: string | null
        subscriptionPastDueAt?: Date | string | null
    }
    isOwner: boolean | null
}

export type Apartment = {
    id: number
    buildingId: string
    unit: string
    permillage: number | null
    residentId: string | null
}

export type DashboardInitialData = {
    session: SessionUser | null
    managerBuildings: ManagedBuilding[]
    activeBuilding: ManagedBuilding | null
    residentApartment: Apartment | null
    setupComplete: boolean
}

// ==========================================
// CALENDAR TYPES
// ==========================================

// Use schema inference instead of manual type
export type CalendarEvent = typeof calendarEvents.$inferSelect

export type RecurrenceType = "none" | "weekly" | "biweekly" | "monthly"

// EVENT_TYPE_SUGGESTIONS is defined in lib/constants/ui.ts

// ==========================================
// OCCURRENCE TYPES
// ==========================================

export type OccurrenceStatus = "open" | "in_progress" | "resolved"
export type OccurrencePriority = "low" | "medium" | "high" | "urgent"

export interface Occurrence {
    id: number
    buildingId: string
    title: string
    type: string
    description: string | null
    status: OccurrenceStatus
    priority: OccurrencePriority
    createdBy: string
    createdAt: Date
    resolvedAt: Date | null
    creatorName: string | null
    commentCount?: number
}

export interface OccurrenceComment {
    id: number
    occurrenceId: number
    content: string
    createdBy: string
    createdAt: Date
    creatorName: string | null
    attachments?: OccurrenceAttachment[]
}

export interface OccurrenceAttachment {
    id: number
    occurrenceId: number
    commentId: number | null
    fileName: string
    fileKey: string
    fileUrl: string
    fileSize: number
    fileType: string
    uploadedBy: string
    uploadedAt: Date
}

// ==========================================
// NOTIFICATION TYPES
// ==========================================

/**
 * Options for controlling how notifications are sent
 * Used by managers when creating calendar events and polls
 */
export interface NotificationOptions {
    sendAppNotification: boolean  // default: true
    sendEmail: boolean            // default: false
    recipients: 'all' | string[]  // 'all' or array of userIds
}

export type NotificationType =
    | 'occurrence_created'
    | 'occurrence_comment'
    | 'occurrence_status'
    | 'poll_created'
    | 'poll_closed'
    | 'discussion_created'
    | 'discussion_comment'
    | 'evaluation_open'
    | 'calendar_event'
    | 'payment_due'
    | 'payment_overdue'
    | 'poll'
    | 'subscription_payment_failed'

export interface Notification {
    id: number
    buildingId: string
    userId: string
    type: NotificationType
    title: string
    message: string | null
    link: string | null
    isRead: boolean
    readAt: Date | null
    createdAt: Date
}

// ==========================================
// EVALUATION TYPES
// ==========================================

export interface Evaluation {
    id: number
    userId: string
    securityRating: number
    cleaningRating: number
    maintenanceRating: number
    communicationRating: number
    generalRating: number
    comments: string | null
    createdAt: Date
    userName: string | null
}

export interface EvaluationStatus {
    year: number
    month: number
    isOpen: boolean
    daysUntilOpen: number
    daysRemaining: number
    hasSubmitted: boolean
    userEvaluation: Evaluation | null
}

export interface MonthlyAverages {
    year: number
    month: number
    securityAvg: number
    cleaningAvg: number
    maintenanceAvg: number
    communicationAvg: number
    generalAvg: number
    totalResponses: number
}

export type EvaluationCategoryKey = 'securityRating' | 'cleaningRating' | 'maintenanceRating' | 'communicationRating' | 'generalRating'

export interface CreateOccurrenceInput {
    buildingId: string
    title: string
    type: string
    priority?: OccurrencePriority
    description?: string
}

export interface UpdateOccurrenceInput {
    title?: string
    type?: string
    priority?: OccurrencePriority
    description?: string
}

// ==========================================
// POLL TYPES
// ==========================================

export type PollType = "yes_no" | "single_choice" | "multiple_choice"
export type PollWeightMode = "equal" | "permilagem"
export type PollStatus = "open" | "closed"

export interface Poll {
    id: number
    buildingId: string
    title: string
    description: string | null
    type: PollType
    weightMode: PollWeightMode
    status: PollStatus
    options: string[] | null
    createdBy: string
    createdAt: Date
    closedAt: Date | null
    creatorName: string | null
    voteCount?: number
}

export interface PollVote {
    id: number
    pollId: number
    userId: string
    apartmentId: number | null
    vote: string | string[]
    createdAt: Date
    updatedAt: Date | null
    userName: string | null
    apartmentPermillage: number | null
    apartmentUnit: string | null
}

export interface PollResults {
    results: Record<string, number>
    totalWeight: number
    voteCount: number
}

// ==========================================
// DISCUSSIONS TYPES
// ==========================================

export interface Discussion {
    id: number
    buildingId: string
    title: string
    content: string | null
    isPinned: boolean
    isClosed: boolean
    createdBy: string
    createdAt: Date
    updatedAt: Date | null
    lastActivityAt: Date
    creatorName: string | null
    commentCount?: number
}

export interface DiscussionComment {
    id: number
    discussionId: number
    content: string
    isEdited: boolean
    createdBy: string
    createdAt: Date
    updatedAt: Date | null
    creatorName: string | null
}

// ==========================================
// DOCUMENT TYPES
// ==========================================

export type DocumentCategory = 'atas' | 'regulamentos' | 'contas' | 'seguros' | 'contratos' | 'projetos' | 'outros'

// Avoid conflict with built-in Document interface by naming it AppDocument if needed, 
// but user code used 'Document'. I will keep 'Document' but it might conflict with DOM Document. 
// However, in server-side code or if DOM lib isn't included it might be fine. 
// Given the existing code used 'Document', I'll stick to it but watch out for conflicts.
// Actually, to be safe, maybe rename to `StoredDocument`? 
// The user asked for "types types are placed in correct files". 
// The original file used `export interface Document`.
// If I export it here, it will be fine as long as imports are explicit.

export interface Document {
    id: number
    buildingId: string
    title: string
    description: string | null
    category: DocumentCategory
    fileName: string
    fileKey: string
    fileUrl: string
    fileSize: number
    fileType: string
    version: number
    originalId: number | null
    uploadedBy: string
    uploadedAt: Date
    uploaderName: string | null
}

export interface UploadDocumentInput {
    buildingId: string
    title: string
    description?: string
    category: DocumentCategory
    file: {
        buffer: Buffer
        originalName: string
        mimeType: string
        size: number
    }
}

export interface UploadNewVersionInput {
    originalId: number
    file: {
        buffer: Buffer
        originalName: string
        mimeType: string
        size: number
    }
}

// ==========================================
// BANKING / OPEN BANKING TYPES
// ==========================================

export type BankConnectionStatus = 'pending' | 'active' | 'expired' | 'revoked' | 'error'
export type BankTransactionType = 'credit' | 'debit'
export type TransactionMatchStatus = 'unmatched' | 'matched' | 'ignored'

export interface BankConnection {
    id: number
    buildingId: string
    accessToken: string | null
    refreshToken: string | null
    tokenExpiresAt: Date | null
    providerName: string | null
    status: BankConnectionStatus
    lastSyncAt: Date | null
    lastError: string | null
    createdAt: Date
    updatedAt: Date
    createdBy: string | null
}

export interface BankAccount {
    id: number
    connectionId: number
    buildingId: string
    tinkAccountId: string | null
    name: string | null
    iban: string | null
    balance: number | null
    availableBalance: number | null
    currency: string
    accountType: string | null
    lastSyncAt: Date | null
    createdAt: Date
    updatedAt: Date
}

export interface BankTransaction {
    id: number
    accountId: number
    buildingId: string
    tinkTransactionId: string | null
    amount: number
    type: BankTransactionType
    description: string | null
    originalDescription: string | null
    transactionDate: string
    bookingDate: string | null
    counterpartyName: string | null
    counterpartyIban: string | null
    matchedApartmentId: number | null
    matchedPaymentId: number | null
    matchStatus: TransactionMatchStatus
    createdAt: Date
}

export interface ResidentIban {
    id: number
    apartmentId: number
    iban: string
    label: string | null
    isPrimary: boolean
    createdAt: Date
}

// Banking summary types for UI
export interface BankConnectionSummary {
    status: BankConnectionStatus
    providerName: string | null
    lastSyncAt: Date | null
    accountCount: number
    totalBalance: number // in cents
}

export interface UnmatchedTransaction extends BankTransaction {
    accountName: string | null
    accountIban: string | null
}