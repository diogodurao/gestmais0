/**
 * Extraordinary Payments Calculation Service
 * 
 * Handles the math for dividing project costs among apartments
 * based on their permillage values.
 * 
 * Formula:
 * Total Share = (totalBudget × permillage) / 1000
 * Monthly Payment = Total Share / numInstallments
 * 
 * Example:
 * Budget: €45,773.10 | Permillage: 16.49 | Installments: 12
 * Total Share = (4577310 × 16.49) / 1000 = 75479.62 cents = €754.80
 * Monthly = €754.80 / 12 = €62.90
 */

// ===========================================
// TYPES
// ===========================================

export interface Apartment {
    id: number
    unit: string
    permillage: number | null
    residentId?: number | null
    residentName?: string | null
}

export interface InstallmentCalculation {
    number: number
    month: number
    year: number
    amount: number // in cents
}

export interface ApartmentCalculation {
    apartmentId: number
    unit: string
    residentName: string | null
    permillage: number
    totalShare: number // in cents
    monthlyPayment: number // average, in cents
    installments: InstallmentCalculation[]
}

export interface ProjectCalculationSummary {
    totalBudget: number
    totalPermillage: number // sum of all permillages (should be ~1000)
    apartments: ApartmentCalculation[]
    warnings: string[]
}

// ===========================================
// MAIN CALCULATION FUNCTION
// ===========================================

export function calculateExtraordinaryPayments(
    totalBudget: number, // in cents
    numInstallments: number,
    startMonth: number, // 1-12
    startYear: number,
    apartments: Apartment[]
): ProjectCalculationSummary {
    const warnings: string[] = []
    
    // Validate inputs
    if (totalBudget <= 0) {
        warnings.push("Orçamento deve ser maior que zero")
    }
    if (numInstallments <= 0 || numInstallments > 120) {
        warnings.push("Número de prestações deve estar entre 1 e 120")
    }
    if (startMonth < 1 || startMonth > 12) {
        warnings.push("Mês inicial inválido")
    }
    
    // Calculate total permillage
    const totalPermillage = apartments.reduce((sum, apt) => sum + (apt.permillage || 0), 0)
    
    if (Math.abs(totalPermillage - 1000) > 1) {
        warnings.push(`Permilagem total (${totalPermillage.toFixed(2)}‰) difere de 1000‰`)
    }
    
    // Calculate for each apartment
    const apartmentCalculations: ApartmentCalculation[] = apartments.map((apt) => {
        const permillage = apt.permillage || 0
        
        if (permillage === 0) {
            warnings.push(`Fração ${apt.unit} não tem permilagem definida`)
        }
        
        // Calculate total share: (budget × permillage) / 1000
        const totalShare = Math.round((totalBudget * permillage) / 1000)
        
        // Calculate installments with proper rounding
        const installments = calculateInstallments(
            totalShare,
            numInstallments,
            startMonth,
            startYear
        )
        
        // Average monthly payment
        const monthlyPayment = Math.round(totalShare / numInstallments)
        
        return {
            apartmentId: apt.id,
            unit: apt.unit,
            residentName: apt.residentName || null,
            permillage,
            totalShare,
            monthlyPayment,
            installments,
        }
    })
    
    return {
        totalBudget,
        totalPermillage,
        apartments: apartmentCalculations,
        warnings,
    }
}

// ===========================================
// INSTALLMENT CALCULATION
// ===========================================

function calculateInstallments(
    totalShare: number,
    numInstallments: number,
    startMonth: number,
    startYear: number
): InstallmentCalculation[] {
    // Calculate regular payment and remainder
    const regularPayment = Math.floor(totalShare / numInstallments)
    const remainder = totalShare - regularPayment * numInstallments
    
    const installments: InstallmentCalculation[] = []
    
    for (let i = 0; i < numInstallments; i++) {
        // Calculate month and year for this installment
        let month = startMonth + i
        let year = startYear
        
        while (month > 12) {
            month -= 12
            year += 1
        }
        
        // Last installment gets the remainder to ensure exact total
        const amount = i === numInstallments - 1 
            ? regularPayment + remainder 
            : regularPayment
        
        installments.push({
            number: i + 1,
            month,
            year,
            amount,
        })
    }
    
    return installments
}

// ===========================================
// HELPER FUNCTIONS
// ===========================================

/**
 * Get the month/year for a specific installment number
 */
export function getInstallmentDate(
    installmentNumber: number,
    startMonth: number,
    startYear: number
): { month: number; year: number } {
    let month = startMonth + installmentNumber - 1
    let year = startYear
    
    while (month > 12) {
        month -= 12
        year += 1
    }
    
    return { month, year }
}

/**
 * Format month number to Portuguese name
 */
export function getMonthName(month: number, short: boolean = false): string {
    const monthNames = [
        ["Janeiro", "Jan"],
        ["Fevereiro", "Fev"],
        ["Março", "Mar"],
        ["Abril", "Abr"],
        ["Maio", "Mai"],
        ["Junho", "Jun"],
        ["Julho", "Jul"],
        ["Agosto", "Ago"],
        ["Setembro", "Set"],
        ["Outubro", "Out"],
        ["Novembro", "Nov"],
        ["Dezembro", "Dez"],
    ]
    
    return monthNames[month - 1]?.[short ? 1 : 0] || ""
}

/**
 * Format amount from cents to Euro string
 */
export function formatCurrency(cents: number): string {
    return new Intl.NumberFormat("pt-PT", {
        style: "currency",
        currency: "EUR",
    }).format(cents / 100)
}

/**
 * Parse Euro string to cents
 */
export function parseCurrency(value: string): number {
    const cleaned = value
        .replace(/[€\s]/g, "")
        .replace(",", ".")
    const num = parseFloat(cleaned)
    return isNaN(num) ? 0 : Math.round(num * 100)
}

/**
 * Calculate progress percentage
 */
export function calculateProgress(paid: number, total: number): number {
    if (total === 0) return 0
    return Math.min(100, Math.round((paid / total) * 100))
}

/**
 * Determine payment status based on dates and amounts
 */
export function determinePaymentStatus(
    paidAmount: number,
    expectedAmount: number,
    installmentMonth: number,
    installmentYear: number,
    currentDate: Date = new Date()
): "paid" | "pending" | "overdue" | "partial" {
    // Fully paid
    if (paidAmount >= expectedAmount) {
        return "paid"
    }
    
    // Partially paid
    if (paidAmount > 0) {
        return "partial"
    }
    
    // Check if overdue (past the installment month)
    const currentMonth = currentDate.getMonth() + 1
    const currentYear = currentDate.getFullYear()
    
    if (
        installmentYear < currentYear ||
        (installmentYear === currentYear && installmentMonth < currentMonth)
    ) {
        return "overdue"
    }
    
    return "pending"
}

// ===========================================
// VALIDATION FUNCTIONS
// ===========================================

export interface ValidationResult {
    valid: boolean
    errors: string[]
}

export function validateProjectInput(data: {
    name: string
    totalBudget: number
    numInstallments: number
    startMonth: number
    startYear: number
}): ValidationResult {
    const errors: string[] = []
    
    if (!data.name || data.name.trim().length < 3) {
        errors.push("Nome do projeto deve ter pelo menos 3 caracteres")
    }
    
    if (data.totalBudget <= 0) {
        errors.push("Orçamento deve ser maior que zero")
    }
    
    if (data.numInstallments < 1 || data.numInstallments > 120) {
        errors.push("Número de prestações deve estar entre 1 e 120")
    }
    
    if (data.startMonth < 1 || data.startMonth > 12) {
        errors.push("Mês inicial inválido")
    }
    
    const currentYear = new Date().getFullYear()
    if (data.startYear < currentYear - 5 || data.startYear > currentYear + 10) {
        errors.push("Ano inicial inválido")
    }
    
    return {
        valid: errors.length === 0,
        errors,
    }
}

// ===========================================
// AGGREGATION FUNCTIONS
// ===========================================

export interface ProjectStats {
    totalExpected: number
    totalPaid: number
    totalBalance: number
    progressPercent: number
    apartmentsCompleted: number
    apartmentsTotal: number
    nextDueDate: { month: number; year: number } | null
}

export function calculateProjectStats(
    payments: Array<{
        apartmentId: number
        expectedAmount: number
        paidAmount: number
        installment: number
        status: string
    }>,
    numInstallments: number,
    startMonth: number,
    startYear: number
): ProjectStats {
    const totalExpected = payments.reduce((sum, p) => sum + p.expectedAmount, 0)
    const totalPaid = payments.reduce((sum, p) => sum + p.paidAmount, 0)
    const totalBalance = totalExpected - totalPaid
    const progressPercent = calculateProgress(totalPaid, totalExpected)
    
    // Count apartments where all installments are paid
    const apartmentPayments = new Map<number, { paid: number; total: number }>()
    payments.forEach((p) => {
        const current = apartmentPayments.get(p.apartmentId) || { paid: 0, total: 0 }
        current.total++
        if (p.status === "paid") current.paid++
        apartmentPayments.set(p.apartmentId, current)
    })
    
    let apartmentsCompleted = 0
    apartmentPayments.forEach((apt) => {
        if (apt.paid === apt.total) apartmentsCompleted++
    })
    
    // Find next due installment
    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()
    
    let nextDueDate: { month: number; year: number } | null = null
    for (let i = 1; i <= numInstallments; i++) {
        const { month, year } = getInstallmentDate(i, startMonth, startYear)
        if (year > currentYear || (year === currentYear && month >= currentMonth)) {
            nextDueDate = { month, year }
            break
        }
    }
    
    return {
        totalExpected,
        totalPaid,
        totalBalance,
        progressPercent,
        apartmentsCompleted,
        apartmentsTotal: apartmentPayments.size,
        nextDueDate,
    }
}