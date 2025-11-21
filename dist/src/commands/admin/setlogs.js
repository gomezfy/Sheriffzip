"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.data = void 0;
exports.execute = execute;
const discord_js_1 = require("discord.js");
const modLogs_1 = require("../../utils/modLogs");
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName("setlogs")
    .setDescription("🤠 Configurar canal de logs de moderação")
    .setDescriptionLocalizations({
    "en-US": "🤠 Set moderation logs channel",
    "es-ES": "🤠 Configurar canal de registros de moderación",
})
    .addChannelOption((option) => option
    .setName("canal")
    .setNameLocalizations({
    "en-US": "channel",
    "es-ES": "canal",
})
    .setDescription("O canal para enviar os logs")
    .setDescriptionLocalizations({
    "en-US": "The channel to send logs",
    "es-ES": "El canal para enviar los registros",
})
    .addChannelTypes(discord_js_1.ChannelType.GuildText)
    .setRequired(true))
    .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.Administrator)
    .setDMPermission(false);
async function execute(interaction) {
    if (!interaction.guild) {
        return interaction.reply({
            content: "❌ Este comando só pode ser usado em servidores!",
            ephemeral: true,
        });
    }
    const channel = interaction.options.getChannel("canal", true);
    const result = (0, modLogs_1.setModLogChannel)(interaction.guild.id, channel.id);
    const embed = new discord_js_1.EmbedBuilder()
        .setColor(discord_js_1.Colors.Green)
        .setTitle("✅ Logs Configurados")
        .setDescription(`Canal de logs de moderação configurado: ${channel}`)
        .addFields({
        name: "📋 Eventos Registrados",
        value: [
            "• Mensagens deletadas",
            "• Mensagens editadas",
            "• Membros entrando",
            "• Membros saindo",
            "• Bans",
            "• Avisos",
            "• Silenciamentos",
        ].join("\n"),
    }, {
        name: "👮 Configurado por",
        value: interaction.user.tag,
    })
        .setTimestamp();
    await interaction.reply({ embeds: [embed] });
}
//# sourceMappingURL=setlogs.js.map