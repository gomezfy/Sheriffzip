"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSaloonTokenEmoji = getSaloonTokenEmoji;
function getSaloonTokenEmoji(guild) {
    if (!guild) {
        return "🪙";
    }
    const emoji = guild.emojis.cache.find((e) => e.name === "saloon_token");
    return emoji ? emoji.toString() : "🪙";
}
//# sourceMappingURL=emojiManager.js.map