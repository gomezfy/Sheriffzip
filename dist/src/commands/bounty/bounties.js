"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const commandLocalizations_1 = require("../../utils/commandLocalizations");
const embeds_1 = require("../../utils/embeds");
const customEmojis_1 = require("../../utils/customEmojis");
const i18n_1 = require("../../utils/i18n");
const dataManager_1 = require("../../utils/dataManager");
exports.default = {
    data: (0, commandLocalizations_1.applyLocalizations)(new discord_js_1.SlashCommandBuilder()
        .setName("bounties")
        .setDescription("View all active bounties"), "bounties"),
    async execute(interaction) {
        const bounties = (0, dataManager_1.getAllBounties)();
        if (bounties.length === 0) {
            const embed = (0, embeds_1.warningEmbed)((0, i18n_1.t)(interaction, "bounty_no_active"), (0, i18n_1.t)(interaction, "bounty_west_peaceful"), (0, i18n_1.t)(interaction, "bounty_use_wanted"));
            await interaction.reply({ embeds: [embed] });
            return;
        }
        let bountiesInServer = [];
        if (interaction.guild) {
            for (const bounty of bounties) {
                try {
                    await interaction.guild.members.fetch(bounty.targetId);
                    bountiesInServer.push(bounty);
                }
                catch (error) {
                    // Usuário não está no servidor, não incluir na lista
                }
            }
        }
        else {
            bountiesInServer = bounties;
        }
        if (bountiesInServer.length === 0) {
            const embed = (0, embeds_1.warningEmbed)((0, i18n_1.t)(interaction, "bounty_no_outlaws_server"), (0, i18n_1.t)(interaction, "bounty_all_fled"), (0, i18n_1.t)(interaction, "bounty_use_wanted"));
            await interaction.reply({ embeds: [embed] });
            return;
        }
        const sortedBounties = bountiesInServer.sort((a, b) => b.totalAmount - a.totalAmount);
        let description = (0, i18n_1.t)(interaction, "bounty_most_wanted") + "\n\n";
        const moneyEmoji = (0, customEmojis_1.getMoneybagEmoji)();
        const groupEmoji = (0, customEmojis_1.getCowboysEmoji)();
        for (const bounty of sortedBounties.slice(0, 10)) {
            const starEmoji = (0, customEmojis_1.getStarEmoji)();
            const stars = starEmoji.repeat(Math.min(Math.floor(bounty.totalAmount / 5000), 5));
            description += `${stars} **${bounty.targetTag}**\n`;
            description += `   ${moneyEmoji} ${(0, i18n_1.t)(interaction, "bounty_reward")}: ${(0, embeds_1.formatCurrency)(bounty.totalAmount, "silver")}\n`;
            description += `   ${groupEmoji} ${(0, i18n_1.t)(interaction, "bounty_contributors")}: ${bounty.contributors.length}\n\n`;
        }
        if (bountiesInServer.length > 10) {
            description += (0, i18n_1.t)(interaction, "bounty_more_outlaws", {
                count: bountiesInServer.length - 10,
            });
        }
        const embed = (0, embeds_1.infoEmbed)(`${(0, customEmojis_1.getScrollEmoji)()} ${(0, i18n_1.t)(interaction, "bounty_active_bounties")}`, description)
            .addFields({
            name: `${(0, customEmojis_1.getDartEmoji)()} ${(0, i18n_1.t)(interaction, "bounty_total_bounties")}`,
            value: bountiesInServer.length.toString(),
            inline: true,
        }, {
            name: `${(0, customEmojis_1.getMoneybagEmoji)()} ${(0, i18n_1.t)(interaction, "bounty_total_rewards")}`,
            value: (0, embeds_1.formatCurrency)(bountiesInServer.reduce((sum, b) => sum + b.totalAmount, 0), "silver"),
            inline: true,
        })
            .setFooter({ text: (0, i18n_1.t)(interaction, "bounty_hunt_claim") });
        await interaction.reply({ embeds: [embed] });
    },
};
//# sourceMappingURL=bounties.js.map