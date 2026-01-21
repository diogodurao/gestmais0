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

    const result = await discussionService.getByBuilding(buildingId)
    if (!result.success) throw new Error(result.error)
    return result.data
}

// Get single discussion
export async function getDiscussion(id: number) {
    const session = await requireSession()
    const result = await discussionService.getById(id)
    if (!result.success) throw new Error(result.error)
    if (!result.data) return null

    const discussion = result.data

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

    const result = await discussionService.create(validated.data, session.user.id)
    if (!result.success) return result

    const created = result.data
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
}

// Update discussion (owner only)
export async function updateDiscussion(
    id: number,
    data: UpdateDiscussionInput
): Promise<ActionResult<void>> {
    const session = await requireSession()
    const discussionResult = await discussionService.getById(id)
    if (!discussionResult.success) return { success: false, error: discussionResult.error }
    if (!discussionResult.data) return { success: false, error: "Discussão não encontrada" }

    const discussion = discussionResult.data

    // Only owner can edit
    if (discussion.createdBy !== session.user.id) {
        return { success: false, error: "Apenas o criador pode editar" }
    }

    const validated = updateDiscussionSchema.safeParse(data)
    if (!validated.success) {
        return { success: false, error: validated.error.issues[0].message }
    }

    const result = await discussionService.update(id, validated.data)
    if (!result.success) return { success: false, error: result.error }

    updateTag(`discussions-${discussion.buildingId}`)
    updateTag(`discussion-${id}`)
    return { success: true, data: undefined }
}

// Delete discussion (owner if no comments, or manager)
export async function deleteDiscussion(id: number): Promise<ActionResult<void>> {
    const session = await requireSession()
    const discussionResult = await discussionService.getById(id)
    if (!discussionResult.success) return { success: false, error: discussionResult.error }
    if (!discussionResult.data) return { success: false, error: "Discussão não encontrada" }

    const discussion = discussionResult.data

    const isManager = session.user.role === 'manager'
    const isOwner = discussion.createdBy === session.user.id

    const countResult = await discussionService.getCommentCount(id)
    if (!countResult.success) return { success: false, error: countResult.error }
    const commentCount = countResult.data

    // Manager can always delete
    // Owner can delete only if no comments
    if (!isManager && !isOwner) {
        return { success: false, error: "Sem permissão para eliminar" }
    }

    if (isOwner && !isManager && commentCount > 0) {
        return { success: false, error: "Não pode eliminar discussões com comentários" }
    }

    const result = await discussionService.delete(id)
    if (!result.success) return { success: false, error: result.error }

    updateTag(`discussions-${discussion.buildingId}`)
    return { success: true, data: undefined }
}

// Toggle pin (manager only)
export async function toggleDiscussionPin(id: number): Promise<ActionResult<void>> {
    const session = await requireSession()
    const discussionResult = await discussionService.getById(id)
    if (!discussionResult.success) return { success: false, error: discussionResult.error }
    if (!discussionResult.data) return { success: false, error: "Discussão não encontrada" }

    const discussion = discussionResult.data

    await requireBuildingAccess(discussion.buildingId)

    if (session.user.role !== 'manager') {
        return { success: false, error: "Apenas gestores podem fixar discussões" }
    }

    const result = await discussionService.togglePin(id)
    if (!result.success) return { success: false, error: result.error }

    updateTag(`discussions-${discussion.buildingId}`)
    updateTag(`discussion-${id}`)
    return { success: true, data: undefined }
}

// Close discussion (manager only)
export async function closeDiscussion(id: number): Promise<ActionResult<void>> {
    const session = await requireSession()
    const discussionResult = await discussionService.getById(id)
    if (!discussionResult.success) return { success: false, error: discussionResult.error }
    if (!discussionResult.data) return { success: false, error: "Discussão não encontrada" }

    const discussion = discussionResult.data

    await requireBuildingAccess(discussion.buildingId)

    if (session.user.role !== 'manager') {
        return { success: false, error: "Apenas gestores podem encerrar discussões" }
    }

    const result = await discussionService.close(id)
    if (!result.success) return { success: false, error: result.error }

    updateTag(`discussions-${discussion.buildingId}`)
    updateTag(`discussion-${id}`)
    return { success: true, data: undefined }
}

// Get comments
export async function getDiscussionComments(discussionId: number) {
    await requireSession()
    const result = await discussionService.getComments(discussionId)
    if (!result.success) throw new Error(result.error)
    return result.data
}

// Add comment (anyone with building access, if not closed)
export async function addDiscussionComment(
    discussionId: number,
    content: string
): Promise<ActionResult<void>> {
    const session = await requireSession()
    const discussionResult = await discussionService.getById(discussionId)
    if (!discussionResult.success) return { success: false, error: discussionResult.error }
    if (!discussionResult.data) return { success: false, error: "Discussão não encontrada" }

    const discussion = discussionResult.data

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

    const result = await discussionService.addComment(discussionId, content.trim(), session.user.id)
    if (!result.success) return { success: false, error: result.error }

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
}

// Update comment (owner only)
export async function updateDiscussionComment(
    commentId: number,
    content: string
): Promise<ActionResult<void>> {
    const session = await requireSession()
    const commentResult = await discussionService.getCommentById(commentId)
    if (!commentResult.success) return { success: false, error: commentResult.error }
    if (!commentResult.data) return { success: false, error: "Comentário não encontrado" }

    const comment = commentResult.data

    if (comment.createdBy !== session.user.id) {
        return { success: false, error: "Apenas o autor pode editar" }
    }

    if (!content.trim()) {
        return { success: false, error: "Comentário não pode estar vazio" }
    }

    const result = await discussionService.updateComment(commentId, content.trim())
    if (!result.success) return { success: false, error: result.error }

    updateTag(`discussion-comments-${comment.discussionId}`)
    return { success: true, data: undefined }
}

// Delete comment (owner or manager)
export async function deleteDiscussionComment(commentId: number): Promise<ActionResult<void>> {
    const session = await requireSession()
    const commentResult = await discussionService.getCommentById(commentId)
    if (!commentResult.success) return { success: false, error: commentResult.error }
    if (!commentResult.data) return { success: false, error: "Comentário não encontrado" }

    const comment = commentResult.data

    const isManager = session.user.role === 'manager'
    const isOwner = comment.createdBy === session.user.id

    if (!isManager && !isOwner) {
        return { success: false, error: "Sem permissão para eliminar" }
    }

    const result = await discussionService.deleteComment(commentId)
    if (!result.success) return { success: false, error: result.error }

    updateTag(`discussion-comments-${comment.discussionId}`)
    return { success: true, data: undefined }
}