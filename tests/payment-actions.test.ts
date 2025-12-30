import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getPaymentMap,
  updatePaymentStatus
} from '@/app/actions/payments';
import { db } from '@/db';
import { payments, apartments } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// Mock DB
vi.mock('@/db', () => {
    const mockMethods = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
    };

    return {
        db: {
            ...mockMethods,
            // Payments doesn't use transaction currently, but good to have
            transaction: vi.fn((cb) => cb(mockMethods)),
        }
    };
});

// Mock revalidatePath
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

describe('Payment Actions', () => {
    const mockBuildingId = 'building-123';
    const mockApartmentId = 1;

    beforeEach(() => {
        vi.clearAllMocks();
        // Reset chain
        const methods = ['select', 'from', 'where', 'limit', 'innerJoin', 'leftJoin', 'orderBy', 'insert', 'values', 'returning', 'update', 'set', 'delete'];
        methods.forEach(m => (db as any)[m].mockReturnThis());
    });

    describe('getPaymentMap', () => {
        it('should return grid data for payments', async () => {
            const mockApts = [
                { id: 1, unit: '1A', buildingId: mockBuildingId },
                { id: 2, unit: '1B', buildingId: mockBuildingId }
            ];

            const mockPayments = [
                { apartmentId: 1, month: 1, status: 'paid' },
                { apartmentId: 1, month: 2, status: 'pending' },
                // Apt 2 has no payments
            ];

            // Mock get apartments
            (db.select as any).mockImplementationOnce(() => ({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        orderBy: vi.fn().mockResolvedValue(mockApts)
                    })
                })
            }));

            // Mock get payments
            (db.select as any).mockImplementationOnce(() => ({
                from: vi.fn().mockReturnValue({
                    innerJoin: vi.fn().mockReturnValue({
                        where: vi.fn().mockResolvedValue(mockPayments)
                    })
                })
            }));

            const result = await getPaymentMap(mockBuildingId, 2024);

            expect(result).toHaveLength(2);
            expect(result[0].unit).toBe('1A');
            expect(result[0].payments[1]).toBe('paid');
            expect(result[0].payments[2]).toBe('pending');
            expect(result[1].unit).toBe('1B');
            expect(Object.keys(result[1].payments)).toHaveLength(0);
        });
    });

    describe('updatePaymentStatus', () => {
        it('should update existing payment', async () => {
            const existingPayment = { id: 100 };

            // Mock find existing
            (db.select as any).mockImplementation(() => ({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockResolvedValue([existingPayment])
                    })
                })
            }));

            await updatePaymentStatus(mockApartmentId, 1, 2024, 'paid', 5000);

            expect(db.update).toHaveBeenCalledWith(payments);
            expect(db.insert).not.toHaveBeenCalled();
        });

        it('should insert new payment if not exists', async () => {
             // Mock find existing: empty
             (db.select as any).mockImplementation(() => ({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockResolvedValue([])
                    })
                })
            }));

            await updatePaymentStatus(mockApartmentId, 1, 2024, 'paid', 5000);

            expect(db.insert).toHaveBeenCalledWith(payments);
            expect(db.update).not.toHaveBeenCalled();
        });
    });
});
