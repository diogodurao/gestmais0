"use client"

import { Suspense } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/Card"
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm"

function ResetPasswordContent() {
    return <ResetPasswordForm />
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-grid px-4">
            <div className="w-full max-w-sm">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Nova palavra-passe
                    </h1>
                    <p className="mt-2 text-body text-gray-600">
                        Introduza a sua nova palavra-passe
                    </p>
                </div>

                <Card>
                    <CardContent>
                        <Suspense fallback={<div className="text-center py-4 text-body text-gray-500">A carregar...</div>}>
                            <ResetPasswordContent />
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
