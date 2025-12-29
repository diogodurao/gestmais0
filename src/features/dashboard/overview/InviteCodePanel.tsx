import { Key, Lock } from "lucide-react"
import { Panel } from "@/components/ui/Panel"
import { can } from "@/lib/permissions"
import type { SessionUser } from "@/lib/types"

interface InviteCodePanelProps {
    isManager: boolean
    sessionUser: SessionUser
    buildingInfo: any
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
    return (
        <Panel
            title={isManager ? 'Código do Condomínio' : 'Acesso Residente'}
            icon={Key}
            className="h-full border border-slate-300 shadow-[4px_4px_0px_#cbd5e1]"
            contentClassName="p-0"
            footer={isManager ? "Partilha o código com os residentes" : "Sessão de residente ativa"}
        >
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
                            {residentApartment.unit}
                        </div>
                        <div className="text-[10px] uppercase font-bold text-slate-400">Frações Atribuídas</div>
                    </>
                ) : null}
            </div>
        </Panel>
    )
}
