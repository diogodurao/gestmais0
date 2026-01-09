"use client"

import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { AlertTriangle } from "lucide-react"

interface ErrorFallbackProps {
    error: Error & { digest?: string }
    reset: () => void
    variant?: "page" | "dashboard"
}

export function ErrorFallback({ error, reset, variant = "page" }: ErrorFallbackProps) {
    const isDashboard = variant === "dashboard"

    const handleGoToDashboard = () => {
        window.location.href = "/dashboard"
    }

    const handleReload = () => {
        window.location.reload()
    }

    if (isDashboard) {
        return (
            <div className="flex items-center justify-center h-full p-6">
                <Card className="flex flex-col items-center max-w-md p-6 text-center border-error bg-error-light">
                    <AlertTriangle className="w-12 h-12 mb-4 text-error" />
                    <h2 className="mb-2 text-heading font-semibold leading-tight text-gray-800">Application Error</h2>
                    <p className="mb-6 text-body leading-normal text-gray-700">
                        Something went wrong in the dashboard application.
                    </p>
                    {process.env.NODE_ENV === "development" && (
                        <div className="w-full mb-4 p-4 bg-white rounded-md text-left overflow-auto max-h-32">
                            <code className="text-label font-medium leading-tight text-error font-mono break-all">
                                {error.message}
                            </code>
                        </div>
                    )}
                    <div className="flex gap-4">
                        <Button
                            variant="outline"
                            className="bg-white text-gray-700 hover:bg-gray-50"
                            onClick={handleReload}
                        >
                            Reload Page
                        </Button>
                        <Button onClick={reset}>Try Again</Button>
                    </div>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-pearl flex items-center justify-center p-4">
            <Card className="max-w-md w-full p-8 text-center space-y-6 shadow-md bg-white">
                <div className="flex justify-center">
                    <div className="p-4 bg-error-light rounded-full">
                        <AlertTriangle className="w-12 h-12 text-error" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-heading font-semibold leading-tight text-gray-800 uppercase tracking-wide">
                        Something Went Wrong
                    </h1>
                    <p className="text-body leading-normal text-gray-600 px-4">
                        We encountered an unexpected error. Our team has been notified.
                    </p>
                    {process.env.NODE_ENV === "development" && (
                        <div className="mt-4 p-4 bg-gray-100 rounded-md text-left overflow-auto max-h-32">
                            <code className="text-label font-medium leading-tight text-error font-mono">
                                {error.message}
                            </code>
                        </div>
                    )}
                </div>

                <div className="pt-4 space-y-2">
                    <Button onClick={reset} className="w-full">
                        Try Again
                    </Button>
                    <Button onClick={handleGoToDashboard} variant="outline" className="w-full">
                        Go to Dashboard
                    </Button>
                </div>
            </Card>
        </div>
    )
}
