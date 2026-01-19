import { cacheTag, cacheLife } from "next/cache"
import { pollService } from "@/services/poll.service"
import { discussionService } from "@/services/discussion.service"
import { calendarService } from "@/services/calendar.service"
import { documentService } from "@/services/document.service"
import { occurrenceService } from "@/services/occurrence.service"
import { paymentService } from "@/services/payment.service"
import type { Document, Occurrence } from "@/lib/types"

/**
 * Cached data fetchers for dashboard pages.
 *
 * These functions cache building-level data that is the same for all users
 * within a building. User-specific data (session checks, permissions) should
 * remain in the page components.
 *
 * Cache invalidation is handled via updateTag() in server actions.
 */

// ============================================================================
// POLLS
// ============================================================================

export async function getCachedPolls(buildingId: string) {
    "use cache"
    cacheTag(`polls-${buildingId}`)
    cacheLife("minutes")

    return await pollService.getByBuilding(buildingId)
}

export async function getCachedPoll(pollId: number) {
    "use cache"
    cacheTag(`poll-${pollId}`)
    cacheLife("minutes")

    return await pollService.getById(pollId)
}

export async function getCachedPollVotes(pollId: number) {
    "use cache"
    cacheTag(`poll-votes-${pollId}`)
    cacheLife("seconds")

    return await pollService.getVotes(pollId)
}

// ============================================================================
// DISCUSSIONS
// ============================================================================

export async function getCachedDiscussions(buildingId: string) {
    "use cache"
    cacheTag(`discussions-${buildingId}`)
    cacheLife("minutes")

    return await discussionService.getByBuilding(buildingId)
}

export async function getCachedDiscussion(discussionId: number) {
    "use cache"
    cacheTag(`discussion-${discussionId}`)
    cacheLife("minutes")

    return await discussionService.getById(discussionId)
}

export async function getCachedDiscussionComments(discussionId: number) {
    "use cache"
    cacheTag(`discussion-comments-${discussionId}`)
    cacheLife("seconds")

    return await discussionService.getComments(discussionId)
}

// ============================================================================
// CALENDAR
// ============================================================================

export async function getCachedCalendarEvents(
    buildingId: string,
    year: number,
    month: number
) {
    "use cache"
    cacheTag(`calendar-${buildingId}`, `calendar-${buildingId}-${year}-${month}`)
    cacheLife("hours")

    return await calendarService.getEvents(buildingId, year, month)
}

export async function getCachedNextUpcomingEvent(buildingId: string) {
    "use cache"
    cacheTag(`calendar-${buildingId}`, `calendar-next-${buildingId}`)
    cacheLife("hours")

    return await calendarService.getNextUpcomingEvent(buildingId)
}

// ============================================================================
// DOCUMENTS
// ============================================================================

export async function getCachedDocuments(buildingId: string): Promise<Document[]> {
    "use cache"
    cacheTag(`documents-${buildingId}`)
    cacheLife("hours")

    const docs = await documentService.getByBuilding(buildingId)
    return docs as Document[]
}

export async function getCachedDocument(documentId: number) {
    "use cache"
    cacheTag(`document-${documentId}`)
    cacheLife("hours")

    return await documentService.getById(documentId)
}

// ============================================================================
// OCCURRENCES
// ============================================================================

export async function getCachedOccurrences(buildingId: string): Promise<Occurrence[]> {
    "use cache"
    cacheTag(`occurrences-${buildingId}`)
    cacheLife("minutes")

    const occurrences = await occurrenceService.getByBuilding(buildingId)
    return occurrences as Occurrence[]
}

export async function getCachedOccurrence(occurrenceId: number) {
    "use cache"
    cacheTag(`occurrence-${occurrenceId}`)
    cacheLife("minutes")

    return await occurrenceService.getById(occurrenceId)
}

export async function getCachedOccurrenceComments(occurrenceId: number) {
    "use cache"
    cacheTag(`occurrence-comments-${occurrenceId}`)
    cacheLife("seconds")

    return await occurrenceService.getComments(occurrenceId)
}

export async function getCachedOccurrenceAttachments(occurrenceId: number) {
    "use cache"
    cacheTag(`occurrence-attachments-${occurrenceId}`)
    cacheLife("minutes")

    return await occurrenceService.getOccurrenceAttachments(occurrenceId)
}

// ============================================================================
// PAYMENTS
// ============================================================================

export async function getCachedPaymentMap(buildingId: string, year: number) {
    "use cache"
    cacheTag(`payments-${buildingId}`, `payments-${buildingId}-${year}`)
    cacheLife("minutes")

    return await paymentService.getPaymentMap(buildingId, year)
}