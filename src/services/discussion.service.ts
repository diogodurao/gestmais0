import { db } from "@/db"
import { discussions, discussionComments, user } from "@/db/schema"
import { eq, and, desc, sql, count } from "drizzle-orm"

export interface CreateDiscussionInput {
    buildingId: string
    title: string
    content?: string | null
}

export interface UpdateDiscussionInput {
    title?: string
    content?: string | null
}

export class DiscussionService {
    async getByBuilding(buildingId: string) {
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

        return results
    }

    async getById(id: number) {
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

        return result || null
    }

    async create(input: CreateDiscussionInput, userId: string) {
        const [created] = await db
            .insert(discussions)
            .values({
                buildingId: input.buildingId,
                title: input.title,
                content: input.content || null,
                createdBy: userId,
            })
            .returning()

        return created
    }

    async update(id: number, data: UpdateDiscussionInput) {
        const [updated] = await db
            .update(discussions)
            .set({
                ...data,
                updatedAt: new Date(),
            })
            .where(eq(discussions.id, id))
            .returning()

        return updated
    }

    async togglePin(id: number) {
        const discussion = await this.getById(id)
        if (!discussion) return null

        const [updated] = await db
            .update(discussions)
            .set({ isPinned: !discussion.isPinned })
            .where(eq(discussions.id, id))
            .returning()

        return updated
    }

    async close(id: number) {
        const [updated] = await db
            .update(discussions)
            .set({ isClosed: true })
            .where(eq(discussions.id, id))
            .returning()

        return updated
    }

    async delete(id: number) {
        await db.delete(discussions).where(eq(discussions.id, id))
        return true
    }

    async getCommentCount(id: number) {
        const [result] = await db
            .select({ count: count() })
            .from(discussionComments)
            .where(eq(discussionComments.discussionId, id))

        return result.count
    }

    // Comments
    async getComments(discussionId: number) {
        return await db
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
            .orderBy(discussionComments.createdAt) // Chronological (oldest first)
    }

    async addComment(discussionId: number, content: string, userId: string) {
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

        return created
    }

    async updateComment(commentId: number, content: string) {
        const [updated] = await db
            .update(discussionComments)
            .set({
                content,
                isEdited: true,
                updatedAt: new Date(),
            })
            .where(eq(discussionComments.id, commentId))
            .returning()

        return updated
    }

    async deleteComment(commentId: number) {
        await db.delete(discussionComments).where(eq(discussionComments.id, commentId))
        return true
    }

    async getCommentById(commentId: number) {
        const [comment] = await db
            .select()
            .from(discussionComments)
            .where(eq(discussionComments.id, commentId))
            .limit(1)

        return comment || null
    }
}

export const discussionService = new DiscussionService()