
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
        mockDb.__queueResolvedValue([{ id: buildingId, code: 'SUNSET' }]); // select building
        mockDb.__queueResolvedValue([]); // update user

        const result = await buildingActions.joinBuilding(residentId, 'SUNSET');

        expect(result.id).toBe(buildingId);
        expect(mockDb.select).toHaveBeenCalled();
        expect(mockDb.update).toHaveBeenCalled();
    });

    it('should fail to join with incorrect code', async () => {
        mockDb.__queueResolvedValue([]); // not found

        await expect(buildingActions.joinBuilding(residentId, 'WRONG')).rejects.toThrow("Invalid building code");
    });

    it('should claim an apartment', async () => {
        (auth.api.getSession as any).mockResolvedValue({
            user: { id: residentId }
        });

        mockDb.__queueResolvedValue([{ id: apartmentId, residentId: null }]); // find apt
        mockDb.__queueResolvedValue([{ id: apartmentId, residentId }]); // update apt

        const result = await buildingActions.claimApartment(apartmentId);

        expect(result.id).toBe(apartmentId);
        expect(mockDb.update).toHaveBeenCalled();
    });

    it('should fail to claim already claimed apartment', async () => {
         (auth.api.getSession as any).mockResolvedValue({
            user: { id: residentId }
        });

        mockDb.__queueResolvedValue([{ id: apartmentId, residentId: 'other-guy' }]); // find apt

        await expect(buildingActions.claimApartment(apartmentId)).rejects.toThrow("Apartment already claimed");
    });

    it('should create a new building for manager', async () => {
        const managerId = 'manager-1';
        const newBuilding = { id: 'new-b', name: 'New Place', code: 'NEWCODE' };

        // Transaction flow:
        // 1. insert building
        // 2. insert junction
        // 3. update user

        mockDb.__queueResolvedValue([newBuilding]);
        mockDb.__queueResolvedValue([]);
        mockDb.__queueResolvedValue([]);

        const newB = await buildingActions.createNewBuilding(managerId, 'New Place', '999999999');

        expect(newB).toEqual(newBuilding);
        expect(mockDb.transaction).toHaveBeenCalled();
        expect(mockDb.insert).toHaveBeenCalledTimes(2);
        expect(mockDb.update).toHaveBeenCalled();
    });
});
