"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const customEmojis_1 = require("../../utils/customEmojis");
const i18n_1 = require("../../utils/i18n");
const inventoryManager_1 = require("../../utils/inventoryManager");
const dataManager_1 = require("../../utils/dataManager");
const TOKEN_TO_SILVER = 50; // 1 Saloon Token = 50 Silver Coins
const GOLD_TO_SILVER = 500; // 1 Gold Bar = 500 Silver Coins
const DIAMOND_TO_SILVER = 43000; // 1 Diamond = 43,000 Silver Coins
exports.default = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("middleman")
        .setDescription("Convert Saloon Tokens and Gold Bars to Silver Coins"),
    async execute(interaction) {
        const userId = interaction.user.id;
        const locale = (0, i18n_1.getLocale)(interaction);
        const inventory = (0, inventoryManager_1.getInventory)(userId);
        const saloonTokens = inventory.items["saloon_token"] || 0;
        const goldBars = inventory.items["gold"] || 0;
        const diamonds = inventory.items["diamond"] || 0;
        const shopUrl = `https://${process.env.REPLIT_DEV_DOMAIN || "sheriff-bot.repl.co"}/shop.html`;
        const tokenEmoji = (0, customEmojis_1.getSaloonTokenEmoji)();
        const silverEmoji = (0, customEmojis_1.getSilverCoinEmoji)();
        const goldEmoji = (0, customEmojis_1.getGoldBarEmoji)();
        const currencyEmoji = (0, customEmojis_1.getCurrencyEmoji)();
        const briefcaseEmoji = (0, customEmojis_1.getBriefcaseEmoji)();
        const statsEmoji = (0, customEmojis_1.getStatsEmoji)();
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(0xffd700)
            .setTitle(`${currencyEmoji} ${(0, i18n_1.t)(interaction, "middleman_title")}`)
            .setImage("https://i.postimg.cc/pXYndQmf/IMG-3259.png")
            .setDescription(`**${(0, i18n_1.t)(interaction, "middleman_welcome")}**\n\n${(0, i18n_1.t)(interaction, "middleman_description")}\n\n**${statsEmoji} ${(0, i18n_1.t)(interaction, "middleman_exchange_rates")}**\n${tokenEmoji} 1 ${locale === "pt-BR" ? "Ficha Saloon" : "Saloon Token"} = **50** ${silverEmoji} ${(0, i18n_1.t)(interaction, "silver_coins")}\n${goldEmoji} 1 ${locale === "pt-BR" ? "Barra de Ouro" : "Gold Bar"} = **500** ${silverEmoji} ${(0, i18n_1.t)(interaction, "silver_coins")}\n💎 1 ${locale === "pt-BR" ? "Diamante" : "Diamond"} = **43,000** ${silverEmoji} ${(0, i18n_1.t)(interaction, "silver_coins")}`)
            .addFields({
            name: `${briefcaseEmoji} ${(0, i18n_1.t)(interaction, "middleman_your_inventory")}`,
            value: `\`\`\`yaml\n${(0, i18n_1.t)(interaction, "middleman_saloon_tokens")}: ${saloonTokens.toLocaleString()}\n${(0, i18n_1.t)(interaction, "middleman_gold_bars")}: ${goldBars.toLocaleString()}\n${locale === "pt-BR" ? "Diamantes" : "Diamonds"}: ${diamonds.toLocaleString()}\n\`\`\``,
            inline: false,
        }, {
            name: `${currencyEmoji} ${(0, i18n_1.t)(interaction, "middleman_how_to_exchange")}`,
            value: `${(0, i18n_1.t)(interaction, "middleman_step1")}\n${(0, i18n_1.t)(interaction, "middleman_step2")}\n${(0, i18n_1.t)(interaction, "middleman_step3")}`,
            inline: false,
        })
            .setFooter({ text: `🤠 ${(0, i18n_1.t)(interaction, "middleman_fair_trades")}` })
            .setTimestamp();
        const buttons = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
            .setCustomId("convert_tokens")
            .setLabel((0, i18n_1.t)(interaction, "middleman_tokens_to_silver"))
            .setStyle(discord_js_1.ButtonStyle.Primary)
            .setDisabled(saloonTokens === 0), new discord_js_1.ButtonBuilder()
            .setCustomId("convert_gold")
            .setLabel((0, i18n_1.t)(interaction, "middleman_gold_to_silver"))
            .setStyle(discord_js_1.ButtonStyle.Success)
            .setDisabled(goldBars === 0), new discord_js_1.ButtonBuilder()
            .setCustomId("convert_diamond")
            .setLabel("💎 → Silver")
            .setStyle(discord_js_1.ButtonStyle.Secondary)
            .setDisabled(diamonds === 0), new discord_js_1.ButtonBuilder()
            .setLabel(`🛒 ${(0, i18n_1.t)(interaction, "middleman_visit_shop")}`)
            .setStyle(discord_js_1.ButtonStyle.Link)
            .setURL(shopUrl));
        await interaction.reply({
            embeds: [embed],
            components: [buttons],
        });
        const response = await interaction.fetchReply();
        const collector = response.createMessageComponentCollector({
            componentType: discord_js_1.ComponentType.Button,
            time: 120000,
        });
        collector.on("collect", async (i) => {
            const cancelEmoji = (0, customEmojis_1.getCancelEmoji)();
            const locale = (0, i18n_1.getLocale)(i);
            if (i.user.id !== userId) {
                return i.reply({
                    content: `${cancelEmoji} ${(0, i18n_1.t)(i, "middleman_not_for_you")}`,
                    flags: discord_js_1.MessageFlags.Ephemeral,
                });
            }
            if (i.customId === "convert_tokens") {
                const currentInventory = (0, inventoryManager_1.getInventory)(userId);
                const currentTokens = currentInventory.items["saloon_token"] || 0;
                if (currentTokens === 0) {
                    return i.reply({
                        content: `${cancelEmoji} ${(0, i18n_1.t)(i, "middleman_no_tokens")}`,
                        flags: discord_js_1.MessageFlags.Ephemeral,
                    });
                }
                const options = [
                    new discord_js_1.StringSelectMenuOptionBuilder()
                        .setLabel(`1 Token → ${TOKEN_TO_SILVER} Silver`)
                        .setValue("1"),
                ];
                if (currentTokens >= 5) {
                    options.push(new discord_js_1.StringSelectMenuOptionBuilder()
                        .setLabel(`5 Tokens → ${TOKEN_TO_SILVER * 5} Silver`)
                        .setValue("5"));
                }
                if (currentTokens >= 10) {
                    options.push(new discord_js_1.StringSelectMenuOptionBuilder()
                        .setLabel(`10 Tokens → ${TOKEN_TO_SILVER * 10} Silver`)
                        .setValue("10"));
                }
                if (currentTokens >= 25) {
                    options.push(new discord_js_1.StringSelectMenuOptionBuilder()
                        .setLabel(`25 Tokens → ${TOKEN_TO_SILVER * 25} Silver`)
                        .setValue("25"));
                }
                options.push(new discord_js_1.StringSelectMenuOptionBuilder()
                    .setLabel(`All (${currentTokens} Tokens) → ${TOKEN_TO_SILVER * currentTokens} Silver`)
                    .setValue("all")
                    .setEmoji((0, customEmojis_1.getMoneybagEmoji)() || "💰"));
                const selectMenu = new discord_js_1.StringSelectMenuBuilder()
                    .setCustomId("token_amount")
                    .setPlaceholder((0, i18n_1.t)(i, "middleman_select_tokens"))
                    .addOptions(...options);
                const selectRow = new discord_js_1.ActionRowBuilder().addComponents(selectMenu);
                await i.reply({
                    content: `**${(0, i18n_1.t)(i, "middleman_select_amount")}**\n${(0, i18n_1.t)(i, "middleman_you_have_tokens")} **${currentTokens}** ${tokenEmoji} ${locale === "pt-BR" ? (0, i18n_1.t)(i, "middleman_tokens") : "Saloon Tokens"}`,
                    components: [selectRow],
                    flags: discord_js_1.MessageFlags.Ephemeral,
                });
                const selectCollector = i.channel?.createMessageComponentCollector({
                    componentType: discord_js_1.ComponentType.StringSelect,
                    time: 60000,
                    filter: (si) => si.user.id === userId && si.customId === "token_amount",
                });
                selectCollector?.on("collect", async (si) => {
                    const amount = si.values[0] === "all" ? currentTokens : parseInt(si.values[0]);
                    const finalInventory = (0, inventoryManager_1.getInventory)(userId);
                    const finalTokens = finalInventory.items["saloon_token"] || 0;
                    const cancelEmoji = (0, customEmojis_1.getCancelEmoji)();
                    const locale = (0, i18n_1.getLocale)(si);
                    if (finalTokens < amount) {
                        return si.update({
                            content: `${cancelEmoji} ${(0, i18n_1.t)(si, "middleman_not_enough_tokens")} ${finalTokens}.`,
                            components: [],
                        });
                    }
                    const removeResult = await (0, inventoryManager_1.removeItem)(userId, "saloon_token", amount);
                    if (!removeResult.success) {
                        return si.update({
                            content: `${cancelEmoji} ${(0, i18n_1.t)(si, "middleman_error")}: ${removeResult.error}`,
                            components: [],
                        });
                    }
                    const silverAmount = amount * TOKEN_TO_SILVER;
                    await (0, dataManager_1.addUserSilver)(userId, silverAmount);
                    const checkEmoji = (0, customEmojis_1.getCheckEmoji)();
                    const successEmbed = new discord_js_1.EmbedBuilder()
                        .setColor(0x00ff00)
                        .setTitle(`${checkEmoji} ${(0, i18n_1.t)(si, "middleman_success_title")}`)
                        .setDescription(`${(0, i18n_1.t)(si, "middleman_converted_tokens")} **${amount}** ${tokenEmoji} ${locale === "pt-BR" ? (amount === 1 ? (0, i18n_1.t)(si, "middleman_token") : (0, i18n_1.t)(si, "middleman_tokens")) : "Saloon Token" + (amount > 1 ? "s" : "")} ${(0, i18n_1.t)(si, "middleman_into")} **${silverAmount.toLocaleString()}** ${silverEmoji} ${(0, i18n_1.t)(si, "silver_coins")}!`)
                        .addFields({
                        name: (0, i18n_1.t)(si, "middleman_tokens_converted"),
                        value: `${amount} ${tokenEmoji}`,
                        inline: true,
                    }, {
                        name: (0, i18n_1.t)(si, "middleman_silver_received"),
                        value: `${silverAmount.toLocaleString()} ${silverEmoji}`,
                        inline: true,
                    })
                        .setFooter({ text: (0, i18n_1.t)(si, "middleman_thanks") })
                        .setTimestamp();
                    await si.update({ embeds: [successEmbed], components: [] });
                });
            }
            else if (i.customId === "convert_gold") {
                const currentInventory = (0, inventoryManager_1.getInventory)(userId);
                const currentGold = currentInventory.items["gold"] || 0;
                if (currentGold === 0) {
                    return i.reply({
                        content: `${cancelEmoji} ${(0, i18n_1.t)(i, "middleman_no_gold")}`,
                        flags: discord_js_1.MessageFlags.Ephemeral,
                    });
                }
                const goldOptions = [
                    new discord_js_1.StringSelectMenuOptionBuilder()
                        .setLabel(`1 Gold Bar → ${GOLD_TO_SILVER} Silver`)
                        .setValue("1"),
                ];
                if (currentGold >= 5) {
                    goldOptions.push(new discord_js_1.StringSelectMenuOptionBuilder()
                        .setLabel(`5 Gold Bars → ${GOLD_TO_SILVER * 5} Silver`)
                        .setValue("5"));
                }
                if (currentGold >= 10) {
                    goldOptions.push(new discord_js_1.StringSelectMenuOptionBuilder()
                        .setLabel(`10 Gold Bars → ${GOLD_TO_SILVER * 10} Silver`)
                        .setValue("10"));
                }
                goldOptions.push(new discord_js_1.StringSelectMenuOptionBuilder()
                    .setLabel(`All (${currentGold} Bars) → ${GOLD_TO_SILVER * currentGold} Silver`)
                    .setValue("all")
                    .setEmoji((0, customEmojis_1.getMoneybagEmoji)() || "💰"));
                const selectMenu = new discord_js_1.StringSelectMenuBuilder()
                    .setCustomId("gold_amount")
                    .setPlaceholder((0, i18n_1.t)(i, "middleman_select_gold"))
                    .addOptions(...goldOptions);
                const selectRow = new discord_js_1.ActionRowBuilder().addComponents(selectMenu);
                await i.reply({
                    content: `**${(0, i18n_1.t)(i, "middleman_select_amount")}**\n${(0, i18n_1.t)(i, "middleman_you_have_gold")} **${currentGold}** ${goldEmoji} ${locale === "pt-BR" ? (currentGold === 1 ? (0, i18n_1.t)(i, "middleman_bar") : (0, i18n_1.t)(i, "middleman_bars")) : "Gold Bar" + (currentGold > 1 ? "s" : "")}`,
                    components: [selectRow],
                    flags: discord_js_1.MessageFlags.Ephemeral,
                });
                const selectCollector = i.channel?.createMessageComponentCollector({
                    componentType: discord_js_1.ComponentType.StringSelect,
                    time: 60000,
                    filter: (si) => si.user.id === userId && si.customId === "gold_amount",
                });
                selectCollector?.on("collect", async (si) => {
                    const amount = si.values[0] === "all" ? currentGold : parseInt(si.values[0]);
                    const finalInventory = (0, inventoryManager_1.getInventory)(userId);
                    const finalGold = finalInventory.items["gold"] || 0;
                    const cancelEmoji = (0, customEmojis_1.getCancelEmoji)();
                    const locale = (0, i18n_1.getLocale)(si);
                    if (finalGold < amount) {
                        return si.update({
                            content: `${cancelEmoji} ${(0, i18n_1.t)(si, "middleman_not_enough_gold")} ${finalGold}.`,
                            components: [],
                        });
                    }
                    const removeResult = await (0, inventoryManager_1.removeItem)(userId, "gold", amount);
                    if (!removeResult.success) {
                        return si.update({
                            content: `${cancelEmoji} ${(0, i18n_1.t)(si, "middleman_error")}: ${removeResult.error}`,
                            components: [],
                        });
                    }
                    const silverAmount = amount * GOLD_TO_SILVER;
                    await (0, dataManager_1.addUserSilver)(userId, silverAmount);
                    const checkEmoji = (0, customEmojis_1.getCheckEmoji)();
                    const successEmbed = new discord_js_1.EmbedBuilder()
                        .setColor(0x00ff00)
                        .setTitle(`${checkEmoji} ${(0, i18n_1.t)(si, "middleman_success_title")}`)
                        .setDescription(`${(0, i18n_1.t)(si, "middleman_converted_gold")} **${amount}** ${goldEmoji} ${locale === "pt-BR" ? (amount === 1 ? (0, i18n_1.t)(si, "middleman_bar") : (0, i18n_1.t)(si, "middleman_bars")) + " de Ouro" : "Gold Bar" + (amount > 1 ? "s" : "")} ${(0, i18n_1.t)(si, "middleman_into")} **${silverAmount.toLocaleString()}** ${silverEmoji} ${(0, i18n_1.t)(si, "silver_coins")}!`)
                        .addFields({
                        name: (0, i18n_1.t)(si, "middleman_gold_converted"),
                        value: `${amount} ${goldEmoji}`,
                        inline: true,
                    }, {
                        name: (0, i18n_1.t)(si, "middleman_silver_received"),
                        value: `${silverAmount.toLocaleString()} ${silverEmoji}`,
                        inline: true,
                    })
                        .setFooter({ text: (0, i18n_1.t)(si, "middleman_thanks") })
                        .setTimestamp();
                    await si.update({ embeds: [successEmbed], components: [] });
                });
            }
            else if (i.customId === "convert_diamond") {
                const currentInventory = (0, inventoryManager_1.getInventory)(userId);
                const currentDiamonds = currentInventory.items["diamond"] || 0;
                if (currentDiamonds === 0) {
                    return i.reply({
                        content: `${cancelEmoji} ${locale === "pt-BR" ? "Você não tem diamantes!" : "You don't have any diamonds!"}`,
                        flags: discord_js_1.MessageFlags.Ephemeral,
                    });
                }
                const diamondOptions = [
                    new discord_js_1.StringSelectMenuOptionBuilder()
                        .setLabel(`1 Diamond → ${DIAMOND_TO_SILVER.toLocaleString()} Silver`)
                        .setValue("1"),
                ];
                if (currentDiamonds >= 5) {
                    diamondOptions.push(new discord_js_1.StringSelectMenuOptionBuilder()
                        .setLabel(`5 Diamonds → ${(DIAMOND_TO_SILVER * 5).toLocaleString()} Silver`)
                        .setValue("5"));
                }
                if (currentDiamonds >= 10) {
                    diamondOptions.push(new discord_js_1.StringSelectMenuOptionBuilder()
                        .setLabel(`10 Diamonds → ${(DIAMOND_TO_SILVER * 10).toLocaleString()} Silver`)
                        .setValue("10"));
                }
                diamondOptions.push(new discord_js_1.StringSelectMenuOptionBuilder()
                    .setLabel(`All (${currentDiamonds} Diamonds) → ${(DIAMOND_TO_SILVER * currentDiamonds).toLocaleString()} Silver`)
                    .setValue("all")
                    .setEmoji((0, customEmojis_1.getMoneybagEmoji)() || "💰"));
                const selectMenu = new discord_js_1.StringSelectMenuBuilder()
                    .setCustomId("diamond_amount")
                    .setPlaceholder(locale === "pt-BR"
                    ? "Selecione quantos diamantes vender"
                    : "Select how many diamonds to sell")
                    .addOptions(...diamondOptions);
                const selectRow = new discord_js_1.ActionRowBuilder().addComponents(selectMenu);
                await i.reply({
                    content: `**${locale === "pt-BR" ? "Selecione a quantidade" : "Select amount"}**\n${locale === "pt-BR" ? "Você tem" : "You have"} **${currentDiamonds}** 💎 ${locale === "pt-BR" ? (currentDiamonds === 1 ? "Diamante" : "Diamantes") : "Diamond" + (currentDiamonds > 1 ? "s" : "")}`,
                    components: [selectRow],
                    flags: discord_js_1.MessageFlags.Ephemeral,
                });
                const selectCollector = i.channel?.createMessageComponentCollector({
                    componentType: discord_js_1.ComponentType.StringSelect,
                    time: 60000,
                    filter: (si) => si.user.id === userId && si.customId === "diamond_amount",
                });
                selectCollector?.on("collect", async (si) => {
                    const amount = si.values[0] === "all" ? currentDiamonds : parseInt(si.values[0]);
                    const finalInventory = (0, inventoryManager_1.getInventory)(userId);
                    const finalDiamonds = finalInventory.items["diamond"] || 0;
                    const cancelEmoji = (0, customEmojis_1.getCancelEmoji)();
                    const locale = (0, i18n_1.getLocale)(si);
                    if (finalDiamonds < amount) {
                        return si.update({
                            content: `${cancelEmoji} ${locale === "pt-BR" ? `Você não tem diamantes suficientes! Você tem apenas ${finalDiamonds}.` : `You don't have enough diamonds! You only have ${finalDiamonds}.`}`,
                            components: [],
                        });
                    }
                    const removeResult = await (0, inventoryManager_1.removeItem)(userId, "diamond", amount);
                    if (!removeResult.success) {
                        return si.update({
                            content: `${cancelEmoji} ${locale === "pt-BR" ? "Erro" : "Error"}: ${removeResult.error}`,
                            components: [],
                        });
                    }
                    const silverAmount = amount * DIAMOND_TO_SILVER;
                    await (0, dataManager_1.addUserSilver)(userId, silverAmount);
                    const checkEmoji = (0, customEmojis_1.getCheckEmoji)();
                    const successEmbed = new discord_js_1.EmbedBuilder()
                        .setColor(0x00ff00)
                        .setTitle(`${checkEmoji} ${locale === "pt-BR" ? "Conversão realizada com sucesso!" : "Conversion successful!"}`)
                        .setDescription(`${locale === "pt-BR" ? "Você converteu" : "You converted"} **${amount}** 💎 ${locale === "pt-BR" ? (amount === 1 ? "Diamante" : "Diamantes") : "Diamond" + (amount > 1 ? "s" : "")} ${locale === "pt-BR" ? "em" : "into"} **${silverAmount.toLocaleString()}** ${silverEmoji} ${(0, i18n_1.t)(si, "silver_coins")}!`)
                        .addFields({
                        name: locale === "pt-BR"
                            ? "Diamantes convertidos"
                            : "Diamonds converted",
                        value: `${amount} 💎`,
                        inline: true,
                    }, {
                        name: locale === "pt-BR" ? "Pratas recebidas" : "Silver received",
                        value: `${silverAmount.toLocaleString()} ${silverEmoji}`,
                        inline: true,
                    })
                        .setFooter({
                        text: locale === "pt-BR"
                            ? "Obrigado por fazer negócio comigo!"
                            : "Thanks for doing business with me!",
                    })
                        .setTimestamp();
                    await si.update({ embeds: [successEmbed], components: [] });
                });
            }
        });
        collector.on("end", () => {
            interaction.editReply({ components: [] }).catch(() => { });
        });
    },
};
//# sourceMappingURL=middleman.js.map