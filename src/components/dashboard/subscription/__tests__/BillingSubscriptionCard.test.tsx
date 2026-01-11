import { render, screen, cleanup } from "@testing-library/react"
import { BillingSubscriptionCard } from "../BillingSubscriptionCard"
import { describe, it, expect, afterEach } from "vitest"

// Mock internal components if necessary
// It seems fairly self-contained or relies on simple props?
// Let's assume it takes a subscription object or similar.

const mockSubscription = {
    status: "active",
    plan: "Pro",
    currentPeriodEnd: new Date(2024, 11, 31)
}

describe("BillingSubscriptionCard", () => {
    afterEach(() => {
        cleanup()
    })

    it("renders subscription details", () => {
        render(
            <BillingSubscriptionCard
                subscriptionStatus="active"
                buildingId="b1"
                canSubscribe={false}
                profileComplete={true}
                buildingComplete={true}
                totalApartments={10}
            />
        )
        expect(screen.getByText("Subscrição Ativa")).toBeTruthy()
    })

    it("renders inactive state", () => {
        render(
            <BillingSubscriptionCard
                subscriptionStatus={null}
                buildingId="b1"
                canSubscribe={true}
                profileComplete={true}
                buildingComplete={true}
                totalApartments={10}
            />
        )
        expect(screen.getByText("A Aguardar Sincronização")).toBeTruthy()
    })
})
