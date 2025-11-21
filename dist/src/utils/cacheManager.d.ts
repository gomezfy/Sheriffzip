interface CacheConfig {
    ttl: number;
    maxSize: number;
    syncInterval: number;
}
declare class CacheManager {
    private caches;
    private syncTimers;
    private config;
    private dataDir;
    private writeQueue;
    private isProcessingQueue;
    private writeQueueTimer;
    constructor();
    /**
     * Start the async write queue processor
     * Processes writes in background without blocking the event loop
     */
    private startWriteQueueProcessor;
    registerCache(cacheName: string, config?: Partial<CacheConfig>): void;
    get<T>(cacheName: string, key: string): T | null;
    set<T>(cacheName: string, key: string, data: T, dirty?: boolean): void;
    getOrLoad<T>(cacheName: string, key: string, filename: string, defaultValue: T): T;
    invalidate(cacheName: string, key?: string): void;
    private syncCache;
    /**
     * Queue a write operation for async processing
     * This prevents blocking the event loop during file I/O
     * @param cacheName
     * @param entries
     * @param priority
     */
    private queueWrite;
    /**
     * Process the write queue asynchronously
     * Uses setImmediate to avoid blocking the event loop
     */
    private processWriteQueue;
    /**
     * Execute the actual file write operation ASYNCHRONOUSLY
     * Only called from the write queue processor
     * @param cacheName
     * @param entries
     */
    private executeBulkWrite;
    /**
     * Synchronous version for shutdown only
     * Used to guarantee data persistence on process exit
     * @param cacheName
     * @param entries
     */
    private executeBulkWriteSync;
    private bulkWrite;
    private flushEntry;
    private getFilenameForCache;
    private setupGracefulShutdown;
    forceSync(cacheName?: string): void;
    getStats(cacheName: string): {
        size: number;
        dirtyCount: number;
    };
}
export declare const cacheManager: CacheManager;
export {};
//# sourceMappingURL=cacheManager.d.ts.map