"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfigs = loadConfigs;
exports.loadGuildConfig = loadGuildConfig;
exports.saveGuildConfig = saveGuildConfig;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const database_1 = require("./database");
const configPath = path_1.default.join((0, database_1.getDataPath)("data"), "guild-config.json");
function ensureConfigFile() {
    const dataDir = path_1.default.dirname(configPath);
    if (!fs_1.default.existsSync(dataDir)) {
        fs_1.default.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs_1.default.existsSync(configPath)) {
        fs_1.default.writeFileSync(configPath, "{}");
    }
}
function loadConfigs() {
    ensureConfigFile();
    const data = fs_1.default.readFileSync(configPath, "utf-8");
    return JSON.parse(data);
}
function loadGuildConfig(guildId) {
    const configs = loadConfigs();
    return (configs[guildId] || {
        logsEnabled: false,
        logsChannel: "",
        welcomeEnabled: false,
        welcomeChannel: "",
        welcomeMessage: "Welcome {user} to {server}! 🤠",
        wantedEnabled: false,
        wantedChannel: "",
        language: "en-US",
    });
}
function saveGuildConfig(guildId, config) {
    ensureConfigFile();
    const configs = loadConfigs();
    configs[guildId] = config;
    fs_1.default.writeFileSync(configPath, JSON.stringify(configs, null, 2));
}
//# sourceMappingURL=configManager.js.map