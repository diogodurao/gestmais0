import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockDb } from './mocks/db';

// Hoist mocks for Drizzle
const { mockDb, resetMockDb } = vi.hoisted(() => {
    // We cannot import createMockDb inside vi.hoisted because of hoisting rules,
    // so we duplicate the minimal setup or just use a factory.
    // However, to use the shared file properly with vi.mock, we often need to rely on the module system.
    // But since we want to return the mock object from vi.hoisted to use it in tests, it's tricky.

    // Instead, let's redefine the mock here or use a specific pattern.
    // A better approach with vi.hoisted is to create the object and return it.

    // Since I cannot import inside vi.hoisted easily without 'await import',
    // and vi.mock needs to be outside, I will stick to the pattern but try to simplify.

    // Actually, I can just use the implementation I just wrote if I copy it, or I can try to use a slightly different pattern.
    // But to satisfy the DRY requirement, I should probably use `vi.mock` for the db module using a factory that imports the shared mock.

    // Let's try this:
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

// Mock nanoid
vi.mock('nanoid', () => ({
    customAlphabet: () => () => '123456',
}));

import * as actions from '@/app/actions/building';

describe('Building Server Actions', () => {
    beforeEach(() => {
        resetMockDb();
    });

    describe('createBuildingForManager', () => {
        it('should create a building and link it to the manager', async () => {
            const managerId = 'manager-123';
            const buildingName = 'Test Building';
            const nif = '123456789';

            // Mock insert return
            const newBuilding = { id: 'building-uuid', name: buildingName, nif, code: '123456', managerId };
            mockDb.returning.mockResolvedValueOnce([newBuilding]);

            const result = await actions.createBuildingForManager(managerId, buildingName, nif);

            expect(mockDb.insert).toHaveBeenCalled();
            expect(mockDb.update).toHaveBeenCalled();
            expect(result).toEqual(newBuilding);
        });
    });

    describe('updateBuilding', () => {
        it('should update building details', async () => {
            const buildingId = 'building-123';
            const updateData = { name: 'Updated Name', city: 'Lisbon' };
            const updatedBuilding = { id: buildingId, ...updateData };

            mockDb.returning.mockResolvedValueOnce([updatedBuilding]);

            const result = await actions.updateBuilding(buildingId, updateData);

            expect(mockDb.update).toHaveBeenCalled();
            expect(result).toEqual(updatedBuilding);
        });
    });

    describe('createApartment', () => {
        it('should create a new apartment if it does not exist', async () => {
            const buildingId = 'building-123';
            const unit = '1A';

            // Mock existing check to return empty array (not found)
            mockDb.limit.mockResolvedValueOnce([]);

            // Mock insert return
            const newApartment = { id: 1, buildingId, unit };
            mockDb.returning.mockResolvedValueOnce([newApartment]);

            const result = await actions.createApartment(buildingId, unit);

            expect(mockDb.select).toHaveBeenCalled(); // Check existence
            expect(mockDb.insert).toHaveBeenCalled(); // Create
            expect(result).toEqual(newApartment);
        });

        it('should throw error if apartment already exists', async () => {
            const buildingId = 'building-123';
            const unit = '1A';

            // Mock existing check to return found apartment
            mockDb.limit.mockResolvedValueOnce([{ id: 1 }]);

            await expect(actions.createApartment(buildingId, unit)).rejects.toThrow("Apartment already exists");
            expect(mockDb.insert).not.toHaveBeenCalled();
        });
    });

    describe('deleteApartment', () => {
        it('should delete an apartment and its payments', async () => {
            const apartmentId = 1;

            await actions.deleteApartment(apartmentId);

            // Expect delete on payments first
            expect(mockDb.delete).toHaveBeenCalledTimes(2);
        });
    });

    describe('bulkCreateApartments', () => {
        it('should create multiple apartments skipping existing ones', async () => {
            const buildingId = 'building-123';
            const unitsString = "1A, 1B";

            // Mock logic:
            // Loop 1 (1A):
            // Check existence -> empty
            // Insert -> success
            // Loop 2 (1B):
            // Check existence -> exists
            // Insert -> skipped

            // We need to sequence the mock returns
            mockDb.limit
                .mockResolvedValueOnce([]) // 1A not found
                .mockResolvedValueOnce([{ id: 2 }]); // 1B found

            mockDb.returning.mockResolvedValueOnce([{ id: 1, unit: '1A', buildingId }]);

            const result = await actions.bulkCreateApartments(buildingId, unitsString);

            expect(result).toHaveLength(1);
            expect(result[0].unit).toBe('1A');
        });
    });
});
