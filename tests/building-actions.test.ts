import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    createNewBuilding,
    updateBuilding,
    createApartment,
    updateApartment,
    deleteApartment,
    bulkCreateApartments
} from '@/app/actions/building';
import { db } from '@/db';

// Mock the db module
// We need to define the mock object first to reference it inside itself (or use a workaround)
// Since vi.mock is hoisted, we can't reference outer variables.
// We can construct the mock object inside the factory.

vi.mock('@/db', () => {
    const mockDb = {
        select: vi.fn(),
        insert: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        transaction: vi.fn(),
    };

    // Implement transaction to call the callback with the mockDb itself
    mockDb.transaction.mockImplementation((callback) => callback(mockDb));

    return {
        db: mockDb
    };
});

// Mock nanoid
vi.mock('nanoid', () => ({
    customAlphabet: () => () => '123456',
}));

describe('Manager Building Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createNewBuilding', () => {
        it('should create a new building and assign it to the manager', async () => {
            const userId = 'user-1';
            const name = 'New Building';
            const nif = '123456789';

            // Mock implementation for db.insert
            const returningMock = vi.fn().mockResolvedValue([{ id: 'new-building-id', name, nif, code: '123456', managerId: userId }]);
            const valuesMock = vi.fn().mockReturnValue({ returning: returningMock });
            // const insertMock = vi.fn().mockReturnValue({ values: valuesMock });

            // Robust mock implementation for insert
            (db.insert as any).mockImplementation(() => ({
                values: vi.fn().mockImplementation((val) => {
                    // If it's the building insert (has managerId and code), return 'returning' mock
                    if (val.code === '123456') {
                        return { returning: returningMock };
                    }
                    // If it's junction table, just resolve (it awaits a promise)
                    return Promise.resolve({});
                })
            }));

            // Mock db.update for user active building
            (db.update as any).mockReturnValue({
                set: vi.fn().mockReturnValue({
                    where: vi.fn().mockResolvedValue({})
                })
            });

            const result = await createNewBuilding(userId, name, nif);

            expect(result).toBeDefined();
            expect(result.id).toBe('new-building-id');
            expect(result.name).toBe(name);
            expect(db.insert).toHaveBeenCalledTimes(2);
            expect(db.update).toHaveBeenCalledTimes(1);
        });
    });

    describe('updateBuilding', () => {
        it('should update building details', async () => {
            const buildingId = 'building-1';
            const data = { name: 'Updated Name', city: 'Lisbon' };

            const updateMock = vi.fn().mockReturnValue({
                set: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        returning: vi.fn().mockResolvedValue([{ id: buildingId, ...data }])
                    })
                })
            });
            (db.update as any).mockImplementation(updateMock);

            const result = await updateBuilding(buildingId, data);

            expect(result).toBeDefined();
            expect(result.name).toBe('Updated Name');
            expect(result.city).toBe('Lisbon');
        });
    });

    describe('Apartment CRUD', () => {
        const buildingId = 'building-1';

        describe('createApartment', () => {
            it('should create a new apartment if not exists', async () => {
                const data = { floor: '1', unitType: 'apartment', identifier: 'A', permillage: 10 };

                // Mock check existence (return empty)
                const selectMock = vi.fn().mockReturnValue({
                    from: vi.fn().mockReturnValue({
                        where: vi.fn().mockReturnValue({
                            limit: vi.fn().mockResolvedValue([])
                        })
                    })
                });
                (db.select as any).mockImplementation(selectMock);

                // Mock insert
                const returningMock = vi.fn().mockResolvedValue([{ id: 1, buildingId, ...data }]);
                const valuesMock = vi.fn().mockReturnValue({ returning: returningMock });
                const insertMock = vi.fn().mockReturnValue({ values: valuesMock });

                (db.insert as any).mockImplementation(insertMock);

                const result = await createApartment(buildingId, data);

                expect(result.identifier).toBe('A');
                expect(db.insert).toHaveBeenCalled();
            });

            it('should throw error if apartment exists', async () => {
                const data = { floor: '1', unitType: 'apartment', identifier: 'A' };

                // Mock check existence (return existing)
                const selectMock = vi.fn().mockReturnValue({
                    from: vi.fn().mockReturnValue({
                        where: vi.fn().mockReturnValue({
                            limit: vi.fn().mockResolvedValue([{ id: 1 }])
                        })
                    })
                });
                (db.select as any).mockImplementation(selectMock);

                await expect(createApartment(buildingId, data)).rejects.toThrow('Unit already exists on this floor');
            });
        });

        describe('updateApartment', () => {
            it('should update apartment', async () => {
                const aptId = 1;
                const data = { floor: '2' };

                const updateMock = vi.fn().mockReturnValue({
                    set: vi.fn().mockReturnValue({
                        where: vi.fn().mockReturnValue({
                            returning: vi.fn().mockResolvedValue([{ id: aptId, ...data }])
                        })
                    })
                });
                (db.update as any).mockImplementation(updateMock);

                const result = await updateApartment(aptId, data);
                expect(result.floor).toBe('2');
            });
        });

        describe('deleteApartment', () => {
            it('should delete apartment and related payments', async () => {
                const aptId = 1;

                // Mock deletes
                const deleteMock = vi.fn().mockReturnValue({
                    where: vi.fn().mockResolvedValue({})
                });
                (db.delete as any).mockImplementation(deleteMock);

                await deleteApartment(aptId);

                expect(db.delete).toHaveBeenCalledTimes(2); // Payments + Apartment
            });
        });

        describe('bulkCreateApartments', () => {
            it('should create multiple apartments skipping existing ones', async () => {
                const units = [
                    { floor: '1', unitType: 'apartment', identifier: 'A' },
                    { floor: '1', unitType: 'apartment', identifier: 'B' }
                ];

                // Mock check existence: A exists, B does not
                const selectMock = vi.fn().mockReturnValue({
                    from: vi.fn().mockReturnValue({
                        where: vi.fn().mockReturnValue({
                            limit: vi.fn()
                                .mockResolvedValueOnce([{ id: 1 }]) // A exists
                                .mockResolvedValueOnce([]) // B does not exist
                        })
                    })
                });
                (db.select as any).mockImplementation(selectMock);

                // Mock insert
                const returningMock = vi.fn().mockResolvedValue([{ id: 2, floor: '1', identifier: 'B' }]);
                const valuesMock = vi.fn().mockReturnValue({ returning: returningMock });
                const insertMock = vi.fn().mockReturnValue({ values: valuesMock });
                (db.insert as any).mockImplementation(insertMock);

                const result = await bulkCreateApartments(buildingId, units);

                expect(result).toHaveLength(1);
                expect(result[0].identifier).toBe('B');
            });
        });
    });
});
