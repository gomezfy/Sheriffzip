"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.data = void 0;
exports.execute = execute;
const discord_js_1 = require("discord.js");
const levelRewards_1 = require("../../utils/levelRewards");
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName("addreward")
    .setDescription("🤠 Adicionar recompensa de role por nível")
    .setDescriptionLocalizations({
    "en-US": "🤠 Add level role reward",
    "es-ES": "🤠 Añadir recompensa de rol por nivel",
})
    .addIntegerOption((option) => option
    .setName("nivel")
    .setNameLocalizations({
    "en-US": "level",
    "es-ES": "nivel",
})
    .setDescription("O nível necessário")
    .setDescriptionLocalizations({
    "en-US": "Required level",
    "es-ES": "Nivel requerido",
})
    .setMinValue(1)
    .setMaxValue(100)
    .setRequired(true))
    .addRoleOption((option) => option
    .setName("role")
    .setDescription("O role para dar como recompensa")
    .setDescriptionLocalizations({
    "en-US": "The role to give as reward",
    "es-ES": "El rol para dar como recompensa",
})
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
    const level = interaction.options.getInteger("nivel", true);
    const role = interaction.options.getRole("role", true);
    const result = (0, levelRewards_1.addLevelReward)(interaction.guild.id, level, role.id);
    const rewards = (0, levelRewards_1.getLevelRewards)(interaction.guild.id);
    const embed = new discord_js_1.EmbedBuilder()
        .setColor(discord_js_1.Colors.Gold)
        .setTitle("🎁 Recompensa de Nível Configurada")
        .setDescription(result.message)
        .addFields({
        name: "📊 Nível",
        value: level.toString(),
        inline: true,
    }, {
        name: "🎭 Role",
        value: `<@&${role.id}>`,
        inline: true,
    }, {
        name: "📋 Total de Recompensas",
        value: rewards.length.toString(),
        inline: true,
    })
        .setTimestamp();
    if (rewards.length > 0) {
        const rewardsList = rewards
            .map((r) => `Nível **${r.level}**: <@&${r.roleId}>`)
            .join("\n");
        embed.addFields({
            name: "🎁 Todas as Recompensas",
            value: rewardsList.slice(0, 1000),
        });
    }
    await interaction.reply({ embeds: [embed] });
}
//# sourceMappingURL=addreward.js.map