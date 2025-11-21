"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const transactionLock_1 = require("../../utils/transactionLock");
const inventoryManager_1 = require("../../utils/inventoryManager");
const security_1 = require("../../utils/security");
exports.default = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("removegold")
        .setDescription("[OWNER ONLY] Remove Saloon Tokens from a user")
        .addUserOption((option) => option
        .setName("user")
        .setDescription("The user to remove Saloon Tokens from")
        .setRequired(true))
        .addIntegerOption((option) => option
        .setName("amount")
        .setDescription("Amount of Saloon Tokens to remove")
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
        // Use transaction lock to prevent race conditions
        const result = await transactionLock_1.transactionLock.withLock(targetUser.id, () => (0, inventoryManager_1.removeItem)(targetUser.id, "saloon_token", amount));
        if (!result.success) {
            await interaction.editReply({
                content: `❌ Failed to remove tokens: ${result.error}`,
            });
            return;
        }
        const embed = new discord_js_1.EmbedBuilder()
            .setColor("#FF4500")
            .setTitle("✅ Saloon Tokens Removed!")
            .setDescription(`Successfully removed **${amount.toLocaleString()} 🎫** from ${targetUser.tag}!`)
            .addFields({ name: "👤 User", value: `${targetUser}`, inline: true }, {
            name: "💰 Amount Removed",
            value: `${amount.toLocaleString()} 🎫`,
            inline: true,
        })
            .setFooter({ text: "Manual removal by bot owner" })
            .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
    },
};
//# sourceMappingURL=removegold.js.map