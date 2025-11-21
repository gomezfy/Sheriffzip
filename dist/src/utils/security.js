"use strict";
/**
 * Security utilities for Sheriff Bot
 * Provides centralized security checks and validation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityLogger = exports.SecurityEventType = exports.transactionLockManager = exports.commandRateLimiter = exports.adminRateLimiter = exports.MAX_BOUNTY_AMOUNT = exports.MAX_BET_AMOUNT = exports.MAX_CURRENCY_AMOUNT = void 0;
exports.validateOwnerId = validateOwnerId;
exports.isOwner = isOwner;
exports.checkOwnerWithRateLimit = checkOwnerWithRateLimit;
exports.isValidCurrencyAmount = isValidCurrencyAmount;
exports.isValidBetAmount = isValidBetAmount;
exports.isValidBountyAmount = isValidBountyAmount;
exports.sanitizeInput = sanitizeInput;
exports.validateBio = validateBio;
exports.validateJSON = validateJSON;
exports.isValidRedemptionCode = isValidRedemptionCode;
exports.isValidDataFilename = isValidDataFilename;
exports.validateAnnouncementMessage = validateAnnouncementMessage;
exports.isSafeAddition = isSafeAddition;
exports.isSafeMultiplication = isSafeMultiplication;
exports.sanitizeErrorForLogging = sanitizeErrorForLogging;
exports.validateEnvironment = validateEnvironment;
exports.getSafeEnvironmentInfo = getSafeEnvironmentInfo;
const discord_js_1 = require("discord.js");
// Maximum safe integer for economy operations (1 billion)
exports.MAX_CURRENCY_AMOUNT = 1_000_000_000;
// Maximum safe bet amount for gambling (10 million)
exports.MAX_BET_AMOUNT = 10_000_000;
// Maximum bounty amount (100 million)
exports.MAX_BOUNTY_AMOUNT = 100_000_000;
/**
 * Validates that OWNER_ID environment variable is set
 * @returns OWNER_ID if valid, null if not set
 */
function validateOwnerId() {
    const ownerId = process.env.OWNER_ID;
    if (!ownerId || ownerId.trim() === "") {
        console.error("🚨 CRITICAL SECURITY: OWNER_ID environment variable not set!");
        return null;
    }
    return ownerId;
}
/**
 * Checks if user is the bot owner
 * @param interaction Discord interaction
 * @returns true if user is owner, false otherwise
 */
async function isOwner(interaction) {
    const ownerId = validateOwnerId();
    if (!ownerId) {
        await interaction.reply({
            content: "❌ Bot misconfiguration: Owner ID not set. Contact administrator.",
            flags: discord_js_1.MessageFlags.Ephemeral,
        });
        return false;
    }
    if (interaction.user.id !== ownerId) {
        // Log unauthorized access attempt
        exports.securityLogger.log(SecurityEventType.OWNER_COMMAND_DENIED, interaction.user.id, {
            command: interaction.commandName,
            username: interaction.user.tag,
        });
        await interaction.reply({
            content: "❌ This command is only available to the bot owner!",
            flags: discord_js_1.MessageFlags.Ephemeral,
        });
        return false;
    }
    // Log successful owner command usage
    exports.securityLogger.log(SecurityEventType.ADMIN_COMMAND_USED, interaction.user.id, {
        command: interaction.commandName,
        type: "owner",
    });
    return true;
}
/**
 * Combined owner and rate limit check for admin commands
 * @param interaction Discord interaction
 * @returns object with { authorized: boolean, reason?: string }
 */
async function checkOwnerWithRateLimit(interaction) {
    // Check if user is owner
    if (!(await isOwner(interaction))) {
        return { authorized: false, reason: "not_owner" };
    }
    // Check rate limit
    if (!exports.adminRateLimiter.canExecute(interaction.user.id)) {
        const remaining = exports.adminRateLimiter.getRemainingCooldown(interaction.user.id);
        await interaction.editReply({
            content: `⏰ Please wait ${(remaining / 1000).toFixed(1)}s before using another admin command.`,
        });
        return { authorized: false, reason: "rate_limited" };
    }
    return { authorized: true };
}
/**
 * Validates currency amount is within safe limits
 * @param amount Amount to validate
 * @param maxAmount Maximum allowed amount (default: MAX_CURRENCY_AMOUNT)
 * @returns true if valid, false otherwise
 */
function isValidCurrencyAmount(amount, maxAmount = exports.MAX_CURRENCY_AMOUNT) {
    return (Number.isInteger(amount) &&
        amount > 0 &&
        amount <= maxAmount &&
        Number.isSafeInteger(amount));
}
/**
 * Validates bet amount is within safe limits
 * @param amount Bet amount to validate
 * @returns true if valid, false otherwise
 */
function isValidBetAmount(amount) {
    return isValidCurrencyAmount(amount, exports.MAX_BET_AMOUNT);
}
/**
 * Validates bounty amount is within safe limits
 * @param amount Bounty amount to validate
 * @returns true if valid, false otherwise
 */
function isValidBountyAmount(amount) {
    return isValidCurrencyAmount(amount, exports.MAX_BOUNTY_AMOUNT);
}
/**
 * Sanitizes user input to prevent injection attacks
 * @param input User input string
 * @param maxLength Maximum allowed length
 * @returns Sanitized string
 */
function sanitizeInput(input, maxLength = 2000) {
    if (!input) {
        return "";
    }
    // Trim and limit length
    let sanitized = input.trim().substring(0, maxLength);
    // Remove null bytes
    sanitized = sanitized.replace(/\0/g, "");
    return sanitized;
}
/**
 * Validates and sanitizes bio text
 * @param bio Bio text to validate
 * @returns Sanitized bio or null if invalid
 */
function validateBio(bio) {
    if (!bio || bio.trim().length === 0) {
        return null;
    }
    // Maximum 500 characters for bio
    if (bio.length > 500) {
        return null;
    }
    // Sanitize
    let sanitized = sanitizeInput(bio, 500);
    // Remove excessive whitespace
    sanitized = sanitized.replace(/\s+/g, " ");
    return sanitized;
}
/**
 * Validates JSON string safely
 * @param jsonString JSON string to validate
 * @param maxLength Maximum allowed length
 * @returns Parsed object or null if invalid
 */
function validateJSON(jsonString, maxLength = 10000) {
    if (!jsonString || jsonString.length > maxLength) {
        return null;
    }
    try {
        const parsed = JSON.parse(jsonString);
        return parsed;
    }
    catch {
        return null;
    }
}
/**
 * Validates redemption code format
 * @param code Redemption code to validate
 * @returns true if valid format, false otherwise
 */
function isValidRedemptionCode(code) {
    // Must start with SHERIFF- and contain only alphanumeric, dash, underscore
    // Maximum length: 100 characters
    const codeRegex = /^SHERIFF-[A-Z0-9_-]{1,90}$/;
    return codeRegex.test(code) && code.length <= 100;
}
/**
 * Validates filename to prevent path traversal
 * @param filename Filename to validate
 * @returns true if valid, false otherwise
 */
function isValidDataFilename(filename) {
    const allowedFiles = [
        "daily.json",
        "daily-rewards.json",
        "economy.json",
        "economy.backup.json",
        "profiles.json",
        "xp.json",
        "inventory.json",
        "wanted.json",
        "welcome.json",
        "logs.json",
        "bounties.json",
        "backgrounds.json",
        "punishment.json",
        "mining.json",
        "work.json",
        "warns.json",
        "mutes.json",
        "mod-logs.json",
        "level-rewards.json",
        "redemption-codes.json",
        "territories.json",
        "territory-income.json",
        "expedition.json",
        "events.json",
    ];
    return allowedFiles.includes(filename);
}
/**
 * Rate limiter for admin commands
 */
class AdminRateLimiter {
    cooldowns = new Map();
    cooldownMs = 1000; // 1 second between admin commands
    /**
     * Checks if user can execute admin command
     * @param userId User ID to check
     * @returns true if allowed, false if on cooldown
     */
    canExecute(userId) {
        const now = Date.now();
        const lastUse = this.cooldowns.get(userId);
        if (lastUse && now - lastUse < this.cooldownMs) {
            return false;
        }
        this.cooldowns.set(userId, now);
        // Cleanup old entries (older than 5 minutes)
        if (this.cooldowns.size > 100) {
            const fiveMinutesAgo = now - 5 * 60 * 1000;
            for (const [id, timestamp] of this.cooldowns.entries()) {
                if (timestamp < fiveMinutesAgo) {
                    this.cooldowns.delete(id);
                }
            }
        }
        return true;
    }
    /**
     * Gets remaining cooldown time in milliseconds
     * @param userId User ID to check
     * @returns Remaining cooldown time in ms, or 0 if no cooldown
     */
    getRemainingCooldown(userId) {
        const now = Date.now();
        const lastUse = this.cooldowns.get(userId);
        if (!lastUse) {
            return 0;
        }
        const remaining = this.cooldownMs - (now - lastUse);
        return remaining > 0 ? remaining : 0;
    }
}
exports.adminRateLimiter = new AdminRateLimiter();
/**
 * General command rate limiter
 */
class CommandRateLimiter {
    cooldowns = new Map();
    /**
     * Checks if user can execute command
     * @param commandName Command name
     * @param userId User ID
     * @param cooldownMs Cooldown in milliseconds
     * @returns true if allowed, false if on cooldown
     */
    canExecute(commandName, userId, cooldownMs) {
        if (!this.cooldowns.has(commandName)) {
            this.cooldowns.set(commandName, new Map());
        }
        const commandCooldowns = this.cooldowns.get(commandName);
        const now = Date.now();
        const lastUse = commandCooldowns.get(userId);
        if (lastUse && now - lastUse < cooldownMs) {
            return false;
        }
        commandCooldowns.set(userId, now);
        // Cleanup old entries
        if (commandCooldowns.size > 1000) {
            const fiveMinutesAgo = now - 5 * 60 * 1000;
            for (const [id, timestamp] of commandCooldowns.entries()) {
                if (timestamp < fiveMinutesAgo) {
                    commandCooldowns.delete(id);
                }
            }
        }
        return true;
    }
    /**
     * Gets remaining cooldown time
     * @param commandName Command name
     * @param userId User ID
     * @param cooldownMs Cooldown in milliseconds
     * @returns Remaining cooldown in ms, or 0 if no cooldown
     */
    getRemainingCooldown(commandName, userId, cooldownMs) {
        const commandCooldowns = this.cooldowns.get(commandName);
        if (!commandCooldowns) {
            return 0;
        }
        const lastUse = commandCooldowns.get(userId);
        if (!lastUse) {
            return 0;
        }
        const now = Date.now();
        const remaining = cooldownMs - (now - lastUse);
        return remaining > 0 ? remaining : 0;
    }
}
exports.commandRateLimiter = new CommandRateLimiter();
/**
 * Validates and sanitizes announcement message
 * @param message Message to validate
 * @returns Sanitized message or null if invalid
 */
function validateAnnouncementMessage(message) {
    if (!message || message.trim().length === 0) {
        return null;
    }
    // Maximum 4000 characters (Discord embed description limit)
    if (message.length > 4000) {
        return null;
    }
    // Replace escaped newlines
    let sanitized = message.replace(/\\n/g, "\n");
    // Remove null bytes
    sanitized = sanitized.replace(/\0/g, "");
    return sanitized;
}
/**
 * Checks if amount would cause integer overflow
 * @param current Current amount
 * @param addition Amount to add
 * @returns true if safe, false if would overflow
 */
function isSafeAddition(current, addition) {
    const result = current + addition;
    return Number.isSafeInteger(result) && result <= exports.MAX_CURRENCY_AMOUNT;
}
/**
 * Checks if multiplication would cause integer overflow
 * @param value Value to multiply
 * @param multiplier Multiplier
 * @returns true if safe, false if would overflow
 */
function isSafeMultiplication(value, multiplier) {
    const result = value * multiplier;
    return Number.isSafeInteger(result) && result <= exports.MAX_CURRENCY_AMOUNT;
}
/**
 * Sanitizes error message for logging (removes sensitive info)
 * @param error Error object or message
 * @returns Sanitized error message
 */
function sanitizeErrorForLogging(error) {
    if (!error) {
        return "Unknown error";
    }
    let message = error.message || String(error);
    // Remove file paths
    message = message.replace(/\/[^\s]+\/(src|node_modules)\/[^\s]+/g, "[PATH_REDACTED]");
    // Remove potential tokens or secrets (anything that looks like a long hex string)
    message = message.replace(/[a-f0-9]{32,}/gi, "[TOKEN_REDACTED]");
    // Remove environment variable values
    message = message.replace(/process\.env\.[A-Z_]+\s*=\s*['"][^'"]+['"]/g, "process.env.[REDACTED]");
    return message;
}
/**
 * Transaction lock manager to prevent race conditions
 */
class TransactionLockManager {
    locks = new Map();
    /**
     * Acquires a lock for user IDs
     * @param userIds Array of user IDs to lock
     * @returns Release function to call when done
     */
    async acquire(userIds) {
        // Sort user IDs to prevent deadlocks
        const sortedIds = [...userIds].sort();
        const lockKey = sortedIds.join(":");
        // Wait for existing lock
        while (this.locks.has(lockKey)) {
            await this.locks.get(lockKey);
            // Small delay to prevent tight loop
            await new Promise((resolve) => setTimeout(resolve, 10));
        }
        // Create new lock
        let releaseLock;
        const lockPromise = new Promise((resolve) => {
            releaseLock = resolve;
        });
        this.locks.set(lockKey, lockPromise);
        // Return release function
        return () => {
            this.locks.delete(lockKey);
            releaseLock();
        };
    }
}
exports.transactionLockManager = new TransactionLockManager();
/**
 * Security event types
 */
var SecurityEventType;
(function (SecurityEventType) {
    SecurityEventType["OWNER_COMMAND_DENIED"] = "OWNER_COMMAND_DENIED";
    SecurityEventType["ADMIN_COMMAND_USED"] = "ADMIN_COMMAND_USED";
    SecurityEventType["LARGE_TRANSFER"] = "LARGE_TRANSFER";
    SecurityEventType["HIGH_VALUE_TRANSACTION"] = "HIGH_VALUE_TRANSACTION";
    SecurityEventType["SUSPICIOUS_ACTIVITY"] = "SUSPICIOUS_ACTIVITY";
    SecurityEventType["RATE_LIMIT_EXCEEDED"] = "RATE_LIMIT_EXCEEDED";
    SecurityEventType["INVALID_INPUT"] = "INVALID_INPUT";
    SecurityEventType["UNAUTHORIZED_ACCESS"] = "UNAUTHORIZED_ACCESS";
    SecurityEventType["GAMBLING_WIN_STREAK"] = "GAMBLING_WIN_STREAK";
    SecurityEventType["RAPID_WEALTH_GAIN"] = "RAPID_WEALTH_GAIN";
    SecurityEventType["MULTIPLE_ACCOUNT_DETECTED"] = "MULTIPLE_ACCOUNT_DETECTED";
    SecurityEventType["BOUNTY_ABUSE"] = "BOUNTY_ABUSE";
})(SecurityEventType || (exports.SecurityEventType = SecurityEventType = {}));
/**
 * Security event logger with file persistence
 */
class SecurityLogger {
    events = [];
    maxEvents = 1000;
    HIGH_VALUE_SILVER = 10000;
    HIGH_VALUE_GOLD = 100;
    pendingEvents = [];
    flushTimer = null;
    constructor() {
        // Start periodic flush (every 60 seconds)
        this.flushTimer = setInterval(() => {
            if (this.pendingEvents.length > 0) {
                this.persistToFile();
            }
        }, 60000);
        // Flush on process exit
        this.setupGracefulShutdown();
    }
    /**
     * Sets up graceful shutdown to flush pending events
     */
    setupGracefulShutdown() {
        const shutdown = () => {
            if (this.pendingEvents.length > 0) {
                console.log("💾 Flushing pending security logs...");
                this.persistToFile();
            }
            if (this.flushTimer) {
                clearInterval(this.flushTimer);
            }
        };
        process.on("SIGINT", shutdown);
        process.on("SIGTERM", shutdown);
        process.on("exit", shutdown);
    }
    /**
     * Logs a security event
     * @param type Event type
     * @param userId User ID
     * @param details Additional details
     */
    log(type, userId, details = {}) {
        const event = {
            timestamp: Date.now(),
            type,
            userId,
            details,
        };
        this.events.push(event);
        this.pendingEvents.push(event);
        // Keep only recent events in memory
        if (this.events.length > this.maxEvents) {
            this.events.shift();
        }
        // Console log for monitoring with color coding
        const timestamp = new Date().toISOString();
        const severity = this.getEventSeverity(type);
        const color = severity === "HIGH"
            ? "\x1b[31m"
            : severity === "MEDIUM"
                ? "\x1b[33m"
                : "\x1b[36m";
        const reset = "\x1b[0m";
        console.log(`${color}[SECURITY-${severity}] ${timestamp} | ${type} | User: ${userId} | ${JSON.stringify(details)}${reset}`);
        // Save to file periodically (every 10 events or high severity)
        if (this.pendingEvents.length >= 10 || severity === "HIGH") {
            this.persistToFile();
        }
    }
    /**
     * Gets severity level for event type
     * @param type
     */
    getEventSeverity(type) {
        switch (type) {
            case SecurityEventType.OWNER_COMMAND_DENIED:
            case SecurityEventType.UNAUTHORIZED_ACCESS:
            case SecurityEventType.MULTIPLE_ACCOUNT_DETECTED:
            case SecurityEventType.BOUNTY_ABUSE:
            case SecurityEventType.HIGH_VALUE_TRANSACTION:
                return "HIGH";
            case SecurityEventType.SUSPICIOUS_ACTIVITY:
            case SecurityEventType.GAMBLING_WIN_STREAK:
            case SecurityEventType.RAPID_WEALTH_GAIN:
                return "MEDIUM";
            default:
                return "LOW";
        }
    }
    /**
     * Persists events to file (only new events, no duplicates)
     */
    persistToFile() {
        if (this.pendingEvents.length === 0) {
            return;
        }
        try {
            const fs = require("fs");
            const path = require("path");
            const { getDataPath } = require("./database");
            const dataDir = getDataPath("data");
            const logsDir = path.join(dataDir, "security-logs");
            // Create logs directory if it doesn't exist
            if (!fs.existsSync(logsDir)) {
                fs.mkdirSync(logsDir, { recursive: true });
            }
            // Create log file with date
            const date = new Date().toISOString().split("T")[0];
            const logFile = path.join(logsDir, `security-${date}.json`);
            // Append to existing file or create new
            let existingLogs = [];
            if (fs.existsSync(logFile)) {
                try {
                    existingLogs = JSON.parse(fs.readFileSync(logFile, "utf8"));
                }
                catch (e) {
                    existingLogs = [];
                }
            }
            // Append ONLY pending events (not all events)
            const allLogs = [...existingLogs, ...this.pendingEvents];
            fs.writeFileSync(logFile, JSON.stringify(allLogs, null, 2));
            // Clear pending events after successful write
            this.pendingEvents = [];
            // Clean old log files (keep last 30 days)
            this.cleanOldLogs(logsDir);
        }
        catch (error) {
            console.error("Failed to persist security logs:", error);
        }
    }
    /**
     * Cleans old log files
     * @param logsDir
     */
    cleanOldLogs(logsDir) {
        try {
            const fs = require("fs");
            const path = require("path");
            const files = fs.readdirSync(logsDir);
            const now = Date.now();
            const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
            for (const file of files) {
                const filePath = path.join(logsDir, file);
                const stats = fs.statSync(filePath);
                if (stats.mtimeMs < thirtyDaysAgo) {
                    fs.unlinkSync(filePath);
                    console.log(`🗑️  Deleted old security log: ${file}`);
                }
            }
        }
        catch (error) {
            console.error("Failed to clean old logs:", error);
        }
    }
    /**
     * Logs a transaction and checks if it's high value
     * @param userId
     * @param type
     * @param amount
     * @param action
     * @param targetUser
     */
    logTransaction(userId, type, amount, action, targetUser) {
        const isHighValue = (type === "silver" && amount >= this.HIGH_VALUE_SILVER) ||
            (type === "gold" && amount >= this.HIGH_VALUE_GOLD);
        if (isHighValue) {
            this.log(SecurityEventType.HIGH_VALUE_TRANSACTION, userId, {
                type,
                amount,
                action,
                targetUser,
                threshold: type === "silver" ? this.HIGH_VALUE_SILVER : this.HIGH_VALUE_GOLD,
            });
        }
    }
    /**
     * Gets recent security events
     * @param limit Maximum number of events to return
     * @returns Array of recent events
     */
    getRecentEvents(limit = 100) {
        return this.events.slice(-limit);
    }
    /**
     * Gets events for specific user
     * @param userId User ID
     * @param limit Maximum number of events
     * @returns Array of user events
     */
    getUserEvents(userId, limit = 50) {
        return this.events.filter((e) => e.userId === userId).slice(-limit);
    }
    /**
     * Gets events by type
     * @param type
     * @param limit
     */
    getEventsByType(type, limit = 50) {
        return this.events.filter((e) => e.type === type).slice(-limit);
    }
    /**
     * Checks for suspicious activity patterns
     * @param userId User ID
     * @returns true if suspicious activity detected
     */
    detectSuspiciousActivity(userId) {
        const recentEvents = this.getUserEvents(userId, 20);
        const now = Date.now();
        const oneMinuteAgo = now - 60 * 1000;
        // Count events in last minute
        const recentCount = recentEvents.filter((e) => e.timestamp > oneMinuteAgo).length;
        // More than 10 security events in 1 minute is suspicious
        if (recentCount > 10) {
            this.log(SecurityEventType.SUSPICIOUS_ACTIVITY, userId, {
                eventCount: recentCount,
                timeWindow: "1 minute",
                trigger: "high_frequency_events",
            });
            return true;
        }
        return false;
    }
    /**
     * Gets security statistics
     */
    getStatistics() {
        const topUsersMap = new Map();
        const stats = {
            totalEvents: this.events.length,
            byType: {},
            bySeverity: {
                HIGH: 0,
                MEDIUM: 0,
                LOW: 0,
            },
            last24Hours: 0,
            topUsers: [],
        };
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        for (const event of this.events) {
            // Count by type
            stats.byType[event.type] = (stats.byType[event.type] || 0) + 1;
            // Count by severity
            const severity = this.getEventSeverity(event.type);
            stats.bySeverity[severity]++;
            // Count last 24h
            if (event.timestamp > oneDayAgo) {
                stats.last24Hours++;
            }
            // Count by user
            const userCount = topUsersMap.get(event.userId) || 0;
            topUsersMap.set(event.userId, userCount + 1);
        }
        // Convert top users to sorted array
        stats.topUsers = Array.from(topUsersMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([userId, count]) => ({ userId, count }));
        return stats;
    }
}
exports.securityLogger = new SecurityLogger();
/**
 * Validates required environment variables at startup
 * @throws Error if validation fails
 */
function validateEnvironment() {
    const missing = [];
    const invalid = [];
    // Check DISCORD_TOKEN
    if (!process.env.DISCORD_TOKEN || process.env.DISCORD_TOKEN.trim() === "") {
        missing.push("DISCORD_TOKEN");
    }
    // Check CLIENT_ID (accepts both DISCORD_CLIENT_ID and CLIENT_ID)
    const clientId = process.env.DISCORD_CLIENT_ID || process.env.CLIENT_ID;
    if (!clientId || clientId.trim() === "") {
        missing.push("DISCORD_CLIENT_ID or CLIENT_ID");
    }
    if (missing.length > 0) {
        console.error("❌ Missing required environment variables:");
        missing.forEach((key) => console.error(`   - ${key}`));
        throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
    }
    // Validate token format (Discord tokens are typically 70+ characters)
    const token = process.env.DISCORD_TOKEN;
    if (token.length < 50) {
        invalid.push("DISCORD_TOKEN (too short, appears invalid)");
    }
    // Validate client ID format (should be numeric snowflake)
    if (!/^\d{17,20}$/.test(clientId)) {
        invalid.push("DISCORD_CLIENT_ID/CLIENT_ID (should be 17-20 digit number)");
    }
    // Validate optional but important variables
    const ownerId = process.env.OWNER_ID;
    if (ownerId && !/^\d{17,20}$/.test(ownerId)) {
        console.warn("⚠️  OWNER_ID format appears invalid (should be 17-20 digit number)");
    }
    if (invalid.length > 0) {
        console.error("❌ Invalid environment variables:");
        invalid.forEach((msg) => console.error(`   - ${msg}`));
        throw new Error(`Invalid environment variables detected`);
    }
    console.log("✅ Environment variables validated successfully");
}
/**
 * Gets safe environment info for logging (without exposing secrets)
 */
function getSafeEnvironmentInfo() {
    return {
        nodeVersion: process.version,
        platform: process.platform,
        hasToken: !!process.env.DISCORD_TOKEN,
        hasClientId: !!(process.env.DISCORD_CLIENT_ID || process.env.CLIENT_ID),
        hasOwnerId: !!process.env.OWNER_ID,
        hasStripe: !!process.env.STRIPE_SECRET_KEY,
        hasHotmart: !!process.env.HOTMART_CLIENT_ID,
        nodeEnv: process.env.NODE_ENV || "development",
    };
}
//# sourceMappingURL=security.js.map