import { render, screen, cleanup } from "@testing-library/react"
import { PaymentStatusDisplay } from "../PaymentStatusDisplay"
import { describe, it, expect, afterEach } from "vitest"
import { PaymentStatusSummary } from "@/app/actions/payment-status"

const mockDataOk: PaymentStatusSummary = {
    residentName: "John Doe",
    status: "ok",
    statusMessage: "All good",
    regularQuotas: {
        balance: 0,
        overdueMonths: 0,
        totalDueToDate: 0,
        totalPaid: 0,
        currentMonthPaid: true
    },
    extraordinaryQuotas: {
        balance: 0,
        overdueInstallments: 0,
        activeProjects: 0,
        totalDueToDate: 0,
        totalPaid: 0
    },
    isBuildingSummary: false,
    apartmentUnit: "1A",

    totalBalance: 0,
    lastUpdated: new Date()
}

const mockDataCritical: PaymentStatusSummary = {
    residentName: "John Doe",
    status: "critical",
    statusMessage: "Pay up",
    totalBalance: 200,
    regularQuotas: {
        balance: 100,
        overdueMonths: 3,
        totalDueToDate: 200,
        totalPaid: 100,
        currentMonthPaid: false
    },
    extraordinaryQuotas: {
        balance: 100,
        overdueInstallments: 2,
        activeProjects: 1,
        totalDueToDate: 200,
        totalPaid: 100
    },
    isBuildingSummary: false,
    apartmentUnit: "1B",
    lastUpdated: new Date()
}

describe("PaymentStatusDisplay", () => {
    afterEach(() => {
        cleanup()
    })

    it("renders ok status correctly", () => {
        render(<PaymentStatusDisplay data={mockDataOk} />)
        expect(screen.getByText("Quotas de condomínio em dia.")).toBeTruthy()
    })

    it("renders critical status correctly", () => {
        render(<PaymentStatusDisplay data={mockDataCritical} />)
        // Use a partial match regex because currency formatting might have non-breaking spaces
        expect(screen.getByText(/Faltam.*em quotas/)).toBeTruthy()
    })
})
