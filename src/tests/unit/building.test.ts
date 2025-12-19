import { describe, it, expect, vi, beforeEach } from 'vitest';

// Create a mock query builder that is also thenable
const createMockQueryBuilder = () => {
  const builder: any = {};

  // Define chainable methods
  const methods = [
    'from', 'where', 'limit', 'innerJoin', 'leftJoin', 'orderBy',
    'values', 'set', 'returning', 'delete'
  ];

  methods.forEach(method => {
    builder[method] = vi.fn().mockReturnValue(builder);
  });

  // Define then method for await
  builder.then = vi.fn((resolve, reject) => {
    // Default resolution
    return Promise.resolve([]).then(resolve, reject);
  });

  return builder;
};

// Hoist mockDb factory
const { mockDb, mockSelect, mockInsert, mockUpdate, mockDelete } = vi.hoisted(() => {
  const select = vi.fn();
  const insert = vi.fn();
  const update = vi.fn();
  const del = vi.fn();

  return {
    mockDb: {
      select,
      insert,
      update,
      delete: del,
    },
    mockSelect: select,
    mockInsert: insert,
    mockUpdate: update,
    mockDelete: del,
  }
})

vi.mock('@/db', () => ({
  db: mockDb,
}));

// Mock dependencies
vi.mock('nanoid', () => ({
  customAlphabet: () => () => 'mock-code-123',
}));

vi.mock('next/headers', () => ({
  headers: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
        getSession: vi.fn(),
    }
  },
}));

// Mock Schema
vi.mock('@/db/schema', () => ({
  user: { id: 'user_id', buildingId: 'user_building_id', role: 'user_role' },
  building: { id: 'building_id', managerId: 'manager_id', code: 'code' },
  apartments: { id: 'apartments_id', buildingId: 'apartments_building_id', unit: 'unit' },
  payments: { id: 'payments_id', apartmentId: 'payments_apartment_id' },
}));

import * as buildingActions from '@/app/actions/building';

describe('Building Actions (Manager Operations)', () => {
  let queryBuilder: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create a fresh builder for each test
    queryBuilder = createMockQueryBuilder();

    // Setup db methods to return the builder
    mockSelect.mockReturnValue(queryBuilder);
    mockInsert.mockReturnValue(queryBuilder);
    mockUpdate.mockReturnValue(queryBuilder);
    mockDelete.mockReturnValue(queryBuilder);
  });

  // Helper to mock resolved value for the current chain
  const mockResolve = (value: any) => {
    queryBuilder.then.mockImplementation((resolve: any) => Promise.resolve(value).then(resolve));
  };

  // Helper to mock multiple resolves in sequence (e.g. for loops or multiple awaits)
  // Since we share the SAME builder object for all calls in my simple mock above,
  // multiple `await db...` calls will use the same `then` mock.
  // BUT: `db.select()` returns `queryBuilder`. If I call `db.select()` again, it returns the SAME `queryBuilder` reference.
  // This is fine as long as I use `mockImplementationOnce` on `then`.

  // However, separate chains might need separate builders if they overlap.
  // But usually we await one then the next.

  describe('createBuildingForManager', () => {
    it('should create a new building and update user', async () => {
      const managerId = 'manager-1';
      const name = 'New Building';
      const nif = '123456789';
      const newBuilding = { id: 'new-id', name, nif, code: 'mock-code-123', managerId };

      // We have insert and update calls.
      // 1. insert -> returning -> [newBuilding]
      // 2. update -> set -> where -> []

      // Since both use the same `queryBuilder` object (because I return the same instance),
      // I can sequence the `then` calls.

      queryBuilder.then
        .mockImplementationOnce((resolve: any) => Promise.resolve([newBuilding]).then(resolve)) // insert
        .mockImplementationOnce((resolve: any) => Promise.resolve([]).then(resolve)); // update

      const result = await buildingActions.createBuildingForManager(managerId, name, nif);

      expect(result).toEqual(newBuilding);
      expect(mockInsert).toHaveBeenCalled();
      expect(mockUpdate).toHaveBeenCalled();

      // Verify values
      expect(queryBuilder.values).toHaveBeenCalledWith(expect.objectContaining({
        name,
        managerId,
        code: 'mock-code-123'
      }));
      expect(queryBuilder.set).toHaveBeenCalledWith(expect.objectContaining({ buildingId: newBuilding.id }));
    });
  });

  describe('updateBuilding', () => {
    it('should update building details', async () => {
      const buildingId = 'building-1';
      const data = { name: 'Updated Name', city: 'Lisbon' };
      const updatedBuilding = { id: buildingId, ...data };

      mockResolve([updatedBuilding]);

      const result = await buildingActions.updateBuilding(buildingId, data);

      expect(result).toEqual(updatedBuilding);
      expect(mockUpdate).toHaveBeenCalled();
      expect(queryBuilder.set).toHaveBeenCalledWith(expect.objectContaining(data));
      expect(queryBuilder.where).toHaveBeenCalled();
    });
  });

  describe('createApartment', () => {
    it('should create a new apartment if it does not exist', async () => {
      const buildingId = 'building-1';
      const unit = '1A';
      const newApartment = { id: 1, buildingId, unit };

      queryBuilder.then
        .mockImplementationOnce((resolve: any) => Promise.resolve([]).then(resolve)) // select (check existing)
        .mockImplementationOnce((resolve: any) => Promise.resolve([newApartment]).then(resolve)); // insert

      const result = await buildingActions.createApartment(buildingId, unit);

      expect(result).toEqual(newApartment);
      expect(mockSelect).toHaveBeenCalled();
      expect(mockInsert).toHaveBeenCalled();
    });

    it('should throw error if apartment exists', async () => {
      const buildingId = 'building-1';
      const unit = '1A';

      mockResolve([{ id: 1 }]); // select returns existing

      await expect(buildingActions.createApartment(buildingId, unit)).rejects.toThrow('Apartment already exists');
    });
  });

  describe('deleteApartment', () => {
    it('should delete payments and then the apartment', async () => {
      const apartmentId = 123;

      queryBuilder.then
        .mockImplementationOnce((resolve: any) => Promise.resolve([]).then(resolve)) // delete payments
        .mockImplementationOnce((resolve: any) => Promise.resolve([]).then(resolve)); // delete apartment

      const result = await buildingActions.deleteApartment(apartmentId);

      expect(result).toBe(true);
      expect(mockDelete).toHaveBeenCalledTimes(2);
    });
  });

  describe('bulkCreateApartments', () => {
    it('should create multiple apartments skipping existing ones', async () => {
      const buildingId = 'building-1';
      const unitsString = '1A, 1B';

      // Loop:
      // 1. select 1A -> []
      // 2. insert 1A -> [{id:1, unit: '1A'}]
      // 3. select 1B -> [{id:2}]

      queryBuilder.then
        .mockImplementationOnce((resolve: any) => Promise.resolve([]).then(resolve)) // select 1A
        .mockImplementationOnce((resolve: any) => Promise.resolve([{ id: 1, unit: '1A' }]).then(resolve)) // insert 1A
        .mockImplementationOnce((resolve: any) => Promise.resolve([{ id: 2, unit: '1B' }]).then(resolve)); // select 1B (found)

      const result = await buildingActions.bulkCreateApartments(buildingId, unitsString);

      expect(result).toHaveLength(1);
      expect(result[0].unit).toBe('1A');
      expect(mockInsert).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateApartment', () => {
    it('should update apartment details', async () => {
        const apartmentId = 1;
        const data = { floor: 2, permillage: 50 };
        const updated = { id: apartmentId, ...data };

        mockResolve([updated]);

        const result = await buildingActions.updateApartment(apartmentId, data);

        expect(result).toEqual(updated);
        expect(queryBuilder.set).toHaveBeenCalledWith(data);
    });
  });

  describe('setActiveBuilding', () => {
      it('should set active building if owned by manager', async () => {
          const managerId = 'mgr-1';
          const buildingId = 'bld-1';
          const building = { id: buildingId, managerId };

          queryBuilder.then
            .mockImplementationOnce((resolve: any) => Promise.resolve([building]).then(resolve)) // select
            .mockImplementationOnce((resolve: any) => Promise.resolve([]).then(resolve)); // update

          const result = await buildingActions.setActiveBuilding(managerId, buildingId);

          expect(result).toEqual(building);
          expect(mockUpdate).toHaveBeenCalled();
          expect(queryBuilder.where).toHaveBeenCalled(); // Should work now
          expect(queryBuilder.limit).toHaveBeenCalled();
      });

      it('should throw if building not found or not owned', async () => {
          const managerId = 'mgr-1';
          const buildingId = 'bld-1';

          mockResolve([]); // select returns empty

          await expect(buildingActions.setActiveBuilding(managerId, buildingId)).rejects.toThrow('Building not found');
      });
  });

});
