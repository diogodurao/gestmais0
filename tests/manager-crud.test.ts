
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mockDb, resetMocks } from './mocks';
import * as buildingActions from '../src/app/actions/building';
import { building, user, apartments, managerBuildings } from '../src/db/schema';

// Mock the db module
vi.mock('../src/db', () => ({
  db: mockDb,
}));

// Mock nanoid
vi.mock('nanoid', () => ({
  customAlphabet: () => () => '123456',
}));

// Mock headers
vi.mock('next/headers', () => ({
  headers: () => new Headers(),
}));

// Mock auth
vi.mock('../src/lib/auth', () => ({
    auth: {
        api: {
            getSession: vi.fn()
        }
    }
}));

describe('Manager CRUD Operations', () => {
    const buildingId = 'building-1';

    beforeEach(() => {
        resetMocks();
    });

    it('should create an apartment', async () => {
        // Mock checking existing apartment (return empty array = no duplicate)
        mockDb.limit.mockResolvedValueOnce([]);

        // Mock insert return
        const newApt = { id: 1, buildingId, floor: '1', unitType: 'apartment', identifier: 'A', permillage: 10 };
        mockDb.returning.mockResolvedValueOnce([newApt]);

        const apt = await buildingActions.createApartment(buildingId, {
            floor: '1',
            unitType: 'apartment',
            identifier: 'A',
            permillage: 10,
        });

        expect(apt).toEqual(newApt);
        expect(mockDb.insert).toHaveBeenCalledWith(apartments);
        expect(mockDb.values).toHaveBeenCalledWith({
            buildingId,
            floor: '1',
            unitType: 'apartment',
            identifier: 'A',
            permillage: 10,
        });
    });

    it('should fail to create duplicate apartment', async () => {
        // Mock checking existing apartment (return non-empty = duplicate exists)
        mockDb.limit.mockResolvedValueOnce([{ id: 1 }]);

        await expect(buildingActions.createApartment(buildingId, {
            floor: '1',
            unitType: 'apartment',
            identifier: 'A',
        })).rejects.toThrow("Unit already exists on this floor");
    });

    it('should update an apartment', async () => {
        const updatedApt = { id: 1, identifier: 'B' };
        mockDb.returning.mockResolvedValueOnce([updatedApt]);

        const updated = await buildingActions.updateApartment(1, {
            identifier: 'B',
        });

        expect(updated).toEqual(updatedApt);
        expect(mockDb.update).toHaveBeenCalledWith(apartments);
        expect(mockDb.set).toHaveBeenCalledWith({ identifier: 'B' });
    });

    it('should delete an apartment', async () => {
        // deleteApartment does 2 deletes: payments then apartments
        mockDb.where.mockResolvedValueOnce([]); // delete payments
        mockDb.where.mockResolvedValueOnce([]); // delete apartment

        await buildingActions.deleteApartment(1);

        expect(mockDb.delete).toHaveBeenCalledTimes(2);
    });

    it('should get building apartments', async () => {
        const mockData = [
            { apartment: { id: 1 }, resident: null },
            { apartment: { id: 2 }, resident: { id: 'u1' } }
        ];

        // Mock chain: select -> from -> leftJoin -> where -> orderBy
        mockDb.orderBy.mockResolvedValueOnce(mockData);

        const results = await buildingActions.getBuildingApartments(buildingId);
        expect(results).toEqual(mockData);
        expect(mockDb.select).toHaveBeenCalled();
        expect(mockDb.where).toHaveBeenCalled();
    });

    it('should update building details', async () => {
        const updatedBuilding = { id: buildingId, city: 'Lisbon' };
        mockDb.returning.mockResolvedValueOnce([updatedBuilding]);

        const updated = await buildingActions.updateBuilding(buildingId, {
            city: 'Lisbon',
            quotaMode: 'permillage'
        });

        expect(updated).toEqual(updatedBuilding);
        expect(mockDb.update).toHaveBeenCalledWith(building);
        expect(mockDb.set).toHaveBeenCalledWith(expect.objectContaining({
            city: 'Lisbon',
            quotaMode: 'permillage'
        }));
    });
});
