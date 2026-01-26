import { db } from "../src/db"
import { building } from "../src/db/schema"

async function main() {
    const buildings = await db.select({
        id: building.id,
        name: building.name,
        code: building.code,
        status: building.subscriptionStatus
    }).from(building).limit(10)

    console.log('Available buildings:')
    buildings.forEach(b => console.log(`  ID: ${b.id} | Name: ${b.name} | Code: ${b.code} | Status: ${b.status}`))
    process.exit(0)
}

main().catch(console.error)
