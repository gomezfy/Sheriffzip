"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpecialEmbedTemplates = void 0;
const discord_js_1 = require("discord.js");
const customEmojis_1 = require("../../customEmojis");
class SpecialEmbedTemplates {
    static profile(user) {
        return new discord_js_1.EmbedBuilder()
            .setColor(0x5865f2)
            .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
            .setThumbnail(user.displayAvatarURL({ size: 256 }))
            .setTimestamp();
    }
    static economy(title, user) {
        return new discord_js_1.EmbedBuilder()
            .setColor(0xffd700)
            .setTitle(title)
            .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
            .setTimestamp();
    }
    static cooldown(command, timeLeft) {
        return new discord_js_1.EmbedBuilder()
            .setColor(0xffa500)
            .setTitle(`${(0, customEmojis_1.getClockEmoji)()} Cooldown Active`)
            .setDescription(`Please wait **${timeLeft.toFixed(1)}s** before using \`/${command}\` again.`)
            .setTimestamp();
    }
    static pagination(title, page, totalPages) {
        return new discord_js_1.EmbedBuilder()
            .setColor(0x5865f2)
            .setTitle(title)
            .setFooter({ text: `Page ${page}/${totalPages}` })
            .setTimestamp();
    }
}
exports.SpecialEmbedTemplates = SpecialEmbedTemplates;
//# sourceMappingURL=specialEmbeds.js.map