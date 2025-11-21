"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleTeamCaptureButton = handleTeamCaptureButton;
const discord_js_1 = require("discord.js");
const teamCaptureManager_1 = require("../utils/teamCaptureManager");
const dataManager_1 = require("../utils/dataManager");
const inventoryManager_1 = require("../utils/inventoryManager");
const embeds_1 = require("../utils/embeds");
const customEmojis_1 = require("../utils/customEmojis");
// Import cooldown data from team-capture command
let teamCaptureData;
try {
    const teamCaptureModule = require("../commands/bounty/teamcapture");
    teamCaptureData = teamCaptureModule.teamCaptureData || {};
}
catch (error) {
    teamCaptureData = {};
}
async function handleTeamCaptureButton(interaction) {
    const [action, type, targetId] = interaction.customId.split("_");
    if (action !== "team")
        return;
    const teamData = teamCaptureManager_1.teamCaptureManager.getTeamByMessage(interaction.message.id);
    if (!teamData) {
        await interaction.reply({
            content: "❌ This team hunt has expired or doesn't exist anymore.",
            ephemeral: true,
        });
        return;
    }
    const { teamId, team } = teamData;
    switch (type) {
        case "join":
            await handleJoinTeam(interaction, teamId, team);
            break;
        case "leave":
            await handleLeaveTeam(interaction, teamId, team);
            break;
        case "start":
            await handleStartHunt(interaction, teamId, team);
            break;
        case "cancel":
            await handleCancelHunt(interaction, teamId, team);
            break;
    }
}
async function handleJoinTeam(interaction, teamId, team) {
    const result = teamCaptureManager_1.teamCaptureManager.addMember(teamId, interaction.user);
    if (!result.success) {
        await interaction.reply({
            content: `${(0, customEmojis_1.getCancelEmoji)()} ${result.error}`,
            ephemeral: true,
        });
        return;
    }
    // Update the embed
    await updateTeamEmbed(interaction, teamId, team);
    await interaction.reply({
        content: `${(0, customEmojis_1.getCheckEmoji)()} You've joined the hunting party! Good luck, partner!`,
        ephemeral: true,
    });
}
async function handleLeaveTeam(interaction, teamId, team) {
    if (!team.members.some((m) => m.id === interaction.user.id)) {
        await interaction.reply({
            content: `${(0, customEmojis_1.getCancelEmoji)()} You're not in this team!`,
            ephemeral: true,
        });
        return;
    }
    if (team.leaderId === interaction.user.id) {
        // Leader is leaving, cancel the hunt
        await handleCancelHunt(interaction, teamId, team);
        return;
    }
    teamCaptureManager_1.teamCaptureManager.removeMember(teamId, interaction.user.id);
    await updateTeamEmbed(interaction, teamId, team);
    await interaction.reply({
        content: "You've left the team.",
        ephemeral: true,
    });
}
async function handleStartHunt(interaction, teamId, team) {
    // Only leader can start
    if (team.leaderId !== interaction.user.id) {
        await interaction.reply({
            content: `${(0, customEmojis_1.getCancelEmoji)()} Only the team leader can start the hunt!`,
            ephemeral: true,
        });
        return;
    }
    if (team.members.length < 2) {
        await interaction.reply({
            content: `${(0, customEmojis_1.getCancelEmoji)()} You need at least 2 members to start a team hunt!`,
            ephemeral: true,
        });
        return;
    }
    if (team.status !== "ready" && team.status !== "recruiting") {
        await interaction.reply({
            content: `${(0, customEmojis_1.getCancelEmoji)()} This hunt is no longer active!`,
            ephemeral: true,
        });
        return;
    }
    await interaction.deferUpdate();
    // Check if bounty still exists
    const bounty = (0, dataManager_1.getBountyByTarget)(team.targetId);
    if (!bounty) {
        const embed = (0, embeds_1.errorEmbed)(`${(0, customEmojis_1.getCancelEmoji)()} Bounty No Longer Active`, `The bounty on **${team.targetTag}** has been removed or claimed!`, "Better luck next time, partner.");
        await interaction.editReply({
            embeds: [embed],
            components: [],
        });
        teamCaptureManager_1.teamCaptureManager.completeTeam(teamId);
        return;
    }
    // Calculate success rate based on team size
    const baseSuccessRate = 0.5;
    const teamBonus = (team.members.length - 1) * 0.1; // +10% per additional member
    const successRate = Math.min(0.9, baseSuccessRate + teamBonus);
    const captureChance = Math.random();
    if (captureChance > successRate) {
        // Hunt failed
        const embed = new discord_js_1.EmbedBuilder()
            .setColor("#FF6B6B")
            .setTitle(`${(0, customEmojis_1.getDustEmoji)()} ${(0, customEmojis_1.getRunningCowboyEmoji)()} The Outlaw Escaped!`)
            .setDescription(`Despite your team's best efforts, **${team.targetTag}** managed to slip away!\n\n` +
            `The outlaw outsmarted your hunting party this time.`)
            .addFields({
            name: `${(0, customEmojis_1.getDartEmoji)()} Target`,
            value: team.targetTag,
            inline: true,
        }, {
            name: `${(0, customEmojis_1.getMoneybagEmoji)()} Lost Reward`,
            value: (0, embeds_1.formatCurrency)(bounty.totalAmount, "silver"),
            inline: true,
        }, {
            name: `${(0, customEmojis_1.getCowboysEmoji)()} Team Size`,
            value: `${team.members.length} hunters`,
            inline: true,
        }, {
            name: `${(0, customEmojis_1.getStatsEmoji)()} Success Rate`,
            value: `${(successRate * 100).toFixed(0)}%`,
            inline: true,
        }, {
            name: "🎲 Roll Result",
            value: `${(captureChance * 100).toFixed(1)}% (needed ≤${(successRate * 100).toFixed(0)}%)`,
            inline: true,
        }, {
            name: `${(0, customEmojis_1.getCowboysEmoji)()} Team Members`,
            value: team.members.map((m, i) => `${i + 1}. ${m.tag}${i === 0 ? " (Leader)" : ""}`).join("\n"),
            inline: false,
        })
            .setFooter({ text: "Try again with a larger team for better odds!" })
            .setTimestamp();
        await interaction.editReply({
            embeds: [embed],
            components: [],
        });
        teamCaptureManager_1.teamCaptureManager.completeTeam(teamId);
        return;
    }
    // Hunt successful! Distribute rewards
    const rewardSplit = teamCaptureManager_1.teamCaptureManager.calculateRewardSplit(teamId);
    if (!rewardSplit) {
        await interaction.editReply({
            content: `${(0, customEmojis_1.getCancelEmoji)()} Error calculating rewards!`,
            components: [],
        });
        return;
    }
    const rewardResults = [];
    for (const member of team.members) {
        const reward = rewardSplit.get(member.id) || 0;
        const result = await (0, inventoryManager_1.addItem)(member.id, "silver", reward);
        rewardResults.push({
            tag: member.tag,
            amount: reward,
            success: result.success,
        });
    }
    // Remove bounty
    (0, dataManager_1.removeBounty)(team.targetId);
    // Create success embed
    const embed = new discord_js_1.EmbedBuilder()
        .setColor("#51CF66")
        .setTitle(`${(0, customEmojis_1.getPartyEmoji)()} ${(0, customEmojis_1.getTrophyEmoji)()} OUTLAW CAPTURED - Team Victory!`)
        .setDescription(`**Excellent teamwork!** Your hunting party successfully captured **${team.targetTag}**!\n\n` +
        `The bounty has been split among all team members.`)
        .addFields({
        name: `${(0, customEmojis_1.getDartEmoji)()} Captured Outlaw`,
        value: team.targetTag,
        inline: true,
    }, {
        name: `${(0, customEmojis_1.getMoneybagEmoji)()} Total Bounty`,
        value: (0, embeds_1.formatCurrency)(bounty.totalAmount, "silver"),
        inline: true,
    }, {
        name: `${(0, customEmojis_1.getCowboysEmoji)()} Team Size`,
        value: `${team.members.length} hunters`,
        inline: true,
    }, {
        name: `${(0, customEmojis_1.getStatsEmoji)()} Success Rate`,
        value: `${(successRate * 100).toFixed(0)}%`,
        inline: true,
    }, {
        name: "🎲 Roll Result",
        value: `${(captureChance * 100).toFixed(1)}% (needed ≤${(successRate * 100).toFixed(0)}%)`,
        inline: true,
    }, {
        name: `${(0, customEmojis_1.getBalanceEmoji)()} Justice Served`,
        value: `${(0, customEmojis_1.getCheckEmoji)()} Captured`,
        inline: true,
    }, {
        name: `${(0, customEmojis_1.getMoneybagEmoji)()} Reward Distribution`,
        value: rewardResults
            .map((r) => `${r.success ? (0, customEmojis_1.getCheckEmoji)() : (0, customEmojis_1.getCancelEmoji)()} ${r.tag}: ${(0, embeds_1.formatCurrency)(r.amount, "silver")}`)
            .join("\n"),
        inline: false,
    })
        .setFooter({ text: `Teamwork makes the dream work! ${(0, customEmojis_1.getCowboysEmoji)()}` })
        .setTimestamp();
    await interaction.editReply({
        embeds: [embed],
        components: [],
    });
    // Update cooldown for all team members
    const now = Date.now();
    for (const member of team.members) {
        teamCaptureData[member.id] = now;
    }
    teamCaptureManager_1.teamCaptureManager.completeTeam(teamId);
}
async function handleCancelHunt(interaction, teamId, team) {
    if (team.leaderId !== interaction.user.id) {
        await interaction.reply({
            content: `${(0, customEmojis_1.getCancelEmoji)()} Only the team leader can cancel the hunt!`,
            ephemeral: true,
        });
        return;
    }
    await interaction.deferUpdate();
    const embed = new discord_js_1.EmbedBuilder()
        .setColor("#868E96")
        .setTitle(`${(0, customEmojis_1.getCancelEmoji)()} Team Hunt Cancelled`)
        .setDescription(`The team leader **${team.leaderTag}** has cancelled this hunting party.`)
        .addFields({
        name: `${(0, customEmojis_1.getDartEmoji)()} Target`,
        value: team.targetTag,
        inline: true,
    }, {
        name: `${(0, customEmojis_1.getCowboysEmoji)()} Team Members`,
        value: `${team.members.length}/${team.maxMembers}`,
        inline: true,
    })
        .setTimestamp();
    await interaction.editReply({
        embeds: [embed],
        components: [],
    });
    teamCaptureManager_1.teamCaptureManager.completeTeam(teamId);
}
async function updateTeamEmbed(interaction, teamId, team) {
    const updatedTeam = teamCaptureManager_1.teamCaptureManager.getTeam(teamId);
    if (!updatedTeam)
        return;
    const bounty = (0, dataManager_1.getBountyByTarget)(updatedTeam.targetId);
    if (!bounty)
        return;
    const rewardPerMember = Math.floor(updatedTeam.bountyAmount / updatedTeam.maxMembers);
    const membersList = updatedTeam.members
        .map((m, i) => `${i + 1}. ${m.tag}${i === 0 ? " (Leader)" : ""}`)
        .join("\n");
    const embed = new discord_js_1.EmbedBuilder()
        .setColor(updatedTeam.status === "ready" ? "#51CF66" : "#FFA500")
        .setTitle(`${(0, customEmojis_1.getCowboyEmoji)()} TEAM HUNT - Recruiting Members!`)
        .setDescription(`**${updatedTeam.leaderTag}** is forming a hunting party to capture **${updatedTeam.targetTag}**!\n\n` +
        `Join forces to increase your chances of success!\n` +
        `The bounty will be split equally among all team members.`)
        .addFields({
        name: `${(0, customEmojis_1.getDartEmoji)()} Target`,
        value: updatedTeam.targetTag,
        inline: true,
    }, {
        name: `${(0, customEmojis_1.getMoneybagEmoji)()} Total Bounty`,
        value: (0, embeds_1.formatCurrency)(updatedTeam.bountyAmount, "silver"),
        inline: true,
    }, {
        name: `${(0, customEmojis_1.getCowboysEmoji)()} Team Size`,
        value: `${updatedTeam.members.length}/${updatedTeam.maxMembers}`,
        inline: true,
    }, {
        name: `💵 Reward Per Member`,
        value: `~${(0, embeds_1.formatCurrency)(rewardPerMember, "silver")}`,
        inline: true,
    }, {
        name: `${(0, customEmojis_1.getTimerEmoji)()} Time Limit`,
        value: "5 minutes",
        inline: true,
    }, {
        name: `${(0, customEmojis_1.getStatsEmoji)()} Success Rate Bonus`,
        value: `${50 + (updatedTeam.members.length - 1) * 10}%`,
        inline: true,
    }, {
        name: `${(0, customEmojis_1.getCowboyEmoji)()} Team Leader`,
        value: updatedTeam.leaderTag,
        inline: false,
    }, {
        name: `${(0, customEmojis_1.getCowboysEmoji)()} Current Members`,
        value: membersList,
        inline: false,
    })
        .setFooter({
        text: updatedTeam.status === "ready"
            ? "Team is ready! Leader can start the hunt."
            : "Click 'Join Team' to participate! Minimum 2 members required.",
    })
        .setTimestamp();
    await interaction.message.edit({ embeds: [embed] });
}
//# sourceMappingURL=teamCaptureButtons.js.map