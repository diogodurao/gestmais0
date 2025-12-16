import { db } from "@/db"
import { user, building } from "@/db/schema"
import { createSetupBuilding, getManagerBuilding } from "@/app/actions/building"
import { eq } from "drizzle-orm"

async function cleanup(email: string) {
    const u = await db.select().from(user).where(eq(user.email, email)).limit(1)
    if (u.length > 0) {
        if (u[0].buildingId) {
            await db.delete(building).where(eq(building.id, u[0].buildingId))
        }
        await db.delete(user).where(eq(user.id, u[0].id))
    }
}

async function run() {
    console.log("Starting Verification...")
    const testEmail = "test_manager_" + Date.now() + "@example.com"
    const userId = "user_" + Date.now()

    try {
        // 1. Create User
        await db.insert(user).values({
            id: userId,
            name: "Test Manager",
            email: testEmail,
            emailVerified: true,
            role: "manager",
            createdAt: new Date(),
            updatedAt: new Date()
        })
        console.log("Created Test User")

        // 2. Verify No Building
        const b1 = await getManagerBuilding(userId)
        if (b1 !== null) throw new Error("Building should be null initially")
        console.log("Verified No Building Initially")

        // 3. Create Building
        const newB = await createSetupBuilding({
            userId,
            userNif: "123456789",
            city: "Test City",
            street: "Test St",
            number: "1",
            buildingNif: "987654321",
            iban: "PT50000000000000000000001",
            totalApartments: 10
        })
        console.log("Created Building:", newB.id)

        // 4. Verify Building Exists
        const b2 = await getManagerBuilding(userId)
        if (!b2) throw new Error("Building should exist now")

        const expectedName = "Condominio Test St 1, Test City"
        if (b2.name !== expectedName) throw new Error(`Building name mismatch. Expected '${expectedName}', got '${b2.name}'`)

        if (b2.city !== "Test City") throw new Error("City mismatch")
        if (b2.totalApartments !== 10) throw new Error("Apartments mismatch")

        console.log("Verified Building Details")

    } catch (e) {
        console.error("Verification Failed:", e)
        process.exit(1)
    } finally {
        await cleanup(testEmail)
        console.log("Cleanup Done")
    }
}

run()
