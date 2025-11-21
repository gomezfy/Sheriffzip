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
exports.handleEditBio = handleEditBio;
exports.handleEditPhrase = handleEditPhrase;
exports.handleChangeBackground = handleChangeBackground;
exports.handleProfileShowPublic = handleProfileShowPublic;
exports.handleChangeColors = handleChangeColors;
const discord_js_1 = require("discord.js");
const backgroundManager_1 = require("../../../utils/backgroundManager");
const profile_1 = require("../../../commands/profile/profile");
const profileColorThemes_1 = require("../../../utils/profileColorThemes");
const i18n_1 = require("../../../utils/i18n");
async function handleEditBio(interaction) {
    const modal = new discord_js_1.ModalBuilder()
        .setCustomId('bio_modal')
        .setTitle('Edit Your Bio');
    const bioInput = new discord_js_1.TextInputBuilder()
        .setCustomId('bio_text')
        .setLabel('About Me (max 200 characters)')
        .setStyle(discord_js_1.TextInputStyle.Paragraph)
        .setPlaceholder('A mysterious cowboy wandering the Wild West...')
        .setMaxLength(200)
        .setRequired(true);
    const firstActionRow = new discord_js_1.ActionRowBuilder().addComponents(bioInput);
    modal.addComponents(firstActionRow);
    await interaction.showModal(modal);
}
async function handleEditPhrase(interaction) {
    const modal = new discord_js_1.ModalBuilder()
        .setCustomId('phrase_modal')
        .setTitle('Editar Frase do Perfil');
    const phraseInput = new discord_js_1.TextInputBuilder()
        .setCustomId('phrase_text')
        .setLabel('Sua frase pessoal (max 100 caracteres)')
        .setStyle(discord_js_1.TextInputStyle.Short)
        .setPlaceholder('Ex: O corajoso não teme o desafio...')
        .setMaxLength(100)
        .setRequired(false);
    const firstActionRow = new discord_js_1.ActionRowBuilder().addComponents(phraseInput);
    modal.addComponents(firstActionRow);
    await interaction.showModal(modal);
}
async function handleChangeBackground(interaction) {
    const ownedBackgrounds = (0, backgroundManager_1.getUserBackgrounds)(interaction.user.id);
    if (ownedBackgrounds.length === 0) {
        await interaction.reply({
            content: '❌ You don\'t own any backgrounds! Click "🛒 Shop Backgrounds" to purchase some.',
            flags: discord_js_1.MessageFlags.Ephemeral,
        });
        return;
    }
    const selectMenu = new discord_js_1.StringSelectMenuBuilder()
        .setCustomId('select_background')
        .setPlaceholder('Choose a background...')
        .addOptions(ownedBackgrounds.map((bg) => new discord_js_1.StringSelectMenuOptionBuilder()
        .setLabel(bg.name)
        .setDescription(bg.description.substring(0, 100))
        .setValue(bg.id)
        .setEmoji((0, backgroundManager_1.getRarityEmoji)(bg.rarity))));
    const row = new discord_js_1.ActionRowBuilder().addComponents(selectMenu);
    await interaction.reply({
        content: '🖼️ Choose your background:',
        components: [row],
        flags: discord_js_1.MessageFlags.Ephemeral,
    });
}
async function handleProfileShowPublic(interaction) {
    await (0, profile_1.createPublicProfile)(interaction);
}
async function handleChangeColors(interaction) {
    const locale = (0, i18n_1.getLocale)(interaction);
    const { t } = await Promise.resolve().then(() => __importStar(require('../../../utils/i18n')));
    const options = profileColorThemes_1.COLOR_THEMES.map((theme) => new discord_js_1.StringSelectMenuOptionBuilder()
        .setLabel((0, profileColorThemes_1.getThemeNameLocalized)(theme.id, locale))
        .setDescription(theme.name)
        .setValue(theme.id)
        .setEmoji(theme.emoji));
    const selectMenu = new discord_js_1.StringSelectMenuBuilder()
        .setCustomId('select_color_theme')
        .setPlaceholder(t(interaction, 'profile_colors_placeholder'))
        .addOptions(options);
    const row = new discord_js_1.ActionRowBuilder().addComponents(selectMenu);
    const embed = new discord_js_1.EmbedBuilder()
        .setColor('#5865F2')
        .setTitle(t(interaction, 'profile_colors_title'))
        .setDescription(t(interaction, 'profile_colors_desc'))
        .setFooter({ text: t(interaction, 'profile_colors_footer') });
    await interaction.reply({
        embeds: [embed],
        components: [row],
        flags: discord_js_1.MessageFlags.Ephemeral,
    });
}
//# sourceMappingURL=profileHandlers.js.map