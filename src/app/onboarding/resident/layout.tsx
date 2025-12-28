"use client"

import { usePathname } from "next/navigation"
import { Check, ChevronRight, Building2, Home, CreditCard } from "lucide-react"

export default function ResidentOnboardingLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()

    const steps = [
        {
            id: 'join',
            path: '/onboarding/resident/join',
            number: 1,
            title: "Entrada no Sistema",
            icon: Building2
        },
        {
            id: 'claim',
            path: '/onboarding/resident/claim',
            number: 2,
            title: "Alocação de Fração",
            icon: Home
        },
        {
            id: 'financial',
            path: '/onboarding/resident/financial',
            number: 3,
            title: "Configuração Financeira",
            icon: CreditCard
        }
    ]

    const getCurrentStepIndex = () => {
        if (pathname.includes('/join')) return 0
        if (pathname.includes('/claim')) return 1
        if (pathname.includes('/financial')) return 2
        return 0
    }

    const currentIndex = getCurrentStepIndex()

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-2">
                        NOVO PORTAL DE RESIDENTE
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 uppercase tracking-wide">
                        Bem-vindo a Bordo
                    </h1>
                    <p className="text-sm text-slate-500 mt-2">
                        Vamos ligá-lo ao seu condomínio em segundos.
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    {steps.map((step, idx) => {
                        const isComplete = idx < currentIndex
                        const isCurrent = idx === currentIndex
                        const Icon = step.icon

                        return (
                            <div key={step.id} className="flex items-center">
                                <div
                                    className={`flex items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase transition-colors ${isCurrent
                                        ? "bg-blue-600 text-white"
                                        : isComplete
                                            ? "bg-emerald-100 text-emerald-700"
                                            : "bg-slate-100 text-slate-400"
                                        }`}
                                >
                                    {isComplete ? (
                                        <Check className="w-3.5 h-3.5" />
                                    ) : (
                                        <Icon className="w-3.5 h-3.5" />
                                    )}
                                    <span className="hidden sm:inline">{step.title}</span>
                                </div>
                                {idx < steps.length - 1 && (
                                    <ChevronRight className="w-4 h-4 text-slate-300 mx-1" />
                                )}
                            </div>
                        )
                    })}
                </div>

                <div className="bg-white tech-border p-6 shadow-sm">
                    {children}
                </div>
            </div>
        </div>
    )
}
