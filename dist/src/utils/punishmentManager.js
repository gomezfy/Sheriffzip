"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyPunishment = applyPunishment;
exports.isPunished = isPunished;
exports.getRemainingTime = getRemainingTime;
exports.removePunishment = removePunishment;
exports.formatTime = formatTime;
const fs_1 = __importDefault(require("fs"));
const database_1 = require("./database");
const path_1 = __importDefault(require("path"));
const dataDir = (0, database_1.getDataPath)("data");
const punishmentFile = path_1.default.join(dataDir, "punishment.json");
// Ensure data directory exists
if (!fs_1.default.existsSync(dataDir)) {
    fs_1.default.mkdirSync(dataDir, { recursive: true });
}
// Ensure punishment file exists
if (!fs_1.default.existsSync(punishmentFile)) {
    fs_1.default.writeFileSync(punishmentFile, JSON.stringify({}, null, 2));
}
function getPunishments() {
    const data = fs_1.default.readFileSync(punishmentFile, "utf8");
    return JSON.parse(data);
}
function savePunishments(data) {
    fs_1.default.writeFileSync(punishmentFile, JSON.stringify(data, null, 2));
}
function applyPunishment(userId, reason = "Captured by Sheriff") {
    const punishments = getPunishments();
    const now = Date.now();
    const duration = 30 * 60 * 1000;
    const expiresAt = now + duration;
    punishments[userId] = {
        reason,
        appliedAt: now,
        expiresAt,
        duration,
    };
    savePunishments(punishments);
    return punishments[userId];
}
function isPunished(userId) {
    const punishments = getPunishments();
    const punishment = punishments[userId];
    if (!punishment) {
        return null;
    }
    const now = Date.now();
    if (now >= punishment.expiresAt) {
        delete punishments[userId];
        savePunishments(punishments);
        return null;
    }
    return punishment;
}
function getRemainingTime(userId) {
    const punishment = isPunished(userId);
    if (!punishment) {
        return null;
    }
    return punishment.expiresAt - Date.now();
}
function removePunishment(userId) {
    const punishments = getPunishments();
    if (!punishments[userId]) {
        return false;
    }
    delete punishments[userId];
    savePunishments(punishments);
    return true;
}
function formatTime(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
}
//# sourceMappingURL=punishmentManager.js.map