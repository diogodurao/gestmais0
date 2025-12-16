"use client"

import { useState } from "react"
import { LoginForm } from "@/features/auth/LoginForm"
import { RegisterForm } from "@/features/auth/RegisterForm"
import { Card, CardContent } from "@/components/ui/Card"

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true)

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-sm">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-semibold text-gray-900">
                        {isLogin ? "Sign In" : "Create Account"}
                    </h1>
                </div>

                <Card>
                    <CardContent>
                        {isLogin ? <LoginForm /> : <RegisterForm />}

                        <div className="mt-6 text-center border-t border-gray-100 pt-4">
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-sm text-gray-600 hover:text-black font-medium transition-colors"
                            >
                                {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
