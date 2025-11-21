"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBankAccount = getBankAccount;
exports.saveBankAccount = saveBankAccount;
exports.depositTokens = depositTokens;
exports.withdrawTokens = withdrawTokens;
exports.depositSilver = depositSilver;
exports.withdrawSilver = withdrawSilver;
exports.getTotalWealth = getTotalWealth;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const cacheManager_1 = require("./cacheManager");
const database_1 = require("./database");
const dataManager_1 = require("./dataManager");
const dataDir = (0, database_1.getDataPath)("data");
const bankFile = path_1.default.join(dataDir, "bank.json");
if (!fs_1.default.existsSync(dataDir)) {
    fs_1.default.mkdirSync(dataDir, { recursive: true });
}
if (!fs_1.default.existsSync(bankFile)) {
    fs_1.default.writeFileSync(bankFile, JSON.stringify({}, null, 2));
}
function getBankAccount(userId) {
    const defaultAccount = {
        saloon_tokens: 0,
        silver: 0,
        lastUpdate: Date.now(),
    };
    const cached = cacheManager_1.cacheManager.get("bank", userId);
    if (cached !== null) {
        return cached;
    }
    try {
        const data = fs_1.default.readFileSync(bankFile, "utf8");
        const accounts = JSON.parse(data);
        if (!accounts[userId]) {
            cacheManager_1.cacheManager.set("bank", userId, defaultAccount, true);
            return defaultAccount;
        }
        cacheManager_1.cacheManager.set("bank", userId, accounts[userId], false);
        return accounts[userId];
    }
    catch (error) {
        console.error("Error reading bank account:", error);
        cacheManager_1.cacheManager.set("bank", userId, defaultAccount, true);
        return defaultAccount;
    }
}
function saveBankAccount(userId, account) {
    account.lastUpdate = Date.now();
    cacheManager_1.cacheManager.set("bank", userId, account, true);
}
/**
 * Deposit saloon tokens from wallet to bank
 */
async function depositTokens(userId, amount) {
    if (amount <= 0) {
        return { success: false, message: "Amount must be greater than 0" };
    }
    const walletBalance = (0, dataManager_1.getUserGold)(userId);
    if (walletBalance < amount) {
        return { success: false, message: "Insufficient balance in wallet" };
    }
    const removeResult = await (0, dataManager_1.removeUserGold)(userId, amount);
    if (!removeResult.success) {
        return { success: false, message: "Failed to remove tokens from wallet" };
    }
    const account = getBankAccount(userId);
    account.saloon_tokens += amount;
    saveBankAccount(userId, account);
    return { success: true, message: `Deposited ${amount} tokens` };
}
/**
 * Withdraw saloon tokens from bank to wallet
 */
async function withdrawTokens(userId, amount) {
    if (amount <= 0) {
        return { success: false, message: "Amount must be greater than 0" };
    }
    const account = getBankAccount(userId);
    if (account.saloon_tokens < amount) {
        return { success: false, message: "Insufficient balance in bank" };
    }
    account.saloon_tokens -= amount;
    saveBankAccount(userId, account);
    await (0, dataManager_1.addUserGold)(userId, amount);
    return { success: true, message: `Withdrawn ${amount} tokens` };
}
/**
 * Deposit silver from wallet to bank
 */
async function depositSilver(userId, amount) {
    if (amount <= 0) {
        return { success: false, message: "Amount must be greater than 0" };
    }
    const walletBalance = (0, dataManager_1.getUserSilver)(userId);
    if (walletBalance < amount) {
        return { success: false, message: "Insufficient balance in wallet" };
    }
    const removeResult = await (0, dataManager_1.removeUserSilver)(userId, amount);
    if (!removeResult.success) {
        return { success: false, message: "Failed to remove silver from wallet" };
    }
    const account = getBankAccount(userId);
    account.silver += amount;
    saveBankAccount(userId, account);
    return { success: true, message: `Deposited ${amount} silver` };
}
/**
 * Withdraw silver from bank to wallet
 */
async function withdrawSilver(userId, amount) {
    if (amount <= 0) {
        return { success: false, message: "Amount must be greater than 0" };
    }
    const account = getBankAccount(userId);
    if (account.silver < amount) {
        return { success: false, message: "Insufficient balance in bank" };
    }
    account.silver -= amount;
    saveBankAccount(userId, account);
    await (0, dataManager_1.addUserSilver)(userId, amount);
    return { success: true, message: `Withdrawn ${amount} silver` };
}
/**
 * Get total wealth (wallet + bank)
 */
function getTotalWealth(userId) {
    const walletTokens = (0, dataManager_1.getUserGold)(userId);
    const walletSilver = (0, dataManager_1.getUserSilver)(userId);
    const account = getBankAccount(userId);
    const totalTokens = walletTokens + account.saloon_tokens;
    const totalSilver = walletSilver + account.silver;
    return {
        tokens: totalTokens,
        silver: totalSilver,
        total: totalTokens + totalSilver,
    };
}
//# sourceMappingURL=bankManager.js.map