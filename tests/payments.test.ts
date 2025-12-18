
import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as paymentActions from '@/app/actions/payments';
import { db } from '@/db';

// Mock dependencies
vi.mock('@/db');
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn()
}));
vi.mock('drizzle-orm', () => ({
  eq: vi.fn(),
  and: vi.fn(),
  asc: vi.fn()
}));

// Mock Schema
vi.mock('@/db/schema', () => ({
  payments: { id: 'paymentId', apartmentId: 'apartmentId', month: 'month', year: 'year', status: 'status', amount: 'amount', updatedAt: 'updatedAt' },
  apartments: { id: 'apartmentId', buildingId: 'buildingId', floor: 'floor', identifier: 'identifier' },
  building: {}
}));

describe('Payment Actions', () => {
  const mockDb = db as any;

  beforeEach(() => {
    vi.resetAllMocks();

    const mockChain = {
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([]),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
      orderBy: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      leftJoin: vi.fn().mockReturnThis(),
    };

    mockDb.insert = vi.fn(() => mockChain);
    mockDb.select = vi.fn(() => mockChain);
    mockDb.update = vi.fn(() => mockChain);
    mockDb.delete = vi.fn(() => mockChain);
  });

  describe('updatePaymentStatus', () => {
    it('should create new payment if not exists', async () => {
      const apartmentId = 1;
      const month = 1;
      const year = 2023;
      const status = 'paid';
      const amount = 5000;

      // Mock check exists (returns empty)
      const selectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([])
      };
      mockDb.select.mockReturnValue(selectChain);

      await paymentActions.updatePaymentStatus(apartmentId, month, year, status, amount);

      expect(mockDb.insert).toHaveBeenCalledTimes(1);
      const insertChain = mockDb.insert.mock.results[0].value;
      expect(insertChain.values).toHaveBeenCalledWith({
        apartmentId,
        month,
        year,
        status,
        amount
      });
      expect(mockDb.update).not.toHaveBeenCalled();
    });

    it('should update existing payment', async () => {
      const apartmentId = 1;
      const month = 1;
      const year = 2023;
      const status = 'late';
      const amount = 5000;
      const existingId = 100;

      // Mock check exists (returns record)
      const selectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ id: existingId }])
      };
      mockDb.select.mockReturnValue(selectChain);

      await paymentActions.updatePaymentStatus(apartmentId, month, year, status, amount);

      expect(mockDb.update).toHaveBeenCalledTimes(1);
      expect(mockDb.insert).not.toHaveBeenCalled();

      const updateChain = mockDb.update.mock.results[0].value;
      expect(updateChain.set).toHaveBeenCalledWith(expect.objectContaining({
          status,
          amount
      }));
    });
  });

  describe('getPaymentMap', () => {
    it('should return correct grid data', async () => {
      const buildingId = 'b-123';
      const year = 2023;

      const mockApartments = [
        { id: 1, floor: '0', identifier: 'A', buildingId },
        { id: 2, floor: '1', identifier: 'Esq', buildingId }
      ];

      const mockPayments = [
        { apartmentId: 1, month: 1, status: 'paid' },
        { apartmentId: 2, month: 2, status: 'late' }
      ];

      // First query: select apartments
      const selectAptChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockApartments)
      };

      // Second query: select payments
      const selectPayChain = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockPayments)
      };

      mockDb.select
        .mockReturnValueOnce(selectAptChain)
        .mockReturnValueOnce(selectPayChain);

      const result = await paymentActions.getPaymentMap(buildingId, year);

      expect(result).toHaveLength(2);
      expect(result[0].unit).toBe("R/C A");
      expect(result[0].payments[1]).toBe("paid");
      expect(result[1].unit).toBe("1º Esq");
      expect(result[1].payments[2]).toBe("late");
    });
  });
});
