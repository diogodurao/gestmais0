"use client"

import { useState } from "react"
import { Button } from "../../components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Input } from "../../components/ui/input"
import { Select } from "../../components/ui/select"
import { FormField } from "../../components/ui/form-field"
import { Alert } from "../../components/ui/alert"
import { Progress } from "../../components/ui/progress"
import { Divider } from "../../components/ui/divider"
import { ToastProvider, useToast } from "../../components/ui/toast"
import { cn } from "@/lib/utils"
import {
  User, Building2, LayoutGrid, Home, Check, ChevronRight,
  CreditCard, Hash, MapPin, Trash2, Plus, AlertCircle,
} from "lucide-react"

// Types
type OnboardingStep = 1 | 2 | 3 | 4

interface PersonalData {
  name: string
  nif: string
  iban: string
}

interface BuildingData {
  street: string
  number: string
  city: string
  nif: string
  iban: string
  totalApartments: number
  quotaMode: "global" | "permillage"
  monthlyQuota: number
}

interface Apartment {
  id: number
  unit: string
  permillage: number
}

// Validation helpers
function isValidNif(nif: string): boolean {
  return /^\d{9}$/.test(nif)
}

function isValidIban(iban: string): boolean {
  return /^[A-Z0-9]{25}$/.test(iban.replace(/\s/g, "").toUpperCase())
}

// Step indicator component
function StepIndicator({
  step,
  currentStep,
  title,
  icon: Icon,
  isCompleted,
}: {
  step: number
  currentStep: number
  title: string
  icon: React.ElementType
  isCompleted: boolean
}) {
  const isCurrent = step === currentStep
  const isPast = step < currentStep || isCompleted

  return (
    <div className="flex items-center gap-1.5">
      <div
        className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors",
          isCurrent && "bg-[#8FB996] text-white",
          isPast && "bg-[#E8F0EA] text-[#6A9B72]",
          !isCurrent && !isPast && "bg-[#F1F3F5] text-[#ADB5BD]"
        )}
      >
        {isPast ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
      </div>
      <span
        className={cn(
          "text-[10px] font-medium hidden sm:block",
          isCurrent && "text-[#495057]",
          isPast && "text-[#6A9B72]",
          !isCurrent && !isPast && "text-[#ADB5BD]"
        )}
      >
        {title}
      </span>
    </div>
  )
}

// Validation indicator
function ValidationCheck({ isValid, label }: { isValid: boolean; label?: string }) {
  return (
    <div className="flex items-center gap-1">
      <div
        className={cn(
          "w-4 h-4 rounded-full flex items-center justify-center",
          isValid ? "bg-[#E8F0EA] text-[#6A9B72]" : "bg-[#F1F3F5] text-[#ADB5BD]"
        )}
      >
        <Check className="w-2.5 h-2.5" />
      </div>
      {label && (
        <span className={cn("text-[9px]", isValid ? "text-[#6A9B72]" : "text-[#ADB5BD]")}>
          {label}
        </span>
      )}
    </div>
  )
}

// Step 1: Personal Identity
function PersonalStep({
  data,
  onChange,
  onNext,
}: {
  data: PersonalData
  onChange: (data: PersonalData) => void
  onNext: () => void
}) {
  const isNameValid = data.name.trim().length > 0
  const isNifValid = isValidNif(data.nif)
  const isIbanValid = data.iban === "" || isValidIban(data.iban)
  const canContinue = isNameValid && isNifValid

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-1.5">
          <div className="w-8 h-8 rounded-lg bg-[#E8F0EA] flex items-center justify-center">
            <User className="w-4 h-4 text-[#6A9B72]" />
          </div>
          <div>
            <CardTitle>Identidade Pessoal</CardTitle>
            <CardDescription>Informações do administrador do condomínio</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1.5">
          <FormField label="Nome Completo" required>
            <div className="flex gap-1.5">
              <Input
                placeholder="Ex: João Manuel Silva"
                value={data.name}
                onChange={(e) => onChange({ ...data, name: e.target.value })}
                className="flex-1"
              />
              <ValidationCheck isValid={isNameValid} />
            </div>
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            <FormField label="NIF Pessoal" required>
              <div className="flex gap-1.5">
                <Input
                  placeholder="123456789"
                  value={data.nif}
                  onChange={(e) => onChange({ ...data, nif: e.target.value.replace(/\D/g, "").slice(0, 9) })}
                  className="flex-1 font-mono"
                />
                <ValidationCheck isValid={isNifValid} />
              </div>
            </FormField>

            <FormField label="IBAN Pessoal" hint="Opcional">
              <div className="flex gap-1.5">
                <Input
                  placeholder="PT50 0000 0000 0000 0000 0000 0"
                  value={data.iban}
                  onChange={(e) => onChange({ ...data, iban: e.target.value.toUpperCase().slice(0, 25) })}
                  className="flex-1 font-mono text-[10px]"
                />
                {data.iban && <ValidationCheck isValid={isIbanValid} />}
              </div>
            </FormField>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={onNext} disabled={!canContinue}>
          Guardar e Continuar
          <ChevronRight className="w-3 h-3 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  )
}

// Step 2: Building Structure
function BuildingStep({
  data,
  onChange,
  onNext,
  onBack,
}: {
  data: BuildingData
  onChange: (data: BuildingData) => void
  onNext: () => void
  onBack: () => void
}) {
  const isStreetValid = data.street.trim().length > 0
  const isNumberValid = data.number.trim().length > 0
  const isCityValid = data.city.trim().length > 0
  const isNifValid = isValidNif(data.nif)
  const isIbanValid = isValidIban(data.iban)
  const isApartmentsValid = data.totalApartments > 0
  const isQuotaValid = data.monthlyQuota > 0

  const canContinue = isStreetValid && isNumberValid && isCityValid && isNifValid && isIbanValid && isApartmentsValid && isQuotaValid

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-1.5">
          <div className="w-8 h-8 rounded-lg bg-[#E8F0EA] flex items-center justify-center">
            <Building2 className="w-4 h-4 text-[#6A9B72]" />
          </div>
          <div>
            <CardTitle>Estrutura do Edifício</CardTitle>
            <CardDescription>Dados do condomínio e configuração de quotas</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1.5">
          {/* Address */}
          <div className="grid grid-cols-6 gap-1.5">
            <FormField label="Rua" required className="col-span-4">
              <Input
                placeholder="Ex: Rua das Flores"
                value={data.street}
                onChange={(e) => onChange({ ...data, street: e.target.value })}
              />
            </FormField>
            <FormField label="Número" required className="col-span-1">
              <Input
                placeholder="123"
                value={data.number}
                onChange={(e) => onChange({ ...data, number: e.target.value })}
              />
            </FormField>
            <FormField label="Cidade" required className="col-span-1">
              <Input
                placeholder="Lisboa"
                value={data.city}
                onChange={(e) => onChange({ ...data, city: e.target.value })}
              />
            </FormField>
          </div>

          {/* NIF and IBAN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            <FormField label="NIF do Condomínio" required>
              <div className="flex gap-1.5">
                <Input
                  placeholder="123456789"
                  value={data.nif}
                  onChange={(e) => onChange({ ...data, nif: e.target.value.replace(/\D/g, "").slice(0, 9) })}
                  className="flex-1 font-mono"
                />
                <ValidationCheck isValid={isNifValid} />
              </div>
            </FormField>

            <FormField label="IBAN do Condomínio" required>
              <div className="flex gap-1.5">
                <Input
                  placeholder="PT50 0000 0000 0000 0000 0000 0"
                  value={data.iban}
                  onChange={(e) => onChange({ ...data, iban: e.target.value.toUpperCase().slice(0, 25) })}
                  className="flex-1 font-mono text-[10px]"
                />
                <ValidationCheck isValid={isIbanValid} />
              </div>
            </FormField>
          </div>

          <Divider className="my-2" />

          {/* Quota Configuration */}
          <div className="rounded-lg bg-[#F8F9FA] border border-[#E9ECEF] p-1.5">
            <p className="text-[9px] font-medium text-[#8E9AAF] uppercase tracking-wide mb-1.5">
              Configuração de Quotas
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
              <FormField label="Total de Frações" required>
                <Input
                  type="number"
                  min="1"
                  placeholder="6"
                  value={data.totalApartments || ""}
                  onChange={(e) => onChange({ ...data, totalApartments: parseInt(e.target.value) || 0 })}
                />
              </FormField>

              <FormField label="Modo de Cálculo" required>
                <Select
                  value={data.quotaMode}
                  onChange={(e) => onChange({ ...data, quotaMode: e.target.value as "global" | "permillage" })}
                >
                  <option value="global">Valor Global</option>
                  <option value="permillage">Por Permilagem</option>
                </Select>
              </FormField>

              <FormField label="Quota Mensal Base (€)" required>
                <Input
                  type="number"
                  min="1"
                  placeholder="85"
                  value={data.monthlyQuota || ""}
                  onChange={(e) => onChange({ ...data, monthlyQuota: parseInt(e.target.value) || 0 })}
                />
              </FormField>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-1.5">
        <Button variant="outline" onClick={onBack}>
          Voltar
        </Button>
        <Button className="flex-1" onClick={onNext} disabled={!canContinue}>
          Guardar e Continuar
          <ChevronRight className="w-3 h-3 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  )
}

// Step 3: Register Units
function UnitsStep({
  apartments,
  totalApartments,
  onAdd,
  onDelete,
  onNext,
  onBack,
}: {
  apartments: Apartment[]
  totalApartments: number
  onAdd: (unit: string, permillage: number) => void
  onDelete: (id: number) => void
  onNext: () => void
  onBack: () => void
}) {
  const [newUnit, setNewUnit] = useState("")
  const [newPermillage, setNewPermillage] = useState("")

  const totalPermillage = apartments.reduce((sum, a) => sum + a.permillage, 0)
  const isPermillageComplete = Math.abs(totalPermillage - 1000) < 0.01
  const isCountComplete = apartments.length === totalApartments
  const canContinue = isPermillageComplete && isCountComplete
  const canAddMore = apartments.length < totalApartments

  const handleAdd = () => {
    if (newUnit && newPermillage && canAddMore) {
      onAdd(newUnit, parseFloat(newPermillage))
      setNewUnit("")
      setNewPermillage("")
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-1.5">
          <div className="w-8 h-8 rounded-lg bg-[#E8F0EA] flex items-center justify-center">
            <LayoutGrid className="w-4 h-4 text-[#6A9B72]" />
          </div>
          <div>
            <CardTitle>Registo de Frações</CardTitle>
            <CardDescription>Adicione todas as frações do edifício</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Alert variant="info" className="mb-1.5">
          A soma das permilagens deve ser exatamente 1000‰. Tem {apartments.length} de {totalApartments} frações registadas.
        </Alert>

        {/* Apartments Table */}
        <div className="rounded-lg border border-[#E9ECEF] overflow-hidden mb-1.5">
          {/* Header */}
          <div className="grid grid-cols-12 gap-1.5 bg-[#F8F9FA] px-1.5 py-1 text-[9px] font-medium text-[#8E9AAF] uppercase tracking-wide">
            <div className="col-span-6">Fração</div>
            <div className="col-span-4 text-right">Permilagem</div>
            <div className="col-span-2"></div>
          </div>

          {/* Body */}
          <div className="max-h-48 overflow-y-auto divide-y divide-[#F1F3F5]">
            {apartments.length === 0 ? (
              <div className="px-1.5 py-4 text-center text-[10px] text-[#ADB5BD]">
                Nenhuma fração registada
              </div>
            ) : (
              apartments.map((apt) => (
                <div key={apt.id} className="grid grid-cols-12 gap-1.5 px-1.5 py-1 items-center">
                  <div className="col-span-6 text-[11px] font-medium text-[#495057] font-mono">
                    {apt.unit}
                  </div>
                  <div className="col-span-4 text-right text-[11px] text-[#6C757D] font-mono">
                    {apt.permillage.toFixed(2)}‰
                  </div>
                  <div className="col-span-2 text-right">
                    <button
                      onClick={() => onDelete(apt.id)}
                      className="p-1 rounded hover:bg-[#F9ECEE] text-[#B86B73] transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add Row */}
          {canAddMore && (
            <div className="grid grid-cols-12 gap-1.5 px-1.5 py-1 bg-[#F8F9FA] border-t border-[#E9ECEF] items-center">
              <div className="col-span-5">
                <Input
                  placeholder="Ex: 1º Esq"
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value)}
                  className="text-[10px]"
                />
              </div>
              <div className="col-span-4">
                <Input
                  type="number"
                  placeholder="166.67"
                  value={newPermillage}
                  onChange={(e) => setNewPermillage(e.target.value)}
                  className="text-[10px] font-mono"
                />
              </div>
              <div className="col-span-3">
                <Button
                  size="sm"
                  onClick={handleAdd}
                  disabled={!newUnit || !newPermillage}
                  className="w-full"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="flex items-center justify-between rounded-lg bg-[#F8F9FA] border border-[#E9ECEF] px-1.5 py-1">
          <div className="flex items-center gap-2">
            <Badge variant={isCountComplete ? "success" : "warning"}>
              {apartments.length}/{totalApartments} Frações
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <span className={cn(
              "text-[11px] font-mono font-medium",
              isPermillageComplete ? "text-[#6A9B72]" : "text-[#B8963E]"
            )}>
              {totalPermillage.toFixed(2)}/1000‰
            </span>
            {isPermillageComplete && <Check className="w-3 h-3 text-[#6A9B72]" />}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-1.5">
        <Button variant="outline" onClick={onBack}>
          Voltar
        </Button>
        <Button className="flex-1" onClick={onNext} disabled={!canContinue}>
          Guardar e Continuar
          <ChevronRight className="w-3 h-3 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  )
}

// Step 4: Claim Manager Unit
function ClaimStep({
  apartments,
  selectedId,
  onSelect,
  onFinish,
  onBack,
}: {
  apartments: Apartment[]
  selectedId: number | null
  onSelect: (id: number) => void
  onFinish: () => void
  onBack: () => void
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-1.5">
          <div className="w-8 h-8 rounded-lg bg-[#E8F0EA] flex items-center justify-center">
            <Home className="w-4 h-4 text-[#6A9B72]" />
          </div>
          <div>
            <CardTitle>Reivindicar Fração</CardTitle>
            <CardDescription>Selecione a sua fração como administrador</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Alert variant="info" className="mb-1.5">
          Como administrador, selecione a fração onde reside ou que representa.
        </Alert>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {apartments.map((apt) => {
            const isSelected = selectedId === apt.id

            return (
              <button
                key={apt.id}
                type="button"
                onClick={() => onSelect(apt.id)}
                className={cn(
                  "rounded-lg border-2 p-2 text-center transition-all",
                  isSelected
                    ? "border-[#8FB996] bg-[#E8F0EA]"
                    : "border-[#E9ECEF] bg-white hover:border-[#DEE2E6] hover:bg-[#F8F9FA]"
                )}
              >
                <div className={cn(
                  "text-[14px] font-bold font-mono mb-0.5",
                  isSelected ? "text-[#6A9B72]" : "text-[#495057]"
                )}>
                  {apt.unit}
                </div>
                <div className={cn(
                  "text-[9px]",
                  isSelected ? "text-[#6A9B72]" : "text-[#8E9AAF]"
                )}>
                  {apt.permillage.toFixed(2)}‰
                </div>
                {isSelected && (
                  <div className="mt-1">
                    <Check className="w-4 h-4 text-[#6A9B72] mx-auto" />
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </CardContent>
      <CardFooter className="flex gap-1.5">
        <Button variant="outline" onClick={onBack}>
          Voltar
        </Button>
        <Button className="flex-1" onClick={onFinish} disabled={!selectedId}>
          Finalizar e Entrar
          <Check className="w-3 h-3 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  )
}

// Main Onboarding Component
function ManagerOnboardingContent() {
  const { addToast } = useToast()
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(1)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  // Form data
  const [personalData, setPersonalData] = useState<PersonalData>({
    name: "",
    nif: "",
    iban: "",
  })

  const [buildingData, setBuildingData] = useState<BuildingData>({
    street: "",
    number: "",
    city: "",
    nif: "",
    iban: "",
    totalApartments: 6,
    quotaMode: "global",
    monthlyQuota: 85,
  })

  const [apartments, setApartments] = useState<Apartment[]>([])
  const [claimedUnitId, setClaimedUnitId] = useState<number | null>(null)

  // Step navigation
  const goToStep = (step: OnboardingStep) => {
    setCurrentStep(step)
  }

  const completeStep = (step: number) => {
    setCompletedSteps((prev) => new Set([...prev, step]))
  }

  // Handlers
  const handlePersonalNext = () => {
    completeStep(1)
    goToStep(2)
    addToast({ variant: "success", title: "Dados guardados", description: "Identidade pessoal registada." })
  }

  const handleBuildingNext = () => {
    completeStep(2)
    goToStep(3)
    addToast({ variant: "success", title: "Dados guardados", description: "Estrutura do edifício registada." })
  }

  const handleAddApartment = (unit: string, permillage: number) => {
    const newApt: Apartment = {
      id: Date.now(),
      unit,
      permillage,
    }
    setApartments((prev) => [...prev, newApt])
  }

  const handleDeleteApartment = (id: number) => {
    setApartments((prev) => prev.filter((a) => a.id !== id))
  }

  const handleUnitsNext = () => {
    completeStep(3)
    goToStep(4)
    addToast({ variant: "success", title: "Frações guardadas", description: `${apartments.length} frações registadas.` })
  }

  const handleFinish = () => {
    completeStep(4)
    addToast({ variant: "success", title: "Configuração completa!", description: "Bem-vindo ao sistema de gestão." })
    // In real app, redirect to dashboard
  }

  // Progress calculation
  const progressPercent = ((currentStep - 1) / 4) * 100 + (completedSteps.has(currentStep) ? 25 : 0)

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-4 px-1.5">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-2">
          <p className="text-[9px] font-medium text-[#8E9AAF] uppercase tracking-widest mb-0.5">
            Inicialização do Sistema
          </p>
          <h1 className="text-[16px] font-bold text-[#343A40] uppercase tracking-wide">
            Configuração do Condomínio
          </h1>
          <p className="text-[10px] text-[#8E9AAF] mt-0.5">
            Complete todos os passos para começar a gerir o seu condomínio
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-2">
          <Progress value={progressPercent} size="sm" />
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-between mb-2 px-1">
          <StepIndicator
            step={1}
            currentStep={currentStep}
            title="Identidade"
            icon={User}
            isCompleted={completedSteps.has(1)}
          />
          <ChevronRight className="w-3 h-3 text-[#DEE2E6]" />
          <StepIndicator
            step={2}
            currentStep={currentStep}
            title="Edifício"
            icon={Building2}
            isCompleted={completedSteps.has(2)}
          />
          <ChevronRight className="w-3 h-3 text-[#DEE2E6]" />
          <StepIndicator
            step={3}
            currentStep={currentStep}
            title="Frações"
            icon={LayoutGrid}
            isCompleted={completedSteps.has(3)}
          />
          <ChevronRight className="w-3 h-3 text-[#DEE2E6]" />
          <StepIndicator
            step={4}
            currentStep={currentStep}
            title="Fração"
            icon={Home}
            isCompleted={completedSteps.has(4)}
          />
        </div>

        {/* Current Step Content */}
        {currentStep === 1 && (
          <PersonalStep
            data={personalData}
            onChange={setPersonalData}
            onNext={handlePersonalNext}
          />
        )}

        {currentStep === 2 && (
          <BuildingStep
            data={buildingData}
            onChange={setBuildingData}
            onNext={handleBuildingNext}
            onBack={() => goToStep(1)}
          />
        )}

        {currentStep === 3 && (
          <UnitsStep
            apartments={apartments}
            totalApartments={buildingData.totalApartments}
            onAdd={handleAddApartment}
            onDelete={handleDeleteApartment}
            onNext={handleUnitsNext}
            onBack={() => goToStep(2)}
          />
        )}

        {currentStep === 4 && (
          <ClaimStep
            apartments={apartments}
            selectedId={claimedUnitId}
            onSelect={setClaimedUnitId}
            onFinish={handleFinish}
            onBack={() => goToStep(3)}
          />
        )}

        {/* Completion Message */}
        {completedSteps.has(4) && (
          <Card variant="success" className="mt-2">
            <CardContent className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-[#E8F0EA] flex items-center justify-center mx-auto mb-1.5">
                <Check className="w-6 h-6 text-[#6A9B72]" />
              </div>
              <h2 className="text-[14px] font-bold text-[#343A40] mb-0.5">Configuração Completa!</h2>
              <p className="text-[10px] text-[#8E9AAF]">
                O seu condomínio está pronto. Clique abaixo para aceder ao painel.
              </p>
              <Button className="mt-2">
                Ir para o Painel
                <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default function ManagerOnboardingPage() {
  return (
    <ToastProvider>
      <ManagerOnboardingContent />
    </ToastProvider>
  )
}
