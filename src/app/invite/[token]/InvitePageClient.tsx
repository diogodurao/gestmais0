"use client"

import { useState, useTransition, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Briefcase, Building2, User, LogIn, LogOut, ShieldCheck } from "lucide-react"
import { Spinner } from "@/components/ui/Spinner"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { PasswordInput } from "@/components/ui/PasswordInput"
import { useToast } from "@/components/ui/Toast"
import { authClient } from "@/lib/auth-client"
import {
    createAccountAndAcceptInvitation,
    acceptInvitationWithExistingAccount
} from "@/lib/actions/invite"
import type { ProfessionalInvitation, ProfessionalType } from "@/lib/types"

const PROFESSIONAL_TYPE_LABELS: Record<ProfessionalType, string> = {
    accountant: "Contabilista",
    lawyer: "Advogado",
    consultant: "Consultor",
}

interface InvitePageClientProps {
    token: string
    invitation: ProfessionalInvitation
    currentUserEmail: string | null
    isLoggedIn: boolean
}

export function InvitePageClient({
    token,
    invitation,
    currentUserEmail,
    isLoggedIn,
}: InvitePageClientProps) {
    const router = useRouter()
    const { addToast } = useToast()
    const [isPending, startTransition] = useTransition()

    // Registration form state
    const [name, setName] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [professionalId, setProfessionalId] = useState("")
    const [nif, setNif] = useState("")
    const [phone, setPhone] = useState("")
    const [companyName, setCompanyName] = useState("")

    // Login mode (for when account already exists)
    const [showLogin, setShowLogin] = useState(false)
    const [loginPassword, setLoginPassword] = useState("")

    // Verification screen state
    const [isVerifying, setIsVerifying] = useState(false)
    const [verificationStep, setVerificationStep] = useState(0)
    const workDoneRef = useRef(false)

    const verificationMessages = [
        "A verificar dados...",
        "A validar cedula profissional...",
        "A configurar acesso ao edificio...",
        "Quase pronto...",
    ]

    useEffect(() => {
        if (!isVerifying) return

        if (verificationStep < verificationMessages.length - 1) {
            const timeout = setTimeout(() => {
                setVerificationStep((s) => s + 1)
            }, 1000)
            return () => clearTimeout(timeout)
        }

        // Final step — wait for work to finish, then redirect
        const interval = setInterval(() => {
            if (workDoneRef.current) {
                clearInterval(interval)
                router.push("/dashboard")
            }
        }, 300)
        return () => clearInterval(interval)
    }, [isVerifying, verificationStep, verificationMessages.length, router])

    const typeLabel = PROFESSIONAL_TYPE_LABELS[invitation.professionalType]
    const emailsMatch = currentUserEmail?.toLowerCase() === invitation.invitedEmail.toLowerCase()

    // Handle registration + accept
    const handleRegisterAndAccept = () => {
        if (!name.trim()) {
            addToast({ variant: "error", title: "Introduza o seu nome" })
            return
        }
        if (!password || password.length < 8) {
            addToast({ variant: "error", title: "A password deve ter pelo menos 8 caracteres" })
            return
        }
        if (password !== confirmPassword) {
            addToast({ variant: "error", title: "As passwords nao coincidem" })
            return
        }
        const cedulaRegex = invitation.professionalType === "accountant"
            ? /^\d{2,6}$/
            : /^\d{5,6}[A-Za-z]?$/
        if (!professionalId || !cedulaRegex.test(professionalId)) {
            addToast({ variant: "error", title: "Formato de cedula profissional invalido" })
            return
        }
        if (!phone.trim()) {
            addToast({ variant: "error", title: "Introduza o seu telefone" })
            return
        }

        // Show verification screen immediately — work runs in parallel with animation
        setIsVerifying(true)

        startTransition(async () => {
            const result = await createAccountAndAcceptInvitation(token, {
                name: name.trim(),
                email: invitation.invitedEmail,
                password,
                professionalId,
                professionalType: invitation.professionalType,
                phone: phone.trim(),
                nif: nif.trim() || undefined,
                companyName: companyName.trim() || undefined,
            })

            if (result.success) {
                // Sign in on the client so the session is established
                await authClient.signIn.email({
                    email: invitation.invitedEmail,
                    password,
                })
                workDoneRef.current = true
            } else {
                // Revert to form on error
                setIsVerifying(false)
                setVerificationStep(0)

                // If account already exists, switch to login mode
                if (result.error?.includes("Já existe uma conta")) {
                    setShowLogin(true)
                    addToast({ variant: "info", title: "Já tem conta. Introduza a password para entrar." })
                } else {
                    addToast({ variant: "error", title: result.error })
                }
            }
        })
    }

    // Handle accept with existing account
    const handleAcceptWithExistingAccount = () => {
        startTransition(async () => {
            const result = await acceptInvitationWithExistingAccount(token)

            if (result.success) {
                addToast({ variant: "success", title: "Convite aceite com sucesso!" })
                router.push("/dashboard")
            } else {
                addToast({ variant: "error", title: result.error })
            }
        })
    }

    // Handle login + accept (for when account already exists)
    const handleLoginAndAccept = () => {
        if (!loginPassword || loginPassword.length < 8) {
            addToast({ variant: "error", title: "Introduza a sua password" })
            return
        }

        startTransition(async () => {
            const signInResult = await authClient.signIn.email({
                email: invitation.invitedEmail,
                password: loginPassword,
            })

            if (signInResult.error) {
                addToast({ variant: "error", title: "Password incorreta" })
                return
            }

            const result = await acceptInvitationWithExistingAccount(token)

            if (result.success) {
                addToast({ variant: "success", title: "Convite aceite com sucesso!" })
                router.push("/dashboard")
            } else {
                addToast({ variant: "error", title: result.error })
            }
        })
    }

    if (isVerifying) {
        return (
            <div className="min-h-screen bg-pearl flex flex-col items-center justify-center p-4">
                <div className="flex flex-col items-center gap-5">
                    <div className="relative">
                        <Spinner size="lg" className="text-primary" />
                    </div>
                    <div className="text-center space-y-2">
                        <p className="text-heading font-semibold text-gray-800">
                            {verificationMessages[verificationStep]}
                        </p>
                        <div className="flex items-center justify-center gap-1.5 text-label text-gray-400">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Verificacao automatica em curso</span>
                        </div>
                    </div>
                    {/* Progress dots */}
                    <div className="flex items-center gap-1.5">
                        {verificationMessages.map((_, i) => (
                            <div
                                key={i}
                                className={`h-1.5 rounded-full transition-all duration-300 ${i <= verificationStep
                                        ? "w-6 bg-primary"
                                        : "w-1.5 bg-gray-200"
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-pearl flex items-center justify-center p-4">
            <div className="max-w-lg w-full bg-white rounded-lg border border-gray-200 shadow-sm">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                        <Briefcase className="w-5 h-5 text-primary" />
                        <h1 className="text-heading font-semibold text-gray-800">
                            Convite para Profissional Externo
                        </h1>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Building2 className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-body text-gray-600">
                                Edificio: <strong>{invitation.buildingName}</strong>
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <User className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-body text-gray-600">
                                Convidado por: <strong>{invitation.invitedByUserName}</strong>
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-body text-gray-600">
                                Funcao: <strong>{typeLabel}</strong>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {isLoggedIn && emailsMatch ? (
                        // User is logged in and email matches
                        <div className="space-y-4">
                            <p className="text-body text-gray-600">
                                Esta autenticado com o email <strong>{currentUserEmail}</strong>.
                                Clique no botao abaixo para aceitar o convite.
                            </p>
                            <Button
                                onClick={handleAcceptWithExistingAccount}
                                disabled={isPending}
                                className="w-full"
                            >
                                {isPending ? "A aceitar..." : "Aceitar Convite"}
                            </Button>
                        </div>
                    ) : isLoggedIn && !emailsMatch ? (
                        // User is logged in but email doesn't match
                        <div className="space-y-4">
                            <div className="p-3 rounded-lg bg-error-light border border-error">
                                <p className="text-body text-gray-700">
                                    Esta autenticado com o email <strong>{currentUserEmail}</strong>,
                                    mas este convite foi enviado para <strong>{invitation.invitedEmail}</strong>.
                                </p>
                                <p className="text-label text-gray-500 mt-1">
                                    Termine sessao para criar uma nova conta com o email do convite.
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                className="w-full"
                                disabled={isPending}
                                onClick={() => {
                                    startTransition(async () => {
                                        await authClient.signOut()
                                        router.refresh()
                                    })
                                }}
                            >
                                <LogOut className="w-3.5 h-3.5 mr-1" />
                                Terminar Sessao e Continuar
                            </Button>
                        </div>
                    ) : showLogin ? (
                        // Not logged in, account exists - show login form
                        <div className="space-y-3">
                            <p className="text-body text-gray-600 mb-2">
                                Introduza a sua password para entrar e aceitar o convite.
                            </p>

                            <div>
                                <label className="text-label text-gray-500 mb-0.5 block">Email</label>
                                <Input
                                    type="email"
                                    value={invitation.invitedEmail}
                                    disabled
                                    className="bg-gray-50"
                                />
                            </div>

                            <div>
                                <label className="text-label text-gray-500 mb-0.5 block">Password *</label>
                                <PasswordInput
                                    placeholder="A sua password"
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                    disabled={isPending}
                                />
                            </div>

                            <Button
                                onClick={handleLoginAndAccept}
                                disabled={isPending}
                                className="w-full mt-2"
                            >
                                <LogIn className="w-3.5 h-3.5 mr-1" />
                                {isPending ? "A entrar..." : "Entrar e Aceitar Convite"}
                            </Button>

                            <p className="text-label text-gray-400 text-center mt-2">
                                Nao tem conta?{" "}
                                <button
                                    type="button"
                                    onClick={() => setShowLogin(false)}
                                    className="text-primary hover:underline"
                                >
                                    Criar conta
                                </button>
                            </p>
                        </div>
                    ) : (
                        // Not logged in - show registration form
                        <div className="space-y-3">
                            <p className="text-body text-gray-600 mb-2">
                                Crie a sua conta para aceitar o convite e aceder ao painel do edificio.
                            </p>

                            <div>
                                <label className="text-label text-gray-500 mb-0.5 block">Nome *</label>
                                <Input
                                    type="text"
                                    placeholder="O seu nome completo"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    disabled={isPending}
                                />
                            </div>

                            <div>
                                <label className="text-label text-gray-500 mb-0.5 block">Email</label>
                                <Input
                                    type="email"
                                    value={invitation.invitedEmail}
                                    disabled
                                    className="bg-gray-50"
                                />
                            </div>

                            <div>
                                <label className="text-label text-gray-500 mb-0.5 block">Password *</label>
                                <PasswordInput
                                    placeholder="Minimo 8 caracteres"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isPending}
                                />
                            </div>

                            <div>
                                <label className="text-label text-gray-500 mb-0.5 block">Confirmar Password *</label>
                                <PasswordInput
                                    placeholder="Repita a password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    disabled={isPending}
                                />
                            </div>

                            <div>
                                <label className="text-label text-gray-500 mb-0.5 block">Cedula Profissional *</label>
                                <Input
                                    type="text"
                                    placeholder={invitation.professionalType === "accountant" ? "75364" : "40785P"}
                                    value={professionalId}
                                    onChange={(e) => setProfessionalId(e.target.value)}
                                    disabled={isPending}
                                    maxLength={invitation.professionalType === "accountant" ? 6 : 7}
                                />
                                <p className="text-label text-gray-400 mt-0.5">
                                    A cedula sera verificada computacionalmente.
                                </p>
                            </div>

                            <div>
                                <label className="text-label text-gray-500 mb-0.5 block">NIF</label>
                                <Input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="206578465"
                                    value={nif}
                                    onChange={(e) => setNif(e.target.value.replace(/\D/g, ""))}
                                    disabled={isPending}
                                    maxLength={9}
                                />
                            </div>

                            <div>
                                <label className="text-label text-gray-500 mb-0.5 block">Telefone *</label>
                                <Input
                                    type="tel"
                                    inputMode="numeric"
                                    placeholder="912345678"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                                    disabled={isPending}
                                    maxLength={9}
                                />
                            </div>

                            <div>
                                <label className="text-label text-gray-500 mb-0.5 block">Nome da Empresa (opcional)</label>
                                <Input
                                    type="text"
                                    placeholder="Nome da empresa ou sociedade"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    disabled={isPending}
                                />
                            </div>

                            <Button
                                onClick={handleRegisterAndAccept}
                                disabled={isPending}
                                className="w-full mt-2"
                            >
                                {isPending ? "A criar conta..." : "Criar Conta e Aceitar Convite"}
                            </Button>

                            <p className="text-label text-gray-400 text-center mt-2">
                                Ja tem conta?{" "}
                                <button
                                    type="button"
                                    onClick={() => setShowLogin(true)}
                                    className="text-primary hover:underline"
                                >
                                    Faca login
                                </button>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
