"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startDailyRewardsScheduler = startDailyRewardsScheduler;
exports.stopDailyRewardsScheduler = stopDailyRewardsScheduler;
const node_cron_1 = __importDefault(require("node-cron"));
const discord_js_1 = require("discord.js");
const database_1 = require("./database");
const inventoryManager_1 = require("./inventoryManager");
const customEmojis_1 = require("./customEmojis");
const consoleLogger_1 = __importDefault(require("./consoleLogger"));
const i18n_1 = require("./i18n");
const REWARD_AMOUNTS = {
    saloon_token: 60,
    gold: 3,
    seal: 15,
};
const REWARD_HOUR = 21;
const REWARD_MINUTE = 0;
const REWARD_TIMEZONE = process.env.DAILY_REWARD_TZ || "America/Sao_Paulo";
let schedulerInstance = null;
function loadRewardState() {
    const data = (0, database_1.readData)("daily-rewards.json");
    if (!data || !data.userRewards) {
        return {
            userRewards: {},
        };
    }
    return data;
}
function updateRewardState(state) {
    (0, database_1.writeData)("daily-rewards.json", state);
}
function getEligibleUserIds() {
    try {
        const inventoryData = (0, database_1.readData)("inventory.json");
        if (!inventoryData || typeof inventoryData !== "object") {
            return [];
        }
        return Object.keys(inventoryData);
    }
    catch (error) {
        consoleLogger_1.default.error("Failed to get eligible user IDs", error);
        return [];
    }
}
function isSameDay(timestamp1, timestamp2) {
    const date1 = new Date(timestamp1);
    const date2 = new Date(timestamp2);
    return (date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate());
}
async function grantRewardToUser(client, userId, state) {
    try {
        const now = Date.now();
        const lastRewarded = state.userRewards[userId]?.lastRewardedAt || 0;
        if (isSameDay(lastRewarded, now)) {
            return false;
        }
        const inventory = (0, inventoryManager_1.getInventory)(userId);
        const currentWeight = (0, inventoryManager_1.calculateWeight)(inventory);
        const maxWeight = inventory.maxWeight;
        const goldWeight = 3 * 1;
        const sealWeight = 15 * 0.000001;
        const tokenWeight = 60 * 0.00001;
        const totalNeededWeight = goldWeight + sealWeight + tokenWeight;
        if (currentWeight + totalNeededWeight > maxWeight) {
            try {
                const user = await client.users.fetch(userId);
                const embed = new discord_js_1.EmbedBuilder()
                    .setColor("#FF6B6B")
                    .setTitle((0, i18n_1.tUser)(userId, "auto_daily_inventory_full_title"))
                    .setDescription((0, i18n_1.tUser)(userId, "auto_daily_inventory_full_desc", {
                    needed: totalNeededWeight.toFixed(2),
                    available: (maxWeight - currentWeight).toFixed(2),
                }))
                    .setFooter({
                    text: (0, i18n_1.tUser)(userId, "auto_daily_inventory_full_footer"),
                })
                    .setTimestamp();
                await user.send({ embeds: [embed] });
            }
            catch (dmError) {
                consoleLogger_1.default.debug(`Could not send inventory full DM to user ${userId}: DMs may be closed`);
            }
            consoleLogger_1.default.warn(`User ${userId} inventory too full for daily rewards (needs ${totalNeededWeight.toFixed(2)}kg, has ${(maxWeight - currentWeight).toFixed(2)}kg available)`);
            return false;
        }
        const tokenResult = await (0, inventoryManager_1.addItem)(userId, "saloon_token", REWARD_AMOUNTS.saloon_token);
        const goldResult = await (0, inventoryManager_1.addItem)(userId, "gold", REWARD_AMOUNTS.gold);
        const sealResult = await (0, inventoryManager_1.addItem)(userId, "seal", REWARD_AMOUNTS.seal);
        if (!tokenResult.success || !goldResult.success || !sealResult.success) {
            consoleLogger_1.default.error(`Failed to add daily rewards to user ${userId}: ${!tokenResult.success ? tokenResult.error : !goldResult.success ? goldResult.error : sealResult.error}`);
            return false;
        }
        try {
            const user = await client.users.fetch(userId);
            const embed = new discord_js_1.EmbedBuilder()
                .setColor("#FFD700")
                .setTitle((0, i18n_1.tUser)(userId, "auto_daily_reward_title"))
                .setDescription((0, i18n_1.tUser)(userId, "auto_daily_reward_desc", {
                token: (0, customEmojis_1.getSaloonTokenEmoji)(),
                tokenAmount: REWARD_AMOUNTS.saloon_token,
                gold: (0, customEmojis_1.getGoldBarEmoji)(),
                goldAmount: REWARD_AMOUNTS.gold,
                sealAmount: REWARD_AMOUNTS.seal,
            }))
                .setFooter({
                text: (0, i18n_1.tUser)(userId, "auto_daily_reward_footer", {
                    hour: REWARD_HOUR,
                }),
            })
                .setTimestamp();
            await user.send({ embeds: [embed] });
        }
        catch (dmError) {
            consoleLogger_1.default.debug(`Could not send daily reward DM to user ${userId}: DMs may be closed`);
        }
        if (!state.userRewards[userId]) {
            state.userRewards[userId] = { lastRewardedAt: now };
        }
        else {
            state.userRewards[userId].lastRewardedAt = now;
        }
        return true;
    }
    catch (error) {
        consoleLogger_1.default.error(`Error granting daily reward to user ${userId}`, error);
        return false;
    }
}
async function runDailyRewards(client) {
    try {
        consoleLogger_1.default.info("Starting daily rewards distribution...");
        const state = loadRewardState();
        const now = Date.now();
        if (state.lastGlobalRun && isSameDay(state.lastGlobalRun, now)) {
            consoleLogger_1.default.info("Daily rewards already distributed today, skipping");
            return;
        }
        const eligibleUsers = getEligibleUserIds();
        consoleLogger_1.default.info(`Found ${eligibleUsers.length} eligible users for daily rewards`);
        let successCount = 0;
        let failCount = 0;
        let skippedCount = 0;
        for (const userId of eligibleUsers) {
            const result = await grantRewardToUser(client, userId, state);
            if (result === true) {
                successCount++;
            }
            else if (result === false && state.userRewards[userId]?.lastRewardedAt && isSameDay(state.userRewards[userId].lastRewardedAt, now)) {
                skippedCount++;
            }
            else {
                failCount++;
            }
            if ((successCount + failCount + skippedCount) % 10 === 0) {
                await new Promise((resolve) => setTimeout(resolve, 100));
            }
        }
        state.lastGlobalRun = now;
        updateRewardState(state);
        consoleLogger_1.default.success(`Daily rewards distribution complete: ${successCount} granted, ${failCount} failed, ${skippedCount} already claimed`);
    }
    catch (error) {
        consoleLogger_1.default.error("Error during daily rewards distribution", error);
    }
}
async function checkAndRunBackfill(client) {
    try {
        const state = loadRewardState();
        const now = new Date();
        const currentHour = now.getHours();
        if (!state.lastGlobalRun) {
            consoleLogger_1.default.info("No previous daily rewards run found");
            if (currentHour >= REWARD_HOUR) {
                consoleLogger_1.default.info("Current time is past reward time, running backfill...");
                await runDailyRewards(client);
            }
            else {
                consoleLogger_1.default.info("Current time is before reward time, waiting for scheduled run");
            }
        }
        else {
            const lastRun = new Date(state.lastGlobalRun);
            if (!isSameDay(lastRun.getTime(), now.getTime()) && currentHour >= REWARD_HOUR) {
                consoleLogger_1.default.info("Missed daily rewards run detected, running backfill...");
                await runDailyRewards(client);
            }
        }
    }
    catch (error) {
        consoleLogger_1.default.error("Error during backfill check", error);
    }
}
function startDailyRewardsScheduler(client) {
    if (schedulerInstance) {
        consoleLogger_1.default.warn("Daily rewards scheduler already running");
        return;
    }
    const cronExpression = `${REWARD_MINUTE} ${REWARD_HOUR} * * *`;
    consoleLogger_1.default.info(`Starting daily rewards scheduler: ${cronExpression} (${REWARD_TIMEZONE})`);
    schedulerInstance = node_cron_1.default.schedule(cronExpression, async () => {
        consoleLogger_1.default.info("Daily rewards scheduler triggered");
        await runDailyRewards(client);
    }, {
        timezone: REWARD_TIMEZONE,
    });
    checkAndRunBackfill(client);
    consoleLogger_1.default.success(`Daily rewards scheduler started successfully (runs at ${REWARD_HOUR}:${REWARD_MINUTE.toString().padStart(2, "0")} ${REWARD_TIMEZONE})`);
}
function stopDailyRewardsScheduler() {
    if (schedulerInstance) {
        schedulerInstance.stop();
        schedulerInstance = null;
        consoleLogger_1.default.info("Daily rewards scheduler stopped");
    }
}
//# sourceMappingURL=dailyRewards.js.map