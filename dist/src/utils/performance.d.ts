/**
 * Performance optimization utilities for production deployment
 * Optimized for 10,000+ concurrent users
 */
import { Client, GatewayIntentBits } from "discord.js";
/**
 * Low memory cache configuration for constrained environments
 * Optimized for minimal memory usage (< 50MB)
 */
export declare const LOW_MEMORY_CACHE_CONFIG: import("discord.js").CacheFactory;
/**
 * Advanced cache configuration for high-performance production
 * Optimized for memory efficiency and speed
 */
export declare const PRODUCTION_CACHE_CONFIG: import("discord.js").CacheFactory;
/**
 * Advanced sweeper configuration for automatic cache cleanup
 * Runs periodically to free memory
 */
export declare const PRODUCTION_SWEEPERS: {
    messages: {
        interval: number;
        lifetime: number;
    };
    users: {
        interval: number;
        filter: () => (user: any) => boolean;
    };
    guildMembers: {
        interval: number;
        filter: () => (member: any) => boolean;
    };
    threads: {
        interval: number;
        lifetime: number;
    };
};
/**
 * Optimal intents for economy bot
 * Only request what's needed to reduce gateway load
 */
export declare const PRODUCTION_INTENTS: GatewayIntentBits[];
/**
 * Performance monitoring class
 */
export declare class PerformanceMonitor {
    private metrics;
    private startTime;
    /**
     * Record a metric
     * @param metric
     * @param value
     */
    record(metric: string, value: number): void;
    /**
     * Get average for a metric
     * @param metric
     */
    getAverage(metric: string): number;
    /**
     * Get all metrics
     */
    getMetrics(): Record<string, {
        avg: number;
        count: number;
    }>;
    /**
     * Get uptime in seconds
     */
    getUptime(): number;
    /**
     * Get memory usage
     */
    getMemoryUsage(): NodeJS.MemoryUsage;
    /**
     * Format memory usage for display
     */
    formatMemoryUsage(): string;
}
export declare const performanceMonitor: PerformanceMonitor;
/**
 * Command execution timer decorator
 * @param commandName
 * @param startTime
 */
export declare function measureCommandTime(commandName: string, startTime: number): void;
/**
 * Database operation timer
 * @param operation
 * @param startTime
 */
export declare function measureDatabaseOperation(operation: string, startTime: number): void;
/**
 * Connection pool for rate limiting
 */
export declare class ConnectionPool {
    private connections;
    private readonly maxConnections;
    private readonly timeWindow;
    constructor(maxConnections?: number, timeWindow?: number);
    /**
     * Check if connection is allowed
     * @param userId
     */
    canConnect(userId: string): boolean;
    /**
     * Cleanup old connections
     */
    private cleanup;
    /**
     * Get connection count
     */
    getConnectionCount(): number;
}
export declare const connectionPool: ConnectionPool;
/**
 * Health check system
 */
export declare class HealthCheck {
    private lastCheck;
    private healthy;
    private errors;
    /**
     * Mark as healthy
     */
    markHealthy(): void;
    /**
     * Mark as unhealthy
     * @param reason
     */
    markUnhealthy(reason: string): void;
    /**
     * Check if healthy
     */
    isHealthy(): boolean;
    /**
     * Get health status
     */
    getStatus(): {
        healthy: boolean;
        lastCheck: number;
        errors: string[];
    };
}
export declare const healthCheck: HealthCheck;
/**
 * Graceful shutdown handler
 * @param client
 */
export declare function setupGracefulShutdown(client: Client): void;
/**
 * Memory optimization - Force garbage collection periodically
 */
export declare function setupMemoryOptimization(): void;
/**
 * Setup performance monitoring
 * @param client
 */
export declare function setupPerformanceMonitoring(client: Client): void;
//# sourceMappingURL=performance.d.ts.map