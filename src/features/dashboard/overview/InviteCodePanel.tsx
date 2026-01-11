import { Key, Lock } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card"
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
        <Card className="h-full border border-gray-300 shadow-[4px_4px_0px_#cbd5e1]">
            <CardHeader>
                <CardTitle>
                    <Key className="w-4 h-4" />
                    {isManager ? 'Código do Condomínio' : 'Acesso Residente'}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="p-6 flex flex-col items-center justify-center bg-info-light/30 h-32">
                    {isManager ? (
                        can.viewInviteCode(sessionUser, buildingInfo) ? (
                            <>
                                <div className="text-3xl font-mono font-bold text-info tracking-widest mb-2 select-all uppercase">
                                    {buildingCode}
                                </div>
                                <div className="text-[10px] uppercase font-bold text-info/70">
                                    Codigo Ativo
                                </div>
                            </>
                        ) : (
                            <div className="text-center">
                                <Lock className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                                <span className="text-[10px] uppercase font-bold text-gray-400">Subscrição necessária</span>
                            </div>
                        )
                    ) : residentApartment ? (
                        <>
                            <div className="text-3xl font-mono font-bold text-gray-800 tracking-tight mb-1">
                                {residentApartment.unit}
                            </div>
                            <div className="text-[10px] uppercase font-bold text-gray-400">Frações Atribuídas</div>
                        </>
                    ) : null}
                </div>
            </CardContent>
            <CardFooter className="justify-center border-t border-gray-300">
                {isManager ? "Partilha o código com os residentes" : "Sessão de residente ativa"}
            </CardFooter>
        </Card>
    )
}
