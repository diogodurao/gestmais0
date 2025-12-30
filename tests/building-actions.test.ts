import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createBuildingForManager,
  deleteApartment,
  bulkCreateApartments,
  getOrCreateManagerBuilding,
  updateBuilding,
  updateApartment
} from '@/app/actions/building';
import { db } from '@/db';
import { building, apartments, user } from '@/db/schema';

// Mock DB with transaction support
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
            transaction: vi.fn((cb) => cb(mockMethods)),
        }
    };
});

// Mock nanoid
vi.mock('nanoid', () => ({
  customAlphabet: () => () => '123456',
}));

describe('Manager Building Actions', () => {
    const mockManagerId = 'manager-123';
    const mockBuildingId = 'building-123';

    beforeEach(() => {
        vi.clearAllMocks();
        // Ensure chaining works by resetting mockReturnThis
        const methods = ['select', 'from', 'where', 'limit', 'innerJoin', 'leftJoin', 'orderBy', 'insert', 'values', 'returning', 'update', 'set', 'delete'];
        methods.forEach(m => (db as any)[m].mockReturnThis());
    });

    describe('createBuildingForManager', () => {
        it('should create a building and update the user inside a transaction', async () => {
            const mockBuilding = { id: mockBuildingId, name: 'Test Building', managerId: mockManagerId };

            // Setup returns
            (db.insert as any).mockImplementation(() => ({
                values: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([mockBuilding])
                })
            }));

            await createBuildingForManager(mockManagerId, 'Test Building', '123456789');

            expect(db.transaction).toHaveBeenCalled();
            expect(db.insert).toHaveBeenCalledWith(building);
            expect(db.update).toHaveBeenCalledWith(user);
        });
    });

    describe('getOrCreateManagerBuilding', () => {
        it('should use transaction when creating new building', async () => {
             const mockUser = { id: mockManagerId, buildingId: null };

             // Mock getUser
             (db.select as any).mockImplementationOnce(() => ({
                 from: vi.fn().mockReturnValue({
                     where: vi.fn().mockReturnValue({
                         limit: vi.fn().mockResolvedValue([mockUser])
                     })
                 })
             }));

             // Mock getBuildings (empty)
             (db.select as any).mockImplementationOnce(() => ({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockResolvedValue([]) // currentBuildings
                })
            }));

             // Mock insert inside transaction
             (db.insert as any).mockImplementation(() => ({
                 values: vi.fn().mockReturnValue({
                     returning: vi.fn().mockResolvedValue([{ id: mockBuildingId }])
                 })
             }));

             await getOrCreateManagerBuilding(mockManagerId, '123456789');

             expect(db.transaction).toHaveBeenCalled();
             expect(db.insert).toHaveBeenCalledWith(building);
        });
    });

    describe('deleteApartment', () => {
        it('should use transaction to delete payments then apartment', async () => {
            await deleteApartment(1);
            expect(db.transaction).toHaveBeenCalled();
            expect(db.delete).toHaveBeenCalledTimes(2); // payments then apartments
        });
    });

    describe('bulkCreateApartments', () => {
        it('should use transaction and insert non-existing apartments', async () => {
            // Mock existing check to return empty
            (db.select as any).mockImplementation(() => ({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockResolvedValue([])
                    })
                })
            }));

            // Mock insert
            (db.insert as any).mockImplementation(() => ({
                values: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([{ id: 1 }])
                })
            }));

            await bulkCreateApartments(mockBuildingId, '1A, 1B');
            expect(db.transaction).toHaveBeenCalled();
            expect(db.insert).toHaveBeenCalledTimes(2);
        });
    });

    describe('updateBuilding', () => {
        it('should update building details', async () => {
            const updateData = { name: 'New Name' };
            const mockUpdated = { id: mockBuildingId, ...updateData };

            (db.update as any).mockImplementation(() => ({
                set: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        returning: vi.fn().mockResolvedValue([mockUpdated])
                    })
                })
            }));

            const result = await updateBuilding(mockBuildingId, updateData);
            expect(result).toEqual(mockUpdated);
            expect(db.update).toHaveBeenCalledWith(building);
        });
    });

    describe('updateApartment', () => {
        it('should update apartment details', async () => {
            const apartmentId = 1;
            const updateData = { unit: '2B' };
            const mockUpdated = { id: apartmentId, ...updateData };

            (db.update as any).mockImplementation(() => ({
                set: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        returning: vi.fn().mockResolvedValue([mockUpdated])
                    })
                })
            }));

            const result = await updateApartment(apartmentId, updateData);
            expect(result).toEqual(mockUpdated);
            expect(db.update).toHaveBeenCalledWith(apartments);
        });
    });
});
