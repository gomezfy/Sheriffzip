"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addLevelReward = addLevelReward;
exports.removeLevelReward = removeLevelReward;
exports.getLevelRewards = getLevelRewards;
exports.checkAndGrantRewards = checkAndGrantRewards;
const database_1 = require("./database");
function getLevelRewardsData() {
    try {
        return (0, database_1.readData)("level-rewards.json");
    }
    catch (error) {
        return {};
    }
}
function saveLevelRewardsData(data) {
    (0, database_1.writeData)("level-rewards.json", data);
}
function addLevelReward(guildId, level, roleId) {
    const rewardsData = getLevelRewardsData();
    if (!rewardsData[guildId]) {
        rewardsData[guildId] = [];
    }
    const existing = rewardsData[guildId].find((r) => r.level === level);
    if (existing) {
        existing.roleId = roleId;
        saveLevelRewardsData(rewardsData);
        return {
            success: true,
            message: `✅ Recompensa do nível ${level} atualizada!`,
        };
    }
    rewardsData[guildId].push({ level, roleId });
    rewardsData[guildId].sort((a, b) => a.level - b.level);
    saveLevelRewardsData(rewardsData);
    return {
        success: true,
        message: `✅ Recompensa adicionada para o nível ${level}!`,
    };
}
function removeLevelReward(guildId, level) {
    const rewardsData = getLevelRewardsData();
    if (!rewardsData[guildId]) {
        return {
            success: false,
            message: "❌ Nenhuma recompensa configurada neste servidor.",
        };
    }
    const initialLength = rewardsData[guildId].length;
    rewardsData[guildId] = rewardsData[guildId].filter((r) => r.level !== level);
    if (rewardsData[guildId].length === initialLength) {
        return {
            success: false,
            message: `❌ Nenhuma recompensa encontrada para o nível ${level}.`,
        };
    }
    saveLevelRewardsData(rewardsData);
    return {
        success: true,
        message: `✅ Recompensa do nível ${level} removida!`,
    };
}
function getLevelRewards(guildId) {
    const rewardsData = getLevelRewardsData();
    return rewardsData[guildId] || [];
}
async function checkAndGrantRewards(member, level) {
    const rewards = getLevelRewards(member.guild.id);
    const grantedRoles = [];
    for (const reward of rewards) {
        if (reward.level === level) {
            try {
                const role = member.guild.roles.cache.get(reward.roleId);
                if (role && !member.roles.cache.has(reward.roleId)) {
                    await member.roles.add(role);
                    grantedRoles.push(role.name);
                }
            }
            catch (error) {
                console.error(`Failed to grant role ${reward.roleId}:`, error);
            }
        }
    }
    return grantedRoles;
}
//# sourceMappingURL=levelRewards.js.map