import { db } from "@/db"
import { monthlyEvaluations, user } from "@/db/schema"
import { eq, and, desc, avg, count } from "drizzle-orm"
import { MonthlyAverages } from "@/lib/types"

export interface SubmitEvaluationInput {
    buildingId: string
    year: number
    month: number
    securityRating: number
    cleaningRating: number
    maintenanceRating: number
    communicationRating: number
    generalRating: number
    comments?: string
}

export class EvaluationService {
    // Check if evaluation period is open (day 24+)
    isEvaluationPeriodOpen(): boolean {
        const today = new Date()
        return today.getDate() >= 24
    }

    // Get days until evaluation opens
    getDaysUntilOpen(): number {
        const today = new Date()
        const currentDay = today.getDate()
        if (currentDay >= 24) return 0
        return 24 - currentDay
    }

    // Get days remaining in month
    getDaysRemaining(): number {
        const today = new Date()
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
        return lastDay - today.getDate()
    }

    // Get current evaluation period (year, month)
    getCurrentPeriod(): { year: number; month: number } {
        const today = new Date()
        return {
            year: today.getFullYear(),
            month: today.getMonth() + 1, // 1-12
        }
    }

    // Get user's evaluation for a specific month
    async getUserEvaluation(buildingId: string, userId: string, year: number, month: number) {
        const [result] = await db
            .select()
            .from(monthlyEvaluations)
            .where(and(
                eq(monthlyEvaluations.buildingId, buildingId),
                eq(monthlyEvaluations.userId, userId),
                eq(monthlyEvaluations.year, year),
                eq(monthlyEvaluations.month, month)
            ))
            .limit(1)

        return result || null
    }

    // Submit or update evaluation
    async submitEvaluation(input: SubmitEvaluationInput, userId: string) {
        const existing = await this.getUserEvaluation(
            input.buildingId,
            userId,
            input.year,
            input.month
        )

        if (existing) {
            // Update
            const [updated] = await db
                .update(monthlyEvaluations)
                .set({
                    securityRating: input.securityRating,
                    cleaningRating: input.cleaningRating,
                    maintenanceRating: input.maintenanceRating,
                    communicationRating: input.communicationRating,
                    generalRating: input.generalRating,
                    comments: input.comments || null,
                    updatedAt: new Date(),
                })
                .where(eq(monthlyEvaluations.id, existing.id))
                .returning()

            return updated
        } else {
            // Create
            const [created] = await db
                .insert(monthlyEvaluations)
                .values({
                    buildingId: input.buildingId,
                    userId,
                    year: input.year,
                    month: input.month,
                    securityRating: input.securityRating,
                    cleaningRating: input.cleaningRating,
                    maintenanceRating: input.maintenanceRating,
                    communicationRating: input.communicationRating,
                    generalRating: input.generalRating,
                    comments: input.comments || null,
                })
                .returning()

            return created
        }
    }

    // Get all evaluations for a month (manager view)
    async getMonthEvaluations(buildingId: string, year: number, month: number) {
        return await db
            .select({
                id: monthlyEvaluations.id,
                userId: monthlyEvaluations.userId,
                securityRating: monthlyEvaluations.securityRating,
                cleaningRating: monthlyEvaluations.cleaningRating,
                maintenanceRating: monthlyEvaluations.maintenanceRating,
                communicationRating: monthlyEvaluations.communicationRating,
                generalRating: monthlyEvaluations.generalRating,
                comments: monthlyEvaluations.comments,
                createdAt: monthlyEvaluations.createdAt,
                userName: user.name,
            })
            .from(monthlyEvaluations)
            .leftJoin(user, eq(monthlyEvaluations.userId, user.id))
            .where(and(
                eq(monthlyEvaluations.buildingId, buildingId),
                eq(monthlyEvaluations.year, year),
                eq(monthlyEvaluations.month, month)
            ))
            .orderBy(monthlyEvaluations.createdAt)
    }

    // Get averages for a specific month
    async getMonthAverages(buildingId: string, year: number, month: number): Promise<MonthlyAverages | null> {
        const [result] = await db
            .select({
                securityAvg: avg(monthlyEvaluations.securityRating),
                cleaningAvg: avg(monthlyEvaluations.cleaningRating),
                maintenanceAvg: avg(monthlyEvaluations.maintenanceRating),
                communicationAvg: avg(monthlyEvaluations.communicationRating),
                generalAvg: avg(monthlyEvaluations.generalRating),
                totalResponses: count(),
            })
            .from(monthlyEvaluations)
            .where(and(
                eq(monthlyEvaluations.buildingId, buildingId),
                eq(monthlyEvaluations.year, year),
                eq(monthlyEvaluations.month, month)
            ))

        if (!result || result.totalResponses === 0) return null

        return {
            year,
            month,
            securityAvg: Number(result.securityAvg) || 0,
            cleaningAvg: Number(result.cleaningAvg) || 0,
            maintenanceAvg: Number(result.maintenanceAvg) || 0,
            communicationAvg: Number(result.communicationAvg) || 0,
            generalAvg: Number(result.generalAvg) || 0,
            totalResponses: result.totalResponses,
        }
    }

    // Get historical averages (last N months)
    async getHistoricalAverages(buildingId: string, months: number = 6): Promise<MonthlyAverages[]> {
        const results: MonthlyAverages[] = []
        const today = new Date()

        for (let i = months - 1; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
            const year = date.getFullYear()
            const month = date.getMonth() + 1

            const avg = await this.getMonthAverages(buildingId, year, month)
            if (avg) {
                results.push(avg)
            }
        }

        return results
    }

    // Get submission count for a month
    async getSubmissionCount(buildingId: string, year: number, month: number): Promise<number> {
        const [result] = await db
            .select({ count: count() })
            .from(monthlyEvaluations)
            .where(and(
                eq(monthlyEvaluations.buildingId, buildingId),
                eq(monthlyEvaluations.year, year),
                eq(monthlyEvaluations.month, month)
            ))

        return result.count
    }
}

export const evaluationService = new EvaluationService()