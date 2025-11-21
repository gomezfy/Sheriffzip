"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatNumber = formatNumber;
exports.formatTime = formatTime;
exports.createProgressBar = createProgressBar;
exports.truncateText = truncateText;
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
//# sourceMappingURL=index.js.map