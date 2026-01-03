import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react"
import { LoginForm } from "../LoginForm"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"

// Mock dependencies
vi.mock("@/lib/auth-client", () => ({
    authClient: {
        signIn: {
            email: vi.fn()
        }
    }
}))

vi.mock("next/navigation", () => ({
    useRouter: vi.fn()
}))

describe("LoginForm", () => {
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

    it("renders login form correctly", () => {
        render(<LoginForm />)

        expect(screen.getByPlaceholderText(/tiago123@gmail.com/i)).toBeTruthy()
        expect(screen.getByPlaceholderText(/••••••••/i)).toBeTruthy()
        expect(screen.getByRole("button", { name: /entrar/i })).toBeTruthy()
    })

    it("handles input changes", () => {
        render(<LoginForm />)

        const emailInput = screen.getByPlaceholderText(/tiago123@gmail.com/i)
        const passwordInput = screen.getByPlaceholderText(/••••••••/i)

        fireEvent.change(emailInput, { target: { value: "test@example.com" } })
        fireEvent.change(passwordInput, { target: { value: "password123" } })

        expect((emailInput as HTMLInputElement).value).toBe("test@example.com")
        expect((passwordInput as HTMLInputElement).value).toBe("password123")
    })

    it("submits form with valid credentials", async () => {
        render(<LoginForm />)

        const emailInput = screen.getByPlaceholderText(/tiago123@gmail.com/i)
        const passwordInput = screen.getByPlaceholderText(/••••••••/i)
        const submitButton = screen.getByRole("button", { name: /entrar/i })

        fireEvent.change(emailInput, { target: { value: "test@example.com" } })
        fireEvent.change(passwordInput, { target: { value: "password123" } })

        // Mock successful sign in
        vi.mocked(authClient.signIn.email).mockImplementation(async (data, callbacks) => {
            callbacks?.onSuccess?.({} as any)
            return { data: {}, error: null }
        })

        fireEvent.click(submitButton)

        await waitFor(() => {
            expect(authClient.signIn.email).toHaveBeenCalledWith(
                expect.objectContaining({
                    email: "test@example.com",
                    password: "password123"
                }),
                expect.any(Object)
            )
            expect(mockPush).toHaveBeenCalledWith("/dashboard")
        })
    })

    it("displays error message on failed login", async () => {
        render(<LoginForm />)

        const emailInput = screen.getByPlaceholderText(/tiago123@gmail.com/i)
        const passwordInput = screen.getByPlaceholderText(/••••••••/i)
        const submitButton = screen.getByRole("button", { name: /entrar/i })

        fireEvent.change(emailInput, { target: { value: "test@example.com" } })
        fireEvent.change(passwordInput, { target: { value: "wrongpassword" } })

        // Mock failed sign in
        vi.mocked(authClient.signIn.email).mockImplementation(async (data, callbacks) => {
            callbacks?.onError?.({ error: { message: "Credenciais inválidas" } } as any)
            return { data: null, error: { message: "Credenciais inválidas" } }
        })

        fireEvent.click(submitButton)

        await waitFor(() => {
            expect(screen.getByText("Credenciais inválidas")).toBeTruthy()
        })
    })
})
