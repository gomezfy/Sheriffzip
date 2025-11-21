"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const commandLocalizations_1 = require("../../utils/commandLocalizations");
const embeds_1 = require("../../utils/embeds");
const i18n_1 = require("../../utils/i18n");
const dataManager_1 = require("../../utils/dataManager");
const inventoryManager_1 = require("../../utils/inventoryManager");
const CAPTURE_COOLDOWN = 30 * 60 * 1000;
const captureData = {};
exports.default = {
    data: (0, commandLocalizations_1.applyLocalizations)(new discord_js_1.SlashCommandBuilder()
        .setName("capture")
        .setDescription("Capture a wanted criminal and earn the bounty")
        .addUserOption((option) => option
        .setName("outlaw")
        .setDescription("The wanted outlaw to capture")
        .setRequired(true)), "capture"),
    async execute(interaction) {
        const hunter = interaction.user;
        const target = interaction.options.getUser("outlaw", true);
        if (target.bot) {
            const embed = (0, embeds_1.errorEmbed)((0, i18n_1.t)(interaction, "bounty_invalid_target"), (0, i18n_1.t)(interaction, "bounty_cant_target_bot"), (0, i18n_1.t)(interaction, "bounty_choose_real_outlaw"));
            await interaction.reply({
                embeds: [embed],
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
            return;
        }
        if (target.id === hunter.id) {
            const embed = (0, embeds_1.warningEmbed)((0, i18n_1.t)(interaction, "bounty_self_not_allowed"), (0, i18n_1.t)(interaction, "bounty_cant_target_self"), (0, i18n_1.t)(interaction, "bounty_mighty_strange"));
            await interaction.reply({
                embeds: [embed],
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
            return;
        }
        if (!interaction.guild) {
            const embed = (0, embeds_1.errorEmbed)((0, i18n_1.t)(interaction, "bounty_server_only"), (0, i18n_1.t)(interaction, "bounty_command_server_only"), (0, i18n_1.t)(interaction, "bounty_try_in_server"));
            await interaction.reply({
                embeds: [embed],
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
            return;
        }
        try {
            await interaction.guild.members.fetch(target.id);
        }
        catch (error) {
            const embed = (0, embeds_1.errorEmbed)((0, i18n_1.t)(interaction, "bounty_not_in_server"), (0, i18n_1.t)(interaction, "bounty_user_not_here", { user: target.tag }), (0, i18n_1.t)(interaction, "bounty_must_be_present"));
            await interaction.reply({
                embeds: [embed],
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
            return;
        }
        const now = Date.now();
        const lastCapture = captureData[hunter.id] || 0;
        if (now - lastCapture < CAPTURE_COOLDOWN) {
            const timeLeft = CAPTURE_COOLDOWN - (now - lastCapture);
            const minutesLeft = Math.ceil(timeLeft / 60000);
            const embed = (0, embeds_1.warningEmbed)((0, i18n_1.t)(interaction, "bounty_capture_cooldown"), (0, i18n_1.t)(interaction, "bounty_need_rest", { minutes: minutesLeft }), (0, i18n_1.t)(interaction, "bounty_hunting_exhausting"));
            await interaction.reply({
                embeds: [embed],
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
            return;
        }
        const bounty = (0, dataManager_1.getBountyByTarget)(target.id);
        if (!bounty) {
            const embed = (0, embeds_1.errorEmbed)((0, i18n_1.t)(interaction, "bounty_no_bounty_found"), (0, i18n_1.t)(interaction, "bounty_user_not_wanted", { user: target.tag }), (0, i18n_1.t)(interaction, "bounty_see_active"));
            await interaction.reply({
                embeds: [embed],
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
            return;
        }
        const captureChance = Math.random();
        const baseSuccessRate = 0.5;
        if (captureChance > baseSuccessRate) {
            captureData[hunter.id] = now;
            const embed = (0, embeds_1.warningEmbed)((0, i18n_1.t)(interaction, "bounty_outlaw_escaped"), (0, i18n_1.t)(interaction, "bounty_managed_escape", { user: target.tag }), (0, i18n_1.t)(interaction, "bounty_better_luck")).addFields({
                name: (0, i18n_1.t)(interaction, "bounty_target"),
                value: target.tag,
                inline: true,
            }, {
                name: (0, i18n_1.t)(interaction, "bounty_lost_reward"),
                value: (0, embeds_1.formatCurrency)(bounty.totalAmount, "silver"),
                inline: true,
            }, {
                name: (0, i18n_1.t)(interaction, "bounty_success_rate"),
                value: `${(baseSuccessRate * 100).toFixed(0)}%`,
                inline: true,
            });
            await interaction.reply({ embeds: [embed] });
            return;
        }
        const reward = bounty.totalAmount;
        const result = await (0, inventoryManager_1.addItem)(hunter.id, "silver", reward);
        if (!result.success) {
            const embed = (0, embeds_1.errorEmbed)((0, i18n_1.t)(interaction, "bounty_capture_failed"), (0, i18n_1.t)(interaction, "bounty_inventory_full", { error: result.error }), (0, i18n_1.t)(interaction, "bounty_free_space_try"));
            await interaction.reply({
                embeds: [embed],
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
            return;
        }
        (0, dataManager_1.removeBounty)(target.id);
        captureData[hunter.id] = now;
        const embed = (0, embeds_1.successEmbed)((0, i18n_1.t)(interaction, "bounty_outlaw_captured"), (0, i18n_1.t)(interaction, "bounty_hunter_captured", {
            hunter: hunter.tag,
            outlaw: target.tag,
        }), (0, i18n_1.t)(interaction, "bounty_justice_prevails")).addFields({
            name: (0, i18n_1.t)(interaction, "bounty_hunter"),
            value: hunter.tag,
            inline: true,
        }, {
            name: (0, i18n_1.t)(interaction, "bounty_outlaw"),
            value: target.tag,
            inline: true,
        }, {
            name: (0, i18n_1.t)(interaction, "bounty_reward"),
            value: (0, embeds_1.formatCurrency)(reward, "silver"),
            inline: true,
        });
        await interaction.reply({ embeds: [embed] });
    },
};
//# sourceMappingURL=capture.js.map