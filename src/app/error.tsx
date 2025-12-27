"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { AlertTriangle } from "lucide-react"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error)
    }, [error])

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full p-8 text-center space-y-6 shadow-xl border-red-100 bg-white">
                <div className="flex justify-center">
                    <div className="p-4 bg-red-50 rounded-full">
                        <AlertTriangle className="w-12 h-12 text-red-500" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-lg font-bold text-slate-900 uppercase tracking-wide">Something Went Wrong</h1>
                    <p className="text-sm text-slate-500 px-4">
                        We encountered an unexpected error. Our team has been notified.
                    </p>
                    {process.env.NODE_ENV === 'development' && (
                        <div className="mt-4 p-4 bg-slate-100 rounded text-left overflow-auto max-h-32">
                            <code className="text-[10px] text-red-600 font-mono">
                                {error.message}
                            </code>
                        </div>
                    )}
                </div>

                <div className="pt-4 space-y-2">
                    <Button onClick={() => reset()} fullWidth>
                        Try Again
                    </Button>
                    <Button
                        onClick={() => window.location.href = '/dashboard'}
                        variant="outline"
                        fullWidth
                    >
                        Go to Dashboard
                    </Button>
                </div>
            </Card>
        </div>
    )
}
