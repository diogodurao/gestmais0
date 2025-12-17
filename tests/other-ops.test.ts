
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockDb, resetMocks } from './mocks';
import * as buildingActions from '../src/app/actions/building';
import { building, user, apartments, managerBuildings } from '../src/db/schema';
import { auth } from '../src/lib/auth';

// Mock the db module
vi.mock('../src/db', () => ({
  db: mockDb,
}));

// Mock nanoid
vi.mock('nanoid', () => ({
  customAlphabet: () => () => 'NEWCODE',
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


describe('Resident and Building Operations', () => {
    const residentId = 'resident-1';
    const buildingId = 'building-1';
    const apartmentId = 1;

    beforeEach(() => {
        resetMocks();
    });

    it('should join a building with correct code', async () => {
        // Mock finding building
        mockDb.limit.mockResolvedValueOnce([{ id: buildingId, code: 'SUNSET' }]);
        // Mock update user
        mockDb.where.mockResolvedValueOnce([]);

        const result = await buildingActions.joinBuilding(residentId, 'SUNSET');

        expect(result.id).toBe(buildingId);
        expect(mockDb.select).toHaveBeenCalledWith();
        expect(mockDb.from).toHaveBeenCalledWith(building);
        expect(mockDb.update).toHaveBeenCalledWith(user);
        expect(mockDb.set).toHaveBeenCalledWith({ buildingId });
    });

    it('should fail to join with incorrect code', async () => {
        // Mock finding building -> none found
        mockDb.limit.mockResolvedValueOnce([]);

        await expect(buildingActions.joinBuilding(residentId, 'WRONG')).rejects.toThrow("Invalid building code");
    });

    it('should claim an apartment', async () => {
        // Mock auth session
        (auth.api.getSession as any).mockResolvedValue({
            user: { id: residentId }
        });

        // Mock getting apartment (exists and unclaimed)
        mockDb.limit.mockResolvedValueOnce([{ id: apartmentId, residentId: null }]);

        // Mock update
        mockDb.where.mockResolvedValueOnce([]);

        const result = await buildingActions.claimApartment(apartmentId);

        expect(result.id).toBe(apartmentId);
        expect(mockDb.update).toHaveBeenCalledWith(apartments);
        expect(mockDb.set).toHaveBeenCalledWith({ residentId });
    });

    it('should fail to claim already claimed apartment', async () => {
         // Mock auth session
         (auth.api.getSession as any).mockResolvedValue({
            user: { id: residentId }
        });

        // Mock getting apartment (exists but claimed)
        mockDb.limit.mockResolvedValueOnce([{ id: apartmentId, residentId: 'other-guy' }]);

        await expect(buildingActions.claimApartment(apartmentId)).rejects.toThrow("Apartment already claimed");
    });

    it('should create a new building for manager', async () => {
        const managerId = 'manager-1';
        const newBuilding = { id: 'new-b', name: 'New Place', code: 'NEWCODE' };

        // Mock insert building
        mockDb.returning.mockResolvedValueOnce([newBuilding]);

        // Mock insert managerBuildings
        mockDb.values.mockResolvedValueOnce([]);

        // Mock update user
        mockDb.where.mockResolvedValueOnce([]);

        const newB = await buildingActions.createNewBuilding(managerId, 'New Place', '999999999');

        expect(newB).toEqual(newBuilding);

        expect(mockDb.insert).toHaveBeenCalledTimes(2); // building + junction
        expect(mockDb.insert).toHaveBeenNthCalledWith(1, building);
        expect(mockDb.insert).toHaveBeenNthCalledWith(2, managerBuildings);

        expect(mockDb.update).toHaveBeenCalledWith(user);
        expect(mockDb.set).toHaveBeenCalledWith({ activeBuildingId: newBuilding.id });
    });
});
