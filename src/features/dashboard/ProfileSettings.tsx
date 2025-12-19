"use client"

import { useState } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { User, Check, Loader2, AlertCircle } from "lucide-react"
import { updateUserProfile } from "@/app/actions/user"
import { isValidNif, isValidIban, isProfileComplete } from "@/lib/validations"

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
    const [error, setError] = useState("")
    const [formData, setFormData] = useState({
        name: user.name,
        nif: user.nif || "",
        iban: user.iban || "",
    })

    const isManager = user.role === 'manager'
    const profileComplete = isProfileComplete(formData)

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (showSuccess) setShowSuccess(false)
        if (error) setError("")
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (isManager) {
            if (!formData.name.trim()) {
                setError("Name is required")
                return
            }
            if (!isValidNif(formData.nif)) {
                setError("NIF must be exactly 9 digits")
                return
            }
            if (!isValidIban(formData.iban)) {
                setError("IBAN must be exactly 25 alphanumeric characters")
                return
            }
        }

        setIsSaving(true)
        try {
            await updateUserProfile(formData)
            setShowSuccess(true)
            setTimeout(() => setShowSuccess(false), 3000)
        } catch (error) {
            console.error("Failed to update profile", error)
            setError("Failed to update profile. Please try again.")
        } finally {
            setIsSaving(false)
        }
    }

    const hasChanges = 
        formData.name !== user.name || 
        formData.nif !== (user.nif || "") || 
        formData.iban !== (user.iban || "")

    return (
        <div className="max-w-2xl">
            {isManager && !profileComplete && (
                <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                        <div>
                            <h3 className="font-semibold text-amber-900">Complete Your Profile</h3>
                            <p className="text-sm text-amber-800 mt-1">
                                You must fill in all profile fields (Name, NIF, IBAN) before you can subscribe and activate your building.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-full">
                            <User className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold">Personal Information</h2>
                            <p className="text-sm text-gray-500">
                                {isManager ? "All fields are required for managers" : "Update your personal details"}
                            </p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label={<span className="flex items-center gap-1">Full Name{isManager && <span className="text-red-500">*</span>}</span>}
                                value={formData.name}
                                onChange={e => handleChange("name", e.target.value)}
                                required={isManager}
                            />
                            <Input
                                label="Email Address"
                                value={user.email}
                                readOnly
                                className="bg-gray-50 text-gray-600 cursor-not-allowed"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Input
                                    label={<span className="flex items-center gap-1">NIF (Tax ID){isManager && <span className="text-red-500">*</span>}</span>}
                                    value={formData.nif}
                                    onChange={e => handleChange("nif", e.target.value)}
                                    placeholder="9-digit number"
                                    maxLength={9}
                                    required={isManager}
                                />
                                {formData.nif && isValidNif(formData.nif) && (
                                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                        <Check className="w-3 h-3" /> Valid NIF
                                    </p>
                                )}
                            </div>
                            <div>
                                <Input
                                    label={<span className="flex items-center gap-1">Personal IBAN{isManager && <span className="text-red-500">*</span>}</span>}
                                    value={formData.iban}
                                    onChange={e => handleChange("iban", e.target.value)}
                                    placeholder="PT50..."
                                    required={isManager}
                                />
                                {formData.iban && isValidIban(formData.iban) && (
                                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                        <Check className="w-3 h-3" /> Valid IBAN
                                    </p>
                                )}
                            </div>
                        </div>

                        <Input
                            label="Assigned Unit"
                            value={user.unitName || "No unit assigned"}
                            readOnly
                            className="bg-gray-50 text-gray-600 cursor-not-allowed max-w-xs"
                        />

                        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">Account Role</p>
                                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                {showSuccess && (
                                    <span className="flex items-center gap-1 text-sm text-green-600">
                                        <Check className="w-4 h-4" /> Saved
                                    </span>
                                )}
                                <Button type="submit" disabled={isSaving || !hasChanges}>
                                    {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : "Save Changes"}
                                </Button>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {isManager && (
                <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">Profile Completion Status</p>
                    <div className="space-y-1">
                        {[
                            { check: !!formData.name.trim(), label: "Name filled" },
                            { check: isValidNif(formData.nif), label: "Valid NIF (9 digits)" },
                            { check: isValidIban(formData.iban), label: "Valid IBAN (25 characters)" },
                        ].map(({ check, label }) => (
                            <div key={label} className="flex items-center gap-2 text-sm">
                                {check ? <Check className="w-4 h-4 text-green-600" /> : <div className="w-4 h-4 rounded-full border-2 border-gray-300" />}
                                <span className={check ? "text-green-700" : "text-gray-500"}>{label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}