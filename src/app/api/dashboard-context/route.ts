import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { getDashboardContext } from "@/app/actions/dashboard"

export async function GET() {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const data = await getDashboardContext(session)
        return NextResponse.json(data)
    } catch (error) {
        console.error("Dashboard context API error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
