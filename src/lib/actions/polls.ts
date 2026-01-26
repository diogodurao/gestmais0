"use server"

import { updateTag } from "next/cache"
import { after } from "next/server"
import { requireSession, requireBuildingAccess } from "@/lib/auth-helpers"
import { pollService, CreatePollInput, CastVoteInput } from "@/services/poll.service"
import { createPollSchema, castVoteSchema } from "@/lib/zod-schemas"
import { ActionResult, PollResults, Poll, PollVote, NotificationOptions } from "@/lib/types"
import { db } from "@/db"
import { apartments, building } from "@/db/schema"
import { notifyBuildingResidents, createNotification, notifyPollClosed } from "@/lib/actions/notification"
import { getResidentEmails, sendBulkEmails } from "@/lib/actions/email-notifications"
import { getPollCreatedEmailTemplate } from "@/lib/email"
import { eq, and } from "drizzle-orm"

// Get all polls for building
export async function getPolls(buildingId: string, status?: "open" | "closed") {
    const session = await requireSession()

    if (session.user.role === 'manager') {
        await requireBuildingAccess(buildingId)
    } else if (session.user.buildingId !== buildingId) {
        throw new Error("Unauthorized")
    }

    const result = await pollService.getByBuilding(buildingId, status)
    if (!result.success) throw new Error(result.error)
    return result.data
}

// Get single poll
export async function getPoll(id: number): Promise<Poll | null> {
    const session = await requireSession()
    const result = await pollService.getById(id)

    if (!result.success) throw new Error(result.error)
    if (!result.data) return null

    const poll = result.data

    if (session.user.role === 'manager') {
        await requireBuildingAccess(poll.buildingId)
    } else if (session.user.buildingId !== poll.buildingId) {
        throw new Error("Unauthorized")
    }

    return poll as Poll
}

// Get poll votes (for results display)
export async function getPollVotes(pollId: number): Promise<PollVote[]> {
    const session = await requireSession()
    const pollResult = await pollService.getById(pollId)

    if (!pollResult.success || !pollResult.data) return []

    const poll = pollResult.data

    if (session.user.role === 'manager') {
        await requireBuildingAccess(poll.buildingId)
    } else if (session.user.buildingId !== poll.buildingId) {
        throw new Error("Unauthorized")
    }

    const result = await pollService.getVotes(pollId)
    if (!result.success) return []
    return result.data as PollVote[]
}

// Get current user's vote
export async function getUserVote(pollId: number): Promise<PollVote | null> {
    const session = await requireSession()
    const result = await pollService.getUserVote(pollId, session.user.id)
    if (!result.success) return null
    return result.data as PollVote | null
}

// Get calculated results
export async function getPollResults(pollId: number): Promise<PollResults | { restricted: true; message: string } | null> {
    const session = await requireSession()
    const pollResult = await pollService.getById(pollId)

    if (!pollResult.success || !pollResult.data) return null

    const poll = pollResult.data

    // Manager can always see results
    // Residents can only see after voting
    if (session.user.role !== 'manager') {
        const userVoteResult = await pollService.getUserVote(pollId, session.user.id)
        if (!userVoteResult.success || !userVoteResult.data) {
            return { restricted: true, message: "Vote primeiro para ver os resultados" } as const
        }
    }

    const result = await pollService.calculateResults(pollId)
    if (!result.success) return null
    return result.data
}

interface CreatePollWithNotificationsInput extends CreatePollInput {
    notificationOptions?: NotificationOptions
}

// Create poll (manager only)
export async function createPoll(input: CreatePollWithNotificationsInput): Promise<ActionResult<{ id: number }>> {
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

    const result = await pollService.create(validated.data, session.user.id)
    if (!result.success) return { success: false, error: result.error }

    const created = result.data
    updateTag(`polls-${input.buildingId}`)

    // Handle notifications after response (non-blocking)
    const pollTitle = validated.data.title
    const pollDescription = validated.data.description || null
    const creatorId = session.user.id
    const notificationOptions = input.notificationOptions

    after(async () => {
        try {
            // Default behavior: send app notification to all
            if (!notificationOptions) {
                await notifyBuildingResidents({
                    buildingId: input.buildingId,
                    title: "Nova Votação Disponível",
                    message: `Foi criada uma nova votação: "${pollTitle}"`,
                    type: "poll",
                    link: `/dashboard/polls?id=${created.id}`
                }, creatorId)
                return
            }

            // Custom notification handling
            const { sendAppNotification, sendEmail: shouldSendEmail, recipients } = notificationOptions

            // Get building name for email
            let buildingName = ''
            if (shouldSendEmail) {
                const [buildingData] = await db
                    .select({ name: building.name })
                    .from(building)
                    .where(eq(building.id, input.buildingId))
                    .limit(1)
                buildingName = buildingData?.name || ''
            }

            // Get recipient user IDs
            const userIds = recipients === 'all'
                ? undefined
                : recipients

            // Send app notifications
            if (sendAppNotification) {
                if (recipients === 'all') {
                    await notifyBuildingResidents({
                        buildingId: input.buildingId,
                        title: "Nova Votação Disponível",
                        message: `Foi criada uma nova votação: "${pollTitle}"`,
                        type: "poll",
                        link: `/dashboard/polls?id=${created.id}`
                    }, creatorId)
                } else if (userIds && userIds.length > 0) {
                    // Send to specific users
                    await Promise.all(
                        userIds.map(userId =>
                            createNotification({
                                buildingId: input.buildingId,
                                userId,
                                type: 'poll_created',
                                title: 'Nova Votação Disponível',
                                message: pollTitle,
                                link: `/dashboard/polls?id=${created.id}`,
                            })
                        )
                    )
                }
            }

            // Send emails
            if (shouldSendEmail) {
                const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gestmais.pt'
                const link = `${baseUrl}/dashboard/polls?id=${created.id}`
                const template = getPollCreatedEmailTemplate(
                    buildingName,
                    pollTitle,
                    pollDescription,
                    link
                )

                const emailRecipients = await getResidentEmails(input.buildingId, userIds)
                // Filter out the creator
                const filteredRecipients = emailRecipients.filter(r => r.userId !== creatorId)

                if (filteredRecipients.length > 0) {
                    await sendBulkEmails({
                        recipients: filteredRecipients.map(r => ({ email: r.email, name: r.name })),
                        subject: `🗳️ Nova Votação - ${buildingName}`,
                        template,
                    })
                }
            }
        } catch (error) {
            console.error("Failed to send poll notifications:", error)
        }
    })

    return { success: true, data: { id: created.id } }
}

// Cast vote (any building member)
export async function castVote(input: CastVoteInput): Promise<ActionResult<void>> {
    const session = await requireSession()
    const pollResult = await pollService.getById(input.pollId)

    if (!pollResult.success || !pollResult.data) {
        return { success: false, error: "Votação não encontrada" }
    }

    const poll = pollResult.data

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

    const voteResult = await pollService.castVote(validated.data, session.user.id, apartmentId)
    if (!voteResult.success) return { success: false, error: voteResult.error }

    updateTag(`poll-votes-${input.pollId}`)

    // Notify manager after response (non-blocking)
    const voterId = session.user.id
    after(async () => {
        const buildingInfo = await db.query.building.findFirst({
            where: eq(building.id, poll.buildingId),
            columns: { managerId: true }
        })

        if (buildingInfo && buildingInfo.managerId !== voterId) {
            await createNotification({
                buildingId: poll.buildingId,
                userId: buildingInfo.managerId,
                title: "Novo Voto Registado",
                message: `Um condómino votou na votação: "${poll.title}"`,
                type: "poll",
                link: `/dashboard/polls?id=${poll.id}`
            })
        }
    })

    return { success: true, data: undefined }
}

// Close poll (manager only)
export async function closePoll(pollId: number): Promise<ActionResult<void>> {
    const session = await requireSession()
    const pollResult = await pollService.getById(pollId)

    if (!pollResult.success || !pollResult.data) {
        return { success: false, error: "Votação não encontrada" }
    }

    const poll = pollResult.data

    await requireBuildingAccess(poll.buildingId)

    if (session.user.role !== 'manager') {
        return { success: false, error: "Apenas gestores podem encerrar votações" }
    }

    if (poll.status === 'closed') {
        return { success: false, error: "Votação já está encerrada" }
    }

    const result = await pollService.close(pollId)
    if (!result.success) return { success: false, error: result.error }

    updateTag(`polls-${poll.buildingId}`)
    updateTag(`poll-${pollId}`)

    // Notify residents after response (non-blocking)
    after(async () => {
        await notifyPollClosed(
            poll.buildingId,
            poll.title,
            pollId
        )
    })

    return { success: true, data: undefined }
}

// Delete poll (manager only, no votes)
export async function deletePoll(pollId: number): Promise<ActionResult<void>> {
    const session = await requireSession()
    const pollResult = await pollService.getById(pollId)

    if (!pollResult.success || !pollResult.data) {
        return { success: false, error: "Votação não encontrada" }
    }

    const poll = pollResult.data

    await requireBuildingAccess(poll.buildingId)

    if (session.user.role !== 'manager') {
        return { success: false, error: "Apenas gestores podem eliminar votações" }
    }

    const result = await pollService.delete(pollId)
    if (!result.success) return { success: false, error: result.error }

    updateTag(`polls-${poll.buildingId}`)
    return { success: true, data: undefined }
}