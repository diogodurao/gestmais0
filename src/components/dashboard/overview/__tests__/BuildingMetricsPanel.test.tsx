import { render, screen, cleanup } from "@testing-library/react"
import { BuildingMetricsPanel } from "../BuildingMetricsPanel"
import { describe, it, expect, afterEach } from "vitest"

const mockMetrics = {
    totalResidents: 10,
    activeIncidents: 2,
    pendingPayments: 5,
    occupancyRate: 80
}

describe("BuildingMetricsPanel", () => {
    afterEach(() => {
        cleanup()
    })

    it("renders metrics for manager", () => {
        const props = {
            isManager: true,
            residents: new Array(10).fill({}),
            unclaimedUnits: new Array(5).fill({}),
            residentBuildingInfo: null,
            totalApartments: 20
        }

        render(<BuildingMetricsPanel {...props} />)

        expect(screen.getByText("10")).toBeTruthy() // residents count
        expect(screen.getByText("5")).toBeTruthy()  // unclaimed count
        expect(screen.getByText("Residentes")).toBeTruthy()
    })

    it("renders info for resident", () => {
        const props = {
            isManager: false,
            residents: [],
            unclaimedUnits: [],
            residentBuildingInfo: {
                building: { name: "Building A" },
                manager: { name: "Manager M" }
            }
        }

        render(<BuildingMetricsPanel {...props} />)

        expect(screen.getByText("Building A")).toBeTruthy()
        expect(screen.getByText(/Manager M/)).toBeTruthy()
    })
})
