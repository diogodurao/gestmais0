"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { joinBuilding } from "@/app/actions/building"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardHeader, CardContent } from "@/components/ui/Card"
import { Building2, AlertCircle } from "lucide-react"

export function JoinBuildingForm({ userId }: { userId: string }) {
    const [code, setCode] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        const normalizedCode = code.toLowerCase().trim()

        if (normalizedCode.length < 3) {
            setError("Please enter a valid building code")
            setIsLoading(false)
            return
        }

        try {
            await joinBuilding(userId, normalizedCode)
            router.refresh()
        } catch (e: any) {
            const message = e?.message || "Invalid building code. Please try again."
            setError(message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="max-w-md mx-auto mt-10">
            <CardHeader>
                <div className="flex items-center gap-2 mb-2 justify-center">
                    <div className="p-3 bg-blue-100 rounded-full">
                        <Building2 className="w-8 h-8 text-blue-600" />
                    </div>
                </div>
                <h2 className="text-xl font-bold text-center">Join Your Building</h2>
                <p className="text-center text-gray-500 text-sm">
                    Enter the code provided by your building manager to access your dashboard.
                </p>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        placeholder="e.g. 8k92la"
                        value={code}
                        onChange={(e) => {
                            setCode(e.target.value)
                            if (error) setError("")
                        }}
                        className="text-center text-lg tracking-widest lowercase font-mono"
                    />
                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}
                    <Button
                        type="submit"
                        fullWidth
                        disabled={isLoading || code.trim().length < 3}
                    >
                        {isLoading ? "Joining..." : "Join Building"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}