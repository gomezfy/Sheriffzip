"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const security_1 = require("../../utils/security");
const transactionLock_1 = require("../../utils/transactionLock");
const inventoryManager_1 = require("../../utils/inventoryManager");
exports.default = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("addseal")
        .setDescription("[OWNER ONLY] Add Seals to a user")
        .setDescriptionLocalizations({
        "pt-BR": "[SOMENTE OWNER] Adicionar Selos a um usuário",
    })
        .addUserOption((option) => option
        .setName("user")
        .setDescription("The user to give Seals to")
        .setDescriptionLocalizations({
        "pt-BR": "O usuário para dar Selos",
    })
        .setRequired(true))
        .addIntegerOption((option) => option
        .setName("amount")
        .setDescription("Amount of Seals to add")
        .setDescriptionLocalizations({
        "pt-BR": "Quantidade de Selos para adicionar",
    })
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
        const result = await transactionLock_1.transactionLock.withLock(targetUser.id, () => (0, inventoryManager_1.addItem)(targetUser.id, "seal", amount));
        if (!result.success) {
            await interaction.editReply({
                content: `❌ Failed to add seals: ${result.error}`,
            });
            return;
        }
        const sealEmoji = "🎟️";
        const embed = new discord_js_1.EmbedBuilder()
            .setColor("#8B4513")
            .setTitle("✅ Seals Added!")
            .setDescription(`Successfully added **${amount.toLocaleString()} ${sealEmoji}** to ${targetUser.tag}!`)
            .addFields({ name: "👤 User", value: `${targetUser}`, inline: true }, {
            name: "🎟️ Amount",
            value: `${amount.toLocaleString()} ${sealEmoji}`,
            inline: true,
        })
            .setFooter({ text: "Manual addition by bot owner" })
            .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
    },
};
//# sourceMappingURL=addseal.js.map