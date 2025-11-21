"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleHunterStoreMenu = handleHunterStoreMenu;
exports.handleHunterStoreSell = handleHunterStoreSell;
exports.handleHunterStoreBuy = handleHunterStoreBuy;
const discord_js_1 = require("discord.js");
const inventoryManager_1 = require("../../../utils/inventoryManager");
const customEmojis_1 = require("../../../utils/customEmojis");
const hunterstore_1 = require("../../../commands/hunting/hunterstore");
async function handleHunterStoreMenu(interaction) {
    const userId = interaction.user.id;
    if (!interaction.customId.endsWith(userId)) {
        await interaction.reply({
            content: "❌ Este menu não é para você!",
            ephemeral: true,
        });
        return;
    }
    await interaction.deferUpdate();
    const selectedValue = interaction.values[0];
    const category = selectedValue.split('_')[1];
    let items = [];
    let categoryTitle = "";
    let categoryDescription = "";
    switch (category) {
        case "meat":
            items = hunterstore_1.MEAT_ITEMS;
            categoryTitle = "🥩 Vender Carnes";
            categoryDescription = "Selecione a carne que deseja vender:";
            break;
        case "pelt":
            items = hunterstore_1.PELT_ITEMS;
            categoryTitle = `${(0, customEmojis_1.getEmoji)("deer_pelt")} Vender Peles`;
            categoryDescription = "Selecione a pele que deseja vender:";
            break;
        case "fish":
            items = hunterstore_1.FISH_ITEMS;
            categoryTitle = `${(0, customEmojis_1.getEmoji)("catfish")} Vender Peixes`;
            categoryDescription = "Selecione o peixe que deseja vender:";
            break;
        case "special":
            items = hunterstore_1.SPECIAL_ITEMS;
            categoryTitle = `${(0, customEmojis_1.getEmoji)("eagle_feather")} Vender Penas`;
            categoryDescription = "Selecione a pena que deseja vender:";
            break;
        case "supply":
            items = hunterstore_1.SUPPLY_ITEMS;
            categoryTitle = `${(0, customEmojis_1.getEmoji)("basic_bait")} Comprar Suprimentos`;
            categoryDescription = "Selecione o item que deseja comprar:";
            break;
    }
    const categoryEmbed = new discord_js_1.EmbedBuilder()
        .setColor("#d4af37")
        .setTitle(categoryTitle)
        .setDescription(categoryDescription +
        "\n\n" +
        items
            .map((item) => `${item.emoji} **${item.name}**\n` +
            `├ Preço: ${(0, customEmojis_1.getEmoji)("coin")} ${item.price.toLocaleString()} moedas\n` +
            `├ Raridade: \`${item.rarity}\`\n` +
            `└ ${category === "supply" ? "Disponível para compra" : `Você possui: **${(0, inventoryManager_1.getItem)(userId, item.id)}x**`}`)
            .join("\n\n"))
        .setFooter({ text: "Selecione um item abaixo" })
        .setTimestamp();
    const selectMenu = new discord_js_1.StringSelectMenuBuilder()
        .setCustomId(category === "supply" ? `hunterstore_buy_${userId}` : `hunterstore_sell_${userId}`)
        .setPlaceholder(`Selecione um item para ${category === "supply" ? "comprar" : "vender"}`);
    items.forEach((item) => {
        selectMenu.addOptions(new discord_js_1.StringSelectMenuOptionBuilder()
            .setLabel(item.name)
            .setDescription(`${item.rarity} - ${(0, customEmojis_1.getEmoji)("coin")} ${item.price.toLocaleString()} moedas`)
            .setValue(item.id)
            .setEmoji(item.emoji));
    });
    const backButton = new discord_js_1.ButtonBuilder()
        .setCustomId(`hunterstore_back_${userId}`)
        .setLabel("Voltar")
        .setStyle(discord_js_1.ButtonStyle.Secondary)
        .setEmoji("◀️");
    const row1 = new discord_js_1.ActionRowBuilder().addComponents(selectMenu);
    const row2 = new discord_js_1.ActionRowBuilder().addComponents(backButton);
    await interaction.editReply({
        embeds: [categoryEmbed],
        components: [row1, row2],
    });
}
async function handleHunterStoreSell(interaction) {
    const userId = interaction.user.id;
    if (!interaction.customId.endsWith(userId)) {
        await interaction.reply({
            content: "❌ Este menu não é para você!",
            ephemeral: true,
        });
        return;
    }
    await interaction.deferUpdate();
    const itemId = interaction.values[0];
    const allItems = [...hunterstore_1.MEAT_ITEMS, ...hunterstore_1.PELT_ITEMS, ...hunterstore_1.FISH_ITEMS, ...hunterstore_1.SPECIAL_ITEMS];
    const selectedItem = allItems.find((item) => item.id === itemId);
    if (!selectedItem) {
        await interaction.editReply({
            content: "❌ Item não encontrado!",
            components: [],
        });
        return;
    }
    const quantity = (0, inventoryManager_1.getItem)(userId, itemId);
    if (quantity === 0) {
        await interaction.editReply({
            content: "❌ Você não possui este item!",
            components: [],
        });
        return;
    }
    const confirmEmbed = new discord_js_1.EmbedBuilder()
        .setColor("#d4af37")
        .setTitle(`${(0, customEmojis_1.getEmoji)("shop")} Confirmar Venda`)
        .setDescription(`Você está prestes a vender:\n\n` +
        `${selectedItem.emoji} **${selectedItem.name}**\n` +
        `├ Quantidade: **${quantity}x**\n` +
        `├ Preço unitário: ${(0, customEmojis_1.getEmoji)("coin")} **${selectedItem.price.toLocaleString()}** moedas\n` +
        `└ Valor total: ${(0, customEmojis_1.getEmoji)("coin")} **${(quantity * selectedItem.price).toLocaleString()}** moedas de prata\n\n` +
        `Deseja confirmar a venda de **TODOS** os itens?`)
        .setFooter({ text: "Esta ação não pode ser desfeita!" })
        .setTimestamp();
    const confirmButton = new discord_js_1.ButtonBuilder()
        .setCustomId(`hunterstore_confirm_${itemId}_${userId}`)
        .setLabel("Confirmar Venda")
        .setStyle(discord_js_1.ButtonStyle.Success)
        .setEmoji("✅");
    const cancelButton = new discord_js_1.ButtonBuilder()
        .setCustomId(`hunterstore_back_${userId}`)
        .setLabel("Cancelar")
        .setStyle(discord_js_1.ButtonStyle.Danger)
        .setEmoji("❌");
    const row = new discord_js_1.ActionRowBuilder().addComponents(confirmButton, cancelButton);
    await interaction.editReply({
        embeds: [confirmEmbed],
        components: [row],
    });
}
async function handleHunterStoreBuy(interaction) {
    const userId = interaction.user.id;
    if (!interaction.customId.endsWith(userId)) {
        await interaction.reply({
            content: "❌ Este menu não é para você!",
            ephemeral: true,
        });
        return;
    }
    await interaction.deferUpdate();
    const itemId = interaction.values[0];
    const selectedItem = hunterstore_1.SUPPLY_ITEMS.find((item) => item.id === itemId);
    if (!selectedItem) {
        await interaction.editReply({
            content: "❌ Item não encontrado!",
            components: [],
        });
        return;
    }
    const confirmEmbed = new discord_js_1.EmbedBuilder()
        .setColor("#d4af37")
        .setTitle(`${(0, customEmojis_1.getEmoji)("shop")} Confirmar Compra`)
        .setDescription(`Você está prestes a comprar:\n\n` +
        `${selectedItem.emoji} **${selectedItem.name}**\n` +
        `└ Preço: ${(0, customEmojis_1.getEmoji)("coin")} **${selectedItem.price.toLocaleString()}** moedas de prata\n\n` +
        `Deseja confirmar a compra?`)
        .setFooter({ text: "Esta ação não pode ser desfeita!" })
        .setTimestamp();
    const confirmButton = new discord_js_1.ButtonBuilder()
        .setCustomId(`hunterstore_confirm_buy_${itemId}_${userId}`)
        .setLabel("Confirmar Compra")
        .setStyle(discord_js_1.ButtonStyle.Success)
        .setEmoji("✅");
    const cancelButton = new discord_js_1.ButtonBuilder()
        .setCustomId(`hunterstore_back_${userId}`)
        .setLabel("Cancelar")
        .setStyle(discord_js_1.ButtonStyle.Danger)
        .setEmoji("❌");
    const row = new discord_js_1.ActionRowBuilder().addComponents(confirmButton, cancelButton);
    await interaction.editReply({
        embeds: [confirmEmbed],
        components: [row],
    });
}
//# sourceMappingURL=hunterStoreMenus.js.map