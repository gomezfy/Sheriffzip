"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const commandLocalizations_1 = require("../../utils/commandLocalizations");
const embeds_1 = require("../../utils/embeds");
const wantedPoster_1 = require("../../utils/wantedPoster");
const customEmojis_1 = require("../../utils/customEmojis");
const i18n_1 = require("../../utils/i18n");
const dataManager_1 = require("../../utils/dataManager");
const inventoryManager_1 = require("../../utils/inventoryManager");
const MIN_BOUNTY = 100;
exports.default = {
    data: (0, commandLocalizations_1.applyLocalizations)(new discord_js_1.SlashCommandBuilder()
        .setName("wanted")
        .setDescription("Place a bounty on a wanted user")
        .addUserOption((option) => option
        .setName("user")
        .setDescription("The outlaw you want to place a bounty on")
        .setRequired(true))
        .addIntegerOption((option) => option
        .setName("amount")
        .setDescription("Bounty amount (minimum 100 Silver Coins)")
        .setRequired(true)
        .setMinValue(MIN_BOUNTY))
        .addStringOption((option) => option
        .setName("reason")
        .setDescription("Why are they wanted?")
        .setRequired(false)), "wanted"),
    async execute(interaction) {
        const target = interaction.options.getUser("user", true);
        const amount = interaction.options.getInteger("amount", true);
        const reason = interaction.options.getString("reason") ||
            (0, i18n_1.t)(interaction, "bounty_general_mischief");
        if (target.bot) {
            const embed = (0, embeds_1.errorEmbed)((0, i18n_1.t)(interaction, "bounty_invalid_target"), (0, i18n_1.t)(interaction, "bounty_cant_target_bot"), (0, i18n_1.t)(interaction, "bounty_choose_real_outlaw"));
            await interaction.reply({
                embeds: [embed],
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
            return;
        }
        if (target.id === interaction.user.id) {
            const embed = (0, embeds_1.warningEmbed)((0, i18n_1.t)(interaction, "bounty_self_not_allowed"), (0, i18n_1.t)(interaction, "bounty_cant_target_self"), (0, i18n_1.t)(interaction, "bounty_mighty_strange"));
            await interaction.reply({
                embeds: [embed],
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
            return;
        }
        const existingBounty = (0, dataManager_1.getBountyByTarget)(target.id);
        if (existingBounty) {
            const embed = (0, embeds_1.warningEmbed)((0, i18n_1.t)(interaction, "bounty_already_active"), (0, i18n_1.t)(interaction, "bounty_user_has_bounty", {
                user: target.tag,
                amount: (0, embeds_1.formatCurrency)(existingBounty.totalAmount, "silver"),
            }), (0, i18n_1.t)(interaction, "bounty_wait_cleared"));
            await interaction.reply({
                embeds: [embed],
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
            return;
        }
        const currentSilver = (0, inventoryManager_1.getItem)(interaction.user.id, "silver") || 0;
        if (currentSilver < amount) {
            const embed = (0, embeds_1.errorEmbed)((0, i18n_1.t)(interaction, "bounty_insufficient_funds"), (0, i18n_1.t)(interaction, "bounty_not_enough_silver", {
                required: (0, embeds_1.formatCurrency)(amount, "silver"),
                current: (0, embeds_1.formatCurrency)(currentSilver, "silver"),
            }), (0, i18n_1.t)(interaction, "bounty_earn_more"));
            await interaction.reply({
                embeds: [embed],
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
            return;
        }
        await interaction.deferReply();
        const removeResult = await (0, inventoryManager_1.removeItem)(interaction.user.id, "silver", amount);
        if (!removeResult.success) {
            const embed = (0, embeds_1.errorEmbed)((0, i18n_1.t)(interaction, "bounty_transaction_failed"), (0, i18n_1.t)(interaction, "bounty_could_not_deduct", {
                error: removeResult.error,
            }), (0, i18n_1.t)(interaction, "bounty_try_again"));
            await interaction.editReply({ embeds: [embed] });
            return;
        }
        (0, dataManager_1.addBounty)(target.id, target.tag, interaction.user.id, interaction.user.tag, amount);
        const userLocale = (0, i18n_1.getLocale)(interaction);
        const poster = await (0, wantedPoster_1.generateWantedPoster)(target, amount, userLocale);
        const attachment = new discord_js_1.AttachmentBuilder(poster, {
            name: `wanted-${target.id}.png`,
        });
        const embed = (0, embeds_1.successEmbed)(`${(0, customEmojis_1.getDartEmoji)()} ${(0, i18n_1.t)(interaction, "bounty_placed")}`, `${(0, i18n_1.t)(interaction, "bounty_now_wanted", { user: target.tag })}\n\n${(0, i18n_1.t)(interaction, "bounty_reason", { reason })}`, (0, i18n_1.t)(interaction, "bounty_hunters_can_capture"))
            .setImage(`attachment://wanted-${target.id}.png`)
            .addFields({
            name: (0, i18n_1.t)(interaction, "bounty_target"),
            value: target.tag,
            inline: true,
        }, {
            name: (0, i18n_1.t)(interaction, "bounty_reward"),
            value: (0, embeds_1.formatCurrency)(amount, "silver"),
            inline: true,
        }, {
            name: (0, i18n_1.t)(interaction, "bounty_posted_by"),
            value: interaction.user.tag,
            inline: true,
        });
        await interaction.editReply({ embeds: [embed], files: [attachment] });
    },
};
//# sourceMappingURL=wanted.js.map