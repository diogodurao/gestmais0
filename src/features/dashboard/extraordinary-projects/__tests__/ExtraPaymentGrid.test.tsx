import { render, screen, fireEvent, cleanup } from "@testing-library/react"
import { describe, it, expect, vi, afterEach } from "vitest"
import { ExtraPaymentGrid } from "../ExtraPaymentGrid"
import { type ExtraordinaryProjectSummary } from "@/lib/types"
import { type ApartmentPaymentData } from "@/app/actions/extraordinary"

// Mock hooks and components
vi.mock("@/components/ui/StatusBadge", () => ({
    StatusBadge: ({ status }: { status: string }) => <div data-testid="status-badge">{status}</div>
}))

vi.mock("@/hooks/use-toast", () => ({
    useToast: () => ({ toast: vi.fn() })
}))

// Mock useAsyncAction
const mockUpdatePayment = vi.fn()
vi.mock("@/hooks/useAsyncAction", () => ({
    useAsyncAction: () => ({
        execute: mockUpdatePayment,
        isPending: false
    })
}))

// Mock Sub-components that we don't need to test deeply here
vi.mock("../components/BudgetProgress", () => ({
    BudgetProgress: ({ totalCollected }: { totalCollected: number }) => (
        <div data-testid="budget-progress">{totalCollected}</div>
    )
}))
// Note: We use the REAL ApartmentRow to test integration

const mockProject: ExtraordinaryProjectSummary = {
    id: 1,
    name: "Telhado",
    totalBudget: 100000,
    numInstallments: 3,
    startMonth: 1,
    startYear: 2024,
    status: "active"
}

const mockPayments: ApartmentPaymentData[] = [
    {
        apartmentId: 1,
        unit: "1A",
        residentName: "John",
        permillage: 50,
        totalShare: 50000,
        totalPaid: 50000,
        balance: 0,
        status: "complete", // "complete" -> "paid" filter should show this
        installments: [
            { id: 1, number: 1, month: 1, year: 2024, paidAmount: 16666, status: "paid", expectedAmount: 16666 },
            { id: 2, number: 2, month: 2, year: 2024, paidAmount: 16666, status: "paid", expectedAmount: 16666 },
            { id: 3, number: 3, month: 3, year: 2024, paidAmount: 16668, status: "paid", expectedAmount: 16668 },
        ]
    },
    {
        apartmentId: 2,
        unit: "1B",
        residentName: "Jane",
        permillage: 50,
        totalShare: 50000,
        totalPaid: 0,
        balance: 50000,
        status: "pending",
        installments: [
            { id: 4, number: 1, month: 1, year: 2024, paidAmount: 0, status: "pending", expectedAmount: 16666 },
            { id: 5, number: 2, month: 2, year: 2024, paidAmount: 0, status: "pending", expectedAmount: 16666 },
            { id: 6, number: 3, month: 3, year: 2024, paidAmount: 0, status: "pending", expectedAmount: 16668 },
        ]
    }
]

describe("ExtraPaymentGrid", () => {
    afterEach(cleanup)

    it("renders grid with correct number of rows", () => {
        render(
            <ExtraPaymentGrid
                project={mockProject}
                payments={mockPayments}
            />
        )

        // Title/Header checks
        // Check finding at least one occurrence due to mobile/desktop layouts
        expect(screen.getAllByText("John").length).toBeGreaterThan(0)
        expect(screen.getAllByText("Jane").length).toBeGreaterThan(0)

        // Rows check (2 data rows * potentially 2 views = 4 items or so)
        const rows = screen.getAllByText(/John|Jane/)
        expect(rows.length).toBeGreaterThanOrEqual(2)

        // Progress check
        expect(screen.getByTestId("budget-progress")).toBeDefined()
    })

    it("filters payments correctly", () => {
        render(
            <ExtraPaymentGrid
                project={mockProject}
                payments={mockPayments}
            />
        )

        // Find filter buttons
        const pendingFilter = screen.getByRole("button", { name: /Pendentes/i })
        const paidFilter = screen.getByRole("button", { name: /Pagas/i })

        // Filter by Pending
        fireEvent.click(pendingFilter)

        // Should show Jane (pending), hide John (complete)
        expect(screen.getAllByText("Jane").length).toBeGreaterThan(0)
        expect(screen.queryByText("John")).toBeNull()

        // Filter by Paid
        fireEvent.click(paidFilter)

        // Should show John (complete), hide Jane (pending)
        expect(screen.getAllByText("John").length).toBeGreaterThan(0)
        expect(screen.queryByText("Jane")).toBeNull()
    })

    it("handles interaction via tool mode", () => {
        vi.useFakeTimers()

        render(
            <ExtraPaymentGrid
                project={mockProject}
                payments={mockPayments}
            />
        )

        // Activate "Mark as Paid" tool
        const markPaidBtn = screen.getByRole("button", { name: /Marcar Pago/i })
        fireEvent.click(markPaidBtn)

        // Find a pending cell for Jane (1B)
        // Similar strategy as ApartmentRow tests, handle duplicates
        const pendingCells = screen.getAllByLabelText(/Estado: pending/, { selector: "td" })
        const pendingCell = pendingCells[0]

        // Click it
        fireEvent.click(pendingCell)

        // Fast-forward time for debounce (300ms)
        vi.advanceTimersByTime(500)

        // Expect updatePayment to be called
        expect(mockUpdatePayment).toHaveBeenCalled()

        const args = mockUpdatePayment.mock.calls[0][0]
        expect(args).toEqual({
            paymentId: 4, // Jane's first installment id
            status: "paid", // We are in markPaid mode
            paidAmount: 16666
        })

        vi.useRealTimers()
    })
})
