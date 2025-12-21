import { vi } from 'vitest';

export const createMockDb = () => {
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

    // Mock transaction to execute the callback immediately with the mockDb
    mockDb.transaction.mockImplementation((cb) => cb(mockDb));

    const resetMockDb = () => {
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
        // Transaction mock implementation persists
        mockDb.transaction.mockImplementation((cb) => cb(mockDb));
    };

    return { mockDb, resetMockDb };
};
