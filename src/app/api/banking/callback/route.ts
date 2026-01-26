/**
 * Tink OAuth Callback Route
 *
 * Handles the redirect from Tink Link after user authenticates with their bank.
 * Exchanges the authorization code for tokens and redirects to the dashboard.
 */

import { NextRequest, NextResponse } from "next/server"
import { tinkService } from "@/services/tink.service"
import { getAppUrl } from "@/lib/utils"

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    const appUrl = getAppUrl()
    const dashboardUrl = `${appUrl}/dashboard/settings`

    // Handle error from Tink
    if (error) {
        console.error('[Banking Callback] Tink error:', error, errorDescription)
        const errorUrl = new URL(dashboardUrl)
        errorUrl.searchParams.set('bank_error', 'auth_failed')
        errorUrl.searchParams.set('error_message', errorDescription || 'Authentication failed')
        return NextResponse.redirect(errorUrl.toString())
    }

    // Validate required parameters
    if (!code || !state) {
        console.error('[Banking Callback] Missing code or state')
        const errorUrl = new URL(dashboardUrl)
        errorUrl.searchParams.set('bank_error', 'invalid_callback')
        return NextResponse.redirect(errorUrl.toString())
    }

    // Exchange code for tokens and complete connection
    console.log('[Banking Callback] Exchanging code for tokens...', { code: code.substring(0, 8) + '...', state: state.substring(0, 20) + '...' })
    const result = await tinkService.handleOAuthCallback(code, state)

    if (!result.success) {
        console.error('[Banking Callback] OAuth callback failed:', result.error, result.code)
        const errorUrl = new URL(dashboardUrl)
        errorUrl.searchParams.set('bank_error', 'connection_failed')
        errorUrl.searchParams.set('error_message', result.error || 'Unknown error')
        return NextResponse.redirect(errorUrl.toString())
    }

    // Success - redirect to dashboard with success message
    const successUrl = new URL(dashboardUrl)
    successUrl.searchParams.set('bank_connected', 'true')
    return NextResponse.redirect(successUrl.toString())
}
