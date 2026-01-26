/**
 * Tink Open Banking API Client
 *
 * Handles OAuth authentication and API calls to Tink's Open Banking API.
 * Following Stripe SDK pattern for consistent API interactions.
 */

import { createLogger } from "@/lib/logger"

const logger = createLogger('TinkClient')

// Tink API configuration
const TINK_API_BASE_URL = process.env.TINK_API_URL || 'https://api.tink.com'
const TINK_CLIENT_ID = process.env.TINK_CLIENT_ID
const TINK_CLIENT_SECRET = process.env.TINK_CLIENT_SECRET
const TINK_REDIRECT_URI = process.env.TINK_REDIRECT_URI

// Tink API response types
export interface TinkTokenResponse {
    access_token: string
    refresh_token: string
    token_type: string
    expires_in: number
    scope: string
}

export interface TinkAccount {
    id: string
    name: string
    type: string
    iban?: string
    balance?: {
        amount: {
            value: {
                unscaledValue: string
                scale: string
            }
            currencyCode: string
        }
    }
    availableBalance?: {
        amount: {
            value: {
                unscaledValue: string
                scale: string
            }
            currencyCode: string
        }
    }
    financialInstitutionId?: string
    identifiers?: {
        iban?: {
            iban: string
        }
    }
}

export interface TinkAccountsResponse {
    accounts: TinkAccount[]
    nextPageToken?: string
}

export interface TinkTransaction {
    id: string
    accountId: string
    amount: {
        value: {
            unscaledValue: string
            scale: string
        }
        currencyCode: string
    }
    descriptions: {
        original?: string
        display?: string
    }
    dates: {
        booked?: string
        value?: string
    }
    identifiers?: {
        providerTransactionId?: string
    }
    types?: {
        type?: string
    }
    counterparties?: {
        payer?: {
            name?: string
            identifiers?: {
                iban?: string
            }
        }
        payee?: {
            name?: string
            identifiers?: {
                iban?: string
            }
        }
    }
    status?: string
}

export interface TinkTransactionsResponse {
    transactions: TinkTransaction[]
    nextPageToken?: string
}

export interface TinkProviderConsent {
    credentialsId: string
    providerName: string
    sessionExpiryDate?: string
}

export interface TinkError {
    errorCode: string
    errorMessage: string
    details?: unknown
}

export class TinkApiError extends Error {
    constructor(
        message: string,
        public statusCode: number,
        public errorCode?: string
    ) {
        super(message)
        this.name = 'TinkApiError'
    }

    isAuthError(): boolean {
        return this.statusCode === 401 || this.statusCode === 403
    }

    isRateLimited(): boolean {
        return this.statusCode === 429
    }

    isServerError(): boolean {
        return this.statusCode >= 500
    }
}

/**
 * Tink Open Banking API Client
 *
 * Usage:
 * const tink = new TinkClient()
 * const authUrl = tink.generateAuthUrl(state, scope)
 * const tokens = await tink.exchangeCode(code)
 * const accounts = await tink.getAccounts(accessToken)
 */
export class TinkClient {
    private clientId: string
    private clientSecret: string
    private redirectUri: string
    private baseUrl: string

    constructor() {
        if (!TINK_CLIENT_ID) {
            throw new Error('TINK_CLIENT_ID is not configured')
        }
        if (!TINK_CLIENT_SECRET) {
            throw new Error('TINK_CLIENT_SECRET is not configured')
        }
        if (!TINK_REDIRECT_URI) {
            throw new Error('TINK_REDIRECT_URI is not configured')
        }

        this.clientId = TINK_CLIENT_ID
        this.clientSecret = TINK_CLIENT_SECRET
        this.redirectUri = TINK_REDIRECT_URI
        this.baseUrl = TINK_API_BASE_URL
    }

    /**
     * Generate the Tink Link URL for connecting bank accounts
     * Uses the Transactions-specific endpoint for real bank selection
     */
    generateAuthUrl(state: string, _scope: string = 'accounts:read,transactions:read'): string {
        const params = new URLSearchParams({
            client_id: this.clientId,
            redirect_uri: this.redirectUri,
            state,
            market: 'PT', // Portugal
            locale: 'pt_PT',
        })

        // Use transactions/connect-accounts endpoint for bank selection
        return `https://link.tink.com/1.0/transactions/connect-accounts?${params.toString()}`
    }

    /**
     * Exchange authorization code for access/refresh tokens
     */
    async exchangeCode(code: string): Promise<TinkTokenResponse> {
        const response = await this.makeRequest<TinkTokenResponse>('/api/v1/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                code,
                client_id: this.clientId,
                client_secret: this.clientSecret,
                grant_type: 'authorization_code',
                redirect_uri: this.redirectUri,
            }).toString(),
        })

        return response
    }

    /**
     * Refresh access token using refresh token
     */
    async refreshToken(refreshToken: string): Promise<TinkTokenResponse> {
        const response = await this.makeRequest<TinkTokenResponse>('/api/v1/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                refresh_token: refreshToken,
                client_id: this.clientId,
                client_secret: this.clientSecret,
                grant_type: 'refresh_token',
            }).toString(),
        })

        return response
    }

    /**
     * Get all connected bank accounts
     */
    async getAccounts(accessToken: string): Promise<TinkAccount[]> {
        const accounts: TinkAccount[] = []
        let pageToken: string | undefined

        do {
            const params = pageToken ? `?pageToken=${pageToken}` : ''
            const response = await this.makeRequest<TinkAccountsResponse>(
                `/data/v2/accounts${params}`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    },
                }
            )

            logger.info('Tink accounts API raw response', { response: JSON.stringify(response) })

            if (response.accounts) {
                accounts.push(...response.accounts)
            }
            pageToken = response.nextPageToken
        } while (pageToken)

        return accounts
    }

    /**
     * Get transactions for a specific account
     */
    async getTransactions(
        accessToken: string,
        accountId: string,
        fromDate?: string,
        toDate?: string
    ): Promise<TinkTransaction[]> {
        const transactions: TinkTransaction[] = []
        let pageToken: string | undefined

        do {
            const params = new URLSearchParams()
            params.set('accountIdIn', accountId)
            if (fromDate) params.set('bookedDateGte', fromDate)
            if (toDate) params.set('bookedDateLte', toDate)
            if (pageToken) params.set('pageToken', pageToken)

            const response = await this.makeRequest<TinkTransactionsResponse>(
                `/data/v2/transactions?${params.toString()}`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    },
                }
            )

            transactions.push(...response.transactions)
            pageToken = response.nextPageToken
        } while (pageToken)

        return transactions
    }

    /**
     * Get all transactions for all accounts
     */
    async getAllTransactions(
        accessToken: string,
        fromDate?: string,
        toDate?: string
    ): Promise<TinkTransaction[]> {
        const transactions: TinkTransaction[] = []
        let pageToken: string | undefined

        do {
            const params = new URLSearchParams()
            if (fromDate) params.set('bookedDateGte', fromDate)
            if (toDate) params.set('bookedDateLte', toDate)
            if (pageToken) params.set('pageToken', pageToken)

            const response = await this.makeRequest<TinkTransactionsResponse>(
                `/data/v2/transactions?${params.toString()}`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    },
                }
            )

            transactions.push(...response.transactions)
            pageToken = response.nextPageToken
        } while (pageToken)

        return transactions
    }

    /**
     * Revoke the user's consent (disconnect bank)
     */
    async revokeConsent(accessToken: string): Promise<void> {
        await this.makeRequest('/api/v1/credentials/revoke', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        })
    }

    /**
     * Get provider consent info (connection status)
     */
    async getProviderConsents(accessToken: string): Promise<TinkProviderConsent[]> {
        const response = await this.makeRequest<{ providerConsents: TinkProviderConsent[] }>(
            '/api/v1/provider-consents',
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            }
        )

        return response.providerConsents || []
    }

    /**
     * Make an authenticated request to the Tink API
     */
    private async makeRequest<T>(
        endpoint: string,
        options: RequestInit
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`

        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Accept': 'application/json',
                    ...options.headers,
                },
            })

            if (!response.ok) {
                const errorBody = await response.text()
                let errorMessage = `Tink API error: ${response.status}`
                let errorCode: string | undefined

                try {
                    const errorJson = JSON.parse(errorBody) as TinkError
                    errorMessage = errorJson.errorMessage || errorMessage
                    errorCode = errorJson.errorCode
                } catch {
                    errorMessage = errorBody || errorMessage
                }

                logger.error('Tink API request failed', {
                    method: options.method,
                    endpoint,
                    status: response.status,
                    errorCode,
                    errorMessage,
                })

                throw new TinkApiError(errorMessage, response.status, errorCode)
            }

            // Handle empty responses
            const contentType = response.headers.get('content-type')
            if (!contentType?.includes('application/json')) {
                return {} as T
            }

            return await response.json() as T
        } catch (error) {
            if (error instanceof TinkApiError) {
                throw error
            }

            logger.error('Tink API request failed', { endpoint }, error)
            throw new TinkApiError(
                error instanceof Error ? error.message : 'Unknown error',
                500
            )
        }
    }
}

// Helper functions to convert Tink amounts to cents
export function tinkAmountToCents(amount: TinkTransaction['amount']): number {
    const unscaledValue = parseInt(amount.value.unscaledValue, 10)
    const scale = parseInt(amount.value.scale, 10)
    // Convert to cents (scale of 2 = already in cents, scale of 0 = euros)
    const multiplier = Math.pow(10, 2 - scale)
    return Math.round(unscaledValue * multiplier)
}

export function tinkBalanceToCents(balance: TinkAccount['balance']): number | null {
    if (!balance?.amount) return null
    return tinkAmountToCents(balance.amount as TinkTransaction['amount'])
}

// Export singleton instance
export const tink = new TinkClient()
