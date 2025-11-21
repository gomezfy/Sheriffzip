"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalCooldownManager = exports.CooldownManager = void 0;
const discord_js_1 = require("discord.js");
const i18n_1 = require("./i18n");
/**
 * Cooldown Manager - Manages command cooldowns for users
 */
class CooldownManager {
    cooldowns = new Map();
    defaultCooldown;
    constructor(defaultCooldown = 1000) {
        this.defaultCooldown = defaultCooldown;
    }
    /**
     * Check if a user is on cooldown for a specific command
     * @param commandName - The name of the command
     * @param userId - The user's Discord ID
     * @param customCooldown - Optional custom cooldown duration in milliseconds
     * @returns Object with isOnCooldown status and timeLeft in seconds
     */
    check(commandName, userId, customCooldown) {
        const now = Date.now();
        const cooldownAmount = customCooldown || this.defaultCooldown;
        if (!this.cooldowns.has(commandName)) {
            this.cooldowns.set(commandName, new Map());
        }
        const timestamps = this.cooldowns.get(commandName);
        const lastUsed = timestamps.get(userId);
        if (lastUsed) {
            const expirationTime = lastUsed + cooldownAmount;
            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                return { isOnCooldown: true, timeLeft };
            }
        }
        return { isOnCooldown: false, timeLeft: 0 };
    }
    /**
     * Set a cooldown for a user on a specific command
     * @param commandName - The name of the command
     * @param userId - The user's Discord ID
     * @param customCooldown - Optional custom cooldown duration in milliseconds
     */
    set(commandName, userId, customCooldown) {
        const now = Date.now();
        const cooldownAmount = customCooldown || this.defaultCooldown;
        if (!this.cooldowns.has(commandName)) {
            this.cooldowns.set(commandName, new Map());
        }
        const timestamps = this.cooldowns.get(commandName);
        timestamps.set(userId, now);
        // Auto-cleanup after cooldown expires
        setTimeout(() => {
            timestamps.delete(userId);
        }, cooldownAmount);
    }
    /**
     * Handle cooldown check and automatically reply to interaction if on cooldown
     * Safely handles both replied and deferred interactions
     * @param interaction - The command interaction
     * @param commandName - The name of the command
     * @param customCooldown - Optional custom cooldown duration in milliseconds
     * @returns true if user is on cooldown (and reply was sent), false if not on cooldown
     */
    async handleCooldown(interaction, commandName, customCooldown) {
        const { isOnCooldown, timeLeft } = this.check(commandName, interaction.user.id, customCooldown);
        if (isOnCooldown) {
            const message = (0, i18n_1.t)(interaction, "cooldown.wait", {
                time: timeLeft.toFixed(1),
                command: commandName
            });
            // Handle different interaction states
            if (interaction.replied || interaction.deferred) {
                await interaction.editReply({ content: message });
            }
            else {
                await interaction.reply({
                    content: message,
                    flags: discord_js_1.MessageFlags.Ephemeral,
                });
            }
            return true;
        }
        this.set(commandName, interaction.user.id, customCooldown);
        return false;
    }
    /**
     * Clear cooldown for a specific user on a command
     * @param commandName - The name of the command
     * @param userId - The user's Discord ID
     */
    clear(commandName, userId) {
        const timestamps = this.cooldowns.get(commandName);
        if (timestamps) {
            timestamps.delete(userId);
        }
    }
    /**
     * Clear all cooldowns for a command
     * @param commandName - The name of the command
     */
    clearCommand(commandName) {
        this.cooldowns.delete(commandName);
    }
    /**
     * Clear all cooldowns
     */
    clearAll() {
        this.cooldowns.clear();
    }
    /**
     * Get statistics about current cooldowns
     */
    getStats() {
        let totalUsers = 0;
        for (const timestamps of this.cooldowns.values()) {
            totalUsers += timestamps.size;
        }
        return {
            totalCommands: this.cooldowns.size,
            totalUsers,
        };
    }
}
exports.CooldownManager = CooldownManager;
/**
 * Global cooldown manager instance
 */
exports.globalCooldownManager = new CooldownManager(1000);
//# sourceMappingURL=cooldownManager.js.map