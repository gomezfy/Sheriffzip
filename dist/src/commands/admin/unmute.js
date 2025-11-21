"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.data = void 0;
exports.execute = execute;
const discord_js_1 = require("discord.js");
const muteManager_1 = require("../../utils/muteManager");
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName("unmute")
    .setDescription("🤠 Dessilenciar um membro")
    .setDescriptionLocalizations({
    "en-US": "🤠 Unmute a member",
    "es-ES": "🤠 Desilenciar a un miembro",
})
    .addUserOption((option) => option
    .setName("usuario")
    .setNameLocalizations({
    "en-US": "user",
    "es-ES": "usuario",
})
    .setDescription("O membro para dessilenciar")
    .setDescriptionLocalizations({
    "en-US": "The member to unmute",
    "es-ES": "El miembro a desilenciar",
})
    .setRequired(true))
    .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false);
async function execute(interaction) {
    const target = interaction.options.getUser("usuario", true);
    if (!interaction.guild) {
        return interaction.reply({
            content: "❌ Este comando só pode ser usado em servidores!",
            ephemeral: true,
        });
    }
    const member = await interaction.guild.members
        .fetch(target.id)
        .catch(() => null);
    if (!member) {
        return interaction.reply({
            content: "❌ Membro não encontrado no servidor!",
            ephemeral: true,
        });
    }
    const result = await (0, muteManager_1.unmuteUser)(member);
    const embed = new discord_js_1.EmbedBuilder()
        .setColor(result.success ? discord_js_1.Colors.Green : discord_js_1.Colors.Red)
        .setTitle(result.success ? "✅ Membro Dessilenciado" : "❌ Erro")
        .setDescription(result.success ? `${target} foi dessilenciado!` : result.message)
        .addFields({
        name: "👮 Moderador",
        value: interaction.user.tag,
    })
        .setThumbnail(target.displayAvatarURL())
        .setTimestamp();
    await interaction.reply({ embeds: [embed] });
}
//# sourceMappingURL=unmute.js.map