"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/Card"
import { List, ListItem } from "../ui/List"
import { Avatar } from "../ui/Avatar"
import { Badge } from "../ui/Badge"
import { Sheet } from "../ui/Sheet"
import { Button } from "../ui/Button"
import { InfoRow } from "../ui/Info-Row"
import { Dropdown, DropdownItem, DropdownDivider } from "../ui/Dropdown"
import { Users, MoreVertical, Eye, Mail, Phone, UserCog, UserMinus } from "lucide-react"

// Types
export type ResidentStatus = "active" | "pending" | "inactive"

export interface Resident {
  id: number
  name: string
  email: string
  phone?: string
  unit: string
  status: ResidentStatus
}

interface ResidentsPanelProps {
  residents: Resident[]
  onAction: (action: string, resident: Resident) => void
}

// Resident Actions Menu
function ResidentActionsMenu({
  resident,
  onAction
}: {
  resident: Resident
  onAction: (action: string) => void
}) {
  return (
    <Dropdown
      trigger={
        <button className="p-1 rounded hover:bg-[#F1F3F5] text-[#8E9AAF] transition-colors">
          <MoreVertical className="w-4 h-4" />
        </button>
      }
      align="right"
    >
      <DropdownItem onClick={() => onAction("view")}>
        <Eye className="w-3 h-3 mr-1.5" />
        Ver Perfil
      </DropdownItem>
      <DropdownItem onClick={() => onAction("message")}>
        <Mail className="w-3 h-3 mr-1.5" />
        Enviar Mensagem
      </DropdownItem>
      {resident.phone && (
        <DropdownItem onClick={() => onAction("call")}>
          <Phone className="w-3 h-3 mr-1.5" />
          Ligar
        </DropdownItem>
      )}
      <DropdownDivider />
      <DropdownItem onClick={() => onAction("manage")}>
        <UserCog className="w-3 h-3 mr-1.5" />
        Gerir Permissões
      </DropdownItem>
      <DropdownItem onClick={() => onAction("remove")} className="text-[#B86B73] hover:bg-[#F9ECEE]">
        <UserMinus className="w-3 h-3 mr-1.5" />
        Remover
      </DropdownItem>
    </Dropdown>
  )
}

const statusConfig: Record<ResidentStatus, { label: string; variant: "success" | "warning" | "default" }> = {
  active: { label: "Ativo", variant: "success" },
  pending: { label: "Pendente", variant: "warning" },
  inactive: { label: "Inativo", variant: "default" },
}

export function ResidentsPanel({ residents, onAction }: ResidentsPanelProps) {
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const activeCount = residents.filter(r => r.status === "active").length

  const handleAction = (action: string, resident: Resident) => {
    if (action === "view") {
      setSelectedResident(resident)
      setSheetOpen(true)
    } else {
      onAction(action, resident)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-8 h-8 rounded-lg bg-[#E8F0EA] flex items-center justify-center">
                <Users className="w-4 h-4 text-[#6A9B72]" />
              </div>
              <div>
                <CardTitle>Residentes</CardTitle>
                <CardDescription>{residents.length} registados</CardDescription>
              </div>
            </div>
            <Badge>{activeCount} ativos</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <List variant="card">
            {residents.map((resident) => (
              <ListItem
                key={resident.id}
                title={resident.name}
                description={resident.unit}
                leading={
                  <Avatar
                    fallback={resident.name.charAt(0)}
                    status={resident.status === "active" ? "online" : "offline"}
                    size="sm"
                  />
                }
                trailing={
                  <div className="flex items-center gap-1">
                    <Badge size="sm" variant={statusConfig[resident.status].variant}>
                      {statusConfig[resident.status].label}
                    </Badge>
                    <ResidentActionsMenu
                      resident={resident}
                      onAction={(action) => handleAction(action, resident)}
                    />
                  </div>
                }
              />
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Resident Detail Sheet */}
      <Sheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Detalhes do Residente"
        description={selectedResident ? `${selectedResident.name} - ${selectedResident.unit}` : ""}
        footer={
          <div className="flex gap-1.5">
            <Button variant="outline" className="flex-1" onClick={() => setSheetOpen(false)}>
              Fechar
            </Button>
            <Button className="flex-1" onClick={() => {
              if (selectedResident) {
                onAction("message", selectedResident)
                setSheetOpen(false)
              }
            }}>
              <Mail className="w-3 h-3 mr-1" />
              Mensagem
            </Button>
          </div>
        }
      >
        {selectedResident && (
          <div className="space-y-2">
            <div className="rounded-lg bg-[#F8F9FA] border border-[#E9ECEF] p-1.5 space-y-1">
              <InfoRow label="Email" value={selectedResident.email} />
              <InfoRow label="Telefone" value={selectedResident.phone || "Não definido"} />
              <InfoRow label="Fração" value={selectedResident.unit} />
              <InfoRow
                label="Estado"
                value={
                  <Badge size="sm" variant={statusConfig[selectedResident.status].variant}>
                    {statusConfig[selectedResident.status].label}
                  </Badge>
                }
              />
            </div>
          </div>
        )}
      </Sheet>
    </>
  )
}
