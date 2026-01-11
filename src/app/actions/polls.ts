"use server"

import { revalidatePath } from "next/cache"
import { requireSession, requireBuildingAccess } from "@/lib/session"
import { pollService, CreatePollInput, CastVoteInput } from "@/services/poll.service"
import { createPollSchema, castVoteSchema } from "@/lib/zod-schemas"
import { ActionResult, PollResults } from "@/lib/types"
import { db } from "@/db"
import { apartments, building } from "@/db/schema"
import { notifyBuildingResidents, createNotification, notifyPollClosed } from "@/app/actions/notification"
import { eq, and } from "drizzle-orm"

// Get all polls for building
export async function getPolls(buildingId: string, status?: "open" | "closed") {
    const session = await requireSession()

    if (session.user.role === 'manager') {
        await requireBuildingAccess(buildingId)
    } else if (session.user.buildingId !== buildingId) {
        throw new Error("Unauthorized")
    }

    return await pollService.getByBuilding(buildingId, status)
}

// Get single poll
export async function getPoll(id: number) {
    const session = await requireSession()
    const poll = await pollService.getById(id)

    if (!poll) return null

    if (session.user.role === 'manager') {
        await requireBuildingAccess(poll.buildingId)
    } else if (session.user.buildingId !== poll.buildingId) {
        throw new Error("Unauthorized")
    }

    return poll
}

// Get poll votes (for results display)
export async function getPollVotes(pollId: number) {
    const session = await requireSession()
    const poll = await pollService.getById(pollId)

    if (!poll) return []

    if (session.user.role === 'manager') {
        await requireBuildingAccess(poll.buildingId)
    } else if (session.user.buildingId !== poll.buildingId) {
        throw new Error("Unauthorized")
    }

    return await pollService.getVotes(pollId)
}

// Get current user's vote
export async function getUserVote(pollId: number) {
    const session = await requireSession()
    return await pollService.getUserVote(pollId, session.user.id)
}

// Get calculated results
export async function getPollResults(pollId: number): Promise<PollResults | { restricted: true; message: string } | null> {
    const session = await requireSession()
    const poll = await pollService.getById(pollId)

    if (!poll) return null

    // Manager can always see results
    // Residents can only see after voting
    if (session.user.role !== 'manager') {
        const userVote = await pollService.getUserVote(pollId, session.user.id)
        if (!userVote) {
            return { restricted: true, message: "Vote primeiro para ver os resultados" } as const
        }
    }

    return await pollService.calculateResults(pollId)
}

// Create poll (manager only)
export async function createPoll(input: CreatePollInput): Promise<ActionResult<{ id: number }>> {
    const { session } = await requireBuildingAccess(input.buildingId)

    if (session.user.role !== 'manager') {
        return { success: false, error: "Apenas gestores podem criar votações" }
    }

    const validated = createPollSchema.safeParse(input)
    if (!validated.success) {
        return { success: false, error: validated.error.issues[0].message }
    }

    // Validate options for choice types
    if (validated.data.type !== 'yes_no') {
        if (!validated.data.options || validated.data.options.length < 2) {
            return { success: false, error: "Adicione pelo menos 2 opções" }
        }
    }

    try {
        const created = await pollService.create(validated.data, session.user.id)

        // Notify all residents about new poll
        await notifyBuildingResidents({
            buildingId: input.buildingId,
            title: "Nova Votação Disponível",
            message: `Foi criada uma nova votação: "${validated.data.title}"`,
            type: "poll",
            link: `/dashboard/polls/${created.id}`
        }, session.user.id) // Exclude creator (manager)

        revalidatePath("/dashboard/polls")
        return { success: true, data: { id: created.id } }
    } catch {
        return { success: false, error: "Erro ao criar votação" }
    }
}

// Cast vote (any building member)
export async function castVote(input: CastVoteInput): Promise<ActionResult<void>> {
    const session = await requireSession()
    const poll = await pollService.getById(input.pollId)

    if (!poll) {
        return { success: false, error: "Votação não encontrada" }
    }

    // Verify building access
    if (session.user.role === 'manager') {
        await requireBuildingAccess(poll.buildingId)
    } else if (session.user.buildingId !== poll.buildingId) {
        return { success: false, error: "Sem permissão" }
    }

    // Check if poll is open
    if (poll.status !== 'open') {
        return { success: false, error: "Esta votação já está encerrada" }
    }

    const validated = castVoteSchema.safeParse(input)
    if (!validated.success) {
        return { success: false, error: validated.error.issues[0].message }
    }

    // Validate vote against poll type
    if (poll.type === 'yes_no') {
        const validVotes = ['yes', 'no', 'abstain']
        if (!validVotes.includes(validated.data.vote as string)) {
            return { success: false, error: "Voto inválido" }
        }
    } else {
        const voteArray = validated.data.vote as string[]
        if (!voteArray.includes('abstain')) {
            // Validate options exist
            const validOptions = poll.options || []
            for (const v of voteArray) {
                if (!validOptions.includes(v)) {
                    return { success: false, error: "Opção inválida" }
                }
            }
        }

        // For single choice, ensure only one option
        if (poll.type === 'single_choice' && !voteArray.includes('abstain') && voteArray.length > 1) {
            return { success: false, error: "Selecione apenas uma opção" }
        }
    }

    try {
        // Get user's apartment for weighted voting
        // We look for an apartment assigned to this user in this building
        const apartment = await db.query.apartments.findFirst({
            where: and(
                eq(apartments.residentId, session.user.id),
                eq(apartments.buildingId, poll.buildingId)
            ),
            columns: { id: true }
        })
        const apartmentId = apartment?.id || null

        await pollService.castVote(validated.data, session.user.id, apartmentId)

        // Notify manager about new vote
        const buildingInfo = await db.query.building.findFirst({
            where: eq(building.id, poll.buildingId),
            columns: { managerId: true }
        })

        if (buildingInfo && buildingInfo.managerId !== session.user.id) {
            await createNotification({
                buildingId: poll.buildingId,
                userId: buildingInfo.managerId,
                title: "Novo Voto Registado",
                message: `Um condómino votou na votação: "${poll.title}"`,
                type: "poll",
                link: `/dashboard/polls/${poll.id}`
            })
        }

        revalidatePath(`/dashboard/polls/${input.pollId}`)
        return { success: true, data: undefined }
    } catch {
        return { success: false, error: "Erro ao registar voto" }
    }
}

// Close poll (manager only)
export async function closePoll(pollId: number): Promise<ActionResult<void>> {
    const session = await requireSession()
    const poll = await pollService.getById(pollId)

    if (!poll) {
        return { success: false, error: "Votação não encontrada" }
    }

    await requireBuildingAccess(poll.buildingId)

    if (session.user.role !== 'manager') {
        return { success: false, error: "Apenas gestores podem encerrar votações" }
    }

    if (poll.status === 'closed') {
        return { success: false, error: "Votação já está encerrada" }
    }

    try {
        await pollService.close(pollId)

        // Notify residents about results
        await notifyPollClosed(
            poll.buildingId,
            poll.title,
            pollId
        )

        revalidatePath("/dashboard/polls")
        revalidatePath(`/dashboard/polls/${pollId}`)
        return { success: true, data: undefined }
    } catch {
        return { success: false, error: "Erro ao encerrar votação" }
    }
}

// Delete poll (manager only, no votes)
export async function deletePoll(pollId: number): Promise<ActionResult<void>> {
    const session = await requireSession()
    const poll = await pollService.getById(pollId)

    if (!poll) {
        return { success: false, error: "Votação não encontrada" }
    }

    await requireBuildingAccess(poll.buildingId)

    if (session.user.role !== 'manager') {
        return { success: false, error: "Apenas gestores podem eliminar votações" }
    }

    try {
        await pollService.delete(pollId)
        revalidatePath("/dashboard/polls")
        return { success: true, data: undefined }
    } catch (error) {
        if (error instanceof Error && error.message === "Cannot delete poll with votes") {
            return { success: false, error: "Não é possível eliminar votações com votos" }
        }
        return { success: false, error: "Erro ao eliminar votação" }
    }
}