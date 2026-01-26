/**
 * Seed test data for banking features
 * Run with: npx tsx scripts/seed-banking-test-data.ts
 */

import { db } from "../src/db"
import { bankAccounts, bankTransactions, bankConnections, residentIbans, apartments } from "../src/db/schema"
import { eq } from "drizzle-orm"

const BUILDING_ID = "d6bf03af-9464-4103-90bc-93f9b3395329"

async function seedBankingTestData() {
    console.log("Seeding banking test data...")

    // Get the existing connection
    const connection = await db.query.bankConnections.findFirst({
        where: eq(bankConnections.buildingId, BUILDING_ID),
    })

    if (!connection) {
        console.error("No bank connection found for building. Connect a bank first.")
        process.exit(1)
    }

    console.log("Found connection:", connection.id)

    // Create a test bank account
    const [account] = await db.insert(bankAccounts).values({
        connectionId: connection.id,
        buildingId: BUILDING_ID,
        tinkAccountId: "test-account-001",
        name: "Conta Corrente Condomínio",
        iban: "PT50000201231234567890154",
        balance: 1542350, // €15,423.50
        availableBalance: 1542350,
        currency: "EUR",
        accountType: "CHECKING",
        lastSyncAt: new Date(),
    }).returning()

    console.log("Created test account:", account.id)

    // Get apartments for the building to create matching IBANs
    const buildingApartments = await db.query.apartments.findMany({
        where: eq(apartments.buildingId, BUILDING_ID),
    })

    console.log(`Found ${buildingApartments.length} apartments`)

    // Add resident IBANs for first 3 apartments (for testing matching)
    const testIbans = [
        { apartmentId: buildingApartments[0]?.id, iban: "PT50000201230000000000001", label: "Fração A" },
        { apartmentId: buildingApartments[1]?.id, iban: "PT50000201230000000000002", label: "Fração B" },
        { apartmentId: buildingApartments[2]?.id, iban: "PT50000201230000000000003", label: "Fração C" },
    ].filter(i => i.apartmentId)

    for (const ibanData of testIbans) {
        try {
            await db.insert(residentIbans).values({
                apartmentId: ibanData.apartmentId!,
                iban: ibanData.iban,
                label: ibanData.label,
                isPrimary: true,
            })
            console.log(`Added IBAN for apartment ${ibanData.apartmentId}`)
        } catch (e) {
            console.log(`IBAN already exists for apartment ${ibanData.apartmentId}`)
        }
    }

    // Create test transactions
    const today = new Date()
    const transactions = [
        // Matched transactions (IBANs match apartments)
        {
            accountId: account.id,
            buildingId: BUILDING_ID,
            tinkTransactionId: "tx-001",
            amount: 15000, // €150.00
            type: "credit" as const,
            description: "Quota Janeiro - Fração A",
            originalDescription: "TRANSF DE PT50000201230000000000001",
            transactionDate: new Date(today.getFullYear(), today.getMonth(), 5).toISOString().split('T')[0],
            counterpartyName: "João Silva",
            counterpartyIban: "PT50000201230000000000001", // Matches apartment 1
            matchedApartmentId: buildingApartments[0]?.id,
            matchStatus: "matched" as const,
        },
        {
            accountId: account.id,
            buildingId: BUILDING_ID,
            tinkTransactionId: "tx-002",
            amount: 15000,
            type: "credit" as const,
            description: "Quota Janeiro - Fração B",
            originalDescription: "TRANSF DE PT50000201230000000000002",
            transactionDate: new Date(today.getFullYear(), today.getMonth(), 6).toISOString().split('T')[0],
            counterpartyName: "Maria Santos",
            counterpartyIban: "PT50000201230000000000002", // Matches apartment 2
            matchedApartmentId: buildingApartments[1]?.id,
            matchStatus: "matched" as const,
        },
        // Unmatched transactions (unknown IBANs)
        {
            accountId: account.id,
            buildingId: BUILDING_ID,
            tinkTransactionId: "tx-003",
            amount: 15000,
            type: "credit" as const,
            description: "Pagamento quota",
            originalDescription: "TRANSF DE PT50000201239999999999999",
            transactionDate: new Date(today.getFullYear(), today.getMonth(), 7).toISOString().split('T')[0],
            counterpartyName: "Carlos Ferreira",
            counterpartyIban: "PT50000201239999999999999", // Unknown IBAN
            matchStatus: "unmatched" as const,
        },
        {
            accountId: account.id,
            buildingId: BUILDING_ID,
            tinkTransactionId: "tx-004",
            amount: 30000, // €300.00
            type: "credit" as const,
            description: "Deposito",
            originalDescription: "DEP MULTIBANCO",
            transactionDate: new Date(today.getFullYear(), today.getMonth(), 8).toISOString().split('T')[0],
            counterpartyName: null,
            counterpartyIban: null, // No IBAN
            matchStatus: "unmatched" as const,
        },
        {
            accountId: account.id,
            buildingId: BUILDING_ID,
            tinkTransactionId: "tx-005",
            amount: 17500, // €175.00
            type: "credit" as const,
            description: "Quota atrasada",
            originalDescription: "TRANSF DE PT50000201238888888888888",
            transactionDate: new Date(today.getFullYear(), today.getMonth(), 10).toISOString().split('T')[0],
            counterpartyName: "Ana Rodrigues",
            counterpartyIban: "PT50000201238888888888888",
            matchStatus: "unmatched" as const,
        },
        // Debit transaction (expense)
        {
            accountId: account.id,
            buildingId: BUILDING_ID,
            tinkTransactionId: "tx-006",
            amount: 25000, // €250.00
            type: "debit" as const,
            description: "Empresa Limpeza",
            originalDescription: "PAG SERV LIMPEZA LDA",
            transactionDate: new Date(today.getFullYear(), today.getMonth(), 3).toISOString().split('T')[0],
            counterpartyName: "Limpeza & Higiene Lda",
            counterpartyIban: "PT50000507890000000000123",
            matchStatus: "ignored" as const,
        },
    ]

    for (const tx of transactions) {
        try {
            await db.insert(bankTransactions).values(tx)
            console.log(`Created transaction: ${tx.tinkTransactionId} - ${tx.description}`)
        } catch (e) {
            console.log(`Transaction ${tx.tinkTransactionId} already exists`)
        }
    }

    // Update account balance after transactions
    await db.update(bankAccounts)
        .set({ lastSyncAt: new Date() })
        .where(eq(bankAccounts.id, account.id))

    // Update connection last sync
    await db.update(bankConnections)
        .set({ lastSyncAt: new Date() })
        .where(eq(bankConnections.id, connection.id))

    console.log("\n✅ Banking test data seeded successfully!")
    console.log("- 1 bank account")
    console.log("- 3 resident IBANs")
    console.log("- 6 transactions (2 matched, 3 unmatched, 1 ignored)")

    process.exit(0)
}

seedBankingTestData().catch(console.error)
