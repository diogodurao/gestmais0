"use client"

import { useState, useTransition, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Building2, User, ShieldCheck } from "lucide-react"
import { Spinner } from "@/components/ui/Spinner"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { PasswordInput } from "@/components/ui/PasswordInput"
import { useToast } from "@/components/ui/Toast"
import { authClient } from "@/lib/auth-client"
import { createResidentAccountFromInvitation } from "@/lib/actions/resident-invitations"
import type { ResidentInvitation } from "@/lib/types"

interface ResidentInvitePageClientProps {
    token: string
    invitation: ResidentInvitation
}

export function ResidentInvitePageClient({
    token,
    invitation,
}: ResidentInvitePageClientProps) {
    const router = useRouter()
    const { addToast } = useToast()
    const [isPending, startTransition] = useTransition()

    // Registration form state
    const [name, setName] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [nif, setNif] = useState("")

    // Error state for existing account
    const [emailAlreadyExists, setEmailAlreadyExists] = useState(false)

    // Verification screen state
    const [isVerifying, setIsVerifying] = useState(false)
    const [verificationStep, setVerificationStep] = useState(0)
    const workDoneRef = useRef(false)
    const passwordRef = useRef("")

    const verificationMessages = [
        "A verificar dados...",
        "A configurar acesso ao edifício...",
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

    // Handle registration
    const handleRegister = () => {
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
        if (!nif || !/^\d{9}$/.test(nif)) {
            addToast({ variant: "error", title: "NIF invalido (deve ter 9 digitos)" })
            return
        }

        // Store password for client sign-in after account creation
        passwordRef.current = password

        // Show verification screen immediately
        setIsVerifying(true)

        startTransition(async () => {
            const result = await createResidentAccountFromInvitation(token, {
                name: name.trim(),
                password,
                nif,
            })

            if (result.success) {
                // Sign in on the client so the session is established
                await authClient.signIn.email({
                    email: invitation.invitedEmail,
                    password: passwordRef.current,
                })
                workDoneRef.current = true
            } else {
                // Revert to form on error
                setIsVerifying(false)
                setVerificationStep(0)

                if (result.error === "EMAIL_ALREADY_EXISTS") {
                    setEmailAlreadyExists(true)
                } else {
                    addToast({ variant: "error", title: result.error })
                }
            }
        })
    }

    // Verification / illusion screen
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

    // Existing account error screen
    if (emailAlreadyExists) {
        return (
            <div className="min-h-screen bg-pearl flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-lg border border-gray-200 p-6 text-center">
                    <h1 className="text-heading font-semibold text-gray-800 mb-2">
                        Email ja registado
                    </h1>
                    <p className="text-body text-gray-600 mb-4">
                        Este email ja esta registado na aplicacao.
                        Se ja tem conta, entre na aplicacao normalmente.
                    </p>
                    <Button
                        onClick={() => router.push("/sign-in")}
                        className="w-full"
                    >
                        Ir para login
                    </Button>
                </div>
            </div>
        )
    }

    // Registration form
    return (
        <div className="min-h-screen bg-pearl flex items-center justify-center p-4">
            <div className="max-w-lg w-full bg-white rounded-lg border border-gray-200 shadow-sm">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                        <Building2 className="w-5 h-5 text-primary" />
                        <h1 className="text-heading font-semibold text-gray-800">
                            Convite para Residente
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
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="space-y-3">
                        <p className="text-body text-gray-600 mb-2">
                            Crie a sua conta para se juntar ao edificio como residente.
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
                            <label className="text-label text-gray-500 mb-0.5 block">NIF *</label>
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

                        <Button
                            onClick={handleRegister}
                            disabled={isPending}
                            className="w-full mt-2"
                        >
                            {isPending ? "A criar conta..." : "Criar Conta"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
