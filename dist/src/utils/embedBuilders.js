"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmbedFieldBuilder = exports.EmbedTemplates = void 0;
exports.formatNumber = formatNumber;
exports.formatTime = formatTime;
exports.createProgressBar = createProgressBar;
exports.truncateText = truncateText;
const discord_js_1 = require("discord.js");
const customEmojis_1 = require("./customEmojis");
class EmbedTemplates {
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
exports.EmbedTemplates = EmbedTemplates;
class EmbedFieldBuilder {
    fields = [];
    add(name, value, inline = false) {
        this.fields.push({ name, value, inline });
        return this;
    }
    addSpacer(inline = false) {
        this.fields.push({ name: "\u200b", value: "\u200b", inline });
        return this;
    }
    addMultiple(fields) {
        this.fields.push(...fields);
        return this;
    }
    build() {
        return this.fields;
    }
    apply(embed) {
        return embed.addFields(...this.fields);
    }
}
exports.EmbedFieldBuilder = EmbedFieldBuilder;
function formatNumber(num) {
    if (num >= 1_000_000_000) {
        return `${(num / 1_000_000_000).toFixed(2)}B`;
    }
    else if (num >= 1_000_000) {
        return `${(num / 1_000_000).toFixed(2)}M`;
    }
    else if (num >= 1_000) {
        return `${(num / 1_000).toFixed(2)}K`;
    }
    else {
        return num.toLocaleString();
    }
}
function formatTime(ms) {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const parts = [];
    if (days > 0) {
        parts.push(`${days}d`);
    }
    if (hours > 0) {
        parts.push(`${hours}h`);
    }
    if (minutes > 0) {
        parts.push(`${minutes}m`);
    }
    if (seconds > 0) {
        parts.push(`${seconds}s`);
    }
    return parts.join(" ") || "0s";
}
function createProgressBar(current, max, length = 10) {
    const percentage = Math.min(Math.max(current / max, 0), 1);
    const filled = Math.round(percentage * length);
    const empty = length - filled;
    const filledBar = "█".repeat(filled);
    const emptyBar = "░".repeat(empty);
    return `${filledBar}${emptyBar} ${(percentage * 100).toFixed(0)}%`;
}
function truncateText(text, maxLength = 100) {
    if (text.length <= maxLength) {
        return text;
    }
    return `${text.substring(0, maxLength - 3)}...`;
}
//# sourceMappingURL=embedBuilders.js.map