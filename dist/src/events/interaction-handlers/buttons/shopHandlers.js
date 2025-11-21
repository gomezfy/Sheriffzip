"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleShopBackgrounds = handleShopBackgrounds;
exports.handleShopFrames = handleShopFrames;
exports.handleChangeFrame = handleChangeFrame;
exports.handleCarouselNavigation = handleCarouselNavigation;
exports.handleFrameCarouselNavigation = handleFrameCarouselNavigation;
exports.handleBuyFrame = handleBuyFrame;
exports.handleBuyBackground = handleBuyBackground;
const discord_js_1 = require("discord.js");
const shopCarousels_1 = require("../utils/shopCarousels");
const frameManager_1 = require("../../../utils/frameManager");
const backgroundManager_1 = require("../../../utils/backgroundManager");
const inventoryManager_1 = require("../../../utils/inventoryManager");
const dataManager_1 = require("../../../utils/dataManager");
const customEmojis_1 = require("../../../utils/customEmojis");
async function handleShopBackgrounds(interaction) {
    await (0, shopCarousels_1.showBackgroundCarousel)(interaction, 0);
}
async function handleShopFrames(interaction) {
    await (0, shopCarousels_1.showFrameCarousel)(interaction, 0);
}
async function handleChangeFrame(interaction) {
    const userFramesData = (0, frameManager_1.getUserFrames)(interaction.user.id);
    const ownedFrameIds = userFramesData.ownedFrames;
    if (ownedFrameIds.length === 0) {
        await interaction.reply({
            content: '🖼️ Você não possui nenhuma moldura ainda! Visite a loja de molduras para comprar.',
            flags: discord_js_1.MessageFlags.Ephemeral,
        });
        return;
    }
    const ownedFrames = ownedFrameIds
        .map((id) => (0, frameManager_1.getFrameById)(id))
        .filter((f) => f !== null);
    if (ownedFrames.length === 0) {
        await interaction.reply({
            content: '❌ Erro ao carregar suas molduras.',
            flags: discord_js_1.MessageFlags.Ephemeral,
        });
        return;
    }
    const options = [
        new discord_js_1.StringSelectMenuOptionBuilder()
            .setLabel('Sem Moldura')
            .setDescription('Remover moldura do perfil')
            .setValue('no_frame')
            .setEmoji('❌'),
        ...ownedFrames.map((frame) => new discord_js_1.StringSelectMenuOptionBuilder()
            .setLabel(frame.name)
            .setDescription(frame.description.substring(0, 100))
            .setValue(frame.id)
            .setEmoji((0, frameManager_1.getRarityEmoji)(frame.rarity))),
    ];
    const selectMenu = new discord_js_1.StringSelectMenuBuilder()
        .setCustomId('select_frame')
        .setPlaceholder('Escolha uma moldura...')
        .addOptions(options);
    const row = new discord_js_1.ActionRowBuilder().addComponents(selectMenu);
    const embed = new discord_js_1.EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('🖼️ Selecionar Moldura')
        .setDescription('Escolha uma moldura da sua coleção:')
        .setFooter({ text: 'Seu perfil será atualizado automaticamente' });
    await interaction.reply({
        embeds: [embed],
        components: [row],
        flags: discord_js_1.MessageFlags.Ephemeral,
    });
}
async function handleCarouselNavigation(interaction) {
    const [_, action, indexStr] = interaction.customId.split('_');
    const currentIndex = parseInt(indexStr);
    if (action === 'next' || action === 'prev') {
        const allBackgrounds = (0, backgroundManager_1.getAllBackgrounds)();
        let newIndex = currentIndex;
        if (action === 'next') {
            newIndex = (currentIndex + 1) % allBackgrounds.length;
        }
        else {
            newIndex = currentIndex - 1;
            if (newIndex < 0) {
                newIndex = allBackgrounds.length - 1;
            }
        }
        await (0, shopCarousels_1.showBackgroundCarousel)(interaction, newIndex, true);
    }
}
async function handleFrameCarouselNavigation(interaction) {
    const [_, _carousel, action, indexStr] = interaction.customId.split('_');
    const currentIndex = parseInt(indexStr);
    if (action === 'next' || action === 'prev') {
        const allFrames = (0, frameManager_1.getAllFrames)();
        let newIndex = currentIndex;
        if (action === 'next') {
            newIndex = (currentIndex + 1) % allFrames.length;
        }
        else {
            newIndex = currentIndex - 1;
            if (newIndex < 0) {
                newIndex = allFrames.length - 1;
            }
        }
        await (0, shopCarousels_1.showFrameCarousel)(interaction, newIndex, true);
    }
}
async function handleBuyFrame(interaction) {
    const parts = interaction.customId.split('_');
    const frameId = parts.slice(2, -1).join('_');
    const currentIndex = parseInt(parts[parts.length - 1]);
    const frame = (0, frameManager_1.getFrameById)(frameId);
    if (!frame) {
        await interaction.reply({
            content: '❌ Moldura não encontrada!',
            flags: discord_js_1.MessageFlags.Ephemeral,
        });
        return;
    }
    const inventory = (0, inventoryManager_1.getInventory)(interaction.user.id);
    const userTokens = inventory.items['saloon_token'] || 0;
    if ((0, frameManager_1.userOwnsFrame)(interaction.user.id, frameId)) {
        await interaction.update({
            embeds: [
                new discord_js_1.EmbedBuilder()
                    .setColor('#ED4245')
                    .setTitle('❌ Compra Falhou')
                    .setDescription('Você já possui esta moldura!')
                    .setFooter({ text: 'Retornando para a loja...' }),
            ],
            components: [],
        });
        setTimeout(async () => {
            await (0, shopCarousels_1.showFrameCarousel)(interaction, currentIndex, true);
        }, 2000);
        return;
    }
    if (userTokens < frame.price) {
        await interaction.update({
            embeds: [
                new discord_js_1.EmbedBuilder()
                    .setColor('#ED4245')
                    .setTitle('❌ Tokens Insuficientes')
                    .setDescription(`Você precisa de ${(0, customEmojis_1.getSaloonTokenEmoji)()} ${frame.price.toLocaleString()} Saloon Tokens.\nVocê tem apenas ${(0, customEmojis_1.getSaloonTokenEmoji)()} ${userTokens.toLocaleString()}.`)
                    .setFooter({ text: 'Retornando para a loja...' }),
            ],
            components: [],
        });
        setTimeout(async () => {
            await (0, shopCarousels_1.showFrameCarousel)(interaction, currentIndex, true);
        }, 2000);
        return;
    }
    inventory.items['saloon_token'] = userTokens - frame.price;
    (0, inventoryManager_1.saveInventory)(interaction.user.id, inventory);
    const success = (0, frameManager_1.purchaseFrame)(interaction.user.id, frameId);
    if (success) {
        await interaction.update({
            embeds: [
                new discord_js_1.EmbedBuilder()
                    .setColor('#57F287')
                    .setTitle('✅ Compra Realizada!')
                    .setDescription(`Você comprou a moldura **${frame.name}**!`)
                    .addFields({ name: '🖼️ Moldura', value: frame.name, inline: true }, {
                    name: '💰 Preço',
                    value: `${(0, customEmojis_1.getSaloonTokenEmoji)()} ${frame.price.toLocaleString()}`,
                    inline: true,
                }, {
                    name: '💳 Saldo Restante',
                    value: `${(0, customEmojis_1.getSaloonTokenEmoji)()} ${(userTokens - frame.price).toLocaleString()}`,
                    inline: true,
                })
                    .setImage(frame.imageUrl)
                    .setFooter({ text: 'Retornando para a loja...' }),
            ],
            components: [],
        });
        setTimeout(async () => {
            await (0, shopCarousels_1.showFrameCarousel)(interaction, currentIndex, true);
        }, 3000);
    }
    else {
        await interaction.update({
            embeds: [
                new discord_js_1.EmbedBuilder()
                    .setColor('#ED4245')
                    .setTitle('❌ Erro na Compra')
                    .setDescription('Ocorreu um erro ao processar sua compra.')
                    .setFooter({ text: 'Retornando para a loja...' }),
            ],
            components: [],
        });
        setTimeout(async () => {
            await (0, shopCarousels_1.showFrameCarousel)(interaction, currentIndex, true);
        }, 2000);
    }
}
async function handleBuyBackground(interaction) {
    const parts = interaction.customId.split('_');
    const bgId = parts.slice(2, -1).join('_');
    const currentIndex = parseInt(parts[parts.length - 1]);
    const bg = (0, backgroundManager_1.getBackgroundById)(bgId);
    if (!bg) {
        await interaction.reply({
            content: '❌ Background não encontrado!',
            flags: discord_js_1.MessageFlags.Ephemeral,
        });
        return;
    }
    const userTokens = (0, dataManager_1.getUserGold)(interaction.user.id);
    if ((0, backgroundManager_1.userOwnsBackground)(interaction.user.id, bgId)) {
        await interaction.update({
            embeds: [
                new discord_js_1.EmbedBuilder()
                    .setColor('#ED4245')
                    .setTitle('❌ Compra Falhou')
                    .setDescription('Você já possui este background!')
                    .setFooter({ text: 'Retornando para a loja...' }),
            ],
            components: [],
        });
        setTimeout(async () => {
            await (0, shopCarousels_1.showBackgroundCarousel)(interaction, currentIndex, true);
        }, 2000);
        return;
    }
    if (!bg.free && userTokens < bg.price) {
        await interaction.update({
            embeds: [
                new discord_js_1.EmbedBuilder()
                    .setColor('#ED4245')
                    .setTitle('❌ Tokens Insuficientes')
                    .setDescription(`Você precisa de ${(0, customEmojis_1.getSaloonTokenEmoji)()} ${bg.price.toLocaleString()} tokens.\nVocê tem apenas ${(0, customEmojis_1.getSaloonTokenEmoji)()} ${userTokens.toLocaleString()}.`)
                    .setFooter({ text: 'Retornando para a loja...' }),
            ],
            components: [],
        });
        setTimeout(async () => {
            await (0, shopCarousels_1.showBackgroundCarousel)(interaction, currentIndex, true);
        }, 2000);
        return;
    }
    const result = await (0, backgroundManager_1.purchaseBackground)(interaction.user.id, bgId);
    if (result.success) {
        await interaction.update({
            embeds: [
                new discord_js_1.EmbedBuilder()
                    .setColor('#57F287')
                    .setTitle(bg.free ? '✅ Background Obtido!' : '✅ Compra Realizada!')
                    .setDescription(`Você ${bg.free ? 'obteve' : 'comprou'} o background **${bg.name}**!`)
                    .addFields([
                    { name: '🖼️ Background', value: bg.name, inline: true },
                    bg.free
                        ? { name: '💰 Preço', value: 'Grátis', inline: true }
                        : {
                            name: '💰 Preço',
                            value: `${(0, customEmojis_1.getSaloonTokenEmoji)()} ${bg.price.toLocaleString()}`,
                            inline: true,
                        },
                ])
                    .setFooter({ text: 'Retornando para a loja...' }),
            ],
            components: [],
        });
        setTimeout(async () => {
            await (0, shopCarousels_1.showBackgroundCarousel)(interaction, currentIndex, true);
        }, 3000);
    }
    else {
        await interaction.update({
            embeds: [
                new discord_js_1.EmbedBuilder()
                    .setColor('#ED4245')
                    .setTitle('❌ Erro na Compra')
                    .setDescription('Ocorreu um erro ao processar sua compra.')
                    .setFooter({ text: 'Retornando para a loja...' }),
            ],
            components: [],
        });
        setTimeout(async () => {
            await (0, shopCarousels_1.showBackgroundCarousel)(interaction, currentIndex, true);
        }, 2000);
    }
}
//# sourceMappingURL=shopHandlers.js.map