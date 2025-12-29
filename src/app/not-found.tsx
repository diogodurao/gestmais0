
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { AlertCircle } from "lucide-react"

export default function NotFound() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full p-8 text-center space-y-6 shadow-xl border-slate-200">
                <div className="flex justify-center">
                    <div className="p-4 bg-slate-100 rounded-full">
                        <AlertCircle className="w-12 h-12 text-slate-400" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-4xl font-bold text-slate-900 tracking-tight">404</h1>
                    <h2 className="text-lg font-semibold text-slate-700 uppercase tracking-wide">Page Not Found</h2>
                    <p className="text-sm text-slate-500">
                        The page you are looking for does not exist or has been moved.
                    </p>
                </div>

                <div className="pt-4">
                    <Link href="/dashboard">
                        <Button className="w-full">
                            Return to Dashboard
                        </Button>
                    </Link>
                </div>
            </Card>
        </div>
    )
}
