"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAutoWanted = createAutoWanted;
const discord_js_1 = require("discord.js");
const dataManager_1 = require("./dataManager");
const wantedPoster_1 = require("./wantedPoster");
const configManager_1 = require("./configManager");
async function createAutoWanted(client, guildId, escapee, stolenAmount) {
    try {
        const percentage = 0.5 + Math.random() * 0.2;
        let bountyAmount = Math.floor(stolenAmount * percentage);
        bountyAmount = Math.max(500, Math.min(5000, bountyAmount));
        const sheriffId = client.user.id;
        const sheriffTag = "🚨 Sheriff";
        (0, dataManager_1.addBounty)(escapee.id, escapee.tag, sheriffId, sheriffTag, bountyAmount);
        const bounty = (0, dataManager_1.getBountyByTarget)(escapee.id);
        const posterBuffer = await (0, wantedPoster_1.generateWantedPoster)(escapee, bounty.totalAmount);
        const attachment = new discord_js_1.AttachmentBuilder(posterBuffer, {
            name: "wanted.png",
        });
        const embed = new discord_js_1.EmbedBuilder()
            .setColor("#FF0000")
            .setTitle("🚨 WANTED - BANK ROBBERY ESCAPEE!")
            .setDescription(`**${escapee.tag}** escaped from the Sheriff during a bank robbery!\n\nThe law is offering a reward for their capture!`)
            .addFields({ name: "🎯 Fugitive", value: escapee.tag, inline: true }, {
            name: "💰 Bounty",
            value: `🪙 ${bounty.totalAmount.toLocaleString()} Silver Coins`,
            inline: true,
        }, { name: "⚖️ Crime", value: "Bank Robbery", inline: true })
            .setImage("attachment://wanted.png")
            .setFooter({ text: "Use /claim to capture this fugitive!" })
            .setTimestamp();
        try {
            const guild = client.guilds.cache.get(guildId);
            if (guild) {
                let channelId = null;
                const dashboardConfig = (0, configManager_1.loadGuildConfig)(guildId);
                if (dashboardConfig.wantedEnabled && dashboardConfig.wantedChannel) {
                    channelId = dashboardConfig.wantedChannel;
                }
                if (!channelId) {
                    const wantedConfig = (0, dataManager_1.getWantedConfig)(guildId);
                    if (wantedConfig && wantedConfig.enabled && wantedConfig.channelId) {
                        channelId = wantedConfig.channelId;
                    }
                }
                if (!channelId) {
                    if (dashboardConfig.logsEnabled && dashboardConfig.logsChannel) {
                        channelId = dashboardConfig.logsChannel;
                    }
                }
                if (!channelId) {
                    const oldConfig = (0, dataManager_1.getLogConfig)(guildId);
                    if (oldConfig && oldConfig.enabled && oldConfig.channelId) {
                        channelId = oldConfig.channelId;
                    }
                }
                if (channelId) {
                    const channel = guild.channels.cache.get(channelId);
                    if (channel && channel.isTextBased()) {
                        await channel.send({ embeds: [embed], files: [attachment] });
                    }
                }
            }
        }
        catch (error) {
            console.error("Error posting wanted poster to channel:", error);
        }
        return {
            success: true,
            bounty: bounty,
            amount: bountyAmount,
            poster: attachment,
            embed: embed,
        };
    }
    catch (error) {
        console.error("Error creating auto wanted:", error);
        return {
            success: false,
            error: error.message,
        };
    }
}
//# sourceMappingURL=autoWanted.js.map