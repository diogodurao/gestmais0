import { db } from "@/db"
import { polls, pollVotes, user, apartments } from "@/db/schema"
import { eq, and, desc, sql, count } from "drizzle-orm"
import { PollStatus, PollType, PollWeightMode, ActionResult, Ok, Err, ErrorCodes, ErrorCode } from "@/lib/types"

export interface CreatePollInput {
    buildingId: string
    title: string
    description?: string
    type: PollType
    weightMode: PollWeightMode
    options?: string[]
}

export interface CastVoteInput {
    pollId: number
    vote: string | string[]
}

type PollRow = {
    id: number
    buildingId: string
    title: string
    description: string | null
    type: PollType
    weightMode: PollWeightMode
    status: PollStatus
    options: string[] | null
    createdBy: string
    createdAt: Date
    closedAt: Date | null
    creatorName: string | null
    voteCount?: number
}

type VoteRow = {
    id: number
    pollId: number
    userId: string
    apartmentId: number | null
    vote: string | string[]
    createdAt: Date
    updatedAt: Date | null
    userName: string | null
    apartmentPermillage: number | null
    apartmentUnit: string | null
}

type PollResults = {
    results: Record<string, number>
    totalWeight: number
    voteCount: number
}

export class PollService {
    async getByBuilding(buildingId: string, status?: PollStatus): Promise<ActionResult<PollRow[]>> {
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

        return Ok(results)
    }

    async getById(id: number): Promise<ActionResult<PollRow | null>> {
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

        return Ok(result || null)
    }

    async create(input: CreatePollInput, userId: string): Promise<ActionResult<typeof polls.$inferSelect>> {
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

        return Ok(created)
    }

    async close(id: number): Promise<ActionResult<typeof polls.$inferSelect>> {
        const existing = await db.select().from(polls).where(eq(polls.id, id)).limit(1)
        if (!existing.length) {
            return Err("Votação não encontrada", ErrorCodes.POLL_NOT_FOUND)
        }

        const [updated] = await db
            .update(polls)
            .set({
                status: 'closed',
                closedAt: new Date(),
            })
            .where(eq(polls.id, id))
            .returning()

        return Ok(updated)
    }

    async delete(id: number): Promise<ActionResult<boolean>> {
        // Use transaction to prevent race condition between vote count check and delete
        type TxResult = { success: true } | { error: string; code: ErrorCode }

        const result: TxResult = await db.transaction(async (tx) => {
            const existing = await tx.select().from(polls).where(eq(polls.id, id)).limit(1)
            if (!existing.length) {
                return { error: "Votação não encontrada", code: ErrorCodes.POLL_NOT_FOUND }
            }

            const [voteCount] = await tx
                .select({ count: count() })
                .from(pollVotes)
                .where(eq(pollVotes.pollId, id))

            if (voteCount.count > 0) {
                return { error: "Não é possível eliminar votação com votos", code: ErrorCodes.POLL_HAS_VOTES }
            }

            await tx.delete(polls).where(eq(polls.id, id))
            return { success: true }
        })

        if ('error' in result) {
            return Err(result.error, result.code)
        }
        return Ok(true)
    }

    // Votes
    async getVotes(pollId: number): Promise<ActionResult<VoteRow[]>> {
        const results = await db
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
                apartmentUnit: apartments.unit,
            })
            .from(pollVotes)
            .leftJoin(user, eq(pollVotes.userId, user.id))
            .leftJoin(apartments, eq(pollVotes.apartmentId, apartments.id))
            .where(eq(pollVotes.pollId, pollId))
            .orderBy(pollVotes.createdAt)

        return Ok(results)
    }

    async getUserVote(pollId: number, userId: string): Promise<ActionResult<typeof pollVotes.$inferSelect | null>> {
        const [vote] = await db
            .select()
            .from(pollVotes)
            .where(and(
                eq(pollVotes.pollId, pollId),
                eq(pollVotes.userId, userId)
            ))
            .limit(1)

        return Ok(vote || null)
    }

    async castVote(input: CastVoteInput, userId: string, apartmentId: number | null): Promise<ActionResult<typeof pollVotes.$inferSelect>> {
        const existingResult = await this.getUserVote(input.pollId, userId)
        if (!existingResult.success) return existingResult

        const existingVote = existingResult.data

        if (existingVote) {
            const [updated] = await db
                .update(pollVotes)
                .set({
                    vote: input.vote,
                    updatedAt: new Date(),
                })
                .where(eq(pollVotes.id, existingVote.id))
                .returning()

            return Ok(updated)
        } else {
            const [created] = await db
                .insert(pollVotes)
                .values({
                    pollId: input.pollId,
                    userId,
                    apartmentId,
                    vote: input.vote,
                })
                .returning()

            return Ok(created)
        }
    }

    async getVoteCount(pollId: number): Promise<ActionResult<number>> {
        const [result] = await db
            .select({ count: count() })
            .from(pollVotes)
            .where(eq(pollVotes.pollId, pollId))

        return Ok(result.count)
    }

    async calculateResults(pollId: number): Promise<ActionResult<PollResults | null>> {
        const pollResult = await this.getById(pollId)
        if (!pollResult.success) return pollResult
        if (!pollResult.data) return Ok(null)

        const poll = pollResult.data

        const votesResult = await this.getVotes(pollId)
        if (!votesResult.success) return votesResult

        const votes = votesResult.data
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

            return Ok({ results, totalWeight, voteCount: votes.length })
        } else {
            const results: Record<string, number> = {}
            let totalWeight = 0
            let abstainWeight = 0

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
            return Ok({ results, totalWeight, voteCount: votes.length })
        }
    }
}

export const pollService = new PollService()