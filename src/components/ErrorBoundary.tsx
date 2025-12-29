'use client'
import { Component, ReactNode } from 'react'

interface Props {
    children: ReactNode
    fallback: ReactNode
}

export class ErrorBoundary extends Component<Props, { hasError: boolean }> {
    state = { hasError: false }

    static getDerivedStateFromError() {
        return { hasError: true }
    }

    render() {
        if (this.state.hasError) return this.props.fallback
        return this.props.children
    }
}
