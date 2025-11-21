"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleLogs = handleLogs;
const discord_js_1 = require("discord.js");
const dataManager_1 = require("../../../utils/dataManager");
const i18n_1 = require("../../../utils/i18n");
async function handleLogs(interaction, subcommand) {
    if (!interaction.guild) {
        await interaction.reply({
            content: "❌ This command can only be used in a server!",
            flags: discord_js_1.MessageFlags.Ephemeral,
        });
        return;
    }
    if (subcommand === "set") {
        const channel = interaction.options.getChannel("channel", true);
        const config = {
            channelId: channel.id,
            enabled: true,
            types: [
                "command",
                "error",
                "welcome",
                "leave",
                "economy",
                "bounty",
                "mining",
                "gambling",
                "admin",
            ],
        };
        (0, dataManager_1.setLogConfig)(interaction.guild.id, config);
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle(`✅ ${(0, i18n_1.t)(interaction, "logs_configured")}`)
            .setDescription((0, i18n_1.t)(interaction, "logs_channel_set"))
            .addFields({
            name: `📢 ${(0, i18n_1.t)(interaction, "announce_channel")}`,
            value: `<#${channel.id}>`,
            inline: false,
        }, {
            name: `📋 ${(0, i18n_1.t)(interaction, "logs_events_tracked")}`,
            value: `✅ ${(0, i18n_1.t)(interaction, "logs_member_join")}\n✅ ${(0, i18n_1.t)(interaction, "logs_member_leave")}\n✅ ${(0, i18n_1.t)(interaction, "logs_message_delete")}\n✅ ${(0, i18n_1.t)(interaction, "logs_message_edit")}`,
            inline: false,
        })
            .setFooter({
            text: (0, i18n_1.t)(interaction, "logs_title"),
            iconURL: interaction.user.displayAvatarURL(),
        })
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
    else if (subcommand === "view") {
        const config = (0, dataManager_1.getLogConfig)(interaction.guild.id);
        if (!config) {
            await interaction.reply({
                content: `❌ ${(0, i18n_1.t)(interaction, "logs_not_configured")}`,
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
            return;
        }
        const statusText = config.enabled
            ? `✅ ${(0, i18n_1.t)(interaction, "logs_enabled")}`
            : `❌ ${(0, i18n_1.t)(interaction, "logs_disabled")}`;
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(config.enabled ? 0x00ff00 : 0x808080)
            .setTitle(`🛡️ ${(0, i18n_1.t)(interaction, "logs_current_config")}`)
            .addFields({
            name: `📊 ${(0, i18n_1.t)(interaction, "logs_status")}`,
            value: statusText,
            inline: true,
        }, {
            name: `📢 ${(0, i18n_1.t)(interaction, "announce_channel")}`,
            value: `<#${config.channelId}>`,
            inline: true,
        }, {
            name: `📋 ${(0, i18n_1.t)(interaction, "logs_events_tracked")}`,
            value: `✅ ${(0, i18n_1.t)(interaction, "logs_member_join")}\n` +
                `✅ ${(0, i18n_1.t)(interaction, "logs_member_leave")}\n` +
                `✅ ${(0, i18n_1.t)(interaction, "logs_message_delete")}\n` +
                `✅ ${(0, i18n_1.t)(interaction, "logs_message_edit")}`,
            inline: false,
        })
            .setFooter({ text: (0, i18n_1.t)(interaction, "logs_title") });
        if (config.updatedAt) {
            embed.setTimestamp(config.updatedAt);
        }
        await interaction.reply({ embeds: [embed], flags: discord_js_1.MessageFlags.Ephemeral });
    }
    else if (subcommand === "disable") {
        const config = (0, dataManager_1.getLogConfig)(interaction.guild.id);
        if (!config) {
            await interaction.reply({
                content: `❌ ${(0, i18n_1.t)(interaction, "logs_not_configured")}`,
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
            return;
        }
        (0, dataManager_1.removeLogConfig)(interaction.guild.id);
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(0xff0000)
            .setTitle(`❌ ${(0, i18n_1.t)(interaction, "logs_removed")}`)
            .setDescription((0, i18n_1.t)(interaction, "logs_removed_description"))
            .setTimestamp()
            .setFooter({ text: (0, i18n_1.t)(interaction, "logs_title") });
        await interaction.reply({ embeds: [embed] });
    }
}
//# sourceMappingURL=logs.js.map