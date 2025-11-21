/**
 * Message throttler to prevent excessive XP processing
 * Reduces memory usage by limiting how often users can gain XP
 */
/**
 * Check if user can gain XP
 * @param userId - The user ID to check
 * @returns True if user can gain XP, false if on cooldown
 */
export declare function canGainXp(userId: string): boolean;
/**
 * Clean up old cooldown entries (run periodically)
 * Prevents memory leaks from inactive users
 */
export declare function cleanupCooldowns(): void;
//# sourceMappingURL=messageThrottler.d.ts.map