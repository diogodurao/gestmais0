import { CardHeader, CardTitle, CardFooter } from "@/components/ui/Card"
import { Key, Lock } from "lucide-react"
import { DashboardCard } from "./components/DashboardCard"
import { can } from "@/lib/permissions"
import type { SessionUser } from "@/lib/types"

interface InviteCodePanelProps {
    isManager: boolean
    sessionUser: SessionUser
    buildingInfo: any // Using specific type would be better if available
    buildingCode: string
    residentApartment: any
}

export function InviteCodePanel({
    isManager,
    sessionUser,
    buildingInfo,
    buildingCode,
    residentApartment
}: InviteCodePanelProps) {

    // Helper to get apartment display name safely
    const getApartmentDisplayName = (apt: any) => {
        if (!apt) return ""
        return `${apt.unit}` // Simplified, or match logic from utils
    }

    return (
        <DashboardCard>
            <CardHeader>
                <CardTitle>
                    <Key className="w-3.5 h-3.5 text-slate-400" />
                    {isManager ? 'Código do Condomínio' : 'Acesso Residente'}
                </CardTitle>
            </CardHeader>
            <div className="p-6 flex flex-col items-center justify-center bg-blue-50/30 h-32">
                {isManager ? (
                    can.viewInviteCode(sessionUser, buildingInfo) ? (
                        <>
                            <div className="text-3xl font-mono font-bold text-blue-700 tracking-widest mb-2 select-all uppercase">
                                {buildingCode}
                            </div>
                            <div className="text-[10px] uppercase font-bold text-blue-600/70">
                                Codigo Ativo
                            </div>
                        </>
                    ) : (
                        <div className="text-center">
                            <Lock className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                            <span className="text-[10px] uppercase font-bold text-slate-400">Subscrição necessária</span>
                        </div>
                    )
                ) : residentApartment ? (
                    <>
                        <div className="text-3xl font-mono font-bold text-slate-800 tracking-tight mb-1">
                            {residentApartment.unit} {/* Using safe accessor */}
                        </div>
                        <div className="text-[10px] uppercase font-bold text-slate-400">Frações Atribuídas</div>
                    </>
                ) : null}
            </div>
            <CardFooter className="text-center">
                {isManager
                    ? "Partilha o código com os residentes"
                    : "Sessão de residente ativa"}
            </CardFooter>
        </DashboardCard>
    )
}
