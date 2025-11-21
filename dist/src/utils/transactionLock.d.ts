/**
 * Transaction Lock Manager
 * Prevents race conditions in economy operations by ensuring
 * only one operation per user can run at a time
 *
 * Fixed implementation using promise chaining to serialize access
 */
declare class TransactionLockManager {
    private locks;
    private lockTimeout;
    /**
     * Acquire a lock for a user
     * Returns a promise that resolves when the lock is acquired
     * Uses promise chaining to ensure serial execution
     * @param userId
     */
    acquire(userId: string): Promise<() => void>;
    /**
     * Execute a function with a lock
     * Automatically acquires and releases the lock
     * @param userId
     * @param fn
     */
    withLock<T>(userId: string, fn: () => T | Promise<T>): Promise<T>;
    /**
     * Execute a function with multiple locks (for transfers between users)
     * Locks are acquired in sorted order to prevent deadlocks
     * @param userIds
     * @param fn
     */
    withMultipleLocks<T>(userIds: string[], fn: () => T | Promise<T>): Promise<T>;
    /**
     * Check if a user currently has a lock
     * @param userId
     */
    isLocked(userId: string): boolean;
    /**
     * Get statistics about current locks
     */
    getStats(): {
        totalLocks: number;
        lockedUsers: string[];
    };
}
export declare const transactionLock: TransactionLockManager;
export {};
//# sourceMappingURL=transactionLock.d.ts.map