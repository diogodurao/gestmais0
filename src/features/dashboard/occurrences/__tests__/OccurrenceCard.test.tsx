import { render, screen, cleanup } from "@testing-library/react"
import { OccurrenceCard } from "../OccurrenceCard"
import { describe, it, expect, afterEach } from "vitest"
import { Occurrence } from "@/lib/types"

const mockOccurrence: Occurrence = {
    id: 1,
    buildingId: "b1",
    title: "Broken Light",
    type: "maintenance",
    description: "Light in hall is broken",
    status: "open",
    createdBy: "u1",
    createdAt: new Date(),
    resolvedAt: null,
    creatorName: "User 1",
    commentCount: 2
}

import { ReactNode } from "react"
// Mock Link if needed, but OccurrenceCard might use Link or onClick.
// Let's check OccurrenceCard usage.

describe("OccurrenceCard", () => {
    afterEach(() => {
        cleanup()
    })

    it("renders occurrence details", () => {
        render(<OccurrenceCard occurrence={mockOccurrence} />)

        expect(screen.getByText("Broken Light")).toBeTruthy()
        expect(screen.getByText("Light in hall is broken")).toBeTruthy()
        expect(screen.getByText("Aberta")).toBeTruthy() // Status badge text from config
        expect(screen.getByText("Manutenção")).toBeTruthy() // Type might be capitalized or mapped?
    })

    it("renders comment count", () => {
        render(<OccurrenceCard occurrence={mockOccurrence} />)
        expect(screen.getByText("2 comentários")).toBeTruthy()
    })
})
