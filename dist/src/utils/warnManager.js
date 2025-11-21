"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addWarn = addWarn;
exports.removeWarn = removeWarn;
exports.clearWarns = clearWarns;
exports.getUserWarns = getUserWarns;
exports.getWarnCount = getWarnCount;
const database_1 = require("./database");
function getWarnsData() {
    try {
        return (0, database_1.readData)("warns.json");
    }
    catch (error) {
        return {};
    }
}
function saveWarnsData(data) {
    (0, database_1.writeData)("warns.json", data);
}
function addWarn(userId, guildId, moderatorId, reason) {
    const warnsData = getWarnsData();
    const key = `${guildId}_${userId}`;
    if (!warnsData[key]) {
        warnsData[key] = [];
    }
    const warnId = `warn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const newWarn = {
        userId,
        guildId,
        moderatorId,
        reason,
        timestamp: Date.now(),
        warnId,
    };
    warnsData[key].push(newWarn);
    saveWarnsData(warnsData);
    return {
        success: true,
        warnId,
        totalWarns: warnsData[key].length,
    };
}
function removeWarn(userId, guildId, warnId) {
    const warnsData = getWarnsData();
    const key = `${guildId}_${userId}`;
    if (!warnsData[key] || warnsData[key].length === 0) {
        return { success: false, message: "Este usuário não possui avisos." };
    }
    const initialLength = warnsData[key].length;
    warnsData[key] = warnsData[key].filter((warn) => warn.warnId !== warnId);
    if (warnsData[key].length === initialLength) {
        return { success: false, message: "Aviso não encontrado." };
    }
    saveWarnsData(warnsData);
    return { success: true, message: "Aviso removido com sucesso!" };
}
function clearWarns(userId, guildId) {
    const warnsData = getWarnsData();
    const key = `${guildId}_${userId}`;
    const clearedCount = warnsData[key]?.length || 0;
    delete warnsData[key];
    saveWarnsData(warnsData);
    return { success: true, clearedCount };
}
function getUserWarns(userId, guildId) {
    const warnsData = getWarnsData();
    const key = `${guildId}_${userId}`;
    return warnsData[key] || [];
}
function getWarnCount(userId, guildId) {
    return getUserWarns(userId, guildId).length;
}
//# sourceMappingURL=warnManager.js.map