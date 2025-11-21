"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TEAM_CAPTURE_COOLDOWN = exports.teamCaptureData = void 0;
const discord_js_1 = require("discord.js");
const commandLocalizations_1 = require("../../utils/commandLocalizations");
const embeds_1 = require("../../utils/embeds");
const i18n_1 = require("../../utils/i18n");
const dataManager_1 = require("../../utils/dataManager");
const teamCaptureManager_1 = require("../../utils/teamCaptureManager");
const customEmojis_1 = require("../../utils/customEmojis");
const TEAM_CAPTURE_COOLDOWN = 45 * 60 * 1000; // 45 minutes (longer than solo)
exports.TEAM_CAPTURE_COOLDOWN = TEAM_CAPTURE_COOLDOWN;
const teamCaptureData = {};
exports.teamCaptureData = teamCaptureData;
exports.default = {
    data: (0, commandLocalizations_1.applyLocalizations)(new discord_js_1.SlashCommandBuilder()
        .setName("team-capture")
        .setDescription("Form a team to capture a wanted outlaw and share the reward")
        .addUserOption((option) => option
        .setName("outlaw")
        .setDescription("The wanted outlaw to capture")
        .setRequired(true))
        .addIntegerOption((option) => option
        .setName("team-size")
        .setDescription("Maximum team size (2-5 members)")
        .setRequired(false)
        .setMinValue(2)
        .setMaxValue(5)), "team-capture"),
    async execute(interaction) {
        const leader = interaction.user;
        const target = interaction.options.getUser("outlaw", true);
        const maxTeamSize = interaction.options.getInteger("team-size") || 3;
        // Validation: Bot check
        if (target.bot) {
            const embed = (0, embeds_1.errorEmbed)((0, i18n_1.t)(interaction, "bounty_invalid_target"), (0, i18n_1.t)(interaction, "bounty_cant_target_bot"), (0, i18n_1.t)(interaction, "bounty_choose_real_outlaw"));
            await interaction.reply({
                embeds: [embed],
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
            return;
        }
        // Validation: Self-target check
        if (target.id === leader.id) {
            const embed = (0, embeds_1.warningEmbed)((0, i18n_1.t)(interaction, "bounty_self_not_allowed"), (0, i18n_1.t)(interaction, "bounty_cant_target_self"), (0, i18n_1.t)(interaction, "bounty_mighty_strange"));
            await interaction.reply({
                embeds: [embed],
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
            return;
        }
        // Validation: Server only
        if (!interaction.guild) {
            const embed = (0, embeds_1.errorEmbed)((0, i18n_1.t)(interaction, "bounty_server_only"), (0, i18n_1.t)(interaction, "bounty_command_server_only"), (0, i18n_1.t)(interaction, "bounty_try_in_server"));
            await interaction.reply({
                embeds: [embed],
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
            return;
        }
        // Validation: Target must be in server
        try {
            await interaction.guild.members.fetch(target.id);
        }
        catch (error) {
            const embed = (0, embeds_1.errorEmbed)((0, i18n_1.t)(interaction, "bounty_not_in_server"), (0, i18n_1.t)(interaction, "bounty_user_not_here", { user: target.tag }), (0, i18n_1.t)(interaction, "bounty_must_be_present"));
            await interaction.reply({
                embeds: [embed],
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
            return;
        }
        // Cooldown check
        const now = Date.now();
        const lastCapture = teamCaptureData[leader.id] || 0;
        if (now - lastCapture < TEAM_CAPTURE_COOLDOWN) {
            const timeLeft = TEAM_CAPTURE_COOLDOWN - (now - lastCapture);
            const minutesLeft = Math.ceil(timeLeft / 60000);
            const embed = (0, embeds_1.warningEmbed)("⏰ Team Cooldown Active", `You need to rest before organizing another team hunt!\n\n**Time remaining:** ${minutesLeft} minutes`, "Team hunts require more preparation than solo captures.");
            await interaction.reply({
                embeds: [embed],
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
            return;
        }
        // Check if bounty exists
        const bounty = (0, dataManager_1.getBountyByTarget)(target.id);
        if (!bounty) {
            const embed = (0, embeds_1.errorEmbed)((0, i18n_1.t)(interaction, "bounty_no_bounty_found"), (0, i18n_1.t)(interaction, "bounty_user_not_wanted", { user: target.tag }), (0, i18n_1.t)(interaction, "bounty_see_active"));
            await interaction.reply({
                embeds: [embed],
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
            return;
        }
        // Check if user is already in a team for this target
        if (teamCaptureManager_1.teamCaptureManager.isUserInTeamForTarget(leader.id, target.id)) {
            const embed = (0, embeds_1.warningEmbed)("🤝 Already in Team", "You're already part of a team hunting this outlaw!", "Wait for the current hunt to complete or leave the team first.");
            await interaction.reply({
                embeds: [embed],
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
            return;
        }
        await interaction.deferReply();
        // Create buttons for team recruitment - minimalist design
        const joinButton = new discord_js_1.ButtonBuilder()
            .setCustomId(`team_join_${target.id}`)
            .setLabel("Join")
            .setStyle(discord_js_1.ButtonStyle.Success);
        const leaveButton = new discord_js_1.ButtonBuilder()
            .setCustomId(`team_leave_${target.id}`)
            .setLabel("Leave")
            .setStyle(discord_js_1.ButtonStyle.Secondary);
        const startButton = new discord_js_1.ButtonBuilder()
            .setCustomId(`team_start_${target.id}`)
            .setLabel("Start")
            .setStyle(discord_js_1.ButtonStyle.Primary);
        const cancelButton = new discord_js_1.ButtonBuilder()
            .setCustomId(`team_cancel_${target.id}`)
            .setLabel("Cancel")
            .setStyle(discord_js_1.ButtonStyle.Danger);
        const row = new discord_js_1.ActionRowBuilder().addComponents(joinButton, leaveButton, startButton, cancelButton);
        // Calculate reward per member
        const rewardPerMember = Math.floor(bounty.totalAmount / maxTeamSize);
        // Create team recruitment embed
        const recruitEmbed = new discord_js_1.EmbedBuilder()
            .setColor("#FFA500")
            .setTitle(`${(0, customEmojis_1.getCowboyEmoji)()} TEAM HUNT - Recruiting Members!`)
            .setDescription(`**${leader.tag}** is forming a hunting party to capture **${target.tag}**!\n\n` +
            `Join forces to increase your chances of success!\n` +
            `The bounty will be split equally among all team members.`)
            .addFields({
            name: `${(0, customEmojis_1.getDartEmoji)()} Target`,
            value: target.tag,
            inline: true,
        }, {
            name: `${(0, customEmojis_1.getMoneybagEmoji)()} Total Bounty`,
            value: (0, embeds_1.formatCurrency)(bounty.totalAmount, "silver"),
            inline: true,
        }, {
            name: `${(0, customEmojis_1.getCowboysEmoji)()} Team Size`,
            value: `1/${maxTeamSize}`,
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
            value: "+10% per member",
            inline: true,
        }, {
            name: `${(0, customEmojis_1.getCowboyEmoji)()} Team Leader`,
            value: leader.tag,
            inline: false,
        }, {
            name: `${(0, customEmojis_1.getCowboysEmoji)()} Current Members`,
            value: `1. ${leader.tag} (Leader)`,
            inline: false,
        })
            .setFooter({
            text: "Click 'Join Team' to participate! Minimum 2 members required.",
        })
            .setTimestamp();
        const message = await interaction.editReply({
            embeds: [recruitEmbed],
            components: [row],
        });
        // Create team in manager
        teamCaptureManager_1.teamCaptureManager.createTeam(leader, target, bounty.totalAmount, interaction.guild.id, interaction.channel.id, message.id, maxTeamSize);
        // Record cooldown timestamp
        teamCaptureData[leader.id] = Date.now();
    },
};
//# sourceMappingURL=teamcapture.js.map