"use server"

import { updateTag } from "next/cache"
import { after } from "next/server"
import { requireSession, requireBuildingAccess } from "@/lib/auth-helpers"
import { discussionService, CreateDiscussionInput, UpdateDiscussionInput } from "@/services/discussion.service"
import { createDiscussionSchema, updateDiscussionSchema } from "@/lib/zod-schemas"
import { ActionResult } from "@/lib/types"
import { notifyDiscussionCreated, notifyDiscussionComment } from "@/lib/actions/notification"

// Get all discussions for building
export async function getDiscussions(buildingId: string) {
    const session = await requireSession()

    if (session.user.role === 'manager') {
        await requireBuildingAccess(buildingId)
    } else if (session.user.buildingId !== buildingId) {
        throw new Error("Unauthorized")
    }

    return await discussionService.getByBuilding(buildingId)
}

// Get single discussion
export async function getDiscussion(id: number) {
    const session = await requireSession()
    const discussion = await discussionService.getById(id)

    if (!discussion) return null

    if (session.user.role === 'manager') {
        await requireBuildingAccess(discussion.buildingId)
    } else if (session.user.buildingId !== discussion.buildingId) {
        throw new Error("Unauthorized")
    }

    return discussion
}

// Create discussion (any building member)
export async function createDiscussion(input: CreateDiscussionInput): Promise<ActionResult<{ id: number }>> {
    const session = await requireSession()

    // Verify building access
    if (session.user.role === 'manager') {
        await requireBuildingAccess(input.buildingId)
    } else if (session.user.buildingId !== input.buildingId) {
        return { success: false, error: "Sem permissão" }
    }

    const validated = createDiscussionSchema.safeParse(input)
    if (!validated.success) {
        return { success: false, error: validated.error.issues[0].message }
    }

    try {
        const created = await discussionService.create(validated.data, session.user.id)
        updateTag(`discussions-${input.buildingId}`)

        // Notify residents after response (non-blocking)
        const discussionTitle = validated.data.title
        const creatorId = session.user.id
        after(async () => {
            await notifyDiscussionCreated(
                input.buildingId,
                discussionTitle,
                created.id,
                creatorId
            )
        })

        return { success: true, data: { id: created.id } }
    } catch {
        return { success: false, error: "Erro ao criar discussão" }
    }
}

// Update discussion (owner only)
export async function updateDiscussion(
    id: number,
    data: UpdateDiscussionInput
): Promise<ActionResult<void>> {
    const session = await requireSession()
    const discussion = await discussionService.getById(id)

    if (!discussion) {
        return { success: false, error: "Discussão não encontrada" }
    }

    // Only owner can edit
    if (discussion.createdBy !== session.user.id) {
        return { success: false, error: "Apenas o criador pode editar" }
    }

    const validated = updateDiscussionSchema.safeParse(data)
    if (!validated.success) {
        return { success: false, error: validated.error.issues[0].message }
    }

    try {
        await discussionService.update(id, validated.data)
        updateTag(`discussions-${discussion.buildingId}`)
        updateTag(`discussion-${id}`)
        return { success: true, data: undefined }
    } catch {
        return { success: false, error: "Erro ao atualizar discussão" }
    }
}

// Delete discussion (owner if no comments, or manager)
export async function deleteDiscussion(id: number): Promise<ActionResult<void>> {
    const session = await requireSession()
    const discussion = await discussionService.getById(id)

    if (!discussion) {
        return { success: false, error: "Discussão não encontrada" }
    }

    const isManager = session.user.role === 'manager'
    const isOwner = discussion.createdBy === session.user.id
    const commentCount = await discussionService.getCommentCount(id)

    // Manager can always delete
    // Owner can delete only if no comments
    if (!isManager && !isOwner) {
        return { success: false, error: "Sem permissão para eliminar" }
    }

    if (isOwner && !isManager && commentCount > 0) {
        return { success: false, error: "Não pode eliminar discussões com comentários" }
    }

    try {
        await discussionService.delete(id)
        updateTag(`discussions-${discussion.buildingId}`)
        return { success: true, data: undefined }
    } catch {
        return { success: false, error: "Erro ao eliminar discussão" }
    }
}

// Toggle pin (manager only)
export async function toggleDiscussionPin(id: number): Promise<ActionResult<void>> {
    const session = await requireSession()
    const discussion = await discussionService.getById(id)

    if (!discussion) {
        return { success: false, error: "Discussão não encontrada" }
    }

    await requireBuildingAccess(discussion.buildingId)

    if (session.user.role !== 'manager') {
        return { success: false, error: "Apenas gestores podem fixar discussões" }
    }

    try {
        await discussionService.togglePin(id)
        updateTag(`discussions-${discussion.buildingId}`)
        updateTag(`discussion-${id}`)
        return { success: true, data: undefined }
    } catch {
        return { success: false, error: "Erro ao fixar discussão" }
    }
}

// Close discussion (manager only)
export async function closeDiscussion(id: number): Promise<ActionResult<void>> {
    const session = await requireSession()
    const discussion = await discussionService.getById(id)

    if (!discussion) {
        return { success: false, error: "Discussão não encontrada" }
    }

    await requireBuildingAccess(discussion.buildingId)

    if (session.user.role !== 'manager') {
        return { success: false, error: "Apenas gestores podem encerrar discussões" }
    }

    try {
        await discussionService.close(id)
        updateTag(`discussions-${discussion.buildingId}`)
        updateTag(`discussion-${id}`)
        return { success: true, data: undefined }
    } catch {
        return { success: false, error: "Erro ao encerrar discussão" }
    }
}

// Get comments
export async function getDiscussionComments(discussionId: number) {
    await requireSession()
    return await discussionService.getComments(discussionId)
}

// Add comment (anyone with building access, if not closed)
export async function addDiscussionComment(
    discussionId: number,
    content: string
): Promise<ActionResult<void>> {
    const session = await requireSession()
    const discussion = await discussionService.getById(discussionId)

    if (!discussion) {
        return { success: false, error: "Discussão não encontrada" }
    }

    // Verify building access
    if (session.user.role === 'manager') {
        await requireBuildingAccess(discussion.buildingId)
    } else if (session.user.buildingId !== discussion.buildingId) {
        return { success: false, error: "Sem permissão" }
    }

    // Check if closed
    if (discussion.isClosed) {
        return { success: false, error: "Esta discussão está encerrada" }
    }

    if (!content.trim()) {
        return { success: false, error: "Comentário não pode estar vazio" }
    }

    try {
        await discussionService.addComment(discussionId, content.trim(), session.user.id)
        updateTag(`discussion-comments-${discussionId}`)
        updateTag(`discussions-${discussion.buildingId}`)

        // Notify creator after response (non-blocking)
        if (discussion.createdBy !== session.user.id) {
            const commenterName = session.user.name || 'Alguém'
            after(async () => {
                try {
                    await notifyDiscussionComment(
                        discussion.buildingId,
                        discussion.createdBy,
                        commenterName,
                        discussion.title,
                        discussionId
                    )
                } catch (error) {
                    console.error("Failed to notify user:", error)
                }
            })
        }

        return { success: true, data: undefined }
    } catch {
        return { success: false, error: "Erro ao adicionar comentário" }
    }
}

// Update comment (owner only)
export async function updateDiscussionComment(
    commentId: number,
    content: string
): Promise<ActionResult<void>> {
    const session = await requireSession()
    const comment = await discussionService.getCommentById(commentId)

    if (!comment) {
        return { success: false, error: "Comentário não encontrado" }
    }

    if (comment.createdBy !== session.user.id) {
        return { success: false, error: "Apenas o autor pode editar" }
    }

    if (!content.trim()) {
        return { success: false, error: "Comentário não pode estar vazio" }
    }

    try {
        await discussionService.updateComment(commentId, content.trim())
        updateTag(`discussion-comments-${comment.discussionId}`)
        return { success: true, data: undefined }
    } catch {
        return { success: false, error: "Erro ao atualizar comentário" }
    }
}

// Delete comment (owner or manager)
export async function deleteDiscussionComment(commentId: number): Promise<ActionResult<void>> {
    const session = await requireSession()
    const comment = await discussionService.getCommentById(commentId)

    if (!comment) {
        return { success: false, error: "Comentário não encontrado" }
    }

    const isManager = session.user.role === 'manager'
    const isOwner = comment.createdBy === session.user.id

    if (!isManager && !isOwner) {
        return { success: false, error: "Sem permissão para eliminar" }
    }

    try {
        await discussionService.deleteComment(commentId)
        updateTag(`discussion-comments-${comment.discussionId}`)
        return { success: true, data: undefined }
    } catch {
        return { success: false, error: "Erro ao eliminar comentário" }
    }
}