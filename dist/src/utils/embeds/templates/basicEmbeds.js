"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasicEmbedTemplates = void 0;
const discord_js_1 = require("discord.js");
const customEmojis_1 = require("../../customEmojis");
class BasicEmbedTemplates {
    static success(title, description) {
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle(`${(0, customEmojis_1.getCheckEmoji)()} ${title}`)
            .setTimestamp();
        if (description) {
            embed.setDescription(description);
        }
        return embed;
    }
    static error(title, description) {
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(0xff0000)
            .setTitle(`${(0, customEmojis_1.getCancelEmoji)()} ${title}`)
            .setTimestamp();
        if (description) {
            embed.setDescription(description);
        }
        return embed;
    }
    static warning(title, description) {
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(0xffa500)
            .setTitle(`${(0, customEmojis_1.getWarningEmoji)()} ${title}`)
            .setTimestamp();
        if (description) {
            embed.setDescription(description);
        }
        return embed;
    }
    static info(title, description) {
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(0x5865f2)
            .setTitle(`${(0, customEmojis_1.getInfoEmoji)()} ${title}`)
            .setTimestamp();
        if (description) {
            embed.setDescription(description);
        }
        return embed;
    }
    static gold(title, description) {
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(0xffd700)
            .setTitle(title)
            .setTimestamp();
        if (description) {
            embed.setDescription(description);
        }
        return embed;
    }
}
exports.BasicEmbedTemplates = BasicEmbedTemplates;
//# sourceMappingURL=basicEmbeds.js.map