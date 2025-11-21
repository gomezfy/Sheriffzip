"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserGold = getUserGold;
exports.setUserGold = setUserGold;
exports.addUserGold = addUserGold;
exports.removeUserGold = removeUserGold;
exports.transferGold = transferGold;
exports.getUserSilver = getUserSilver;
exports.setUserSilver = setUserSilver;
exports.addUserSilver = addUserSilver;
exports.removeUserSilver = removeUserSilver;
exports.transferSilver = transferSilver;
exports.addBounty = addBounty;
exports.getBountyByTarget = getBountyByTarget;
exports.removeBounty = removeBounty;
exports.getAllBounties = getAllBounties;
exports.removeContribution = removeContribution;
exports.getWelcomeConfig = getWelcomeConfig;
exports.setWelcomeConfig = setWelcomeConfig;
exports.removeWelcomeConfig = removeWelcomeConfig;
exports.getLogConfig = getLogConfig;
exports.setLogConfig = setLogConfig;
exports.removeLogConfig = removeLogConfig;
exports.getWantedConfig = getWantedConfig;
exports.setWantedConfig = setWantedConfig;
exports.removeWantedConfig = removeWantedConfig;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const inventoryManager_1 = require("./inventoryManager");
const database_1 = require("./database");
const dataDir = (0, database_1.getDataPath)("data");
const economyFile = path_1.default.join(dataDir, "economy.json");
const bountiesFile = path_1.default.join(dataDir, "bounties.json");
const welcomeFile = path_1.default.join(dataDir, "welcome.json");
const logsFile = path_1.default.join(dataDir, "logs.json");
const wantedFile = path_1.default.join(dataDir, "wanted.json");
if (!fs_1.default.existsSync(dataDir)) {
    fs_1.default.mkdirSync(dataDir, { recursive: true });
}
if (!fs_1.default.existsSync(economyFile)) {
    fs_1.default.writeFileSync(economyFile, JSON.stringify({}, null, 2));
}
if (!fs_1.default.existsSync(bountiesFile)) {
    fs_1.default.writeFileSync(bountiesFile, JSON.stringify([], null, 2));
}
if (!fs_1.default.existsSync(welcomeFile)) {
    fs_1.default.writeFileSync(welcomeFile, JSON.stringify({}, null, 2));
}
if (!fs_1.default.existsSync(logsFile)) {
    fs_1.default.writeFileSync(logsFile, JSON.stringify({}, null, 2));
}
if (!fs_1.default.existsSync(wantedFile)) {
    fs_1.default.writeFileSync(wantedFile, JSON.stringify({}, null, 2));
}
function getUserGold(userId) {
    return (0, inventoryManager_1.getItem)(userId, "saloon_token");
}
async function setUserGold(userId, amount) {
    const current = getUserGold(userId);
    const diff = amount - current;
    if (diff > 0) {
        return await (0, inventoryManager_1.addItem)(userId, "saloon_token", diff);
    }
    else if (diff < 0) {
        return await (0, inventoryManager_1.removeItem)(userId, "saloon_token", Math.abs(diff));
    }
    return { success: true, totalQuantity: current };
}
async function addUserGold(userId, amount) {
    return await (0, inventoryManager_1.addItem)(userId, "saloon_token", amount);
}
async function removeUserGold(userId, amount) {
    return await (0, inventoryManager_1.removeItem)(userId, "saloon_token", amount);
}
async function transferGold(fromUserId, toUserId, amount) {
    return await (0, inventoryManager_1.transferItem)(fromUserId, toUserId, "saloon_token", amount);
}
function getUserSilver(userId) {
    return (0, inventoryManager_1.getItem)(userId, "silver");
}
async function setUserSilver(userId, amount) {
    const current = getUserSilver(userId);
    const diff = amount - current;
    if (diff > 0) {
        return await (0, inventoryManager_1.addItem)(userId, "silver", diff);
    }
    else if (diff < 0) {
        return await (0, inventoryManager_1.removeItem)(userId, "silver", Math.abs(diff));
    }
    return { success: true, totalQuantity: current };
}
async function addUserSilver(userId, amount) {
    return await (0, inventoryManager_1.addItem)(userId, "silver", amount);
}
async function removeUserSilver(userId, amount) {
    return await (0, inventoryManager_1.removeItem)(userId, "silver", amount);
}
async function transferSilver(fromUserId, toUserId, amount) {
    return await (0, inventoryManager_1.transferItem)(fromUserId, toUserId, "silver", amount);
}
function getBounties() {
    const data = fs_1.default.readFileSync(bountiesFile, "utf8");
    return JSON.parse(data);
}
function saveBounties(data) {
    fs_1.default.writeFileSync(bountiesFile, JSON.stringify(data, null, 2));
}
function addBounty(targetId, targetTag, posterId, posterTag, amount) {
    const bounties = getBounties();
    const existingIndex = bounties.findIndex((b) => b.targetId === targetId);
    if (existingIndex !== -1) {
        const existingBounty = bounties[existingIndex];
        const contributorIndex = existingBounty.contributors.findIndex((c) => c.id === posterId);
        if (contributorIndex !== -1) {
            existingBounty.contributors[contributorIndex].amount += amount;
        }
        else {
            existingBounty.contributors.push({
                id: posterId,
                tag: posterTag,
                amount: amount,
            });
        }
        existingBounty.totalAmount += amount;
        existingBounty.updatedAt = Date.now();
        bounties[existingIndex] = existingBounty;
    }
    else {
        bounties.push({
            targetId,
            targetTag,
            totalAmount: amount,
            contributors: [
                {
                    id: posterId,
                    tag: posterTag,
                    amount: amount,
                },
            ],
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });
    }
    saveBounties(bounties);
    return bounties;
}
function getBountyByTarget(targetId) {
    const bounties = getBounties();
    return bounties.find((b) => b.targetId === targetId);
}
function removeBounty(targetId) {
    const bounties = getBounties();
    const filtered = bounties.filter((b) => b.targetId !== targetId);
    saveBounties(filtered);
    return filtered;
}
function getAllBounties() {
    return getBounties();
}
function removeContribution(targetId, contributorId, amount) {
    const bounties = getBounties();
    const bountyIndex = bounties.findIndex((b) => b.targetId === targetId);
    if (bountyIndex === -1) {
        return false;
    }
    const bounty = bounties[bountyIndex];
    const contributorIndex = bounty.contributors.findIndex((c) => c.id === contributorId);
    if (contributorIndex === -1) {
        return false;
    }
    bounty.contributors[contributorIndex].amount -= amount;
    bounty.totalAmount -= amount;
    if (bounty.contributors[contributorIndex].amount <= 0) {
        bounty.contributors.splice(contributorIndex, 1);
    }
    if (bounty.contributors.length === 0) {
        bounties.splice(bountyIndex, 1);
    }
    else {
        bounty.updatedAt = Date.now();
        bounties[bountyIndex] = bounty;
    }
    saveBounties(bounties);
    return true;
}
function getWelcomeConfig(guildId) {
    const data = fs_1.default.readFileSync(welcomeFile, "utf8");
    const welcomeData = JSON.parse(data);
    return welcomeData[guildId] || null;
}
function setWelcomeConfig(guildId, config) {
    const data = fs_1.default.readFileSync(welcomeFile, "utf8");
    const welcomeData = JSON.parse(data);
    welcomeData[guildId] = {
        channelId: config.channelId,
        message: config.message,
        image: config.image || null,
        enabled: config.enabled !== false,
        updatedAt: Date.now(),
    };
    fs_1.default.writeFileSync(welcomeFile, JSON.stringify(welcomeData, null, 2));
    return welcomeData[guildId];
}
function removeWelcomeConfig(guildId) {
    const data = fs_1.default.readFileSync(welcomeFile, "utf8");
    const welcomeData = JSON.parse(data);
    delete welcomeData[guildId];
    fs_1.default.writeFileSync(welcomeFile, JSON.stringify(welcomeData, null, 2));
    return true;
}
function getLogConfig(guildId) {
    const data = fs_1.default.readFileSync(logsFile, "utf8");
    const logsData = JSON.parse(data);
    return logsData[guildId] || null;
}
function setLogConfig(guildId, config) {
    const data = fs_1.default.readFileSync(logsFile, "utf8");
    const logsData = JSON.parse(data);
    logsData[guildId] = {
        channelId: config.channelId,
        enabled: config.enabled !== false,
        types: config.types || [
            "command",
            "error",
            "welcome",
            "leave",
            "economy",
            "bounty",
            "mining",
            "gambling",
            "admin",
        ],
        updatedAt: Date.now(),
    };
    fs_1.default.writeFileSync(logsFile, JSON.stringify(logsData, null, 2));
    return logsData[guildId];
}
function removeLogConfig(guildId) {
    const data = fs_1.default.readFileSync(logsFile, "utf8");
    const logsData = JSON.parse(data);
    delete logsData[guildId];
    fs_1.default.writeFileSync(logsFile, JSON.stringify(logsData, null, 2));
    return true;
}
function getWantedConfig(guildId) {
    const data = fs_1.default.readFileSync(wantedFile, "utf8");
    const wantedData = JSON.parse(data);
    return wantedData[guildId] || null;
}
function setWantedConfig(guildId, config) {
    const data = fs_1.default.readFileSync(wantedFile, "utf8");
    const wantedData = JSON.parse(data);
    wantedData[guildId] = {
        channelId: config.channelId,
        enabled: config.enabled !== false,
        updatedAt: Date.now(),
    };
    fs_1.default.writeFileSync(wantedFile, JSON.stringify(wantedData, null, 2));
    return true;
}
function removeWantedConfig(guildId) {
    const data = fs_1.default.readFileSync(wantedFile, "utf8");
    const wantedData = JSON.parse(data);
    delete wantedData[guildId];
    fs_1.default.writeFileSync(wantedFile, JSON.stringify(wantedData, null, 2));
    return true;
}
//# sourceMappingURL=dataManager.js.map