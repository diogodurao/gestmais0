import { render, screen, fireEvent, cleanup } from "@testing-library/react"
import { DiscussionsList } from "../DiscussionsList"
import { describe, it, expect, vi, afterEach } from "vitest"
import { Discussion } from "@/lib/types"

// Mock dependencies
vi.mock("../DiscussionCard", () => ({
    DiscussionCard: ({ discussion }: { discussion: Discussion }) => (
        <div data-testid="discussion-card">{discussion.title}</div>
    )
}))

vi.mock("../DiscussionModal", () => ({
    DiscussionModal: ({ isOpen, onClose }: any) => (
        isOpen ? <div data-testid="discussion-modal"><button onClick={onClose}>Close</button></div> : null
    )
}))

const mockDiscussions: Discussion[] = [
    {
        id: "1",
        title: "Discussion 1",
        content: "Content 1",
        authorId: "user1",
        buildingId: "b1",
        createdAt: new Date(),
        updatedAt: new Date(),
        isClosed: false,
        author: { name: "User 1", email: "u1@e.com", role: "resident" } as any,
        comments: []
    },
    {
        id: "2",
        title: "Discussion 2",
        content: "Content 2",
        authorId: "user2",
        buildingId: "b1",
        createdAt: new Date(),
        updatedAt: new Date(),
        isClosed: true,
        author: { name: "User 2", email: "u2@e.com", role: "manager" } as any,
        comments: []
    }
]

describe("DiscussionsList", () => {
    afterEach(() => {
        cleanup()
    })

    it("renders discussions list correctly", () => {
        render(<DiscussionsList buildingId="b1" initialDiscussions={mockDiscussions} />)

        expect(screen.getByText("Discussões")).toBeTruthy()
        expect(screen.getAllByTestId("discussion-card")).toHaveLength(2)
    })

    it("filters discussions by open status", () => {
        render(<DiscussionsList buildingId="b1" initialDiscussions={mockDiscussions} />)

        fireEvent.click(screen.getByText("Abertas"))

        const cards = screen.getAllByTestId("discussion-card")
        expect(cards).toHaveLength(1)
        expect(screen.getByText("Discussion 1")).toBeTruthy()
        expect(screen.queryByText("Discussion 2")).toBeNull()
    })

    it("filters discussions by closed status", () => {
        render(<DiscussionsList buildingId="b1" initialDiscussions={mockDiscussions} />)

        fireEvent.click(screen.getByText("Encerradas"))

        const cards = screen.getAllByTestId("discussion-card")
        expect(cards).toHaveLength(1)
        expect(screen.getByText("Discussion 2")).toBeTruthy()
        expect(screen.queryByText("Discussion 1")).toBeNull()
    })

    it("opens new discussion modal", () => {
        render(<DiscussionsList buildingId="b1" initialDiscussions={mockDiscussions} />)

        fireEvent.click(screen.getByText("Nova Discussão"))
        expect(screen.getByTestId("discussion-modal")).toBeTruthy()
    })
})
