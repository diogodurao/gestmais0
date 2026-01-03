'use client'

import { ErrorBoundary } from './ErrorBoundary'
import { Card } from './ui/Card'
import { AlertCircle } from 'lucide-react'
import { Button } from './ui/Button'

interface Props {
    children: React.ReactNode
}

export function FeatureErrorBoundary({ children }: Props) {
    return (
        <ErrorBoundary
            fallback={
                <Card className="flex flex-col items-center justify-center p-6 text-center border-red-200 bg-red-50">
                    <AlertCircle className="w-10 h-10 mb-4 text-red-500" />
                    <h3 className="mb-1 text-lg font-semibold text-red-900">Something went wrong</h3>
                    <p className="mb-4 text-sm text-red-700">There was an error loading this feature.</p>
                    <Button
                        variant="outline"
                        className="bg-white border-red-200 hover:bg-red-50 text-red-700"
                        onClick={() => window.location.reload()}
                    >
                        Try Again
                    </Button>
                </Card>
            }
        >
            {children}
        </ErrorBoundary>
    )
}
