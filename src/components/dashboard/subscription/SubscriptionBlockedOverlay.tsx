"use client"

import { Button } from "@/components/ui/Button"
import { createBillingPortalSession } from "@/lib/actions/stripe"
import { useTransition } from "react"
import { AlertTriangle, CreditCard, Mail, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"

interface SubscriptionBlockedOverlayProps {
    buildingId: string
}

export function SubscriptionBlockedOverlay({ buildingId }: SubscriptionBlockedOverlayProps) {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const handleUpdatePayment = () => {
        startTransition(async (): Promise<void> => {
            try {
                const result = await createBillingPortalSession(buildingId)
                if (result.success) {
                    window.location.href = result.url
                } else {
                    alert(result.error || "Falha ao abrir portal de pagamento.")
                }
            } catch (error) {
                console.error("Failed to open billing portal:", error)
                alert("Ocorreu um erro inesperado. Por favor tente novamente.")
            }
        })
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm">
                {/* Card Container */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-md overflow-hidden">
                    {/* Error Banner */}
                    <div className="bg-error-light border-b border-error/20 px-4 py-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-error flex-shrink-0" />
                        <span className="text-body font-medium text-error">Acesso Suspenso</span>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-4">
                        <div className="text-center space-y-2">
                            <h1 className="text-subtitle font-semibold text-gray-900">
                                Subscrição Suspensa
                            </h1>
                            <p className="text-body text-gray-600 leading-relaxed">
                                O pagamento da sua subscrição falhou e o período de carência expirou.
                                Atualize o método de pagamento para continuar.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="space-y-2">
                            <Button
                                onClick={handleUpdatePayment}
                                disabled={isPending}
                                size="md"
                                variant="primary"
                                className="w-full gap-2"
                            >
                                <CreditCard className="w-4 h-4" />
                                {isPending ? "A abrir..." : "Atualizar Pagamento"}
                            </Button>

                            <Button
                                onClick={() => router.refresh()}
                                size="md"
                                variant="outline"
                                className="w-full gap-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Verificar Estado
                            </Button>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 border-t border-gray-200 px-4 py-2.5 flex items-center justify-center gap-1.5">
                        <Mail className="w-3 h-3 text-gray-400" />
                        <a
                            href="mailto:suporte@gestmais.pt"
                            className="text-label text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            suporte@gestmais.pt
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
