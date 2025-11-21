"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllFramesTranslated = getAllFramesTranslated;
exports.getUserFrames = getUserFrames;
exports.getAllFrames = getAllFrames;
exports.getAvailableFramesForUser = getAvailableFramesForUser;
exports.getFrameById = getFrameById;
exports.canUnlockFrame = canUnlockFrame;
exports.userOwnsFrame = userOwnsFrame;
exports.purchaseFrame = purchaseFrame;
exports.unlockFrameByTerritory = unlockFrameByTerritory;
exports.setActiveFrame = setActiveFrame;
exports.getActiveFrameUrl = getActiveFrameUrl;
exports.getRarityColor = getRarityColor;
exports.getRarityEmoji = getRarityEmoji;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const territoryManager_1 = require("./territoryManager");
const i18n_1 = require("./i18n");
const FRAMES_DATA_FILE = path_1.default.join(process.cwd(), "src/data/frames.json");
const USER_FRAMES_FILE = path_1.default.join(process.cwd(), "src/data/user_frames.json");
// Available frames in the shop (base data without translations)
const AVAILABLE_FRAMES_BASE = [
    {
        id: "golden_western",
        imageUrl: "https://i.postimg.cc/Nj3ZrzK7/result-0F9BE830-2CC5-4F60-BF94-6B37E629AF17.png",
        price: 30,
        rarity: "rare",
    },
    {
        id: "rex_premium",
        imageUrl: "https://i.postimg.cc/fb8h6vHS/result-IMG-3359.png",
        price: 430,
        rarity: "legendary",
    },
    {
        id: "western_classic",
        imageUrl: "https://i.postimg.cc/pXHSx6mg/result-IMG-3364.png",
        price: 512,
        rarity: "legendary",
    },
    {
        id: "enchanted_west_higuma",
        imageUrl: "https://i.postimg.cc/65zfg9F8/result-IMG-3365.png",
        price: 1600,
        rarity: "legendary",
    },
    {
        id: "gold_mine_exclusive",
        imageUrl: "https://i.postimg.cc/2StkHZw0/result-IMG-3367.png",
        price: 0,
        rarity: "legendary",
        requiresTerritory: "gold_mine_shares",
    },
    {
        id: "pink_floral_frame",
        imageUrl: "https://i.postimg.cc/fyGhRNqg/IMG-3392-300x300.png",
        price: 290,
        rarity: "epic",
    },
];
// Get frame translation key for name
function getFrameNameKey(frameId) {
    return `frame_${frameId}_name`;
}
// Get frame translation key for description
function getFrameDescKey(frameId) {
    return `frame_${frameId}_desc`;
}
// Get all frames with translations for a specific user
function getAllFramesTranslated(userId) {
    return AVAILABLE_FRAMES_BASE.map(base => ({
        ...base,
        name: (0, i18n_1.tUser)(userId, getFrameNameKey(base.id)),
        description: (0, i18n_1.tUser)(userId, getFrameDescKey(base.id)),
    }));
}
// Legacy: Get all frames (uses default Portuguese)
const AVAILABLE_FRAMES = AVAILABLE_FRAMES_BASE.map(base => ({
    ...base,
    name: (0, i18n_1.tUser)("default", getFrameNameKey(base.id)),
    description: (0, i18n_1.tUser)("default", getFrameDescKey(base.id)),
}));
// Load user frames data
function loadUserFrames() {
    try {
        if (fs_1.default.existsSync(USER_FRAMES_FILE)) {
            const data = fs_1.default.readFileSync(USER_FRAMES_FILE, "utf8");
            return JSON.parse(data);
        }
    }
    catch (error) {
        console.error("Error loading user frames:", error);
    }
    return {};
}
// Save user frames data
function saveUserFrames(data) {
    try {
        const dir = path_1.default.dirname(USER_FRAMES_FILE);
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
        fs_1.default.writeFileSync(USER_FRAMES_FILE, JSON.stringify(data, null, 2));
    }
    catch (error) {
        console.error("Error saving user frames:", error);
    }
}
// Get user frames
function getUserFrames(userId) {
    const allUserFrames = loadUserFrames();
    if (!allUserFrames[userId]) {
        allUserFrames[userId] = {
            userId,
            ownedFrames: [],
            activeFrame: null,
        };
        saveUserFrames(allUserFrames);
    }
    return allUserFrames[userId];
}
// Get all available frames
function getAllFrames() {
    return AVAILABLE_FRAMES;
}
// Get all available frames for a specific user (considering territory requirements)
function getAvailableFramesForUser(userId) {
    return AVAILABLE_FRAMES.filter((frame) => {
        // If no territory requirement, frame is available
        if (!frame.requiresTerritory)
            return true;
        // Check if user owns the required territory
        return (0, territoryManager_1.ownsTerritory)(userId, frame.requiresTerritory);
    });
}
// Get frame by ID
function getFrameById(frameId) {
    return AVAILABLE_FRAMES.find((f) => f.id === frameId) || null;
}
// Check if user can unlock a frame (has required territory)
function canUnlockFrame(userId, frameId) {
    const frame = getFrameById(frameId);
    if (!frame)
        return false;
    // If no territory requirement, can unlock
    if (!frame.requiresTerritory)
        return true;
    // Check if user owns the required territory
    return (0, territoryManager_1.ownsTerritory)(userId, frame.requiresTerritory);
}
// Check if user owns a frame
function userOwnsFrame(userId, frameId) {
    const userFrames = getUserFrames(userId);
    return userFrames.ownedFrames.includes(frameId);
}
// Purchase a frame
function purchaseFrame(userId, frameId) {
    const frame = getFrameById(frameId);
    if (!frame)
        return false;
    // Check if user can unlock this frame (territory requirement)
    if (!canUnlockFrame(userId, frameId)) {
        return false;
    }
    const allUserFrames = loadUserFrames();
    if (!allUserFrames[userId]) {
        allUserFrames[userId] = {
            userId,
            ownedFrames: [],
            activeFrame: null,
        };
    }
    // Check if already owned
    if (allUserFrames[userId].ownedFrames.includes(frameId)) {
        return false;
    }
    // Add frame to owned frames
    allUserFrames[userId].ownedFrames.push(frameId);
    // If first frame, set as active
    if (allUserFrames[userId].ownedFrames.length === 1) {
        allUserFrames[userId].activeFrame = frameId;
    }
    saveUserFrames(allUserFrames);
    return true;
}
// Unlock frame automatically when user gets required territory
function unlockFrameByTerritory(userId, territoryId) {
    // Find frames that require this territory
    const framesToUnlock = AVAILABLE_FRAMES.filter((frame) => frame.requiresTerritory === territoryId);
    if (framesToUnlock.length === 0)
        return;
    const allUserFrames = loadUserFrames();
    if (!allUserFrames[userId]) {
        allUserFrames[userId] = {
            userId,
            ownedFrames: [],
            activeFrame: null,
        };
    }
    let unlocked = false;
    for (const frame of framesToUnlock) {
        // Only add if not already owned
        if (!allUserFrames[userId].ownedFrames.includes(frame.id)) {
            allUserFrames[userId].ownedFrames.push(frame.id);
            unlocked = true;
            // If first frame, set as active
            if (allUserFrames[userId].ownedFrames.length === 1) {
                allUserFrames[userId].activeFrame = frame.id;
            }
        }
    }
    if (unlocked) {
        saveUserFrames(allUserFrames);
    }
}
// Set active frame
function setActiveFrame(userId, frameId) {
    const allUserFrames = loadUserFrames();
    if (!allUserFrames[userId]) {
        allUserFrames[userId] = {
            userId,
            ownedFrames: [],
            activeFrame: null,
        };
    }
    // If setting to null (removing frame), allow it
    if (frameId === null) {
        allUserFrames[userId].activeFrame = null;
        saveUserFrames(allUserFrames);
        return true;
    }
    // Check if user owns the frame
    if (!allUserFrames[userId].ownedFrames.includes(frameId)) {
        return false;
    }
    allUserFrames[userId].activeFrame = frameId;
    saveUserFrames(allUserFrames);
    return true;
}
// Get active frame URL
function getActiveFrameUrl(userId) {
    const userFrames = getUserFrames(userId);
    if (!userFrames.activeFrame)
        return null;
    const frame = getFrameById(userFrames.activeFrame);
    return frame ? frame.imageUrl : null;
}
// Get rarity color
function getRarityColor(rarity) {
    switch (rarity) {
        case "common":
            return "#95a5a6";
        case "rare":
            return "#3498db";
        case "epic":
            return "#9b59b6";
        case "legendary":
            return "#f1c40f";
        default:
            return "#95a5a6";
    }
}
// Get rarity emoji
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
        default:
            return "⚪";
    }
}
//# sourceMappingURL=frameManager.js.map