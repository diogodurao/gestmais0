"use client"

import { useState } from "react"
import { Button } from "../components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { List, ListItem, ClickableListItem, ListHeader } from "../components/ui/list"
import { Avatar } from "../components/ui/avatar"
import { StatusIndicator } from "../components/ui/status-indicator"
import { InfoRow } from "../components/ui/info-row"
import { Dropdown, DropdownItem, DropdownDivider } from "../components/ui/dropdown"
import { Sheet } from "../components/ui/sheet"
import { ToastProvider, useToast } from "../components/ui/toast"
import { cn } from "@/lib/utils"
import {
  Building2, Users, Copy, RefreshCw, CheckCircle2, AlertCircle,
  Clock, MoreVertical, Mail, Phone, UserMinus, UserCog, Eye,
  MessageSquare, FileText, Bell, CreditCard, Settings,
} from "lucide-react"

// =============================================================================
// 1. SYSTEM STATUS PANEL - Built with Card + List + StatusIndicator + Badge
// =============================================================================
interface SystemStatus {
  payments: "ok" | "warning" | "error"
  documents: "ok" | "warning" | "error"
  notifications: "ok" | "warning" | "error"
  subscription: "active" | "expiring" | "expired"
}

function SystemStatusPanel({ status }: { status: SystemStatus }) {
  const statusConfig = {
    ok: { label: "Operacional", variant: "success" as const },
    warning: { label: "Atenção", variant: "warning" as const },
    error: { label: "Erro", variant: "error" as const },
  }

  const subscriptionConfig = {
    active: { label: "Ativa", variant: "success" as const },
    expiring: { label: "Expira em breve", variant: "warning" as const },
    expired: { label: "Expirada", variant: "error" as const },
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-1.5">
          <div className="w-8 h-8 rounded-lg bg-[#E8F0EA] flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-[#6A9B72]" />
          </div>
          <div>
            <CardTitle>Estado do Sistema</CardTitle>
            <CardDescription>Monitorização de serviços</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <List variant="divided">
          <ListItem
            title="Pagamentos"
            description="Processamento de quotas"
            leading={<CreditCard className="w-4 h-4 text-[#8E9AAF]" />}
            trailing={
              <StatusIndicator
                status={status.payments}
                label={statusConfig[status.payments].label}
                showDot
              />
            }
          />
          <ListItem
            title="Documentos"
            description="Armazenamento e partilha"
            leading={<FileText className="w-4 h-4 text-[#8E9AAF]" />}
            trailing={
              <StatusIndicator
                status={status.documents}
                label={statusConfig[status.documents].label}
                showDot
              />
            }
          />
          <ListItem
            title="Notificações"
            description="Envio de alertas"
            leading={<Bell className="w-4 h-4 text-[#8E9AAF]" />}
            trailing={
              <StatusIndicator
                status={status.notifications}
                label={statusConfig[status.notifications].label}
                showDot
              />
            }
          />
        </List>

        {/* Subscription Status - using InfoRow */}
        <div className="mt-2 p-1.5 rounded-lg bg-[#F8F9FA] border border-[#E9ECEF]">
          <InfoRow
            label="Subscrição"
            value={
              <Badge variant={subscriptionConfig[status.subscription].variant}>
                {subscriptionConfig[status.subscription].label}
              </Badge>
            }
          />
        </div>
      </CardContent>
    </Card>
  )
}

// =============================================================================
// 2. INVITE CODE PANEL - Built with Card + Button + Badge
// =============================================================================
interface InviteCodePanelProps {
  code: string
  buildingName: string
  expiresAt?: string
  usageCount: number
  maxUsage?: number
  onCopy: () => void
  onRefresh: () => void
}

function InviteCodePanel({
  code,
  buildingName,
  expiresAt,
  usageCount,
  maxUsage,
  onCopy,
  onRefresh,
}: InviteCodePanelProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-1.5">
          <div className="w-8 h-8 rounded-lg bg-[#E8F0EA] flex items-center justify-center">
            <Building2 className="w-4 h-4 text-[#6A9B72]" />
          </div>
          <div className="flex-1">
            <CardTitle>Código de Convite</CardTitle>
            <CardDescription>{buildingName}</CardDescription>
          </div>
          <Badge variant="success">{usageCount}{maxUsage ? `/${maxUsage}` : ""} usos</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Code Display - reusing design system colors */}
        <div className="rounded-lg bg-[#F8F9FA] border-2 border-dashed border-[#E9ECEF] p-2 text-center">
          <p className="text-[9px] font-medium text-[#8E9AAF] uppercase tracking-wide mb-1">
            Partilhe este código
          </p>
          <p className="text-[20px] font-bold font-mono text-[#343A40] tracking-[0.3em]">
            {code}
          </p>
          {expiresAt && (
            <p className="text-[9px] text-[#ADB5BD] mt-1 flex items-center justify-center gap-1">
              <Clock className="w-3 h-3" />
              Expira em {expiresAt}
            </p>
          )}
        </div>

        {/* Actions - using Button component */}
        <div className="flex gap-1.5 mt-2">
          <Button variant="outline" className="flex-1" onClick={onCopy}>
            <Copy className="w-3 h-3 mr-1" />
            Copiar
          </Button>
          <Button variant="outline" onClick={onRefresh}>
            <RefreshCw className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// =============================================================================
// 3. RESIDENT ACTIONS MENU - Built with Dropdown + DropdownItem
// =============================================================================
interface Resident {
  id: number
  name: string
  email: string
  phone?: string
  unit: string
  status: "active" | "pending" | "inactive"
}

function ResidentActionsMenu({
  resident,
  onView,
  onMessage,
  onCall,
  onManage,
  onRemove,
}: {
  resident: Resident
  onView: () => void
  onMessage: () => void
  onCall?: () => void
  onManage: () => void
  onRemove: () => void
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
      <DropdownItem onClick={onView}>
        <Eye className="w-3 h-3 mr-1.5" />
        Ver Perfil
      </DropdownItem>
      <DropdownItem onClick={onMessage}>
        <Mail className="w-3 h-3 mr-1.5" />
        Enviar Mensagem
      </DropdownItem>
      {resident.phone && (
        <DropdownItem onClick={onCall}>
          <Phone className="w-3 h-3 mr-1.5" />
          Ligar
        </DropdownItem>
      )}
      <DropdownDivider />
      <DropdownItem onClick={onManage}>
        <UserCog className="w-3 h-3 mr-1.5" />
        Gerir Permissões
      </DropdownItem>
      <DropdownItem onClick={onRemove} className="text-[#B86B73] hover:bg-[#F9ECEE]">
        <UserMinus className="w-3 h-3 mr-1.5" />
        Remover do Edifício
      </DropdownItem>
    </Dropdown>
  )
}

// =============================================================================
// 4. RESIDENT LIST WITH ACTIONS - Combining List + Avatar + Actions
// =============================================================================
function ResidentListPanel({ residents }: { residents: Resident[] }) {
  const { addToast } = useToast()

  const handleAction = (action: string, resident: Resident) => {
    addToast({
      variant: "info",
      title: action,
      description: `${resident.name} (${resident.unit})`,
    })
  }

  return (
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
          <Badge>{residents.filter(r => r.status === "active").length} ativos</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <List variant="card">
          <ListHeader title="Lista de Residentes" />
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
                  <Badge
                    size="sm"
                    variant={
                      resident.status === "active" ? "success" :
                      resident.status === "pending" ? "warning" : "default"
                    }
                  >
                    {resident.status === "active" ? "Ativo" :
                     resident.status === "pending" ? "Pendente" : "Inativo"}
                  </Badge>
                  <ResidentActionsMenu
                    resident={resident}
                    onView={() => handleAction("Ver perfil", resident)}
                    onMessage={() => handleAction("Enviar mensagem", resident)}
                    onCall={() => handleAction("Ligar", resident)}
                    onManage={() => handleAction("Gerir permissões", resident)}
                    onRemove={() => handleAction("Remover", resident)}
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

// =============================================================================
// 5. MESSAGE SHEET - Using Sheet + List for message detail
// =============================================================================
interface Message {
  id: number
  from: string
  subject: string
  content: string
  timestamp: string
  isRead: boolean
}

function MessageSheet({
  open,
  onClose,
  message,
}: {
  open: boolean
  onClose: () => void
  message: Message | null
}) {
  if (!message) return null

  return (
    <Sheet
      open={open}
      onClose={onClose}
      side="right"
      title={message.subject}
      description={`De: ${message.from}`}
      footer={
        <div className="flex gap-1.5">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Fechar
          </Button>
          <Button className="flex-1">
            <Mail className="w-3 h-3 mr-1" />
            Responder
          </Button>
        </div>
      }
    >
      <div className="space-y-2">
        {/* Message metadata using InfoRow */}
        <div className="rounded-lg bg-[#F8F9FA] border border-[#E9ECEF] p-1.5 space-y-1">
          <InfoRow label="De" value={message.from} />
          <InfoRow label="Data" value={message.timestamp} />
          <InfoRow
            label="Estado"
            value={
              <Badge size="sm" variant={message.isRead ? "default" : "info"}>
                {message.isRead ? "Lida" : "Não lida"}
              </Badge>
            }
          />
        </div>

        {/* Message content */}
        <div className="p-1.5">
          <p className="text-[10px] font-medium text-[#8E9AAF] uppercase tracking-wide mb-1">
            Mensagem
          </p>
          <p className="text-[11px] text-[#495057] leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        </div>
      </div>
    </Sheet>
  )
}

// =============================================================================
// DEMO PAGE - Shows all panels together
// =============================================================================
function PanelsDemoContent() {
  const { addToast } = useToast()
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  // Mock data
  const systemStatus: SystemStatus = {
    payments: "ok",
    documents: "ok",
    notifications: "warning",
    subscription: "active",
  }

  const residents: Resident[] = [
    { id: 1, name: "Maria Silva", email: "maria@email.com", phone: "+351 912 345 678", unit: "1º Esq", status: "active" },
    { id: 2, name: "João Santos", email: "joao@email.com", unit: "1º Dir", status: "active" },
    { id: 3, name: "Ana Costa", email: "ana@email.com", phone: "+351 923 456 789", unit: "2º Esq", status: "pending" },
    { id: 4, name: "Pedro Lima", email: "pedro@email.com", unit: "2º Dir", status: "inactive" },
  ]

  const messages: Message[] = [
    {
      id: 1,
      from: "Maria Silva",
      subject: "Questão sobre quota de Janeiro",
      content: "Olá,\n\nGostaria de saber se o pagamento da quota de Janeiro foi registado corretamente.\n\nObrigada,\nMaria",
      timestamp: "Hoje, 14:30",
      isRead: false,
    },
    {
      id: 2,
      from: "João Santos",
      subject: "Problema com fechadura",
      content: "A fechadura da porta principal está a dar problemas. Seria possível verificar?",
      timestamp: "Ontem, 09:15",
      isRead: true,
    },
  ]

  const handleCopyCode = () => {
    navigator.clipboard.writeText("ABC123")
    addToast({ variant: "success", title: "Código copiado!" })
  }

  const handleRefreshCode = () => {
    addToast({ variant: "info", title: "Código atualizado", description: "Novo código gerado com sucesso" })
  }

  const openMessage = (message: Message) => {
    setSelectedMessage(message)
    setSheetOpen(true)
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-4 px-1.5">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-3">
          <p className="text-[9px] font-medium text-[#8E9AAF] uppercase tracking-widest mb-0.5">
            Demonstração
          </p>
          <h1 className="text-[16px] font-bold text-[#343A40] uppercase tracking-wide">
            Painéis Compostos
          </h1>
          <p className="text-[10px] text-[#8E9AAF] mt-0.5">
            Componentes construídos com a reutilização dos componentes UI base
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          {/* System Status Panel */}
          <SystemStatusPanel status={systemStatus} />

          {/* Invite Code Panel */}
          <InviteCodePanel
            code="ABC123"
            buildingName="Edifício Flores"
            expiresAt="7 dias"
            usageCount={3}
            maxUsage={10}
            onCopy={handleCopyCode}
            onRefresh={handleRefreshCode}
          />

          {/* Resident List Panel (full width) */}
          <div className="lg:col-span-2">
            <ResidentListPanel residents={residents} />
          </div>

          {/* Messages List - clicking opens Sheet */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-1.5">
                  <div className="w-8 h-8 rounded-lg bg-[#E8F0EA] flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-[#6A9B72]" />
                  </div>
                  <div>
                    <CardTitle>Mensagens</CardTitle>
                    <CardDescription>Clique para abrir no painel lateral (Sheet)</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <List variant="card">
                  {messages.map((msg) => (
                    <ClickableListItem
                      key={msg.id}
                      title={msg.subject}
                      description={`${msg.from} • ${msg.timestamp}`}
                      leading={
                        <Avatar fallback={msg.from.charAt(0)} size="sm" />
                      }
                      trailing={
                        !msg.isRead && (
                          <div className="w-2 h-2 rounded-full bg-[#8FB996]" />
                        )
                      }
                      onClick={() => openMessage(msg)}
                    />
                  ))}
                </List>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Message Sheet (slides in from right) */}
        <MessageSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          message={selectedMessage}
        />
      </div>
    </div>
  )
}

export default function PanelsDemoPage() {
  return (
    <ToastProvider>
      <PanelsDemoContent />
    </ToastProvider>
  )
}
