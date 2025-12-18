"use client"

import { useState } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { User, Check, Loader2 } from "lucide-react"
import { updateUserProfile } from "@/app/actions/user"

type UserData = {
    id: string
    name: string
    email: string
    role: string
    nif?: string | null
    iban?: string | null
    unitName?: string | null
}

export function ProfileSettings({ user }: { user: UserData }) {
    const [isSaving, setIsSaving] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [formData, setFormData] = useState({
        name: user.name,
        nif: user.nif || "",
        iban: user.iban || "",
    })

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (showSuccess) setShowSuccess(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            await updateUserProfile(formData)
            setShowSuccess(true)
            setTimeout(() => setShowSuccess(false), 3000)
        } catch (error) {
            console.error("Failed to update profile", error)
            alert("Failed to update profile")
        } finally {
            setIsSaving(false)
        }
    }

    const hasChanges = 
        formData.name !== user.name || 
        formData.nif !== (user.nif || "") || 
        formData.iban !== (user.iban || "")

    const isComplete = formData.name && formData.nif && formData.iban

    return (
        <div className="max-w-2xl">
            <Card className={!isComplete ? "border-amber-200" : ""}>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded-full">
                                <User className="w-6 h-6 text-gray-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold">Personal Information</h2>
                                <p className="text-sm text-gray-500">Update your personal details</p>
                            </div>
                        </div>
                        {!isComplete && (
                            <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-100">
                                Incomplete Profile
                            </span>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Full Name"
                                value={formData.name}
                                onChange={e => handleChange("name", e.target.value)}
                                required
                            />
                            <Input
                                label="Email Address"
                                value={user.email}
                                readOnly
                                className="bg-gray-50 text-gray-600 cursor-not-allowed"
                                title="Email cannot be changed"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="NIF (Tax ID)"
                                value={formData.nif}
                                onChange={e => handleChange("nif", e.target.value)}
                                placeholder="9-digit number"
                                required
                            />
                            <Input
                                label="Personal IBAN"
                                value={formData.iban}
                                onChange={e => handleChange("iban", e.target.value)}
                                placeholder="PT50..."
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Assigned Unit"
                                value={user.unitName || "No unit assigned"}
                                readOnly
                                className="bg-gray-50 text-gray-600 cursor-not-allowed"
                                title="Units are assigned by claiming them or by the manager"
                            />
                        </div>

                        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">Account Role</p>
                                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                {showSuccess && (
                                    <span className="flex items-center gap-1 text-sm text-green-600 animate-in fade-in">
                                        <Check className="w-4 h-4" />
                                        Saved
                                    </span>
                                )}
                                <Button 
                                    type="submit" 
                                    disabled={isSaving || !hasChanges}
                                    className="min-w-[100px]"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        "Save Changes"
                                    )}
                                </Button>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
