import { describe, it, expect, vi, beforeEach } from 'vitest';

// Re-use the mock setup logic in a clean way for this file too
// For production code, I'd move the mock setup to a helper file,
// but for this task I will inline it to keep it self-contained in the test file.

// Create a mock query builder that is also thenable
const createMockQueryBuilder = () => {
  const builder: any = {};

  // Define chainable methods
  const methods = [
    'from', 'where', 'limit', 'innerJoin', 'leftJoin', 'orderBy',
    'values', 'set', 'returning', 'delete'
  ];

  methods.forEach(method => {
    builder[method] = vi.fn().mockReturnValue(builder);
  });

  // Define then method for await
  builder.then = vi.fn((resolve, reject) => {
    return Promise.resolve([]).then(resolve, reject);
  });

  return builder;
};

// Hoist mockDb factory
const { mockDb, mockSelect, mockInsert, mockUpdate, mockDelete } = vi.hoisted(() => {
  const select = vi.fn();
  const insert = vi.fn();
  const update = vi.fn();
  const del = vi.fn();

  return {
    mockDb: {
      select,
      insert,
      update,
      delete: del,
    },
    mockSelect: select,
    mockInsert: insert,
    mockUpdate: update,
    mockDelete: del,
  }
})

vi.mock('@/db', () => ({
  db: mockDb,
}));

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

vi.mock('@/db/schema', () => ({
  user: { id: 'user_id' },
  building: { id: 'building_id' },
  apartments: { id: 'apartments_id', buildingId: 'apartments_building_id', unit: 'unit' },
  payments: { id: 'payments_id', apartmentId: 'payments_apartment_id', month: 'month', year: 'year', status: 'status' },
}));

import * as paymentActions from '@/app/actions/payments';

describe('Payment Actions', () => {
    let queryBuilder: any;

    beforeEach(() => {
        vi.clearAllMocks();
        queryBuilder = createMockQueryBuilder();
        mockSelect.mockReturnValue(queryBuilder);
        mockInsert.mockReturnValue(queryBuilder);
        mockUpdate.mockReturnValue(queryBuilder);
        mockDelete.mockReturnValue(queryBuilder);
    });

    describe('getPaymentMap', () => {
        it('should return grid data for valid building', async () => {
            const buildingId = 'b1';
            const year = 2023;

            const mockApartments = [
                { id: 1, unit: '1A', buildingId },
                { id: 2, unit: '1B', buildingId }
            ];

            const mockPayments = [
                { apartmentId: 1, month: 1, status: 'paid' },
                { apartmentId: 2, month: 2, status: 'late' }
            ];

            queryBuilder.then
                .mockImplementationOnce((resolve: any) => Promise.resolve(mockApartments).then(resolve)) // select apartments
                .mockImplementationOnce((resolve: any) => Promise.resolve(mockPayments).then(resolve)); // select payments

            const result = await paymentActions.getPaymentMap(buildingId, year);

            expect(result).toHaveLength(2);
            expect(result[0].unit).toBe('1A');
            expect(result[0].payments[1]).toBe('paid');
            expect(result[1].unit).toBe('1B');
            expect(result[1].payments[2]).toBe('late');
        });

        it('should return empty array if no buildingId', async () => {
            const result = await paymentActions.getPaymentMap('', 2023);
            expect(result).toEqual([]);
        });
    });

    describe('updatePaymentStatus', () => {
        it('should update existing payment', async () => {
            const aptId = 1;
            const month = 1;
            const year = 2023;
            const status = 'paid';

            // Check existing: found
            queryBuilder.then
                .mockImplementationOnce((resolve: any) => Promise.resolve([{ id: 100 }]).then(resolve))
                .mockImplementationOnce((resolve: any) => Promise.resolve([]).then(resolve)); // update returns nothing specific needed

            await paymentActions.updatePaymentStatus(aptId, month, year, status);

            expect(mockUpdate).toHaveBeenCalled();
            expect(queryBuilder.set).toHaveBeenCalledWith(expect.objectContaining({ status }));
        });

        it('should insert new payment if not exists', async () => {
            const aptId = 1;
            const month = 1;
            const year = 2023;
            const status = 'paid';

            // Check existing: not found
            queryBuilder.then
                .mockImplementationOnce((resolve: any) => Promise.resolve([]).then(resolve))
                .mockImplementationOnce((resolve: any) => Promise.resolve([]).then(resolve)); // insert

            await paymentActions.updatePaymentStatus(aptId, month, year, status);

            expect(mockInsert).toHaveBeenCalled();
            expect(queryBuilder.values).toHaveBeenCalledWith(expect.objectContaining({ status, apartmentId: aptId }));
        });
    });
});
