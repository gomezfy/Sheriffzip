"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const discord_js_1 = require("discord.js");
const backupManager_1 = require("../utils/backupManager");
const consoleLogger_1 = __importDefault(require("../utils/consoleLogger"));
const registerHandlers_1 = require("./interaction-handlers/registerHandlers");
const canvasCache_1 = require("../utils/canvasCache");
module.exports = {
    name: discord_js_1.Events.ClientReady,
    once: true,
    execute(client) {
        // Display beautiful ready message
        consoleLogger_1.default.ready(client.user?.tag || "Unknown", client.guilds.cache.size, client.users.cache.size);
        // Register component handlers
        consoleLogger_1.default.info("Registering component handlers");
        (0, registerHandlers_1.registerAllHandlers)();
        // Start automatic backups
        consoleLogger_1.default.info("Starting automatic backup system");
        backupManager_1.backupManager.startAutomaticBackups();
        consoleLogger_1.default.success("Backup system initialized");
        // Pre-load common Canvas assets para performance
        consoleLogger_1.default.info("Pre-loading Canvas assets cache (iOS-like optimization)");
        (0, canvasCache_1.preloadCommonAssets)().catch(error => {
            consoleLogger_1.default.warn("Failed to preload some Canvas assets:", error);
        });
        const statusActivities = [
            { name: "Mantendo a paz no Velho Oeste", type: discord_js_1.ActivityType.Watching },
            { name: "Keeping peace in the Wild West", type: discord_js_1.ActivityType.Watching },
            { name: "Caçando bandidos no deserto", type: discord_js_1.ActivityType.Playing },
            { name: "Hunting outlaws in the desert", type: discord_js_1.ActivityType.Playing },
            { name: "Patrulhando o saloon", type: discord_js_1.ActivityType.Watching },
            { name: "Patrolling the saloon", type: discord_js_1.ActivityType.Watching },
            { name: "Contando recompensas", type: discord_js_1.ActivityType.Playing },
            { name: "Counting bounties", type: discord_js_1.ActivityType.Playing },
            { name: "Tarefas de xerife | /help", type: discord_js_1.ActivityType.Playing },
            { name: "Sheriff duties | /help", type: discord_js_1.ActivityType.Playing },
            { name: `${client.guilds.cache.size} cidades do Velho Oeste`, type: discord_js_1.ActivityType.Watching },
            { name: `${client.guilds.cache.size} Wild West towns`, type: discord_js_1.ActivityType.Watching },
            { name: "Mineradores de ouro", type: discord_js_1.ActivityType.Watching },
            { name: "Gold miners", type: discord_js_1.ActivityType.Watching },
            { name: "Pôquer no saloon", type: discord_js_1.ActivityType.Playing },
            { name: "Poker at the saloon", type: discord_js_1.ActivityType.Playing },
            { name: "Cartazes de procurados", type: discord_js_1.ActivityType.Watching },
            { name: "Wanted posters", type: discord_js_1.ActivityType.Watching },
            { name: "Duelos ao meio-dia", type: discord_js_1.ActivityType.Competing },
            { name: "Duels at high noon", type: discord_js_1.ActivityType.Competing },
        ];
        let currentIndex = 0;
        const updateStatus = () => {
            const activity = statusActivities[currentIndex];
            client.user?.setPresence({
                activities: [activity],
                status: "online",
            });
            currentIndex = (currentIndex + 1) % statusActivities.length;
        };
        updateStatus();
        setInterval(updateStatus, 60000);
        consoleLogger_1.default.info("Status rotation active (changes every 60 seconds)");
        consoleLogger_1.default.divider();
    },
};
//# sourceMappingURL=ready.js.map