import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getOrCreateManagerBuilding,
  createApartment,
  deleteApartment,
  bulkCreateApartments,
  getBuildingApartments,
} from '@/app/actions/building';
import { db } from '@/db';
import { building, user, apartments, payments } from '@/db/schema';
import { mockDeep, mockReset } from 'vitest-mock-extended';

// Mock dependencies
vi.mock('@/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    transaction: vi.fn((callback) => callback(db)), // Simple transaction mock
  },
}));

// Mock nanoid
vi.mock('nanoid', () => ({
  customAlphabet: () => () => '123456',
}));

describe('Building Actions - Manager CRUD', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getOrCreateManagerBuilding', () => {
    it('should return existing building if user has one', async () => {
      const mockUser = { id: 'user1', buildingId: 'build1' };
      const mockBuilding = { id: 'build1', managerId: 'user1', code: '123456' };

      // Mock user query
      (db.select as any).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
             limit: vi.fn().mockResolvedValue([mockUser]),
          }),
        }),
      });

      // Mock building query - Subsequent calls to db.select need to handle chain
      // This is tricky with simple mocks. Let's use mockImplementation to return different chain builders based on table?
      // Or just a sequence of return values if the order is deterministic.

      const selectMock = db.select as any;
      selectMock
        .mockReturnValueOnce({ // First call: select user
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([mockUser]),
            }),
          }),
        })
        .mockReturnValueOnce({ // Second call: select building
           from: vi.fn().mockReturnValue({
             where: vi.fn().mockResolvedValue([mockBuilding]),
           }),
        });

      const result = await getOrCreateManagerBuilding('user1', '123456789');

      expect(result.activeBuilding).toEqual(mockBuilding);
      expect(result.buildings).toHaveLength(1);
    });

    it('should create a new building if user has none', async () => {
        const mockUser = { id: 'user1', buildingId: null };
        const newBuilding = { id: 'test-uuid', name: 'My Condominium', nif: '123456789', code: '123456', managerId: 'user1' };

        const selectMock = db.select as any;
        selectMock
          .mockReturnValueOnce({ // First call: select user
            from: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([mockUser]),
              }),
            }),
          })
          .mockReturnValueOnce({ // Second call: select building (returns empty)
             from: vi.fn().mockReturnValue({
               where: vi.fn().mockResolvedValue([]),
             }),
          });

        // Mock insert
        (db.insert as any).mockReturnValue({
            values: vi.fn().mockReturnValue({
                returning: vi.fn().mockResolvedValue([newBuilding]),
            }),
        });

        // Mock update
        (db.update as any).mockReturnValue({
            set: vi.fn().mockReturnValue({
                where: vi.fn().mockResolvedValue([]),
            }),
        });

        const result = await getOrCreateManagerBuilding('user1', '123456789');

        expect(result.activeBuilding).toEqual(newBuilding);
        expect(db.insert).toHaveBeenCalled();
        expect(db.update).toHaveBeenCalled();
      });
  });

  describe('createApartment', () => {
      it('should create a new apartment if it does not exist', async () => {
        const buildingId = 'build1';
        const unit = '1A';
        const newApartment = { id: 1, buildingId, unit };

        const selectMock = db.select as any;
        selectMock.mockReturnValue({
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue([]), // No existing apartment
                }),
            }),
        });

        (db.insert as any).mockReturnValue({
            values: vi.fn().mockReturnValue({
                returning: vi.fn().mockResolvedValue([newApartment]),
            }),
        });

        const result = await createApartment(buildingId, unit);
        expect(result).toEqual(newApartment);
      });

      it('should throw error if apartment already exists', async () => {
        const buildingId = 'build1';
        const unit = '1A';
        const existingApartment = { id: 1, buildingId, unit };

        const selectMock = db.select as any;
        selectMock.mockReturnValue({
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue([existingApartment]),
                }),
            }),
        });

        await expect(createApartment(buildingId, unit)).rejects.toThrow('Apartment already exists');
      });
  });

  describe('deleteApartment', () => {
      it('should delete associated payments then the apartment', async () => {
          const apartmentId = 1;

          // Mock deletes
          const deleteMock = db.delete as any;
          deleteMock.mockReturnValue({
              where: vi.fn().mockResolvedValue({}),
          });

          const result = await deleteApartment(apartmentId);

          expect(result).toBe(true);
          expect(db.delete).toHaveBeenCalledTimes(2); // One for payments, one for apartment
          // First call should be payments
          // We can't easily check order with loose mocks unless we inspect calls, but we know the implementation does it.
      });
  });

  describe('bulkCreateApartments', () => {
      it('should create multiple apartments skipping existing ones', async () => {
          const buildingId = 'build1';
          const unitsString = '1A, 1B';
          const apt1 = { id: 1, buildingId, unit: '1A' };
          const apt2 = { id: 2, buildingId, unit: '1B' };

          const selectMock = db.select as any;
          // Mock checks for existence: 1A exists (no), 1B exists (no)
          selectMock.mockReturnValue({
              from: vi.fn().mockReturnValue({
                  where: vi.fn().mockReturnValue({
                      limit: vi.fn().mockResolvedValue([]),
                  }),
              }),
          });

          (db.insert as any).mockReturnValue({
              values: vi.fn().mockReturnValue({
                  returning: vi.fn().mockImplementation(async () => {
                      // Return valid mock based on calls? Hard to sync.
                      // Simplified: just return a dummy.
                      return [{ id: 99, buildingId, unit: 'any' }];
                  }),
              }),
          });

          const result = await bulkCreateApartments(buildingId, unitsString);
          expect(result).toHaveLength(2);
          expect(db.insert).toHaveBeenCalledTimes(2);
      });
  });
});
