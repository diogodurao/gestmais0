'use client'

import { Component, ReactNode } from 'react'
import { Card } from './ui/Card'
import { AlertCircle } from 'lucide-react'
import { Button } from './ui/Button'

interface Props {
    children: ReactNode
    fallback?: ReactNode
}

function ErrorFallback() {
    return (
        <Card className="flex flex-col items-center justify-center p-6 text-center border-error bg-error-light">
            <AlertCircle className="w-8 h-8 mb-4 text-error" />
            <h3 className="mb-1 text-heading font-semibold leading-tight text-gray-900">Algo correu mal</h3>
            <p className="mb-4 text-body leading-normal text-gray-700">Ocorreu um erro ao carregar esta funcionalidade.</p>
            <Button
                variant="outline"
                className="bg-white border-error hover:bg-error-light text-error"
                onClick={() => window.location.reload()}
            >
                Tentar novamente
            </Button>
        </Card>
    )
}

export class ErrorBoundary extends Component<Props, { hasError: boolean }> {
    state = { hasError: false }

    static getDerivedStateFromError() {
        return { hasError: true }
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback ?? <ErrorFallback />
        }
        return this.props.children
    }
}
