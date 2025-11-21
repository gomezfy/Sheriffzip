"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const embeds_1 = require("../../utils/embeds");
const i18n_1 = require("../../utils/i18n");
const customEmojis_1 = require("../../utils/customEmojis");
const commandLocalizations_1 = require("../../utils/commandLocalizations");
const progressBar_1 = require("../../utils/progressBar");
const redemptionCodeManager_1 = require("../../utils/redemptionCodeManager");
const commandBuilder = new discord_js_1.SlashCommandBuilder()
    .setName("redeem")
    .setDescription("🎁 Redeem a purchase code from the website shop")
    .setContexts([0, 1, 2]) // Guild, BotDM, PrivateChannel
    .setIntegrationTypes([0, 1]) // Guild Install, User Install
    .addStringOption((option) => option
    .setName("code")
    .setDescription("Your redemption code (e.g. SHERIFF-GOLD-ABC123)")
    .setRequired(true));
exports.default = {
    data: (0, commandLocalizations_1.applyLocalizations)(commandBuilder, "redeem"),
    async execute(interaction) {
        const code = interaction.options
            .getString("code", true)
            .toUpperCase()
            .trim();
        const userId = interaction.user.id;
        await interaction.deferReply();
        try {
            // Show progress bar
            await (0, progressBar_1.showProgressBar)(interaction, `${(0, customEmojis_1.getGiftEmoji)()} ${(0, i18n_1.t)(interaction, "redeem_processing").toUpperCase()}`, (0, i18n_1.t)(interaction, "redeem_processing"), 2000, "#FFD700");
            const redemptionResult = await (0, redemptionCodeManager_1.redeemCodeAndApplyRewards)(code, userId, interaction.user.tag);
            if (!redemptionResult.success) {
                if (redemptionResult.errorType === "NOT_FOUND") {
                    const embed = new discord_js_1.EmbedBuilder()
                        .setColor(0xe74c3c)
                        .setTitle(`${(0, customEmojis_1.getCrossEmoji)()} ${(0, i18n_1.t)(interaction, "redeem_invalid_title")}`)
                        .setDescription((0, i18n_1.t)(interaction, "redeem_invalid_desc", { code }))
                        .setFooter({ text: (0, i18n_1.t)(interaction, "redeem_invalid_footer") })
                        .setTimestamp();
                    await interaction.editReply({ embeds: [embed] });
                    return;
                }
                if (redemptionResult.errorType === "ALREADY_REDEEMED" && redemptionResult.code) {
                    const redeemedDate = redemptionResult.code.redeemedAt
                        ? new Date(redemptionResult.code.redeemedAt).toLocaleString()
                        : "Unknown";
                    const embed = new discord_js_1.EmbedBuilder()
                        .setColor(0xf39c12)
                        .setTitle(`${(0, customEmojis_1.getWarningEmoji)()} ${(0, i18n_1.t)(interaction, "redeem_already_title")}`)
                        .setDescription((0, i18n_1.t)(interaction, "redeem_already_desc", {
                        product: redemptionResult.code.productName,
                        date: redeemedDate,
                    }))
                        .setFooter({ text: (0, i18n_1.t)(interaction, "redeem_already_footer") })
                        .setTimestamp();
                    await interaction.editReply({ embeds: [embed] });
                    return;
                }
                if (redemptionResult.errorType === "UPGRADE_NOT_NEEDED") {
                    const embed = new discord_js_1.EmbedBuilder()
                        .setColor(0xf39c12)
                        .setTitle(`${(0, customEmojis_1.getInfoEmoji)()} ${(0, i18n_1.t)(interaction, "redeem_upgrade_not_needed_title")}`)
                        .setDescription((0, i18n_1.t)(interaction, "redeem_upgrade_not_needed_desc", {
                        current: redemptionResult.currentInventoryCapacity,
                        target: redemptionResult.targetInventoryCapacity,
                    }))
                        .setFooter({
                        text: (0, i18n_1.t)(interaction, "redeem_upgrade_not_needed_footer"),
                    })
                        .setTimestamp();
                    await interaction.editReply({ embeds: [embed] });
                    return;
                }
                const embed = new discord_js_1.EmbedBuilder()
                    .setColor(0xe74c3c)
                    .setTitle(`${(0, customEmojis_1.getCrossEmoji)()} ${(0, i18n_1.t)(interaction, "redeem_error_title")}`)
                    .setDescription(redemptionResult.error || (0, i18n_1.t)(interaction, "redeem_error_desc"))
                    .setFooter({ text: (0, i18n_1.t)(interaction, "redeem_error_footer") })
                    .setTimestamp();
                await interaction.editReply({ embeds: [embed] });
                return;
            }
            const redemption = redemptionResult.code;
            const rewards = [];
            if (redemption.tokens > 0) {
                rewards.push(`${(0, customEmojis_1.getSaloonTokenEmoji)()} +${(0, embeds_1.formatCurrency)(redemption.tokens, "tokens")}`);
            }
            if (redemption.coins > 0) {
                rewards.push(`${(0, customEmojis_1.getSilverCoinEmoji)()} +${(0, embeds_1.formatCurrency)(redemption.coins, "silver")}`);
            }
            if (redemption.rexBucks && redemption.rexBucks > 0) {
                rewards.push(`${(0, customEmojis_1.getRexBuckEmoji)()} +${redemption.rexBucks.toLocaleString()} RexBucks`);
            }
            let backpackUpgraded = false;
            let newCapacity = 0;
            if (redemption.backpack) {
                backpackUpgraded = true;
                newCapacity = redemption.backpack;
                rewards.push(`${(0, customEmojis_1.getBackpackEmoji)()} ${(0, i18n_1.t)(interaction, "redeem_inventory_upgraded", { capacity: redemption.backpack })}`);
            }
            // Create success embed
            const embed = new discord_js_1.EmbedBuilder()
                .setColor(0x2ecc71)
                .setTitle(`${(0, customEmojis_1.getCheckEmoji)()} ${(0, i18n_1.t)(interaction, "redeem_success_title")}`)
                .setDescription((0, i18n_1.t)(interaction, "redeem_success_desc", {
                product: redemption.productName,
                code,
            }))
                .addFields({
                name: `${(0, customEmojis_1.getGiftEmoji)()} ${(0, i18n_1.t)(interaction, "redeem_rewards")}`,
                value: rewards.length > 0
                    ? rewards.join("\n")
                    : (0, i18n_1.t)(interaction, "redeem_special_perks"),
                inline: false,
            })
                .setFooter({ text: (0, i18n_1.t)(interaction, "redeem_success_footer") })
                .setTimestamp();
            if (redemption.vip) {
                embed.addFields({
                    name: `${(0, customEmojis_1.getStarEmoji)()} ${(0, i18n_1.t)(interaction, "redeem_vip_status")}`,
                    value: (0, i18n_1.t)(interaction, "redeem_vip_activated"),
                    inline: false,
                });
            }
            if (redemption.background) {
                embed.addFields({
                    name: `${(0, customEmojis_1.getSparklesEmoji)()} ${(0, i18n_1.t)(interaction, "redeem_background")}`,
                    value: (0, i18n_1.t)(interaction, "redeem_background_unlocked"),
                    inline: false,
                });
            }
            if (backpackUpgraded) {
                embed.addFields({
                    name: `${(0, customEmojis_1.getBackpackEmoji)()} ${(0, i18n_1.t)(interaction, "redeem_backpack")}`,
                    value: (0, i18n_1.t)(interaction, "redeem_backpack_upgraded", {
                        capacity: newCapacity,
                    }),
                    inline: false,
                });
            }
            await interaction.editReply({ embeds: [embed] });
            console.log(`✅ Code redeemed: ${code} by ${interaction.user.tag} (${userId})`);
        }
        catch (error) {
            console.error("Error redeeming code:", error);
            const embed = new discord_js_1.EmbedBuilder()
                .setColor(0xe74c3c)
                .setTitle(`${(0, customEmojis_1.getCrossEmoji)()} ${(0, i18n_1.t)(interaction, "redeem_error_title")}`)
                .setDescription((0, i18n_1.t)(interaction, "redeem_error_desc"))
                .setFooter({ text: (0, i18n_1.t)(interaction, "redeem_error_footer") })
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        }
    },
};
//# sourceMappingURL=redeem.js.map