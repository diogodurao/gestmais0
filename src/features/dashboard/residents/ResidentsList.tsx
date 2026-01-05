"use client"

import { useState, useMemo, memo } from "react"
import { useDebouncedCallback } from "use-debounce"
import { Users, Search } from "lucide-react"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"
import { ResidentActionsMenu } from "./ResidentActionsMenu"

type Resident = {
    user: { id: string; name: string; email: string }
    apartment: { id: number; unit: string } | null
}

type Apartment = { id: number; unit: string }

// Memoized resident row component to prevent unnecessary re-renders
const ResidentRow = memo(function ResidentRow({
    resident,
    buildingId,
    unclaimedApartments
}: {
    resident: Resident
    buildingId: string
    unclaimedApartments: Apartment[]
}) {
    return (
        <div className="p-3 hover:bg-slate-50 transition-colors flex items-center justify-between group">
            <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 shrink-0 bg-slate-100 text-slate-600 flex items-center justify-center text-body font-bold rounded-none border border-slate-200 uppercase">
                    {resident.user.name.charAt(0)}
                </div>
                <div className="truncate">
                    <p className="text-body font-bold text-slate-800 uppercase tracking-tight truncate">
                        {resident.user.name}
                    </p>
                    <p className="text-micro font-mono text-slate-400 truncate uppercase">
                        {resident.user.email}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="text-right">
                    {resident.apartment ? (
                        <span className="font-mono text-label font-bold text-blue-600 bg-blue-50 px-2 py-0.5 border border-blue-100 uppercase">
                            {resident.apartment.unit}
                        </span>
                    ) : (
                        <span className="text-micro font-bold text-amber-500 bg-amber-50 px-2 py-0.5 border border-amber-100 uppercase">
                            NÃO ASSOCIADO
                        </span>
                    )}
                </div>
                <ResidentActionsMenu
                    resident={resident}
                    buildingId={buildingId}
                    unclaimedApartments={unclaimedApartments}
                />
            </div>
        </div>
    )
})

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
    const [debouncedSearch, setDebouncedSearch] = useState("")

    // Debounce search to avoid filtering on every keystroke
    const handleSearchChange = useDebouncedCallback((value: string) => {
        setDebouncedSearch(value)
    }, 200)

    // Memoize filtered residents to avoid recalculating on every render
    const filteredResidents = useMemo(() => {
        const term = debouncedSearch.toLowerCase()
        if (!term) return residents
        return residents.filter(r =>
            r.user.name.toLowerCase().includes(term) ||
            r.apartment?.unit.toLowerCase().includes(term) ||
            r.user.email.toLowerCase().includes(term)
        )
    }, [residents, debouncedSearch])

    return (
        <Card className="rounded-none border-slate-200 shadow-none">
            <CardHeader className="py-3 border-b border-slate-100 flex flex-row items-center justify-between">
                <CardTitle className="text-label font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <Users className="h-3.5 w-3.5" />
                    Registo de Residentes
                </CardTitle>
                <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                    <input
                        value={searchTerm}
                        onChange={e => {
                            setSearchTerm(e.target.value)
                            handleSearchChange(e.target.value)
                        }}
                        placeholder="PROCURAR..."
                        className="bg-slate-50 border border-slate-200 text-micro pl-7 pr-2 py-1 rounded-none focus:outline-none focus:border-blue-300 w-32 uppercase"
                    />
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="bg-slate-50 border-b border-slate-100 px-4 py-2 flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold font-mono text-slate-900">{residents.length}</span>
                        <span className="text-micro font-bold text-slate-400 uppercase tracking-widest">
                            TOTAL
                        </span>
                    </div>
                </div>

                <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                    {filteredResidents.length === 0 && (
                        <div className="p-8 text-center text-slate-400 font-mono text-label uppercase italic">
                            [ SEM RESULTADOS ]
                        </div>
                    )}

                    {filteredResidents.map((r) => (
                        <ResidentRow
                            key={r.user.id}
                            resident={r}
                            buildingId={buildingId}
                            unclaimedApartments={unclaimedUnits}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}