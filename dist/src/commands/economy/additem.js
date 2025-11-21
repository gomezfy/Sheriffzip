"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const security_1 = require("../../utils/security");
const inventoryManager_1 = require("../../utils/inventoryManager");
const emojiUploader_1 = require("../../utils/emojiUploader");
// Items that have dedicated commands and should not be added via /additem
const EXCLUDED_ITEMS = ["gold", "silver", "saloon_token"];
// Filter items for the command choices
const AVAILABLE_ITEMS = Object.keys(inventoryManager_1.ITEMS).filter((itemId) => !EXCLUDED_ITEMS.includes(itemId));
exports.default = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("additem")
        .setDescription("[OWNER ONLY] Add special items to a user's inventory")
        .addUserOption((option) => option
        .setName("user")
        .setDescription("The user to give the item to")
        .setRequired(true))
        .addStringOption((option) => option
        .setName("item")
        .setDescription("The item to add")
        .setRequired(true)
        .setAutocomplete(true))
        .addIntegerOption((option) => option
        .setName("amount")
        .setDescription("Amount of items to add")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100000000))
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
        const itemId = interaction.options.getString("item", true);
        const amount = interaction.options.getInteger("amount", true);
        // Security: Validate amount
        if (!(0, security_1.isValidCurrencyAmount)(amount)) {
            await interaction.editReply({
                content: `❌ Invalid amount! Must be between 1 and ${security_1.MAX_CURRENCY_AMOUNT.toLocaleString()}.`,
            });
            return;
        }
        // Validate item exists
        const item = inventoryManager_1.ITEMS[itemId];
        if (!item) {
            await interaction.editReply({
                content: `❌ Invalid item ID: ${itemId}`,
            });
            return;
        }
        // Additional security: Prevent adding excluded items
        if (EXCLUDED_ITEMS.includes(itemId)) {
            await interaction.editReply({
                content: `❌ Cannot add ${item.name}. Use dedicated commands: /addgold, /addsilver, or /addtokens`,
            });
            return;
        }
        // addItem already uses transaction lock internally
        const result = await (0, inventoryManager_1.addItem)(targetUser.id, itemId, amount);
        if (!result.success) {
            await interaction.editReply({
                content: `❌ Failed to add item: ${result.error}`,
            });
            return;
        }
        // Get the item emoji (custom or fallback)
        const itemEmoji = item.customEmoji
            ? (0, emojiUploader_1.getCustomEmoji)(item.customEmoji, item.emoji)
            : item.emoji;
        const embed = new discord_js_1.EmbedBuilder()
            .setColor("#00FF00")
            .setTitle("✅ Item Added!")
            .setDescription(`Successfully added **${amount.toLocaleString()} ${itemEmoji} ${item.name}** to ${targetUser.tag}!`)
            .addFields({ name: "👤 User", value: `${targetUser}`, inline: true }, { name: "📦 Item", value: `${itemEmoji} ${item.name}`, inline: true }, {
            name: "🔢 Amount",
            value: `${amount.toLocaleString()}`,
            inline: true,
        }, {
            name: "📊 Total",
            value: `${result.totalQuantity.toLocaleString()}`,
            inline: true,
        })
            .setFooter({ text: "Manual addition by bot owner" })
            .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
    },
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused().toLowerCase();
        // Filter items based on user input
        const filtered = AVAILABLE_ITEMS
            .filter(itemId => inventoryManager_1.ITEMS[itemId].name.toLowerCase().includes(focusedValue) ||
            itemId.toLowerCase().includes(focusedValue))
            .slice(0, 25) // Discord limit
            .map(itemId => ({
            name: inventoryManager_1.ITEMS[itemId].name,
            value: itemId,
        }));
        await interaction.respond(filtered);
    },
};
//# sourceMappingURL=additem.js.map