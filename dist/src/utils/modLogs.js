"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setModLogChannel = setModLogChannel;
exports.getModLogChannel = getModLogChannel;
exports.isEventEnabled = isEventEnabled;
exports.logMessageDelete = logMessageDelete;
exports.logMessageEdit = logMessageEdit;
exports.logMemberJoin = logMemberJoin;
exports.logMemberLeave = logMemberLeave;
exports.logMemberBan = logMemberBan;
exports.logWarn = logWarn;
exports.logMute = logMute;
const database_1 = require("./database");
const discord_js_1 = require("discord.js");
function getModLogConfig() {
    try {
        return (0, database_1.readData)("mod-logs.json");
    }
    catch (error) {
        return {};
    }
}
function saveModLogConfig(data) {
    (0, database_1.writeData)("mod-logs.json", data);
}
function setModLogChannel(guildId, channelId) {
    const config = getModLogConfig();
    if (!config[guildId]) {
        config[guildId] = {
            channelId,
            events: {
                messageDelete: true,
                messageEdit: true,
                memberJoin: true,
                memberLeave: true,
                memberBan: true,
                memberUnban: true,
                memberKick: true,
                roleUpdate: true,
                channelUpdate: true,
                warnAdd: true,
                muteAdd: true,
            },
        };
    }
    else {
        config[guildId].channelId = channelId;
    }
    saveModLogConfig(config);
    return {
        success: true,
        message: "✅ Canal de logs configurado com sucesso!",
    };
}
function getModLogChannel(guildId) {
    const config = getModLogConfig();
    return config[guildId]?.channelId || null;
}
function isEventEnabled(guildId, event) {
    const config = getModLogConfig();
    if (!config[guildId])
        return false;
    return (config[guildId].events[event] ||
        false);
}
async function logMessageDelete(message) {
    if (!message.guild || message.author.bot)
        return;
    const channelId = getModLogChannel(message.guild.id);
    if (!channelId || !isEventEnabled(message.guild.id, "messageDelete"))
        return;
    try {
        const logChannel = message.guild.channels.cache.get(channelId);
        if (!logChannel)
            return;
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(discord_js_1.Colors.Red)
            .setTitle("🗑️ Mensagem Deletada")
            .setDescription(`**Autor:** ${message.author.tag}\n**Canal:** ${message.channel}`)
            .addFields({
            name: "📝 Conteúdo",
            value: message.content || "*[Sem conteúdo de texto]*",
        }, {
            name: "📅 Data",
            value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
        })
            .setFooter({ text: `ID: ${message.id}` })
            .setTimestamp();
        await logChannel.send({ embeds: [embed] });
    }
    catch (error) {
        console.error("Error logging message delete:", error);
    }
}
async function logMessageEdit(oldMessage, newMessage) {
    if (!newMessage.guild || newMessage.author.bot)
        return;
    if (oldMessage.content === newMessage.content)
        return;
    const channelId = getModLogChannel(newMessage.guild.id);
    if (!channelId || !isEventEnabled(newMessage.guild.id, "messageEdit"))
        return;
    try {
        const logChannel = newMessage.guild.channels.cache.get(channelId);
        if (!logChannel)
            return;
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(discord_js_1.Colors.Yellow)
            .setTitle("✏️ Mensagem Editada")
            .setDescription(`**Autor:** ${newMessage.author.tag}\n**Canal:** ${newMessage.channel}\n**[Ir para mensagem](${newMessage.url})**`)
            .addFields({
            name: "📝 Antes",
            value: oldMessage.content?.slice(0, 1000) || "*[Sem conteúdo]*",
        }, {
            name: "📝 Depois",
            value: newMessage.content?.slice(0, 1000) || "*[Sem conteúdo]*",
        })
            .setFooter({ text: `ID: ${newMessage.id}` })
            .setTimestamp();
        await logChannel.send({ embeds: [embed] });
    }
    catch (error) {
        console.error("Error logging message edit:", error);
    }
}
async function logMemberJoin(member) {
    const channelId = getModLogChannel(member.guild.id);
    if (!channelId || !isEventEnabled(member.guild.id, "memberJoin"))
        return;
    try {
        const logChannel = member.guild.channels.cache.get(channelId);
        if (!logChannel)
            return;
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(discord_js_1.Colors.Green)
            .setTitle("👋 Membro Entrou")
            .setDescription(`**Usuário:** ${member.user.tag}\n**ID:** ${member.id}`)
            .addFields({
            name: "📅 Conta Criada",
            value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`,
            inline: true,
        }, {
            name: "📊 Total de Membros",
            value: member.guild.memberCount.toString(),
            inline: true,
        })
            .setThumbnail(member.user.displayAvatarURL())
            .setTimestamp();
        await logChannel.send({ embeds: [embed] });
    }
    catch (error) {
        console.error("Error logging member join:", error);
    }
}
async function logMemberLeave(member) {
    const channelId = getModLogChannel(member.guild.id);
    if (!channelId || !isEventEnabled(member.guild.id, "memberLeave"))
        return;
    try {
        const logChannel = member.guild.channels.cache.get(channelId);
        if (!logChannel)
            return;
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(discord_js_1.Colors.Orange)
            .setTitle("👋 Membro Saiu")
            .setDescription(`**Usuário:** ${member.user.tag}\n**ID:** ${member.id}`)
            .addFields({
            name: "📊 Total de Membros",
            value: member.guild.memberCount.toString(),
        })
            .setThumbnail(member.user.displayAvatarURL())
            .setTimestamp();
        await logChannel.send({ embeds: [embed] });
    }
    catch (error) {
        console.error("Error logging member leave:", error);
    }
}
async function logMemberBan(guild, user, reason) {
    const channelId = getModLogChannel(guild.id);
    if (!channelId || !isEventEnabled(guild.id, "memberBan"))
        return;
    try {
        const logChannel = guild.channels.cache.get(channelId);
        if (!logChannel)
            return;
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(discord_js_1.Colors.DarkRed)
            .setTitle("🔨 Membro Banido")
            .setDescription(`**Usuário:** ${user.tag}\n**ID:** ${user.id}`)
            .addFields({
            name: "📝 Motivo",
            value: reason || "*Nenhum motivo fornecido*",
        })
            .setThumbnail(user.displayAvatarURL())
            .setTimestamp();
        await logChannel.send({ embeds: [embed] });
    }
    catch (error) {
        console.error("Error logging member ban:", error);
    }
}
async function logWarn(guild, user, moderator, reason, warnCount) {
    const channelId = getModLogChannel(guild.id);
    if (!channelId || !isEventEnabled(guild.id, "warnAdd"))
        return;
    try {
        const logChannel = guild.channels.cache.get(channelId);
        if (!logChannel)
            return;
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(discord_js_1.Colors.Orange)
            .setTitle("⚠️ Aviso Aplicado")
            .setDescription(`**Usuário:** ${user.tag}\n**Moderador:** ${moderator.tag}`)
            .addFields({
            name: "📝 Motivo",
            value: reason,
        }, {
            name: "📊 Total de Avisos",
            value: warnCount.toString(),
        })
            .setThumbnail(user.displayAvatarURL())
            .setTimestamp();
        await logChannel.send({ embeds: [embed] });
    }
    catch (error) {
        console.error("Error logging warn:", error);
    }
}
async function logMute(guild, user, moderator, reason, duration) {
    const channelId = getModLogChannel(guild.id);
    if (!channelId || !isEventEnabled(guild.id, "muteAdd"))
        return;
    try {
        const logChannel = guild.channels.cache.get(channelId);
        if (!logChannel)
            return;
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(discord_js_1.Colors.DarkGrey)
            .setTitle("🔇 Membro Silenciado")
            .setDescription(`**Usuário:** ${user.tag}\n**Moderador:** ${moderator.tag}`)
            .addFields({
            name: "📝 Motivo",
            value: reason,
        }, {
            name: "⏱️ Duração",
            value: `${duration} minutos`,
        })
            .setThumbnail(user.displayAvatarURL())
            .setTimestamp();
        await logChannel.send({ embeds: [embed] });
    }
    catch (error) {
        console.error("Error logging mute:", error);
    }
}
//# sourceMappingURL=modLogs.js.map