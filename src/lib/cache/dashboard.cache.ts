import { cacheTag, cacheLife } from "next/cache"
import { pollService } from "@/services/poll.service"
import { discussionService } from "@/services/discussion.service"
import { calendarService } from "@/services/calendar.service"
import { documentService } from "@/services/document.service"
import { occurrenceService } from "@/services/occurrence.service"
import { paymentService } from "@/services/payment.service"
import type { Document, Occurrence, Poll, Discussion } from "@/lib/types"

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

export async function getCachedPolls(buildingId: string): Promise<Poll[]> {
    "use cache"
    cacheTag(`polls-${buildingId}`)
    cacheLife("minutes")

    const result = await pollService.getByBuilding(buildingId)
    if (!result.success) return []
    return result.data as Poll[]
}

export async function getCachedPoll(pollId: number): Promise<Poll | null> {
    "use cache"
    cacheTag(`poll-${pollId}`)
    cacheLife("minutes")

    const result = await pollService.getById(pollId)
    if (!result.success) return null
    return result.data as Poll | null
}

export async function getCachedPollVotes(pollId: number) {
    "use cache"
    cacheTag(`poll-votes-${pollId}`)
    cacheLife("seconds")

    const result = await pollService.getVotes(pollId)
    if (!result.success) return []
    return result.data
}

// ============================================================================
// DISCUSSIONS
// ============================================================================

export async function getCachedDiscussions(buildingId: string): Promise<Discussion[]> {
    "use cache"
    cacheTag(`discussions-${buildingId}`)
    cacheLife("minutes")

    const result = await discussionService.getByBuilding(buildingId)
    if (!result.success) return []
    return result.data as Discussion[]
}

export async function getCachedDiscussion(discussionId: number): Promise<Discussion | null> {
    "use cache"
    cacheTag(`discussion-${discussionId}`)
    cacheLife("minutes")

    const result = await discussionService.getById(discussionId)
    if (!result.success) return null
    return result.data as Discussion | null
}

export async function getCachedDiscussionComments(discussionId: number) {
    "use cache"
    cacheTag(`discussion-comments-${discussionId}`)
    cacheLife("seconds")

    const result = await discussionService.getComments(discussionId)
    if (!result.success) return []
    return result.data
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

    const result = await calendarService.getEvents(buildingId, year, month)
    if (!result.success) return []
    return result.data
}

export async function getCachedNextUpcomingEvent(buildingId: string) {
    "use cache"
    cacheTag(`calendar-${buildingId}`, `calendar-next-${buildingId}`)
    cacheLife("hours")

    const result = await calendarService.getNextUpcomingEvent(buildingId)
    if (!result.success) return null
    return result.data
}

// ============================================================================
// DOCUMENTS
// ============================================================================

export async function getCachedDocuments(buildingId: string): Promise<Document[]> {
    "use cache"
    cacheTag(`documents-${buildingId}`)
    cacheLife("hours")

    const result = await documentService.getByBuilding(buildingId)
    if (!result.success) return []
    return result.data as Document[]
}

export async function getCachedDocument(documentId: number) {
    "use cache"
    cacheTag(`document-${documentId}`)
    cacheLife("hours")

    const result = await documentService.getById(documentId)
    if (!result.success) return null
    return result.data
}

// ============================================================================
// OCCURRENCES
// ============================================================================

export async function getCachedOccurrences(buildingId: string): Promise<Occurrence[]> {
    "use cache"
    cacheTag(`occurrences-${buildingId}`)
    cacheLife("minutes")

    const result = await occurrenceService.getByBuilding(buildingId)
    if (!result.success) return []
    return result.data as Occurrence[]
}

export async function getCachedOccurrence(occurrenceId: number) {
    "use cache"
    cacheTag(`occurrence-${occurrenceId}`)
    cacheLife("minutes")

    const result = await occurrenceService.getById(occurrenceId)
    if (!result.success) return null
    return result.data
}

export async function getCachedOccurrenceComments(occurrenceId: number) {
    "use cache"
    cacheTag(`occurrence-comments-${occurrenceId}`)
    cacheLife("seconds")

    const result = await occurrenceService.getComments(occurrenceId)
    if (!result.success) return []
    return result.data
}

export async function getCachedOccurrenceAttachments(occurrenceId: number) {
    "use cache"
    cacheTag(`occurrence-attachments-${occurrenceId}`)
    cacheLife("minutes")

    const result = await occurrenceService.getOccurrenceAttachments(occurrenceId)
    if (!result.success) return []
    return result.data
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