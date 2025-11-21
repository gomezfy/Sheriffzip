"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSelectColorTheme = handleSelectColorTheme;
const discord_js_1 = require("discord.js");
const profileManager_1 = require("../../../utils/profileManager");
const profileColorThemes_1 = require("../../../utils/profileColorThemes");
const i18n_1 = require("../../../utils/i18n");
async function handleSelectColorTheme(interaction) {
    const selectedThemeId = interaction.values[0];
    const locale = (0, i18n_1.getLocale)(interaction);
    const success = (0, profileManager_1.setUserColorTheme)(interaction.user.id, selectedThemeId);
    if (!success) {
        await interaction.update({
            embeds: [
                new discord_js_1.EmbedBuilder()
                    .setColor('#ED4245')
                    .setTitle('❌ ' + (0, i18n_1.t)(interaction, 'error'))
                    .setDescription((0, i18n_1.t)(interaction, 'profile_colors_error'))
                    .setTimestamp(),
            ],
            components: [],
        });
        return;
    }
    const theme = (0, profileColorThemes_1.getThemeById)(selectedThemeId);
    const themeName = (0, profileColorThemes_1.getThemeNameLocalized)(selectedThemeId, locale);
    await interaction.update({
        embeds: [
            new discord_js_1.EmbedBuilder()
                .setColor('#57F287')
                .setTitle(`${theme.emoji} ${(0, i18n_1.t)(interaction, 'profile_colors_changed')}`)
                .setDescription((0, i18n_1.t)(interaction, 'profile_colors_success', { theme: themeName }))
                .setTimestamp(),
        ],
        components: [],
    });
}
//# sourceMappingURL=profileMenus.js.map