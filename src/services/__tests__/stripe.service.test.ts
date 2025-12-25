
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { stripeService } from "@/services/stripe.service"
import { db } from "@/db"

// Mock Next.js cache
vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
}))

// Mock @/lib/stripe
vi.mock("@/lib/stripe", () => ({
    stripe: {
        checkout: {
            sessions: {
                create: vi.fn().mockResolvedValue({ url: 'http://test-checkout-url.com' }),
                list: vi.fn().mockResolvedValue({ data: [] })
            }
        },
        subscriptions: {
            list: vi.fn().mockResolvedValue({
                data: [
                    { status: 'active', current_period_end: 1735689600, id: 'sub_123' }
                ]
            }),
            retrieve: vi.fn().mockResolvedValue({ status: 'active', id: 'sub_123' })
        },
        customers: {
            create: vi.fn().mockResolvedValue({ id: 'cus_new' })
        }
    }
}))

// Mock the database
vi.mock("@/db", () => ({
    db: {
        update: vi.fn(),
        select: vi.fn(),
        query: {
            building: {
                findFirst: vi.fn().mockResolvedValue({
                    id: 'b1',
                    stripeSubscriptionId: 'sub_123',
                    managerId: 'u1',
                    totalApartments: 10,
                    subscriptionStatus: 'inactive'
                }),
                findMany: vi.fn().mockResolvedValue([{ id: 'b1' }])
            }
        }
    }
}))

describe('StripeService', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('createCheckoutSession', () => {
        it('should create a checkout session and return url', async () => {
            const user = {
                id: 'u1',
                email: 'test@example.com',
                name: 'Test User',
                stripeCustomerId: 'cus_123'
            }
            const buildingId = 'b1'

            const result = await stripeService.createCheckoutSession(buildingId, user)

            expect(result).toBe('http://test-checkout-url.com')
        })
    })

    describe('syncSubscriptionStatus', () => {
        it('should sync subscription status and update db', async () => {
            const buildingId = 'b1'
            const userId = 'u1'
            const stripeCustomerId = 'cus_123'

            // Mock DB update
            // @ts-ignore
            db.update.mockReturnValue({
                set: vi.fn().mockReturnValue({
                    where: vi.fn().mockResolvedValue({})
                })
            })

            const result = await stripeService.syncSubscriptionStatus(buildingId, userId, stripeCustomerId)

            expect(result.synced).toBe(true)
            expect(result.status).toBe('active')

            // Verify DB update called
            expect(db.update).toHaveBeenCalled()
        })

        it('should return false if no stripe customer id', async () => {
            const result = await stripeService.syncSubscriptionStatus('b1', 'u1', null)
            expect(result.synced).toBe(false)
            expect(result.status).toBe('incomplete')
            expect(db.update).not.toHaveBeenCalled()
        })
    })
})
