"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const customEmojis_1 = require("../../utils/customEmojis");
const security_1 = require("../../utils/security");
const inventoryManager_1 = require("../../utils/inventoryManager");
exports.default = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("addgold")
        .setDescription("[OWNER ONLY] Add Gold Bars to a user")
        .addUserOption((option) => option
        .setName("user")
        .setDescription("The user to give Gold Bars to")
        .setRequired(true))
        .addIntegerOption((option) => option
        .setName("amount")
        .setDescription("Amount of Gold Bars to add")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(security_1.MAX_CURRENCY_AMOUNT))
        .setDefaultMemberPermissions(0),
    async execute(interaction) {
        await interaction.deferReply({ flags: discord_js_1.MessageFlags.Ephemeral });
        // Security: Validate owner
        if (!(await (0, security_1.isOwner)(interaction))) {
            return;
        }
        // Security: Rate limit admin commands
        if (!security_1.adminRateLimiter.canExecute(interaction.user.id)) {
            const remaining = security_1.adminRateLimiter.getRemainingCooldown(interaction.user.id);
            await interaction.editReply({
                content: `⏰ Please wait ${(remaining / 1000).toFixed(1)}s before using another admin command.`,
            });
            return;
        }
        const targetUser = interaction.options.getUser("user", true);
        const amount = interaction.options.getInteger("amount", true);
        // Security: Validate amount
        if (!(0, security_1.isValidCurrencyAmount)(amount)) {
            await interaction.editReply({
                content: `❌ Invalid amount! Must be between 1 and ${security_1.MAX_CURRENCY_AMOUNT.toLocaleString()}.`,
            });
            return;
        }
        // addItem already uses transaction lock internally
        const result = await (0, inventoryManager_1.addItem)(targetUser.id, "gold", amount);
        if (!result.success) {
            await interaction.editReply({
                content: `❌ Failed to add gold bars: ${result.error}`,
            });
            return;
        }
        const goldEmoji = (0, customEmojis_1.getGoldBarEmoji)();
        const embed = new discord_js_1.EmbedBuilder()
            .setColor("#FFD700")
            .setTitle("✅ Gold Bars Added!")
            .setDescription(`Successfully added **${amount.toLocaleString()} ${goldEmoji}** to ${targetUser.tag}!`)
            .addFields({ name: "👤 User", value: `${targetUser}`, inline: true }, {
            name: "💰 Amount",
            value: `${amount.toLocaleString()} ${goldEmoji}`,
            inline: true,
        })
            .setFooter({ text: "Manual addition by bot owner" })
            .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
    },
};
//# sourceMappingURL=addgold.js.map