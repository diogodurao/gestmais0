import { render, screen, fireEvent, cleanup } from "@testing-library/react"
import { ResidentsList } from "../ResidentsList"
import { describe, it, expect, vi, afterEach } from "vitest"

// Mock ResidentActionsMenu
vi.mock("../ResidentActionsMenu", () => ({
    ResidentActionsMenu: () => <div data-testid="resident-actions-menu">Menu</div>
}))

const mockResidents = [
    {
        user: { id: "1", name: "John Doe", email: "john@example.com" },
        apartment: { id: 1, unit: "1A" }
    },
    {
        user: { id: "2", name: "Jane Smith", email: "jane@example.com" },
        apartment: null
    }
]

describe("ResidentsList", () => {
    afterEach(() => {
        cleanup()
    })

    it("renders residents list", () => {
        render(<ResidentsList buildingId="b1" residents={mockResidents} unclaimedUnits={[]} />)
        expect(screen.getByText("John Doe")).toBeTruthy()
        expect(screen.getByText("Jane Smith")).toBeTruthy()
        expect(screen.getByText("1A")).toBeTruthy()
    })

    it("filters residents", () => {
        render(<ResidentsList buildingId="b1" residents={mockResidents} unclaimedUnits={[]} />)

        const searchInput = screen.getByPlaceholderText("PROCURAR...")
        fireEvent.change(searchInput, { target: { value: "Jane" } })

        expect(screen.getByText("Jane Smith")).toBeTruthy()
        expect(screen.queryByText("John Doe")).toBeNull()
    })

    it("shows empty state", () => {
        render(<ResidentsList buildingId="b1" residents={[]} unclaimedUnits={[]} />)
        expect(screen.getByText("[ SEM RESULTADOS ]")).toBeTruthy()
    })
})
