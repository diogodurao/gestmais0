import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getPaymentMap, updatePaymentStatus, bulkUpdatePayments } from '@/app/actions/payments'
import { paymentService } from '@/services/payment.service'

// Mock dependencies
vi.mock('@/services/payment.service', () => ({
    paymentService: {
        getPaymentMap: vi.fn(),
        updatePaymentStatus: vi.fn(),
    }
}))

vi.mock('@/lib/auth-helpers', () => ({
    requireBuildingAccess: vi.fn(),
    requireApartmentAccess: vi.fn(),
}))

// Mock next/cache
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}))

describe('Payment Actions', () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    describe('getPaymentMap', () => {
        it('should return grid data when user has access', async () => {
            const { requireBuildingAccess } = await import('@/lib/auth-helpers')
            const mockData = { gridData: [], monthlyQuota: 50 }
            vi.mocked(paymentService.getPaymentMap).mockResolvedValue(mockData)

            const result = await getPaymentMap('b1', 2024)

            expect(requireBuildingAccess).toHaveBeenCalledWith('b1')
            expect(paymentService.getPaymentMap).toHaveBeenCalledWith('b1', 2024)
            expect(result).toEqual(mockData)
        })
    })

    describe('updatePaymentStatus', () => {
        it('should update status when input is valid', async () => {
            const { requireApartmentAccess } = await import('@/lib/auth-helpers')
            vi.mocked(paymentService.updatePaymentStatus).mockResolvedValue(undefined)

            const result = await updatePaymentStatus(1, 1, 2024, 'paid', 5000)

            expect(requireApartmentAccess).toHaveBeenCalledWith(1)
            expect(result.success).toBe(true)
            expect(paymentService.updatePaymentStatus).toHaveBeenCalledWith(1, 1, 2024, 'paid', 5000)
        })

        it('should return error if validation fails', async () => {
            const result = await updatePaymentStatus(1, 13, 2024, 'paid') // Invalid month 13

            expect(result.success).toBe(false)
            expect(paymentService.updatePaymentStatus).not.toHaveBeenCalled()
        })

        it('should handle service errors', async () => {
            vi.mocked(paymentService.updatePaymentStatus).mockRejectedValue(new Error('Db error'))

            const result = await updatePaymentStatus(1, 1, 2024, 'paid')

            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error).toContain('Failed to update')
            }
        })
    })

    describe('bulkUpdatePayments', () => {
        it('should update multiple months', async () => {
            const result = await bulkUpdatePayments(1, 2024, 1, 3, 'paid')

            expect(result.success).toBe(true)
            // Should call service 3 times (Jan, Feb, Mar)
            expect(paymentService.updatePaymentStatus).toHaveBeenCalledTimes(3)
        })

        it('should validate month range', async () => {
            // End month < Start month
            const result = await bulkUpdatePayments(1, 2024, 5, 2, 'paid')

            expect(result.success).toBe(false)
            expect(paymentService.updatePaymentStatus).not.toHaveBeenCalled()
        })
    })
})
