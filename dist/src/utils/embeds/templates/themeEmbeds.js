"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeEmbedTemplates = void 0;
const discord_js_1 = require("discord.js");
const customEmojis_1 = require("../../customEmojis");
class ThemeEmbedTemplates {
    static western(title, description, color = 0x8b4513) {
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(color)
            .setTitle(`${(0, customEmojis_1.getCowboyEmoji)()} ${title}`)
            .setFooter({ text: "Sheriff Rex Bot - Western Discord Bot" })
            .setTimestamp();
        if (description) {
            embed.setDescription(description);
        }
        return embed;
    }
    static bounty(title, color = 0xff0000) {
        return new discord_js_1.EmbedBuilder()
            .setColor(color)
            .setTitle(`${(0, customEmojis_1.getDartEmoji)()} ${title}`)
            .setTimestamp();
    }
    static mining(title) {
        return new discord_js_1.EmbedBuilder()
            .setColor(0xffd700)
            .setTitle(`${(0, customEmojis_1.getPickaxeEmoji)()} ${title}`)
            .setTimestamp();
    }
    static leaderboard(title, guild) {
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(0xffd700)
            .setTitle(`${(0, customEmojis_1.getTrophyEmoji)()} ${title}`)
            .setTimestamp();
        if (guild) {
            embed.setFooter({
                text: guild.name,
                iconURL: guild.iconURL() || undefined,
            });
        }
        return embed;
    }
    static announcement(title, color = 0x5865f2) {
        return new discord_js_1.EmbedBuilder().setColor(color).setTitle(title).setTimestamp();
    }
}
exports.ThemeEmbedTemplates = ThemeEmbedTemplates;
//# sourceMappingURL=themeEmbeds.js.map