"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActiveSessions = getActiveSessions;
exports.getUnclaimedSessions = getUnclaimedSessions;
exports.getMiningStats = getMiningStats;
exports.formatTime = formatTime;
exports.cleanupOldSessions = cleanupOldSessions;
exports.notifyCompletedMining = notifyCompletedMining;
exports.startMiningNotifications = startMiningNotifications;
const database_1 = require("./database");
const discord_js_1 = require("discord.js");
const customEmojis_1 = require("./customEmojis");
const i18n_1 = require("./i18n");
/**
 * Get all active mining sessions (not claimed and not expired)
 */
function getActiveSessions() {
    const data = (0, database_1.readData)("mining.json");
    const now = Date.now();
    const activeSessions = [];
    for (const [userId, session] of Object.entries(data)) {
        // Only include sessions that are not claimed and not expired
        if (!session.claimed && session.endTime > now) {
            activeSessions.push({ userId, session });
        }
    }
    return activeSessions;
}
/**
 * Get all completed but unclaimed mining sessions
 */
function getUnclaimedSessions() {
    const data = (0, database_1.readData)("mining.json");
    const now = Date.now();
    const unclaimedSessions = [];
    for (const [userId, session] of Object.entries(data)) {
        // Sessions that are complete but not claimed
        if (!session.claimed && session.endTime <= now) {
            unclaimedSessions.push({ userId, session });
        }
    }
    return unclaimedSessions;
}
/**
 * Get mining statistics
 */
function getMiningStats() {
    const activeSessions = getActiveSessions();
    const unclaimedSessions = getUnclaimedSessions();
    const soloMining = activeSessions.filter((s) => s.session.type === "solo").length;
    const coopMining = activeSessions.filter((s) => s.session.type === "coop").length;
    const totalGoldPending = [...activeSessions, ...unclaimedSessions].reduce((sum, s) => sum + s.session.goldAmount, 0);
    return {
        totalActive: activeSessions.length,
        soloMining,
        coopMining,
        unclaimed: unclaimedSessions.length,
        totalGoldPending,
    };
}
/**
 * Format time remaining
 * @param ms
 */
function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
    }
    else if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
}
/**
 * Clean up old claimed sessions (older than 24 hours)
 */
function cleanupOldSessions() {
    const data = (0, database_1.readData)("mining.json");
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    let cleaned = 0;
    for (const [userId, session] of Object.entries(data)) {
        // Remove sessions that are claimed and older than 24 hours
        if (session.claimed && session.endTime < oneDayAgo) {
            delete data[userId];
            cleaned++;
        }
    }
    if (cleaned > 0) {
        (0, database_1.writeData)("mining.json", data);
    }
    return cleaned;
}
/**
 * Check for completed mining sessions and send DM notifications
 * @param client
 */
async function notifyCompletedMining(client) {
    try {
        const data = (0, database_1.readData)("mining.json");
        const now = Date.now();
        let notified = 0;
        let dataModified = false;
        for (const [userId, session] of Object.entries(data)) {
            // Only notify if: mining complete, not claimed, and not already notified
            if (!session.claimed && session.endTime <= now && !session.notified) {
                try {
                    const user = await client.users.fetch(userId);
                    const goldEmoji = (0, customEmojis_1.getGoldBarEmoji)();
                    const checkEmoji = (0, customEmojis_1.getCheckEmoji)();
                    const moneybagEmoji = (0, customEmojis_1.getMoneybagEmoji)();
                    const gemEmoji = (0, customEmojis_1.getGemEmoji)();
                    const miningType = session.type === "solo"
                        ? (0, i18n_1.tUser)(userId, "mine_dm_type_solo")
                        : (0, i18n_1.tUser)(userId, "mine_dm_type_coop");
                    const goldBarsText = (0, i18n_1.tUser)(userId, "gold_bars");
                    const embed = new discord_js_1.EmbedBuilder()
                        .setColor(0x00ff00)
                        .setTitle(`${checkEmoji} ${(0, i18n_1.tUser)(userId, "mine_dm_complete_title")}`)
                        .setDescription(`${(0, i18n_1.tUser)(userId, "mine_dm_complete_desc")}\n\n${moneybagEmoji} **${(0, i18n_1.tUser)(userId, "mine_reward")}:** ${session.goldAmount} ${goldEmoji} ${goldBarsText}!`)
                        .addFields({
                        name: (0, i18n_1.tUser)(userId, "mine_dm_type_label"),
                        value: miningType,
                        inline: true,
                    }, {
                        name: `${gemEmoji} ${(0, i18n_1.tUser)(userId, "mine_dm_gold_available")}`,
                        value: `${session.goldAmount} ${goldEmoji}`,
                        inline: true,
                    })
                        .setFooter({ text: (0, i18n_1.tUser)(userId, "mine_dm_footer") })
                        .setTimestamp();
                    await user.send({ embeds: [embed] });
                    // Mark as notified
                    session.notified = true;
                    dataModified = true;
                    notified++;
                    console.log(`⛏️ Sent mining completion DM to ${user.tag}`);
                }
                catch (error) {
                    console.error(`❌ Failed to send mining DM to user ${userId}:`, error);
                    // Mark as notified anyway to avoid spam attempts
                    session.notified = true;
                    dataModified = true;
                }
                // Small delay to avoid rate limiting
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }
        }
        // Save updated data if any session was modified (success or failure)
        if (dataModified) {
            (0, database_1.writeData)("mining.json", data);
        }
        return notified;
    }
    catch (error) {
        console.error("❌ Error in notifyCompletedMining:", error);
        return 0;
    }
}
/**
 * Start automatic mining notification system
 * Checks every 2 minutes for completed mining sessions
 * @param client
 */
function startMiningNotifications(client) {
    console.log("⛏️ Starting automatic mining notification system");
    // Run immediately on startup
    notifyCompletedMining(client).catch((error) => {
        console.error("❌ Error in initial mining notification check:", error);
    });
    // Then check every 2 minutes
    const interval = setInterval(async () => {
        try {
            const notified = await notifyCompletedMining(client);
            if (notified > 0) {
                console.log(`⛏️ Notified ${notified} users about completed mining`);
            }
        }
        catch (error) {
            console.error("❌ Error in mining notification interval:", error);
        }
    }, 2 * 60 * 1000); // Check every 2 minutes
    return interval;
}
//# sourceMappingURL=miningTracker.js.map