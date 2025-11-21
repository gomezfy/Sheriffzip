"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.data = void 0;
exports.execute = execute;
const discord_js_1 = require("discord.js");
const muteManager_1 = require("../../utils/muteManager");
const modLogs_1 = require("../../utils/modLogs");
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName("mute")
    .setDescription("🤠 Silenciar um membro temporariamente")
    .setDescriptionLocalizations({
    "en-US": "🤠 Temporarily mute a member",
    "es-ES": "🤠 Silenciar temporalmente a un miembro",
})
    .addUserOption((option) => option
    .setName("usuario")
    .setNameLocalizations({
    "en-US": "user",
    "es-ES": "usuario",
})
    .setDescription("O membro para silenciar")
    .setDescriptionLocalizations({
    "en-US": "The member to mute",
    "es-ES": "El miembro a silenciar",
})
    .setRequired(true))
    .addIntegerOption((option) => option
    .setName("duracao")
    .setNameLocalizations({
    "en-US": "duration",
    "es-ES": "duracion",
})
    .setDescription("Duração em minutos (1-40320 = até 28 dias)")
    .setDescriptionLocalizations({
    "en-US": "Duration in minutes (1-40320 = up to 28 days)",
    "es-ES": "Duración en minutos (1-40320 = hasta 28 días)",
})
    .setMinValue(1)
    .setMaxValue(40320)
    .setRequired(true))
    .addStringOption((option) => option
    .setName("motivo")
    .setNameLocalizations({
    "en-US": "reason",
    "es-ES": "motivo",
})
    .setDescription("O motivo do silenciamento")
    .setDescriptionLocalizations({
    "en-US": "The reason for muting",
    "es-ES": "El motivo del silenciamiento",
})
    .setRequired(true))
    .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false);
async function execute(interaction) {
    const target = interaction.options.getUser("usuario", true);
    const duration = interaction.options.getInteger("duracao", true);
    const reason = interaction.options.getString("motivo", true);
    if (!interaction.guild) {
        return interaction.reply({
            content: "❌ Este comando só pode ser usado em servidores!",
            ephemeral: true,
        });
    }
    if (target.bot) {
        return interaction.reply({
            content: "❌ Você não pode silenciar bots!",
            ephemeral: true,
        });
    }
    if (target.id === interaction.user.id) {
        return interaction.reply({
            content: "❌ Você não pode se silenciar, parceiro!",
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
    const result = await (0, muteManager_1.muteUser)(member, interaction.user.id, reason, duration);
    if (!result.success) {
        return interaction.reply({
            content: result.message,
            ephemeral: true,
        });
    }
    await (0, modLogs_1.logMute)(interaction.guild, target, interaction.user, reason, duration);
    const durationText = duration >= 1440
        ? `${Math.floor(duration / 1440)} dia(s)`
        : duration >= 60
            ? `${Math.floor(duration / 60)} hora(s)`
            : `${duration} minuto(s)`;
    const embed = new discord_js_1.EmbedBuilder()
        .setColor(discord_js_1.Colors.DarkGrey)
        .setTitle("🔇 Membro Silenciado")
        .setDescription(`${target} foi silenciado!`)
        .addFields({
        name: "👮 Moderador",
        value: interaction.user.tag,
        inline: true,
    }, {
        name: "⏱️ Duração",
        value: durationText,
        inline: true,
    }, {
        name: "📝 Motivo",
        value: reason,
    }, {
        name: "🕐 Expira em",
        value: `<t:${Math.floor(result.expiresAt / 1000)}:F>`,
    })
        .setThumbnail(target.displayAvatarURL())
        .setTimestamp();
    await interaction.reply({ embeds: [embed] });
}
//# sourceMappingURL=mute.js.map