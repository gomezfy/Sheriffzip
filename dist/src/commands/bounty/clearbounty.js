"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const commandLocalizations_1 = require("../../utils/commandLocalizations");
const embeds_1 = require("../../utils/embeds");
const i18n_1 = require("../../utils/i18n");
const dataManager_1 = require("../../utils/dataManager");
exports.default = {
    data: (0, commandLocalizations_1.applyLocalizations)(new discord_js_1.SlashCommandBuilder()
        .setName("clearbounty")
        .setDescription("Remove a bounty (Admin only)")
        .addUserOption((option) => option
        .setName("user")
        .setDescription("User to clear bounty from")
        .setRequired(true)), "clearbounty"),
    async execute(interaction) {
        if (!interaction.memberPermissions?.has("Administrator")) {
            const embed = (0, embeds_1.errorEmbed)((0, i18n_1.t)(interaction, "bounty_permission_denied"), (0, i18n_1.t)(interaction, "bounty_admin_only"), (0, i18n_1.t)(interaction, "bounty_contact_admin"));
            await interaction.reply({
                embeds: [embed],
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
            return;
        }
        const target = interaction.options.getUser("user", true);
        const bounty = (0, dataManager_1.getBountyByTarget)(target.id);
        if (!bounty) {
            const embed = (0, embeds_1.warningEmbed)((0, i18n_1.t)(interaction, "bounty_no_bounty_found"), (0, i18n_1.t)(interaction, "bounty_user_no_bounty", { user: target.tag }), (0, i18n_1.t)(interaction, "bounty_nothing_to_clear"));
            await interaction.reply({
                embeds: [embed],
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
            return;
        }
        (0, dataManager_1.removeBounty)(target.id);
        const embed = (0, embeds_1.successEmbed)((0, i18n_1.t)(interaction, "bounty_cleared"), (0, i18n_1.t)(interaction, "bounty_admin_cleared", { user: target.tag }), (0, i18n_1.t)(interaction, "bounty_no_longer_wanted")).addFields({
            name: (0, i18n_1.t)(interaction, "bounty_target"),
            value: target.tag,
            inline: true,
        }, {
            name: (0, i18n_1.t)(interaction, "bounty_amount_cleared"),
            value: (0, embeds_1.formatCurrency)(bounty.totalAmount, "silver"),
            inline: true,
        }, {
            name: (0, i18n_1.t)(interaction, "bounty_cleared_by"),
            value: interaction.user.tag,
            inline: true,
        });
        await interaction.reply({ embeds: [embed] });
    },
};
//# sourceMappingURL=clearbounty.js.map