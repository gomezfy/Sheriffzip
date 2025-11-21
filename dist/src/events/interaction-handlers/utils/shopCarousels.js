"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.showBackgroundCarousel = showBackgroundCarousel;
exports.showFrameCarousel = showFrameCarousel;
const discord_js_1 = require("discord.js");
const backgroundManager_1 = require("../../../utils/backgroundManager");
const frameManager_1 = require("../../../utils/frameManager");
const dataManager_1 = require("../../../utils/dataManager");
const inventoryManager_1 = require("../../../utils/inventoryManager");
const customEmojis_1 = require("../../../utils/customEmojis");
const i18n_1 = require("../../../utils/i18n");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
async function showBackgroundCarousel(interaction, index, isUpdate = false) {
    const allBackgrounds = (0, backgroundManager_1.getAllBackgrounds)();
    const bg = allBackgrounds[index];
    const userTokens = (0, dataManager_1.getUserGold)(interaction.user.id);
    const owned = (0, backgroundManager_1.userOwnsBackground)(interaction.user.id, bg.id);
    const saloonEmoji = (0, customEmojis_1.getSaloonTokenEmoji)();
    const embed = new discord_js_1.EmbedBuilder()
        .setColor((0, backgroundManager_1.getRarityColor)(bg.rarity))
        .setTitle((0, i18n_1.tUser)(interaction.user.id, 'bg_shop_title'))
        .setDescription(`**${(0, backgroundManager_1.getRarityEmoji)(bg.rarity)} ${bg.name}** - ${bg.rarity.toUpperCase()}\n\n${bg.description}\n\n**${(0, i18n_1.tUser)(interaction.user.id, 'bg_shop_price')}:** ${bg.free ? (0, i18n_1.tUser)(interaction.user.id, 'bg_shop_free') : `${saloonEmoji} ${bg.price.toLocaleString()} ${(0, i18n_1.tUser)(interaction.user.id, 'bg_shop_tokens')}`}\n**${(0, i18n_1.tUser)(interaction.user.id, 'bg_shop_status')}:** ${owned ? (0, i18n_1.tUser)(interaction.user.id, 'bg_shop_owned') : bg.free ? (0, i18n_1.tUser)(interaction.user.id, 'bg_shop_available') : userTokens >= bg.price ? (0, i18n_1.tUser)(interaction.user.id, 'bg_shop_can_purchase') : (0, i18n_1.tUser)(interaction.user.id, 'bg_shop_not_enough')}\n\n**${(0, i18n_1.tUser)(interaction.user.id, 'bg_shop_your_tokens')}:** ${saloonEmoji} ${userTokens.toLocaleString()}`)
        .setFooter({
        text: (0, i18n_1.tUser)(interaction.user.id, 'bg_shop_footer', {
            current: (index + 1).toString(),
            total: allBackgrounds.length.toString(),
        }),
    })
        .setTimestamp();
    const files = [];
    if (bg.imageUrl) {
        embed.setImage(bg.imageUrl);
    }
    else {
        const backgroundsDir = path_1.default.join(process.cwd(), 'assets', 'profile-backgrounds');
        const bgPath = path_1.default.join(backgroundsDir, bg.filename);
        if (fs_1.default.existsSync(bgPath)) {
            const attachment = new discord_js_1.AttachmentBuilder(bgPath, {
                name: `preview.${bg.filename.split('.').pop()}`,
            });
            files.push(attachment);
            embed.setImage(`attachment://preview.${bg.filename.split('.').pop()}`);
        }
    }
    const row = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId(`carousel_prev_${index}`)
        .setLabel('◀')
        .setStyle(discord_js_1.ButtonStyle.Secondary)
        .setDisabled(index === 0), new discord_js_1.ButtonBuilder()
        .setCustomId(`buy_bg_${bg.id}_${index}`)
        .setLabel(owned
        ? (0, i18n_1.tUser)(interaction.user.id, 'bg_shop_btn_owned')
        : bg.free
            ? (0, i18n_1.tUser)(interaction.user.id, 'bg_shop_btn_claim')
            : 'Comprar')
        .setStyle(owned
        ? discord_js_1.ButtonStyle.Secondary
        : bg.free
            ? discord_js_1.ButtonStyle.Success
            : userTokens >= bg.price
                ? discord_js_1.ButtonStyle.Primary
                : discord_js_1.ButtonStyle.Danger)
        .setDisabled(owned || (bg.free === false && userTokens < bg.price)), new discord_js_1.ButtonBuilder()
        .setCustomId(`carousel_next_${index}`)
        .setLabel('▶')
        .setStyle(discord_js_1.ButtonStyle.Secondary)
        .setDisabled(index === allBackgrounds.length - 1));
    if (isUpdate) {
        await interaction.update({ embeds: [embed], files, components: [row] });
    }
    else {
        await interaction.reply({
            embeds: [embed],
            files,
            components: [row],
            flags: discord_js_1.MessageFlags.Ephemeral,
        });
    }
}
async function showFrameCarousel(interaction, index, isUpdate = false) {
    const allFrames = (0, frameManager_1.getAllFramesTranslated)(interaction.user.id);
    const frame = allFrames[index];
    const inventory = (0, inventoryManager_1.getInventory)(interaction.user.id);
    const userTokens = inventory.items['saloon_token'] || 0;
    const owned = (0, frameManager_1.userOwnsFrame)(interaction.user.id, frame.id);
    const saloonEmoji = (0, customEmojis_1.getSaloonTokenEmoji)();
    const embed = new discord_js_1.EmbedBuilder()
        .setColor((0, frameManager_1.getRarityColor)(frame.rarity))
        .setTitle((0, i18n_1.tUser)(interaction.user.id, 'frame_shop_title'))
        .setDescription(`**${(0, frameManager_1.getRarityEmoji)(frame.rarity)} ${frame.name}** - ${frame.rarity.toUpperCase()}\n\n${frame.description}\n\n**${(0, i18n_1.tUser)(interaction.user.id, 'frame_shop_price')}:** ${saloonEmoji} ${frame.price.toLocaleString()} ${(0, i18n_1.tUser)(interaction.user.id, 'frame_shop_tokens')}\n**${(0, i18n_1.tUser)(interaction.user.id, 'frame_shop_status')}:** ${owned ? (0, i18n_1.tUser)(interaction.user.id, 'frame_shop_owned') : userTokens >= frame.price ? (0, i18n_1.tUser)(interaction.user.id, 'frame_shop_available') : (0, i18n_1.tUser)(interaction.user.id, 'frame_shop_not_enough')}\n\n**${(0, i18n_1.tUser)(interaction.user.id, 'frame_shop_your_tokens')}:** ${saloonEmoji} ${userTokens.toLocaleString()}`)
        .setImage(frame.imageUrl)
        .setFooter({
        text: (0, i18n_1.tUser)(interaction.user.id, 'frame_shop_footer', {
            current: (index + 1).toString(),
            total: allFrames.length.toString(),
        }),
    })
        .setTimestamp();
    const row = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId(`frame_carousel_prev_${index}`)
        .setLabel('◀')
        .setStyle(discord_js_1.ButtonStyle.Secondary)
        .setDisabled(index === 0), new discord_js_1.ButtonBuilder()
        .setCustomId(`buy_frame_${frame.id}_${index}`)
        .setLabel(owned
        ? (0, i18n_1.tUser)(interaction.user.id, 'frame_shop_btn_owned')
        : (0, i18n_1.tUser)(interaction.user.id, 'frame_shop_btn_buy'))
        .setStyle(owned
        ? discord_js_1.ButtonStyle.Secondary
        : userTokens >= frame.price
            ? discord_js_1.ButtonStyle.Success
            : discord_js_1.ButtonStyle.Danger)
        .setDisabled(owned || userTokens < frame.price), new discord_js_1.ButtonBuilder()
        .setCustomId(`frame_carousel_next_${index}`)
        .setLabel('▶')
        .setStyle(discord_js_1.ButtonStyle.Secondary)
        .setDisabled(index === allFrames.length - 1));
    if (isUpdate) {
        await interaction.update({ embeds: [embed], components: [row] });
    }
    else {
        await interaction.reply({
            embeds: [embed],
            components: [row],
            flags: discord_js_1.MessageFlags.Ephemeral,
        });
    }
}
//# sourceMappingURL=shopCarousels.js.map