import { render, screen, fireEvent, cleanup } from "@testing-library/react"
import { describe, it, expect, vi, afterEach } from "vitest"
import { ApartmentRow } from "../ApartmentRow"
import { type ApartmentPaymentData } from "@/app/actions/extraordinary"

// Mock Badge since it's a UI component
vi.mock("@/components/ui/Badge", () => ({
    Badge: ({ status }: { status: string }) => <div data-testid="status-badge">{status}</div>
}))

const mockApartment: ApartmentPaymentData = {
    apartmentId: 1,
    unit: "1A",
    residentName: "John Doe",
    permillage: 50,
    totalShare: 100000, // 1000.00
    totalPaid: 20000,
    balance: 80000,
    status: "pending",
    installments: [
        { id: 1, number: 1, month: 1, year: 2024, paidAmount: 20000, status: "paid", expectedAmount: 20000 },
        { id: 2, number: 2, month: 2, year: 2024, paidAmount: 0, status: "late", expectedAmount: 20000 },
        { id: 3, number: 3, month: 3, year: 2024, paidAmount: 0, status: "pending", expectedAmount: 20000 },
    ]
}

describe("ApartmentRow", () => {
    afterEach(cleanup)

    const defaultProps = {
        apartment: mockApartment,
        toolMode: null,
        onCellClick: vi.fn(),
        readOnly: false,
        startMonth: 1,
        startYear: 2024
    }

    it("renders apartment details correctly", () => {
        render(
            <table>
                <tbody>
                    <ApartmentRow {...defaultProps} />
                </tbody>
            </table>
        )

        expect(screen.getByText("1A")).toBeDefined()
        expect(screen.getByText("John Doe")).toBeDefined()
        expect(screen.getByText("50.00")).toBeDefined() // permillage
    })

    it("renders correct installment statuses", () => {
        render(
            <table>
                <tbody>
                    <ApartmentRow {...defaultProps} />
                </tbody>
            </table>
        )

        // Paid installment - use aria-label to find the specific cell
        const paidCell = screen.getByLabelText(/Estado: paid/, { selector: 'td' })
        expect(paidCell.className).toContain("bg-emerald-50")
        expect(paidCell.textContent).toContain("200,00") // Check text content including 200,00

        // Late installment
        const lateCell = screen.getByText("EM ATRASO").closest("td")
        expect(lateCell?.className).toContain("bg-rose-50")
    })

    it("calls onCellClick when interactive", () => {
        const onCellClick = vi.fn()
        render(
            <table>
                <tbody>
                    <ApartmentRow
                        {...defaultProps}
                        toolMode="markPaid"
                        onCellClick={onCellClick}
                    />
                </tbody>
            </table>
        )

        // Click the third installment (pending)
        const pendingCell = screen.getByLabelText(/Estado: pending/, { selector: 'td' })
        fireEvent.click(pendingCell)

        expect(onCellClick).toHaveBeenCalledWith(
            3, // id
            "pending", // status
            20000 // expectedAmount
        )
    })

    it("does not allow interaction in readOnly mode", () => {
        const onCellClick = vi.fn()
        render(
            <table>
                <tbody>
                    <ApartmentRow
                        {...defaultProps}
                        toolMode="markPaid"
                        readOnly={true}
                        onCellClick={onCellClick}
                    />
                </tbody>
            </table>
        )

        // Check each installment cell specifically for the absence of role="button"
        const cells = screen.getAllByLabelText(/Estado:/, { selector: 'td' })
        cells.forEach(cell => {
            expect(cell.getAttribute("role")).toBeNull()
            // Also check onCellClick is not fired if clicked
            fireEvent.click(cell)
        })

        expect(onCellClick).not.toHaveBeenCalled()
    })
})
