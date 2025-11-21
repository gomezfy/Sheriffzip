"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Colors = void 0;
exports.createMinimalEmbed = createMinimalEmbed;
exports.successEmbed = successEmbed;
exports.errorEmbed = errorEmbed;
exports.warningEmbed = warningEmbed;
exports.infoEmbed = infoEmbed;
exports.neutralEmbed = neutralEmbed;
exports.economyEmbed = economyEmbed;
exports.rewardEmbed = rewardEmbed;
exports.progressEmbed = progressEmbed;
exports.field = field;
exports.formatCurrency = formatCurrency;
exports.formatDuration = formatDuration;
exports.progressBar = progressBar;
const discord_js_1 = require("discord.js");
const customEmojis_1 = require("./customEmojis");
/**
 * Minimalist Embed System
 *
 * Neutral color palette for clean, modern Discord embeds
 */
exports.Colors = {
    SUCCESS: 0x10b981, // Green
    ERROR: 0xef4444, // Red
    WARNING: 0xf59e0b, // Amber
    INFO: 0x3b82f6, // Blue
    NEUTRAL: 0x6b7280, // Gray
    GOLD: 0xfbbf24, // Gold (for economy/rewards)
    PURPLE: 0xa855f7, // Purple (for special events)
};
/**
 * Create a minimal embed with consistent styling
 * @param options
 */
function createMinimalEmbed(options) {
    const embed = new discord_js_1.EmbedBuilder().setColor(options.color || exports.Colors.NEUTRAL);
    if (options.title) {
        embed.setTitle(options.title);
    }
    if (options.description) {
        embed.setDescription(options.description);
    }
    if (options.fields && options.fields.length > 0) {
        embed.addFields(options.fields);
    }
    if (options.footer) {
        embed.setFooter({ text: options.footer });
    }
    if (options.timestamp) {
        embed.setTimestamp();
    }
    return embed;
}
/**
 * Success embed (green) - for successful operations
 * @param title
 * @param description
 * @param footer
 */
function successEmbed(title, description, footer) {
    return createMinimalEmbed({
        title: `${(0, customEmojis_1.getCheckEmoji)()} ${title}`,
        description,
        footer,
        color: exports.Colors.SUCCESS,
    });
}
/**
 * Error embed (red) - for errors and failures
 * @param title
 * @param description
 * @param footer
 */
function errorEmbed(title, description, footer) {
    return createMinimalEmbed({
        title: `${(0, customEmojis_1.getCancelEmoji)()} ${title}`,
        description,
        footer,
        color: exports.Colors.ERROR,
    });
}
/**
 * Warning embed (amber) - for warnings and alerts
 * @param title
 * @param description
 * @param footer
 */
function warningEmbed(title, description, footer) {
    return createMinimalEmbed({
        title: `${(0, customEmojis_1.getWarningEmoji)()} ${title}`,
        description,
        footer,
        color: exports.Colors.WARNING,
    });
}
/**
 * Info embed (blue) - for information and help
 * @param title
 * @param description
 * @param footer
 */
function infoEmbed(title, description, footer) {
    return createMinimalEmbed({
        title: `${(0, customEmojis_1.getInfoEmoji)()} ${title}`,
        description,
        footer,
        color: exports.Colors.INFO,
    });
}
/**
 * Neutral embed (gray) - for generic content
 * @param title
 * @param description
 * @param footer
 */
function neutralEmbed(title, description, footer) {
    return createMinimalEmbed({
        title,
        description,
        footer,
        color: exports.Colors.NEUTRAL,
    });
}
/**
 * Economy embed - for economy-related operations (gold color)
 * @param title
 * @param description
 * @param footer
 */
function economyEmbed(title, description, footer) {
    return createMinimalEmbed({
        title: `${(0, customEmojis_1.getMoneybagEmoji)()} ${title}`,
        description,
        footer,
        color: exports.Colors.GOLD,
        timestamp: true,
    });
}
/**
 * Reward embed - for rewards and bonuses (purple)
 * @param title
 * @param description
 * @param footer
 */
function rewardEmbed(title, description, footer) {
    return createMinimalEmbed({
        title: `🎁 ${title}`,
        description,
        footer,
        color: exports.Colors.PURPLE,
        timestamp: true,
    });
}
/**
 * Progress embed - for showing progress and stats
 * @param title
 * @param fields
 * @param footer
 */
function progressEmbed(title, fields, footer) {
    return createMinimalEmbed({
        title,
        fields,
        footer,
        color: exports.Colors.INFO,
        timestamp: true,
    });
}
/**
 * Create a simple field for embeds
 * @param name
 * @param value
 * @param inline
 */
function field(name, value, inline = false) {
    return { name, value, inline };
}
/**
 * Format currency value for display
 * @param amount
 * @param currency
 */
function formatCurrency(amount, currency) {
    const emoji = {
        tokens: (0, customEmojis_1.getSaloonTokenEmoji)(),
        silver: (0, customEmojis_1.getSilverCoinEmoji)(),
        gold: (0, customEmojis_1.getGoldBarEmoji)(),
    };
    return `${amount.toLocaleString()} ${emoji[currency]}`;
}
/**
 * Format time duration (e.g., "2h 30m")
 * @param milliseconds
 */
function formatDuration(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) {
        return `${days}d ${hours % 24}h`;
    }
    if (hours > 0) {
        return `${hours}h ${minutes % 60}m`;
    }
    if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
}
/**
 * Create a progress bar visualization
 * @param current
 * @param max
 * @param length
 */
function progressBar(current, max, length = 10) {
    const percentage = Math.min(Math.max(current / max, 0), 1);
    const filled = Math.floor(percentage * length);
    const empty = length - filled;
    return "█".repeat(filled) + "░".repeat(empty);
}
//# sourceMappingURL=embeds.js.map