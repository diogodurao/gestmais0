"use client"

import { useState } from "react"
import { Users } from "lucide-react"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/Card"
import { List, ListItem } from "@/components/ui/List"
import { Avatar } from "@/components/ui/Avatar"
import { Badge } from "@/components/ui/Badge"
import { ResidentActionsMenu } from "./ResidentActionsMenu"
import type { OnboardingApartmentSimple } from "@/lib/types"

type Resident = {
    user: { id: string; name: string; email: string }
    apartment: OnboardingApartmentSimple | null
}

export function ResidentsList({
    residents,
    buildingId,
    unclaimedUnits
}: {
    residents: Resident[]
    buildingId: string
    unclaimedUnits: OnboardingApartmentSimple[]
}) {
    const [searchTerm, setSearchTerm] = useState("")

    const filteredResidents = residents.filter(r =>
        r.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.apartment?.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const activeCount = filteredResidents.filter(r => r.apartment).length

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center">
                            <Users className="w-4 h-4 text-gray-500" />
                        </div>
                        <div>
                            <CardTitle>Residentes</CardTitle>
                            <CardDescription>{residents.length} registados</CardDescription>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge>{activeCount} ativos</Badge>
                        <input
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Procurar..."
                            className="bg-[#F8F9FA] border border-[#E9ECEF] text-[10px] px-2 py-1 rounded focus:outline-none focus:border-[#DEE2E6] w-24"
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <List variant="card" className="max-h-[400px] overflow-y-auto">
                    {filteredResidents.length === 0 && (
                        <div className="p-4 text-center text-[10px] text-[#8E9AAF]">
                            Sem resultados
                        </div>
                    )}

                    {filteredResidents.map((r) => (
                        <ListItem
                            key={r.user.id}
                            title={r.user.name}
                            description={r.apartment?.unit || r.user.email}
                            leading={
                                <Avatar
                                    fallback={r.user.name.charAt(0)}
                                    status={r.apartment ? "online" : "offline"}
                                    size="sm"
                                />
                            }
                            trailing={
                                <div className="flex items-center gap-1">
                                    <Badge size="sm" variant={r.apartment ? "success" : "warning"}>
                                        {r.apartment ? "Ativo" : "Pendente"}
                                    </Badge>
                                    <ResidentActionsMenu
                                        resident={r}
                                        buildingId={buildingId}
                                        unclaimedApartments={unclaimedUnits}
                                    />
                                </div>
                            }
                        />
                    ))}
                </List>
            </CardContent>
        </Card>
    )
}