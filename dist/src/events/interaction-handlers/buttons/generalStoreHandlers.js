"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGeneralStoreNavigation = handleGeneralStoreNavigation;
exports.handleGeneralStoreCategory = handleGeneralStoreCategory;
exports.handleGeneralStorePurchase = handleGeneralStorePurchase;
const discord_js_1 = require("discord.js");
const generalStoreManager_1 = require("../../../utils/generalStoreManager");
const inventoryManager_1 = require("../../../utils/inventoryManager");
const generalStoreCanvas_1 = require("../../../utils/generalStoreCanvas");
const customEmojis_1 = require("../../../utils/customEmojis");
const dataManager_1 = require("../../../utils/dataManager");
async function handleGeneralStoreNavigation(interaction) {
    await interaction.deferUpdate();
    const parts = interaction.customId.split('_');
    const action = parts[1];
    const currentIndex = parseInt(parts[2]);
    const category = parts[3] || 'all';
    const allItems = (0, generalStoreManager_1.getStoreItemsByCategory)(category);
    let newIndex = currentIndex;
    if (action === 'next') {
        newIndex = (currentIndex + 1) % allItems.length;
    }
    else if (action === 'prev') {
        newIndex = currentIndex - 1;
        if (newIndex < 0) {
            newIndex = allItems.length - 1;
        }
    }
    const item = allItems[newIndex];
    const inventory = (0, inventoryManager_1.getInventory)(interaction.user.id);
    const userTokens = inventory.items['saloon_token'] || 0;
    let userHasItem = false;
    if (item.category === 'backpacks') {
        userHasItem = inventory.purchasedBackpacks?.includes(item.id) || false;
    }
    else {
        userHasItem = inventory.items[item.id] ? inventory.items[item.id] > 0 : false;
    }
    const canvasBuffer = await (0, generalStoreCanvas_1.createStoreItemCanvas)(item, userTokens, userHasItem);
    const attachment = new discord_js_1.AttachmentBuilder(canvasBuffer, {
        name: 'store_item.png',
    });
    const row1 = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId(`gstore_prev_${newIndex}_${category}`)
        .setLabel('<')
        .setStyle(discord_js_1.ButtonStyle.Secondary)
        .setDisabled(newIndex === 0), new discord_js_1.ButtonBuilder()
        .setCustomId(`gstore_buy_${item.id}_${newIndex}_${category}`)
        .setLabel(userHasItem ? 'Já Possui' : 'Comprar')
        .setStyle(userHasItem ? discord_js_1.ButtonStyle.Secondary : discord_js_1.ButtonStyle.Success)
        .setDisabled(userHasItem || userTokens < item.price), new discord_js_1.ButtonBuilder()
        .setCustomId(`gstore_next_${newIndex}_${category}`)
        .setLabel('>')
        .setStyle(discord_js_1.ButtonStyle.Secondary)
        .setDisabled(newIndex === allItems.length - 1));
    const row2 = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId(`gstore_cat_${category}_${newIndex}`)
        .setLabel(`Categoria: ${(0, generalStoreManager_1.getCategoryName)(category)}`)
        .setStyle(discord_js_1.ButtonStyle.Primary));
    await interaction.editReply({
        files: [attachment],
        components: [row1, row2],
    });
}
async function handleGeneralStoreCategory(interaction) {
    await interaction.deferUpdate();
    const parts = interaction.customId.split('_');
    const currentCategory = parts[2];
    const categories = ['all', 'tools', 'backpacks'];
    const currentCategoryIndex = categories.indexOf(currentCategory);
    const newCategory = categories[(currentCategoryIndex + 1) % categories.length];
    const allItems = (0, generalStoreManager_1.getStoreItemsByCategory)(newCategory);
    const newIndex = 0;
    const item = allItems[newIndex];
    const inventory = (0, inventoryManager_1.getInventory)(interaction.user.id);
    const userTokens = inventory.items['saloon_token'] || 0;
    let userHasItem = false;
    if (item.category === 'backpacks') {
        userHasItem = inventory.purchasedBackpacks?.includes(item.id) || false;
    }
    else {
        userHasItem = inventory.items[item.id] ? inventory.items[item.id] > 0 : false;
    }
    const canvasBuffer = await (0, generalStoreCanvas_1.createStoreItemCanvas)(item, userTokens, userHasItem);
    const attachment = new discord_js_1.AttachmentBuilder(canvasBuffer, {
        name: 'store_item.png',
    });
    const row1 = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId(`gstore_prev_${newIndex}_${newCategory}`)
        .setLabel('<')
        .setStyle(discord_js_1.ButtonStyle.Secondary)
        .setDisabled(newIndex === 0), new discord_js_1.ButtonBuilder()
        .setCustomId(`gstore_buy_${item.id}_${newIndex}_${newCategory}`)
        .setLabel(userHasItem ? 'Já Possui' : 'Comprar')
        .setStyle(userHasItem ? discord_js_1.ButtonStyle.Secondary : discord_js_1.ButtonStyle.Success)
        .setDisabled(userHasItem || userTokens < item.price), new discord_js_1.ButtonBuilder()
        .setCustomId(`gstore_next_${newIndex}_${newCategory}`)
        .setLabel('>')
        .setStyle(discord_js_1.ButtonStyle.Secondary)
        .setDisabled(newIndex === allItems.length - 1));
    const row2 = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId(`gstore_cat_${newCategory}_${newIndex}`)
        .setLabel(`Categoria: ${(0, generalStoreManager_1.getCategoryName)(newCategory)}`)
        .setStyle(discord_js_1.ButtonStyle.Primary));
    await interaction.editReply({
        files: [attachment],
        components: [row1, row2],
    });
}
async function handleGeneralStorePurchase(interaction) {
    const parts = interaction.customId.split('_');
    const category = parts[parts.length - 1];
    const currentIndex = parseInt(parts[parts.length - 2]);
    const itemId = parts.slice(2, -2).join('_');
    const item = (0, generalStoreManager_1.getStoreItemById)(itemId);
    if (!item) {
        await interaction.reply({
            content: '❌ Item não encontrado!',
            ephemeral: true,
        });
        return;
    }
    const inventory = (0, inventoryManager_1.getInventory)(interaction.user.id);
    const currency = item.currency || 'tokens';
    const userTokens = inventory.items['saloon_token'] || 0;
    const userSilver = currency === 'silver' ? (0, dataManager_1.getUserSilver)(interaction.user.id) : 0;
    const userBalance = currency === 'silver' ? userSilver : userTokens;
    let userHasItem = false;
    if (item.category === 'backpacks') {
        userHasItem = inventory.purchasedBackpacks?.includes(item.id) || false;
    }
    else {
        userHasItem = inventory.items[item.id] ? inventory.items[item.id] > 0 : false;
    }
    if (userHasItem) {
        await interaction.reply({
            content: '❌ Você já possui este item!',
            ephemeral: true,
        });
        return;
    }
    if (userBalance < item.price) {
        const currencyEmoji = currency === 'silver' ? (0, customEmojis_1.getSilverCoinEmoji)() : (0, customEmojis_1.getSaloonTokenEmoji)();
        const currencyName = currency === 'silver' ? 'moedas de prata' : 'tokens';
        await interaction.reply({
            content: `❌ Você não tem ${currencyName} suficientes!\n\n**Necessário:** ${currencyEmoji} ${item.price.toLocaleString()}\n**Você tem:** ${currencyEmoji} ${userBalance.toLocaleString()}`,
            ephemeral: true,
        });
        return;
    }
    if (currency === 'silver') {
        await (0, dataManager_1.removeUserSilver)(interaction.user.id, item.price);
    }
    else {
        inventory.items['saloon_token'] = userTokens - item.price;
    }
    let result;
    if (item.category === 'backpacks' && item.backpackCapacity) {
        const { saveInventory } = await Promise.resolve().then(() => __importStar(require('../../../utils/inventoryManager')));
        const newCapacity = inventory.maxWeight + item.backpackCapacity;
        inventory.maxWeight = newCapacity;
        if (!inventory.purchasedBackpacks) {
            inventory.purchasedBackpacks = [];
        }
        inventory.purchasedBackpacks.push(item.id);
        saveInventory(interaction.user.id, inventory);
        result = { success: true };
    }
    else {
        result = await (0, inventoryManager_1.addItem)(interaction.user.id, item.id, 1);
    }
    if (result.success) {
        const currencyEmoji = currency === 'silver' ? (0, customEmojis_1.getSilverCoinEmoji)() : (0, customEmojis_1.getSaloonTokenEmoji)();
        const newBalance = currency === 'silver' ? (0, dataManager_1.getUserSilver)(interaction.user.id) : (userTokens - item.price);
        let description = `Você comprou **${item.name}**!\n\n` +
            `💰 **Preço:** ${currencyEmoji} ${item.price.toLocaleString()}\n` +
            `💳 **Saldo Restante:** ${currencyEmoji} ${newBalance.toLocaleString()}`;
        if (item.category === 'backpacks' && item.backpackCapacity) {
            const newInventory = (0, inventoryManager_1.getInventory)(interaction.user.id);
            description += `\n\n🎒 **Nova Capacidade:** ${newInventory.maxWeight}kg`;
        }
        const successEmbed = new discord_js_1.EmbedBuilder()
            .setColor(0xf1c40f)
            .setTitle('✅ Compra Realizada!')
            .setDescription(description)
            .setTimestamp();
        await interaction.reply({
            embeds: [successEmbed],
            ephemeral: true,
        });
        setTimeout(async () => {
            try {
                await interaction.message.delete();
            }
            catch (error) {
                console.error('Error deleting store message:', error);
            }
        }, 1500);
    }
    else {
        await interaction.reply({
            content: `❌ Erro ao comprar o item: ${result.error}`,
            ephemeral: true,
        });
    }
}
//# sourceMappingURL=generalStoreHandlers.js.map