"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startEventScheduler = startEventScheduler;
exports.stopEventScheduler = stopEventScheduler;
exports.manualStartEvent = manualStartEvent;
const node_cron_1 = __importDefault(require("node-cron"));
const discord_js_1 = require("discord.js");
const eventManager_1 = require("./eventManager");
const consoleLogger_1 = __importDefault(require("./consoleLogger"));
let eventStartScheduler = null;
let eventCheckInterval = null;
/**
 * Start event scheduler
 * Events start every Sunday at 23:59
 */
async function startEventScheduler(client, notificationChannelId) {
    if (eventStartScheduler) {
        consoleLogger_1.default.warn("Event scheduler already running");
        return;
    }
    // Schedule events to start every Sunday at 23:59 (America/Sao_Paulo timezone)
    const cronExpression = "59 23 * * 0"; // Every Sunday at 23:59
    consoleLogger_1.default.info(`Starting event scheduler: ${cronExpression} (America/Sao_Paulo)`);
    eventStartScheduler = node_cron_1.default.schedule(cronExpression, async () => {
        try {
            consoleLogger_1.default.info("🏆 Event scheduler triggered - Checking for mining event start");
            // Check if there's already an active event
            const existingEvent = (0, eventManager_1.getCurrentEvent)();
            if (existingEvent && existingEvent.active) {
                consoleLogger_1.default.warn("⚠️  CRON SKIP: Active event already exists, not starting new event");
                consoleLogger_1.default.warn(`   Existing event ID: ${existingEvent.id}`);
                consoleLogger_1.default.warn(`   Started: ${new Date(existingEvent.startTime).toISOString()}`);
                consoleLogger_1.default.warn(`   This may indicate a stuck payout or manual event - check event status`);
                return;
            }
            consoleLogger_1.default.info("🏆 Starting new mining event");
            const event = await (0, eventManager_1.startMiningEvent)(client, notificationChannelId);
            consoleLogger_1.default.success(`Mining event started! ID: ${event.id}`);
            // Send notification if channel is set
            if (notificationChannelId) {
                try {
                    const channel = await client.channels.fetch(notificationChannelId);
                    if (channel instanceof discord_js_1.TextChannel) {
                        await channel.send({
                            content: "🏆 **EVENTO DE MINERAÇÃO INICIADO!**\n\n⛏️ O evento de 48h começou! (Domingo 23:59 até Terça 23:59)\n💰 Mine ouro e ganhe pontos: **1 ouro = 40 pontos**\n🥇 Top 10 ganham prêmios incríveis!\n\n📊 Use `/evento` para ver o ranking!",
                        });
                    }
                }
                catch (error) {
                    consoleLogger_1.default.error("Failed to send event start notification:", error);
                }
            }
        }
        catch (error) {
            consoleLogger_1.default.error("Error starting mining event:", error);
        }
    }, {
        timezone: "America/Sao_Paulo",
    });
    // Check every minute if event should end
    eventCheckInterval = setInterval(async () => {
        try {
            const ended = await (0, eventManager_1.checkAndEndEvent)(client);
            if (ended) {
                consoleLogger_1.default.success("🏆 Mining event ended and rewards distributed!");
            }
        }
        catch (error) {
            consoleLogger_1.default.error("Error checking/ending event:", error);
        }
    }, 60 * 1000); // Every 1 minute
    consoleLogger_1.default.success("Event scheduler started successfully (runs every Sunday at 23:59 America/Sao_Paulo)");
    // Check if it's Sunday and no event is active - start one immediately
    // This ensures events start even if bot restarts during Sunday
    const now = new Date();
    const currentEvent = (0, eventManager_1.getCurrentEvent)();
    if ((0, eventManager_1.isSunday)() && (!currentEvent || !currentEvent.active)) {
        // Check if we're still within the 48h window from midnight
        const sundayMidnight = new Date(now);
        sundayMidnight.setHours(0, 0, 0, 0);
        const hoursSinceMidnight = (now.getTime() - sundayMidnight.getTime()) / (1000 * 60 * 60);
        // Only start if less than 48 hours have passed since Sunday midnight
        if (hoursSinceMidnight < 48) {
            consoleLogger_1.default.info("It's Sunday and no active event - starting event immediately");
            try {
                const event = await (0, eventManager_1.startMiningEvent)(client, notificationChannelId);
                consoleLogger_1.default.success(`Mining event started immediately! ID: ${event.id}`);
                // Send notification if channel is set
                if (notificationChannelId) {
                    try {
                        const channel = await client.channels.fetch(notificationChannelId);
                        if (channel instanceof discord_js_1.TextChannel) {
                            await channel.send({
                                content: "🏆 **EVENTO DE MINERAÇÃO INICIADO!**\n\n⛏️ O evento de 48h começou! (Domingo 23:59 até Terça 23:59)\n💰 Mine ouro e ganhe pontos: **1 ouro = 40 pontos**\n🥇 Top 10 ganham prêmios incríveis!\n\n📊 Use `/evento` para ver o ranking!",
                            });
                        }
                    }
                    catch (error) {
                        consoleLogger_1.default.error("Failed to send immediate event notification:", error);
                    }
                }
            }
            catch (error) {
                consoleLogger_1.default.error("Error starting immediate event:", error);
            }
        }
    }
}
/**
 * Stop event scheduler
 */
function stopEventScheduler() {
    if (eventStartScheduler) {
        eventStartScheduler.stop();
        eventStartScheduler = null;
        consoleLogger_1.default.info("Event start scheduler stopped");
    }
    if (eventCheckInterval) {
        clearInterval(eventCheckInterval);
        eventCheckInterval = null;
        consoleLogger_1.default.info("Event check interval stopped");
    }
}
/**
 * Manual start event (for testing or admin commands)
 */
async function manualStartEvent(client, notificationChannelId) {
    const event = await (0, eventManager_1.startMiningEvent)(client, notificationChannelId);
    consoleLogger_1.default.success(`Mining event manually started! ID: ${event.id}`);
}
//# sourceMappingURL=eventScheduler.js.map