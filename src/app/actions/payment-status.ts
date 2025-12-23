"use server"

/**
 * Server Actions for Payment Status Summary
 * 
 * Fetches combined payment status for residents from both
 * regular quotas and extraordinary projects.
 */

import { db } from "@/db"
import { 
    extraordinaryProjects, 
    extraordinaryPayments, 
    apartments, 
    user as users,
    payments as regularPayments,
    building as buildings,
} from "@/db/schema"
import { eq, and, lte, sql, sum, count } from "drizzle-orm"
import { getInstallmentDate } from "@/lib/extraordinary-calculations"

// ===========================================
// TYPES
// ===========================================

export interface PaymentStatusSummary {
    residentName: string
    apartmentUnit: string
    isBuildingSummary?: boolean
    
    // Overall status
    status: "ok" | "warning" | "critical"
    statusMessage: string
    
    // Regular quotas (monthly condominium fees)
    regularQuotas: {
        totalDueToDate: number      // Sum of all quotas due up to current month
        totalPaid: number           // Sum of all paid quotas
        balance: number             // Positive = owes money
        overdueMonths: number       // Number of months with unpaid quotas
        currentMonthPaid: boolean
    }
    
    // Extraordinary quotas (special projects)
    extraordinaryQuotas: {
        activeProjects: number
        totalDueToDate: number      // Sum of all installments due up to current month
        totalPaid: number
        balance: number
        overdueInstallments: number
    }
    
    // Combined totals
    totalBalance: number            // Total amount owed (regular + extraordinary)
    lastUpdated: Date
}

// ===========================================
// MAIN ACTION
// ===========================================

export async function getResidentPaymentStatus(
    userId: string
): Promise<{ success: true; data: PaymentStatusSummary } | { success: false; error: string }> {
    try {
        // 1. Get user and check role
        const userResult = await db
            .select()
            .from(users)
            .where(eq(users.id, userId))
            .limit(1)

        if (!userResult.length) {
            return { success: false, error: "Utilizador não encontrado" }
        }

        const user = userResult[0]
        const now = new Date()
        const currentMonth = now.getMonth() + 1
        const currentYear = now.getFullYear()

        // 2. IF MANAGER: Return Building Summary
        if (user.role === 'manager') {
            const buildingId = user.activeBuildingId
            if (!buildingId) return { success: false, error: "Nenhum condomínio ativo selecionado" }

            const buildingResult = await db.select().from(buildings).where(eq(buildings.id, buildingId)).limit(1)
            const building = buildingResult[0]
            const monthlyQuota = building.monthlyQuota || 0

            // Regular Quotas Summary
            const regPayments = await db
                .select({
                    totalPaid: sum(regularPayments.amount),
                    countPaid: count(regularPayments.id),
                })
                .from(regularPayments)
                .innerJoin(apartments, eq(regularPayments.apartmentId, apartments.id))
                .where(and(
                    eq(apartments.buildingId, buildingId),
                    eq(regularPayments.year, currentYear),
                    lte(regularPayments.month, currentMonth),
                    eq(regularPayments.status, 'paid')
                ))

            const totalAptsResult = await db.select({ count: count() }).from(apartments).where(eq(apartments.buildingId, buildingId))
            const totalApts = totalAptsResult[0].count
            
            const totalDueRegular = totalApts * monthlyQuota * currentMonth
            const totalPaidRegular = Number(regPayments[0].totalPaid) || 0
            const regBalance = Math.max(0, totalDueRegular - totalPaidRegular)

            // Extraordinary Summary
            const extraProjResult = await db.select().from(extraordinaryProjects).where(and(eq(extraordinaryProjects.buildingId, buildingId), eq(extraordinaryProjects.status, 'active')))
            
            let extraTotalDue = 0
            let extraTotalPaid = 0
            let extraOverdueCount = 0

            for (const proj of extraProjResult) {
                const payments = await db.select().from(extraordinaryPayments).where(eq(extraordinaryPayments.projectId, proj.id))
                for (const p of payments) {
                    const { month, year } = getInstallmentDate(p.installment, proj.startMonth, proj.startYear)
                    const isDue = year < currentYear || (year === currentYear && month <= currentMonth)
                    if (isDue) {
                        extraTotalDue += p.expectedAmount
                        extraTotalPaid += (p.paidAmount || 0)
                        if (p.status !== 'paid' && (p.paidAmount || 0) < p.expectedAmount) extraOverdueCount++
                    }
                }
            }

            const totalBalance = regBalance + (extraTotalDue - extraTotalPaid)
            
            return {
                success: true,
                data: {
                    residentName: "Gestor",
                    apartmentUnit: building.name,
                    isBuildingSummary: true,
                    status: totalBalance > 0 ? "warning" : "ok",
                    statusMessage: totalBalance > 0 
                        ? `O condomínio tem ${totalBalance / 100}€ em pagamentos pendentes.`
                        : "As contas do condomínio estão em dia.",
                    regularQuotas: {
                        totalDueToDate: totalDueRegular,
                        totalPaid: totalPaidRegular,
                        balance: regBalance,
                        overdueMonths: 0,
                        currentMonthPaid: true,
                    },
                    extraordinaryQuotas: {
                        activeProjects: extraProjResult.length || 0,
                        totalDueToDate: extraTotalDue,
                        totalPaid: extraTotalPaid,
                        balance: extraTotalDue - extraTotalPaid,
                        overdueInstallments: extraOverdueCount,
                    },
                    totalBalance,
                    lastUpdated: new Date(),
                }
            }
        }

        // 3. IF RESIDENT: Return Personal Summary
        const apartmentResult = await db
            .select({
                id: apartments.id,
                unit: apartments.unit,
                buildingId: apartments.buildingId,
                monthlyQuota: buildings.monthlyQuota,
            })
            .from(apartments)
            .innerJoin(buildings, eq(apartments.buildingId, buildings.id))
            .where(eq(apartments.residentId, userId))
            .limit(1)

        if (!apartmentResult.length) {
            return { success: false, error: "Utilizador sem fração associada" }
        }

        const apartment = apartmentResult[0]
        const monthlyQuota = apartment.monthlyQuota || 0

        // Regular Quotas calculation
        const regPayments = await db
            .select()
            .from(regularPayments)
            .where(and(
                eq(regularPayments.apartmentId, apartment.id),
                eq(regularPayments.year, currentYear)
            ))

        const totalDueRegular = monthlyQuota * currentMonth
        let totalPaidRegular = 0
        let regOverdueMonths = 0
        let currentMonthPaid = false

        for (let m = 1; m <= currentMonth; m++) {
            const p = regPayments.find(p => p.month === m)
            if (p?.status === 'paid') {
                totalPaidRegular += p.amount
                if (m === currentMonth) currentMonthPaid = true
            } else {
                regOverdueMonths++
            }
        }
        const regBalance = Math.max(0, totalDueRegular - totalPaidRegular)

        // Extraordinary Quotas
        const extraPaymentsResult = await db
            .select({
                projectId: extraordinaryProjects.id,
                projectName: extraordinaryProjects.name,
                projectStatus: extraordinaryProjects.status,
                startMonth: extraordinaryProjects.startMonth,
                startYear: extraordinaryProjects.startYear,
                paymentId: extraordinaryPayments.id,
                installmentNumber: extraordinaryPayments.installment,
                expectedAmount: extraordinaryPayments.expectedAmount,
                paidAmount: extraordinaryPayments.paidAmount,
                paymentStatus: extraordinaryPayments.status,
            })
            .from(extraordinaryPayments)
            .innerJoin(
                extraordinaryProjects,
                eq(extraordinaryPayments.projectId, extraordinaryProjects.id)
            )
            .where(
                and(
                    eq(extraordinaryPayments.apartmentId, apartment.id),
                    eq(extraordinaryProjects.status, "active")
                )
            )

        let extraTotalDue = 0
        let extraTotalPaid = 0
        let extraOverdueCount = 0
        const activeProjectIds = new Set<number>()

        for (const payment of extraPaymentsResult) {
            activeProjectIds.add(payment.projectId)
            const { month: dueMonth, year: dueYear } = getInstallmentDate(payment.installmentNumber, payment.startMonth, payment.startYear)
            const isDue = dueYear < currentYear || (dueYear === currentYear && dueMonth <= currentMonth)

            if (isDue) {
                extraTotalDue += payment.expectedAmount
                extraTotalPaid += (payment.paidAmount || 0)
                if (payment.paymentStatus !== "paid" && (payment.paidAmount || 0) < payment.expectedAmount) {
                    extraOverdueCount++
                }
            }
        }

        const extraBalance = extraTotalDue - extraTotalPaid
        const totalBalance = regBalance + extraBalance
        const totalOverdue = regOverdueMonths + extraOverdueCount

        let status: "ok" | "warning" | "critical"
        let statusMessage: string

        if (totalBalance <= 0 && totalOverdue === 0) {
            status = "ok"
            statusMessage = `Olá ${user.name?.split(" ")[0] || ""}! Está tudo em dia. Os seus pagamentos estão regularizados.`
        } else if (totalOverdue <= 2 && totalBalance < 50000) {
            status = "warning"
            statusMessage = `Olá ${user.name?.split(" ")[0] || ""}! Tem pagamentos pendentes. Regularize para evitar encargos adicionais.`
        } else {
            status = "critical"
            statusMessage = `Atenção ${user.name?.split(" ")[0] || ""}! Existem pagamentos em atraso. Regularize urgentemente para evitar ações legais.`
        }

        return {
            success: true,
            data: {
                residentName: user.name || "Residente",
                apartmentUnit: apartment.unit,
                status,
                statusMessage,
                regularQuotas: {
                    totalDueToDate: totalDueRegular,
                    totalPaid: totalPaidRegular,
                    balance: regBalance,
                    overdueMonths: regOverdueMonths,
                    currentMonthPaid,
                },
                extraordinaryQuotas: {
                    activeProjects: activeProjectIds.size,
                    totalDueToDate: extraTotalDue,
                    totalPaid: extraTotalPaid,
                    balance: extraBalance,
                    overdueInstallments: extraOverdueCount,
                },
                totalBalance,
                lastUpdated: new Date(),
            },
        }
    } catch (error) {
        console.error("Error fetching payment status:", error)
        return { success: false, error: "Erro ao carregar estado dos pagamentos" }
    }
}


// ===========================================
// MANAGER VIEW: Get summary for an apartment
// ===========================================

export async function getApartmentPaymentStatus(
    apartmentId: number
): Promise<{ success: true; data: PaymentStatusSummary } | { success: false; error: string }> {
    try {
        // Get apartment and resident
        const apartmentResult = await db
            .select({
                id: apartments.id,
                unit: apartments.unit,
                buildingId: apartments.buildingId,
            })
            .from(apartments)
            .where(eq(apartments.id, apartmentId))
            .limit(1)

        if (!apartmentResult.length) {
            return { success: false, error: "Fração não encontrada" }
        }

        const apartment = apartmentResult[0]

        // Get resident if any
        const residentResult = await db
            .select({ name: users.name })
            .from(users)
            .innerJoin(apartments, eq(apartments.residentId, users.id))
            .where(eq(apartments.id, apartmentId))
            .limit(1)

        const residentName = residentResult[0]?.name || "Sem residente"

        const now = new Date()
        const currentMonth = now.getMonth() + 1
        const currentYear = now.getFullYear()

        // Get extraordinary payments
        const extraPaymentsResult = await db
            .select({
                projectId: extraordinaryProjects.id,
                startMonth: extraordinaryProjects.startMonth,
                startYear: extraordinaryProjects.startYear,
                installmentNumber: extraordinaryPayments.installment,
                expectedAmount: extraordinaryPayments.expectedAmount,
                paidAmount: extraordinaryPayments.paidAmount,
                paymentStatus: extraordinaryPayments.status,
            })
            .from(extraordinaryPayments)
            .innerJoin(
                extraordinaryProjects,
                eq(extraordinaryPayments.projectId, extraordinaryProjects.id)
            )
            .where(
                and(
                    eq(extraordinaryPayments.apartmentId, apartmentId),
                    eq(extraordinaryProjects.status, "active")
                )
            )

        let extraTotalDue = 0
        let extraTotalPaid = 0
        let extraOverdueCount = 0
        const activeProjectIds = new Set<number>()

        for (const payment of extraPaymentsResult) {
            activeProjectIds.add(payment.projectId)
            
            // Calculate due date for this installment
            const { month: dueMonth, year: dueYear } = getInstallmentDate(
                payment.installmentNumber,
                payment.startMonth,
                payment.startYear
            )

            const isDue = 
                dueYear < currentYear ||
                (dueYear === currentYear && dueMonth <= currentMonth)

            if (isDue) {
                extraTotalDue += payment.expectedAmount
                extraTotalPaid += (payment.paidAmount || 0)

                if (payment.paymentStatus !== "paid" && (payment.paidAmount || 0) < payment.expectedAmount) {
                    extraOverdueCount++
                }
            }
        }

        const extraBalance = extraTotalDue - extraTotalPaid

        // Get regular payments summary
        const regularPaymentsResult = await db
            .select({
                expectedAmount: regularPayments.amount,
                paidAmount: sql<number>`CASE WHEN ${regularPayments.status} = 'paid' THEN ${regularPayments.amount} ELSE 0 END`,
                month: regularPayments.month,
                year: regularPayments.year,
                status: regularPayments.status,
            })
            .from(regularPayments)
            .where(eq(regularPayments.apartmentId, apartmentId))

        let regularTotalDue = 0
        let regularTotalPaid = 0
        let regularOverdueMonths = 0
        let currentMonthPaid = true

        for (const payment of regularPaymentsResult) {
            const isDue = 
                payment.year < currentYear ||
                (payment.year === currentYear && payment.month <= currentMonth)

            if (isDue) {
                regularTotalDue += payment.expectedAmount
                regularTotalPaid += payment.paidAmount
                
                if (payment.status !== "paid") {
                    regularOverdueMonths++
                }
                
                if (payment.month === currentMonth && payment.year === currentYear) {
                    currentMonthPaid = payment.status === "paid"
                }
            }
        }
        const regularBalance = regularTotalDue - regularTotalPaid
        const totalBalance = extraBalance + regularBalance
        const totalOverdue = extraOverdueCount + regularOverdueMonths

        let status: "ok" | "warning" | "critical"
        let statusMessage: string

        if (totalBalance <= 0 && totalOverdue === 0) {
            status = "ok"
            statusMessage = "Pagamentos em dia"
        } else if (totalOverdue <= 2 && totalBalance < 50000) {
            status = "warning"
            statusMessage = "Pagamentos pendentes"
        } else {
            status = "critical"
            statusMessage = "Pagamentos em atraso"
        }

        return {
            success: true,
            data: {
                residentName,
                apartmentUnit: apartment.unit,
                status,
                statusMessage,
                regularQuotas: {
                    totalDueToDate: regularTotalDue,
                    totalPaid: regularTotalPaid,
                    balance: regularBalance,
                    overdueMonths: regularOverdueMonths,
                    currentMonthPaid,
                },
                extraordinaryQuotas: {
                    activeProjects: activeProjectIds.size,
                    totalDueToDate: extraTotalDue,
                    totalPaid: extraTotalPaid,
                    balance: extraBalance,
                    overdueInstallments: extraOverdueCount,
                },
                totalBalance,
                lastUpdated: new Date(),
            },
        }
    } catch (error) {
        console.error("Error fetching apartment payment status:", error)
        return { success: false, error: "Erro ao carregar estado dos pagamentos" }
    }
}