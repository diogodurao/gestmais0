import { db } from "@/db"
import { PaymentStatus } from "@/lib/types"
import { payments, apartments, user, building, extraordinaryProjects, extraordinaryPayments } from "@/db/schema"
import { eq, and, asc, lte, sql, sum, count, inArray } from "drizzle-orm"
import { getInstallmentDate } from "@/lib/extraordinary-calculations"



export interface PaymentData {
    apartmentId: number
    unit: string
    residentName?: string | null
    payments: Record<number, { status: string; amount: number }>
    totalPaid: number
    balance: number
}

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

export class PaymentService {
    async getPaymentMap(buildingId: string, year: number): Promise<{ gridData: PaymentData[], monthlyQuota: number }> {
        if (!buildingId) return { gridData: [], monthlyQuota: 0 }

        const buildingInfo = await db.select({
            monthlyQuota: building.monthlyQuota,
        })
            .from(building)
            .where(eq(building.id, buildingId))
            .limit(1)

        const monthlyQuota = buildingInfo[0]?.monthlyQuota || 0

        const buildingApartments = await db.select({
            id: apartments.id,
            unit: apartments.unit,
            residentName: user.name,
        })
            .from(apartments)
            .leftJoin(user, eq(apartments.residentId, user.id))
            .where(eq(apartments.buildingId, buildingId))
            .orderBy(asc(apartments.unit))

        const sortedApartments = buildingApartments

        const rawPayments = await db.select({
            apartmentId: payments.apartmentId,
            month: payments.month,
            status: payments.status,
            amount: payments.amount,
        })
            .from(payments)
            .innerJoin(apartments, eq(payments.apartmentId, apartments.id))
            .where(and(eq(apartments.buildingId, buildingId), eq(payments.year, year)))

        const paymentsByApartment = new Map<number, Record<number, { status: string; amount: number }>>()
        for (const p of rawPayments) {
            if (!paymentsByApartment.has(p.apartmentId)) {
                paymentsByApartment.set(p.apartmentId, {})
            }
            paymentsByApartment.get(p.apartmentId)![p.month] = { status: p.status, amount: p.amount }
        }

        // Build grid data
        const gridData: PaymentData[] = sortedApartments.map(apt => {
            const aptPayments = paymentsByApartment.get(apt.id) || {}
            let totalPaid = 0
            let totalOwed = 0

            // Calculate total paid and balance for the year so far
            const currentMonth = new Date().getMonth() + 1 // 1-12

            for (let m = 1; m <= 12; m++) {
                const p = aptPayments[m]
                if (p?.status === 'paid') {
                    totalPaid += p.amount
                }

                // If it's the current month or earlier, they should have paid.
                if (m <= currentMonth) {
                    totalOwed += monthlyQuota
                }
            }

            return {
                apartmentId: apt.id,
                unit: apt.unit,
                residentName: apt.residentName,
                payments: aptPayments,
                totalPaid,
                balance: Math.max(0, totalOwed - totalPaid)
            }
        })

        return { gridData, monthlyQuota }
    }

    async updatePaymentStatus(
        apartmentId: number,
        month: number,
        year: number,
        status: PaymentStatus,
        amount?: number
    ) {
        const existing = await db.select().from(payments).where(and(
            eq(payments.apartmentId, apartmentId),
            eq(payments.month, month),
            eq(payments.year, year)
        )).limit(1)

        // If amount is not provided, we might need to fetch the building quota
        let finalAmount = amount
        if (finalAmount === undefined) {
            if (status === 'paid') {
                const apt = await db.select({ buildingId: apartments.buildingId })
                    .from(apartments)
                    .where(eq(apartments.id, apartmentId))
                    .limit(1)

                if (apt.length > 0) {
                    const b = await db.select({ monthlyQuota: building.monthlyQuota })
                        .from(building)
                        .where(eq(building.id, apt[0].buildingId))
                        .limit(1)
                    finalAmount = b[0]?.monthlyQuota || 0
                } else {
                    finalAmount = 0
                }
            } else {
                finalAmount = 0
            }
        }

        if (existing.length > 0) {
            await db.update(payments)
                .set({ status, amount: finalAmount ?? 0, updatedAt: new Date() })
                .where(eq(payments.id, existing[0].id))
        } else {
            await db.insert(payments).values({
                apartmentId,
                month,
                year,
                status,
                amount: finalAmount ?? 0
            })
        }

        return true
    }

    async getResidentPaymentStatus(
        userId: string
    ): Promise<{ success: true; data: PaymentStatusSummary } | { success: false; error: string }> {
        try {
            // 1. Get user and check role
            const userResult = await db
                .select()
                .from(user)
                .where(eq(user.id, userId))
                .limit(1)

            if (!userResult.length) {
                return { success: false, error: "Utilizador não encontrado" }
            }

            const currentUser = userResult[0]
            const now = new Date()
            const currentMonth = now.getMonth() + 1
            const currentYear = now.getFullYear()

            // 2. IF MANAGER: Return Building Summary
            if (currentUser.role === 'manager') {
                const buildingId = currentUser.activeBuildingId
                if (!buildingId) return { success: false, error: "Nenhum condomínio ativo selecionado" }

                const buildingResult = await db.select().from(building).where(eq(building.id, buildingId)).limit(1)
                const currentBuilding = buildingResult[0]
                const monthlyQuota = currentBuilding.monthlyQuota || 0

                // Regular Quotas Summary
                const regPayments = await db
                    .select({
                        totalPaid: sum(payments.amount),
                        countPaid: count(payments.id),
                    })
                    .from(payments)
                    .innerJoin(apartments, eq(payments.apartmentId, apartments.id))
                    .where(and(
                        eq(apartments.buildingId, buildingId),
                        eq(payments.year, currentYear),
                        lte(payments.month, currentMonth),
                        eq(payments.status, 'paid')
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

                if (extraProjResult.length > 0) {
                    const projectIds = extraProjResult.map(p => p.id)
                    const allPayments = await db
                        .select()
                        .from(extraordinaryPayments)
                        .where(inArray(extraordinaryPayments.projectId, projectIds))

                    const paymentsByProject = new Map<number, typeof allPayments>()
                    for (const p of allPayments) {
                        if (!paymentsByProject.has(p.projectId)) {
                            paymentsByProject.set(p.projectId, [])
                        }
                        paymentsByProject.get(p.projectId)!.push(p)
                    }

                    for (const proj of extraProjResult) {
                        const payments = paymentsByProject.get(proj.id) || []
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
                }

                const extraBalance = extraTotalDue - extraTotalPaid
                const totalBalance = regBalance + extraBalance

                return {
                    success: true,
                    data: {
                        residentName: "Gestor",
                        apartmentUnit: currentBuilding.name,
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
                            balance: extraBalance,
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
                    monthlyQuota: building.monthlyQuota,
                })
                .from(apartments)
                .innerJoin(building, eq(apartments.buildingId, building.id))
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
                .from(payments)
                .where(and(
                    eq(payments.apartmentId, apartment.id),
                    eq(payments.year, currentYear)
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
                statusMessage = `Olá ${currentUser.name?.split(" ")[0] || ""}! Está tudo em dia. Os seus pagamentos estão regularizados.`
            } else if (totalOverdue <= 2 && totalBalance < 50000) {
                status = "warning"
                statusMessage = `Olá ${currentUser.name?.split(" ")[0] || ""}! Tem pagamentos pendentes. Regularize para evitar encargos adicionais.`
            } else {
                status = "critical"
                statusMessage = `Atenção ${currentUser.name?.split(" ")[0] || ""}! Existem pagamentos em atraso. Regularize urgentemente para evitar ações legais.`
            }

            return {
                success: true,
                data: {
                    residentName: currentUser.name || "Residente",
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

    async getApartmentPaymentStatus(
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
                .select({ name: user.name })
                .from(user)
                .innerJoin(apartments, eq(apartments.residentId, user.id))
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
                    expectedAmount: payments.amount,
                    paidAmount: sql<number>`CASE WHEN ${payments.status} = 'paid' THEN ${payments.amount} ELSE 0 END`,
                    month: payments.month,
                    year: payments.year,
                    status: payments.status,
                })
                .from(payments)
                .where(eq(payments.apartmentId, apartmentId))

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
}

export const paymentService = new PaymentService()
