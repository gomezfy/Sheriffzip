"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const xpManager_1 = require("../../utils/xpManager");
const embeds_1 = require("../../utils/embeds");
const customEmojis_1 = require("../../utils/customEmojis");
const i18n_1 = require("../../utils/i18n");
const commandLocalizations_1 = require("../../utils/commandLocalizations");
const inventoryManager_1 = require("../../utils/inventoryManager");
const database_1 = require("../../utils/database");
const dailyCooldown = 24 * 60 * 60 * 1000;
/**
 * Get daily data from database
 * @returns The daily data object containing all user daily claim information
 */
function getDailyData() {
    return (0, database_1.readData)("daily.json");
}
/**
 * Save daily data to database
 * @param data - The daily data object to save
 * @returns void
 */
function saveDailyData(data) {
    (0, database_1.writeData)("daily.json", data);
}
/**
 * Daily Command - Allows users to claim daily rewards and build streaks
 *
 * Features:
 * - 24 hour cooldown between claims
 * - Streak system with bonus rewards
 * - Rewards scale with streak length (up to 100% bonus)
 * - Breaks streak if user doesn't claim within 48 hours
 * - Rewards: Silver coins, Saloon Tokens, and XP
 */
const command = {
    data: (0, commandLocalizations_1.applyLocalizations)(new discord_js_1.SlashCommandBuilder()
        .setName("daily")
        .setDescription("Claim your daily reward and build a streak!")
        .setContexts([0, 1, 2]) // Guild, BotDM, PrivateChannel
        .setIntegrationTypes([0, 1]), // Guild Install, User Install
    "daily"),
    /**
     * Execute the daily command
     * @param interaction - The command interaction from Discord
     * @returns Promise that resolves when command execution is complete
     */
    async execute(interaction) {
        const userId = interaction.user.id;
        const dailyData = getDailyData();
        if (!dailyData[userId]) {
            dailyData[userId] = {
                lastClaim: 0,
                streak: 0,
            };
        }
        let userData = dailyData[userId];
        // Fix corrupted data (if userData is just a number instead of an object)
        if (typeof userData === "number") {
            userData = {
                lastClaim: userData,
                streak: 1,
            };
            dailyData[userId] = userData;
            saveDailyData(dailyData);
        }
        const now = Date.now();
        const timeSinceLastClaim = now - userData.lastClaim;
        if (timeSinceLastClaim < dailyCooldown) {
            const timeLeft = dailyCooldown - timeSinceLastClaim;
            const pluralSuffix = userData.streak !== 1 ? "s" : "";
            const embed = (0, embeds_1.warningEmbed)((0, i18n_1.t)(interaction, "daily_title"), (0, i18n_1.t)(interaction, "daily_already_claimed", {
                time: (0, embeds_1.formatDuration)(timeLeft),
                streak: userData.streak,
                plural: pluralSuffix,
            }), (0, i18n_1.t)(interaction, "daily_come_back"));
            await interaction.reply({
                embeds: [embed],
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
            return;
        }
        // Defer reply immediately for better performance
        await interaction.deferReply();
        const wasStreakBroken = timeSinceLastClaim > dailyCooldown * 2;
        const previousStreak = userData.streak; // Capture previous streak before mutation
        const newStreak = wasStreakBroken ? 1 : userData.streak + 1;
        const baseSilver = 500;
        const baseTokens = 5;
        const baseXP = 100;
        const streakBonus = Math.min(newStreak * 0.1, 1.0);
        const silverAmount = Math.floor(baseSilver * (1 + streakBonus));
        const tokenAmount = Math.floor(baseTokens * (1 + streakBonus));
        const xpAmount = Math.floor(baseXP * (1 + streakBonus));
        const silverResult = await (0, inventoryManager_1.addItem)(userId, "silver", silverAmount);
        const tokenResult = await (0, inventoryManager_1.addItem)(userId, "saloon_token", tokenAmount);
        if (!silverResult.success || !tokenResult.success) {
            const error = !silverResult.success
                ? silverResult.error
                : tokenResult.error;
            const embed = (0, embeds_1.errorEmbed)((0, i18n_1.t)(interaction, "daily_failed_title"), (0, i18n_1.t)(interaction, "daily_inventory_too_full", { error }), (0, i18n_1.t)(interaction, "daily_free_space"));
            await interaction.editReply({
                embeds: [embed],
            });
            return;
        }
        (0, xpManager_1.addXp)(userId, xpAmount);
        userData.lastClaim = now;
        userData.streak = newStreak;
        dailyData[userId] = userData;
        saveDailyData(dailyData);
        const streakText = newStreak !== 1
            ? (0, i18n_1.t)(interaction, "daily_days")
            : (0, i18n_1.t)(interaction, "daily_day");
        const embed = (0, embeds_1.economyEmbed)((0, i18n_1.t)(interaction, "daily_title"), wasStreakBroken && previousStreak > 1
            ? (0, i18n_1.t)(interaction, "daily_streak_broken")
            : (0, i18n_1.t)(interaction, "daily_claimed_success"), (0, i18n_1.t)(interaction, "daily_comeback_24h")).addFields((0, embeds_1.field)(`${(0, customEmojis_1.getSilverCoinEmoji)()} ${(0, i18n_1.t)(interaction, "daily_field_silver")}`, `+${(0, embeds_1.formatCurrency)(silverAmount, "silver")}`, true), (0, embeds_1.field)(`${(0, customEmojis_1.getSaloonTokenEmoji)()} ${(0, i18n_1.t)(interaction, "daily_field_tokens")}`, `+${(0, embeds_1.formatCurrency)(tokenAmount, "tokens")}`, true), (0, embeds_1.field)((0, i18n_1.t)(interaction, "daily_field_xp"), `+${xpAmount}`, true), (0, embeds_1.field)((0, i18n_1.t)(interaction, "daily_field_streak"), `${newStreak} ${streakText} 🔥`, true), (0, embeds_1.field)((0, i18n_1.t)(interaction, "daily_field_bonus"), `+${Math.floor(streakBonus * 100)}%`, true), (0, embeds_1.field)("\u200B", "\u200B", true));
        await interaction.editReply({ embeds: [embed] });
    },
};
exports.default = command;
//# sourceMappingURL=daily.js.map