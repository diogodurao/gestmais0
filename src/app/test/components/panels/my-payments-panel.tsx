"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/Card"
import { List, ClickableListItem } from "../ui/List"
import { Badge } from "../ui/Badge"
import { Button } from "../ui/Button"
import { Sheet } from "../ui/Sheet"
import { InfoRow } from "../ui/Info-Row"
import { Alert } from "../ui/Alert"
import { cn } from "@/lib/utils"
import { CreditCard, CheckCircle2, Clock, ChevronRight, Download } from "lucide-react"

// Types
export type PaymentStatus = "paid" | "pending" | "late"

export interface Payment {
  id: number
  month: string
  amount: string
  status: PaymentStatus
  dueDate?: string
  paidDate?: string
}

interface MyPaymentsPanelProps {
  payments: Payment[]
  onSendReceipt: (payment: Payment) => void
  onDownloadReceipt: (payment: Payment) => void
  onViewAll?: () => void
}

const statusConfig: Record<PaymentStatus, { label: string; variant: "success" | "warning" | "error" }> = {
  paid: { label: "Pago", variant: "success" },
  pending: { label: "Pendente", variant: "warning" },
  late: { label: "Atrasado", variant: "error" },
}

export function MyPaymentsPanel({
  payments,
  onSendReceipt,
  onDownloadReceipt,
  onViewAll
}: MyPaymentsPanelProps) {
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const pendingPayments = payments.filter(p => p.status === "pending" || p.status === "late")
  const totalPending = pendingPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0)

  const handlePaymentClick = (payment: Payment) => {
    setSelectedPayment(payment)
    setSheetOpen(true)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-8 h-8 rounded-lg bg-[#E8F0EA] flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-[#6A9B72]" />
              </div>
              <div>
                <CardTitle>Os Meus Pagamentos</CardTitle>
                <CardDescription>Histórico de quotas</CardDescription>
              </div>
            </div>
            {totalPending > 0 && (
              <Badge variant="warning">€{totalPending.toFixed(2)} pendente</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <List variant="card">
            {payments.map((payment) => (
              <ClickableListItem
                key={payment.id}
                title={payment.month}
                description={
                  payment.status === "paid"
                    ? `Pago em ${payment.paidDate}`
                    : `Prazo: ${payment.dueDate}`
                }
                leading={
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    payment.status === "paid" ? "bg-[#E8F0EA]" : "bg-[#FFF3E0]"
                  )}>
                    {payment.status === "paid" ? (
                      <CheckCircle2 className="w-4 h-4 text-[#6A9B72]" />
                    ) : (
                      <Clock className="w-4 h-4 text-[#B8963E]" />
                    )}
                  </div>
                }
                trailing={
                  <div className="text-right">
                    <p className="text-[11px] font-mono font-medium text-[#343A40]">
                      €{payment.amount}
                    </p>
                    <Badge size="sm" variant={statusConfig[payment.status].variant}>
                      {statusConfig[payment.status].label}
                    </Badge>
                  </div>
                }
                onClick={() => handlePaymentClick(payment)}
              />
            ))}
          </List>

          {onViewAll && (
            <Button variant="outline" className="w-full mt-1.5" onClick={onViewAll}>
              Ver Histórico Completo <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Payment Detail Sheet */}
      <Sheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Detalhes do Pagamento"
        description={selectedPayment?.month || ""}
        footer={
          selectedPayment?.status === "pending" || selectedPayment?.status === "late" ? (
            <Button className="w-full" onClick={() => {
              if (selectedPayment) {
                onSendReceipt(selectedPayment)
                setSheetOpen(false)
              }
            }}>
              <Download className="w-3 h-3 mr-1" />
              Enviar Comprovativo
            </Button>
          ) : (
            <Button variant="outline" className="w-full" onClick={() => {
              if (selectedPayment) {
                onDownloadReceipt(selectedPayment)
                setSheetOpen(false)
              }
            }}>
              <Download className="w-3 h-3 mr-1" />
              Descarregar Recibo
            </Button>
          )
        }
      >
        {selectedPayment && (
          <div className="space-y-2">
            <div className="rounded-lg bg-[#F8F9FA] border border-[#E9ECEF] p-1.5 space-y-1">
              <InfoRow label="Mês" value={selectedPayment.month} />
              <InfoRow
                label="Valor"
                value={<span className="font-mono font-bold">€{selectedPayment.amount}</span>}
              />
              <InfoRow
                label="Estado"
                value={
                  <Badge size="sm" variant={statusConfig[selectedPayment.status].variant}>
                    {statusConfig[selectedPayment.status].label}
                  </Badge>
                }
              />
              {selectedPayment.status === "paid" ? (
                <InfoRow label="Data de Pagamento" value={selectedPayment.paidDate || "-"} />
              ) : (
                <InfoRow label="Prazo" value={selectedPayment.dueDate || "-"} />
              )}
            </div>

            {(selectedPayment.status === "pending" || selectedPayment.status === "late") && (
              <Alert variant="warning">
                <Clock className="w-3 h-3" />
                Pagamento pendente. Prazo até {selectedPayment.dueDate}.
              </Alert>
            )}
          </div>
        )}
      </Sheet>
    </>
  )
}
