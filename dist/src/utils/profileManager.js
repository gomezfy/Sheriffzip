"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserProfile = getUserProfile;
exports.setUserBio = setUserBio;
exports.setUserBackground = setUserBackground;
exports.setUserProfile = setUserProfile;
exports.setUserPhrase = setUserPhrase;
exports.setUserColorTheme = setUserColorTheme;
exports.getUserColorTheme = getUserColorTheme;
const fs_1 = __importDefault(require("fs"));
const database_1 = require("./database");
const path_1 = __importDefault(require("path"));
const dataDir = (0, database_1.getDataPath)("data");
const profilesFile = path_1.default.join(dataDir, "profiles.json");
// Ensure data directory exists
if (!fs_1.default.existsSync(dataDir)) {
    fs_1.default.mkdirSync(dataDir, { recursive: true });
}
// Ensure profiles file exists
if (!fs_1.default.existsSync(profilesFile)) {
    fs_1.default.writeFileSync(profilesFile, JSON.stringify({}, null, 2));
}
function getUserProfile(userId) {
    const data = fs_1.default.readFileSync(profilesFile, "utf8");
    const profiles = JSON.parse(data);
    if (!profiles[userId]) {
        profiles[userId] = {
            bio: "A mysterious cowboy wandering the Wild West...",
            background: null,
        };
    }
    return profiles[userId];
}
function setUserBio(userId, bio) {
    const data = fs_1.default.readFileSync(profilesFile, "utf8");
    const profiles = JSON.parse(data);
    if (!profiles[userId]) {
        profiles[userId] = { bio: "", background: null };
    }
    profiles[userId].bio = bio;
    fs_1.default.writeFileSync(profilesFile, JSON.stringify(profiles, null, 2));
    return true;
}
function setUserBackground(userId, backgroundName) {
    const data = fs_1.default.readFileSync(profilesFile, "utf8");
    const profiles = JSON.parse(data);
    if (!profiles[userId]) {
        profiles[userId] = {
            bio: "A mysterious cowboy wandering the Wild West...",
            background: null,
        };
    }
    profiles[userId].background = backgroundName;
    fs_1.default.writeFileSync(profilesFile, JSON.stringify(profiles, null, 2));
    return true;
}
function setUserProfile(userId, profile) {
    const data = fs_1.default.readFileSync(profilesFile, "utf8");
    const profiles = JSON.parse(data);
    profiles[userId] = profile;
    fs_1.default.writeFileSync(profilesFile, JSON.stringify(profiles, null, 2));
    return true;
}
function setUserPhrase(userId, phrase) {
    const data = fs_1.default.readFileSync(profilesFile, "utf8");
    const profiles = JSON.parse(data);
    // Trim whitespace to avoid storing effectively empty strings
    const trimmedPhrase = phrase.trim();
    if (!profiles[userId]) {
        profiles[userId] = {
            bio: "A mysterious cowboy wandering the Wild West...",
            background: null,
            phrase: trimmedPhrase,
        };
    }
    else {
        profiles[userId].phrase = trimmedPhrase;
    }
    fs_1.default.writeFileSync(profilesFile, JSON.stringify(profiles, null, 2));
    return true;
}
function setUserColorTheme(userId, themeId) {
    const { COLOR_THEMES } = require("./profileColorThemes");
    const validTheme = COLOR_THEMES.find((t) => t.id === themeId);
    if (!validTheme) {
        return false;
    }
    const data = fs_1.default.readFileSync(profilesFile, "utf8");
    const profiles = JSON.parse(data);
    if (!profiles[userId]) {
        profiles[userId] = {
            bio: "A mysterious cowboy wandering the Wild West...",
            background: null,
            colorTheme: themeId,
        };
    }
    else {
        profiles[userId].colorTheme = themeId;
    }
    fs_1.default.writeFileSync(profilesFile, JSON.stringify(profiles, null, 2));
    return true;
}
function getUserColorTheme(userId) {
    const profile = getUserProfile(userId);
    return profile.colorTheme || "default";
}
//# sourceMappingURL=profileManager.js.map