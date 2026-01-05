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
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const data = await getDashboardContext(session as any)

        // Add cache headers for better performance
        // Private because it contains user-specific data
        return NextResponse.json(data, {
            headers: {
                'Cache-Control': 'private, max-age=30, stale-while-revalidate=60',
            }
        })
    } catch (error) {
        console.error("Dashboard context API error:", error)
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}
