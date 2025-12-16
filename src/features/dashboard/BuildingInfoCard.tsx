import { Card, CardHeader, CardContent } from "@/components/ui/Card"

import { Building, MapPin, CreditCard, Hash, Users, Fingerprint } from "lucide-react"

interface BuildingInfoProps {
    building: {
        name: string
        city: string | null
        street: string | null
        number: string | null
        nif: string
        iban: string | null
        totalApartments: number | null
        code: string
    }
    role: 'manager' | 'resident'
}

export function BuildingInfoCard({ building, role }: BuildingInfoProps) {
    return (
        <Card className="h-full max-w-3xl">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Building className="w-5 h-5 text-blue-600" />
                        Building Details
                    </h3>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {/* Building ID Section - Prominent */}
                    {role === 'manager' && (
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                            <div className="flex items-center gap-2 text-blue-700 mb-2">
                                <Fingerprint className="w-5 h-5" />
                                <span className="text-sm font-bold uppercase tracking-wide">Building ID</span>
                            </div>
                            <p className="text-2xl font-bold font-mono text-blue-900 tracking-tight">{building.code}</p>
                            <p className="text-xs text-blue-600 mt-1">Share this code with your residents</p>
                        </div>
                    )}

                    <div>
                        <div className="flex items-start gap-2 text-sm text-gray-500 mt-1">
                            <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                            <span>
                                {building.street} {building.number}, {building.city}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2 text-gray-500 mb-1">
                                <CreditCard className="w-4 h-4" />
                                <span className="text-xs font-medium uppercase">NIF</span>
                            </div>
                            <p className="font-mono text-gray-900">{building.nif}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2 text-gray-500 mb-1">
                                <Users className="w-4 h-4" />
                                <span className="text-xs font-medium uppercase">Units</span>
                            </div>
                            <p className="font-mono text-gray-900">{building.totalApartments || '-'}</p>
                        </div>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                            <Hash className="w-4 h-4" />
                            <span className="text-xs font-medium uppercase">IBAN</span>
                        </div>
                        <p className="font-mono text-gray-900 break-all">{building.iban || 'Not set'}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
