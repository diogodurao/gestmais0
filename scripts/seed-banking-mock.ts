/**
 * Seed mock banking data for testing UI
 * Run with: npx tsx scripts/seed-banking-mock.ts
 */

import { db } from "../src/db"
import { bankAccounts, bankTransactions, bankConnections, residentIbans, apartments, building } from "../src/db/schema"
import { eq } from "drizzle-orm"

async function seedBankingMock() {
    console.log("Seeding mock banking data...")

    // Get the first building
    const firstBuilding = await db.query.building.findFirst()

    if (!firstBuilding) {
        console.error("No building found. Create a building first.")
        process.exit(1)
    }

    const BUILDING_ID = firstBuilding.id
    console.log("Using building:", BUILDING_ID, firstBuilding.name)

    // Check if connection already exists
    const existingConnection = await db.query.bankConnections.findFirst({
        where: eq(bankConnections.buildingId, BUILDING_ID),
    })

    let connection
    if (existingConnection) {
        console.log("Connection already exists, updating to active...")
        await db.update(bankConnections)
            .set({
                status: 'active',
                lastSyncAt: new Date(),
                providerName: 'Banco Mock PT'
            })
            .where(eq(bankConnections.id, existingConnection.id))
        connection = existingConnection
    } else {
        // Create mock bank connection
        const [newConnection] = await db.insert(bankConnections).values({
            buildingId: BUILDING_ID,
            accessToken: "mock-access-token",
            refreshToken: "mock-refresh-token",
            tokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            providerName: "Banco Mock PT",
            status: "active",
            lastSyncAt: new Date(),
        }).returning()
        connection = newConnection
        console.log("Created mock connection:", connection.id)
    }

    // Check if account exists
    const existingAccount = await db.query.bankAccounts.findFirst({
        where: eq(bankAccounts.connectionId, connection.id),
    })

    let account
    if (existingAccount) {
        console.log("Account already exists:", existingAccount.id)
        account = existingAccount
    } else {
        // Create a test bank account
        const [newAccount] = await db.insert(bankAccounts).values({
            connectionId: connection.id,
            buildingId: BUILDING_ID,
            tinkAccountId: "mock-account-001",
            name: "Conta Corrente Condomínio",
            iban: "PT50000201231234567890154",
            balance: 1542350, // €15,423.50
            availableBalance: 1542350,
            currency: "EUR",
            accountType: "CHECKING",
            lastSyncAt: new Date(),
        }).returning()
        account = newAccount
        console.log("Created test account:", account.id)
    }

    // Get apartments for the building
    const buildingApartments = await db.query.apartments.findMany({
        where: eq(apartments.buildingId, BUILDING_ID),
    })

    console.log(`Found ${buildingApartments.length} apartments`)

    // Add resident IBANs for first 3 apartments (for testing matching)
    if (buildingApartments.length > 0) {
        const testIbans = [
            { apartmentId: buildingApartments[0]?.id, iban: "PT50000201230000000000001", label: "Conta Principal" },
            { apartmentId: buildingApartments[1]?.id, iban: "PT50000201230000000000002", label: "Conta Principal" },
            { apartmentId: buildingApartments[2]?.id, iban: "PT50000201230000000000003", label: "Conta Principal" },
        ].filter(i => i.apartmentId)

        for (const ibanData of testIbans) {
            try {
                await db.insert(residentIbans).values({
                    apartmentId: ibanData.apartmentId!,
                    iban: ibanData.iban,
                    label: ibanData.label,
                    isPrimary: true,
                }).onConflictDoNothing()
                console.log(`Added IBAN for apartment ${ibanData.apartmentId}`)
            } catch (e) {
                console.log(`IBAN already exists for apartment ${ibanData.apartmentId}`)
            }
        }
    }

    // Delete existing transactions for this account to avoid duplicates
    await db.delete(bankTransactions).where(eq(bankTransactions.accountId, account.id))

    // Create test transactions
    const today = new Date()
    const transactions = [
        // Matched transactions (IBANs match apartments)
        {
            accountId: account.id,
            buildingId: BUILDING_ID,
            tinkTransactionId: `mock-tx-${Date.now()}-001`,
            amount: 15000, // €150.00
            type: "credit" as const,
            description: "Quota Janeiro - Fração A",
            originalDescription: "TRANSF DE PT50000201230000000000001",
            transactionDate: new Date(today.getFullYear(), today.getMonth(), 5).toISOString().split('T')[0],
            counterpartyName: "João Silva",
            counterpartyIban: "PT50000201230000000000001",
            matchedApartmentId: buildingApartments[0]?.id,
            matchStatus: "matched" as const,
        },
        {
            accountId: account.id,
            buildingId: BUILDING_ID,
            tinkTransactionId: `mock-tx-${Date.now()}-002`,
            amount: 15000,
            type: "credit" as const,
            description: "Quota Janeiro - Fração B",
            originalDescription: "TRANSF DE PT50000201230000000000002",
            transactionDate: new Date(today.getFullYear(), today.getMonth(), 6).toISOString().split('T')[0],
            counterpartyName: "Maria Santos",
            counterpartyIban: "PT50000201230000000000002",
            matchedApartmentId: buildingApartments[1]?.id,
            matchStatus: "matched" as const,
        },
        // Unmatched transactions (unknown IBANs) - these will show in the UI
        {
            accountId: account.id,
            buildingId: BUILDING_ID,
            tinkTransactionId: `mock-tx-${Date.now()}-003`,
            amount: 15000,
            type: "credit" as const,
            description: "Pagamento quota condomínio",
            originalDescription: "TRANSF DE PT50000201239999999999999",
            transactionDate: new Date(today.getFullYear(), today.getMonth(), 7).toISOString().split('T')[0],
            counterpartyName: "Carlos Ferreira",
            counterpartyIban: "PT50000201239999999999999",
            matchStatus: "unmatched" as const,
        },
        {
            accountId: account.id,
            buildingId: BUILDING_ID,
            tinkTransactionId: `mock-tx-${Date.now()}-004`,
            amount: 30000, // €300.00
            type: "credit" as const,
            description: "Depósito multibanco",
            originalDescription: "DEP MULTIBANCO",
            transactionDate: new Date(today.getFullYear(), today.getMonth(), 8).toISOString().split('T')[0],
            counterpartyName: null,
            counterpartyIban: null,
            matchStatus: "unmatched" as const,
        },
        {
            accountId: account.id,
            buildingId: BUILDING_ID,
            tinkTransactionId: `mock-tx-${Date.now()}-005`,
            amount: 17500, // €175.00
            type: "credit" as const,
            description: "Quota atrasada Dezembro",
            originalDescription: "TRANSF DE PT50000201238888888888888",
            transactionDate: new Date(today.getFullYear(), today.getMonth(), 10).toISOString().split('T')[0],
            counterpartyName: "Ana Rodrigues",
            counterpartyIban: "PT50000201238888888888888",
            matchStatus: "unmatched" as const,
        },
        {
            accountId: account.id,
            buildingId: BUILDING_ID,
            tinkTransactionId: `mock-tx-${Date.now()}-006`,
            amount: 22500, // €225.00
            type: "credit" as const,
            description: "Transferência recebida",
            originalDescription: "TRF SEPA PT50000201237777777777777",
            transactionDate: new Date(today.getFullYear(), today.getMonth(), 12).toISOString().split('T')[0],
            counterpartyName: "Pedro Martins",
            counterpartyIban: "PT50000201237777777777777",
            matchStatus: "unmatched" as const,
        },
    ].filter(tx => tx.matchedApartmentId !== undefined || tx.matchStatus === 'unmatched')

    for (const tx of transactions) {
        await db.insert(bankTransactions).values(tx)
        console.log(`Created transaction: ${tx.description} - ${tx.matchStatus}`)
    }

    console.log("\n✅ Mock banking data seeded successfully!")
    console.log("- 1 bank connection (active)")
    console.log("- 1 bank account")
    console.log(`- ${buildingApartments.length > 0 ? '3' : '0'} resident IBANs`)
    console.log("- 6 transactions (2 matched, 4 unmatched)")
    console.log("\nGo to Settings → Banco tab to see the UI")

    process.exit(0)
}

seedBankingMock().catch(console.error)
