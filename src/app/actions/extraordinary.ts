"use server"

/**
 * Server Actions for Extraordinary Projects & Payments
 * 
 * These actions handle CRUD operations for extraordinary payment projects
 * and their associated payment records.
 */

import { requireSession } from "@/lib/auth-helpers"
import { extraordinaryService } from "@/services/extraordinary.service"
import {
    CreateProjectInput,
    UpdateProjectInput,
    UpdatePaymentInput,
    ProjectListItem,
    ProjectDetail,
    ResidentProjectPayment,
    ApartmentPaymentData,
} from "@/services/extraordinary.service"

// Re-export types for usage in components
export type {
    CreateProjectInput,
    UpdateProjectInput,
    UpdatePaymentInput,
    ProjectListItem,
    ProjectDetail,
    ResidentProjectPayment,
    ApartmentPaymentData,
}

// ===========================================
// CREATE PROJECT
// ===========================================

export async function createExtraordinaryProject(
    input: CreateProjectInput
) {
    const session = await requireSession()
    return await extraordinaryService.createExtraordinaryProject(input, session.user.id)
}

// ===========================================
// UPDATE PROJECT
// ===========================================

export async function updateExtraordinaryProject(
    input: UpdateProjectInput
) {
    await requireSession()
    return await extraordinaryService.updateExtraordinaryProject(input)
}

// ===========================================
// GET PROJECTS LIST
// ===========================================

export async function getExtraordinaryProjects(
    buildingId: string
) {
    await requireSession()
    return await extraordinaryService.getExtraordinaryProjects(buildingId)
}

// ===========================================
// GET PROJECT DETAIL
// ===========================================

export async function getExtraordinaryProjectDetail(
    projectId: number
) {
    await requireSession()
    return await extraordinaryService.getExtraordinaryProjectDetail(projectId)
}

// ===========================================
// GET RESIDENT EXTRAORDINARY PAYMENTS
// ===========================================

export async function getResidentExtraordinaryPayments(
    userId: string
) {
    await requireSession()
    return await extraordinaryService.getResidentExtraordinaryPayments(userId)
}

// ===========================================
// UPDATE PAYMENT STATUS
// ===========================================

export async function updateExtraordinaryPayment(
    input: UpdatePaymentInput
) {
    const session = await requireSession()
    return await extraordinaryService.updateExtraordinaryPayment(input, session.user.id)
}

// ===========================================
// BULK UPDATE PAYMENTS
// ===========================================

export async function bulkUpdatePayments(
    paymentIds: number[],
    status: "paid" | "pending"
) {
    const session = await requireSession()
    return await extraordinaryService.bulkUpdatePayments(paymentIds, status, session.user.id)
}

// ===========================================
// ARCHIVE PROJECT
// ===========================================

export async function archiveExtraordinaryProject(
    projectId: number
) {
    await requireSession()
    return await extraordinaryService.archiveExtraordinaryProject(projectId)
}

// ===========================================
// DELETE PROJECT (hard delete)
// ===========================================

export async function deleteExtraordinaryProject(
    projectId: number
) {
    await requireSession()
    return await extraordinaryService.deleteExtraordinaryProject(projectId)
}

// ===========================================
// RECALCULATE PROJECT PAYMENTS
// ===========================================

export async function recalculateProjectPayments(
    projectId: number
) {
    await requireSession()
    return await extraordinaryService.recalculateProjectPayments(projectId)
}