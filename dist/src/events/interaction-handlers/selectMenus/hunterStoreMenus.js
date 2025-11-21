"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleHunterStoreSell = handleHunterStoreSell;
const discord_js_1 = require("discord.js");
const inventoryManager_1 = require("../../../utils/inventoryManager");
const customEmojis_1 = require("../../../utils/customEmojis");
const hunterstore_1 = require("../../../commands/hunting/hunterstore");
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
    const allItems = [...hunterstore_1.MEAT_ITEMS, ...hunterstore_1.PELT_ITEMS, ...hunterstore_1.SPECIAL_ITEMS];
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
//# sourceMappingURL=hunterStoreMenus.js.map