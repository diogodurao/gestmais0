
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as buildingActions from '@/app/actions/building';
import { db } from '@/db';
import { eq, and } from "drizzle-orm";

// Mock dependencies
vi.mock('@/db');
vi.mock('@/lib/auth');
vi.mock('next/headers');
vi.mock('nanoid', () => ({
  customAlphabet: () => () => 'mocked-code'
}));
vi.mock('drizzle-orm', () => ({
  eq: vi.fn(),
  and: vi.fn(),
  isNull: vi.fn(),
  asc: vi.fn()
}));

// Mock Schema
vi.mock('@/db/schema', () => ({
  building: { id: 'buildingId', name: 'name', nif: 'nif', code: 'code', managerId: 'managerId' },
  user: { id: 'userId', activeBuildingId: 'activeBuildingId' },
  apartments: { id: 'apartmentsId', buildingId: 'buildingId', floor: 'floor', identifier: 'identifier', residentId: 'residentId', unitType: 'unitType', permillage: 'permillage' },
  payments: { apartmentId: 'apartmentId' },
  managerBuildings: { managerId: 'managerId', buildingId: 'buildingId', isOwner: 'isOwner' }
}));

describe('Building Actions', () => {
  const mockDb = db as any;

  beforeEach(() => {
    vi.resetAllMocks();

    // Setup default mock chain for db
    const mockChain = {
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([]),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
      orderBy: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      leftJoin: vi.fn().mockReturnThis(),
    };

    mockDb.insert = vi.fn(() => mockChain);
    mockDb.select = vi.fn(() => mockChain);
    mockDb.update = vi.fn(() => mockChain);
    mockDb.delete = vi.fn(() => mockChain);
  });

  describe('createNewBuilding', () => {
    it('should create a new building and associate it with the user', async () => {
      const userId = 'user-123';
      const name = 'New Building';
      const nif = '123456789';

      const mockBuilding = { id: 'new-id', name, nif, code: 'mocked-code', managerId: userId };

      const insertChain = {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockBuilding])
      };
      mockDb.insert.mockReturnValueOnce(insertChain); // First insert: building

      const insertLinkChain = {
        values: vi.fn().mockResolvedValue(undefined)
      };
      mockDb.insert.mockReturnValueOnce(insertLinkChain); // Second insert: managerBuildings

      const updateChain = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(undefined)
      };
      mockDb.update.mockReturnValue(updateChain);

      const result = await buildingActions.createNewBuilding(userId, name, nif);

      expect(result).toEqual(mockBuilding);
      expect(mockDb.insert).toHaveBeenCalledTimes(2);
      expect(mockDb.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateBuilding', () => {
    it('should update building details', async () => {
      const buildingId = 'b-123';
      const updateData = { name: 'Updated Name', monthlyQuota: 5000 };
      const updatedBuilding = { id: buildingId, ...updateData, updatedAt: new Date() };

      const updateChain = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([updatedBuilding])
      };
      mockDb.update.mockReturnValue(updateChain);

      const result = await buildingActions.updateBuilding(buildingId, updateData);

      expect(result).toEqual(updatedBuilding);
      expect(mockDb.update).toHaveBeenCalled();
      expect(updateChain.set).toHaveBeenCalledWith(expect.objectContaining(updateData));

      // Verify where clause was called with correct ID logic (mocked eq)
      expect(eq).toHaveBeenCalledWith(expect.anything(), buildingId);
      expect(updateChain.where).toHaveBeenCalled();
    });
  });

  describe('createApartment', () => {
    it('should create a new apartment if it does not exist', async () => {
      const buildingId = 'b-123';
      const aptData = { floor: '1', unitType: 'apartment', identifier: 'A' };
      const newApt = { id: 1, buildingId, ...aptData };

      // Mock check existing
      const selectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]) // No existing apartment
      };
      mockDb.select.mockReturnValue(selectChain);

      // Mock insert
      const insertChain = {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([newApt])
      };
      mockDb.insert.mockReturnValue(insertChain);

      const result = await buildingActions.createApartment(buildingId, aptData);

      expect(result).toEqual(newApt);

      // Verify 'and' was called for the where clause
      expect(and).toHaveBeenCalled();
    });

    it('should throw error if apartment already exists', async () => {
      const buildingId = 'b-123';
      const aptData = { floor: '1', unitType: 'apartment', identifier: 'A' };

      // Mock check existing
      const selectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ id: 1 }]) // Exists
      };
      mockDb.select.mockReturnValue(selectChain);

      await expect(buildingActions.createApartment(buildingId, aptData))
        .rejects.toThrow("Unit already exists on this floor");
    });

    it('should throw error if required fields are missing', async () => {
       const buildingId = 'b-123';
       // @ts-ignore
       await expect(buildingActions.createApartment(buildingId, { floor: '1' }))
         .rejects.toThrow("Missing required fields");
    });
  });

  describe('updateApartment', () => {
    it('should update apartment details', async () => {
      const apartmentId = 1;
      const updateData = { permillage: 50 };
      const updatedApt = { id: apartmentId, ...updateData };

      const updateChain = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([updatedApt])
      };
      mockDb.update.mockReturnValue(updateChain);

      const result = await buildingActions.updateApartment(apartmentId, updateData);

      expect(result).toEqual(updatedApt);
      expect(eq).toHaveBeenCalledWith(expect.anything(), apartmentId);
    });
  });

  describe('deleteApartment', () => {
    it('should delete apartment and related payments', async () => {
      const apartmentId = 1;

      const deleteChain = {
        where: vi.fn().mockResolvedValue(undefined)
      };
      mockDb.delete.mockReturnValue(deleteChain);

      const result = await buildingActions.deleteApartment(apartmentId);

      expect(result).toBe(true);
      expect(mockDb.delete).toHaveBeenCalledTimes(2); // One for payments, one for apartment
      expect(eq).toHaveBeenCalledWith(expect.anything(), apartmentId);
    });
  });

  describe('bulkCreateApartments', () => {
    it('should create multiple apartments skipping existing ones', async () => {
      const buildingId = 'b-123';
      const units = [
        { floor: '1', unitType: 'apartment', identifier: 'A' },
        { floor: '1', unitType: 'apartment', identifier: 'B' }
      ];
      const createdApt = { id: 2, buildingId, ...units[1] };

      const selectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn()
          .mockResolvedValueOnce([{ id: 1 }]) // First unit exists
          .mockResolvedValueOnce([])          // Second unit does not exist
      };
      mockDb.select.mockReturnValue(selectChain);

      const insertChain = {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([createdApt])
      };
      mockDb.insert.mockReturnValue(insertChain);

      const result = await buildingActions.bulkCreateApartments(buildingId, units);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(createdApt);
      expect(mockDb.insert).toHaveBeenCalledTimes(1);
    });

    it('should throw error if no units provided', async () => {
        const buildingId = 'b-123';
        await expect(buildingActions.bulkCreateApartments(buildingId, []))
            .rejects.toThrow("No units provided");
    });
  });
});
