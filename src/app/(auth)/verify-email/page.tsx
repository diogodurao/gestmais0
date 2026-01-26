"use client"

import { Suspense } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/Card"
import { EmailVerificationStatus } from "@/components/auth/EmailVerificationStatus"

function VerifyEmailContent() {
    return <EmailVerificationStatus />
}

export default function VerifyEmailPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-grid px-4">
            <div className="w-full max-w-sm">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Verificação de email
                    </h1>
                </div>

                <Card>
                    <CardContent>
                        <Suspense fallback={<div className="text-center py-4 text-body text-gray-500">A verificar...</div>}>
                            <VerifyEmailContent />
                        </Suspense>

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
