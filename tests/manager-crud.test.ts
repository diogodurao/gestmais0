
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
        const newApt = { id: 1, buildingId, floor: '1', unitType: 'apartment', identifier: 'A', permillage: 10 };

        mockDb.__queueResolvedValue([]); // select check (empty)
        mockDb.__queueResolvedValue([newApt]); // insert returning

        const apt = await buildingActions.createApartment(buildingId, {
            floor: '1',
            unitType: 'apartment',
            identifier: 'A',
            permillage: 10,
        });

        expect(apt).toEqual(newApt);
        expect(mockDb.insert).toHaveBeenCalledWith(apartments);
    });

    it('should fail to create duplicate apartment', async () => {
        mockDb.__queueResolvedValue([{ id: 1 }]); // select check (found)

        await expect(buildingActions.createApartment(buildingId, {
            floor: '1',
            unitType: 'apartment',
            identifier: 'A',
        })).rejects.toThrow("Unit already exists on this floor");
    });

    it('should update an apartment', async () => {
        const updatedApt = { id: 1, identifier: 'B' };
        mockDb.__queueResolvedValue([updatedApt]); // update returning

        const updated = await buildingActions.updateApartment(1, {
            identifier: 'B',
        });

        expect(updated).toEqual(updatedApt);
    });

    it('should delete an apartment', async () => {
        // Transaction: delete payments, delete apartment
        mockDb.__queueResolvedValue([]); // delete payments
        mockDb.__queueResolvedValue([]); // delete apartment

        await buildingActions.deleteApartment(1);

        expect(mockDb.delete).toHaveBeenCalledTimes(2);
    });

    it('should get building apartments', async () => {
        const mockData = [
            { apartment: { id: 1 }, resident: null },
            { apartment: { id: 2 }, resident: { id: 'u1' } }
        ];

        mockDb.__queueResolvedValue(mockData);

        const results = await buildingActions.getBuildingApartments(buildingId);
        expect(results).toEqual(mockData);
    });

    it('should update building details', async () => {
        const updatedBuilding = { id: buildingId, city: 'Lisbon' };
        mockDb.__queueResolvedValue([updatedBuilding]);

        const updated = await buildingActions.updateBuilding(buildingId, {
            city: 'Lisbon',
            quotaMode: 'permillage'
        });

        expect(updated).toEqual(updatedBuilding);
    });
});
