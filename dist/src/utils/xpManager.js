"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getXpForLevel = getXpForLevel;
exports.getUserXp = getUserXp;
exports.addXp = addXp;
exports.getXpLeaderboard = getXpLeaderboard;
const database_1 = require("./database");
const COOLDOWN = 60 * 1000; // 60 seconds
function getXpData() {
    try {
        return (0, database_1.readData)("xp.json");
    }
    catch (error) {
        return {};
    }
}
function saveXpData(data) {
    (0, database_1.writeData)("xp.json", data);
}
function getXpForLevel(level) {
    return 5 * level ** 2 + 50 * level + 100;
}
function getUserXp(userId) {
    const xpData = getXpData();
    if (!xpData[userId]) {
        return { xp: 0, level: 0, lastMessageTimestamp: 0 };
    }
    return xpData[userId];
}
function addXp(userId, amount, bypassCooldown = false) {
    const xpData = getXpData();
    const userData = getUserXp(userId);
    const now = Date.now();
    if (!bypassCooldown && now - userData.lastMessageTimestamp < COOLDOWN) {
        return {
            leveledUp: false,
            oldLevel: userData.level,
            newLevel: userData.level,
            granted: false,
        };
    }
    userData.xp += amount;
    userData.lastMessageTimestamp = now;
    const oldLevel = userData.level;
    let xpForNextLevel = getXpForLevel(userData.level);
    let leveledUp = false;
    while (userData.xp >= xpForNextLevel) {
        userData.level++;
        userData.xp -= xpForNextLevel;
        xpForNextLevel = getXpForLevel(userData.level);
        leveledUp = true;
    }
    xpData[userId] = userData;
    saveXpData(xpData);
    return { leveledUp, oldLevel, newLevel: userData.level, granted: true };
}
function getXpLeaderboard(limit = 10) {
    const xpData = getXpData();
    const users = Object.entries(xpData).map(([userId, data]) => ({
        userId,
        ...data,
    }));
    users.sort((a, b) => {
        if (a.level !== b.level) {
            return b.level - a.level;
        }
        return b.xp - a.xp;
    });
    return users.slice(0, limit);
}
//# sourceMappingURL=xpManager.js.map