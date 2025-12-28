import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    createBuildingForManager,
    updateBuilding,
    createApartment,
    deleteApartment,
    bulkCreateApartments,
    getOrCreateManagerBuilding
} from '@/app/actions/building';
import { db } from '@/db';
import { building, user, apartments, payments } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// Mock the db module
vi.mock('@/db', () => {
    return {
        db: {
            select: vi.fn(),
            insert: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            transaction: vi.fn((callback) => callback(db)), // Execute callback immediately with db as tx
        },
    };
});

describe('Manager CRUD Operations', () => {
    const mockManagerId = 'manager-123';
    const mockBuildingId = 'building-123';

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup default mock returns for chained calls
        const mockReturnThis = vi.fn().mockReturnThis();

        // Mock implementation for db methods to support chaining: .from().where().limit().then() or .values().returning()
        // We need to support specific chains used in the code.

        // Helper to mock the chain for SELECT
        const createSelectChain = (returnValue: any[]) => {
            const chain = {
                from: vi.fn().mockReturnThis(),
                innerJoin: vi.fn().mockReturnThis(),
                leftJoin: vi.fn().mockReturnThis(),
                where: vi.fn().mockReturnThis(),
                orderBy: vi.fn().mockReturnThis(),
                limit: vi.fn().mockReturnThis(),
                then: vi.fn().mockImplementation((callback) => Promise.resolve(callback(returnValue))),
            };
            return chain;
        };

        // Helper to mock the chain for INSERT/UPDATE
        const createMutationChain = (returnValue: any[]) => {
            const chain = {
                values: vi.fn().mockReturnThis(),
                set: vi.fn().mockReturnThis(),
                where: vi.fn().mockReturnThis(),
                returning: vi.fn().mockReturnValue(Promise.resolve(returnValue)),
            };
            return chain;
        };

         // Helper to mock the chain for DELETE
        const createDeleteChain = (returnValue: any[]) => {
            const chain = {
                where: vi.fn().mockReturnValue(Promise.resolve(returnValue)),
            };
            return chain;
        };

        (db.select as any).mockImplementation(() => createSelectChain([]));
        (db.insert as any).mockImplementation(() => createMutationChain([]));
        (db.update as any).mockImplementation(() => createMutationChain([]));
        (db.delete as any).mockImplementation(() => createDeleteChain([]));

        // Ensure transaction mock works for nested calls too if we decide to mock tx object separately,
        // but currently db is passed as tx, so db mocks apply.
        (db.transaction as any).mockImplementation((cb: any) => cb(db));
    });

    describe('createBuildingForManager', () => {
        it('should create a building and update the user', async () => {
            const newBuilding = { id: 'new-b-1', name: 'New B', nif: 'NIF123', code: '123456', managerId: mockManagerId };

            // Mock INSERT building
            const insertChain = {
                values: vi.fn().mockReturnThis(),
                returning: vi.fn().mockReturnValue(Promise.resolve([newBuilding])),
            };
            (db.insert as any).mockReturnValueOnce(insertChain);

            // Mock UPDATE user
            const updateChain = {
                set: vi.fn().mockReturnThis(),
                where: vi.fn().mockReturnThis(),
                returning: vi.fn().mockReturnValue(Promise.resolve([])), // Return value not used
            };
            (db.update as any).mockReturnValueOnce(updateChain);

            const result = await createBuildingForManager(mockManagerId, 'New B', 'NIF123');

            expect(result).toEqual(newBuilding);
            expect(db.transaction).toHaveBeenCalled();
            expect(db.insert).toHaveBeenCalledWith(building);
            expect(insertChain.values).toHaveBeenCalledWith(expect.objectContaining({
                name: 'New B',
                nif: 'NIF123',
                managerId: mockManagerId,
            }));
            expect(db.update).toHaveBeenCalledWith(user);
            expect(updateChain.set).toHaveBeenCalledWith({ buildingId: newBuilding.id });
        });
    });

    describe('updateBuilding', () => {
        it('should update building details', async () => {
            const updatedData = { name: 'Updated Name', nif: 'New NIF' };
            const updatedBuilding = { id: mockBuildingId, ...updatedData };

            const updateChain = {
                set: vi.fn().mockReturnThis(),
                where: vi.fn().mockReturnThis(),
                returning: vi.fn().mockReturnValue(Promise.resolve([updatedBuilding])),
            };
            (db.update as any).mockReturnValue(updateChain);

            const result = await updateBuilding(mockBuildingId, updatedData);

            expect(result).toEqual(updatedBuilding);
            expect(db.update).toHaveBeenCalledWith(building);
            expect(updateChain.set).toHaveBeenCalledWith(expect.objectContaining(updatedData));
            expect(updateChain.where).toHaveBeenCalled();
        });
    });

    describe('createApartment', () => {
        it('should create a new apartment if it does not exist', async () => {
            const unit = '1A';
            const newApartment = { id: 1, buildingId: mockBuildingId, unit };

            // Mock SELECT to check existence (return empty array)
            const selectChain = {
                from: vi.fn().mockReturnThis(),
                where: vi.fn().mockReturnThis(),
                limit: vi.fn().mockReturnThis(),
                then: vi.fn().mockImplementation((cb) => Promise.resolve(cb([]))),
            };
            (db.select as any).mockReturnValueOnce(selectChain);

            // Mock INSERT
            const insertChain = {
                values: vi.fn().mockReturnThis(),
                returning: vi.fn().mockReturnValue(Promise.resolve([newApartment])),
            };
            (db.insert as any).mockReturnValueOnce(insertChain);

            const result = await createApartment(mockBuildingId, unit);

            expect(result).toEqual(newApartment);
            expect(db.insert).toHaveBeenCalledWith(apartments);
            expect(insertChain.values).toHaveBeenCalledWith({ buildingId: mockBuildingId, unit });
        });

        it('should throw error if apartment already exists', async () => {
            const unit = '1A';
            const existingApartment = { id: 1, buildingId: mockBuildingId, unit };

            // Mock SELECT to return existing apartment
            const selectChain = {
                from: vi.fn().mockReturnThis(),
                where: vi.fn().mockReturnThis(),
                limit: vi.fn().mockReturnThis(),
                then: vi.fn().mockImplementation((cb) => Promise.resolve(cb([existingApartment]))),
            };
            (db.select as any).mockReturnValueOnce(selectChain);

            await expect(createApartment(mockBuildingId, unit)).rejects.toThrow('Apartment already exists');
            expect(db.insert).not.toHaveBeenCalled();
        });
    });

    describe('deleteApartment', () => {
        it('should delete payments and then the apartment', async () => {
            const apartmentId = 10;

            // Mock DELETE payments
            const deletePaymentsChain = {
                where: vi.fn().mockReturnValue(Promise.resolve([])),
            };
            (db.delete as any).mockReturnValueOnce(deletePaymentsChain);

            // Mock DELETE apartment
            const deleteApartmentChain = {
                where: vi.fn().mockReturnValue(Promise.resolve([])),
            };
            (db.delete as any).mockReturnValueOnce(deleteApartmentChain);

            const result = await deleteApartment(apartmentId);

            expect(result).toBe(true);
            expect(db.transaction).toHaveBeenCalled();

            // First call should be to delete payments
            expect(db.delete).toHaveBeenNthCalledWith(1, payments);
            expect(deletePaymentsChain.where).toHaveBeenCalled(); // We can't easily check eq arguments here without deeper mocking of eq, but verifying the call order is key.

            // Second call should be to delete apartment
            expect(db.delete).toHaveBeenNthCalledWith(2, apartments);
            expect(deleteApartmentChain.where).toHaveBeenCalled();
        });
    });

    describe('bulkCreateApartments', () => {
        it('should create multiple apartments skipping existing ones', async () => {
            const unitsString = '1A, 1B, 2A';
            const units = ['1A', '1B', '2A'];
            const newApt1 = { id: 1, unit: '1A' };
            const newApt2 = { id: 2, unit: '1B' };
            const newApt3 = { id: 3, unit: '2A' };

            // 1A: doesn't exist
            const selectChain1 = {
                from: vi.fn().mockReturnThis(),
                where: vi.fn().mockReturnThis(),
                limit: vi.fn().mockReturnThis(),
                then: vi.fn().mockImplementation((cb) => Promise.resolve(cb([]))),
            };

            // 1B: exists
            const selectChain2 = {
                from: vi.fn().mockReturnThis(),
                where: vi.fn().mockReturnThis(),
                limit: vi.fn().mockReturnThis(),
                then: vi.fn().mockImplementation((cb) => Promise.resolve(cb([{ id: 2, unit: '1B' }]))),
            };

            // 2A: doesn't exist
             const selectChain3 = {
                from: vi.fn().mockReturnThis(),
                where: vi.fn().mockReturnThis(),
                limit: vi.fn().mockReturnThis(),
                then: vi.fn().mockImplementation((cb) => Promise.resolve(cb([]))),
            };

            (db.select as any)
                .mockReturnValueOnce(selectChain1)
                .mockReturnValueOnce(selectChain2)
                .mockReturnValueOnce(selectChain3);

            const insertChain1 = {
                values: vi.fn().mockReturnThis(),
                returning: vi.fn().mockReturnValue(Promise.resolve([newApt1])),
            };
            const insertChain2 = {
                values: vi.fn().mockReturnThis(),
                returning: vi.fn().mockReturnValue(Promise.resolve([newApt3])),
            };

             (db.insert as any)
                .mockReturnValueOnce(insertChain1)
                .mockReturnValueOnce(insertChain2);


            const result = await bulkCreateApartments(mockBuildingId, unitsString);

            expect(result).toHaveLength(2); // 1A and 2A
            expect(result).toEqual([newApt1, newApt3]);
            expect(db.transaction).toHaveBeenCalled();

            // Should have called select 3 times
            expect(db.select).toHaveBeenCalledTimes(3);

            // Should have called insert 2 times
            expect(db.insert).toHaveBeenCalledTimes(2);
        });
    });
});
