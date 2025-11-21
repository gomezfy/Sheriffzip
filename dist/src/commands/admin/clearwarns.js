"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.data = void 0;
exports.execute = execute;
const discord_js_1 = require("discord.js");
const warnManager_1 = require("../../utils/warnManager");
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName("clearwarns")
    .setDescription("🤠 Limpar avisos de um membro")
    .setDescriptionLocalizations({
    "en-US": "🤠 Clear warnings from a member",
    "es-ES": "🤠 Limpiar advertencias de un miembro",
})
    .addUserOption((option) => option
    .setName("usuario")
    .setNameLocalizations({
    "en-US": "user",
    "es-ES": "usuario",
})
    .setDescription("O membro para limpar os avisos")
    .setDescriptionLocalizations({
    "en-US": "The member to clear warnings",
    "es-ES": "El miembro para limpiar advertencias",
})
    .setRequired(true))
    .addStringOption((option) => option
    .setName("warn_id")
    .setDescription("ID específico do aviso para remover (opcional - remove apenas um)")
    .setDescriptionLocalizations({
    "en-US": "Specific warn ID to remove (optional - removes only one)",
    "es-ES": "ID específico de advertencia para eliminar (opcional - elimina solo uno)",
})
    .setRequired(false))
    .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.Administrator)
    .setDMPermission(false);
async function execute(interaction) {
    if (!interaction.guild) {
        return interaction.reply({
            content: "❌ Este comando só pode ser usado em servidores!",
            ephemeral: true,
        });
    }
    const target = interaction.options.getUser("usuario", true);
    const warnId = interaction.options.getString("warn_id");
    let result;
    let description;
    if (warnId) {
        result = (0, warnManager_1.removeWarn)(target.id, interaction.guild.id, warnId);
        description = result.success
            ? `✅ Um aviso foi removido de ${target}!`
            : result.message;
    }
    else {
        result = (0, warnManager_1.clearWarns)(target.id, interaction.guild.id);
        description = `✅ Todos os avisos de ${target} foram limpos!\n📊 Total removido: **${result.clearedCount}**`;
    }
    const embed = new discord_js_1.EmbedBuilder()
        .setColor(result.success ? discord_js_1.Colors.Green : discord_js_1.Colors.Red)
        .setTitle(result.success ? "✅ Avisos Removidos" : "❌ Erro")
        .setDescription(description)
        .addFields({
        name: "👮 Moderador",
        value: interaction.user.tag,
    })
        .setThumbnail(target.displayAvatarURL())
        .setTimestamp();
    await interaction.reply({ embeds: [embed] });
}
//# sourceMappingURL=clearwarns.js.map