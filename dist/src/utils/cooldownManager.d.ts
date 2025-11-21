import { ChatInputCommandInteraction } from "discord.js";
/**
 * Cooldown Manager - Manages command cooldowns for users
 */
export declare class CooldownManager {
    private cooldowns;
    private readonly defaultCooldown;
    constructor(defaultCooldown?: number);
    /**
     * Check if a user is on cooldown for a specific command
     * @param commandName - The name of the command
     * @param userId - The user's Discord ID
     * @param customCooldown - Optional custom cooldown duration in milliseconds
     * @returns Object with isOnCooldown status and timeLeft in seconds
     */
    check(commandName: string, userId: string, customCooldown?: number): {
        isOnCooldown: boolean;
        timeLeft: number;
    };
    /**
     * Set a cooldown for a user on a specific command
     * @param commandName - The name of the command
     * @param userId - The user's Discord ID
     * @param customCooldown - Optional custom cooldown duration in milliseconds
     */
    set(commandName: string, userId: string, customCooldown?: number): void;
    /**
     * Handle cooldown check and automatically reply to interaction if on cooldown
     * Safely handles both replied and deferred interactions
     * @param interaction - The command interaction
     * @param commandName - The name of the command
     * @param customCooldown - Optional custom cooldown duration in milliseconds
     * @returns true if user is on cooldown (and reply was sent), false if not on cooldown
     */
    handleCooldown(interaction: ChatInputCommandInteraction, commandName: string, customCooldown?: number): Promise<boolean>;
    /**
     * Clear cooldown for a specific user on a command
     * @param commandName - The name of the command
     * @param userId - The user's Discord ID
     */
    clear(commandName: string, userId: string): void;
    /**
     * Clear all cooldowns for a command
     * @param commandName - The name of the command
     */
    clearCommand(commandName: string): void;
    /**
     * Clear all cooldowns
     */
    clearAll(): void;
    /**
     * Get statistics about current cooldowns
     */
    getStats(): {
        totalCommands: number;
        totalUsers: number;
    };
}
/**
 * Global cooldown manager instance
 */
export declare const globalCooldownManager: CooldownManager;
//# sourceMappingURL=cooldownManager.d.ts.map