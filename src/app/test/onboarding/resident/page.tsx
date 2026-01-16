"use client"

import { useState } from "react"
import { Button } from "../../components/ui/Button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../Components/ui/Card"
import { Badge } from "../../components/ui/Badge"
import { Input } from "../../components/ui/Input"
import { Select } from "../../components/ui/Select"
import { FormField } from "../../components/ui/Form-Field"
import { Alert } from "../../components/ui/Alert"
import { Progress } from "../../components/ui/Progress"
import { ToastProvider, useToast } from "../../components/ui/Toast"
import { Stepper, StepperItem, StepperConnector } from "../../components/ui/Stepper"
import { ValidationCheck } from "../../components/ui/Validation-Check"
import {
  Building2, Home, CreditCard, Check, ChevronRight,
  KeyRound, AlertCircle,
} from "lucide-react"

// Types
type OnboardingStep = 1 | 2 | 3

interface BuildingInfo {
  id: number
  name: string
  address: string
  inviteCode: string
}

interface ApartmentOption {
  id: number
  unit: string
  permillage: number
  isAvailable: boolean
}

// Mock data
const mockBuilding: BuildingInfo = {
  id: 1,
  name: "Edifício Flores",
  address: "Rua das Flores, 123 - Lisboa",
  inviteCode: "ABC123",
}

const mockApartments: ApartmentOption[] = [
  { id: 1, unit: "1º Esq", permillage: 166.67, isAvailable: false },
  { id: 2, unit: "1º Dir", permillage: 166.67, isAvailable: true },
  { id: 3, unit: "2º Esq", permillage: 166.67, isAvailable: false },
  { id: 4, unit: "2º Dir", permillage: 166.67, isAvailable: true },
  { id: 5, unit: "3º Esq", permillage: 166.66, isAvailable: true },
  { id: 6, unit: "3º Dir", permillage: 166.66, isAvailable: true },
]

// Validation helpers
function isValidIban(iban: string): boolean {
  return /^[A-Z0-9]{25}$/.test(iban.replace(/\s/g, "").toUpperCase())
}

// Step 1: Join Building
function JoinStep({
  inviteCode,
  onChange,
  onNext,
  error,
}: {
  inviteCode: string
  onChange: (code: string) => void
  onNext: () => void
  error: string | null
}) {
  const isValid = inviteCode.length === 6

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-1.5">
          <div className="w-10 h-10 rounded-full bg-[#E8F0EA] flex items-center justify-center">
            <Building2 className="w-5 h-5 text-[#6A9B72]" />
          </div>
          <div>
            <CardTitle>Entrada no Sistema</CardTitle>
            <CardDescription>Introduza o código de convite do seu condomínio</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Alert variant="info" className="mb-2">
          O código de convite foi fornecido pelo administrador do seu condomínio. Se não tem um código, contacte a administração.
        </Alert>

        <FormField label="Código de Convite" required>
          <div className="flex gap-1.5">
            <Input
              placeholder="ABC123"
              value={inviteCode}
              onChange={(e) => onChange(e.target.value.toUpperCase().slice(0, 6))}
              className="flex-1 font-mono text-center text-[16px] tracking-[0.3em] uppercase"
              maxLength={6}
            />
            {inviteCode && <ValidationCheck isValid={isValid} />}
          </div>
        </FormField>

        {error && (
          <Alert variant="error" className="mt-1.5">
            <AlertCircle className="w-3 h-3" />
            {error}
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={onNext} disabled={!isValid}>
          <KeyRound className="w-3 h-3 mr-1" />
          Ligar ao Edifício
        </Button>
      </CardFooter>
    </Card>
  )
}

// Step 2: Claim Apartment
function ClaimStep({
  building,
  apartments,
  selectedId,
  onSelect,
  onNext,
  onBack,
}: {
  building: BuildingInfo
  apartments: ApartmentOption[]
  selectedId: number | null
  onSelect: (id: number) => void
  onNext: () => void
  onBack: () => void
}) {
  const availableApartments = apartments.filter((a) => a.isAvailable)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-1.5">
          <div className="w-10 h-10 rounded-full bg-[#E8F0EA] flex items-center justify-center">
            <Home className="w-5 h-5 text-[#6A9B72]" />
          </div>
          <div>
            <CardTitle>Alocação de Fração</CardTitle>
            <CardDescription>Selecione a sua fração no edifício</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Building Info */}
        <div className="rounded-lg bg-[#F8F9FA] border border-[#E9ECEF] p-1.5 mb-2">
          <div className="flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-[#8E9AAF]" />
            <div>
              <p className="text-[11px] font-medium text-[#495057]">{building.name}</p>
              <p className="text-[9px] text-[#8E9AAF]">{building.address}</p>
            </div>
          </div>
        </div>

        <FormField label="Selecione a sua Fração" required>
          <Select
            value={selectedId?.toString() || ""}
            onChange={(e) => onSelect(parseInt(e.target.value))}
            className="font-mono"
          >
            <option value="">Selecionar fração...</option>
            {availableApartments.map((apt) => (
              <option key={apt.id} value={apt.id}>
                {apt.unit} ({apt.permillage.toFixed(2)}‰)
              </option>
            ))}
          </Select>
        </FormField>

        {availableApartments.length === 0 && (
          <Alert variant="warning" className="mt-1.5">
            Não há frações disponíveis neste momento. Contacte a administração.
          </Alert>
        )}

        {/* Show selected apartment details */}
        {selectedId && (
          <div className="mt-1.5 p-1.5 rounded-lg border-2 border-[#8FB996] bg-[#E8F0EA]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Home className="w-4 h-4 text-[#6A9B72]" />
                <span className="text-[11px] font-medium text-[#6A9B72]">
                  Fração selecionada
                </span>
              </div>
              <Badge variant="success">
                {apartments.find((a) => a.id === selectedId)?.unit}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-1.5">
        <Button variant="outline" onClick={onBack}>
          Voltar
        </Button>
        <Button className="flex-1" onClick={onNext} disabled={!selectedId}>
          Confirmar Alocação
          <ChevronRight className="w-3 h-3 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  )
}

// Step 3: Financial Setup
function FinancialStep({
  apartment,
  iban,
  onChange,
  onFinish,
  onBack,
}: {
  apartment: ApartmentOption | null
  iban: string
  onChange: (iban: string) => void
  onFinish: () => void
  onBack: () => void
}) {
  const isIbanValid = iban === "" || isValidIban(iban)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-1.5">
          <div className="w-10 h-10 rounded-full bg-[#E8F0EA] flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-[#6A9B72]" />
          </div>
          <div>
            <CardTitle>Configuração Financeira</CardTitle>
            <CardDescription>Adicione os seus dados bancários (opcional)</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Verification Box */}
        <div className="rounded-lg bg-[#E8F0EA] border border-[#D4E5D7] p-1.5 mb-2">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-[#8FB996] flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-medium text-[#6A9B72] uppercase tracking-wide">
                Verificado
              </p>
              <p className="text-[11px] text-[#495057]">
                Fração {apartment?.unit} confirmada
              </p>
            </div>
          </div>
        </div>

        <Alert variant="info" className="mb-2">
          Adicione o seu IBAN para automatizar a informação relativa aos pagamentos. Este passo é opcional.
        </Alert>

        <FormField label="Número IBAN" hint="Opcional">
          <div className="flex gap-1.5">
            <Input
              placeholder="PT50 0000 0000 0000 0000 0000 0"
              value={iban}
              onChange={(e) => onChange(e.target.value.toUpperCase().replace(/\s/g, "").slice(0, 25))}
              className="flex-1 font-mono text-[10px]"
            />
            {iban && <ValidationCheck isValid={isIbanValid} />}
          </div>
        </FormField>

        {iban && !isIbanValid && (
          <Alert variant="error" className="mt-1.5">
            IBAN inválido. Deve ter 25 caracteres (ex: PT50...)
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex gap-1.5">
        <Button variant="outline" onClick={onBack}>
          Voltar
        </Button>
        <Button className="flex-1" onClick={onFinish} disabled={iban !== "" && !isIbanValid}>
          Concluir Configuração
          <Check className="w-3 h-3 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  )
}

// Main Onboarding Component
function ResidentOnboardingContent() {
  const { addToast } = useToast()
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(1)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  // Form data
  const [inviteCode, setInviteCode] = useState("")
  const [joinError, setJoinError] = useState<string | null>(null)
  const [building, setBuilding] = useState<BuildingInfo | null>(null)
  const [selectedApartmentId, setSelectedApartmentId] = useState<number | null>(null)
  const [iban, setIban] = useState("")

  // Step navigation
  const goToStep = (step: OnboardingStep) => {
    setCurrentStep(step)
  }

  const completeStep = (step: number) => {
    setCompletedSteps((prev) => new Set([...prev, step]))
  }

  // Handlers
  const handleJoinBuilding = () => {
    // Simulate API call to validate invite code
    if (inviteCode === mockBuilding.inviteCode) {
      setBuilding(mockBuilding)
      setJoinError(null)
      completeStep(1)
      goToStep(2)
      addToast({ variant: "success", title: "Edifício encontrado!", description: mockBuilding.name })
    } else {
      setJoinError("Código de convite inválido. Verifique e tente novamente.")
    }
  }

  const handleClaimApartment = () => {
    completeStep(2)
    goToStep(3)
    addToast({ variant: "success", title: "Fração alocada", description: "A sua fração foi registada." })
  }

  const handleFinish = () => {
    completeStep(3)
    addToast({ variant: "success", title: "Configuração completa!", description: "Bem-vindo ao seu condomínio." })
  }

  // Get selected apartment
  const selectedApartment = mockApartments.find((a) => a.id === selectedApartmentId) || null

  // Progress calculation
  const progressPercent = ((currentStep - 1) / 3) * 100 + (completedSteps.has(currentStep) ? 33.33 : 0)

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-4 px-1.5">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-2">
          <p className="text-[9px] font-medium text-[#8E9AAF] uppercase tracking-widest mb-0.5">
            Novo Portal de Residente
          </p>
          <h1 className="text-[16px] font-bold text-[#343A40] uppercase tracking-wide">
            Bem-vindo
          </h1>
          <p className="text-[10px] text-[#8E9AAF] mt-0.5">
            Configure o seu acesso ao sistema de gestão do condomínio
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-2">
          <Progress value={progressPercent} size="sm" />
        </div>

        {/* Step Indicators */}
        <Stepper className="justify-center gap-6 mb-2">
          <StepperItem
            step={1}
            currentStep={currentStep}
            title="Edifício"
            icon={Building2}
            isCompleted={completedSteps.has(1)}
            size="md"
            orientation="vertical"
          />
          <StepperConnector variant="line" size="md" />
          <StepperItem
            step={2}
            currentStep={currentStep}
            title="Fração"
            icon={Home}
            isCompleted={completedSteps.has(2)}
            size="md"
            orientation="vertical"
          />
          <StepperConnector variant="line" size="md" />
          <StepperItem
            step={3}
            currentStep={currentStep}
            title="Financeiro"
            icon={CreditCard}
            isCompleted={completedSteps.has(3)}
            size="md"
            orientation="vertical"
          />
        </Stepper>

        {/* Current Step Content */}
        {currentStep === 1 && (
          <JoinStep
            inviteCode={inviteCode}
            onChange={setInviteCode}
            onNext={handleJoinBuilding}
            error={joinError}
          />
        )}

        {currentStep === 2 && building && (
          <ClaimStep
            building={building}
            apartments={mockApartments}
            selectedId={selectedApartmentId}
            onSelect={setSelectedApartmentId}
            onNext={handleClaimApartment}
            onBack={() => goToStep(1)}
          />
        )}

        {currentStep === 3 && (
          <FinancialStep
            apartment={selectedApartment}
            iban={iban}
            onChange={setIban}
            onFinish={handleFinish}
            onBack={() => goToStep(2)}
          />
        )}

        {/* Completion Message */}
        {completedSteps.has(3) && (
          <Card variant="success" className="mt-2">
            <CardContent className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-[#E8F0EA] flex items-center justify-center mx-auto mb-1.5">
                <Check className="w-6 h-6 text-[#6A9B72]" />
              </div>
              <h2 className="text-[14px] font-bold text-[#343A40] mb-0.5">Tudo Pronto!</h2>
              <p className="text-[10px] text-[#8E9AAF] mb-1">
                A sua conta está configurada. Pode agora aceder ao seu painel de residente.
              </p>

              {/* Summary */}
              <div className="rounded-lg bg-[#F8F9FA] border border-[#E9ECEF] p-1.5 text-left mt-1.5">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-[#8E9AAF]">Edifício</span>
                    <span className="font-medium text-[#495057]">{building?.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-[#8E9AAF]">Fração</span>
                    <span className="font-medium text-[#495057]">{selectedApartment?.unit}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-[#8E9AAF]">IBAN</span>
                    <span className="font-medium text-[#495057]">
                      {iban ? `${iban.slice(0, 4)}...${iban.slice(-4)}` : "Não configurado"}
                    </span>
                  </div>
                </div>
              </div>

              <Button className="mt-2">
                Ir para o Painel
                <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Help Link */}
        <div className="text-center mt-2">
          <p className="text-[9px] text-[#ADB5BD]">
            Precisa de ajuda?{" "}
            <button className="text-[#8FB996] hover:underline">Contactar suporte</button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function ResidentOnboardingPage() {
  return (
    <ToastProvider>
      <ResidentOnboardingContent />
    </ToastProvider>
  )
}
