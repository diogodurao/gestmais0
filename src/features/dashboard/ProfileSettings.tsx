"use client"

import { Card, CardHeader, CardContent } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { User } from "lucide-react"

type UserData = {
    id: string
    name: string
    email: string
    role: string
    nif?: string | null
    iban?: string | null
}

export function ProfileSettings({ user }: { user: UserData }) {
    return (
        <div className="max-w-2xl">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-full">
                            <User className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold">Personal Information</h2>
                            <p className="text-sm text-gray-500">Update your personal details</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Full Name"
                            defaultValue={user.name}
                            readOnly // For now, until we add update action
                            className="bg-gray-50 text-gray-600"
                        />
                        <Input
                            label="Email Address"
                            defaultValue={user.email}
                            readOnly
                            className="bg-gray-50 text-gray-600"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="NIF (Tax ID)"
                            defaultValue={user.nif || ""}
                            placeholder="Not set"
                            readOnly
                            className="bg-gray-50 text-gray-600"
                        />
                        <Input
                            label="Personal IBAN"
                            defaultValue={user.iban || ""}
                            placeholder="Not set"
                            readOnly
                            className="bg-gray-50 text-gray-600"
                        />
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">Account Role</p>
                                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                            </div>
                            {/* <Button variant="outline" size="sm" disabled>
                                Change Password
                            </Button> */}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
