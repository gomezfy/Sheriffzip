/**
 * Security utilities for Sheriff Bot
 * Provides centralized security checks and validation
 */
import { ChatInputCommandInteraction } from "discord.js";
export declare const MAX_CURRENCY_AMOUNT = 1000000000;
export declare const MAX_BET_AMOUNT = 10000000;
export declare const MAX_BOUNTY_AMOUNT = 100000000;
/**
 * Validates that OWNER_ID environment variable is set
 * @returns OWNER_ID if valid, null if not set
 */
export declare function validateOwnerId(): string | null;
/**
 * Checks if user is the bot owner
 * @param interaction Discord interaction
 * @returns true if user is owner, false otherwise
 */
export declare function isOwner(interaction: ChatInputCommandInteraction): Promise<boolean>;
/**
 * Combined owner and rate limit check for admin commands
 * @param interaction Discord interaction
 * @returns object with { authorized: boolean, reason?: string }
 */
export declare function checkOwnerWithRateLimit(interaction: ChatInputCommandInteraction): Promise<{
    authorized: boolean;
    reason?: string;
}>;
/**
 * Validates currency amount is within safe limits
 * @param amount Amount to validate
 * @param maxAmount Maximum allowed amount (default: MAX_CURRENCY_AMOUNT)
 * @returns true if valid, false otherwise
 */
export declare function isValidCurrencyAmount(amount: number, maxAmount?: number): boolean;
/**
 * Validates bet amount is within safe limits
 * @param amount Bet amount to validate
 * @returns true if valid, false otherwise
 */
export declare function isValidBetAmount(amount: number): boolean;
/**
 * Validates bounty amount is within safe limits
 * @param amount Bounty amount to validate
 * @returns true if valid, false otherwise
 */
export declare function isValidBountyAmount(amount: number): boolean;
/**
 * Sanitizes user input to prevent injection attacks
 * @param input User input string
 * @param maxLength Maximum allowed length
 * @returns Sanitized string
 */
export declare function sanitizeInput(input: string, maxLength?: number): string;
/**
 * Validates and sanitizes bio text
 * @param bio Bio text to validate
 * @returns Sanitized bio or null if invalid
 */
export declare function validateBio(bio: string): string | null;
/**
 * Validates JSON string safely
 * @param jsonString JSON string to validate
 * @param maxLength Maximum allowed length
 * @returns Parsed object or null if invalid
 */
export declare function validateJSON(jsonString: string, maxLength?: number): any | null;
/**
 * Validates redemption code format
 * @param code Redemption code to validate
 * @returns true if valid format, false otherwise
 */
export declare function isValidRedemptionCode(code: string): boolean;
/**
 * Validates filename to prevent path traversal
 * @param filename Filename to validate
 * @returns true if valid, false otherwise
 */
export declare function isValidDataFilename(filename: string): boolean;
/**
 * Rate limiter for admin commands
 */
declare class AdminRateLimiter {
    private cooldowns;
    private readonly cooldownMs;
    /**
     * Checks if user can execute admin command
     * @param userId User ID to check
     * @returns true if allowed, false if on cooldown
     */
    canExecute(userId: string): boolean;
    /**
     * Gets remaining cooldown time in milliseconds
     * @param userId User ID to check
     * @returns Remaining cooldown time in ms, or 0 if no cooldown
     */
    getRemainingCooldown(userId: string): number;
}
export declare const adminRateLimiter: AdminRateLimiter;
/**
 * General command rate limiter
 */
declare class CommandRateLimiter {
    private cooldowns;
    /**
     * Checks if user can execute command
     * @param commandName Command name
     * @param userId User ID
     * @param cooldownMs Cooldown in milliseconds
     * @returns true if allowed, false if on cooldown
     */
    canExecute(commandName: string, userId: string, cooldownMs: number): boolean;
    /**
     * Gets remaining cooldown time
     * @param commandName Command name
     * @param userId User ID
     * @param cooldownMs Cooldown in milliseconds
     * @returns Remaining cooldown in ms, or 0 if no cooldown
     */
    getRemainingCooldown(commandName: string, userId: string, cooldownMs: number): number;
}
export declare const commandRateLimiter: CommandRateLimiter;
/**
 * Validates and sanitizes announcement message
 * @param message Message to validate
 * @returns Sanitized message or null if invalid
 */
export declare function validateAnnouncementMessage(message: string): string | null;
/**
 * Checks if amount would cause integer overflow
 * @param current Current amount
 * @param addition Amount to add
 * @returns true if safe, false if would overflow
 */
export declare function isSafeAddition(current: number, addition: number): boolean;
/**
 * Checks if multiplication would cause integer overflow
 * @param value Value to multiply
 * @param multiplier Multiplier
 * @returns true if safe, false if would overflow
 */
export declare function isSafeMultiplication(value: number, multiplier: number): boolean;
/**
 * Sanitizes error message for logging (removes sensitive info)
 * @param error Error object or message
 * @returns Sanitized error message
 */
export declare function sanitizeErrorForLogging(error: any): string;
/**
 * Transaction lock manager to prevent race conditions
 */
declare class TransactionLockManager {
    private locks;
    /**
     * Acquires a lock for user IDs
     * @param userIds Array of user IDs to lock
     * @returns Release function to call when done
     */
    acquire(userIds: string[]): Promise<() => void>;
}
export declare const transactionLockManager: TransactionLockManager;
/**
 * Security event types
 */
export declare enum SecurityEventType {
    OWNER_COMMAND_DENIED = "OWNER_COMMAND_DENIED",
    ADMIN_COMMAND_USED = "ADMIN_COMMAND_USED",
    LARGE_TRANSFER = "LARGE_TRANSFER",
    HIGH_VALUE_TRANSACTION = "HIGH_VALUE_TRANSACTION",
    SUSPICIOUS_ACTIVITY = "SUSPICIOUS_ACTIVITY",
    RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
    INVALID_INPUT = "INVALID_INPUT",
    UNAUTHORIZED_ACCESS = "UNAUTHORIZED_ACCESS",
    GAMBLING_WIN_STREAK = "GAMBLING_WIN_STREAK",
    RAPID_WEALTH_GAIN = "RAPID_WEALTH_GAIN",
    MULTIPLE_ACCOUNT_DETECTED = "MULTIPLE_ACCOUNT_DETECTED",
    BOUNTY_ABUSE = "BOUNTY_ABUSE"
}
/**
 * Security event logger with file persistence
 */
declare class SecurityLogger {
    private events;
    private readonly maxEvents;
    private readonly HIGH_VALUE_SILVER;
    private readonly HIGH_VALUE_GOLD;
    private pendingEvents;
    private flushTimer;
    constructor();
    /**
     * Sets up graceful shutdown to flush pending events
     */
    private setupGracefulShutdown;
    /**
     * Logs a security event
     * @param type Event type
     * @param userId User ID
     * @param details Additional details
     */
    log(type: SecurityEventType, userId: string, details?: any): void;
    /**
     * Gets severity level for event type
     * @param type
     */
    private getEventSeverity;
    /**
     * Persists events to file (only new events, no duplicates)
     */
    private persistToFile;
    /**
     * Cleans old log files
     * @param logsDir
     */
    private cleanOldLogs;
    /**
     * Logs a transaction and checks if it's high value
     * @param userId
     * @param type
     * @param amount
     * @param action
     * @param targetUser
     */
    logTransaction(userId: string, type: "silver" | "gold" | "token", amount: number, action: string, targetUser?: string): void;
    /**
     * Gets recent security events
     * @param limit Maximum number of events to return
     * @returns Array of recent events
     */
    getRecentEvents(limit?: number): Array<any>;
    /**
     * Gets events for specific user
     * @param userId User ID
     * @param limit Maximum number of events
     * @returns Array of user events
     */
    getUserEvents(userId: string, limit?: number): Array<any>;
    /**
     * Gets events by type
     * @param type
     * @param limit
     */
    getEventsByType(type: SecurityEventType, limit?: number): Array<any>;
    /**
     * Checks for suspicious activity patterns
     * @param userId User ID
     * @returns true if suspicious activity detected
     */
    detectSuspiciousActivity(userId: string): boolean;
    /**
     * Gets security statistics
     */
    getStatistics(): any;
}
export declare const securityLogger: SecurityLogger;
/**
 * Validates required environment variables at startup
 * @throws Error if validation fails
 */
export declare function validateEnvironment(): void;
/**
 * Gets safe environment info for logging (without exposing secrets)
 */
export declare function getSafeEnvironmentInfo(): any;
export {};
//# sourceMappingURL=security.d.ts.map