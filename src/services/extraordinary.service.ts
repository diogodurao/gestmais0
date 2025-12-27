
import { db } from "@/db"
import { extraordinaryProjects, extraordinaryPayments, apartments, user as users } from "@/db/schema"
import { eq, and, desc, inArray, sql, sum } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import {
    calculateExtraordinaryPayments,
    validateProjectInput,
} from "@/lib/extraordinary-calculations"

// ===========================================
// TYPES
// ===========================================

import { PaymentStatus, ProjectStatus } from "@/lib/types"

export interface CreateProjectInput {
    buildingId: string
    name: string
    description?: string
    totalBudget: number // in cents
    numInstallments: number
    startMonth: number
    startYear: number
    documentUrl?: string
    documentName?: string
}

export interface UpdateProjectInput {
    projectId: number
    name?: string
    description?: string
    documentUrl?: string
    documentName?: string
    status?: ProjectStatus
}

export interface UpdatePaymentInput {
    paymentId: number
    status: PaymentStatus
    paidAmount?: number
    paymentMethod?: string
    notes?: string
}

export interface ProjectListItem {
    id: number
    name: string
    totalBudget: number
    numInstallments: number
    startMonth: number
    startYear: number
    status: ProjectStatus
    createdAt: Date
    totalCollected: number
    progressPercent: number
}

export interface ProjectDetail {
    id: number
    buildingId: string
    name: string
    description: string | null
    totalBudget: number
    numInstallments: number
    startMonth: number
    startYear: number
    documentUrl: string | null
    documentName: string | null
    status: ProjectStatus
    createdAt: Date
    payments: ApartmentPaymentData[]
    stats: {
        totalExpected: number
        totalPaid: number
        progressPercent: number
        apartmentsCompleted: number
        apartmentsTotal: number
    }
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
        status: "paid" | "pending" | "overdue" | "partial"
    }>
}

export interface ResidentProjectPayment {
    projectId: number
    projectName: string
    totalBudget: number
    numInstallments: number
    startMonth: number
    startYear: number
    status: string
    apartmentUnit: string
    permillage: number
    totalShare: number
    totalPaid: number
    balance: number
    installments: Array<{
        id: number
        number: number
        month: number
        year: number
        expectedAmount: number
        paidAmount: number
        status: "paid" | "pending" | "overdue" | "partial"
    }>
}

type ActionResult<T = void> =
    | { success: true; data: T }
    | { success: false; error: string }

export class ExtraordinaryService {
    async createExtraordinaryProject(
        input: CreateProjectInput,
        userId: string
    ): Promise<ActionResult<{ projectId: number }>> {
        try {
            const validation = validateProjectInput({
                name: input.name,
                totalBudget: input.totalBudget,
                numInstallments: input.numInstallments,
                startMonth: input.startMonth,
                startYear: input.startYear,
            })

            if (!validation.valid) {
                return { success: false, error: validation.errors.join("; ") }
            }

            const result = await db.transaction(async (tx) => {
                const [project] = await tx
                    .insert(extraordinaryProjects)
                    .values({
                        buildingId: input.buildingId,
                        name: input.name.trim(),
                        description: input.description?.trim() || null,
                        totalBudget: input.totalBudget,
                        numInstallments: input.numInstallments,
                        startMonth: input.startMonth,
                        startYear: input.startYear,
                        documentUrl: input.documentUrl || null,
                        documentName: input.documentName || null,
                        status: "active",
                        createdBy: userId,
                    })
                    .returning()

                const buildingApartments = await tx
                    .select({
                        id: apartments.id,
                        unit: apartments.unit,
                        permillage: apartments.permillage,
                    })
                    .from(apartments)
                    .where(eq(apartments.buildingId, input.buildingId))

                const validApartments = buildingApartments.map(apt => ({
                    id: apt.id,
                    unit: apt.unit,
                    permillage: apt.permillage || 0
                }))

                const calculations = calculateExtraordinaryPayments(
                    input.totalBudget,
                    input.numInstallments,
                    input.startMonth,
                    input.startYear,
                    validApartments
                )

                const paymentRecords = calculations.apartments.flatMap((apt) =>
                    apt.installments.map((inst) => ({
                        projectId: project.id,
                        apartmentId: apt.apartmentId,
                        installment: inst.number,
                        expectedAmount: inst.amount,
                        paidAmount: 0,
                        status: "pending" as const,
                    }))
                )

                if (paymentRecords.length > 0) {
                    await tx.insert(extraordinaryPayments).values(paymentRecords)
                }

                return project
            })

            revalidatePath("/dashboard/extraordinary")

            return {
                success: true,
                data: { projectId: result.id }
            }
        } catch (error) {

            return {
                success: false,
                error: "Erro ao criar projeto. Tente novamente."
            }
        }
    }

    async updateExtraordinaryProject(
        input: UpdateProjectInput
    ): Promise<ActionResult<void>> {
        try {
            const [project] = await db
                .select()
                .from(extraordinaryProjects)
                .where(eq(extraordinaryProjects.id, input.projectId))
                .limit(1)

            if (!project) {
                return { success: false, error: "Projeto não encontrado" }
            }

            const updateData: Record<string, unknown> = {
                updatedAt: new Date(),
            }

            if (input.name !== undefined) updateData.name = input.name.trim()
            if (input.description !== undefined) updateData.description = input.description?.trim() || null
            if (input.documentUrl !== undefined) updateData.documentUrl = input.documentUrl || null
            if (input.documentName !== undefined) updateData.documentName = input.documentName || null
            if (input.status !== undefined) updateData.status = input.status

            await db
                .update(extraordinaryProjects)
                .set(updateData)
                .where(eq(extraordinaryProjects.id, input.projectId))

            revalidatePath(`/dashboard/extraordinary/${input.projectId}`)
            revalidatePath("/dashboard/extraordinary")

            return { success: true, data: undefined }
        } catch (error) {

            return {
                success: false,
                error: "Erro ao atualizar projeto."
            }
        }
    }

    async getExtraordinaryProjects(
        buildingId: string
    ): Promise<ActionResult<ProjectListItem[]>> {
        try {
            const projects = await db
                .select({
                    id: extraordinaryProjects.id,
                    name: extraordinaryProjects.name,
                    totalBudget: extraordinaryProjects.totalBudget,
                    numInstallments: extraordinaryProjects.numInstallments,
                    startMonth: extraordinaryProjects.startMonth,
                    startYear: extraordinaryProjects.startYear,
                    status: extraordinaryProjects.status,
                    createdAt: extraordinaryProjects.createdAt,
                })
                .from(extraordinaryProjects)
                .where(eq(extraordinaryProjects.buildingId, buildingId))
                .orderBy(desc(extraordinaryProjects.createdAt))

            if (projects.length === 0) {
                return { success: true, data: [] }
            }

            const projectIds = projects.map(p => p.id)

            const stats = await db
                .select({
                    projectId: extraordinaryPayments.projectId,
                    totalPaid: sum(extraordinaryPayments.paidAmount),
                    totalExpected: sum(extraordinaryPayments.expectedAmount),
                })
                .from(extraordinaryPayments)
                .where(inArray(extraordinaryPayments.projectId, projectIds))
                .groupBy(extraordinaryPayments.projectId)

            const statsMap = new Map(stats.map(s => [s.projectId, s]))

            const projectsWithStats = projects.map((project) => {
                const projectStats = statsMap.get(project.id)
                const totalCollected = Number(projectStats?.totalPaid) || 0
                const totalExpected = Number(projectStats?.totalExpected) || 0
                const progressPercent = totalExpected > 0
                    ? Math.round((totalCollected / totalExpected) * 100)
                    : 0

                return {
                    ...project,
                    totalCollected,
                    progressPercent,
                    status: (project.status || 'active') as ProjectStatus,
                    createdAt: project.createdAt || new Date(),
                }
            })

            return { success: true, data: projectsWithStats }
        } catch (error) {

            return {
                success: false,
                error: "Erro ao carregar projetos."
            }
        }
    }

    async getExtraordinaryProjectDetail(
        projectId: number
    ): Promise<ActionResult<ProjectDetail>> {
        try {
            const [project] = await db
                .select()
                .from(extraordinaryProjects)
                .where(eq(extraordinaryProjects.id, projectId))
                .limit(1)

            if (!project) {
                return { success: false, error: "Projeto não encontrado" }
            }

            const paymentsData = await db
                .select({
                    payment: extraordinaryPayments,
                    apartment: apartments,
                    resident: users,
                })
                .from(extraordinaryPayments)
                .innerJoin(apartments, eq(extraordinaryPayments.apartmentId, apartments.id))
                .leftJoin(users, eq(apartments.residentId, users.id))
                .where(eq(extraordinaryPayments.projectId, projectId))
                .orderBy(apartments.unit, extraordinaryPayments.installment)

            const apartmentMap = new Map<number, ApartmentPaymentData>()

            paymentsData.forEach(({ payment, apartment, resident }) => {
                if (!apartmentMap.has(apartment.id)) {
                    apartmentMap.set(apartment.id, {
                        apartmentId: apartment.id,
                        unit: apartment.unit,
                        residentName: resident?.name || null,
                        permillage: apartment.permillage || 0,
                        totalShare: 0,
                        totalPaid: 0,
                        balance: 0,
                        status: "pending",
                        installments: [],
                    })
                }

                const aptData = apartmentMap.get(apartment.id)!
                aptData.totalShare += payment.expectedAmount
                aptData.totalPaid += payment.paidAmount || 0

                let month = project.startMonth + payment.installment - 1
                let year = project.startYear
                while (month > 12) {
                    month -= 12
                    year++
                }

                aptData.installments.push({
                    id: payment.id,
                    number: payment.installment,
                    month,
                    year,
                    expectedAmount: payment.expectedAmount,
                    paidAmount: payment.paidAmount || 0,
                    status: payment.status as "paid" | "pending" | "overdue" | "partial",
                })
            })

            const apartmentsList = Array.from(apartmentMap.values()).map(apt => {
                const balance = apt.totalShare - apt.totalPaid
                const allPaid = apt.installments.every(i => i.status === "paid")
                const somePaid = apt.installments.some(i => i.status === "paid" || i.status === "partial")

                return {
                    ...apt,
                    balance,
                    status: (allPaid ? "complete" : somePaid ? "partial" : "pending") as "complete" | "partial" | "pending",
                    installments: apt.installments.sort((a, b) => a.number - b.number),
                }
            })

            const totalExpected = apartmentsList.reduce((sum, a) => sum + a.totalShare, 0)
            const totalPaid = apartmentsList.reduce((sum, a) => sum + a.totalPaid, 0)

            const result: ProjectDetail = {
                id: project.id,
                buildingId: project.buildingId,
                name: project.name,
                description: project.description,
                totalBudget: project.totalBudget,
                numInstallments: project.numInstallments,
                startMonth: project.startMonth,
                startYear: project.startYear,
                documentUrl: project.documentUrl,
                documentName: project.documentName,
                status: (project.status || 'active') as ProjectStatus,
                createdAt: project.createdAt || new Date(),
                payments: apartmentsList,
                stats: {
                    totalExpected,
                    totalPaid,
                    progressPercent: totalExpected > 0 ? Math.round((totalPaid / totalExpected) * 100) : 0,
                    apartmentsCompleted: apartmentsList.filter(a => a.status === "complete").length,
                    apartmentsTotal: apartmentsList.length,
                }
            }

            return { success: true, data: result }
        } catch (error) {

            return {
                success: false,
                error: "Erro ao carregar detalhes do projeto."
            }
        }
    }

    async getResidentExtraordinaryPayments(
        userId: string
    ): Promise<ActionResult<ResidentProjectPayment[]>> {
        try {
            const [apartment] = await db
                .select()
                .from(apartments)
                .where(eq(apartments.residentId, userId))
                .limit(1)

            if (!apartment) {
                return { success: true, data: [] }
            }

            const projects = await db
                .select()
                .from(extraordinaryProjects)
                .where(eq(extraordinaryProjects.buildingId, apartment.buildingId))
                .orderBy(desc(extraordinaryProjects.createdAt))

            if (projects.length === 0) {
                return { success: true, data: [] }
            }

            const projectIds = projects.map(p => p.id)

            // Fetch ALL payments for this apartment across all found projects at once
            const allPayments = await db
                .select()
                .from(extraordinaryPayments)
                .where(
                    and(
                        inArray(extraordinaryPayments.projectId, projectIds),
                        eq(extraordinaryPayments.apartmentId, apartment.id)
                    )
                )
                .orderBy(extraordinaryPayments.installment)

            // Group payments by projectId
            const paymentsByProject = new Map<number, typeof allPayments>()
            for (const p of allPayments) {
                if (!paymentsByProject.has(p.projectId)) {
                    paymentsByProject.set(p.projectId, [])
                }
                paymentsByProject.get(p.projectId)!.push(p)
            }

            const results: ResidentProjectPayment[] = []

            for (const project of projects) {
                const payments = paymentsByProject.get(project.id) || []

                if (payments.length === 0) continue

                const totalShare = payments.reduce((sum, p) => sum + p.expectedAmount, 0)
                const totalPaid = payments.reduce((sum, p) => sum + (p.paidAmount || 0), 0)

                const installments = payments.map(p => {
                    let month = project.startMonth + p.installment - 1
                    let year = project.startYear
                    while (month > 12) {
                        month -= 12
                        year++
                    }

                    return {
                        id: p.id,
                        number: p.installment,
                        month,
                        year,
                        expectedAmount: p.expectedAmount,
                        paidAmount: p.paidAmount || 0,
                        status: p.status as "paid" | "pending" | "overdue" | "partial",
                    }
                })

                results.push({
                    projectId: project.id,
                    projectName: project.name,
                    totalBudget: project.totalBudget,
                    numInstallments: project.numInstallments,
                    startMonth: project.startMonth,
                    startYear: project.startYear,
                    status: project.status || 'active',
                    apartmentUnit: apartment.unit,
                    permillage: apartment.permillage || 0,
                    totalShare,
                    totalPaid,
                    balance: totalShare - totalPaid,
                    installments,
                })
            }

            return { success: true, data: results }
        } catch (error) {

            return {
                success: false,
                error: "Erro ao carregar pagamentos."
            }
        }
    }

    async updateExtraordinaryPayment(
        input: UpdatePaymentInput,
        userId: string
    ): Promise<ActionResult<void>> {
        try {
            const [payment] = await db
                .select()
                .from(extraordinaryPayments)
                .where(eq(extraordinaryPayments.id, input.paymentId))
                .limit(1)

            if (!payment) {
                return { success: false, error: "Pagamento não encontrado" }
            }

            let paidAmount = input.paidAmount
            if (input.status === "paid" && (paidAmount === undefined || paidAmount === 0)) {
                paidAmount = payment.expectedAmount
            } else if (input.status === "pending") {
                paidAmount = 0
            }

            await db
                .update(extraordinaryPayments)
                .set({
                    status: input.status,
                    paidAmount: paidAmount ?? payment.paidAmount,
                    paidAt: input.status === "paid" ? new Date() : null,
                    paymentMethod: input.paymentMethod,
                    notes: input.notes,
                    updatedAt: new Date(),
                    updatedBy: userId,
                })
                .where(eq(extraordinaryPayments.id, input.paymentId))

            revalidatePath(`/dashboard/extraordinary/${payment.projectId}`)

            return { success: true, data: undefined }
        } catch (error) {

            return {
                success: false,
                error: "Erro ao atualizar pagamento."
            }
        }
    }

    async bulkUpdatePayments(
        paymentIds: number[],
        status: "paid" | "pending",
        userId: string
    ): Promise<ActionResult<{ updated: number }>> {
        try {
            const paymentsToUpdate = await db
                .select()
                .from(extraordinaryPayments)
                .where(inArray(extraordinaryPayments.id, paymentIds))

            if (paymentsToUpdate.length === 0) {
                return { success: true, data: { updated: 0 } }
            }

            await Promise.all(paymentsToUpdate.map(payment =>
                db.update(extraordinaryPayments)
                    .set({
                        status,
                        paidAmount: status === "paid" ? payment.expectedAmount : 0,
                        paidAt: status === "paid" ? new Date() : null,
                        updatedAt: new Date(),
                        updatedBy: userId,
                    })
                    .where(eq(extraordinaryPayments.id, payment.id))
            ))

            const firstPayment = paymentsToUpdate[0]
            if (firstPayment) {
                revalidatePath(`/dashboard/extraordinary/${firstPayment.projectId}`)
            }
            revalidatePath("/dashboard/extraordinary")

            return { success: true, data: { updated: paymentsToUpdate.length } }
        } catch (error) {

            return {
                success: false,
                error: "Erro ao atualizar pagamentos."
            }
        }
    }

    async archiveExtraordinaryProject(
        projectId: number
    ): Promise<ActionResult<void>> {
        try {
            await db
                .update(extraordinaryProjects)
                .set({
                    status: "archived",
                    updatedAt: new Date(),
                })
                .where(eq(extraordinaryProjects.id, projectId))

            revalidatePath("/dashboard/extraordinary")

            return { success: true, data: undefined }
        } catch (error) {

            return {
                success: false,
                error: "Erro ao arquivar projeto."
            }
        }
    }

    async deleteExtraordinaryProject(
        projectId: number
    ): Promise<ActionResult<void>> {
        try {
            await db.transaction(async (tx) => {
                // Delete all payments first
                await tx
                    .delete(extraordinaryPayments)
                    .where(eq(extraordinaryPayments.projectId, projectId))

                // Delete the project
                await tx
                    .delete(extraordinaryProjects)
                    .where(eq(extraordinaryProjects.id, projectId))
            })

            revalidatePath("/dashboard/extraordinary")

            return { success: true, data: undefined }
        } catch (error) {

            return {
                success: false,
                error: "Erro ao eliminar projeto."
            }
        }
    }

    async recalculateProjectPayments(
        projectId: number
    ): Promise<ActionResult<{ recalculated: number }>> {
        try {
            const [project] = await db
                .select()
                .from(extraordinaryProjects)
                .where(eq(extraordinaryProjects.id, projectId))
                .limit(1)

            if (!project) {
                return { success: false, error: "Projeto não encontrado" }
            }

            const buildingApartments = await db
                .select()
                .from(apartments)
                .where(eq(apartments.buildingId, project.buildingId))

            const validApartments = buildingApartments.map(apt => ({
                id: apt.id,
                unit: apt.unit,
                permillage: apt.permillage || 0
            }))

            const calculations = calculateExtraordinaryPayments(
                project.totalBudget,
                project.numInstallments,
                project.startMonth,
                project.startYear,
                validApartments
            )

            let updatedCount = 0
            for (const apt of calculations.apartments) {
                for (const inst of apt.installments) {
                    await db
                        .update(extraordinaryPayments)
                        .set({
                            expectedAmount: inst.amount,
                            updatedAt: new Date(),
                        })
                        .where(
                            and(
                                eq(extraordinaryPayments.projectId, projectId),
                                eq(extraordinaryPayments.apartmentId, apt.apartmentId),
                                eq(extraordinaryPayments.installment, inst.number)
                            )
                        )
                    updatedCount++
                }
            }

            revalidatePath(`/dashboard/extraordinary/${projectId}`)

            return { success: true, data: { recalculated: updatedCount } }
        } catch (error) {

            return {
                success: false,
                error: "Erro ao recalcular pagamentos."
            }
        }
    }
}

export const extraordinaryService = new ExtraordinaryService()
