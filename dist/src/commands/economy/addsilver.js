"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const customEmojis_1 = require("../../utils/customEmojis");
const security_1 = require("../../utils/security");
const inventoryManager_1 = require("../../utils/inventoryManager");
const HIGH_VALUE_THRESHOLD = 10000;
exports.default = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("addsilver")
        .setDescription("[OWNER ONLY] Add Silver Coins to a user")
        .addUserOption((option) => option
        .setName("user")
        .setDescription("The user to give Silver Coins to")
        .setRequired(true))
        .addIntegerOption((option) => option
        .setName("amount")
        .setDescription("Amount of Silver Coins to add")
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
        // High value confirmation
        if (amount >= HIGH_VALUE_THRESHOLD) {
            const confirmEmbed = new discord_js_1.EmbedBuilder()
                .setColor("#FFA500")
                .setTitle("⚠️ High Value Transaction")
                .setDescription(`You are about to add **${amount.toLocaleString()}** silver coins to ${targetUser.tag}.\n\nThis is a large amount. Please confirm this action.`)
                .addFields({ name: "👤 Target User", value: targetUser.tag, inline: true }, {
                name: "💰 Amount",
                value: `${amount.toLocaleString()} silver`,
                inline: true,
            });
            const confirmRow = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
                .setCustomId("confirm_add")
                .setLabel("✅ Confirm")
                .setStyle(discord_js_1.ButtonStyle.Success), new discord_js_1.ButtonBuilder()
                .setCustomId("cancel_add")
                .setLabel("❌ Cancel")
                .setStyle(discord_js_1.ButtonStyle.Danger));
            const reply = await interaction.editReply({
                embeds: [confirmEmbed],
                components: [confirmRow],
            });
            try {
                const confirmation = await reply.awaitMessageComponent({
                    filter: (i) => i.user.id === interaction.user.id,
                    componentType: discord_js_1.ComponentType.Button,
                    time: 30000,
                });
                if (confirmation.customId === "cancel_add") {
                    await confirmation.update({
                        content: "❌ Transaction cancelled.",
                        embeds: [],
                        components: [],
                    });
                    return;
                }
                await confirmation.deferUpdate();
            }
            catch (error) {
                await interaction.editReply({
                    content: "⏱️ Confirmation timeout. Transaction cancelled.",
                    embeds: [],
                    components: [],
                });
                return;
            }
        }
        // addItem already uses transaction lock internally
        const result = await (0, inventoryManager_1.addItem)(targetUser.id, "silver", amount);
        // Log the transaction
        security_1.securityLogger.logTransaction(interaction.user.id, "silver", amount, "admin_add", targetUser.id);
        if (!result.success) {
            await interaction.editReply({
                content: `❌ Failed to add coins: ${result.error}`,
            });
            return;
        }
        const silverEmoji = (0, customEmojis_1.getSilverCoinEmoji)();
        const embed = new discord_js_1.EmbedBuilder()
            .setColor("#C0C0C0")
            .setTitle("✅ Silver Coins Added!")
            .setDescription(`Successfully added **${amount.toLocaleString()} ${silverEmoji}** to ${targetUser.tag}!`)
            .addFields({ name: "👤 User", value: `${targetUser}`, inline: true }, {
            name: "💰 Amount",
            value: `${amount.toLocaleString()} ${silverEmoji}`,
            inline: true,
        })
            .setFooter({ text: "Manual addition by bot owner" })
            .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
    },
};
//# sourceMappingURL=addsilver.js.map