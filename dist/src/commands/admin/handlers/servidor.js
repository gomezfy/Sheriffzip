"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleServidor = handleServidor;
const discord_js_1 = require("discord.js");
async function handleServidor(interaction) {
    const { guild } = interaction;
    if (!guild) {
        await interaction.reply({
            content: "❌ This command can only be used in a server!",
            flags: discord_js_1.MessageFlags.Ephemeral,
        });
        return;
    }
    const embed = new discord_js_1.EmbedBuilder()
        .setTitle(`${guild.name} Information`)
        .setThumbnail(guild.iconURL({ size: 256 }))
        .setColor(0x5865f2)
        .addFields({ name: "👑 Owner", value: `<@${guild.ownerId}>`, inline: true }, { name: "👥 Members", value: `${guild.memberCount}`, inline: true }, {
        name: "📅 Created",
        value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`,
        inline: true,
    }, {
        name: "💬 Channels",
        value: `${guild.channels.cache.size}`,
        inline: true,
    }, { name: "🎭 Roles", value: `${guild.roles.cache.size}`, inline: true }, { name: "😀 Emojis", value: `${guild.emojis.cache.size}`, inline: true })
        .setFooter({ text: `ID: ${guild.id}` })
        .setTimestamp();
    await interaction.reply({ embeds: [embed] });
}
//# sourceMappingURL=servidor.js.map