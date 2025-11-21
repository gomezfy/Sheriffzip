"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.once = exports.name = void 0;
exports.execute = execute;
const discord_js_1 = require("discord.js");
const modLogs_1 = require("../utils/modLogs");
const dataManager_1 = require("../utils/dataManager");
const configManager_1 = require("../utils/configManager");
const welcomeEmbedBuilder_1 = require("../utils/welcomeEmbedBuilder");
exports.name = discord_js_1.Events.GuildMemberAdd;
exports.once = false;
async function execute(member) {
    await (0, modLogs_1.logMemberJoin)(member);
    try {
        let welcomeConfig = (0, dataManager_1.getWelcomeConfig)(member.guild.id);
        if (!welcomeConfig || !welcomeConfig.enabled) {
            const guildConfig = (0, configManager_1.loadGuildConfig)(member.guild.id);
            if (guildConfig.welcomeEnabled && guildConfig.welcomeChannel) {
                welcomeConfig = {
                    enabled: true,
                    channelId: guildConfig.welcomeChannel,
                    message: guildConfig.welcomeMessage || "Welcome {user} to {server}! 🤠",
                };
            }
        }
        if (welcomeConfig && welcomeConfig.enabled && welcomeConfig.channelId) {
            const channel = member.guild.channels.cache.get(welcomeConfig.channelId);
            if (channel && "send" in channel) {
                const welcomePayload = (0, welcomeEmbedBuilder_1.buildWelcomeEmbed)(welcomeConfig, member);
                await channel.send(welcomePayload);
            }
        }
    }
    catch (error) {
        console.error("Error sending welcome message:", error);
    }
}
//# sourceMappingURL=guildMemberAdd.js.map