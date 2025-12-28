import { PaymentData } from "@/app/actions/payments"

interface PaymentMobileCardsProps {
    data: PaymentData[]
    onPaymentClick?: (payment: { month: number, status: string }, apartmentId: number) => void
    isEditing: boolean
}

export function PaymentMobileCards({ data, onPaymentClick, isEditing }: PaymentMobileCardsProps) {
    const monthsShort = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"]

    const getStatusColor = (status: string | undefined) => {
        switch (status) {
            case "paid":
                return "bg-emerald-500"
            case "pending":
                return "bg-amber-500"
            case "late":
            case "overdue":
                return "bg-rose-500"
            default:
                return "bg-slate-300"
        }
    }

    return (
        <div className="divide-y divide-slate-100">
            {data.map((item) => (
                <div key={item.apartmentId} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h3 className="text-sm font-bold text-slate-700 uppercase font-mono">
                                {item.unit}
                            </h3>
                            {item.residentName ? (
                                <p className="text-[10px] text-slate-500">{item.residentName}</p>
                            ) : (
                                <p className="text-[10px] text-slate-400 italic">
                                    Sem residente
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
                            const payment = item.payments[month]
                            const status = payment?.status || 'pending'

                            return (
                                <button
                                    key={month}
                                    onClick={() => isEditing && onPaymentClick?.({ month, status }, item.apartmentId)}
                                    disabled={!isEditing}
                                    className={`
                                        px-2 py-1 text-[9px] font-bold uppercase
                                        ${getStatusColor(status)} text-white
                                        ${isEditing ? "cursor-pointer hover:opacity-80" : "cursor-default"}
                                    `}
                                >
                                    {monthsShort[month - 1]}
                                </button>
                            )
                        })}
                    </div>
                </div>
            ))}
        </div>
    )
}