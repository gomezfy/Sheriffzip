"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleWarehouseButtons = handleWarehouseButtons;
exports.handleWarehouseSelects = handleWarehouseSelects;
const discord_js_1 = require("discord.js");
const warehouseManager_1 = require("../../utils/warehouseManager");
const inventoryManager_1 = require("../../utils/inventoryManager");
const dataManager_1 = require("../../utils/dataManager");
const i18n_1 = require("../../utils/i18n");
const customEmojis_1 = require("../../utils/customEmojis");
const command = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("armazem")
        .setDescription("🏛️ View and trade at the State Warehouse")
        .setDescriptionLocalizations({
        "pt-BR": "🏛️ Ver e negociar no Armazém do Estado",
        "es-ES": "🏛️ Ver y comerciar en el Almacén del Estado",
    }),
    async execute(interaction) {
        await showWarehouse(interaction);
    },
};
async function showWarehouse(interaction, message) {
    const stats = (0, warehouseManager_1.getWarehouseStats)();
    const locale = (0, i18n_1.getLocale)(interaction);
    const warehouseEmoji = (0, customEmojis_1.getEmoji)("bank");
    const statsEmoji = (0, customEmojis_1.getEmoji)("stats");
    const silverEmoji = (0, customEmojis_1.getEmoji)("silver_coin");
    const embed = new discord_js_1.EmbedBuilder()
        .setColor("#8B4513")
        .setTitle(`${warehouseEmoji} ${(0, i18n_1.t)(interaction, "warehouse_title")}`)
        .setDescription(message ||
        `**${(0, i18n_1.t)(interaction, "warehouse_desc")}**\n\n` +
            `${statsEmoji} **${(0, i18n_1.t)(interaction, "warehouse_stats_hourly")}**`)
        .setTimestamp();
    let stockInfo = "";
    let hourlyStats = "";
    for (const resourceId in warehouseManager_1.WAREHOUSE_RESOURCES) {
        const resource = warehouseManager_1.WAREHOUSE_RESOURCES[resourceId];
        const stock = stats.stock[resourceId] || 0;
        const buyPrice = stats.prices[resourceId]?.buy || 0;
        const sellPrice = stats.prices[resourceId]?.sell || 0;
        const sold = stats.statistics.hourly[resourceId]?.sold || 0;
        const bought = stats.statistics.hourly[resourceId]?.bought || 0;
        stockInfo += `${resource.emoji} **${resource.name}**\n`;
        stockInfo += `├ ${(0, i18n_1.t)(interaction, "warehouse_stock")}: **${stock.toLocaleString()}** ${(0, i18n_1.t)(interaction, "warehouse_units")}\n`;
        stockInfo += `├ ${(0, i18n_1.t)(interaction, "warehouse_you_sell")}: **${sellPrice}** ${silverEmoji} ${(0, i18n_1.t)(interaction, "warehouse_each")}\n`;
        stockInfo += `└ ${(0, i18n_1.t)(interaction, "warehouse_you_buy")}: **${buyPrice}** ${silverEmoji} ${(0, i18n_1.t)(interaction, "warehouse_each")}\n\n`;
        hourlyStats += `**${resource.name}**: ${sold} ${(0, i18n_1.t)(interaction, "warehouse_sold")}, ${bought} ${(0, i18n_1.t)(interaction, "warehouse_bought")}\n`;
    }
    embed.addFields({
        name: `${(0, customEmojis_1.getEmoji)("crate")} ${(0, i18n_1.t)(interaction, "warehouse_stock_prices")}`,
        value: stockInfo || (0, i18n_1.t)(interaction, "warehouse_no_resources"),
        inline: false,
    }, {
        name: `${statsEmoji} ${(0, i18n_1.t)(interaction, "warehouse_movement")}`,
        value: hourlyStats || (0, i18n_1.t)(interaction, "warehouse_no_movement"),
        inline: false,
    }, {
        name: `${(0, customEmojis_1.getEmoji)("moneybag")} ${(0, i18n_1.t)(interaction, "warehouse_total_value")}`,
        value: `**${stats.totalValue.toLocaleString()}** ${silverEmoji}`,
        inline: false,
    }, {
        name: `💰 Cofre do Armazém`,
        value: `**${stats.treasury.toLocaleString()}** ${silverEmoji}`,
        inline: false,
    });
    if (stats.statistics.lastReset) {
        const lastReset = new Date(stats.statistics.lastReset);
        const dateStr = locale === "pt-BR"
            ? lastReset.toLocaleString("pt-BR")
            : lastReset.toLocaleString("en-US");
        embed.setFooter({
            text: `${(0, i18n_1.t)(interaction, "warehouse_last_update")}: ${dateStr} | ${(0, i18n_1.t)(interaction, "warehouse_next_update")}`,
        });
    }
    const row = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId("warehouse_sell")
        .setLabel((0, i18n_1.t)(interaction, "warehouse_btn_sell"))
        .setStyle(discord_js_1.ButtonStyle.Success), new discord_js_1.ButtonBuilder()
        .setCustomId("warehouse_buy")
        .setLabel((0, i18n_1.t)(interaction, "warehouse_btn_buy"))
        .setStyle(discord_js_1.ButtonStyle.Primary), new discord_js_1.ButtonBuilder()
        .setCustomId("warehouse_refresh")
        .setLabel((0, i18n_1.t)(interaction, "warehouse_btn_refresh"))
        .setStyle(discord_js_1.ButtonStyle.Secondary));
    if (interaction.isButton()) {
        await interaction.update({ embeds: [embed], components: [row] });
    }
    else {
        await interaction.reply({ embeds: [embed], components: [row] });
    }
}
async function handleWarehouseButtons(interaction) {
    const customId = interaction.customId;
    if (customId === "warehouse_refresh" || customId === "warehouse_back") {
        await showWarehouse(interaction);
        return;
    }
    if (customId === "warehouse_sell") {
        await showSellMenu(interaction);
        return;
    }
    if (customId === "warehouse_buy") {
        await showBuyMenu(interaction);
        return;
    }
}
async function showSellMenu(interaction) {
    const inventory = (0, inventoryManager_1.getInventory)(interaction.user.id);
    const options = [];
    const silverEmoji = (0, customEmojis_1.getEmoji)("silver_coin");
    for (const resourceId in warehouseManager_1.WAREHOUSE_RESOURCES) {
        const resource = warehouseManager_1.WAREHOUSE_RESOURCES[resourceId];
        const userAmount = inventory.items[resourceId] || 0;
        const sellPrice = (0, warehouseManager_1.getPrice)(resourceId, "sell");
        options.push(new discord_js_1.StringSelectMenuOptionBuilder()
            .setLabel(`${resource.name} (${userAmount} ${(0, i18n_1.t)(interaction, "warehouse_available")})`)
            .setDescription(`${(0, i18n_1.t)(interaction, "warehouse_sell_for")} ${sellPrice} ${(0, i18n_1.t)(interaction, "warehouse_each")}`)
            .setValue(resourceId));
    }
    const selectMenu = new discord_js_1.StringSelectMenuBuilder()
        .setCustomId("warehouse_sell_select")
        .setPlaceholder((0, i18n_1.t)(interaction, "warehouse_select_placeholder_sell"))
        .addOptions(options);
    const row = new discord_js_1.ActionRowBuilder().addComponents(selectMenu);
    const backButton = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId("warehouse_back")
        .setLabel((0, i18n_1.t)(interaction, "warehouse_btn_back"))
        .setStyle(discord_js_1.ButtonStyle.Secondary));
    await interaction.update({
        content: `${(0, customEmojis_1.getEmoji)("moneybag")} **${(0, i18n_1.t)(interaction, "warehouse_sell_menu")}**`,
        components: [row, backButton],
        embeds: [],
    });
}
async function showBuyMenu(interaction) {
    const options = [];
    const silverEmoji = (0, customEmojis_1.getEmoji)("silver_coin");
    for (const resourceId in warehouseManager_1.WAREHOUSE_RESOURCES) {
        const resource = warehouseManager_1.WAREHOUSE_RESOURCES[resourceId];
        const stock = (0, warehouseManager_1.getStock)(resourceId);
        const buyPrice = (0, warehouseManager_1.getPrice)(resourceId, "buy");
        options.push(new discord_js_1.StringSelectMenuOptionBuilder()
            .setLabel(`${resource.name} (${stock} ${(0, i18n_1.t)(interaction, "warehouse_in_stock")})`)
            .setDescription(`${(0, i18n_1.t)(interaction, "warehouse_buy_for")} ${buyPrice} ${(0, i18n_1.t)(interaction, "warehouse_each")}`)
            .setValue(resourceId));
    }
    const selectMenu = new discord_js_1.StringSelectMenuBuilder()
        .setCustomId("warehouse_buy_select")
        .setPlaceholder((0, i18n_1.t)(interaction, "warehouse_select_placeholder_buy"))
        .addOptions(options);
    const row = new discord_js_1.ActionRowBuilder().addComponents(selectMenu);
    const backButton = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId("warehouse_back")
        .setLabel((0, i18n_1.t)(interaction, "warehouse_btn_back"))
        .setStyle(discord_js_1.ButtonStyle.Secondary));
    await interaction.update({
        content: `${(0, customEmojis_1.getEmoji)("briefcase")} **${(0, i18n_1.t)(interaction, "warehouse_buy_menu")}**`,
        components: [row, backButton],
        embeds: [],
    });
}
async function handleWarehouseSelects(interaction) {
    const customId = interaction.customId;
    const resourceId = interaction.values[0];
    const resource = warehouseManager_1.WAREHOUSE_RESOURCES[resourceId];
    if (customId === "warehouse_sell_select") {
        await handleSellInteraction(interaction, resourceId, resource);
    }
    else if (customId === "warehouse_buy_select") {
        await handleBuyInteraction(interaction, resourceId, resource);
    }
}
async function handleSellInteraction(interaction, resourceId, resource) {
    const inventory = (0, inventoryManager_1.getInventory)(interaction.user.id);
    const userAmount = inventory.items[resourceId] || 0;
    const silverEmoji = (0, customEmojis_1.getEmoji)("silver_coin");
    const cancelEmoji = (0, customEmojis_1.getEmoji)("cancel");
    if (userAmount === 0) {
        await interaction.reply({
            content: `${cancelEmoji} ${(0, i18n_1.t)(interaction, "warehouse_no_items", { resource: `${resource.emoji} **${resource.name}**` })}`,
            ephemeral: true,
        });
        return;
    }
    await interaction.reply({
        content: `${(0, customEmojis_1.getEmoji)("moneybag")} **${(0, i18n_1.t)(interaction, "warehouse_sell_title", { resource: `${resource.emoji} ${resource.name}` })}**\n\n` +
            `${(0, i18n_1.t)(interaction, "warehouse_you_have")}: **${userAmount}** ${(0, i18n_1.t)(interaction, "warehouse_units")}\n` +
            `${(0, i18n_1.t)(interaction, "warehouse_price")}: **${(0, warehouseManager_1.getPrice)(resourceId, "sell")}** ${silverEmoji} ${(0, i18n_1.t)(interaction, "warehouse_each")}\n\n` +
            `${(0, i18n_1.t)(interaction, "warehouse_enter_amount", { action: (0, i18n_1.t)(interaction, "warehouse_action_sell") })}`,
        ephemeral: false,
    });
    if (!interaction.channel ||
        !("createMessageCollector" in interaction.channel)) {
        await interaction.followUp({
            content: `${cancelEmoji} Erro: Este canal não suporta esta funcionalidade. Tente usar o comando em um canal de texto normal.`,
            ephemeral: true,
        });
        return;
    }
    const filter = (m) => {
        console.log(`[Warehouse SELL] Message from ${m.author.id}, expected ${interaction.user.id}`);
        return m.author.id === interaction.user.id;
    };
    const collector = interaction.channel.createMessageCollector({
        filter,
        time: 60000,
        max: 1,
    });
    console.log(`[Warehouse SELL] Collector created for user ${interaction.user.id} in channel ${interaction.channel.id}`);
    collector.on("collect", async (msg) => {
        if (msg.content.toLowerCase() === "cancelar" ||
            msg.content.toLowerCase() === "cancel") {
            await msg.reply(`${cancelEmoji} ${(0, i18n_1.t)(interaction, "warehouse_action_sell", {})} ${(0, i18n_1.t)(interaction, "warehouse_cancelled")}`);
            return;
        }
        const amount = parseInt(msg.content);
        if (isNaN(amount) || amount <= 0) {
            await msg.reply(`${cancelEmoji} ${(0, i18n_1.t)(interaction, "warehouse_invalid_amount")}`);
            return;
        }
        if (amount > userAmount) {
            await msg.reply(`${cancelEmoji} ${(0, i18n_1.t)(interaction, "warehouse_insufficient_items", { amount, resource: resource.name })}`);
            return;
        }
        const sellPrice = (0, warehouseManager_1.getPrice)(resourceId, "sell");
        const totalEarned = amount * sellPrice;
        const currentTreasury = (0, warehouseManager_1.getTreasury)();
        if (currentTreasury < totalEarned) {
            await msg.reply(`${cancelEmoji} **Armazém sem fundos!**\n\n` +
                `O armazém precisa de **${totalEarned.toLocaleString()}** ${silverEmoji} para comprar seus itens, ` +
                `mas o cofre só tem **${currentTreasury.toLocaleString()}** ${silverEmoji}.\n\n` +
                `⏳ Aguarde outros jogadores comprarem do armazém para acumular mais fundos no cofre!`);
            return;
        }
        const treasurySuccess = (0, warehouseManager_1.removeTreasury)(totalEarned);
        if (!treasurySuccess) {
            await msg.reply(`${cancelEmoji} **Erro ao processar pagamento!**\n\n` +
                `O cofre do armazém não tem fundos suficientes. Tente novamente mais tarde.`);
            return;
        }
        await (0, inventoryManager_1.removeItem)(interaction.user.id, resourceId, amount);
        (0, warehouseManager_1.addStock)(resourceId, amount);
        (0, warehouseManager_1.recordTransaction)(interaction.user.id, "sell", resourceId, amount, sellPrice);
        await (0, dataManager_1.addUserSilver)(interaction.user.id, totalEarned);
        try {
            const checkEmoji = (0, customEmojis_1.getEmoji)("check");
            const dmEmbed = new discord_js_1.EmbedBuilder()
                .setColor("#2ECC71")
                .setTitle(`${checkEmoji} ${(0, i18n_1.t)(interaction, "warehouse_sale_complete")}`)
                .setDescription(`${(0, i18n_1.t)(interaction, "warehouse_sale_success", { amount, resource: `${resource.emoji} **${resource.name}**` })}\n\n` +
                `${(0, i18n_1.t)(interaction, "warehouse_unit_price")}: **${sellPrice}** ${silverEmoji}\n` +
                `**${(0, i18n_1.t)(interaction, "warehouse_total_received", { amount: totalEarned })}**`)
                .setTimestamp();
            await interaction.user.send({ embeds: [dmEmbed] });
        }
        catch (error) {
            console.log("Could not send DM to user");
        }
        await msg.reply(`${(0, customEmojis_1.getEmoji)("check")} **${(0, i18n_1.t)(interaction, "warehouse_sale_confirmed")}**\n\n` +
            `${resource.emoji} **${(0, i18n_1.t)(interaction, "warehouse_sold_items", { amount, resource: resource.name })}**\n` +
            `${(0, customEmojis_1.getEmoji)("moneybag")} ${(0, i18n_1.t)(interaction, "warehouse_received_dm", { amount: totalEarned })}`);
    });
    collector.on("end", (collected) => {
        if (collected.size === 0) {
            interaction.followUp({
                content: `${(0, customEmojis_1.getEmoji)("timer")} ${(0, i18n_1.t)(interaction, "warehouse_timeout")}`,
                ephemeral: true,
            });
        }
    });
}
async function handleBuyInteraction(interaction, resourceId, resource) {
    const stock = (0, warehouseManager_1.getStock)(resourceId);
    const silverEmoji = (0, customEmojis_1.getEmoji)("silver_coin");
    const cancelEmoji = (0, customEmojis_1.getEmoji)("cancel");
    if (stock === 0) {
        await interaction.reply({
            content: `${cancelEmoji} ${(0, i18n_1.t)(interaction, "warehouse_out_of_stock", { resource: `${resource.emoji} **${resource.name}**` })}`,
            ephemeral: true,
        });
        return;
    }
    await interaction.reply({
        content: `${(0, customEmojis_1.getEmoji)("briefcase")} **${(0, i18n_1.t)(interaction, "warehouse_buy_title", { resource: `${resource.emoji} ${resource.name}` })}**\n\n` +
            `${(0, i18n_1.t)(interaction, "warehouse_available_stock")}: **${stock}** ${(0, i18n_1.t)(interaction, "warehouse_units")}\n` +
            `${(0, i18n_1.t)(interaction, "warehouse_price")}: **${(0, warehouseManager_1.getPrice)(resourceId, "buy")}** ${silverEmoji} ${(0, i18n_1.t)(interaction, "warehouse_each")}\n\n` +
            `${(0, i18n_1.t)(interaction, "warehouse_enter_amount", { action: (0, i18n_1.t)(interaction, "warehouse_action_buy") })}`,
        ephemeral: false,
    });
    if (!interaction.channel ||
        !("createMessageCollector" in interaction.channel)) {
        return;
    }
    const filter = (m) => m.author.id === interaction.user.id;
    const collector = interaction.channel.createMessageCollector({
        filter,
        time: 60000,
        max: 1,
    });
    collector.on("collect", async (msg) => {
        if (msg.content.toLowerCase() === "cancelar" ||
            msg.content.toLowerCase() === "cancel") {
            await msg.reply(`${cancelEmoji} ${(0, i18n_1.t)(interaction, "warehouse_action_buy", {})} ${(0, i18n_1.t)(interaction, "warehouse_cancelled")}`);
            return;
        }
        const amount = parseInt(msg.content);
        if (isNaN(amount) || amount <= 0) {
            await msg.reply(`${cancelEmoji} ${(0, i18n_1.t)(interaction, "warehouse_invalid_amount")}`);
            return;
        }
        if (amount > stock) {
            await msg.reply(`${cancelEmoji} ${(0, i18n_1.t)(interaction, "warehouse_insufficient_stock", { amount, stock })}`);
            return;
        }
        const buyPrice = (0, warehouseManager_1.getPrice)(resourceId, "buy");
        const totalCost = amount * buyPrice;
        const userSilver = (0, dataManager_1.getUserSilver)(interaction.user.id);
        if (userSilver < totalCost) {
            await msg.reply(`${cancelEmoji} ${(0, i18n_1.t)(interaction, "warehouse_insufficient_silver", { needed: totalCost, current: userSilver })}`);
            return;
        }
        const success = (0, warehouseManager_1.removeStock)(resourceId, amount);
        if (!success) {
            await msg.reply(`${cancelEmoji} ${(0, i18n_1.t)(interaction, "warehouse_error_processing", { action: (0, i18n_1.t)(interaction, "warehouse_action_buy") })}`);
            return;
        }
        await (0, inventoryManager_1.addItem)(interaction.user.id, resourceId, amount);
        (0, warehouseManager_1.recordTransaction)(interaction.user.id, "buy", resourceId, amount, buyPrice);
        await (0, dataManager_1.removeUserSilver)(interaction.user.id, totalCost);
        (0, warehouseManager_1.addTreasury)(totalCost);
        await msg.reply(`${(0, customEmojis_1.getEmoji)("check")} **${(0, i18n_1.t)(interaction, "warehouse_purchase_confirmed")}**\n\n` +
            `${resource.emoji} **${(0, i18n_1.t)(interaction, "warehouse_bought_items", { amount, resource: resource.name })}**\n` +
            `${(0, customEmojis_1.getEmoji)("currency")} ${(0, i18n_1.t)(interaction, "warehouse_total_paid", { amount: totalCost })}\n\n` +
            `${(0, i18n_1.t)(interaction, "warehouse_added_inventory")}`);
    });
    collector.on("end", (collected) => {
        if (collected.size === 0) {
            interaction.followUp({
                content: `${(0, customEmojis_1.getEmoji)("timer")} ${(0, i18n_1.t)(interaction, "warehouse_timeout")}`,
                ephemeral: true,
            });
        }
    });
}
exports.default = Object.assign(command, {
    handleWarehouseButtons,
    handleWarehouseSelects,
});
//# sourceMappingURL=armazem.js.map