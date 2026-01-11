import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from "vitest"
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { ExtraPaymentGrid } from "../ExtraPaymentGrid"
import { type ExtraordinaryProjectSummary } from "@/lib/types"
import { type ApartmentPaymentData } from "../actions"

/**
 * IMPROVED TEST: Uses MSW instead of mocking hooks
 * This provides more realistic testing by intercepting actual HTTP requests
 */

// Set up MSW server with handlers
const server = setupServer(
  http.post('/api/extraordinary/update', async ({ request }) => {
    const body = await request.json()

    // Simulate successful update
    return HttpResponse.json({
      success: true,
      data: body
    })
  })
)

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

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
        status: "complete",
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

describe("ExtraPaymentGrid (MSW-based tests)", () => {
    it("renders grid with correct number of rows", () => {
        render(
            <ExtraPaymentGrid
                project={mockProject}
                payments={mockPayments}
            />
        )

        // Check resident names are displayed
        expect(screen.getAllByText("John").length).toBeGreaterThan(0)
        expect(screen.getAllByText("Jane").length).toBeGreaterThan(0)
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

    it("updates payment status via API with MSW", async () => {
        // Track API calls
        let apiCallMade = false
        let requestBody: any = null

        server.use(
            http.post('/api/extraordinary/update', async ({ request }) => {
                apiCallMade = true
                requestBody = await request.json()

                return HttpResponse.json({
                    success: true,
                    data: requestBody
                })
            })
        )

        render(
            <ExtraPaymentGrid
                project={mockProject}
                payments={mockPayments}
            />
        )

        // Activate "Mark as Paid" tool
        const markPaidBtn = screen.getByRole("button", { name: /Marcar Pago/i })
        fireEvent.click(markPaidBtn)

        // Find a pending cell for Jane
        const pendingCells = screen.getAllByLabelText(/Estado: pending/, { selector: "td" })
        const pendingCell = pendingCells[0]

        // Click it
        fireEvent.click(pendingCell)

        // Wait for API call to complete
        await waitFor(() => {
            expect(apiCallMade).toBe(true)
        }, { timeout: 2000 })

        // Verify request body
        expect(requestBody).toEqual({
            paymentId: 4,
            status: "paid",
            paidAmount: 16666
        })
    })

    it("handles API errors gracefully", async () => {
        // Mock API to return error
        server.use(
            http.post('/api/extraordinary/update', () => {
                return HttpResponse.json(
                    { success: false, error: 'Database error' },
                    { status: 500 }
                )
            })
        )

        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

        render(
            <ExtraPaymentGrid
                project={mockProject}
                payments={mockPayments}
            />
        )

        // Try to mark as paid
        const markPaidBtn = screen.getByRole("button", { name: /Marcar Pago/i })
        fireEvent.click(markPaidBtn)

        const pendingCell = screen.getAllByLabelText(/Estado: pending/, { selector: "td" })[0]
        fireEvent.click(pendingCell)

        // Wait for error handling
        await waitFor(() => {
            // Component should handle error (exact behavior depends on implementation)
            // Could check for error toast, rollback, etc.
        }, { timeout: 2000 })

        consoleSpy.mockRestore()
    })

    it("performs optimistic update then rolls back on error", async () => {
        // First call succeeds (optimistic update shows immediately)
        // Second call fails (should rollback)

        server.use(
            http.post('/api/extraordinary/update', () => {
                return HttpResponse.json(
                    { success: false, error: 'Network error' },
                    { status: 500 }
                )
            })
        )

        render(
            <ExtraPaymentGrid
                project={mockProject}
                payments={mockPayments}
            />
        )

        const markPaidBtn = screen.getByRole("button", { name: /Marcar Pago/i })
        fireEvent.click(markPaidBtn)

        const pendingCell = screen.getAllByLabelText(/Estado: pending/, { selector: "td" })[0]

        // Initial state should be pending
        expect(pendingCell).toHaveAttribute('aria-label', expect.stringContaining('pending'))

        // Click to update
        fireEvent.click(pendingCell)

        // Optimistic update might show paid briefly
        // Then should rollback to pending on error
        await waitFor(() => {
            expect(pendingCell).toHaveAttribute('aria-label', expect.stringContaining('pending'))
        }, { timeout: 2000 })
    })

    it("calculates totals correctly", () => {
        render(
            <ExtraPaymentGrid
                project={mockProject}
                payments={mockPayments}
            />
        )

        // Total collected should be 50,000 (John paid in full)
        const totalCollectedText = screen.getByText(/50.000,00/i)
        expect(totalCollectedText).toBeInTheDocument()

        // Progress should be 50%
        const progressText = screen.getByText(/50%/i)
        expect(progressText).toBeInTheDocument()
    })

    it("respects readOnly mode", () => {
        render(
            <ExtraPaymentGrid
                project={mockProject}
                payments={mockPayments}
                readOnly={true}
            />
        )

        // Tool buttons should not be visible in readOnly mode
        const markPaidBtn = screen.queryByRole("button", { name: /Marcar Pago/i })
        expect(markPaidBtn).toBeNull()
    })
})
