"use server"

/**
 * Banking Server Actions
 *
 * Server actions for Tink Open Banking integration.
 * All actions require manager authentication and building access.
 */

import { updateTag } from "next/cache"
import { requireBuildingAccess, requireApartmentAccess } from "@/lib/auth-helpers"
import { tinkService } from "@/services/tink.service"
import {
    ActionResult,
    BankConnectionSummary,
    UnmatchedTransaction,
} from "@/lib/types"

/**
 * Initiate bank connection - generates Tink Link URL
 */
export async function initiateBankConnection(
    buildingId: string
): Promise<ActionResult<{ authUrl: string }>> {
    const { session } = await requireBuildingAccess(buildingId)

    const result = await tinkService.initiateBankConnection(buildingId, session.user.id)

    if (!result.success) {
        return result
    }

    return { success: true, data: { authUrl: result.data.authUrl } }
}

/**
 * Get bank connection status for a building
 */
export async function getBankConnectionStatus(
    buildingId: string
): Promise<ActionResult<BankConnectionSummary | null>> {
    await requireBuildingAccess(buildingId)

    return tinkService.getConnectionStatus(buildingId)
}

/**
 * Sync bank data (accounts and transactions)
 * Returns partial success info including any accounts that failed to sync
 */
export async function syncBankData(
    buildingId: string,
    fromDate?: string,
    toDate?: string
): Promise<ActionResult<{
    accounts: number
    transactions: { synced: number; matched: number; failedAccounts: number[] }
}>> {
    await requireBuildingAccess(buildingId)

    // Sync accounts first
    const accountsResult = await tinkService.syncAccounts(buildingId)
    if (!accountsResult.success) {
        return accountsResult
    }

    // Then sync transactions
    const transactionsResult = await tinkService.syncTransactions(buildingId, fromDate, toDate)
    if (!transactionsResult.success) {
        return transactionsResult
    }

    // Invalidate cache
    updateTag(`banking-${buildingId}`)

    return {
        success: true,
        data: {
            accounts: accountsResult.data,
            transactions: transactionsResult.data,
        },
    }
}

/**
 * Get unmatched transactions for manual matching
 */
export async function getUnmatchedTransactions(
    buildingId: string
): Promise<ActionResult<UnmatchedTransaction[]>> {
    await requireBuildingAccess(buildingId)

    return tinkService.getUnmatchedTransactions(buildingId)
}

/**
 * Manually match a transaction to a payment
 */
export async function manuallyMatchTransaction(
    transactionId: number,
    paymentId: number,
    buildingId: string
): Promise<ActionResult<void>> {
    await requireBuildingAccess(buildingId)

    const result = await tinkService.manuallyMatchTransaction(transactionId, paymentId)

    if (result.success) {
        updateTag(`banking-${buildingId}`)
    }

    return result
}

/**
 * Ignore a transaction (mark as not relevant)
 */
export async function ignoreTransaction(
    transactionId: number,
    buildingId: string
): Promise<ActionResult<void>> {
    await requireBuildingAccess(buildingId)

    const result = await tinkService.ignoreTransaction(transactionId)

    if (result.success) {
        updateTag(`banking-${buildingId}`)
    }

    return result
}

/**
 * Run IBAN matching for all unmatched transactions
 */
export async function runIbanMatching(
    buildingId: string
): Promise<ActionResult<number>> {
    await requireBuildingAccess(buildingId)

    const result = await tinkService.matchTransactionsByIban(buildingId)

    if (result.success) {
        updateTag(`banking-${buildingId}`)
    }

    return result
}

/**
 * Disconnect bank account
 */
export async function disconnectBank(
    buildingId: string
): Promise<ActionResult<void>> {
    const { session } = await requireBuildingAccess(buildingId)

    const result = await tinkService.disconnectBank(buildingId, session.user.id)

    if (result.success) {
        updateTag(`banking-${buildingId}`)
    }

    return result
}

/**
 * Add an IBAN to an apartment for matching
 */
export async function addResidentIban(
    apartmentId: number,
    iban: string,
    label?: string
): Promise<ActionResult<void>> {
    await requireApartmentAccess(apartmentId)

    return tinkService.addResidentIban(apartmentId, iban, label)
}

/**
 * Remove an IBAN from an apartment
 */
export async function removeResidentIban(
    apartmentId: number,
    ibanId: number
): Promise<ActionResult<void>> {
    await requireApartmentAccess(apartmentId)

    return tinkService.removeResidentIban(ibanId)
}

/**
 * Get IBANs for an apartment
 */
export async function getResidentIbans(
    apartmentId: number
): Promise<ActionResult<Array<{
    id: number
    iban: string
    label: string | null
    isPrimary: boolean | null
}>>> {
    await requireApartmentAccess(apartmentId)

    return tinkService.getResidentIbans(apartmentId)
}
