import { db } from "@/db"
import { polls, pollVotes, user, apartments } from "@/db/schema"
import { eq, and, desc, sql, count } from "drizzle-orm"
import { PollStatus, PollType, PollWeightMode } from "@/lib/types"

export interface CreatePollInput {
    buildingId: string
    title: string
    description?: string
    type: PollType
    weightMode: PollWeightMode
    options?: string[] // Required for choice types
}

export interface CastVoteInput {
    pollId: number
    vote: string | string[] // "yes"/"no"/"abstain" or ["Option A"] or ["Option A", "Option B"]
}

export class PollService {
    async getByBuilding(buildingId: string, status?: PollStatus) {
        const conditions = [eq(polls.buildingId, buildingId)]
        if (status) {
            conditions.push(eq(polls.status, status))
        }

        const results = await db
            .select({
                id: polls.id,
                buildingId: polls.buildingId,
                title: polls.title,
                description: polls.description,
                type: polls.type,
                weightMode: polls.weightMode,
                status: polls.status,
                options: polls.options,
                createdBy: polls.createdBy,
                createdAt: polls.createdAt,
                closedAt: polls.closedAt,
                creatorName: user.name,
                voteCount: sql<number>`(
                    SELECT COUNT(*) FROM poll_votes 
                    WHERE poll_id = ${polls.id}
                )`.as('vote_count'),
            })
            .from(polls)
            .leftJoin(user, eq(polls.createdBy, user.id))
            .where(and(...conditions))
            .orderBy(desc(polls.createdAt))

        return results
    }

    async getById(id: number) {
        const [result] = await db
            .select({
                id: polls.id,
                buildingId: polls.buildingId,
                title: polls.title,
                description: polls.description,
                type: polls.type,
                weightMode: polls.weightMode,
                status: polls.status,
                options: polls.options,
                createdBy: polls.createdBy,
                createdAt: polls.createdAt,
                closedAt: polls.closedAt,
                creatorName: user.name,
            })
            .from(polls)
            .leftJoin(user, eq(polls.createdBy, user.id))
            .where(eq(polls.id, id))
            .limit(1)

        return result || null
    }

    async create(input: CreatePollInput, userId: string) {
        const [created] = await db
            .insert(polls)
            .values({
                buildingId: input.buildingId,
                title: input.title,
                description: input.description || null,
                type: input.type,
                weightMode: input.weightMode,
                options: input.options || null,
                createdBy: userId,
            })
            .returning()

        return created
    }

    async close(id: number) {
        const [updated] = await db
            .update(polls)
            .set({
                status: 'closed',
                closedAt: new Date(),
            })
            .where(eq(polls.id, id))
            .returning()

        return updated
    }

    async delete(id: number) {
        // Only delete if no votes
        const voteCount = await db
            .select({ count: count() })
            .from(pollVotes)
            .where(eq(pollVotes.pollId, id))

        if (voteCount[0].count > 0) {
            throw new Error("Cannot delete poll with votes")
        }

        await db.delete(polls).where(eq(polls.id, id))
        return true
    }

    // Votes
    async getVotes(pollId: number) {
        return await db
            .select({
                id: pollVotes.id,
                pollId: pollVotes.pollId,
                userId: pollVotes.userId,
                apartmentId: pollVotes.apartmentId,
                vote: pollVotes.vote,
                createdAt: pollVotes.createdAt,
                updatedAt: pollVotes.updatedAt,
                userName: user.name,
                apartmentPermillage: apartments.permillage,
                apartmentUnit: apartments.unit, // e.g., "3B", "T2-A"
            })
            .from(pollVotes)
            .leftJoin(user, eq(pollVotes.userId, user.id))
            .leftJoin(apartments, eq(pollVotes.apartmentId, apartments.id))
            .where(eq(pollVotes.pollId, pollId))
            .orderBy(pollVotes.createdAt)
    }

    async getUserVote(pollId: number, userId: string) {
        const [vote] = await db
            .select()
            .from(pollVotes)
            .where(and(
                eq(pollVotes.pollId, pollId),
                eq(pollVotes.userId, userId)
            ))
            .limit(1)

        return vote || null
    }

    async castVote(input: CastVoteInput, userId: string, apartmentId: number | null) {
        const existingVote = await this.getUserVote(input.pollId, userId)

        if (existingVote) {
            // Update existing vote
            const [updated] = await db
                .update(pollVotes)
                .set({
                    vote: input.vote,
                    updatedAt: new Date(),
                })
                .where(eq(pollVotes.id, existingVote.id))
                .returning()

            return updated
        } else {
            // Create new vote
            const [created] = await db
                .insert(pollVotes)
                .values({
                    pollId: input.pollId,
                    userId,
                    apartmentId,
                    vote: input.vote,
                })
                .returning()

            return created
        }
    }

    async getVoteCount(pollId: number) {
        const [result] = await db
            .select({ count: count() })
            .from(pollVotes)
            .where(eq(pollVotes.pollId, pollId))

        return result.count
    }

    // Calculate results with optional weighting
    async calculateResults(pollId: number) {
        const poll = await this.getById(pollId)
        if (!poll) return null

        const votes = await this.getVotes(pollId)
        const isWeighted = poll.weightMode === 'permilagem'

        if (poll.type === 'yes_no') {
            const results: Record<string, number> = { yes: 0, no: 0, abstain: 0 }
            let totalWeight = 0

            for (const v of votes) {
                const weight = isWeighted ? (v.apartmentPermillage || 1) : 1
                const voteValue = v.vote as string
                if (results[voteValue] !== undefined) {
                    results[voteValue] += weight
                }
                totalWeight += weight
            }

            return { results, totalWeight, voteCount: votes.length }
        } else {
            // Single or multiple choice
            const results: Record<string, number> = {}
            let totalWeight = 0
            let abstainWeight = 0

            // Initialize options
            if (poll.options) {
                for (const opt of poll.options) {
                    results[opt] = 0
                }
            }
            results['abstain'] = 0

            for (const v of votes) {
                const weight = isWeighted ? (v.apartmentPermillage || 1) : 1
                const voteValues = v.vote as string[]

                if (voteValues.includes('abstain')) {
                    abstainWeight += weight
                } else {
                    for (const val of voteValues) {
                        if (results[val] !== undefined) {
                            results[val] += weight
                        }
                    }
                }
                totalWeight += weight
            }

            results['abstain'] = abstainWeight
            return { results, totalWeight, voteCount: votes.length }
        }
    }
}

export const pollService = new PollService()