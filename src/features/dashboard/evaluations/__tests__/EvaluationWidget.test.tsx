import { render, screen, cleanup } from "@testing-library/react"
import { EvaluationWidget } from "../EvaluationWidget"
import { describe, it, expect, afterEach } from "vitest"
import { EvaluationStatus } from "@/lib/types"

const mockStatusLocked: EvaluationStatus = {
    year: 2024,
    month: 1, // January
    isOpen: false,
    daysUntilOpen: 5,
    daysRemaining: 10,
    hasSubmitted: false,
    userEvaluation: null
}

const mockStatusOpen: EvaluationStatus = {
    year: 2024,
    month: 1,
    isOpen: true,
    daysUntilOpen: 0,
    daysRemaining: 5,
    hasSubmitted: false,
    userEvaluation: null
}

const mockStatusSubmitted: EvaluationStatus = {
    year: 2024,
    month: 1,
    isOpen: true,
    daysUntilOpen: 0,
    daysRemaining: 5,
    hasSubmitted: true,
    userEvaluation: {
        id: 1,
        userId: "u1",
        securityRating: 5,
        cleaningRating: 5,
        maintenanceRating: 5,
        communicationRating: 5,
        generalRating: 5,
        comments: "Good",
        createdAt: new Date(),
        userName: "User 1"
    }
}

describe("EvaluationWidget", () => {
    afterEach(() => {
        cleanup()
    })

    it("renders locked state correctly", () => {
        render(<EvaluationWidget status={mockStatusLocked} />)

        expect(screen.getByText("Avaliação de Janeiro")).toBeTruthy()
        expect(screen.getByText("A avaliação abre dia 24")).toBeTruthy()
        expect(screen.getByText("Faltam 5 dias")).toBeTruthy()
    })

    it("renders open state correctly", () => {
        render(<EvaluationWidget status={mockStatusOpen} />)

        expect(screen.getByText("Avaliação de Janeiro")).toBeTruthy()
        expect(screen.getByText("A avaliação está aberta!")).toBeTruthy()
        expect(screen.getByText("Faltam 5 dias para submeter")).toBeTruthy()
    })

    it("renders submitted state correctly", () => {
        render(<EvaluationWidget status={mockStatusSubmitted} />)

        expect(screen.getByText("Avaliação de Janeiro")).toBeTruthy()
        expect(screen.getByText("Avaliação submetida ✓")).toBeTruthy()
    })
})
