/**
 * Test script to toggle subscription blocked state
 *
 * Usage:
 *   npx tsx scripts/test-subscription-block.ts block              # Set to blocked (past_due + 4 days ago)
 *   npx tsx scripts/test-subscription-block.ts unblock            # Reset to active
 *   npx tsx scripts/test-subscription-block.ts unpaid             # Set to unpaid status
 *   npx tsx scripts/test-subscription-block.ts block [buildingId] # Use specific building ID (default: 06r38r)
 */

import { db } from "../src/db"
import { building } from "../src/db/schema"
import { eq } from "drizzle-orm"

async function main() {
    const action = process.argv[2] || 'status'

    // Specific building ID to test (code: 06r38r)
    const buildingId = process.argv[3] || "d6bf03af-9464-4103-90bc-93f9b3395329"

    const buildings = await db.select().from(building).where(eq(building.id, buildingId)).limit(1)

    if (!buildings.length) {
        console.log(`Building not found: ${buildingId}`)
        process.exit(1)
    }

    const b = buildings[0]
    console.log(`\nBuilding: ${b.name} (${b.id})`)
    console.log(`Current status: ${b.subscriptionStatus}`)
    console.log(`Past due at: ${b.subscriptionPastDueAt}`)

    if (action === 'block') {
        // Set to past_due with date 4 days ago (past grace period)
        const fourDaysAgo = new Date()
        fourDaysAgo.setDate(fourDaysAgo.getDate() - 4)

        await db.update(building)
            .set({
                subscriptionStatus: 'past_due',
                subscriptionPastDueAt: fourDaysAgo,
            })
            .where(eq(building.id, b.id))

        console.log(`\n✅ Set to BLOCKED (past_due, 4 days ago)`)
        console.log(`   Refresh localhost to see the overlay`)

    } else if (action === 'unblock') {
        await db.update(building)
            .set({
                subscriptionStatus: 'active',
                subscriptionPastDueAt: null,
            })
            .where(eq(building.id, b.id))

        console.log(`\n✅ Set to ACTIVE (unblocked)`)

    } else if (action === 'unpaid') {
        await db.update(building)
            .set({
                subscriptionStatus: 'unpaid',
                subscriptionPastDueAt: null,
            })
            .where(eq(building.id, b.id))

        console.log(`\n✅ Set to UNPAID (blocked)`)

    } else if (action === 'grace') {
        // Set to past_due with date 1 day ago (within grace period)
        const oneDayAgo = new Date()
        oneDayAgo.setDate(oneDayAgo.getDate() - 1)

        await db.update(building)
            .set({
                subscriptionStatus: 'past_due',
                subscriptionPastDueAt: oneDayAgo,
            })
            .where(eq(building.id, b.id))

        console.log(`\n✅ Set to GRACE PERIOD (past_due, 1 day ago)`)
        console.log(`   You should see warning in Settings > Subscription`)

    } else {
        console.log(`\nUsage:`)
        console.log(`  npx tsx scripts/test-subscription-block.ts block   - Block the app`)
        console.log(`  npx tsx scripts/test-subscription-block.ts unblock - Restore to active`)
        console.log(`  npx tsx scripts/test-subscription-block.ts unpaid  - Set to unpaid`)
        console.log(`  npx tsx scripts/test-subscription-block.ts grace   - Set within grace period`)
    }

    process.exit(0)
}

main().catch(console.error)
