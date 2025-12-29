"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Building2 } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { joinBuilding } from "@/app/actions/onboarding"

export default function JoinStepPage() {
    const router = useRouter()
    const [inviteCode, setInviteCode] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    const handleJoinBuilding = async () => {
        if (!inviteCode.trim()) {
            setError("Campo obrigatório")
            return
        }

        setIsLoading(true)
        setError("")

        try {
            const result = await joinBuilding(inviteCode.toUpperCase())
            if (result.success) {
                // Refresh to update session then push. 
                // Since this is a server action that might update session/cookie, router.refresh is good.
                // But we are changing page, so push is what matters. 
                // However, the next page (Claim) depends on the updated session (buildingId).
                // So we should refresh, then push? Or just push and let the next page re-fetch?
                // Next page is server component, so normal push will cause a fetch? 
                // Actually router.push triggers a client transition. If the next page is dynamic server component, it works.
                // But better to be safe:
                router.refresh()
                router.push("/onboarding/resident/claim")
            } else {
                setError(result.error || "Ocorreu um erro inesperado")
            }
        } catch (err) {
            setError("Ocorreu um erro inesperado")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h2 className="text-sm font-bold text-slate-700 uppercase mb-2">
                    Insira o Código de Convite
                </h2>
            </div>

            <div>
                <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    placeholder="XXXXXX"
                    className="w-full text-center text-2xl font-mono font-bold tracking-[0.5em] px-4 py-4 border-2 border-slate-200 focus:outline-none focus:border-blue-400 uppercase"
                    maxLength={6}
                />
            </div>

            {error && (
                <p className="text-center text-xs text-rose-600 font-bold">{error}</p>
            )}

            <Button
                fullWidth
                onClick={handleJoinBuilding}
                disabled={isLoading || !inviteCode.trim()}
            >
                {isLoading ? "A CARREGAR..." : "LIGAR AO EDIFÍCIO"}
            </Button>
        </div>
    )
}
