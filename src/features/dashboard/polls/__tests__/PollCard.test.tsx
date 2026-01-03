import { render, screen, cleanup } from "@testing-library/react"
import { PollCard } from "../PollCard"
import { describe, it, expect, afterEach } from "vitest"
import { Poll } from "@/lib/types"

const mockPoll: Poll = {
    id: 1,
    buildingId: "b1",
    title: "New Gym",
    description: "Should we build a gym?",
    type: "yes_no",
    weightMode: "equal",
    status: "open",
    options: ["yes", "no"],
    createdBy: "u1",
    createdAt: new Date(),
    closedAt: null,
    creatorName: "User 1",
    voteCount: 5
}

import { ReactNode } from "react"
// Mock Link or next/navigation if needed. PollCard likely uses Link.
// import Link from "next/link";
// We don't need to mock Link unless we test navigation or href.
// But we should assert content.

describe("PollCard", () => {
    afterEach(() => {
        cleanup()
    })

    it("renders poll details", () => {
        render(<PollCard poll={mockPoll} />)

        expect(screen.getByText("New Gym")).toBeTruthy()
        expect(screen.getByText("Should we build a gym?")).toBeTruthy()
        expect(screen.getByText("Aberta")).toBeTruthy() // Status badge
        // expect(screen.getByText("Sim/Não/Abstenção")).toBeTruthy() // Type label from config?
    })

    it("renders vote count", () => {
        render(<PollCard poll={mockPoll} />)
        expect(screen.getByText("5 votos")).toBeTruthy()
    })
})
