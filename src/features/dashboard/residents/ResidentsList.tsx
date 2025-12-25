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

export function ResidentsList({ residents, buildingId, unclaimedUnits }: { residents: Resident[]; buildingId: string; unclaimedUnits: Apartment[] }) {
    const [searchTerm, setSearchTerm] = useState("")

    const filteredResidents = residents.filter(r => 
        r.user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        r.apartment?.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <Card className="rounded-none border-slate-200 shadow-none">
            <CardHeader className="py-3 border-b border-slate-100 flex flex-row items-center justify-between">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <Users className="h-3.5 w-3.5" />
                    Resident_Registry
                </CardTitle>
                <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                    <input 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="SEARCH..."
                        className="bg-slate-50 border border-slate-200 text-[9px] pl-7 pr-2 py-1 rounded-none focus:outline-none focus:border-blue-300 w-32 uppercase"
                    />
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="bg-slate-50 border-b border-slate-100 px-4 py-2 flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold font-mono text-slate-900">{residents.length}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Residents_Total</span>
                    </div>
                </div>

                <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                    {filteredResidents.length === 0 && (
                        <div className="p-8 text-center text-slate-400 font-mono text-[10px] uppercase italic">
                            [ No_Resident_Matches ]
                        </div>
                    )}

                    {filteredResidents.map((r) => (
                        <div key={r.user.id} className="p-3 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-8 h-8 shrink-0 bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold rounded-none border border-slate-200 uppercase">
                                    {r.user.name.charAt(0)}
                                </div>
                                <div className="truncate">
                                    <p className="text-[11px] font-bold text-slate-800 uppercase tracking-tight truncate">{r.user.name}</p>
                                    <p className="text-[9px] font-mono text-slate-400 truncate uppercase">{r.user.email}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    {r.apartment ? (
                                        <span className="font-mono text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 border border-blue-100 uppercase">
                                            {r.apartment.unit}
                                        </span>
                                    ) : (
                                        <span className="text-[9px] font-bold text-amber-500 bg-amber-50 px-2 py-0.5 border border-amber-100 uppercase">
                                            Unlinked
                                        </span>
                                    )}
                                </div>
                                <ResidentActionsMenu resident={r} buildingId={buildingId} unclaimedApartments={unclaimedUnits} />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
