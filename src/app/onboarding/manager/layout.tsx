"use client"

import { usePathname } from "next/navigation"
import { Check, ChevronRight } from "lucide-react"

export default function ManagerOnboardingLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()

    const steps = [
        {
            id: 'personal',
            path: '/onboarding/manager/personal',
            number: 1,
            title: "Identidade Pessoal",
        },
        {
            id: 'building',
            path: '/onboarding/manager/building',
            number: 2,
            title: "Estrutura do Edifício",
        },
        {
            id: 'units',
            path: '/onboarding/manager/units',
            number: 3,
            title: "Registo de Frações",
        }
    ]

    const getCurrentStepIndex = () => {
        if (pathname.includes('/personal')) return 0
        if (pathname.includes('/building')) return 1
        if (pathname.includes('/units')) return 2
        return 0
    }

    const currentIndex = getCurrentStepIndex()

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-2">
                        INICIALIZAÇÃO DO SISTEMA
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 uppercase tracking-wide">
                        Configuração do Condomínio
                    </h1>
                    <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                        Vamos configurar o seu condomínio em 3 passos simples. Pode alterar estas definições mais tarde.
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    {steps.map((step, idx) => {
                        const isComplete = idx < currentIndex
                        const isCurrent = idx === currentIndex

                        return (
                            <div key={step.id} className="flex items-center">
                                <div
                                    className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase transition-colors ${isCurrent
                                        ? "bg-blue-600 text-white"
                                        : isComplete
                                            ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                            : "bg-white text-slate-500 border border-slate-200"
                                        }`}
                                >
                                    {isComplete ? (
                                        <Check className="w-3.5 h-3.5" />
                                    ) : (
                                        <span className={`w-4 h-4 flex items-center justify-center text-[10px] font-bold border rounded-full ${isCurrent ? 'border-white' : 'border-current'}`}>
                                            {step.number}
                                        </span>
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
