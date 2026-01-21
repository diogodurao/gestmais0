import { db } from "@/db"
import { discussions, discussionComments, user } from "@/db/schema"
import { eq, desc, sql, count } from "drizzle-orm"
import { ActionResult, Ok, Err, ErrorCodes } from "@/lib/types"

export interface CreateDiscussionInput {
    buildingId: string
    title: string
    content?: string | null
}

export interface UpdateDiscussionInput {
    title?: string
    content?: string | null
}

type DiscussionRow = {
    id: number
    buildingId: string
    title: string
    content: string | null
    isPinned: boolean
    isClosed: boolean
    createdBy: string
    createdAt: Date
    updatedAt: Date | null
    lastActivityAt: Date
    creatorName: string | null
    commentCount?: number
}

type CommentRow = {
    id: number
    discussionId: number
    content: string
    isEdited: boolean
    createdBy: string
    createdAt: Date
    updatedAt: Date | null
    creatorName: string | null
}

export class DiscussionService {
    async getByBuilding(buildingId: string): Promise<ActionResult<DiscussionRow[]>> {
        const results = await db
            .select({
                id: discussions.id,
                buildingId: discussions.buildingId,
                title: discussions.title,
                content: discussions.content,
                isPinned: discussions.isPinned,
                isClosed: discussions.isClosed,
                createdBy: discussions.createdBy,
                createdAt: discussions.createdAt,
                updatedAt: discussions.updatedAt,
                lastActivityAt: discussions.lastActivityAt,
                creatorName: user.name,
                commentCount: sql<number>`(
                    SELECT COUNT(*) FROM discussion_comments
                    WHERE discussion_id = ${discussions.id}
                )`.as('comment_count'),
            })
            .from(discussions)
            .leftJoin(user, eq(discussions.createdBy, user.id))
            .where(eq(discussions.buildingId, buildingId))
            .orderBy(
                desc(discussions.isPinned),
                desc(discussions.lastActivityAt)
            )

        return Ok(results)
    }

    async getById(id: number): Promise<ActionResult<DiscussionRow | null>> {
        const [result] = await db
            .select({
                id: discussions.id,
                buildingId: discussions.buildingId,
                title: discussions.title,
                content: discussions.content,
                isPinned: discussions.isPinned,
                isClosed: discussions.isClosed,
                createdBy: discussions.createdBy,
                createdAt: discussions.createdAt,
                updatedAt: discussions.updatedAt,
                lastActivityAt: discussions.lastActivityAt,
                creatorName: user.name,
            })
            .from(discussions)
            .leftJoin(user, eq(discussions.createdBy, user.id))
            .where(eq(discussions.id, id))
            .limit(1)

        return Ok(result || null)
    }

    async create(input: CreateDiscussionInput, userId: string): Promise<ActionResult<typeof discussions.$inferSelect>> {
        const [created] = await db
            .insert(discussions)
            .values({
                buildingId: input.buildingId,
                title: input.title,
                content: input.content || null,
                createdBy: userId,
            })
            .returning()

        return Ok(created)
    }

    async update(id: number, data: UpdateDiscussionInput): Promise<ActionResult<typeof discussions.$inferSelect>> {
        const existing = await db.select().from(discussions).where(eq(discussions.id, id)).limit(1)
        if (!existing.length) {
            return Err("Discussão não encontrada", ErrorCodes.DISCUSSION_NOT_FOUND)
        }

        const [updated] = await db
            .update(discussions)
            .set({
                ...data,
                updatedAt: new Date(),
            })
            .where(eq(discussions.id, id))
            .returning()

        return Ok(updated)
    }

    async togglePin(id: number): Promise<ActionResult<typeof discussions.$inferSelect>> {
        const discussionResult = await this.getById(id)
        if (!discussionResult.success) return discussionResult
        if (!discussionResult.data) {
            return Err("Discussão não encontrada", ErrorCodes.DISCUSSION_NOT_FOUND)
        }

        const [updated] = await db
            .update(discussions)
            .set({ isPinned: !discussionResult.data.isPinned })
            .where(eq(discussions.id, id))
            .returning()

        return Ok(updated)
    }

    async close(id: number): Promise<ActionResult<typeof discussions.$inferSelect>> {
        const existing = await db.select().from(discussions).where(eq(discussions.id, id)).limit(1)
        if (!existing.length) {
            return Err("Discussão não encontrada", ErrorCodes.DISCUSSION_NOT_FOUND)
        }

        const [updated] = await db
            .update(discussions)
            .set({ isClosed: true })
            .where(eq(discussions.id, id))
            .returning()

        return Ok(updated)
    }

    async delete(id: number): Promise<ActionResult<boolean>> {
        const existing = await db.select().from(discussions).where(eq(discussions.id, id)).limit(1)
        if (!existing.length) {
            return Err("Discussão não encontrada", ErrorCodes.DISCUSSION_NOT_FOUND)
        }

        await db.delete(discussions).where(eq(discussions.id, id))
        return Ok(true)
    }

    async getCommentCount(id: number): Promise<ActionResult<number>> {
        const [result] = await db
            .select({ count: count() })
            .from(discussionComments)
            .where(eq(discussionComments.discussionId, id))

        return Ok(result.count)
    }

    // Comments
    async getComments(discussionId: number): Promise<ActionResult<CommentRow[]>> {
        const results = await db
            .select({
                id: discussionComments.id,
                discussionId: discussionComments.discussionId,
                content: discussionComments.content,
                isEdited: discussionComments.isEdited,
                createdBy: discussionComments.createdBy,
                createdAt: discussionComments.createdAt,
                updatedAt: discussionComments.updatedAt,
                creatorName: user.name,
            })
            .from(discussionComments)
            .leftJoin(user, eq(discussionComments.createdBy, user.id))
            .where(eq(discussionComments.discussionId, discussionId))
            .orderBy(discussionComments.createdAt)

        return Ok(results)
    }

    async addComment(discussionId: number, content: string, userId: string): Promise<ActionResult<typeof discussionComments.$inferSelect>> {
        const [created] = await db
            .insert(discussionComments)
            .values({
                discussionId,
                content,
                createdBy: userId,
            })
            .returning()

        // Update last activity
        await db
            .update(discussions)
            .set({ lastActivityAt: new Date() })
            .where(eq(discussions.id, discussionId))

        return Ok(created)
    }

    async updateComment(commentId: number, content: string): Promise<ActionResult<typeof discussionComments.$inferSelect>> {
        const existing = await db.select().from(discussionComments).where(eq(discussionComments.id, commentId)).limit(1)
        if (!existing.length) {
            return Err("Comentário não encontrado", ErrorCodes.COMMENT_NOT_FOUND)
        }

        const [updated] = await db
            .update(discussionComments)
            .set({
                content,
                isEdited: true,
                updatedAt: new Date(),
            })
            .where(eq(discussionComments.id, commentId))
            .returning()

        return Ok(updated)
    }

    async deleteComment(commentId: number): Promise<ActionResult<boolean>> {
        const existing = await db.select().from(discussionComments).where(eq(discussionComments.id, commentId)).limit(1)
        if (!existing.length) {
            return Err("Comentário não encontrado", ErrorCodes.COMMENT_NOT_FOUND)
        }

        await db.delete(discussionComments).where(eq(discussionComments.id, commentId))
        return Ok(true)
    }

    async getCommentById(commentId: number): Promise<ActionResult<typeof discussionComments.$inferSelect | null>> {
        const [comment] = await db
            .select()
            .from(discussionComments)
            .where(eq(discussionComments.id, commentId))
            .limit(1)

        return Ok(comment || null)
    }
}

export const discussionService = new DiscussionService()
