"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGuildButtons = handleGuildButtons;
const discord_js_1 = require("discord.js");
const guildManager_1 = require("../../../utils/guildManager");
const i18n_1 = require("../../../utils/i18n");
async function handleGuildButtons(interaction) {
    const { customId, user } = interaction;
    if (customId.startsWith("guild_approve_")) {
        await handleApproveRequest(interaction, customId);
        return true;
    }
    if (customId.startsWith("guild_reject_")) {
        await handleRejectRequest(interaction, customId);
        return true;
    }
    if (customId === "guild_info") {
        await handleGuildInfo(interaction);
        return true;
    }
    if (customId === "guild_members") {
        await handleGuildMembers(interaction);
        return true;
    }
    if (customId === "guild_leave") {
        await handleGuildLeave(interaction);
        return true;
    }
    if (customId.startsWith("kick_member_")) {
        await handleKickMember(interaction, customId);
        return true;
    }
    if (customId.startsWith("promote_member_")) {
        await handlePromoteMember(interaction, customId);
        return true;
    }
    if (customId.startsWith("demote_member_")) {
        await handleDemoteMember(interaction, customId);
        return true;
    }
    return false;
}
async function handleApproveRequest(interaction, customId) {
    const requestId = customId.replace("guild_approve_", "");
    const request = (0, guildManager_1.getRequestById)(requestId);
    if (!request) {
        await interaction.reply({
            content: (0, i18n_1.tUser)(interaction.user.id, "guild_request_not_found"),
            flags: discord_js_1.MessageFlags.Ephemeral,
        });
        return;
    }
    const result = (0, guildManager_1.approveJoinRequest)(requestId);
    const embed = new discord_js_1.EmbedBuilder()
        .setColor(result.success ? "#57F287" : "#ED4245")
        .setTitle(result.success
        ? (0, i18n_1.tUser)(interaction.user.id, "guild_request_approved_title")
        : (0, i18n_1.tUser)(interaction.user.id, "guild_request_error"))
        .setDescription(result.message)
        .setTimestamp();
    await interaction.update({
        embeds: [embed],
        components: [],
    });
    if (result.success && result.guild) {
        try {
            const applicant = await interaction.client.users.fetch(request.userId);
            const notificationEmbed = new discord_js_1.EmbedBuilder()
                .setColor("#57F287")
                .setTitle((0, i18n_1.tUser)(applicant.id, "guild_request_accepted_title"))
                .setDescription((0, i18n_1.tUser)(applicant.id, "guild_request_accepted_desc").replace("{guild}", result.guild.name))
                .setTimestamp();
            await applicant.send({ embeds: [notificationEmbed] });
        }
        catch (error) {
            console.error("Failed to send DM to applicant:", error);
        }
    }
}
async function handleRejectRequest(interaction, customId) {
    const requestId = customId.replace("guild_reject_", "");
    const request = (0, guildManager_1.getRequestById)(requestId);
    if (!request) {
        await interaction.reply({
            content: (0, i18n_1.tUser)(interaction.user.id, "guild_request_not_found"),
            flags: discord_js_1.MessageFlags.Ephemeral,
        });
        return;
    }
    const result = (0, guildManager_1.rejectJoinRequest)(requestId);
    const embed = new discord_js_1.EmbedBuilder()
        .setColor(result.success ? "#FFA500" : "#ED4245")
        .setTitle(result.success
        ? (0, i18n_1.tUser)(interaction.user.id, "guild_request_rejected_title")
        : (0, i18n_1.tUser)(interaction.user.id, "guild_request_error"))
        .setDescription(result.message)
        .setTimestamp();
    await interaction.update({
        embeds: [embed],
        components: [],
    });
    if (result.success && result.userId && result.guildName) {
        try {
            const applicant = await interaction.client.users.fetch(result.userId);
            const notificationEmbed = new discord_js_1.EmbedBuilder()
                .setColor("#ED4245")
                .setTitle((0, i18n_1.tUser)(applicant.id, "guild_request_denied_title"))
                .setDescription((0, i18n_1.tUser)(applicant.id, "guild_request_denied_desc").replace("{guild}", result.guildName))
                .setTimestamp();
            await applicant.send({ embeds: [notificationEmbed] });
        }
        catch (error) {
            console.error("Failed to send DM to applicant:", error);
        }
    }
}
async function handleGuildInfo(interaction) {
    const userGuild = (0, guildManager_1.getUserGuild)(interaction.user.id);
    if (!userGuild) {
        await interaction.reply({
            content: (0, i18n_1.tUser)(interaction.user.id, "guild_not_found"),
            flags: discord_js_1.MessageFlags.Ephemeral,
        });
        return;
    }
    const embed = new discord_js_1.EmbedBuilder()
        .setColor("#5865F2")
        .setTitle(`🏰 ${userGuild.name}`)
        .setDescription(userGuild.description)
        .addFields({
        name: (0, i18n_1.tUser)(interaction.user.id, "guild_leader"),
        value: `<@${userGuild.leaderId}>`,
        inline: true,
    }, {
        name: (0, i18n_1.tUser)(interaction.user.id, "guild_members"),
        value: `${userGuild.members.length}/${userGuild.settings.maxMembers}`,
        inline: true,
    }, {
        name: (0, i18n_1.tUser)(interaction.user.id, "guild_level"),
        value: `${userGuild.level}`,
        inline: true,
    }, {
        name: (0, i18n_1.tUser)(interaction.user.id, "guild_xp"),
        value: `${userGuild.xp} XP`,
        inline: true,
    }, {
        name: (0, i18n_1.tUser)(interaction.user.id, "guild_type"),
        value: userGuild.settings.isPublic
            ? (0, i18n_1.tUser)(interaction.user.id, "guild_type_public")
            : (0, i18n_1.tUser)(interaction.user.id, "guild_type_private"),
        inline: true,
    }, {
        name: (0, i18n_1.tUser)(interaction.user.id, "guild_created"),
        value: `<t:${Math.floor(userGuild.createdAt / 1000)}:R>`,
        inline: true,
    })
        .setTimestamp();
    await interaction.reply({
        embeds: [embed],
        flags: discord_js_1.MessageFlags.Ephemeral,
    });
}
async function handleGuildMembers(interaction) {
    const userGuild = (0, guildManager_1.getUserGuild)(interaction.user.id);
    if (!userGuild) {
        await interaction.reply({
            content: (0, i18n_1.tUser)(interaction.user.id, "guild_not_found"),
            flags: discord_js_1.MessageFlags.Ephemeral,
        });
        return;
    }
    const membersList = userGuild.members
        .map((member, index) => {
        const roleIcon = member.role === "leader" ? "👑" : "👤";
        const joinedDate = `<t:${Math.floor(member.joinedAt / 1000)}:R>`;
        return `${index + 1}. ${roleIcon} <@${member.userId}> - ${(0, i18n_1.tUser)(interaction.user.id, "guild_joined")} ${joinedDate}`;
    })
        .join("\n");
    const embed = new discord_js_1.EmbedBuilder()
        .setColor("#FFD700")
        .setTitle((0, i18n_1.tUser)(interaction.user.id, "guild_members_title").replace("{guild}", userGuild.name))
        .setDescription(membersList || (0, i18n_1.tUser)(interaction.user.id, "guild_no_members"))
        .addFields({
        name: (0, i18n_1.tUser)(interaction.user.id, "guild_stats"),
        value: `**${(0, i18n_1.tUser)(interaction.user.id, "guild_total")}:** ${userGuild.members.length}/${userGuild.settings.maxMembers}`,
        inline: false,
    })
        .setFooter({
        text: `${userGuild.name} • ${(0, i18n_1.tUser)(interaction.user.id, "guild_level")} ${userGuild.level}`,
    })
        .setTimestamp();
    await interaction.reply({
        embeds: [embed],
        flags: discord_js_1.MessageFlags.Ephemeral,
    });
}
async function handleGuildLeave(interaction) {
    const userGuild = (0, guildManager_1.getUserGuild)(interaction.user.id);
    if (!userGuild) {
        await interaction.reply({
            content: (0, i18n_1.tUser)(interaction.user.id, "guild_not_found"),
            flags: discord_js_1.MessageFlags.Ephemeral,
        });
        return;
    }
    const result = (0, guildManager_1.leaveGuild)(interaction.user.id);
    const embed = new discord_js_1.EmbedBuilder()
        .setColor(result.success ? "#57F287" : "#ED4245")
        .setTitle(result.success
        ? (0, i18n_1.tUser)(interaction.user.id, "guild_left_title")
        : (0, i18n_1.tUser)(interaction.user.id, "guild_error"))
        .setDescription(result.message)
        .setTimestamp();
    await interaction.reply({
        embeds: [embed],
        flags: discord_js_1.MessageFlags.Ephemeral,
    });
}
async function handleKickMember(interaction, customId) {
    const memberId = customId.replace("kick_member_", "");
    const result = (0, guildManager_1.kickMember)(interaction.user.id, memberId);
    const embed = new discord_js_1.EmbedBuilder()
        .setColor(result.success ? "#57F287" : "#ED4245")
        .setTitle(result.success
        ? (0, i18n_1.tUser)(interaction.user.id, "guild_member_kicked_title")
        : (0, i18n_1.tUser)(interaction.user.id, "guild_error"))
        .setDescription(result.message)
        .setTimestamp();
    await interaction.update({
        embeds: [embed],
        components: [],
    });
}
async function handlePromoteMember(interaction, customId) {
    const memberId = customId.replace("promote_member_", "");
    const result = (0, guildManager_1.promoteMember)(interaction.user.id, memberId);
    const embed = new discord_js_1.EmbedBuilder()
        .setColor(result.success ? "#57F287" : "#ED4245")
        .setTitle(result.success
        ? (0, i18n_1.tUser)(interaction.user.id, "guild_member_promoted_title")
        : (0, i18n_1.tUser)(interaction.user.id, "guild_error"))
        .setDescription(result.message)
        .setTimestamp();
    await interaction.update({
        embeds: [embed],
        components: [],
    });
}
async function handleDemoteMember(interaction, customId) {
    const memberId = customId.replace("demote_member_", "");
    const result = (0, guildManager_1.demoteMember)(interaction.user.id, memberId);
    const embed = new discord_js_1.EmbedBuilder()
        .setColor(result.success ? "#57F287" : "#ED4245")
        .setTitle(result.success
        ? (0, i18n_1.tUser)(interaction.user.id, "guild_member_demoted_title")
        : (0, i18n_1.tUser)(interaction.user.id, "guild_error"))
        .setDescription(result.message)
        .setTimestamp();
    await interaction.update({
        embeds: [embed],
        components: [],
    });
}
//# sourceMappingURL=guildManagement.js.map