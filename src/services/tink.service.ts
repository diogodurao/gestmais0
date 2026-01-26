/**
 * Tink Open Banking Service
 *
 * Business logic for bank connections, account sync, and transaction matching.
 * Uses dependency injection for better testability.
 */

import { db as defaultDb } from "@/db"
import {
    bankConnections,
    bankAccounts,
    bankTransactions,
    residentIbans,
    apartments,
    payments,
} from "@/db/schema"
import { eq, and, inArray } from "drizzle-orm"
import {
    tink as defaultTinkClient,
    tinkAmountToCents,
    tinkBalanceToCents,
    TinkTransaction,
    TinkApiError,
    TinkClient,
} from "@/lib/tink"
import { createLogger, Logger } from "@/lib/logger"
import {
    ActionResult,
    Ok,
    Err,
    ErrorCodes,
    BankConnectionStatus,
    BankConnectionSummary,
    UnmatchedTransaction,
} from "@/lib/types"

const defaultLogger = createLogger('TinkService')

export interface OAuthState {
    buildingId: string
    userId: string
    timestamp: number
}

/**
 * Dependencies for TinkService - allows injection for testing
 */
export interface TinkServiceDependencies {
    db: typeof defaultDb
    tinkClient: TinkClient
    logger: Logger
}

export class TinkService {
    private db: typeof defaultDb
    private tinkClient: TinkClient
    private logger: Logger

    constructor(deps?: Partial<TinkServiceDependencies>) {
        this.db = deps?.db ?? defaultDb
        this.tinkClient = deps?.tinkClient ?? defaultTinkClient
        this.logger = deps?.logger ?? defaultLogger
    }
    /**
     * Generate OAuth URL for connecting a bank account
     * Returns the Tink Link URL and the encoded state
     */
    async initiateBankConnection(
        buildingId: string,
        userId: string
    ): Promise<ActionResult<{ authUrl: string; state: string }>> {
        try {
            // Check if building already has a connection
            const existingConnection = await this.db.query.bankConnections.findFirst({
                where: eq(bankConnections.buildingId, buildingId),
            })

            if (existingConnection?.status === 'active') {
                return Err('Este condomínio já tem uma conta bancária ligada', ErrorCodes.BANK_CONNECTION_ERROR)
            }

            // Create state for OAuth callback
            const state: OAuthState = {
                buildingId,
                userId,
                timestamp: Date.now(),
            }
            const encodedState = Buffer.from(JSON.stringify(state)).toString('base64url')

            // Generate auth URL
            const authUrl = this.tinkClient.generateAuthUrl(encodedState)

            // Create or update pending connection
            if (existingConnection) {
                await this.db.update(bankConnections)
                    .set({
                        status: 'pending',
                        lastError: null,
                        updatedAt: new Date(),
                    })
                    .where(eq(bankConnections.id, existingConnection.id))
            } else {
                await this.db.insert(bankConnections).values({
                    buildingId,
                    status: 'pending',
                    createdBy: userId,
                })
            }

            return Ok({ authUrl, state: encodedState })
        } catch (error) {
            this.logger.error('Failed to initiate bank connection', { method: 'initiateBankConnection', buildingId }, error)
            return Err('Falha ao iniciar ligação bancária', ErrorCodes.BANK_CONNECTION_ERROR)
        }
    }

    /**
     * Handle OAuth callback - exchange code for tokens and store them
     */
    async handleOAuthCallback(
        code: string,
        state: string
    ): Promise<ActionResult<{ buildingId: string }>> {
        try {
            // Decode and validate state
            let parsedState: OAuthState
            try {
                const decoded = Buffer.from(state, 'base64url').toString('utf-8')
                parsedState = JSON.parse(decoded) as OAuthState
            } catch {
                return Err('Estado OAuth inválido', ErrorCodes.VALIDATION_FAILED)
            }

            const { buildingId, userId } = parsedState

            // Check state freshness (15 minutes max)
            const stateAge = Date.now() - parsedState.timestamp
            if (stateAge > 15 * 60 * 1000) {
                return Err('O link de autenticação expirou', ErrorCodes.BANK_CONNECTION_EXPIRED)
            }

            // Exchange code for tokens
            this.logger.info('Exchanging code for tokens', { method: 'handleOAuthCallback', buildingId })
            const tokens = await this.tinkClient.exchangeCode(code)
            this.logger.info('Token exchange successful', { method: 'handleOAuthCallback', buildingId })

            // Get provider info (optional - may not be available in sandbox)
            let providerName: string | null = null
            try {
                const providerConsents = await this.tinkClient.getProviderConsents(tokens.access_token)
                providerName = providerConsents[0]?.providerName || null
            } catch (e) {
                this.logger.warn('Could not fetch provider consents (may not be available in sandbox)', { method: 'handleOAuthCallback' })
            }

            // Calculate token expiry
            const tokenExpiresAt = new Date(Date.now() + tokens.expires_in * 1000)

            // Update connection with tokens
            await this.db.update(bankConnections)
                .set({
                    accessToken: tokens.access_token,
                    refreshToken: tokens.refresh_token,
                    tokenExpiresAt,
                    providerName,
                    status: 'active',
                    lastError: null,
                    updatedAt: new Date(),
                    createdBy: userId,
                })
                .where(eq(bankConnections.buildingId, buildingId))

            // Sync accounts immediately
            await this.syncAccounts(buildingId)

            this.logger.info('Bank connection established', { method: 'handleOAuthCallback', buildingId, providerName })

            return Ok({ buildingId })
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error'
            this.logger.error('OAuth callback failed', { method: 'handleOAuthCallback', errorMessage }, error)
            return Err(`Falha na autenticação bancária: ${errorMessage}`, ErrorCodes.BANK_CONNECTION_ERROR)
        }
    }

    /**
     * Sync bank accounts from Tink
     */
    async syncAccounts(buildingId: string): Promise<ActionResult<number>> {
        try {
            const connection = await this.getValidConnection(buildingId)
            if (!connection.success) return connection

            const { accessToken, connectionId } = connection.data

            // Fetch accounts from Tink
            this.logger.info('Fetching accounts from Tink', { method: 'syncAccounts', buildingId })
            const tinkAccounts = await this.tinkClient.getAccounts(accessToken)
            this.logger.info('Tink accounts response', { method: 'syncAccounts', buildingId, accountCount: tinkAccounts.length, accounts: JSON.stringify(tinkAccounts) })

            // Upsert accounts
            for (const account of tinkAccounts) {
                const iban = account.identifiers?.iban?.iban || account.iban || null
                const balance = tinkBalanceToCents(account.balance)
                const availableBalance = tinkBalanceToCents(account.availableBalance)

                const existingAccount = await this.db.query.bankAccounts.findFirst({
                    where: eq(bankAccounts.tinkAccountId, account.id),
                })

                if (existingAccount) {
                    await this.db.update(bankAccounts)
                        .set({
                            name: account.name,
                            iban,
                            balance,
                            availableBalance,
                            currency: account.balance?.amount?.currencyCode || 'EUR',
                            accountType: account.type,
                            lastSyncAt: new Date(),
                            updatedAt: new Date(),
                        })
                        .where(eq(bankAccounts.id, existingAccount.id))
                } else {
                    await this.db.insert(bankAccounts).values({
                        connectionId,
                        buildingId,
                        tinkAccountId: account.id,
                        name: account.name,
                        iban,
                        balance,
                        availableBalance,
                        currency: account.balance?.amount?.currencyCode || 'EUR',
                        accountType: account.type,
                        lastSyncAt: new Date(),
                    })
                }
            }

            // Update connection last sync time
            await this.db.update(bankConnections)
                .set({ lastSyncAt: new Date(), updatedAt: new Date() })
                .where(eq(bankConnections.buildingId, buildingId))

            this.logger.info('Accounts synced', { method: 'syncAccounts', buildingId, accountCount: tinkAccounts.length })

            return Ok(tinkAccounts.length)
        } catch (error) {
            this.logger.error('Failed to sync accounts', { method: 'syncAccounts', buildingId }, error)

            await this.handleConnectionError(buildingId, error)

            return Err('Falha ao sincronizar contas', ErrorCodes.BANK_SYNC_FAILED)
        }
    }

    /**
     * Sync transactions from Tink
     * Returns partial success info including any accounts that failed to sync
     * Uses batch operations with database transactions for atomicity
     */
    async syncTransactions(
        buildingId: string,
        fromDate?: string,
        toDate?: string
    ): Promise<ActionResult<{ synced: number; matched: number; failedAccounts: number[] }>> {
        try {
            const connection = await this.getValidConnection(buildingId)
            if (!connection.success) return connection

            const { accessToken } = connection.data

            // Get all accounts for this building
            const accounts = await this.db.query.bankAccounts.findMany({
                where: eq(bankAccounts.buildingId, buildingId),
            })

            if (accounts.length === 0) {
                return Err('Nenhuma conta bancária encontrada', ErrorCodes.BANK_ACCOUNT_NOT_FOUND)
            }

            let totalSynced = 0
            let totalMatched = 0
            const failedAccounts: number[] = []

            // Sync transactions for each account
            for (const account of accounts) {
                if (!account.tinkAccountId) continue

                try {
                    const tinkTxs = await this.tinkClient.getTransactions(
                        accessToken,
                        account.tinkAccountId,
                        fromDate,
                        toDate
                    )

                    // Batch sync transactions for this account
                    const result = await this.batchSyncAccountTransactions(
                        account.id,
                        buildingId,
                        tinkTxs
                    )
                    totalSynced += result.synced
                    totalMatched += result.matched
                } catch (accountError) {
                    const errorMsg = accountError instanceof Error ? accountError.message : 'Unknown error'
                    this.logger.warn('Failed to sync transactions for account', {
                        method: 'syncTransactions',
                        buildingId,
                        accountId: account.id,
                        tinkAccountId: account.tinkAccountId,
                        error: errorMsg,
                    })
                    failedAccounts.push(account.id)

                    // If it's an auth error, handle it and stop processing
                    if (accountError instanceof TinkApiError && accountError.isAuthError()) {
                        await this.handleConnectionError(buildingId, accountError)
                        return Err('Falha na autenticação bancária', ErrorCodes.BANK_CONNECTION_EXPIRED)
                    }
                    // For other errors (rate limit, server errors), continue with other accounts
                }
            }

            // Update connection last sync time
            await this.db.update(bankConnections)
                .set({ lastSyncAt: new Date(), updatedAt: new Date() })
                .where(eq(bankConnections.buildingId, buildingId))

            this.logger.info('Transactions synced', {
                method: 'syncTransactions',
                buildingId,
                synced: totalSynced,
                matched: totalMatched,
                failedAccounts: failedAccounts.length,
            })

            return Ok({ synced: totalSynced, matched: totalMatched, failedAccounts })
        } catch (error) {
            this.logger.error('Failed to sync transactions', { method: 'syncTransactions', buildingId }, error)

            await this.handleConnectionError(buildingId, error)

            return Err('Falha ao sincronizar transações', ErrorCodes.BANK_SYNC_FAILED)
        }
    }

    /**
     * Batch sync transactions for a single account using database transaction
     * - Pre-fetches existing transaction IDs in one query
     * - Batch inserts all new transactions atomically
     */
    private async batchSyncAccountTransactions(
        accountId: number,
        buildingId: string,
        tinkTxs: TinkTransaction[]
    ): Promise<{ synced: number; matched: number }> {
        if (tinkTxs.length === 0) {
            return { synced: 0, matched: 0 }
        }

        // Pre-fetch existing transaction IDs in one query
        const tinkTxIds = tinkTxs.map(tx => tx.id)
        const existingTxs = await this.db.query.bankTransactions.findMany({
            where: and(
                eq(bankTransactions.accountId, accountId),
                inArray(bankTransactions.tinkTransactionId, tinkTxIds)
            ),
            columns: { tinkTransactionId: true, matchStatus: true },
        })
        const existingTxIdSet = new Set(existingTxs.map(tx => tx.tinkTransactionId))

        // Filter to only new transactions
        const newTinkTxs = tinkTxs.filter(tx => !existingTxIdSet.has(tx.id))

        if (newTinkTxs.length === 0) {
            return { synced: 0, matched: 0 }
        }

        // Prepare batch insert data with IBAN matching
        const transactionsToInsert: typeof bankTransactions.$inferInsert[] = []
        let matchedCount = 0

        for (const tx of newTinkTxs) {
            const amount = tinkAmountToCents(tx.amount)
            const type = amount >= 0 ? 'credit' : 'debit'

            const counterpartyIban = type === 'credit'
                ? tx.counterparties?.payer?.identifiers?.iban
                : tx.counterparties?.payee?.identifiers?.iban

            const counterpartyName = type === 'credit'
                ? tx.counterparties?.payer?.name
                : tx.counterparties?.payee?.name

            // Attempt IBAN matching for credits only
            let matchedApartmentId: number | null = null
            let matchStatus: 'unmatched' | 'matched' | 'ignored' = 'unmatched'

            if (type === 'credit' && counterpartyIban) {
                const matchResult = await this.matchIbanToApartment(buildingId, counterpartyIban)
                if (matchResult) {
                    matchedApartmentId = matchResult.apartmentId
                    matchStatus = 'matched'
                    matchedCount++
                }
            }

            transactionsToInsert.push({
                accountId,
                buildingId,
                tinkTransactionId: tx.id,
                amount: Math.abs(amount),
                type,
                description: tx.descriptions?.display || null,
                originalDescription: tx.descriptions?.original || null,
                transactionDate: tx.dates?.booked || tx.dates?.value || new Date().toISOString().split('T')[0],
                bookingDate: tx.dates?.booked || null,
                counterpartyName: counterpartyName || null,
                counterpartyIban: counterpartyIban || null,
                matchedApartmentId,
                matchStatus,
            })
        }

        // Batch insert within a database transaction for atomicity
        await this.db.transaction(async (tx) => {
            // Insert in batches of 100 to avoid query size limits
            const BATCH_SIZE = 100
            for (let i = 0; i < transactionsToInsert.length; i += BATCH_SIZE) {
                const batch = transactionsToInsert.slice(i, i + BATCH_SIZE)
                await tx.insert(bankTransactions).values(batch)
            }
        })

        this.logger.info('Batch synced account transactions', {
            method: 'batchSyncAccountTransactions',
            accountId,
            buildingId,
            total: tinkTxs.length,
            existing: existingTxIdSet.size,
            inserted: transactionsToInsert.length,
            matched: matchedCount,
        })

        return { synced: transactionsToInsert.length, matched: matchedCount }
    }

    /**
     * Match IBAN to an apartment via resident_ibans table
     */
    private async matchIbanToApartment(
        buildingId: string,
        iban: string
    ): Promise<{ apartmentId: number } | null> {
        // Normalize IBAN (remove spaces, uppercase)
        const normalizedIban = iban.replace(/\s/g, '').toUpperCase()

        // Look up in resident_ibans joined with apartments
        const result = await this.db
            .select({
                apartmentId: residentIbans.apartmentId,
            })
            .from(residentIbans)
            .innerJoin(apartments, eq(residentIbans.apartmentId, apartments.id))
            .where(
                and(
                    eq(apartments.buildingId, buildingId),
                    eq(residentIbans.iban, normalizedIban)
                )
            )
            .limit(1)

        return result[0] || null
    }

    /**
     * Run IBAN matching for all unmatched transactions
     */
    async matchTransactionsByIban(buildingId: string): Promise<ActionResult<number>> {
        try {
            // Get all unmatched credit transactions
            const unmatched = await this.db.query.bankTransactions.findMany({
                where: and(
                    eq(bankTransactions.buildingId, buildingId),
                    eq(bankTransactions.matchStatus, 'unmatched'),
                    eq(bankTransactions.type, 'credit')
                ),
            })

            let matchedCount = 0

            for (const tx of unmatched) {
                if (!tx.counterpartyIban) continue

                const match = await this.matchIbanToApartment(buildingId, tx.counterpartyIban)
                if (match) {
                    await this.db.update(bankTransactions)
                        .set({
                            matchedApartmentId: match.apartmentId,
                            matchStatus: 'matched',
                        })
                        .where(eq(bankTransactions.id, tx.id))

                    matchedCount++
                }
            }

            this.logger.info('IBAN matching completed', { method: 'matchTransactionsByIban', buildingId, matchedCount })

            return Ok(matchedCount)
        } catch (error) {
            this.logger.error('Failed to match transactions', { method: 'matchTransactionsByIban', buildingId }, error)
            return Err('Falha ao associar transações', ErrorCodes.INTERNAL_ERROR)
        }
    }

    /**
     * Get connection status for a building
     */
    async getConnectionStatus(buildingId: string): Promise<ActionResult<BankConnectionSummary | null>> {
        try {
            const connection = await this.db.query.bankConnections.findFirst({
                where: eq(bankConnections.buildingId, buildingId),
            })

            if (!connection) {
                return Ok(null)
            }

            // Get account count and total balance
            const accounts = await this.db.query.bankAccounts.findMany({
                where: eq(bankAccounts.connectionId, connection.id),
            })

            const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0)

            const summary: BankConnectionSummary = {
                status: connection.status as BankConnectionStatus,
                providerName: connection.providerName,
                lastSyncAt: connection.lastSyncAt,
                accountCount: accounts.length,
                totalBalance,
            }

            return Ok(summary)
        } catch (error) {
            this.logger.error('Failed to get connection status', { method: 'getConnectionStatus', buildingId }, error)
            return Err('Falha ao obter estado da ligação', ErrorCodes.INTERNAL_ERROR)
        }
    }

    /**
     * Get unmatched transactions for manual matching
     */
    async getUnmatchedTransactions(buildingId: string): Promise<ActionResult<UnmatchedTransaction[]>> {
        try {
            const transactions = await this.db
                .select({
                    id: bankTransactions.id,
                    accountId: bankTransactions.accountId,
                    buildingId: bankTransactions.buildingId,
                    tinkTransactionId: bankTransactions.tinkTransactionId,
                    amount: bankTransactions.amount,
                    type: bankTransactions.type,
                    description: bankTransactions.description,
                    originalDescription: bankTransactions.originalDescription,
                    transactionDate: bankTransactions.transactionDate,
                    bookingDate: bankTransactions.bookingDate,
                    counterpartyName: bankTransactions.counterpartyName,
                    counterpartyIban: bankTransactions.counterpartyIban,
                    matchedApartmentId: bankTransactions.matchedApartmentId,
                    matchedPaymentId: bankTransactions.matchedPaymentId,
                    matchStatus: bankTransactions.matchStatus,
                    createdAt: bankTransactions.createdAt,
                    accountName: bankAccounts.name,
                    accountIban: bankAccounts.iban,
                })
                .from(bankTransactions)
                .innerJoin(bankAccounts, eq(bankTransactions.accountId, bankAccounts.id))
                .where(
                    and(
                        eq(bankTransactions.buildingId, buildingId),
                        eq(bankTransactions.matchStatus, 'unmatched')
                    )
                )
                .orderBy(bankTransactions.transactionDate)

            return Ok(transactions as UnmatchedTransaction[])
        } catch (error) {
            this.logger.error('Failed to get unmatched transactions', { method: 'getUnmatchedTransactions', buildingId }, error)
            return Err('Falha ao obter transações', ErrorCodes.INTERNAL_ERROR)
        }
    }

    /**
     * Manually match a transaction to a payment
     */
    async manuallyMatchTransaction(
        transactionId: number,
        paymentId: number
    ): Promise<ActionResult<void>> {
        try {
            // Get the payment to find the apartment
            const payment = await this.db.query.payments.findFirst({
                where: eq(payments.id, paymentId),
            })

            if (!payment) {
                return Err('Pagamento não encontrado', ErrorCodes.NOT_FOUND)
            }

            // Update transaction
            await this.db.update(bankTransactions)
                .set({
                    matchedPaymentId: paymentId,
                    matchedApartmentId: payment.apartmentId,
                    matchStatus: 'matched',
                })
                .where(eq(bankTransactions.id, transactionId))

            this.logger.info('Transaction manually matched', {
                method: 'manuallyMatchTransaction',
                transactionId,
                paymentId,
            })

            return Ok(undefined)
        } catch (error) {
            this.logger.error('Failed to match transaction', { method: 'manuallyMatchTransaction', transactionId }, error)
            return Err('Falha ao associar transação', ErrorCodes.INTERNAL_ERROR)
        }
    }

    /**
     * Ignore a transaction (mark as not relevant)
     */
    async ignoreTransaction(transactionId: number): Promise<ActionResult<void>> {
        try {
            await this.db.update(bankTransactions)
                .set({ matchStatus: 'ignored' })
                .where(eq(bankTransactions.id, transactionId))

            return Ok(undefined)
        } catch (error) {
            this.logger.error('Failed to ignore transaction', { method: 'ignoreTransaction', transactionId }, error)
            return Err('Falha ao ignorar transação', ErrorCodes.INTERNAL_ERROR)
        }
    }

    /**
     * Disconnect bank account (revoke OAuth and clear tokens)
     */
    async disconnectBank(buildingId: string, userId: string): Promise<ActionResult<void>> {
        try {
            const connection = await this.db.query.bankConnections.findFirst({
                where: eq(bankConnections.buildingId, buildingId),
            })

            if (!connection) {
                return Err('Nenhuma ligação bancária encontrada', ErrorCodes.BANK_CONNECTION_NOT_FOUND)
            }

            // Try to revoke at Tink (but don't fail if it errors)
            if (connection.accessToken) {
                try {
                    await this.tinkClient.revokeConsent(connection.accessToken)
                } catch (error) {
                    this.logger.warn('Failed to revoke consent at Tink', { method: 'disconnectBank', buildingId })
                }
            }

            // Update connection status
            await this.db.update(bankConnections)
                .set({
                    accessToken: null,
                    refreshToken: null,
                    tokenExpiresAt: null,
                    status: 'revoked',
                    updatedAt: new Date(),
                })
                .where(eq(bankConnections.id, connection.id))

            this.logger.info('Bank disconnected', { method: 'disconnectBank', buildingId, userId })

            return Ok(undefined)
        } catch (error) {
            this.logger.error('Failed to disconnect bank', { method: 'disconnectBank', buildingId }, error)
            return Err('Falha ao desligar conta bancária', ErrorCodes.INTERNAL_ERROR)
        }
    }

    /**
     * Add an IBAN to an apartment for matching
     */
    async addResidentIban(
        apartmentId: number,
        iban: string,
        label?: string
    ): Promise<ActionResult<void>> {
        try {
            const normalizedIban = iban.replace(/\s/g, '').toUpperCase()

            await this.db.insert(residentIbans).values({
                apartmentId,
                iban: normalizedIban,
                label: label || null,
            })

            return Ok(undefined)
        } catch (error) {
            // Check for unique constraint violation
            if (error instanceof Error && error.message.includes('unique')) {
                return Err('Este IBAN já está associado a esta fração', ErrorCodes.VALIDATION_FAILED)
            }

            this.logger.error('Failed to add resident IBAN', { method: 'addResidentIban', apartmentId }, error)
            return Err('Falha ao adicionar IBAN', ErrorCodes.INTERNAL_ERROR)
        }
    }

    /**
     * Remove an IBAN from an apartment
     */
    async removeResidentIban(ibanId: number): Promise<ActionResult<void>> {
        try {
            await this.db.delete(residentIbans).where(eq(residentIbans.id, ibanId))
            return Ok(undefined)
        } catch (error) {
            this.logger.error('Failed to remove resident IBAN', { method: 'removeResidentIban', ibanId }, error)
            return Err('Falha ao remover IBAN', ErrorCodes.INTERNAL_ERROR)
        }
    }

    /**
     * Get IBANs for an apartment
     */
    async getResidentIbans(apartmentId: number): Promise<ActionResult<Array<{
        id: number
        iban: string
        label: string | null
        isPrimary: boolean | null
    }>>> {
        try {
            const ibans = await this.db.query.residentIbans.findMany({
                where: eq(residentIbans.apartmentId, apartmentId),
            })

            return Ok(ibans)
        } catch (error) {
            this.logger.error('Failed to get resident IBANs', { method: 'getResidentIbans', apartmentId }, error)
            return Err('Falha ao obter IBANs', ErrorCodes.INTERNAL_ERROR)
        }
    }

    /**
     * Get a valid connection with fresh access token
     */
    private async getValidConnection(buildingId: string): Promise<ActionResult<{
        accessToken: string
        connectionId: number
    }>> {
        const connection = await this.db.query.bankConnections.findFirst({
            where: eq(bankConnections.buildingId, buildingId),
        })

        if (!connection) {
            return Err('Nenhuma ligação bancária encontrada', ErrorCodes.BANK_CONNECTION_NOT_FOUND)
        }

        if (connection.status !== 'active') {
            return Err('A ligação bancária não está ativa', ErrorCodes.BANK_CONNECTION_EXPIRED)
        }

        if (!connection.accessToken) {
            return Err('Token de acesso não encontrado', ErrorCodes.BANK_CONNECTION_ERROR)
        }

        // Check if token needs refresh (5 minutes buffer)
        const tokenExpiry = connection.tokenExpiresAt
        const needsRefresh = tokenExpiry && tokenExpiry.getTime() < Date.now() + 5 * 60 * 1000

        if (needsRefresh && connection.refreshToken) {
            try {
                const tokens = await this.tinkClient.refreshToken(connection.refreshToken)
                const newExpiry = new Date(Date.now() + tokens.expires_in * 1000)

                await this.db.update(bankConnections)
                    .set({
                        accessToken: tokens.access_token,
                        refreshToken: tokens.refresh_token,
                        tokenExpiresAt: newExpiry,
                        updatedAt: new Date(),
                    })
                    .where(eq(bankConnections.id, connection.id))

                return Ok({
                    accessToken: tokens.access_token,
                    connectionId: connection.id,
                })
            } catch (error) {
                this.logger.error('Failed to refresh token', { method: 'getValidConnection', buildingId }, error)

                // Mark connection as expired
                await this.db.update(bankConnections)
                    .set({
                        status: 'expired',
                        lastError: 'Token refresh failed',
                        updatedAt: new Date(),
                    })
                    .where(eq(bankConnections.id, connection.id))

                return Err('O token de acesso expirou', ErrorCodes.BANK_CONNECTION_EXPIRED)
            }
        }

        return Ok({
            accessToken: connection.accessToken,
            connectionId: connection.id,
        })
    }

    /**
     * Handle connection errors by updating status based on error type
     */
    private async handleConnectionError(buildingId: string, error: unknown): Promise<void> {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        let status: 'expired' | 'error' = 'error'

        if (error instanceof TinkApiError) {
            if (error.isAuthError()) {
                // 401/403 - Token expired or invalid
                status = 'expired'
                this.logger.warn('Tink auth error - connection expired', {
                    method: 'handleConnectionError',
                    buildingId,
                    statusCode: error.statusCode,
                    errorCode: error.errorCode,
                })
            } else if (error.isRateLimited()) {
                // 429 - Rate limited, don't change status, just log
                this.logger.warn('Tink rate limit hit', {
                    method: 'handleConnectionError',
                    buildingId,
                    statusCode: error.statusCode,
                })
                // Don't update status for rate limits - it's temporary
                return
            } else if (error.isServerError()) {
                // 5xx - Tink server error, don't mark as broken
                this.logger.error('Tink server error', {
                    method: 'handleConnectionError',
                    buildingId,
                    statusCode: error.statusCode,
                })
                // Don't update status for server errors - it's Tink's problem
                return
            }
        } else {
            // Fallback: check message for auth-related keywords
            const isAuthError = errorMessage.toLowerCase().includes('unauthorized') ||
                errorMessage.toLowerCase().includes('expired') ||
                errorMessage.toLowerCase().includes('invalid token')
            if (isAuthError) {
                status = 'expired'
            }
        }

        await this.db.update(bankConnections)
            .set({
                status,
                lastError: errorMessage,
                updatedAt: new Date(),
            })
            .where(eq(bankConnections.buildingId, buildingId))
    }
}

export const tinkService = new TinkService()
