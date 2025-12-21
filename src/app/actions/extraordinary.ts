"use server"

/**
 * Server Actions for Extraordinary Projects & Payments
 * 
 * These actions handle CRUD operations for extraordinary payment projects
 * and their associated payment records.
 */

// ===========================================
// IMPORTS
// ===========================================

import { db } from "@/db"
import { extraordinaryProjects, extraordinaryPayments, apartments, user as users } from "@/db/schema"
import { eq, and, desc, sql, inArray } from "drizzle-orm"
import { requireSession } from "@/lib/auth-helpers"
import { revalidatePath } from "next/cache"

import {
    calculateExtraordinaryPayments,
    validateProjectInput,
    determinePaymentStatus,
    calculateProjectStats,
    type ApartmentCalculation,
} from "@/lib/extraordinary-calculations"

// ===========================================
// TYPES
// ===========================================

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

export interface UpdatePaymentInput {
    paymentId: number
    status: "paid" | "pending" | "overdue" | "partial"
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
    status: string
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
    status: string
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

// ===========================================
// ACTION RESULTS
// ===========================================

type ActionResult<T = void> = 
    | { success: true; data: T }
    | { success: false; error: string }

// ===========================================
// CREATE PROJECT
// ===========================================

export async function createExtraordinaryProject(
    input: CreateProjectInput
): Promise<ActionResult<{ projectId: number }>> {
    try {
        // Validate session
        const session = await requireSession()
        
        // Validate input
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
        
        // Start transaction
        const result = await db.transaction(async (tx) => {
            // 1. Create the project
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
                    createdBy: session.user.id,
                })
                .returning()
            
            // 2. Get all apartments for this building with their permillage
            const buildingApartments = await tx
                .select({
                    id: apartments.id,
                    unit: apartments.unit,
                    permillage: apartments.permillage,
                })
                .from(apartments)
                .where(eq(apartments.buildingId, input.buildingId))
            
            // 3. Calculate payments for each apartment
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
            
            // 4. Create payment records for each apartment/installment
            const paymentRecords = calculations.apartments.flatMap((apt) =>
                apt.installments.map((inst) => ({
                    projectId: project.id,
                    apartmentId: apt.apartmentId,
                    installment: inst.number,
                    expectedAmount: inst.amount,
                    paidAmount: 0,
                    status: "pending",
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
        console.error("Error creating extraordinary project:", error)
        return { 
            success: false, 
            error: "Erro ao criar projeto. Tente novamente." 
        }
    }
}

// ===========================================
// GET PROJECTS LIST
// ===========================================

export async function getExtraordinaryProjects(
    buildingId: string
): Promise<ActionResult<ProjectListItem[]>> {
    try {
        await requireSession()
        
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
        
        // Get payment stats for each project
        const projectsWithStats = await Promise.all(
            projects.map(async (project) => {
                const payments = await db
                    .select({
                        paidAmount: extraordinaryPayments.paidAmount,
                        expectedAmount: extraordinaryPayments.expectedAmount,
                    })
                    .from(extraordinaryPayments)
                    .where(eq(extraordinaryPayments.projectId, project.id))
                
                const totalCollected = payments.reduce((sum, p) => sum + (p.paidAmount || 0), 0)
                const totalExpected = payments.reduce((sum, p) => sum + (p.expectedAmount || 0), 0)
                const progressPercent = totalExpected > 0
                    ? Math.round((totalCollected / totalExpected) * 100)
                    : 0
                
                return {
                    ...project,
                    totalCollected,
                    progressPercent,
                    status: project.status || 'active',
                    createdAt: project.createdAt || new Date(),
                }
            })
        )
        
        return { success: true, data: projectsWithStats }
    } catch (error) {
        console.error("Error fetching projects:", error)
        return { 
            success: false, 
            error: "Erro ao carregar projetos." 
        }
    }
}

// ===========================================
// GET PROJECT DETAIL
// ===========================================

export async function getExtraordinaryProjectDetail(
    projectId: number
): Promise<ActionResult<ProjectDetail>> {
    try {
        await requireSession()
        
        const [project] = await db
            .select()
            .from(extraordinaryProjects)
            .where(eq(extraordinaryProjects.id, projectId))
            .limit(1)
        
        if (!project) {
            return { success: false, error: "Projeto não encontrado" }
        }
        
        // Get all payments with apartment and resident info
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
        
        // Group by apartment
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
            
            // Add installment date
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
                status: payment.status as any,
            })
        })
        
        // Finalize apartment data
        const apartmentsList = Array.from(apartmentMap.values()).map(apt => {
            const balance = apt.totalShare - apt.totalPaid
            const allPaid = apt.installments.every(i => i.status === "paid")
            const somePaid = apt.installments.some(i => i.status === "paid" || i.status === "partial")
            
            return {
                ...apt,
                balance,
                status: (allPaid ? "complete" : somePaid ? "partial" : "pending") as any,
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
            status: project.status || 'active',
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
        console.error("Error fetching project detail:", error)
        return { 
            success: false, 
            error: "Erro ao carregar detalhes do projeto." 
        }
    }
}

// ===========================================
// UPDATE PAYMENT STATUS
// ===========================================

export async function updateExtraordinaryPayment(
    input: UpdatePaymentInput
): Promise<ActionResult<void>> {
    try {
        const session = await requireSession()
        
        const [payment] = await db
            .select()
            .from(extraordinaryPayments)
            .where(eq(extraordinaryPayments.id, input.paymentId))
            .limit(1)
        
        if (!payment) {
            return { success: false, error: "Pagamento não encontrado" }
        }
        
        // Determine paid amount based on status
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
                updatedBy: session.user.id,
            })
            .where(eq(extraordinaryPayments.id, input.paymentId))
        
        revalidatePath(`/dashboard/extraordinary/${payment.projectId}`)
        
        return { success: true, data: undefined }
    } catch (error) {
        console.error("Error updating payment:", error)
        return { 
            success: false, 
            error: "Erro ao atualizar pagamento." 
        }
    }
}

// ===========================================
// BULK UPDATE PAYMENTS
// ===========================================

export async function bulkUpdatePayments(
    paymentIds: number[],
    status: "paid" | "pending"
): Promise<ActionResult<{ updated: number }>> {
    try {
        const session = await requireSession()
        
        // Get payments to determine amounts
        const paymentsToUpdate = await db
            .select()
            .from(extraordinaryPayments)
            .where(inArray(extraordinaryPayments.id, paymentIds))
        
        if (paymentsToUpdate.length === 0) {
            return { success: true, data: { updated: 0 } }
        }

        // Update each payment
        for (const payment of paymentsToUpdate) {
            await db
                .update(extraordinaryPayments)
                .set({
                    status,
                    paidAmount: status === "paid" ? payment.expectedAmount : 0,
                    paidAt: status === "paid" ? new Date() : null,
                    updatedAt: new Date(),
                    updatedBy: session.user.id,
                })
                .where(eq(extraordinaryPayments.id, payment.id))
        }
        
        const firstPayment = paymentsToUpdate[0]
        if (firstPayment) {
            revalidatePath(`/dashboard/extraordinary/${firstPayment.projectId}`)
        }
        revalidatePath("/dashboard/extraordinary")
        
        return { success: true, data: { updated: paymentsToUpdate.length } }
    } catch (error) {
        console.error("Error bulk updating payments:", error)
        return { 
            success: false, 
            error: "Erro ao atualizar pagamentos." 
        }
    }
}

// ===========================================
// DELETE/ARCHIVE PROJECT
// ===========================================

export async function archiveExtraordinaryProject(
    projectId: number
): Promise<ActionResult<void>> {
    try {
        await requireSession()
        
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
        console.error("Error archiving project:", error)
        return { 
            success: false, 
            error: "Erro ao arquivar projeto." 
        }
    }
}

// ===========================================
// RECALCULATE PROJECT PAYMENTS
// ===========================================

export async function recalculateProjectPayments(
    projectId: number
): Promise<ActionResult<{ recalculated: number }>> {
    try {
        await requireSession()
        
        const [project] = await db
            .select()
            .from(extraordinaryProjects)
            .where(eq(extraordinaryProjects.id, projectId))
            .limit(1)
        
        if (!project) {
            return { success: false, error: "Projeto não encontrado" }
        }
        
        // Get current apartments
        const buildingApartments = await db
            .select()
            .from(apartments)
            .where(eq(apartments.buildingId, project.buildingId))
        
        // Recalculate
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
        
        // Update expected amounts (preserving paid amounts)
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
        console.error("Error recalculating payments:", error)
        return { 
            success: false, 
            error: "Erro ao recalcular pagamentos." 
        }
    }
}
