"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EMOJI_MAP = void 0;
exports.getEmojiPath = getEmojiPath;
exports.hasEmojis = hasEmojis;
exports.parseTextWithEmojis = parseTextWithEmojis;
const path_1 = __importDefault(require("path"));
const database_1 = require("./database");
const fs_1 = __importDefault(require("fs"));
exports.EMOJI_MAP = {
    "😊": "smile.png",
    "😎": "sunglasses.png",
    "🤠": "cowboy.png",
    "⭐": "star.png",
    "💰": "moneybag.png",
    "🎯": "target.png",
    "🏆": "trophy.png",
    "⚡": "lightning.png",
    "✨": "sparkles.png",
    "🔥": "fire.png",
    "💎": "gem.png",
    "🎲": "dice.png",
    "🎰": "slot.png",
    "🌵": "cactus.png",
    "🏜️": "desert.png",
    "🔫": "gun.png",
    "🐴": "horse.png",
    "🌟": "glowing-star.png",
    "💪": "muscle.png",
    "🎉": "party.png",
    "❤️": "heart.png",
    "👑": "crown.png",
    "🚀": "rocket.png",
    "🎮": "gamepad.png",
    "🍺": "beer.png",
    "🌙": "moon.png",
    "☀️": "sun.png",
    "🌈": "rainbow.png",
    "💀": "skull.png",
    "🎪": "circus.png",
    "🐱": "vibing-cat.gif",
    "😂": "lmao.gif",
    "👋": "wave.gif",
    "🇫": "f.gif",
    "🚫": "ban.gif",
    "🕹️": "mario-dance.gif",
    "🥇": "number-one.gif",
    "📈": "boost.gif",
    "⏰": "alarm.gif",
    "🔤": "wordle.gif",
    "👨‍💼": "owner-crown.gif",
    "🥁": "cowboy-bongo.gif",
    "😑": "blink.gif",
    "🕺": "cowboy-bop.gif",
    "🦆": "yeehaw-goose.gif",
    "🤗": "meowdy.png",
    "🎩": "cat-cowboy-hat.png",
    "🐈": "cat-cowboy.png",
    "👍": "aye-cowboy.png",
    "😢": "sad-cowboy.png",
    "😬": "yikes-cowboy.png",
    "😳": "wtf-stare.png",
    "👀": "stare.png",
    "😔": "ashamed.png",
    "🎸": "cowboy-rdia.png",
    "⚔️": "big-iron.png",
};
const EMOJI_DIR = (0, database_1.getDataPath)("assets", "emojis");
function getEmojiPath(emoji) {
    const filename = exports.EMOJI_MAP[emoji];
    if (!filename) {
        return null;
    }
    const filepath = path_1.default.join(EMOJI_DIR, filename);
    if (fs_1.default.existsSync(filepath)) {
        return filepath;
    }
    return null;
}
function hasEmojis(text) {
    if (!text) {
        return false;
    }
    for (const emoji of Object.keys(exports.EMOJI_MAP)) {
        if (text.includes(emoji)) {
            return true;
        }
    }
    return false;
}
function parseTextWithEmojis(text) {
    if (!text) {
        return [];
    }
    const parts = [];
    let currentText = "";
    const chars = Array.from(text);
    for (let i = 0; i < chars.length; i++) {
        const char = chars[i];
        if (exports.EMOJI_MAP[char]) {
            if (currentText) {
                parts.push({ type: "text", value: currentText });
                currentText = "";
            }
            parts.push({ type: "emoji", value: char, path: getEmojiPath(char) });
        }
        else {
            currentText += char;
        }
    }
    if (currentText) {
        parts.push({ type: "text", value: currentText });
    }
    return parts;
}
//# sourceMappingURL=emojiMapper.js.map