import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react"
import { RegisterForm } from "../RegisterForm"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"

// Mock dependencies
vi.mock("@/lib/auth-client", () => ({
    authClient: {
        signUp: {
            email: vi.fn()
        }
    }
}))

vi.mock("next/navigation", () => ({
    useRouter: vi.fn()
}))

// Mock validations
vi.mock("@/lib/validations", () => ({
    isValidNif: vi.fn(),
}))

import { isValidNif } from "@/lib/validations"

describe("RegisterForm", () => {
    const mockPush = vi.fn()

    beforeEach(() => {
        vi.mocked(useRouter).mockReturnValue({
            push: mockPush,
            back: vi.fn(),
            forward: vi.fn(),
            refresh: vi.fn(),
            replace: vi.fn(),
            prefetch: vi.fn(),
        } as any)
    })

    afterEach(() => {
        cleanup()
        vi.clearAllMocks()
    })

    it("renders register form correctly", () => {
        render(<RegisterForm />)

        expect(screen.getByPlaceholderText(/Tiago Silva/i)).toBeTruthy()
        expect(screen.getByPlaceholderText(/tiago123@gmail.com/i)).toBeTruthy()
        expect(screen.getByPlaceholderText(/••••••••/i)).toBeTruthy()
        expect(screen.getByPlaceholderText(/206578465/i)).toBeTruthy()
        expect(screen.getByRole("button", { name: /registar/i })).toBeTruthy()
    })

    it("validates form inputs", async () => {
        render(<RegisterForm />)

        const submitButton = screen.getByRole("button", { name: /registar/i })

        // Submit empty form
        fireEvent.click(submitButton)

        await waitFor(() => {
            expect(screen.getByText("Nome é obrigatório")).toBeTruthy()
            expect(screen.getByText("Email é obrigatório")).toBeTruthy()
        })
    })

    it("submits form with valid data", async () => {
        vi.mocked(isValidNif).mockReturnValue(true)
        render(<RegisterForm />)

        const nameInput = screen.getByPlaceholderText(/Tiago Silva/i)
        const emailInput = screen.getByPlaceholderText(/tiago123@gmail.com/i)
        const passwordInput = screen.getByPlaceholderText(/••••••••/i)
        const nifInput = screen.getByPlaceholderText(/206578465/i)
        const submitButton = screen.getByRole("button", { name: /registar/i })

        fireEvent.change(nameInput, { target: { value: "John Doe" } })
        fireEvent.change(emailInput, { target: { value: "john@example.com" } })
        fireEvent.change(passwordInput, { target: { value: "Password123" } })
        fireEvent.change(nifInput, { target: { value: "123456789" } })

        // Mock successful sign up
        vi.mocked(authClient.signUp.email).mockImplementation(async (data, callbacks) => {
            callbacks?.onSuccess?.({} as any)
            return { data: {}, error: null }
        })

        fireEvent.click(submitButton)

        await waitFor(() => {
            expect(authClient.signUp.email).toHaveBeenCalledWith(
                expect.objectContaining({
                    email: "john@example.com",
                    name: "John Doe",
                    password: "Password123",
                    nif: "123456789",
                    role: "resident"
                }),
                expect.any(Object)
            )
            expect(mockPush).toHaveBeenCalledWith("/dashboard")
        })
    })
})
