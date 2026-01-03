'use client'

import { useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { AlertCircle } from 'lucide-react'

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="flex items-center justify-center h-full p-6">
            <Card className="flex flex-col items-center max-w-md p-6 text-center border-red-200 bg-red-50">
                <AlertCircle className="w-12 h-12 mb-4 text-red-500" />
                <h2 className="mb-2 text-xl font-semibold text-red-900">Application Error</h2>
                <p className="mb-6 text-sm text-red-700">
                    Something went wrong in the dashboard application.
                </p>
                <div className="flex gap-4">
                    <Button
                        variant="outline"
                        className="bg-white border-red-200 text-red-700 hover:bg-red-50"
                        onClick={() => window.location.reload()}
                    >
                        Reload Page
                    </Button>
                    <Button onClick={() => reset()}>Try Again</Button>
                </div>
            </Card>
        </div>
    )
}
