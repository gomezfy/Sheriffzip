"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const rexBuckManager_1 = require("../../utils/rexBuckManager");
const customEmojis_1 = require("../../utils/customEmojis");
const commandLocalizations_1 = require("../../utils/commandLocalizations");
const commandBuilder = new discord_js_1.SlashCommandBuilder()
    .setName("rexbucks")
    .setDescription("💵 Check your RexBucks balance and transaction history")
    .setContexts([0, 1, 2])
    .setIntegrationTypes([0, 1])
    .addSubcommand((subcommand) => subcommand
    .setName("balance")
    .setDescription("Check your RexBucks balance"))
    .addSubcommand((subcommand) => subcommand
    .setName("history")
    .setDescription("View your RexBucks transaction history")
    .addIntegerOption((option) => option
    .setName("limit")
    .setDescription("Number of recent transactions to show (1-20)")
    .setMinValue(1)
    .setMaxValue(20)
    .setRequired(false)));
exports.default = {
    data: (0, commandLocalizations_1.applyLocalizations)(commandBuilder, "rexbucks"),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.user.id;
        await interaction.deferReply({ ephemeral: true });
        try {
            if (subcommand === "balance") {
                const userData = await (0, rexBuckManager_1.getUserRexBuckData)(userId);
                const embed = new discord_js_1.EmbedBuilder()
                    .setColor(0x2ecc71)
                    .setTitle(`${(0, customEmojis_1.getRexBuckEmoji)()} RexBucks Balance`)
                    .setDescription(`**Current Balance:** ${(0, customEmojis_1.getRexBuckEmoji)()} **${userData.balance.toLocaleString()}** RexBucks`)
                    .addFields({
                    name: "📊 Statistics",
                    value: [
                        `**Total Transactions:** ${userData.totalTransactions}`,
                    ].join("\n"),
                    inline: false,
                }, {
                    name: `${(0, customEmojis_1.getInfoEmoji)()} About RexBucks`,
                    value: [
                        "💵 **RexBucks** is a premium currency",
                        "🎫 Purchase RexBucks with real money",
                        "🛒 Use them in the bot shop and features",
                        "⚠️ **Non-refundable and non-transferable**",
                    ].join("\n"),
                    inline: false,
                })
                    .setFooter({
                    text: "Use /rexbucks history to view transaction history",
                })
                    .setTimestamp();
                await interaction.editReply({ embeds: [embed] });
            }
            else if (subcommand === "history") {
                const limit = interaction.options.getInteger("limit") || 10;
                const transactions = await (0, rexBuckManager_1.getUserTransactionHistory)(userId, limit);
                if (transactions.length === 0) {
                    const embed = new discord_js_1.EmbedBuilder()
                        .setColor(0xf39c12)
                        .setTitle(`${(0, customEmojis_1.getInfoEmoji)()} No Transaction History`)
                        .setDescription("You haven't made any RexBucks transactions yet.")
                        .setFooter({
                        text: "Purchase RexBucks to get started!",
                    })
                        .setTimestamp();
                    await interaction.editReply({ embeds: [embed] });
                    return;
                }
                const transactionList = transactions
                    .map((tx, index) => {
                    const typeEmoji = tx.amount > 0 ? "+" : "-";
                    const typeLabel = tx.type === "redeem"
                        ? "Redeemed"
                        : tx.type === "purchase"
                            ? "Purchased"
                            : tx.type === "admin_add"
                                ? "Added by Admin"
                                : "Removed by Admin";
                    const date = new Date(tx.timestamp).toLocaleString();
                    return [
                        `**${index + 1}.** ${typeLabel}`,
                        `   ${typeEmoji}${Math.abs(tx.amount).toLocaleString()} RexBucks`,
                        `   Balance: ${tx.balanceBefore.toLocaleString()} → ${tx.balanceAfter.toLocaleString()}`,
                        `   ${date}`,
                    ].join("\n");
                })
                    .join("\n\n");
                const embed = new discord_js_1.EmbedBuilder()
                    .setColor(0x3498db)
                    .setTitle(`${(0, customEmojis_1.getRexBuckEmoji)()} RexBucks Transaction History`)
                    .setDescription(transactionList)
                    .setFooter({
                    text: `Showing last ${transactions.length} transaction(s)`,
                })
                    .setTimestamp();
                await interaction.editReply({ embeds: [embed] });
            }
        }
        catch (error) {
            console.error("Error in rexbucks command:", error);
            const embed = new discord_js_1.EmbedBuilder()
                .setColor(0xe74c3c)
                .setTitle("❌ Error")
                .setDescription("An error occurred while fetching your RexBucks data.")
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        }
    },
};
//# sourceMappingURL=rexbucks.js.map