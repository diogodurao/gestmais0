import { describe, it, expect, vi, beforeEach } from 'vitest';

// Hoist mocks for Drizzle
const { mockDb, resetMockDb } = vi.hoisted(() => {
    const mockDb = {
        select: vi.fn(),
        insert: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        from: vi.fn(),
        where: vi.fn(),
        limit: vi.fn(),
        innerJoin: vi.fn(),
        leftJoin: vi.fn(),
        orderBy: vi.fn(),
        returning: vi.fn(),
        values: vi.fn(),
        set: vi.fn(),
        transaction: vi.fn(),
    };

    // Helper to allow chaining
    mockDb.select.mockReturnValue(mockDb);
    mockDb.from.mockReturnValue(mockDb);
    mockDb.where.mockReturnValue(mockDb);
    mockDb.limit.mockReturnValue(mockDb);
    mockDb.innerJoin.mockReturnValue(mockDb);
    mockDb.leftJoin.mockReturnValue(mockDb);
    mockDb.orderBy.mockReturnValue(mockDb);
    mockDb.insert.mockReturnValue(mockDb);
    mockDb.update.mockReturnValue(mockDb);
    mockDb.delete.mockReturnValue(mockDb);
    mockDb.returning.mockReturnValue(mockDb);
    mockDb.values.mockReturnValue(mockDb);
    mockDb.set.mockReturnValue(mockDb);
    mockDb.transaction.mockImplementation((cb) => cb(mockDb));

    return {
        mockDb,
        resetMockDb: () => {
             vi.clearAllMocks();
             mockDb.select.mockReturnValue(mockDb);
             mockDb.from.mockReturnValue(mockDb);
             mockDb.where.mockReturnValue(mockDb);
             mockDb.limit.mockReturnValue(mockDb);
             mockDb.innerJoin.mockReturnValue(mockDb);
             mockDb.leftJoin.mockReturnValue(mockDb);
             mockDb.orderBy.mockReturnValue(mockDb);
             mockDb.insert.mockReturnValue(mockDb);
             mockDb.update.mockReturnValue(mockDb);
             mockDb.delete.mockReturnValue(mockDb);
             mockDb.returning.mockReturnValue(mockDb);
             mockDb.values.mockReturnValue(mockDb);
             mockDb.set.mockReturnValue(mockDb);
             mockDb.transaction.mockImplementation((cb) => cb(mockDb));
        }
    };
});

vi.mock('@/db', () => ({
    db: mockDb,
}));

import * as actions from '@/app/actions/payments';

describe('Payments Server Actions', () => {
    beforeEach(() => {
        resetMockDb();
    });

    describe('updatePaymentStatus', () => {
        it('should update existing payment', async () => {
            const apartmentId = 1;
            const month = 1;
            const year = 2024;
            const status = 'paid';
            const amount = 5000;

            // Mock existing payment found
            mockDb.limit.mockResolvedValueOnce([{ id: 100 }]);

            await actions.updatePaymentStatus(apartmentId, month, year, status, amount);

            expect(mockDb.update).toHaveBeenCalled();
            expect(mockDb.set).toHaveBeenCalledWith({ status, amount, updatedAt: expect.any(Date) });
        });

        it('should create new payment if not exists', async () => {
            const apartmentId = 1;
            const month = 1;
            const year = 2024;
            const status = 'paid';
            const amount = 5000;

            // Mock existing payment NOT found
            mockDb.limit.mockResolvedValueOnce([]);

            await actions.updatePaymentStatus(apartmentId, month, year, status, amount);

            expect(mockDb.insert).toHaveBeenCalled();
            expect(mockDb.values).toHaveBeenCalledWith({
                apartmentId,
                month,
                year,
                status,
                amount
            });
        });
    });
});
