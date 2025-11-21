"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BACKGROUNDS = void 0;
exports.getBackgroundById = getBackgroundById;
exports.getAllBackgrounds = getAllBackgrounds;
exports.getBackgroundsByRarity = getBackgroundsByRarity;
exports.userOwnsBackground = userOwnsBackground;
exports.getUserBackgrounds = getUserBackgrounds;
exports.purchaseBackground = purchaseBackground;
exports.setUserBackground = setUserBackground;
exports.getUserCurrentBackground = getUserCurrentBackground;
exports.getRarityColor = getRarityColor;
exports.getRarityEmoji = getRarityEmoji;
exports.backgroundFileExists = backgroundFileExists;
const fs_1 = __importDefault(require("fs"));
const database_1 = require("./database");
const profileManager_1 = require("./profileManager");
const dataManager_1 = require("./dataManager");
/**
 * All available backgrounds
 */
exports.BACKGROUNDS = [
    {
        id: "default",
        name: "Classic Western",
        filename: "default.png",
        price: 0,
        description: "The classic western desert background",
        rarity: "common",
        free: true,
        imageUrl: "https://i.postimg.cc/RZzdB582/IMG-3354.png",
    },
    {
        id: "arabe_ingles",
        name: "Árabe Inglês",
        filename: "arabe-ingles.png",
        price: 300,
        description: "Majestic Arabian horse in the desert",
        rarity: "legendary",
        free: false,
        imageUrl: "https://i.postimg.cc/0QsPQyVN/IMG-3270.png",
    },
    {
        id: "horse_alone",
        name: "Horse Alone",
        filename: "horse-alone.png",
        price: 283,
        description: "Saddled horse drinking from a western river",
        rarity: "epic",
        free: false,
        imageUrl: "https://i.postimg.cc/T13z6r1C/IMG-3267.png",
    },
    {
        id: "addicted_saloon",
        name: "Addicted to the Saloon",
        filename: "addicted-saloon.png",
        price: 800,
        description: "Classic saloon interior with western atmosphere",
        rarity: "mythic",
        free: false,
        imageUrl: "https://i.postimg.cc/Hs9tVZB1/IMG-3268.png",
    },
    {
        id: "sakura_dreams",
        name: "Sonhos de Sakura",
        filename: "sakura-dreams.png",
        price: 350,
        description: "Linda garota anime em um jardim de flores de cerejeira com pétalas caindo",
        rarity: "legendary",
        free: false,
        imageUrl: "https://i.postimg.cc/nhc1hwNF/IMG-3397.png",
    },
];
/**
 * Get background by ID
 * @param id
 */
function getBackgroundById(id) {
    return exports.BACKGROUNDS.find((bg) => bg.id === id) || null;
}
/**
 * Get all backgrounds
 */
function getAllBackgrounds() {
    return exports.BACKGROUNDS;
}
/**
 * Get backgrounds by rarity
 * @param rarity
 */
function getBackgroundsByRarity(rarity) {
    return exports.BACKGROUNDS.filter((bg) => bg.rarity === rarity);
}
/**
 * Check if user owns a background
 * @param userId
 * @param backgroundId
 */
function userOwnsBackground(userId, backgroundId) {
    const profile = (0, profileManager_1.getUserProfile)(userId);
    // Default background is always owned
    if (backgroundId === "default") {
        return true;
    }
    // Check if user has purchased this background
    const owned = Array.isArray(profile.ownedBackgrounds) ? profile.ownedBackgrounds : [];
    return owned.includes(backgroundId);
}
/**
 * Get all backgrounds owned by user
 * @param userId
 */
function getUserBackgrounds(userId) {
    const profile = (0, profileManager_1.getUserProfile)(userId);
    const owned = Array.isArray(profile.ownedBackgrounds) ? profile.ownedBackgrounds : [];
    return exports.BACKGROUNDS.filter((bg) => bg.free || owned.includes(bg.id));
}
/**
 * Purchase a background for a user
 * @param userId
 * @param backgroundId
 */
async function purchaseBackground(userId, backgroundId) {
    const background = getBackgroundById(backgroundId);
    if (!background) {
        return { success: false, message: "❌ Background not found!" };
    }
    // Check if already owned
    if (userOwnsBackground(userId, backgroundId)) {
        return { success: false, message: "❌ You already own this background!" };
    }
    // Check if free
    if (background.free) {
        const profile = (0, profileManager_1.getUserProfile)(userId);
        if (!profile.ownedBackgrounds) {
            profile.ownedBackgrounds = [];
        }
        profile.ownedBackgrounds.push(backgroundId);
        (0, profileManager_1.setUserProfile)(userId, profile);
        return {
            success: true,
            message: `✅ You claimed the **${background.name}** background!`,
        };
    }
    // Check if user has enough tokens
    const userTokens = (0, dataManager_1.getUserGold)(userId);
    if (userTokens < background.price) {
        return {
            success: false,
            message: `❌ Not enough Saloon Tokens! You need 🎫 ${background.price.toLocaleString()} but only have 🎫 ${userTokens.toLocaleString()}.`,
        };
    }
    // Deduct tokens
    await (0, dataManager_1.removeUserGold)(userId, background.price);
    // Add background to user's collection
    const profile = (0, profileManager_1.getUserProfile)(userId);
    if (!profile.ownedBackgrounds) {
        profile.ownedBackgrounds = [];
    }
    profile.ownedBackgrounds.push(backgroundId);
    (0, profileManager_1.setUserProfile)(userId, profile);
    return {
        success: true,
        message: `✅ Successfully purchased **${background.name}**!\n💰 Spent 🎫 ${background.price.toLocaleString()} Saloon Tokens.`,
    };
}
/**
 * Set active background for user
 * @param userId
 * @param backgroundId
 */
function setUserBackground(userId, backgroundId) {
    const background = getBackgroundById(backgroundId);
    if (!background) {
        return { success: false, message: "❌ Background not found!" };
    }
    // Check if user owns this background
    if (!userOwnsBackground(userId, backgroundId)) {
        return { success: false, message: "❌ You don't own this background!" };
    }
    // Set as active background
    const profile = (0, profileManager_1.getUserProfile)(userId);
    profile.background = background.filename;
    (0, profileManager_1.setUserProfile)(userId, profile);
    return {
        success: true,
        message: `✅ Background changed to **${background.name}**!`,
    };
}
/**
 * Get user's current active background
 * @param userId
 */
function getUserCurrentBackground(userId) {
    const profile = (0, profileManager_1.getUserProfile)(userId);
    if (!profile.background) {
        return null;
    }
    return exports.BACKGROUNDS.find((bg) => bg.filename === profile.background) || null;
}
/**
 * Get rarity color
 * @param rarity
 */
function getRarityColor(rarity) {
    switch (rarity) {
        case "common":
            return 0x95a5a6;
        case "rare":
            return 0x3498db;
        case "epic":
            return 0x9b59b6;
        case "legendary":
            return 0xf1c40f;
        case "mythic":
            return 0xe74c3c;
        default:
            return 0x95a5a6;
    }
}
/**
 * Get rarity emoji
 * @param rarity
 */
function getRarityEmoji(rarity) {
    switch (rarity) {
        case "common":
            return "⚪";
        case "rare":
            return "🔵";
        case "epic":
            return "🟣";
        case "legendary":
            return "🟡";
        case "mythic":
            return "🔴";
        default:
            return "⚪";
    }
}
/**
 * Check if background file exists
 * @param filename
 */
function backgroundFileExists(filename) {
    const bgPath = (0, database_1.getDataPath)("assets", "profile-backgrounds", filename);
    return fs_1.default.existsSync(bgPath);
}
//# sourceMappingURL=backgroundManager.js.map