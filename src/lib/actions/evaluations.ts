"use server"

import { revalidatePath } from "next/cache"
import { requireSession, requireBuildingAccess } from "@/lib/auth-helpers"
import { evaluationService, SubmitEvaluationInput } from "@/services/evaluation.service"
import { submitEvaluationSchema } from "@/lib/zod-schemas"
import { ActionResult } from "@/lib/types"
import { db } from "@/db"
import { building } from "@/db/schema"
import { eq } from "drizzle-orm"
import { createNotification, notifyEvaluationOpen } from "@/lib/actions/notification"

// Get evaluation period status
export async function getEvaluationStatus(buildingId: string) {
    const session = await requireSession()

    if (session.user.role === 'manager') {
        await requireBuildingAccess(buildingId)
    } else if (session.user.buildingId !== buildingId) {
        throw new Error("Unauthorized")
    }

    const { year, month } = evaluationService.getCurrentPeriod()
    const isOpen = evaluationService.isEvaluationPeriodOpen()
    const daysUntilOpen = evaluationService.getDaysUntilOpen()
    const daysRemaining = evaluationService.getDaysRemaining()
    const userEvaluation = await evaluationService.getUserEvaluation(
        buildingId,
        session.user.id,
        year,
        month
    )

    return {
        year,
        month,
        isOpen,
        daysUntilOpen,
        daysRemaining,
        hasSubmitted: !!userEvaluation,
        userEvaluation: userEvaluation ? { ...userEvaluation, userName: session.user.name } : null,
    }
}

// Get current month averages
export async function getCurrentMonthAverages(buildingId: string) {
    const session = await requireSession()

    if (session.user.role === 'manager') {
        await requireBuildingAccess(buildingId)
    } else if (session.user.buildingId !== buildingId) {
        throw new Error("Unauthorized")
    }

    const { year, month } = evaluationService.getCurrentPeriod()
    return await evaluationService.getMonthAverages(buildingId, year, month)
}

// Get historical averages
export async function getHistoricalAverages(buildingId: string, months: number = 6) {
    const session = await requireSession()

    if (session.user.role === 'manager') {
        await requireBuildingAccess(buildingId)
    } else if (session.user.buildingId !== buildingId) {
        throw new Error("Unauthorized")
    }

    return await evaluationService.getHistoricalAverages(buildingId, months)
}

// Get all evaluations for current month (manager only)
export async function getMonthEvaluations(buildingId: string) {
    const { session } = await requireBuildingAccess(buildingId)

    if (session.user.role !== 'manager') {
        throw new Error("Unauthorized")
    }

    const { year, month } = evaluationService.getCurrentPeriod()
    return await evaluationService.getMonthEvaluations(buildingId, year, month)
}

// Get submission stats (manager only)
export async function getSubmissionStats(buildingId: string, totalResidents: number) {
    const { session } = await requireBuildingAccess(buildingId)

    if (session.user.role !== 'manager') {
        throw new Error("Unauthorized")
    }

    const { year, month } = evaluationService.getCurrentPeriod()
    const submissionCount = await evaluationService.getSubmissionCount(buildingId, year, month)

    return {
        submitted: submissionCount,
        total: totalResidents,
        percentage: totalResidents > 0 ? Math.round((submissionCount / totalResidents) * 100) : 0,
    }
}

// Submit evaluation
export async function submitEvaluation(
    input: Omit<SubmitEvaluationInput, 'year' | 'month'>
): Promise<ActionResult<void>> {
    const session = await requireSession()

    // Verify building access
    if (session.user.role === 'manager') {
        await requireBuildingAccess(input.buildingId)
    } else if (session.user.buildingId !== input.buildingId) {
        return { success: false, error: "Sem permissão" }
    }

    // Check if evaluation period is open
    if (!evaluationService.isEvaluationPeriodOpen()) {
        return { success: false, error: "O período de avaliação ainda não está aberto" }
    }

    const { year, month } = evaluationService.getCurrentPeriod()

    const validated = submitEvaluationSchema.safeParse({
        ...input,
        year,
        month,
    })

    if (!validated.success) {
        return { success: false, error: validated.error.issues[0].message }
    }

    try {
        await evaluationService.submitEvaluation(validated.data, session.user.id)

        // Notify manager about new evaluation
        const buildingInfo = await db.query.building.findFirst({
            where: eq(building.id, input.buildingId),
            columns: { managerId: true }
        })

        if (buildingInfo && buildingInfo.managerId !== session.user.id) {
            await createNotification({
                buildingId: input.buildingId,
                userId: buildingInfo.managerId,
                title: "Nova Avaliação Recebida",
                message: `Um condómino submeteu a avaliação de ${new Date().toLocaleString('pt-PT', { month: 'long' })}`,
                type: "evaluation_open", // Using explicit type or generic
                link: `/dashboard/evaluations`
            })
        }

        revalidatePath("/dashboard/evaluations")
        revalidatePath("/dashboard")
        return { success: true, data: undefined }
    } catch {
        return { success: false, error: "Erro ao submeter avaliação" }
    }
}

// Send evaluation reminder (manager only)
export async function sendEvaluationReminder(buildingId: string): Promise<ActionResult<void>> {
    const { session } = await requireBuildingAccess(buildingId)

    if (session.user.role !== 'manager') {
        return { success: false, error: "Apenas gestores podem enviar lembretes" }
    }

    if (!evaluationService.isEvaluationPeriodOpen()) {
        return { success: false, error: "O período de avaliação não está aberto" }
    }

    try {
        await notifyEvaluationOpen(buildingId)
        return { success: true, data: undefined }
    } catch {
        return { success: false, error: "Erro ao enviar lembrete" }
    }
}