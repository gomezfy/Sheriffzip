"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.muteUser = muteUser;
exports.unmuteUser = unmuteUser;
exports.checkExpiredMutes = checkExpiredMutes;
exports.getActiveMute = getActiveMute;
const database_1 = require("./database");
function getMutesData() {
    try {
        return (0, database_1.readData)("mutes.json");
    }
    catch (error) {
        return {};
    }
}
function saveMutesData(data) {
    (0, database_1.writeData)("mutes.json", data);
}
async function muteUser(member, moderatorId, reason, durationMinutes) {
    try {
        const mutesData = getMutesData();
        const key = `${member.guild.id}_${member.id}`;
        if (mutesData[key] && mutesData[key].expiresAt > Date.now()) {
            return { success: false, message: "❌ Este usuário já está silenciado!" };
        }
        await member.timeout(durationMinutes * 60 * 1000, reason);
        const muteId = `mute_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const expiresAt = Date.now() + durationMinutes * 60 * 1000;
        mutesData[key] = {
            userId: member.id,
            guildId: member.guild.id,
            moderatorId,
            reason,
            mutedAt: Date.now(),
            expiresAt,
            muteId,
        };
        saveMutesData(mutesData);
        return {
            success: true,
            message: `✅ Usuário silenciado por ${durationMinutes} minutos!`,
            expiresAt,
        };
    }
    catch (error) {
        return {
            success: false,
            message: `❌ Erro ao silenciar: ${error.message}`,
        };
    }
}
async function unmuteUser(member) {
    try {
        const mutesData = getMutesData();
        const key = `${member.guild.id}_${member.id}`;
        await member.timeout(null);
        delete mutesData[key];
        saveMutesData(mutesData);
        return { success: true, message: "✅ Usuário dessilenciado com sucesso!" };
    }
    catch (error) {
        return {
            success: false,
            message: `❌ Erro ao dessilenciar: ${error.message}`,
        };
    }
}
function checkExpiredMutes() {
    const mutesData = getMutesData();
    const now = Date.now();
    const expiredKeys = [];
    for (const [key, mute] of Object.entries(mutesData)) {
        if (mute.expiresAt <= now) {
            expiredKeys.push(key);
            delete mutesData[key];
        }
    }
    if (expiredKeys.length > 0) {
        saveMutesData(mutesData);
    }
    return expiredKeys;
}
function getActiveMute(userId, guildId) {
    const mutesData = getMutesData();
    const key = `${guildId}_${userId}`;
    const mute = mutesData[key];
    if (!mute || mute.expiresAt <= Date.now()) {
        return null;
    }
    return mute;
}
//# sourceMappingURL=muteManager.js.map