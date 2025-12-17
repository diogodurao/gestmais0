"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { completeResidentProfile } from "@/app/actions/building"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardHeader, CardContent } from "@/components/ui/Card"
import { User } from "lucide-react"

type CompleteProfileFormProps = {
    userId: string
    initialName: string
}

export function CompleteProfileForm({ userId, initialName }: CompleteProfileFormProps) {
    const [name, setName] = useState(initialName || "")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) {
            setError("Name is required")
            return
        }

        setIsLoading(true)
        setError("")

        try {
            await completeResidentProfile(userId, { name })
            router.refresh()
        } catch (e) {
            setError("Failed to complete profile. Please try again.")
            setIsLoading(false)
        }
    }

    return (
        <Card className="max-w-md mx-auto mt-10">
            <CardHeader>
                <div className="flex items-center gap-2 mb-2 justify-center">
                    <div className="p-3 bg-blue-100 rounded-full">
                        <User className="w-8 h-8 text-blue-600" />
                    </div>
                </div>
                <h2 className="text-xl font-bold text-center">Complete your profile</h2>
                <p className="text-center text-gray-500 text-sm">
                    Confirm your name so we can link your unit to your personal details.
                </p>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Full name"
                        placeholder="Your name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                    {error && (
                        <p className="text-sm text-red-500 text-center">{error}</p>
                    )}
                    <Button
                        type="submit"
                        fullWidth
                        disabled={isLoading}
                    >
                        {isLoading ? "Saving..." : "Finish setup"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}

