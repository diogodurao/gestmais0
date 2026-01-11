"use client"

import { useState } from "react"
import { Users, Search } from "lucide-react"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"
import { ResidentActionsMenu } from "./ResidentActionsMenu"

type Resident = {
    user: { id: string; name: string; email: string }
    apartment: { id: number; unit: string } | null
}

type Apartment = { id: number; unit: string }

export function ResidentsList({
    residents,
    buildingId,
    unclaimedUnits
}: {
    residents: Resident[]
    buildingId: string
    unclaimedUnits: Apartment[]
}) {
    const [searchTerm, setSearchTerm] = useState("")

    const filteredResidents = residents.filter(r =>
        r.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.apartment?.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <Card className="rounded-none border-gray-200 shadow-none">
            <CardHeader className="py-3 border-b border-gray-100 flex flex-row items-center justify-between">
                <CardTitle className="text-label font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                    <Users className="h-3.5 w-3.5" />
                    Registo de Residentes
                </CardTitle>
                <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                    <input
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="PROCURAR..."
                        className="bg-gray-50 border border-gray-200 text-micro pl-7 pr-2 py-1 rounded-none focus:outline-none focus:border-gray-300 w-32 uppercase"
                    />
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="bg-gray-50 border-b border-gray-100 px-4 py-2 flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold font-mono text-gray-900">{residents.length}</span>
                        <span className="text-micro font-bold text-gray-400 uppercase tracking-widest">
                            TOTAL
                        </span>
                    </div>
                </div>

                <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                    {filteredResidents.length === 0 && (
                        <div className="p-8 text-center text-gray-400 font-mono text-label uppercase italic">
                            [ SEM RESULTADOS ]
                        </div>
                    )}

                    {filteredResidents.map((r) => (
                        <div key={r.user.id} className="p-3 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-8 h-8 shrink-0 bg-gray-100 text-gray-600 flex items-center justify-center text-body font-bold rounded-none border border-gray-200 uppercase">
                                    {r.user.name.charAt(0)}
                                </div>
                                <div className="truncate">
                                    <p className="text-body font-bold text-gray-800 uppercase tracking-tight truncate">
                                        {r.user.name}
                                    </p>
                                    <p className="text-micro font-mono text-gray-400 truncate uppercase">
                                        {r.user.email}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    {r.apartment ? (
                                        <span className="font-mono text-label font-bold text-info bg-info-light px-2 py-0.5 border border-gray-200 uppercase">
                                            {r.apartment.unit}
                                        </span>
                                    ) : (
                                        <span className="text-micro font-bold text-warning bg-warning-light px-2 py-0.5 border border-gray-200 uppercase">
                                            NÃO ASSOCIADO
                                        </span>
                                    )}
                                </div>
                                <ResidentActionsMenu
                                    resident={r}
                                    buildingId={buildingId}
                                    unclaimedApartments={unclaimedUnits}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}