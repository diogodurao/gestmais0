"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/Card"
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm"
import { Alert } from "@/components/ui/Alert"

export default function ForgotPasswordPage() {
    const [emailSent, setEmailSent] = useState(false)

    return (
        <div className="min-h-screen flex items-center justify-center bg-grid px-4">
            <div className="w-full max-w-sm">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Recuperar palavra-passe
                    </h1>
                    <p className="mt-2 text-body text-gray-600">
                        {emailSent
                            ? "Verifique o seu email"
                            : "Introduza o seu email para receber um link de recuperação"}
                    </p>
                </div>

                <Card>
                    <CardContent>
                        {emailSent ? (
                            <div className="space-y-4">
                                <Alert variant="success">
                                    Se existir uma conta com este email, receberá instruções para redefinir a sua palavra-passe.
                                </Alert>
                                <p className="text-body text-gray-600 text-center">
                                    Não recebeu o email? Verifique a pasta de spam ou{" "}
                                    <button
                                        onClick={() => setEmailSent(false)}
                                        className="text-primary hover:underline font-medium"
                                    >
                                        tente novamente
                                    </button>
                                </p>
                            </div>
                        ) : (
                            <ForgotPasswordForm onSuccess={() => setEmailSent(true)} />
                        )}

                        <div className="mt-6 text-center border-t border-gray-100 pt-4">
                            <Link
                                href="/sign-in"
                                className="text-sm text-gray-600 hover:text-black font-medium transition-colors"
                            >
                                Voltar para o login
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
