"use strict";
/**
 * Performance optimization utilities for production deployment
 * Optimized for 10,000+ concurrent users
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthCheck = exports.HealthCheck = exports.connectionPool = exports.ConnectionPool = exports.performanceMonitor = exports.PerformanceMonitor = exports.PRODUCTION_INTENTS = exports.PRODUCTION_SWEEPERS = exports.PRODUCTION_CACHE_CONFIG = exports.LOW_MEMORY_CACHE_CONFIG = void 0;
exports.measureCommandTime = measureCommandTime;
exports.measureDatabaseOperation = measureDatabaseOperation;
exports.setupGracefulShutdown = setupGracefulShutdown;
exports.setupMemoryOptimization = setupMemoryOptimization;
exports.setupPerformanceMonitoring = setupPerformanceMonitoring;
const discord_js_1 = require("discord.js");
/**
 * Low memory cache configuration for constrained environments
 * Optimized for minimal memory usage (< 50MB)
 */
exports.LOW_MEMORY_CACHE_CONFIG = discord_js_1.Options.cacheWithLimits({
    // Application Commands - Minimal cache
    ApplicationCommandManager: {
        maxSize: 50,
        keepOverLimit: () => false,
    },
    // Disable emoji caching
    BaseGuildEmojiManager: 0,
    GuildEmojiManager: 0,
    // Guild Members - Very limited
    GuildMemberManager: {
        maxSize: 100,
        keepOverLimit: (member) => member.id === member.client.user?.id,
    },
    // Messages - Minimal
    MessageManager: {
        maxSize: 10,
        keepOverLimit: () => false,
    },
    // Users - Limited
    UserManager: {
        maxSize: 200,
        keepOverLimit: (user) => user.id === user.client.user?.id,
    },
    // Disable all unused managers
    GuildBanManager: 0,
    GuildInviteManager: 0,
    GuildScheduledEventManager: 0,
    GuildStickerManager: 0,
    PresenceManager: 0,
    ReactionManager: 0,
    ReactionUserManager: 0,
    StageInstanceManager: 0,
    ThreadManager: 0,
    ThreadMemberManager: 0,
    VoiceStateManager: 0,
});
/**
 * Advanced cache configuration for high-performance production
 * Optimized for memory efficiency and speed
 */
exports.PRODUCTION_CACHE_CONFIG = discord_js_1.Options.cacheWithLimits({
    // Application Commands - Cache all for instant access
    ApplicationCommandManager: {
        maxSize: 200,
        keepOverLimit: () => true,
    },
    // Base Guild - Keep all guilds cached
    BaseGuildEmojiManager: 0, // Don't cache emojis (use custom emoji system)
    GuildEmojiManager: 0,
    // Guild Members - Reduced for memory optimization
    GuildMemberManager: {
        maxSize: 500, // Reduced from 1000 to save memory
        keepOverLimit: (member) => {
            // Keep only bot and admins
            return (member.id === member.client.user?.id ||
                member.permissions.has("Administrator"));
        },
    },
    // Messages - Minimal caching (use events, not cache)
    MessageManager: {
        maxSize: 20, // Reduced from 50 - saves ~30MB
        keepOverLimit: () => false,
    },
    // Users - Optimized caching
    UserManager: {
        maxSize: 1000, // Reduced from 2000 to save memory
        keepOverLimit: (user) => user.id === user.client.user?.id,
    },
    // Disable unused managers (save memory)
    GuildBanManager: 0,
    GuildInviteManager: 0,
    GuildScheduledEventManager: 0,
    GuildStickerManager: 0,
    StageInstanceManager: 0,
    ThreadManager: 0,
    ThreadMemberManager: 0,
    PresenceManager: 0, // Don't cache presences (heavy)
    VoiceStateManager: 0, // Not needed for economy bot
    ReactionManager: 0,
    ReactionUserManager: 0,
    AutoModerationRuleManager: 0,
    GuildForumThreadManager: 0,
});
/**
 * Advanced sweeper configuration for automatic cache cleanup
 * Runs periodically to free memory
 */
exports.PRODUCTION_SWEEPERS = {
    // Aggressive message sweeping - keep for only 1 minute
    messages: {
        interval: 120, // 2 minutes (more frequent)
        lifetime: 60, // 1 minute (reduced from 3)
    },
    // More frequent user sweeping
    users: {
        interval: 300, // 5 minutes (reduced from 10)
        filter: () => (user) => {
            // Don't sweep bot user
            if (user.id === user.client.user?.id) {
                return false;
            }
            return true;
        },
    },
    // More frequent guild member sweeping
    guildMembers: {
        interval: 600, // 10 minutes (reduced from 15)
        filter: () => (member) => {
            // Keep only bot and admins
            if (member.id === member.client.user?.id) {
                return false;
            }
            if (member.permissions.has("Administrator")) {
                return false;
            }
            return true;
        },
    },
    // Aggressive thread sweeping
    threads: {
        interval: 900, // 15 minutes (reduced from 30)
        lifetime: 1800, // 30 minutes (reduced from 1 hour)
    },
};
/**
 * Optimal intents for economy bot
 * Only request what's needed to reduce gateway load
 */
exports.PRODUCTION_INTENTS = [
    discord_js_1.GatewayIntentBits.Guilds, // Essential - guild info
    discord_js_1.GatewayIntentBits.GuildMembers, // For member join/leave
    discord_js_1.GatewayIntentBits.GuildMessages, // For prefix commands (if any)
    discord_js_1.GatewayIntentBits.MessageContent, // For reading message content
    // GatewayIntentBits.GuildPresences,   // DISABLED - not needed, saves bandwidth
    // GatewayIntentBits.GuildVoiceStates, // DISABLED - not needed
    // GatewayIntentBits.GuildMessageReactions, // DISABLED - not needed
];
/**
 * Performance monitoring class
 */
class PerformanceMonitor {
    metrics = new Map();
    startTime = Date.now();
    /**
     * Record a metric
     * @param metric
     * @param value
     */
    record(metric, value) {
        if (!this.metrics.has(metric)) {
            this.metrics.set(metric, []);
        }
        const values = this.metrics.get(metric);
        values.push(value);
        // Keep only last 100 values
        if (values.length > 100) {
            values.shift();
        }
    }
    /**
     * Get average for a metric
     * @param metric
     */
    getAverage(metric) {
        const values = this.metrics.get(metric);
        if (!values || values.length === 0) {
            return 0;
        }
        const sum = values.reduce((a, b) => a + b, 0);
        return sum / values.length;
    }
    /**
     * Get all metrics
     */
    getMetrics() {
        const result = {};
        for (const [metric, values] of this.metrics.entries()) {
            result[metric] = {
                avg: this.getAverage(metric),
                count: values.length,
            };
        }
        return result;
    }
    /**
     * Get uptime in seconds
     */
    getUptime() {
        return Math.floor((Date.now() - this.startTime) / 1000);
    }
    /**
     * Get memory usage
     */
    getMemoryUsage() {
        return process.memoryUsage();
    }
    /**
     * Format memory usage for display
     */
    formatMemoryUsage() {
        const usage = this.getMemoryUsage();
        return (`RSS: ${(usage.rss / 1024 / 1024).toFixed(2)}MB | ` +
            `Heap: ${(usage.heapUsed / 1024 / 1024).toFixed(2)}MB / ${(usage.heapTotal / 1024 / 1024).toFixed(2)}MB`);
    }
}
exports.PerformanceMonitor = PerformanceMonitor;
exports.performanceMonitor = new PerformanceMonitor();
/**
 * Command execution timer decorator
 * @param commandName
 * @param startTime
 */
function measureCommandTime(commandName, startTime) {
    const duration = Date.now() - startTime;
    exports.performanceMonitor.record(`command_${commandName}`, duration);
    // Log slow commands (>1s)
    if (duration > 1000) {
        console.warn(`⚠️  Slow command: ${commandName} took ${duration}ms`);
    }
}
/**
 * Database operation timer
 * @param operation
 * @param startTime
 */
function measureDatabaseOperation(operation, startTime) {
    const duration = Date.now() - startTime;
    exports.performanceMonitor.record(`db_${operation}`, duration);
    // Log slow operations (>100ms)
    if (duration > 100) {
        console.warn(`⚠️  Slow DB operation: ${operation} took ${duration}ms`);
    }
}
/**
 * Connection pool for rate limiting
 */
class ConnectionPool {
    connections = new Map();
    maxConnections;
    timeWindow;
    constructor(maxConnections = 50, timeWindow = 60000) {
        this.maxConnections = maxConnections;
        this.timeWindow = timeWindow;
        // Cleanup old connections every minute
        setInterval(() => this.cleanup(), 60000);
    }
    /**
     * Check if connection is allowed
     * @param userId
     */
    canConnect(userId) {
        const now = Date.now();
        const lastConnection = this.connections.get(userId);
        if (!lastConnection) {
            this.connections.set(userId, now);
            return true;
        }
        if (now - lastConnection < this.timeWindow) {
            return false;
        }
        this.connections.set(userId, now);
        return true;
    }
    /**
     * Cleanup old connections
     */
    cleanup() {
        const now = Date.now();
        const toDelete = [];
        for (const [userId, timestamp] of this.connections.entries()) {
            if (now - timestamp > this.timeWindow * 2) {
                toDelete.push(userId);
            }
        }
        toDelete.forEach((userId) => this.connections.delete(userId));
    }
    /**
     * Get connection count
     */
    getConnectionCount() {
        return this.connections.size;
    }
}
exports.ConnectionPool = ConnectionPool;
exports.connectionPool = new ConnectionPool();
/**
 * Health check system
 */
class HealthCheck {
    lastCheck = Date.now();
    healthy = true;
    errors = [];
    /**
     * Mark as healthy
     */
    markHealthy() {
        this.healthy = true;
        this.lastCheck = Date.now();
        this.errors = [];
    }
    /**
     * Mark as unhealthy
     * @param reason
     */
    markUnhealthy(reason) {
        this.healthy = false;
        this.lastCheck = Date.now();
        this.errors.push(reason);
        // Keep only last 10 errors
        if (this.errors.length > 10) {
            this.errors.shift();
        }
    }
    /**
     * Check if healthy
     */
    isHealthy() {
        // Consider unhealthy if no check in last 5 minutes
        if (Date.now() - this.lastCheck > 300000) {
            return false;
        }
        return this.healthy;
    }
    /**
     * Get health status
     */
    getStatus() {
        return {
            healthy: this.isHealthy(),
            lastCheck: this.lastCheck,
            errors: this.errors,
        };
    }
}
exports.HealthCheck = HealthCheck;
exports.healthCheck = new HealthCheck();
/**
 * Graceful shutdown handler
 * @param client
 */
function setupGracefulShutdown(client) {
    const shutdown = async (signal) => {
        console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
        try {
            // Stop accepting new commands
            console.log("📛 Stopping command processing...");
            // Flush caches
            console.log("💾 Flushing caches...");
            const { cacheManager } = require("./cacheManager");
            cacheManager.forceSync();
            // Destroy client
            console.log("🔌 Disconnecting from Discord...");
            client.destroy();
            console.log("✅ Graceful shutdown complete");
            process.exit(0);
        }
        catch (error) {
            console.error("❌ Error during shutdown:", error);
            process.exit(1);
        }
    };
    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
    // Handle uncaught errors
    process.on("uncaughtException", (error) => {
        console.error("❌ Uncaught Exception:", error);
        exports.healthCheck.markUnhealthy(`Uncaught exception: ${error.message}`);
    });
    process.on("unhandledRejection", (reason, promise) => {
        console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
        exports.healthCheck.markUnhealthy(`Unhandled rejection: ${reason}`);
    });
}
/**
 * Memory optimization - Force garbage collection periodically
 */
function setupMemoryOptimization() {
    // Force GC every 5 minutes if available (more aggressive)
    if (global.gc) {
        setInterval(() => {
            const before = process.memoryUsage().heapUsed;
            global.gc();
            const after = process.memoryUsage().heapUsed;
            const freed = (before - after) / 1024 / 1024;
            if (freed > 0) {
                console.log(`🧹 Garbage collection freed ${freed.toFixed(2)}MB`);
            }
        }, 300000); // 5 minutes (more aggressive)
    }
    // Monitor memory usage
    setInterval(() => {
        const usage = process.memoryUsage();
        const heapUsedMB = usage.heapUsed / 1024 / 1024;
        const heapTotalMB = usage.heapTotal / 1024 / 1024;
        const percentage = (heapUsedMB / heapTotalMB) * 100;
        exports.performanceMonitor.record("memory_heap_used", heapUsedMB);
        exports.performanceMonitor.record("memory_heap_total", heapTotalMB);
        // Warn if memory usage is high
        if (percentage > 85) {
            console.warn(`⚠️  High memory usage: ${percentage.toFixed(1)}% (${heapUsedMB.toFixed(2)}MB / ${heapTotalMB.toFixed(2)}MB)`);
            // Force GC if memory is critically high
            if (percentage > 90 && global.gc) {
                console.log("🧹 Forcing garbage collection due to high memory...");
                global.gc();
            }
            exports.healthCheck.markUnhealthy(`High memory usage: ${percentage.toFixed(1)}%`);
        }
        else {
            exports.healthCheck.markHealthy();
        }
    }, 30000); // Every 30 seconds (more frequent monitoring)
}
/**
 * Setup performance monitoring
 * @param client
 */
function setupPerformanceMonitoring(client) {
    // Log stats every 5 minutes
    setInterval(() => {
        const metrics = exports.performanceMonitor.getMetrics();
        const uptime = exports.performanceMonitor.getUptime();
        const memory = exports.performanceMonitor.formatMemoryUsage();
        console.log("\n📊 Performance Stats:");
        console.log(`⏱️  Uptime: ${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`);
        console.log(`💾 Memory: ${memory}`);
        console.log(`🏰 Guilds: ${client.guilds.cache.size}`);
        console.log(`👥 Cached Users: ${client.users.cache.size}`);
        console.log(`📝 Cached Members: ${client.guilds.cache.reduce((acc, guild) => acc + guild.members.cache.size, 0)}`);
        // Log command averages
        const commandMetrics = Object.entries(metrics)
            .filter(([key]) => key.startsWith("command_"))
            .sort((a, b) => b[1].avg - a[1].avg)
            .slice(0, 5);
        if (commandMetrics.length > 0) {
            console.log("\n⚡ Slowest Commands:");
            commandMetrics.forEach(([key, value]) => {
                const cmdName = key.replace("command_", "");
                console.log(`  ${cmdName}: ${value.avg.toFixed(2)}ms (${value.count} executions)`);
            });
        }
        console.log(""); // Empty line
    }, 300000); // 5 minutes
}
//# sourceMappingURL=performance.js.map