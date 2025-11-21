"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const embeds_1 = require("../../utils/embeds");
const customEmojis_1 = require("../../utils/customEmojis");
const customEmojis_2 = require("../../utils/customEmojis");
const i18n_1 = require("../../utils/i18n");
const commandLocalizations_1 = require("../../utils/commandLocalizations");
const { getInventory, calculateWeight, ITEMS, getNextUpgrade, getItemDurability, saveInventory, } = require("../../utils/inventoryManager");
exports.default = {
    data: (0, commandLocalizations_1.applyLocalizations)(new discord_js_1.SlashCommandBuilder()
        .setName("inventory")
        .setDescription(`${(0, customEmojis_1.getBackpackEmoji)()} View your backpack inventory`)
        .setContexts([0, 1, 2]) // Guild, BotDM, PrivateChannel
        .setIntegrationTypes([0, 1]) // Guild Install, User Install
        .addUserOption((option) => option
        .setName("user")
        .setDescription("Check another user's inventory (optional)")
        .setRequired(false)), "inventory"),
    async execute(interaction) {
        const targetUser = interaction.options.getUser("user") || interaction.user;
        // Only allow viewing own inventory for privacy
        if (targetUser.id !== interaction.user.id) {
            const embed = (0, embeds_1.warningEmbed)((0, i18n_1.t)(interaction, "inventory_private_title"), (0, i18n_1.t)(interaction, "inventory_private_desc"), (0, i18n_1.t)(interaction, "inventory_private_footer"));
            await interaction.reply({
                embeds: [embed],
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
            return;
        }
        await interaction.deferReply({ flags: discord_js_1.MessageFlags.Ephemeral });
        const inventory = getInventory(targetUser.id);
        if (!inventory.itemDurability) {
            inventory.itemDurability = {};
        }
        let durabilityInitialized = false;
        for (const [itemId, quantity] of Object.entries(inventory.items)) {
            const quantityNum = Number(quantity);
            const item = ITEMS[itemId];
            if (item && item.maxDurability && !inventory.itemDurability[itemId] && quantityNum > 0) {
                inventory.itemDurability[itemId] = item.maxDurability;
                durabilityInitialized = true;
            }
        }
        if (durabilityInitialized) {
            saveInventory(targetUser.id, inventory);
        }
        const currentWeight = calculateWeight(inventory);
        const maxWeight = inventory.maxWeight;
        // Currency totals
        const saloonTokens = inventory.items["saloon_token"] || 0;
        const silverCoins = inventory.items["silver"] || 0;
        // Count items (excluding currencies)
        const currencies = ["saloon_token", "silver"];
        const otherItems = [];
        let totalItems = 0;
        for (const [itemId, quantity] of Object.entries(inventory.items)) {
            const quantityNum = Number(quantity);
            totalItems += quantityNum;
            if (!currencies.includes(itemId)) {
                otherItems.push([itemId, quantityNum]);
            }
        }
        // Build items list
        let itemsList = "";
        if (otherItems.length === 0) {
            itemsList = (0, i18n_1.t)(interaction, "inventory_empty");
        }
        else {
            for (const [itemId, quantity] of otherItems) {
                const item = ITEMS[itemId];
                if (item) {
                    const itemWeight = item.weight * quantity;
                    const weightDisplay = itemWeight >= 0.1 ? ` • ${itemWeight.toFixed(1)}kg` : "";
                    // Use custom emoji if available, otherwise fallback to text emoji
                    const itemEmoji = item.customEmoji
                        ? (0, customEmojis_2.getEmoji)(item.customEmoji)
                        : item.emoji;
                    let durabilityBar = "";
                    if (item.maxDurability) {
                        const currentDurability = getItemDurability(targetUser.id, itemId);
                        if (currentDurability !== null) {
                            const durabilityPercent = (currentDurability / item.maxDurability) * 100;
                            const barColor = durabilityPercent > 50 ? "🟢" : durabilityPercent > 20 ? "🟡" : "🔴";
                            durabilityBar = ` ${barColor} ${currentDurability}/${item.maxDurability}`;
                        }
                    }
                    itemsList += `${itemEmoji} **${item.name}** ×${quantity.toLocaleString()}${weightDisplay}${durabilityBar}\n`;
                }
            }
        }
        // Weight status
        const weightPercentage = (currentWeight / maxWeight) * 100;
        const weightColor = weightPercentage >= 90
            ? "red"
            : weightPercentage >= 70
                ? "amber"
                : "green";
        const weightBar = (0, embeds_1.progressBar)(currentWeight, maxWeight, 20);
        // Check for upgrade
        const nextUpgrade = getNextUpgrade(targetUser.id);
        let upgradeInfo = "";
        if (nextUpgrade) {
            upgradeInfo = (0, i18n_1.t)(interaction, "inventory_next_upgrade", {
                capacity: nextUpgrade.capacity,
                price: nextUpgrade.price,
            });
        }
        else {
            upgradeInfo = (0, i18n_1.t)(interaction, "inventory_max_capacity");
        }
        // Create embed
        const embed = (0, embeds_1.infoEmbed)(`${(0, customEmojis_1.getBackpackEmoji)()} ${(0, i18n_1.t)(interaction, "inventory_title", { username: targetUser.username })}`, (0, i18n_1.t)(interaction, "inventory_subtitle"))
            .addFields({
            name: `${(0, customEmojis_1.getMoneybagEmoji)()} ${(0, i18n_1.t)(interaction, "inventory_currency")}`,
            value: `${(0, embeds_1.formatCurrency)(saloonTokens, "tokens")}\n${(0, embeds_1.formatCurrency)(silverCoins, "silver")}`,
            inline: true,
        }, {
            name: `${(0, customEmojis_1.getStatsEmoji)()} ${(0, i18n_1.t)(interaction, "inventory_stats")}`,
            value: (0, i18n_1.t)(interaction, "inventory_stats_items", {
                items: totalItems.toLocaleString(),
                types: Object.keys(inventory.items).length,
                weight: currentWeight.toFixed(1),
                maxWeight: maxWeight,
            }),
            inline: true,
        }, {
            name: `${(0, customEmojis_1.getCrateEmoji)()} ${(0, i18n_1.t)(interaction, "inventory_items")}`,
            value: itemsList,
            inline: false,
        }, {
            name: `${(0, customEmojis_1.getBalanceEmoji)()} ${(0, i18n_1.t)(interaction, "inventory_capacity")}`,
            value: `${weightBar}\n${currentWeight.toFixed(1)}kg / ${maxWeight}kg (${weightPercentage.toFixed(0)}%)${upgradeInfo}`,
            inline: false,
        })
            .setThumbnail(targetUser.displayAvatarURL({ size: 128 }));
        // Warning if nearly full
        if (weightPercentage >= 90) {
            embed.setFooter({
                text: `${(0, customEmojis_1.getWarningEmoji)()} ${(0, i18n_1.t)(interaction, "inventory_nearly_full_warning")}`,
            });
        }
        else if (weightPercentage >= 100) {
            embed.setFooter({
                text: `${(0, customEmojis_1.getAlarmEmoji)()} ${(0, i18n_1.t)(interaction, "inventory_full_warning")}`,
            });
        }
        else {
            embed.setFooter({ text: (0, i18n_1.t)(interaction, "inventory_transfer_hint") });
        }
        await interaction.editReply({ embeds: [embed] });
    },
};
//# sourceMappingURL=inventory.js.map