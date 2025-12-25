import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPaymentMap, updatePaymentStatus } from '@/app/actions/payments';
import { db } from '@/db';
import { apartments, payments } from '@/db/schema';

// Mock the db module
vi.mock('@/db', () => ({
    db: {
        select: vi.fn(),
        insert: vi.fn(),
        update: vi.fn(),
    }
}));

// Mock next/cache
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

describe('Payment Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getPaymentMap', () => {
        it('should return grid data correctly', async () => {
            const buildingId = 'building-1';
            const year = 2024;

            // Mock apartments fetch
            const apartmentsMock = [
                { id: 1, floor: '0', identifier: 'A', buildingId },
                { id: 2, floor: '1', identifier: 'B', buildingId }
            ];

            // Mock payments fetch
            const paymentsMock = [
                { apartmentId: 1, month: 1, status: 'paid' },
                { apartmentId: 2, month: 2, status: 'late' }
            ];

            // Use a more robust mocking strategy
            // When db.select().from(apartments)... is called
            const selectMock = vi.fn();
            (db.select as any).mockImplementation(selectMock);

            // Mock implementations
            selectMock.mockImplementation(() => {
                return {
                    from: vi.fn().mockImplementation((table) => {
                        if (table === apartments) {
                            return {
                                where: vi.fn().mockReturnValue({
                                    orderBy: vi.fn().mockResolvedValue(apartmentsMock)
                                })
                            };
                        }
                        if (table === payments) {
                            return {
                                innerJoin: vi.fn().mockReturnValue({
                                    where: vi.fn().mockResolvedValue(paymentsMock)
                                })
                            };
                        }
                        // Default fallback
                        return {
                           where: vi.fn().mockReturnValue({
                                orderBy: vi.fn().mockResolvedValue([])
                           }),
                           innerJoin: vi.fn().mockReturnValue({
                               where: vi.fn().mockResolvedValue([])
                           })
                        };
                    })
                };
            });

            const result = await getPaymentMap(buildingId, year);

            expect(result).toHaveLength(2);
            expect(result[0].apartmentId).toBe(1);
            expect(result[0].payments[1]).toBe('paid');
            expect(result[1].apartmentId).toBe(2);
            expect(result[1].payments[2]).toBe('late');
        });
    });

    describe('updatePaymentStatus', () => {
        it('should insert new payment if not exists', async () => {
            const aptId = 1;
            const month = 1;
            const year = 2024;
            const status = 'paid';

            // Mock check exists (empty)
            const limitMock = vi.fn().mockResolvedValue([]);
            const whereMock = vi.fn().mockReturnValue({ limit: limitMock });
            const fromMock = vi.fn().mockReturnValue({ where: whereMock });
            (db.select as any).mockReturnValue({ from: fromMock });

            // Mock insert
            const insertMock = vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue({}) });
            (db.insert as any).mockImplementation(insertMock);

            await updatePaymentStatus(aptId, month, year, status);

            expect(db.insert).toHaveBeenCalled();
        });

        it('should update payment if exists', async () => {
            const aptId = 1;
            const month = 1;
            const year = 2024;
            const status = 'paid';

            // Mock check exists (found)
            const limitMock = vi.fn().mockResolvedValue([{ id: 100 }]);
            const whereMock = vi.fn().mockReturnValue({ limit: limitMock });
            const fromMock = vi.fn().mockReturnValue({ where: whereMock });
            (db.select as any).mockReturnValue({ from: fromMock });

            // Mock update
            const updateMock = vi.fn().mockReturnValue({
                set: vi.fn().mockReturnValue({
                    where: vi.fn().mockResolvedValue({})
                })
            });
            (db.update as any).mockImplementation(updateMock);

            await updatePaymentStatus(aptId, month, year, status);

            expect(db.update).toHaveBeenCalled();
        });
    });
});
