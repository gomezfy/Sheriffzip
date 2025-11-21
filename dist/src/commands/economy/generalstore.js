"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const commandLocalizations_1 = require("../../utils/commandLocalizations");
const generalStoreManager_1 = require("../../utils/generalStoreManager");
const inventoryManager_1 = require("../../utils/inventoryManager");
const generalStoreCanvas_1 = require("../../utils/generalStoreCanvas");
const dataManager_1 = require("../../utils/dataManager");
const commandBuilder = new discord_js_1.SlashCommandBuilder()
    .setName('generalstore')
    .setDescription('🏪 Loja Geral - Compre itens úteis para sua jornada')
    .setContexts([0, 1, 2])
    .setIntegrationTypes([0, 1]);
exports.default = {
    data: (0, commandLocalizations_1.applyLocalizations)(commandBuilder, 'generalstore'),
    async execute(interaction) {
        await interaction.deferReply();
        const category = 'all';
        const allItems = (0, generalStoreManager_1.getStoreItemsByCategory)(category);
        const startIndex = 0;
        const item = allItems[startIndex];
        const inventory = (0, inventoryManager_1.getInventory)(interaction.user.id);
        const userTokens = inventory.items['saloon_token'] || 0;
        const userSilver = (0, dataManager_1.getUserSilver)(interaction.user.id);
        let userHasItem = false;
        if (item.category === 'backpacks') {
            userHasItem = inventory.purchasedBackpacks?.includes(item.id) || false;
        }
        else {
            userHasItem = inventory.items[item.id] ? inventory.items[item.id] > 0 : false;
        }
        const canvasBuffer = await (0, generalStoreCanvas_1.createStoreItemCanvas)(item, userTokens, userHasItem, userSilver);
        const attachment = new discord_js_1.AttachmentBuilder(canvasBuffer, {
            name: 'store_item.png',
        });
        const currency = item.currency || 'tokens';
        const userBalance = currency === 'silver' ? userSilver : userTokens;
        const row1 = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
            .setCustomId(`gstore_prev_${startIndex}_${category}`)
            .setLabel('<')
            .setStyle(discord_js_1.ButtonStyle.Secondary)
            .setDisabled(startIndex === 0), new discord_js_1.ButtonBuilder()
            .setCustomId(`gstore_buy_${item.id}_${startIndex}_${category}`)
            .setLabel(userHasItem ? 'Já Possui' : 'Comprar')
            .setStyle(userHasItem ? discord_js_1.ButtonStyle.Secondary : discord_js_1.ButtonStyle.Success)
            .setDisabled(userHasItem || userBalance < item.price), new discord_js_1.ButtonBuilder()
            .setCustomId(`gstore_next_${startIndex}_${category}`)
            .setLabel('>')
            .setStyle(discord_js_1.ButtonStyle.Secondary)
            .setDisabled(startIndex === allItems.length - 1));
        const row2 = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
            .setCustomId(`gstore_cat_${category}_${startIndex}`)
            .setLabel(`Categoria: ${(0, generalStoreManager_1.getCategoryName)(category)}`)
            .setStyle(discord_js_1.ButtonStyle.Primary));
        await interaction.editReply({
            files: [attachment],
            components: [row1, row2],
        });
    },
};
//# sourceMappingURL=generalstore.js.map