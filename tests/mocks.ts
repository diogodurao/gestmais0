
import { vi } from 'vitest';

// Define the mock DB object structure
const createMockDb = () => {
    let responseQueue: any[] = [];
    let rejectNext: any = undefined;

    const db: any = {};

    // Make the db object thenable so it can be awaited
    db.then = (resolve: any, reject: any) => {
        if (rejectNext) {
            const err = rejectNext;
            rejectNext = undefined;
            return reject(err);
        }

        const val = responseQueue.length > 0 ? responseQueue.shift() : [];
        return resolve(val);
    };

    // Helper to queue resolved values
    db.__queueResolvedValue = (val: any) => {
        responseQueue.push(val);
    };

    // Helper to clear queue
    db.__resetQueue = () => {
        responseQueue = [];
        rejectNext = undefined;
    };

    db.__setMockRejectedValue = (err: any) => {
        rejectNext = err;
    };

    // Chainable methods
    const methods = [
        'select', 'from', 'where', 'innerJoin', 'leftJoin',
        'limit', 'orderBy', 'insert', 'values', 'returning',
        'update', 'set', 'delete'
    ];

    methods.forEach(method => {
        db[method] = vi.fn().mockReturnValue(db);
    });

    // Transaction mock
    db.transaction = vi.fn().mockImplementation(async (cb) => {
        return await cb(db);
    });

    return db;
};

export const mockDb = createMockDb();

// Helpers to reset mocks between tests
export const resetMocks = () => {
    vi.clearAllMocks();
    mockDb.__resetQueue();

    const methods = [
        'select', 'from', 'where', 'innerJoin', 'leftJoin',
        'limit', 'orderBy', 'insert', 'values', 'returning',
        'update', 'set', 'delete'
    ];

    methods.forEach(method => {
        mockDb[method].mockReturnValue(mockDb);
    });

    mockDb.transaction.mockImplementation(async (cb: any) => {
        return await cb(mockDb);
    });
};
