"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleHunterStoreMeat = handleHunterStoreMeat;
exports.handleHunterStorePelt = handleHunterStorePelt;
exports.handleHunterStoreFish = handleHunterStoreFish;
exports.handleHunterStoreSpecial = handleHunterStoreSpecial;
exports.handleHunterStoreBack = handleHunterStoreBack;
exports.handleHunterStoreConfirm = handleHunterStoreConfirm;
exports.handleHunterStoreSupply = handleHunterStoreSupply;
exports.handleHunterStoreBuyBasicBait = handleHunterStoreBuyBasicBait;
exports.handleHunterStoreBuyPremiumBait = handleHunterStoreBuyPremiumBait;
const discord_js_1 = require("discord.js");
const inventoryManager_1 = require("../../../utils/inventoryManager");
const bankManager_1 = require("../../../utils/bankManager");
const customEmojis_1 = require("../../../utils/customEmojis");
const embeds_1 = require("../../../utils/embeds");
const hunterstore_1 = require("../../../commands/hunting/hunterstore");
function parseCustomEmoji(emojiString) {
    const customEmojiRegex = /<a?:(\w+):(\d+)>/;
    const match = emojiString.match(customEmojiRegex);
    if (match) {
        return {
            id: match[2],
            name: match[1],
        };
    }
    return emojiString;
}
async function handleHunterStoreMeat(interaction) {
    const userId = interaction.user.id;
    if (!interaction.customId.endsWith(userId)) {
        await interaction.reply({
            content: "❌ Este botão não é para você!",
            ephemeral: true,
        });
        return;
    }
    await interaction.deferUpdate();
    const itemsList = hunterstore_1.MEAT_ITEMS.map((item) => {
        const quantity = (0, inventoryManager_1.getItem)(userId, item.id);
        const totalValue = quantity * item.price;
        return {
            ...item,
            quantity,
            totalValue,
        };
    });
    const hasAnyMeat = itemsList.some((item) => item.quantity > 0);
    const meatEmbed = new discord_js_1.EmbedBuilder()
        .setColor("#d4af37")
        .setTitle(`🥩 Hunter's Store - Carnes`)
        .setDescription(`Preços de compra para **carnes de caça**:\n\n` +
        itemsList
            .map((item) => `${item.emoji} **${item.name}** (${item.rarity})\n` +
            `├ Preço: ${(0, customEmojis_1.getEmoji)("coin")} **${item.price.toLocaleString()}** moedas/unidade\n` +
            `└ Você tem: **${item.quantity}x** ${item.quantity > 0 ? `(Total: ${(0, customEmojis_1.getEmoji)("coin")} ${item.totalValue.toLocaleString()})` : ""}\n`)
            .join("\n") +
        `\n${hasAnyMeat ? "Selecione o que deseja vender:" : "❌ Você não possui carnes para vender!"}`)
        .setFooter({ text: "Venda suas carnes por moedas de prata!" })
        .setTimestamp();
    if (!hasAnyMeat) {
        const backButton = new discord_js_1.ButtonBuilder()
            .setCustomId(`hunterstore_back_${userId}`)
            .setLabel("Voltar")
            .setStyle(discord_js_1.ButtonStyle.Secondary)
            .setEmoji("◀️");
        const row = new discord_js_1.ActionRowBuilder().addComponents(backButton);
        await interaction.editReply({
            embeds: [meatEmbed],
            components: [row],
        });
        return;
    }
    const options = itemsList
        .filter((item) => item.quantity > 0)
        .map((item) => ({
        label: `${item.name} (${item.quantity}x)`,
        description: `Vender por ${item.price} moedas cada | Total: ${item.totalValue.toLocaleString()} moedas`,
        value: item.id,
        emoji: parseCustomEmoji(item.emoji),
    }));
    const selectMenu = new discord_js_1.StringSelectMenuBuilder()
        .setCustomId(`hunterstore_sell_${userId}`)
        .setPlaceholder("Escolha um item para vender...")
        .addOptions(options);
    const backButton = new discord_js_1.ButtonBuilder()
        .setCustomId(`hunterstore_back_${userId}`)
        .setLabel("Voltar")
        .setStyle(discord_js_1.ButtonStyle.Secondary)
        .setEmoji("◀️");
    const selectRow = new discord_js_1.ActionRowBuilder().addComponents(selectMenu);
    const buttonRow = new discord_js_1.ActionRowBuilder().addComponents(backButton);
    await interaction.editReply({
        embeds: [meatEmbed],
        components: [selectRow, buttonRow],
    });
}
async function handleHunterStorePelt(interaction) {
    const userId = interaction.user.id;
    if (!interaction.customId.endsWith(userId)) {
        await interaction.reply({
            content: "❌ Este botão não é para você!",
            ephemeral: true,
        });
        return;
    }
    await interaction.deferUpdate();
    const itemsList = hunterstore_1.PELT_ITEMS.map((item) => {
        const quantity = (0, inventoryManager_1.getItem)(userId, item.id);
        const totalValue = quantity * item.price;
        return {
            ...item,
            quantity,
            totalValue,
        };
    });
    const hasAnyPelt = itemsList.some((item) => item.quantity > 0);
    const peltEmbed = new discord_js_1.EmbedBuilder()
        .setColor("#d4af37")
        .setTitle(`${(0, customEmojis_1.getEmoji)("deer_pelt")} Hunter's Store - Peles`)
        .setDescription(`Preços de compra para **peles de caça**:\n\n` +
        itemsList
            .map((item) => `${item.emoji} **${item.name}** (${item.rarity})\n` +
            `├ Preço: ${(0, customEmojis_1.getEmoji)("coin")} **${item.price.toLocaleString()}** moedas/unidade\n` +
            `└ Você tem: **${item.quantity}x** ${item.quantity > 0 ? `(Total: ${(0, customEmojis_1.getEmoji)("coin")} ${item.totalValue.toLocaleString()})` : ""}\n`)
            .join("\n") +
        `\n${hasAnyPelt ? "Selecione o que deseja vender:" : "❌ Você não possui peles para vender!"}`)
        .setFooter({ text: "Venda suas peles por moedas de prata!" })
        .setTimestamp();
    if (!hasAnyPelt) {
        const backButton = new discord_js_1.ButtonBuilder()
            .setCustomId(`hunterstore_back_${userId}`)
            .setLabel("Voltar")
            .setStyle(discord_js_1.ButtonStyle.Secondary)
            .setEmoji("◀️");
        const row = new discord_js_1.ActionRowBuilder().addComponents(backButton);
        await interaction.editReply({
            embeds: [peltEmbed],
            components: [row],
        });
        return;
    }
    const options = itemsList
        .filter((item) => item.quantity > 0)
        .map((item) => ({
        label: `${item.name} (${item.quantity}x)`,
        description: `Vender por ${item.price} moedas cada | Total: ${item.totalValue.toLocaleString()} moedas`,
        value: item.id,
        emoji: parseCustomEmoji(item.emoji),
    }));
    const selectMenu = new discord_js_1.StringSelectMenuBuilder()
        .setCustomId(`hunterstore_sell_${userId}`)
        .setPlaceholder("Escolha um item para vender...")
        .addOptions(options);
    const backButton = new discord_js_1.ButtonBuilder()
        .setCustomId(`hunterstore_back_${userId}`)
        .setLabel("Voltar")
        .setStyle(discord_js_1.ButtonStyle.Secondary)
        .setEmoji("◀️");
    const selectRow = new discord_js_1.ActionRowBuilder().addComponents(selectMenu);
    const buttonRow = new discord_js_1.ActionRowBuilder().addComponents(backButton);
    await interaction.editReply({
        embeds: [peltEmbed],
        components: [selectRow, buttonRow],
    });
}
async function handleHunterStoreFish(interaction) {
    const userId = interaction.user.id;
    if (!interaction.customId.endsWith(userId)) {
        await interaction.reply({
            content: "❌ Este botão não é para você!",
            ephemeral: true,
        });
        return;
    }
    await interaction.deferUpdate();
    const itemsList = hunterstore_1.FISH_ITEMS.map((item) => {
        const quantity = (0, inventoryManager_1.getItem)(userId, item.id);
        const totalValue = quantity * item.price;
        return {
            ...item,
            quantity,
            totalValue,
        };
    });
    const hasAnyFish = itemsList.some((item) => item.quantity > 0);
    const fishEmbed = new discord_js_1.EmbedBuilder()
        .setColor("#d4af37")
        .setTitle(`🐟 Hunter's Store - Peixes`)
        .setDescription(`Preços de compra para **peixes frescos**:\n\n` +
        itemsList
            .map((item) => `${item.emoji} **${item.name}** (${item.rarity})\n` +
            `├ Preço: ${(0, customEmojis_1.getEmoji)("coin")} **${item.price.toLocaleString()}** moedas/unidade\n` +
            `└ Você tem: **${item.quantity}x** ${item.quantity > 0 ? `(Total: ${(0, customEmojis_1.getEmoji)("coin")} ${item.totalValue.toLocaleString()})` : ""}\n`)
            .join("\n") +
        `\n${hasAnyFish ? "Selecione o que deseja vender:" : "❌ Você não possui peixes para vender!"}`)
        .setFooter({ text: "Venda seus peixes por moedas de prata!" })
        .setTimestamp();
    if (!hasAnyFish) {
        const backButton = new discord_js_1.ButtonBuilder()
            .setCustomId(`hunterstore_back_${userId}`)
            .setLabel("Voltar")
            .setStyle(discord_js_1.ButtonStyle.Secondary)
            .setEmoji("◀️");
        const row = new discord_js_1.ActionRowBuilder().addComponents(backButton);
        await interaction.editReply({
            embeds: [fishEmbed],
            components: [row],
        });
        return;
    }
    const options = itemsList
        .filter((item) => item.quantity > 0)
        .map((item) => ({
        label: `${item.name} (${item.quantity}x)`,
        description: `Vender por ${item.price} moedas cada | Total: ${item.totalValue.toLocaleString()} moedas`,
        value: item.id,
        emoji: parseCustomEmoji(item.emoji),
    }));
    const selectMenu = new discord_js_1.StringSelectMenuBuilder()
        .setCustomId(`hunterstore_sell_${userId}`)
        .setPlaceholder("Escolha um item para vender...")
        .addOptions(options);
    const backButton = new discord_js_1.ButtonBuilder()
        .setCustomId(`hunterstore_back_${userId}`)
        .setLabel("Voltar")
        .setStyle(discord_js_1.ButtonStyle.Secondary)
        .setEmoji("◀️");
    const selectRow = new discord_js_1.ActionRowBuilder().addComponents(selectMenu);
    const buttonRow = new discord_js_1.ActionRowBuilder().addComponents(backButton);
    await interaction.editReply({
        embeds: [fishEmbed],
        components: [selectRow, buttonRow],
    });
}
async function handleHunterStoreSpecial(interaction) {
    const userId = interaction.user.id;
    if (!interaction.customId.endsWith(userId)) {
        await interaction.reply({
            content: "❌ Este botão não é para você!",
            ephemeral: true,
        });
        return;
    }
    await interaction.deferUpdate();
    const itemsList = hunterstore_1.SPECIAL_ITEMS.map((item) => {
        const quantity = (0, inventoryManager_1.getItem)(userId, item.id);
        const totalValue = quantity * item.price;
        return {
            ...item,
            quantity,
            totalValue,
        };
    });
    const hasAnySpecial = itemsList.some((item) => item.quantity > 0);
    const specialEmbed = new discord_js_1.EmbedBuilder()
        .setColor("#d4af37")
        .setTitle(`🪶 Hunter's Store - Penas Raras`)
        .setDescription(`Preços de compra para **itens especiais**:\n\n` +
        itemsList
            .map((item) => `${item.emoji} **${item.name}** (${item.rarity})\n` +
            `├ Preço: ${(0, customEmojis_1.getEmoji)("coin")} **${item.price.toLocaleString()}** moedas/unidade\n` +
            `└ Você tem: **${item.quantity}x** ${item.quantity > 0 ? `(Total: ${(0, customEmojis_1.getEmoji)("coin")} ${item.totalValue.toLocaleString()})` : ""}\n`)
            .join("\n") +
        `\n${hasAnySpecial ? "Selecione o que deseja vender:" : "❌ Você não possui penas raras para vender!"}`)
        .setFooter({ text: "Venda suas penas raras por moedas de prata!" })
        .setTimestamp();
    if (!hasAnySpecial) {
        const backButton = new discord_js_1.ButtonBuilder()
            .setCustomId(`hunterstore_back_${userId}`)
            .setLabel("Voltar")
            .setStyle(discord_js_1.ButtonStyle.Secondary)
            .setEmoji("◀️");
        const row = new discord_js_1.ActionRowBuilder().addComponents(backButton);
        await interaction.editReply({
            embeds: [specialEmbed],
            components: [row],
        });
        return;
    }
    const options = itemsList
        .filter((item) => item.quantity > 0)
        .map((item) => ({
        label: `${item.name} (${item.quantity}x)`,
        description: `Vender por ${item.price} moedas cada | Total: ${item.totalValue.toLocaleString()} moedas`,
        value: item.id,
        emoji: parseCustomEmoji(item.emoji),
    }));
    const selectMenu = new discord_js_1.StringSelectMenuBuilder()
        .setCustomId(`hunterstore_sell_${userId}`)
        .setPlaceholder("Escolha um item para vender...")
        .addOptions(options);
    const backButton = new discord_js_1.ButtonBuilder()
        .setCustomId(`hunterstore_back_${userId}`)
        .setLabel("Voltar")
        .setStyle(discord_js_1.ButtonStyle.Secondary)
        .setEmoji("◀️");
    const selectRow = new discord_js_1.ActionRowBuilder().addComponents(selectMenu);
    const buttonRow = new discord_js_1.ActionRowBuilder().addComponents(backButton);
    await interaction.editReply({
        embeds: [specialEmbed],
        components: [selectRow, buttonRow],
    });
}
async function handleHunterStoreBack(interaction) {
    const userId = interaction.user.id;
    if (!interaction.customId.endsWith(userId)) {
        await interaction.reply({
            content: "❌ Este botão não é para você!",
            ephemeral: true,
        });
        return;
    }
    await interaction.deferUpdate();
    const mainEmbed = new discord_js_1.EmbedBuilder()
        .setColor("#d4af37")
        .setTitle(`${(0, customEmojis_1.getEmoji)("shop")} Hunter's Store - Loja do Caçador`)
        .setDescription(`Bem-vindo à **Hunter's Store**, ${interaction.user.username}!\n\n` +
        `Compramos suas carnes, peles e peixes pelos melhores preços do velho oeste!\n` +
        `Também vendemos suprimentos essenciais para caça e pesca!\n\n` +
        `${(0, customEmojis_1.getEmoji)("gift")} **Vendemos (você vende para nós):**\n` +
        `🍖 **Carnes** - De coelho a urso\n` +
        `${(0, customEmojis_1.getEmoji)("rabbit_pelt")} **Peles** - Valiosas peles de animais\n` +
        `${(0, customEmojis_1.getEmoji)("catfish")} **Peixes** - Do bagre ao peixe mítico\n` +
        `${(0, customEmojis_1.getEmoji)("eagle_feather")} **Penas Raras** - Penas de águia dourada\n\n` +
        `${(0, customEmojis_1.getEmoji)("shop")} **Compramos (você compra de nós):**\n` +
        `${(0, customEmojis_1.getEmoji)("basic_bait")} **Suprimentos** - Iscas para pesca\n\n` +
        `${(0, customEmojis_1.getEmoji)("coin")} Todos os pagamentos são feitos em **moedas de prata**!\n\n` +
        `Selecione uma categoria abaixo:`)
        .setImage("https://i.postimg.cc/BQ11FPd3/IMG-3478.png")
        .setFooter({ text: "Escolha uma categoria" })
        .setTimestamp();
    const selectMenu = new discord_js_1.StringSelectMenuBuilder()
        .setCustomId(`hunterstore_menu_${userId}`)
        .setPlaceholder("Selecione uma categoria")
        .addOptions({
        label: "Vender Carnes",
        description: "Venda suas carnes de caça por moedas de prata",
        value: `hunterstore_meat_${userId}`,
        emoji: "🥩",
    }, {
        label: "Vender Peles",
        description: "Venda peles valiosas de animais",
        value: `hunterstore_pelt_${userId}`,
        emoji: parseCustomEmoji((0, customEmojis_1.getEmoji)("deer_pelt")),
    }, {
        label: "Vender Peixes",
        description: "Venda seus peixes capturados",
        value: `hunterstore_fish_${userId}`,
        emoji: parseCustomEmoji((0, customEmojis_1.getEmoji)("catfish")),
    }, {
        label: "Vender Penas",
        description: "Venda penas raras de águia",
        value: `hunterstore_special_${userId}`,
        emoji: parseCustomEmoji((0, customEmojis_1.getEmoji)("eagle_feather")),
    }, {
        label: "Comprar Suprimentos",
        description: "Compre iscas para pesca",
        value: `hunterstore_supply_${userId}`,
        emoji: parseCustomEmoji((0, customEmojis_1.getEmoji)("basic_bait")),
    });
    const row = new discord_js_1.ActionRowBuilder().addComponents(selectMenu);
    await interaction.editReply({
        embeds: [mainEmbed],
        components: [row],
    });
}
async function handleHunterStoreConfirm(interaction) {
    const customIdParts = interaction.customId.split("_");
    const userId = customIdParts[customIdParts.length - 1];
    const isBuy = customIdParts.includes("buy");
    const itemId = isBuy
        ? customIdParts.slice(3, customIdParts.length - 1).join("_")
        : customIdParts.slice(2, customIdParts.length - 1).join("_");
    if (interaction.user.id !== userId) {
        await interaction.reply({
            content: "❌ Este botão não é para você!",
            ephemeral: true,
        });
        return;
    }
    await interaction.deferUpdate();
    if (isBuy) {
        const selectedItem = hunterstore_1.SUPPLY_ITEMS.find((item) => item.id === itemId);
        if (!selectedItem) {
            await interaction.editReply({
                content: "❌ Item não encontrado!",
                components: [],
            });
            return;
        }
        const userSilver = (0, inventoryManager_1.getItem)(userId, "silver");
        if (userSilver < selectedItem.price) {
            const noMoneyEmbed = (0, embeds_1.warningEmbed)("❌ Moedas Insuficientes", `Você não tem moedas suficientes para comprar **${selectedItem.name}**!\n\n` +
                `Custo: ${(0, customEmojis_1.getEmoji)("coin")} **${selectedItem.price.toLocaleString()}** moedas\n` +
                `Seu saldo: ${(0, customEmojis_1.getEmoji)("coin")} **${userSilver.toLocaleString()}** moedas\n` +
                `Faltam: ${(0, customEmojis_1.getEmoji)("coin")} **${(selectedItem.price - userSilver).toLocaleString()}** moedas`, "Venda itens para conseguir mais moedas!");
            await interaction.editReply({
                embeds: [noMoneyEmbed],
                components: [],
            });
            return;
        }
        await (0, inventoryManager_1.removeItem)(userId, "silver", selectedItem.price);
        await (0, inventoryManager_1.addItem)(userId, itemId, 1);
        const successEmbed = new discord_js_1.EmbedBuilder()
            .setColor("#10b981")
            .setTitle(`${(0, customEmojis_1.getEmoji)("check")} Compra Realizada com Sucesso!`)
            .setDescription(`Você comprou na **Hunter's Store**!\n\n` +
            `${selectedItem.emoji} **${selectedItem.name}**\n` +
            `├ Quantidade: **1x**\n` +
            `└ Preço: ${(0, customEmojis_1.getEmoji)("coin")} **${selectedItem.price.toLocaleString()}** moedas de prata\n\n` +
            `${(0, customEmojis_1.getEmoji)("coin")} Saldo restante: **${(userSilver - selectedItem.price).toLocaleString()}** moedas\n\n` +
            `🎣 Use \`/fish\` para pescar!`)
            .setFooter({ text: "Hunter's Store - Suprimentos de qualidade!" })
            .setTimestamp();
        const backButton = new discord_js_1.ButtonBuilder()
            .setCustomId(`hunterstore_back_${userId}`)
            .setLabel("Voltar ao Menu")
            .setStyle(discord_js_1.ButtonStyle.Primary)
            .setEmoji("🏪");
        const row = new discord_js_1.ActionRowBuilder().addComponents(backButton);
        await interaction.editReply({
            embeds: [successEmbed],
            components: [row],
        });
        return;
    }
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
        const noItemEmbed = (0, embeds_1.warningEmbed)("❌ Item Não Encontrado", `Você não possui **${selectedItem.name}** no inventário!`, "Vá caçar para obter mais itens");
        await interaction.editReply({
            embeds: [noItemEmbed],
            components: [],
        });
        return;
    }
    const totalValue = quantity * selectedItem.price;
    await (0, inventoryManager_1.removeItem)(userId, itemId, quantity);
    await (0, bankManager_1.depositSilver)(userId, totalValue);
    const successEmbed = new discord_js_1.EmbedBuilder()
        .setColor("#10b981")
        .setTitle(`${(0, customEmojis_1.getEmoji)("check")} Venda Realizada com Sucesso!`)
        .setDescription(`Você vendeu seus itens para a **Hunter's Store**!\n\n` +
        `${selectedItem.emoji} **${selectedItem.name}**\n` +
        `├ Quantidade vendida: **${quantity}x**\n` +
        `├ Preço unitário: ${(0, customEmojis_1.getEmoji)("coin")} **${selectedItem.price.toLocaleString()}** moedas\n` +
        `└ Total recebido: ${(0, customEmojis_1.getEmoji)("coin")} **${totalValue.toLocaleString()}** moedas de prata\n\n` +
        `${(0, customEmojis_1.getEmoji)("coin")} As moedas foram adicionadas à sua conta!\n\n` +
        `Obrigado por negociar conosco, parceiro!`)
        .setFooter({ text: "Hunter's Store - Os melhores preços do velho oeste!" })
        .setTimestamp();
    const backButton = new discord_js_1.ButtonBuilder()
        .setCustomId(`hunterstore_back_${userId}`)
        .setLabel("Vender Mais Itens")
        .setStyle(discord_js_1.ButtonStyle.Primary)
        .setEmoji("🏪");
    const row = new discord_js_1.ActionRowBuilder().addComponents(backButton);
    await interaction.editReply({
        embeds: [successEmbed],
        components: [row],
    });
}
async function handleHunterStoreSupply(interaction) {
    const userId = interaction.user.id;
    if (!interaction.customId.endsWith(userId)) {
        await interaction.reply({
            content: "❌ Este botão não é para você!",
            ephemeral: true,
        });
        return;
    }
    await interaction.deferUpdate();
    const userSilver = (0, inventoryManager_1.getItem)(userId, "silver");
    const supplyEmbed = new discord_js_1.EmbedBuilder()
        .setColor("#d4af37")
        .setTitle(`🪱 Hunter's Store - Suprimentos`)
        .setDescription(`Compre suprimentos essenciais para suas aventuras!\n\n` +
        `${(0, customEmojis_1.getEmoji)("coin")} **Seu saldo:** ${userSilver.toLocaleString()} moedas de prata\n\n` +
        `**Iscas disponíveis:**\n\n` +
        `🪱 **Isca Básica** (COMUM)\n` +
        `├ Preço: ${(0, customEmojis_1.getEmoji)("coin")} **5** moedas/unidade\n` +
        `├ Efeito: Pesca peixes comuns e incomuns\n` +
        `└ Pacote de 10: **50 moedas**\n\n` +
        `🦗 **Isca Premium** (INCOMUM)\n` +
        `├ Preço: ${(0, customEmojis_1.getEmoji)("coin")} **12** moedas/unidade\n` +
        `├ Efeito: ⭐ Aumenta chance de peixes raros, épicos e lendários!\n` +
        `└ Pacote de 10: **120 moedas**\n\n` +
        `Escolha qual isca deseja comprar:`)
        .setFooter({ text: "Iscas melhores = Peixes melhores!" })
        .setTimestamp();
    const basicBaitButton = new discord_js_1.ButtonBuilder()
        .setCustomId(`hunterstore_buy_basic_bait_${userId}`)
        .setLabel(`10x Isca Básica (50 moedas)`)
        .setStyle(discord_js_1.ButtonStyle.Primary)
        .setEmoji("🪱");
    const premiumBaitButton = new discord_js_1.ButtonBuilder()
        .setCustomId(`hunterstore_buy_premium_bait_${userId}`)
        .setLabel(`10x Isca Premium (120 moedas)`)
        .setStyle(discord_js_1.ButtonStyle.Success)
        .setEmoji("🦗");
    const backButton = new discord_js_1.ButtonBuilder()
        .setCustomId(`hunterstore_back_${userId}`)
        .setLabel("Voltar")
        .setStyle(discord_js_1.ButtonStyle.Secondary)
        .setEmoji("◀️");
    const row = new discord_js_1.ActionRowBuilder().addComponents(basicBaitButton, premiumBaitButton, backButton);
    await interaction.editReply({
        embeds: [supplyEmbed],
        components: [row],
    });
}
async function handleHunterStoreBuyBasicBait(interaction) {
    const userId = interaction.customId.split("_").pop();
    if (interaction.user.id !== userId) {
        await interaction.reply({
            content: "❌ Este botão não é para você!",
            ephemeral: true,
        });
        return;
    }
    await interaction.deferUpdate();
    const quantity = 10;
    const pricePerUnit = 5;
    const totalCost = pricePerUnit * quantity;
    const userSilver = (0, inventoryManager_1.getItem)(userId, "silver");
    if (userSilver < totalCost) {
        const noMoneyEmbed = (0, embeds_1.warningEmbed)("❌ Moedas Insuficientes", `Você não tem moedas suficientes para comprar **${quantity}x Isca Básica**!\n\n` +
            `Custo total: ${(0, customEmojis_1.getEmoji)("coin")} **${totalCost.toLocaleString()}** moedas\n` +
            `Seu saldo: ${(0, customEmojis_1.getEmoji)("coin")} **${userSilver.toLocaleString()}** moedas\n` +
            `Faltam: ${(0, customEmojis_1.getEmoji)("coin")} **${(totalCost - userSilver).toLocaleString()}** moedas`, "Venda itens para conseguir mais moedas!");
        await interaction.editReply({
            embeds: [noMoneyEmbed],
            components: [],
        });
        return;
    }
    await (0, inventoryManager_1.removeItem)(userId, "silver", totalCost);
    await (0, inventoryManager_1.addItem)(userId, "basic_bait", quantity);
    const successEmbed = new discord_js_1.EmbedBuilder()
        .setColor("#10b981")
        .setTitle(`${(0, customEmojis_1.getEmoji)("check")} Compra Realizada com Sucesso!`)
        .setDescription(`Você comprou suprimentos na **Hunter's Store**!\n\n` +
        `🪱 **Isca Básica**\n` +
        `├ Quantidade comprada: **${quantity}x**\n` +
        `├ Preço unitário: ${(0, customEmojis_1.getEmoji)("coin")} **${pricePerUnit}** moedas\n` +
        `└ Total pago: ${(0, customEmojis_1.getEmoji)("coin")} **${totalCost.toLocaleString()}** moedas de prata\n\n` +
        `${(0, customEmojis_1.getEmoji)("coin")} Saldo restante: **${(userSilver - totalCost).toLocaleString()}** moedas\n\n` +
        `🎣 Agora você pode pescar com \`/fish\`!`)
        .setFooter({ text: "Hunter's Store - Suprimentos de qualidade!" })
        .setTimestamp();
    const buyMoreButton = new discord_js_1.ButtonBuilder()
        .setCustomId(`hunterstore_buy_basic_bait_${userId}`)
        .setLabel(`Comprar Mais (${totalCost} moedas)`)
        .setStyle(discord_js_1.ButtonStyle.Success)
        .setEmoji("🪱");
    const backButton = new discord_js_1.ButtonBuilder()
        .setCustomId(`hunterstore_back_${userId}`)
        .setLabel("Voltar ao Menu")
        .setStyle(discord_js_1.ButtonStyle.Primary)
        .setEmoji("🏪");
    const row = new discord_js_1.ActionRowBuilder().addComponents(buyMoreButton, backButton);
    await interaction.editReply({
        embeds: [successEmbed],
        components: [row],
    });
}
async function handleHunterStoreBuyPremiumBait(interaction) {
    const userId = interaction.customId.split("_").pop();
    if (interaction.user.id !== userId) {
        await interaction.reply({
            content: "❌ Este botão não é para você!",
            ephemeral: true,
        });
        return;
    }
    await interaction.deferUpdate();
    const quantity = 10;
    const pricePerUnit = 12;
    const totalCost = pricePerUnit * quantity;
    const userSilver = (0, inventoryManager_1.getItem)(userId, "silver");
    if (userSilver < totalCost) {
        const noMoneyEmbed = (0, embeds_1.warningEmbed)("❌ Moedas Insuficientes", `Você não tem moedas suficientes para comprar **${quantity}x Isca Premium**!\n\n` +
            `Custo total: ${(0, customEmojis_1.getEmoji)("coin")} **${totalCost.toLocaleString()}** moedas\n` +
            `Seu saldo: ${(0, customEmojis_1.getEmoji)("coin")} **${userSilver.toLocaleString()}** moedas\n` +
            `Faltam: ${(0, customEmojis_1.getEmoji)("coin")} **${(totalCost - userSilver).toLocaleString()}** moedas`, "Venda itens para conseguir mais moedas!");
        await interaction.editReply({
            embeds: [noMoneyEmbed],
            components: [],
        });
        return;
    }
    await (0, inventoryManager_1.removeItem)(userId, "silver", totalCost);
    await (0, inventoryManager_1.addItem)(userId, "premium_bait", quantity);
    const successEmbed = new discord_js_1.EmbedBuilder()
        .setColor("#10b981")
        .setTitle(`${(0, customEmojis_1.getEmoji)("check")} Compra Realizada com Sucesso!`)
        .setDescription(`Você comprou suprimentos na **Hunter's Store**!\n\n` +
        `🦗 **Isca Premium**\n` +
        `├ Quantidade comprada: **${quantity}x**\n` +
        `├ Preço unitário: ${(0, customEmojis_1.getEmoji)("coin")} **${pricePerUnit}** moedas\n` +
        `└ Total pago: ${(0, customEmojis_1.getEmoji)("coin")} **${totalCost.toLocaleString()}** moedas de prata\n\n` +
        `${(0, customEmojis_1.getEmoji)("coin")} Saldo restante: **${(userSilver - totalCost).toLocaleString()}** moedas\n\n` +
        `⭐ **Isca Premium aumenta muito a chance de peixes raros!**\n` +
        `🎣 Use \`/fish\` para começar a pescar!`)
        .setFooter({ text: "Hunter's Store - Suprimentos premium para pescadores exigentes!" })
        .setTimestamp();
    const buyMoreButton = new discord_js_1.ButtonBuilder()
        .setCustomId(`hunterstore_buy_premium_bait_${userId}`)
        .setLabel(`Comprar Mais (${totalCost} moedas)`)
        .setStyle(discord_js_1.ButtonStyle.Success)
        .setEmoji("🦗");
    const backButton = new discord_js_1.ButtonBuilder()
        .setCustomId(`hunterstore_back_${userId}`)
        .setLabel("Voltar ao Menu")
        .setStyle(discord_js_1.ButtonStyle.Primary)
        .setEmoji("🏪");
    const row = new discord_js_1.ActionRowBuilder().addComponents(buyMoreButton, backButton);
    await interaction.editReply({
        embeds: [successEmbed],
        components: [row],
    });
}
//# sourceMappingURL=hunterStoreHandlers.js.map