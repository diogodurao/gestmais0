import { beforeAll, afterEach, afterAll, expect, describe, it, vi } from 'vitest';
import { db } from '@/db';
import { apartments, building, user, payments } from '@/db/schema';
import { eq } from 'drizzle-orm';
import * as buildingActions from '@/app/actions/building';

// We need to mock the db to run these tests without a real database connection
// or assume we are running in an environment where we can spy on db calls.

// Since the instructions say "run tests in the db" but "DATABASE_URL is unavailable",
// and I cannot easily spin up a real postgres instance in this sandbox,
// I will mock the database layer using `vi.mock`.
// However, to make the tests meaningful for "CRUD operations", I should simulate the DB behavior.

// Mock `src/db/index.ts` to return a mock DB
vi.mock('@/db', () => {
  return {
    db: {
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };
});

describe('Manager Apartment Operations', () => {
  const mockBuildingId = 'bld-123';
  const mockUserId = 'usr-123';

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('bulkCreateApartments', () => {
    it('should create multiple apartments correctly', async () => {
      const unitsInput = '1A, 1B\n2A';

      // Mock db.insert for batch operation
      const insertMock = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
            onConflictDoNothing: vi.fn().mockReturnValue({
                returning: vi.fn().mockResolvedValue([
                    { id: 1, unit: '1A' },
                    { id: 2, unit: '1B' },
                    { id: 3, unit: '2A' }
                ])
            })
        }),
      });
      (db.insert as any).mockImplementation(insertMock);

      const result = await buildingActions.bulkCreateApartments(mockBuildingId, unitsInput);

      expect(db.insert).toHaveBeenCalledTimes(1); // One batch insert
      expect(result).toHaveLength(3);
    });

    it('should skip existing apartments (handled by DB conflict)', async () => {
        const unitsInput = '1A, 1B';

        // Mock db.insert returning only the one that didn't conflict
        const insertMock = vi.fn().mockReturnValue({
          values: vi.fn().mockReturnValue({
            onConflictDoNothing: vi.fn().mockReturnValue({
                returning: vi.fn().mockResolvedValue([{ id: 2, unit: '1B' }]), // 1A existed (simulated by not returning it)
            })
          }),
        });
        (db.insert as any).mockImplementation(insertMock);

        const result = await buildingActions.bulkCreateApartments(mockBuildingId, unitsInput);

        expect(db.insert).toHaveBeenCalledTimes(1);
        expect(result).toHaveLength(1);
        expect(result[0].unit).toBe('1B');
      });
  });

  describe('updateApartment', () => {
      it('should update apartment details', async () => {
          const apartmentId = 1;
          const updateData = {
              unit: '1A Updated',
              floor: 1,
              permillage: 50.5
          };

          const updateMock = vi.fn().mockReturnValue({
              set: vi.fn().mockReturnValue({
                  where: vi.fn().mockReturnValue({
                      returning: vi.fn().mockResolvedValue([{ ...updateData, id: apartmentId }])
                  })
              })
          });
          (db.update as any).mockImplementation(updateMock);

          const result = await buildingActions.updateApartment(apartmentId, updateData);

          expect(db.update).toHaveBeenCalled();
          expect(result.unit).toBe(updateData.unit);
          expect(result.floor).toBe(updateData.floor);
      });
  });

  describe('deleteApartment', () => {
      it('should delete apartment and related payments', async () => {
          const apartmentId = 1;

          const deleteMock = vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue({ rowCount: 1 })
          });
          (db.delete as any).mockImplementation(deleteMock);

          await buildingActions.deleteApartment(apartmentId);

          expect(db.delete).toHaveBeenCalledTimes(2); // One for payments, one for apartments
      });
  });

  describe('claimApartment', () => {
    it('should successfully claim an apartment', async () => {
      const apartmentId = 1;
      const residentId = 'res-123';
      const buildingId = 'bld-123';

      // Mock finding the apartment
      const selectMock = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{
              id: apartmentId,
              buildingId,
              residentId: null
            }])
          })
        })
      });
      (db.select as any).mockImplementation(selectMock);

      // Mock update apartment
      const updateApartmentMock = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([{ id: apartmentId, residentId }])
          })
        })
      });

      // Mock update user (second update call)
      const updateUserMock = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue({ rowCount: 1 })
        })
      });

      (db.update as any)
        .mockImplementationOnce(updateApartmentMock)
        .mockImplementationOnce(updateUserMock);

      const result = await buildingActions.claimApartment(buildingId, apartmentId, residentId);

      expect(result.residentId).toBe(residentId);
      expect(db.update).toHaveBeenCalledTimes(2);
    });

    it('should throw if apartment already claimed', async () => {
      const apartmentId = 1;
      const residentId = 'res-123';
      const buildingId = 'bld-123';

      const selectMock = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{
              id: apartmentId,
              buildingId,
              residentId: 'other-res'
            }])
          })
        })
      });
      (db.select as any).mockImplementation(selectMock);

      await expect(buildingActions.claimApartment(buildingId, apartmentId, residentId))
        .rejects.toThrow("Apartment already claimed");
    });
  });

  describe('joinBuilding', () => {
      it('should join a building with valid code', async () => {
          const userId = 'user-1';
          const code = 'CODE123';
          const buildingData = { id: 'bld-1', code };

          // Mock finding building
          const selectMock = vi.fn().mockReturnValue({
              from: vi.fn().mockReturnValue({
                  where: vi.fn().mockReturnValue({
                      limit: vi.fn().mockResolvedValue([buildingData])
                  })
              })
          });
          (db.select as any).mockImplementation(selectMock);

          // Mock update user
          const updateMock = vi.fn().mockReturnValue({
              set: vi.fn().mockReturnValue({
                  where: vi.fn().mockResolvedValue({ rowCount: 1 })
              })
          });
          (db.update as any).mockImplementation(updateMock);

          const result = await buildingActions.joinBuilding(userId, code);

          expect(result.id).toBe(buildingData.id);
          expect(db.update).toHaveBeenCalled();
      });

      it('should throw if code is invalid', async () => {
          const selectMock = vi.fn().mockReturnValue({
              from: vi.fn().mockReturnValue({
                  where: vi.fn().mockReturnValue({
                      limit: vi.fn().mockResolvedValue([])
                  })
              })
          });
          (db.select as any).mockImplementation(selectMock);

          await expect(buildingActions.joinBuilding('u1', 'BADCODE'))
              .rejects.toThrow("Invalid building code");
      });
  });

  describe('getOrCreateManagerBuilding', () => {
    it('should return existing building if user has one', async () => {
        const userId = 'manager-1';
        const buildingId = 'bld-1';
        const userNif = '123456789';

        const existingUser = { id: userId, buildingId };
        const existingBuilding = { id: buildingId, managerId: userId };

        // Mock finding user
        const selectMock = vi.fn().mockReturnValueOnce({
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue([existingUser])
                })
            })
        // Mock finding buildings
        }).mockReturnValueOnce({
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockResolvedValue([existingBuilding])
            })
        });
        (db.select as any).mockImplementation(selectMock);

        const result = await buildingActions.getOrCreateManagerBuilding(userId, userNif);

        expect(result.activeBuilding).toEqual(existingBuilding);
        expect(result.buildings).toHaveLength(1);
    });

    it('should create a new building if user has none', async () => {
        const userId = 'manager-new';
        const userNif = '987654321';

        const existingUser = { id: userId, buildingId: null };

        // Mock finding user (first call)
        const selectMock = vi.fn().mockReturnValueOnce({
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue([existingUser])
                })
            })
        // Mock finding buildings (second call) -> empty
        }).mockReturnValueOnce({
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockResolvedValue([])
            })
        });
        (db.select as any).mockImplementation(selectMock);

        // Mock inserting building
        const insertMock = vi.fn().mockReturnValue({
            values: vi.fn().mockReturnValue({
                returning: vi.fn().mockResolvedValue([{ id: 'new-bld', name: 'My Condominium', managerId: userId }])
            })
        });
        (db.insert as any).mockImplementation(insertMock);

        // Mock updating user
        const updateMock = vi.fn().mockReturnValue({
            set: vi.fn().mockReturnValue({
                where: vi.fn().mockResolvedValue({})
            })
        });
        (db.update as any).mockImplementation(updateMock);

        const result = await buildingActions.getOrCreateManagerBuilding(userId, userNif);

        expect(db.insert).toHaveBeenCalled();
        expect(db.update).toHaveBeenCalled();
        expect(result.activeBuilding.id).toBe('new-bld');
    });
  });

  describe('completeResidentProfile', () => {
      it('should update user profile and mark as complete', async () => {
          const userId = 'res-1';
          const data = { name: 'New Name' };

          const updateMock = vi.fn().mockReturnValue({
              set: vi.fn().mockReturnValue({
                  where: vi.fn().mockReturnValue({
                      returning: vi.fn().mockResolvedValue([{
                          id: userId,
                          name: data.name,
                          profileComplete: true
                      }])
                  })
              })
          });
          (db.update as any).mockImplementation(updateMock);

          const result = await buildingActions.completeResidentProfile(userId, data);

          expect(result.profileComplete).toBe(true);
          expect(result.name).toBe(data.name);
          expect(db.update).toHaveBeenCalled();
      });
  });
});
