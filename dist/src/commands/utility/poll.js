"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const i18n_1 = require("../../utils/i18n");
const commandLocalizations_1 = require("../../utils/commandLocalizations");
exports.default = {
    data: (0, commandLocalizations_1.applyLocalizations)(new discord_js_1.SlashCommandBuilder()
        .setName("poll")
        .setDescription("Poll system for the saloon")
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.ManageMessages)
        .addSubcommand((subcommand) => subcommand
        .setName("create")
        .setDescription("Create a custom poll with multiple options")
        .addStringOption((option) => option
        .setName("question")
        .setDescription("The question for the poll")
        .setRequired(true)
        .setMaxLength(300))
        .addStringOption((option) => option
        .setName("option1")
        .setDescription("First option")
        .setRequired(true)
        .setMaxLength(55))
        .addStringOption((option) => option
        .setName("option2")
        .setDescription("Second option")
        .setRequired(true)
        .setMaxLength(55))
        .addStringOption((option) => option
        .setName("option3")
        .setDescription("Third option (optional)")
        .setRequired(false)
        .setMaxLength(55))
        .addStringOption((option) => option
        .setName("option4")
        .setDescription("Fourth option (optional)")
        .setRequired(false)
        .setMaxLength(55))
        .addStringOption((option) => option
        .setName("option5")
        .setDescription("Fifth option (optional)")
        .setRequired(false)
        .setMaxLength(55))
        .addIntegerOption((option) => option
        .setName("duration")
        .setDescription("Poll duration in hours (1-168)")
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(168))
        .addBooleanOption((option) => option
        .setName("multiple")
        .setDescription("Allow multiple selections?")
        .setRequired(false)))
        .addSubcommand((subcommand) => subcommand
        .setName("quick")
        .setDescription("Create a quick Yes/No/Maybe poll")
        .addStringOption((option) => option
        .setName("question")
        .setDescription("The question for the poll")
        .setRequired(true)
        .setMaxLength(300))
        .addIntegerOption((option) => option
        .setName("duration")
        .setDescription("Poll duration in hours (1-168)")
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(168))), "poll"),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        if (subcommand === "create") {
            await executeCreatePoll(interaction);
        }
        else if (subcommand === "quick") {
            await executeQuickPoll(interaction);
        }
    },
};
async function executeCreatePoll(interaction) {
    const question = interaction.options.getString("question", true);
    const option1 = interaction.options.getString("option1", true);
    const option2 = interaction.options.getString("option2", true);
    const option3 = interaction.options.getString("option3");
    const option4 = interaction.options.getString("option4");
    const option5 = interaction.options.getString("option5");
    const duration = interaction.options.getInteger("duration") || 24;
    const allowMultiple = interaction.options.getBoolean("multiple") || false;
    const answers = [];
    const options = [option1, option2, option3, option4, option5].filter((opt) => opt !== null);
    options.forEach((option) => {
        if (option) {
            answers.push({
                text: option,
            });
        }
    });
    const locale = (0, i18n_1.getLocale)(interaction);
    const hourText = duration === 1 ? (0, i18n_1.t)(interaction, "poll_hour") : (0, i18n_1.t)(interaction, "poll_hours");
    try {
        const pollData = {
            question: { text: question },
            answers: answers,
            duration: duration,
            allowMultiselect: allowMultiple,
        };
        const introEmbed = new discord_js_1.EmbedBuilder()
            .setColor(0x5865f2)
            .setTitle(`📊 ${(0, i18n_1.t)(interaction, "poll_title_create")}`)
            .setDescription(`**${interaction.user.displayName}** ${(0, i18n_1.t)(interaction, "poll_created_by")}\n\n` +
            `📊 **${(0, i18n_1.t)(interaction, "poll_question_label")}:** ${question}\n` +
            `⏱️ **${(0, i18n_1.t)(interaction, "poll_duration_label")}:** ${duration} ${hourText}\n` +
            `🗳️ **${(0, i18n_1.t)(interaction, "poll_multiple_choice_label")}:** ${allowMultiple ? (0, i18n_1.t)(interaction, "poll_yes_option") : (0, i18n_1.t)(interaction, "poll_no_option")}\n\n` +
            `*${(0, i18n_1.t)(interaction, "poll_vote_now")}*`)
            .setFooter({ text: (0, i18n_1.t)(interaction, "poll_system_footer") })
            .setTimestamp();
        await interaction.reply({
            embeds: [introEmbed],
            poll: pollData,
        });
        console.log(`✅ Poll created by ${interaction.user.tag}: "${question}"`);
    }
    catch (error) {
        console.error("Error creating poll:", error);
        await interaction.reply({
            content: (0, i18n_1.t)(interaction, "error"),
            flags: discord_js_1.MessageFlags.Ephemeral,
        });
    }
}
async function executeQuickPoll(interaction) {
    const question = interaction.options.getString("question", true);
    const duration = interaction.options.getInteger("duration") || 1;
    const locale = (0, i18n_1.getLocale)(interaction);
    const hourText = duration === 1 ? (0, i18n_1.t)(interaction, "poll_hour") : (0, i18n_1.t)(interaction, "poll_hours");
    try {
        const pollData = {
            question: { text: question },
            answers: [
                { text: (0, i18n_1.t)(interaction, "poll_yes_option") },
                { text: (0, i18n_1.t)(interaction, "poll_no_option") },
                { text: (0, i18n_1.t)(interaction, "poll_maybe_option") },
            ],
            duration: duration,
            allowMultiselect: false,
        };
        const introEmbed = new discord_js_1.EmbedBuilder()
            .setColor(0x5865f2)
            .setTitle(`⚡ ${(0, i18n_1.t)(interaction, "poll_title_quick")}`)
            .setDescription(`**${interaction.user.displayName}** ${(0, i18n_1.t)(interaction, "poll_wants_opinion")}\n\n` +
            `📊 **${(0, i18n_1.t)(interaction, "poll_question_label")}:** ${question}\n` +
            `⏱️ **${(0, i18n_1.t)(interaction, "poll_duration_label")}:** ${duration} ${hourText}\n\n` +
            `*${(0, i18n_1.t)(interaction, "poll_vote_now")}*`)
            .setFooter({ text: (0, i18n_1.t)(interaction, "poll_quick_footer") })
            .setTimestamp();
        await interaction.reply({
            embeds: [introEmbed],
            poll: pollData,
        });
        console.log(`✅ Quick poll created by ${interaction.user.tag}: "${question}"`);
    }
    catch (error) {
        console.error("Error creating quick poll:", error);
        await interaction.reply({
            content: (0, i18n_1.t)(interaction, "error"),
            flags: discord_js_1.MessageFlags.Ephemeral,
        });
    }
}
//# sourceMappingURL=poll.js.map