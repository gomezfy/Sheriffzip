"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.data = void 0;
exports.execute = execute;
const discord_js_1 = require("discord.js");
const warnManager_1 = require("../../utils/warnManager");
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName("warnings")
    .setDescription("🤠 Ver os avisos de um membro")
    .setDescriptionLocalizations({
    "en-US": "🤠 View warnings of a member",
    "es-ES": "🤠 Ver advertencias de un miembro",
})
    .addUserOption((option) => option
    .setName("usuario")
    .setNameLocalizations({
    "en-US": "user",
    "es-ES": "usuario",
})
    .setDescription("O membro para ver os avisos")
    .setDescriptionLocalizations({
    "en-US": "The member to check warnings",
    "es-ES": "El miembro para ver advertencias",
})
    .setRequired(false))
    .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false);
async function execute(interaction) {
    if (!interaction.guild) {
        return interaction.reply({
            content: "❌ Este comando só pode ser usado em servidores!",
            flags: discord_js_1.MessageFlags.Ephemeral,
        });
    }
    const target = interaction.options.getUser("usuario") || interaction.user;
    const warns = (0, warnManager_1.getUserWarns)(target.id, interaction.guild.id);
    if (warns.length === 0) {
        return interaction.reply({
            content: `✅ ${target.id === interaction.user.id ? "Você não possui" : `${target} não possui`} nenhum aviso!`,
            flags: discord_js_1.MessageFlags.Ephemeral,
        });
    }
    const embed = new discord_js_1.EmbedBuilder()
        .setColor(discord_js_1.Colors.Orange)
        .setTitle(`⚠️ Avisos de ${target.tag}`)
        .setDescription(`Total de avisos: **${warns.length}**`)
        .setThumbnail(target.displayAvatarURL())
        .setTimestamp();
    const warnsText = warns
        .slice(0, 10)
        .map((warn, index) => {
        const date = new Date(warn.timestamp);
        return `**${index + 1}.** <t:${Math.floor(warn.timestamp / 1000)}:R>\n📝 ${warn.reason}\n🆔 \`${warn.warnId}\``;
    })
        .join("\n\n");
    embed.addFields({
        name: "📋 Histórico de Avisos",
        value: warnsText,
    });
    if (warns.length > 10) {
        embed.setFooter({ text: `Mostrando 10 de ${warns.length} avisos` });
    }
    await interaction.reply({ embeds: [embed], flags: discord_js_1.MessageFlags.Ephemeral });
}
//# sourceMappingURL=warnings.js.map