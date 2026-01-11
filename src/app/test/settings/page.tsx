"use client"

import { useState } from "react"
import { Button } from "../components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Avatar } from "../components/ui/avatar"
import { IconButton } from "../components/ui/icon-button"
import { Input } from "../components/ui/input"
import { FormField } from "../components/ui/form-field"
import { Textarea } from "../components/ui/textarea"
import { Select } from "../components/ui/select"
import { Divider } from "../components/ui/divider"
import { Modal } from "../components/ui/modal"
import { ToastProvider, useToast } from "../components/ui/toast"
import { cn } from "@/lib/utils"
import {
  User, Building, CreditCard, Bell, Shield, Key,
  Mail, Phone, MapPin, Save, Edit, Plus, Trash2,
  CheckCircle, AlertTriangle, Settings as SettingsIcon,
  ChevronRight, ExternalLink, Crown, Calendar,
} from "lucide-react"

// Types
interface UserProfile {
  name: string
  email: string
  phone: string
  avatar?: string
}

interface BuildingSettings {
  name: string
  address: string
  postalCode: string
  city: string
  nif: string
  monthlyQuota: number
  paymentDay: number
}

interface Apartment {
  id: number
  unit: string
  floor: number
  typology: string
  permillage: number
  residentName: string | null
  residentEmail: string | null
  status: "occupied" | "vacant" | "owner"
}

interface Subscription {
  plan: "free" | "premium"
  status: "active" | "cancelled" | "expired"
  nextBillingDate?: string
  price?: number
}

// Mock data
const mockProfile: UserProfile = {
  name: "João Silva",
  email: "joao.silva@email.com",
  phone: "+351 912 345 678",
}

const mockBuilding: BuildingSettings = {
  name: "Edifício Exemplo",
  address: "Rua Principal, 123",
  postalCode: "1000-001",
  city: "Lisboa",
  nif: "501234567",
  monthlyQuota: 8500,
  paymentDay: 8,
}

const mockApartments: Apartment[] = [
  { id: 1, unit: "1A", floor: 1, typology: "T2", permillage: 166.67, residentName: "Maria Silva", residentEmail: "maria@email.com", status: "occupied" },
  { id: 2, unit: "1B", floor: 1, typology: "T2", permillage: 166.67, residentName: "João Santos", residentEmail: "joao@email.com", status: "occupied" },
  { id: 3, unit: "2A", floor: 2, typology: "T3", permillage: 166.67, residentName: "Ana Costa", residentEmail: "ana@email.com", status: "occupied" },
  { id: 4, unit: "2B", floor: 2, typology: "T3", permillage: 166.67, residentName: "Pedro Lima", residentEmail: "pedro@email.com", status: "occupied" },
  { id: 5, unit: "3A", floor: 3, typology: "T2", permillage: 166.66, residentName: null, residentEmail: null, status: "vacant" },
  { id: 6, unit: "3B", floor: 3, typology: "T2", permillage: 166.66, residentName: "Clara Reis", residentEmail: "clara@email.com", status: "owner" },
]

const mockSubscription: Subscription = {
  plan: "premium",
  status: "active",
  nextBillingDate: "2025-02-15",
  price: 1990,
}

// Settings Tab
type SettingsTab = "profile" | "building" | "apartments" | "subscription" | "notifications"

// Tab Button
function TabButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-1.5 py-1 rounded text-[11px] font-medium transition-colors w-full text-left",
        active
          ? "bg-[#E8F0EA] text-[#6A9B72]"
          : "text-[#6C757D] hover:bg-[#F8F9FA]"
      )}
    >
      {icon}
      {label}
    </button>
  )
}

// Profile Settings
function ProfileSettings() {
  const { addToast } = useToast()
  const [profile, setProfile] = useState(mockProfile)
  const [isEditing, setIsEditing] = useState(false)

  const handleSave = () => {
    setIsEditing(false)
    addToast({
      variant: "success",
      title: "Perfil atualizado",
      description: "As suas alterações foram guardadas.",
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Perfil Pessoal</CardTitle>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit className="h-3 w-3 mr-1" /> Editar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-1.5 mb-1.5">
          <Avatar size="lg" fallback={profile.name.charAt(0)} alt={profile.name} />
          <div>
            <p className="text-[12px] font-medium text-[#495057]">{profile.name}</p>
            <p className="text-[10px] text-[#8E9AAF]">Administrador</p>
          </div>
        </div>

        <Divider className="my-1.5" />

        <div className="space-y-1.5">
          <FormField label="Nome">
            <Input
              value={profile.name}
              onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))}
              disabled={!isEditing}
            />
          </FormField>
          <FormField label="Email">
            <Input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile(p => ({ ...p, email: e.target.value }))}
              disabled={!isEditing}
            />
          </FormField>
          <FormField label="Telefone">
            <Input
              value={profile.phone}
              onChange={(e) => setProfile(p => ({ ...p, phone: e.target.value }))}
              disabled={!isEditing}
            />
          </FormField>
        </div>

        {isEditing && (
          <div className="flex gap-1.5 mt-1.5">
            <Button variant="outline" className="flex-1" onClick={() => setIsEditing(false)}>
              Cancelar
            </Button>
            <Button className="flex-1" onClick={handleSave}>
              <Save className="h-3 w-3 mr-1" /> Guardar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Building Settings
function BuildingSettingsForm() {
  const { addToast } = useToast()
  const [building, setBuilding] = useState(mockBuilding)
  const [isEditing, setIsEditing] = useState(false)

  const handleSave = () => {
    setIsEditing(false)
    addToast({
      variant: "success",
      title: "Configurações guardadas",
      description: "As definições do edifício foram atualizadas.",
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Informação do Edifício</CardTitle>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit className="h-3 w-3 mr-1" /> Editar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1.5">
          <FormField label="Nome do Edifício">
            <Input
              value={building.name}
              onChange={(e) => setBuilding(b => ({ ...b, name: e.target.value }))}
              disabled={!isEditing}
            />
          </FormField>
          <FormField label="Morada">
            <Input
              value={building.address}
              onChange={(e) => setBuilding(b => ({ ...b, address: e.target.value }))}
              disabled={!isEditing}
            />
          </FormField>
          <div className="grid grid-cols-2 gap-1.5">
            <FormField label="Código Postal">
              <Input
                value={building.postalCode}
                onChange={(e) => setBuilding(b => ({ ...b, postalCode: e.target.value }))}
                disabled={!isEditing}
              />
            </FormField>
            <FormField label="Cidade">
              <Input
                value={building.city}
                onChange={(e) => setBuilding(b => ({ ...b, city: e.target.value }))}
                disabled={!isEditing}
              />
            </FormField>
          </div>
          <FormField label="NIF do Condomínio">
            <Input
              value={building.nif}
              onChange={(e) => setBuilding(b => ({ ...b, nif: e.target.value }))}
              disabled={!isEditing}
            />
          </FormField>

          <Divider className="my-1.5" />

          <div className="grid grid-cols-2 gap-1.5">
            <FormField label="Quota Mensal (€)">
              <Input
                type="number"
                value={(building.monthlyQuota / 100).toFixed(2)}
                onChange={(e) => setBuilding(b => ({ ...b, monthlyQuota: parseFloat(e.target.value) * 100 }))}
                disabled={!isEditing}
              />
            </FormField>
            <FormField label="Dia de Pagamento">
              <Select
                value={building.paymentDay.toString()}
                onChange={(e) => setBuilding(b => ({ ...b, paymentDay: parseInt(e.target.value) }))}
                disabled={!isEditing}
              >
                {Array.from({ length: 28 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>Dia {i + 1}</option>
                ))}
              </Select>
            </FormField>
          </div>
        </div>

        {isEditing && (
          <div className="flex gap-1.5 mt-1.5">
            <Button variant="outline" className="flex-1" onClick={() => setIsEditing(false)}>
              Cancelar
            </Button>
            <Button className="flex-1" onClick={handleSave}>
              <Save className="h-3 w-3 mr-1" /> Guardar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Apartments Manager
function ApartmentsManager() {
  const { addToast } = useToast()
  const [apartments, setApartments] = useState(mockApartments)
  const [showAddModal, setShowAddModal] = useState(false)

  const getStatusBadge = (status: Apartment["status"]) => {
    switch (status) {
      case "occupied":
        return <Badge variant="success">Ocupado</Badge>
      case "vacant":
        return <Badge variant="warning">Vago</Badge>
      case "owner":
        return <Badge variant="info">Proprietário</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Frações ({apartments.length})</CardTitle>
          <Button size="sm" onClick={() => setShowAddModal(true)}>
            <Plus className="h-3 w-3 mr-1" /> Adicionar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-[#F1F3F5]">
          {apartments.map((apt) => (
            <div key={apt.id} className="flex items-center justify-between p-1.5 hover:bg-[#F8F9FA] transition-colors">
              <div className="flex items-center gap-1.5">
                <div className="w-8 h-8 flex items-center justify-center rounded bg-[#F8F9FA] border border-[#E9ECEF] text-[11px] font-medium text-[#495057]">
                  {apt.unit}
                </div>
                <div>
                  <p className="text-[11px] font-medium text-[#495057]">
                    {apt.residentName || <span className="text-[#ADB5BD] italic">Sem residente</span>}
                  </p>
                  <p className="text-[9px] text-[#8E9AAF]">
                    {apt.typology} • {apt.floor}º andar • {apt.permillage.toFixed(2)}‰
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {getStatusBadge(apt.status)}
                <IconButton
                  size="sm"
                  variant="ghost"
                  icon={<Edit className="h-3 w-3" />}
                  label="Editar"
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-[9px] text-[#8E9AAF]">
          Total permilagem: {apartments.reduce((sum, a) => sum + a.permillage, 0).toFixed(2)}‰
        </p>
      </CardFooter>

      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Nova Fração"
        description="Adicione uma nova fração ao edifício."
        footer={
          <div className="flex justify-end gap-1.5">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancelar</Button>
            <Button onClick={() => {
              setShowAddModal(false)
              addToast({ variant: "success", title: "Fração adicionada", description: "A nova fração foi criada." })
            }}>
              Adicionar
            </Button>
          </div>
        }
      >
        <div className="space-y-1.5">
          <div className="grid grid-cols-2 gap-1.5">
            <FormField label="Unidade" required>
              <Input placeholder="Ex: 4A" />
            </FormField>
            <FormField label="Andar" required>
              <Input type="number" placeholder="4" />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <FormField label="Tipologia" required>
              <Select>
                <option value="T0">T0</option>
                <option value="T1">T1</option>
                <option value="T2">T2</option>
                <option value="T3">T3</option>
                <option value="T4">T4</option>
              </Select>
            </FormField>
            <FormField label="Permilagem" required>
              <Input type="number" placeholder="166.67" />
            </FormField>
          </div>
        </div>
      </Modal>
    </Card>
  )
}

// Subscription Settings
function SubscriptionSettings() {
  const { addToast } = useToast()
  const [subscription] = useState(mockSubscription)

  const formatCurrency = (cents: number) => `€${(cents / 100).toFixed(2)}`

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscrição</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between p-1.5 rounded-lg bg-gradient-to-r from-[#E8F0EA] to-[#F8F9FA] border border-[#D4E5D7] mb-1.5">
          <div className="flex items-center gap-1.5">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#8FB996]">
              <Crown className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-[12px] font-medium text-[#495057]">Plano Premium</p>
              <p className="text-[10px] text-[#6A9B72]">Todas as funcionalidades desbloqueadas</p>
            </div>
          </div>
          <Badge variant="success">Ativo</Badge>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between py-1 border-b border-[#F1F3F5]">
            <span className="text-[10px] text-[#8E9AAF]">Próxima faturação</span>
            <span className="text-[10px] font-medium text-[#495057]">15 Fev 2025</span>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-[#F1F3F5]">
            <span className="text-[10px] text-[#8E9AAF]">Valor mensal</span>
            <span className="text-[10px] font-medium text-[#495057]">{formatCurrency(subscription.price || 0)}</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-[10px] text-[#8E9AAF]">Método de pagamento</span>
            <span className="text-[10px] font-medium text-[#495057]">•••• 4242</span>
          </div>
        </div>

        <Divider className="my-1.5" />

        <div className="flex gap-1.5">
          <Button variant="outline" size="sm" className="flex-1">
            Alterar plano
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            Gerir pagamento
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Notification Settings
function NotificationSettings() {
  const { addToast } = useToast()
  const [settings, setSettings] = useState({
    emailPayments: true,
    emailOccurrences: true,
    emailPolls: true,
    pushEnabled: false,
  })

  const handleSave = () => {
    addToast({
      variant: "success",
      title: "Preferências guardadas",
      description: "As suas preferências de notificação foram atualizadas.",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notificações</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1.5">
          <p className="text-[9px] font-medium text-[#8E9AAF] uppercase tracking-wide">Notificações por Email</p>

          {[
            { key: "emailPayments", label: "Pagamentos", desc: "Receber alertas sobre pagamentos recebidos e em falta" },
            { key: "emailOccurrences", label: "Ocorrências", desc: "Notificações sobre novas ocorrências e atualizações" },
            { key: "emailPolls", label: "Votações", desc: "Alertas sobre novas votações e resultados" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between py-1 border-b border-[#F1F3F5]">
              <div>
                <p className="text-[11px] font-medium text-[#495057]">{item.label}</p>
                <p className="text-[9px] text-[#8E9AAF]">{item.desc}</p>
              </div>
              <button
                onClick={() => setSettings(s => ({ ...s, [item.key]: !s[item.key as keyof typeof s] }))}
                className={cn(
                  "w-8 h-4 rounded-full transition-colors relative",
                  settings[item.key as keyof typeof settings] ? "bg-[#8FB996]" : "bg-[#DEE2E6]"
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform shadow-sm",
                    settings[item.key as keyof typeof settings] ? "translate-x-4" : "translate-x-0.5"
                  )}
                />
              </button>
            </div>
          ))}

          <Divider className="my-1.5" />

          <p className="text-[9px] font-medium text-[#8E9AAF] uppercase tracking-wide">Notificações Push</p>

          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-[11px] font-medium text-[#495057]">Ativar notificações push</p>
              <p className="text-[9px] text-[#8E9AAF]">Receber notificações no browser</p>
            </div>
            <button
              onClick={() => setSettings(s => ({ ...s, pushEnabled: !s.pushEnabled }))}
              className={cn(
                "w-8 h-4 rounded-full transition-colors relative",
                settings.pushEnabled ? "bg-[#8FB996]" : "bg-[#DEE2E6]"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform shadow-sm",
                  settings.pushEnabled ? "translate-x-4" : "translate-x-0.5"
                )}
              />
            </button>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleSave}>
          <Save className="h-3 w-3 mr-1" /> Guardar Preferências
        </Button>
      </CardFooter>
    </Card>
  )
}

// Main Content
function SettingsContent() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile")

  const tabs = [
    { id: "profile" as const, icon: <User className="h-3.5 w-3.5" />, label: "Perfil" },
    { id: "building" as const, icon: <Building className="h-3.5 w-3.5" />, label: "Edifício" },
    { id: "apartments" as const, icon: <Key className="h-3.5 w-3.5" />, label: "Frações" },
    { id: "subscription" as const, icon: <CreditCard className="h-3.5 w-3.5" />, label: "Subscrição" },
    { id: "notifications" as const, icon: <Bell className="h-3.5 w-3.5" />, label: "Notificações" },
  ]

  return (
    <div className="flex-1 overflow-y-auto p-1.5">
      {/* Header */}
      <div className="mb-1.5">
        <h1 className="text-[14px] font-semibold text-[#343A40]">Definições</h1>
        <p className="text-[10px] text-[#8E9AAF]">Configurações da conta e do condomínio</p>
      </div>

      <div className="grid gap-1.5 lg:grid-cols-4">
        {/* Sidebar */}
        <Card className="lg:col-span-1">
          <CardContent className="p-1.5">
            <div className="space-y-0.5">
              {tabs.map((tab) => (
                <TabButton
                  key={tab.id}
                  icon={tab.icon}
                  label={tab.label}
                  active={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === "profile" && <ProfileSettings />}
          {activeTab === "building" && <BuildingSettingsForm />}
          {activeTab === "apartments" && <ApartmentsManager />}
          {activeTab === "subscription" && <SubscriptionSettings />}
          {activeTab === "notifications" && <NotificationSettings />}
        </div>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <ToastProvider>
      <div className="h-full bg-white">
        <SettingsContent />
      </div>
    </ToastProvider>
  )
}
