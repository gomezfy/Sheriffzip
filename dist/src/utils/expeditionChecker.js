"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkCompletedExpeditions = checkCompletedExpeditions;
exports.startExpeditionChecker = startExpeditionChecker;
const discord_js_1 = require("discord.js");
const database_1 = require("./database");
const inventoryManager_1 = require("./inventoryManager");
const dataManager_1 = require("./dataManager");
const xpManager_1 = require("./xpManager");
const i18n_1 = require("./i18n");
const customEmojis_1 = require("./customEmojis");
function calculateRewards(duration, partySize) {
    const EXPEDITION_DURATION_SHORT = 3 * 60 * 60 * 1000;
    if (duration === EXPEDITION_DURATION_SHORT) {
        return {
            silverMin: 10000,
            silverMax: 30000,
            goldBars: 8,
            wheatMin: 2000,
            wheatMax: 6000,
            honey: 10,
            xp: 1000,
        };
    }
    else {
        return {
            silverMin: 40000,
            silverMax: 100000,
            goldBars: 25,
            wheatMin: 8000,
            wheatMax: 15000,
            honey: 35,
            xp: 3500,
        };
    }
}
function distributeFairly(total, partySize) {
    const base = Math.floor(total / partySize);
    const remainder = total % partySize;
    const distribution = [];
    for (let i = 0; i < partySize; i++) {
        if (i < remainder) {
            distribution.push(base + 1);
        }
        else {
            distribution.push(base);
        }
    }
    return distribution;
}
async function sendNotification(client, memberId, memberRewards, totalRewards, partySize, duration, guildId, channelId, userLocale) {
    const silverEmoji = (0, customEmojis_1.getSilverCoinEmoji)();
    const goldEmoji = (0, customEmojis_1.getGoldBarEmoji)();
    const checkEmoji = (0, customEmojis_1.getCheckEmoji)();
    const moneybagEmoji = (0, customEmojis_1.getMoneybagEmoji)();
    const statsEmoji = (0, customEmojis_1.getStatsEmoji)();
    const starEmoji = (0, customEmojis_1.getStarEmoji)();
    // Use provided locale or fallback to user's saved locale
    const locale = userLocale || (0, i18n_1.tUser)(memberId, "") && "en-US"; // Get locale, fallback to en-US
    const t = (key, params = {}) => userLocale ? (0, i18n_1.tLocale)(userLocale, key, params) : (0, i18n_1.tUser)(memberId, key, params);
    const durationText = duration === 3 * 60 * 60 * 1000 ? "3h" : "10h";
    const rewardsSection = partySize > 1
        ? t("expedition_dm_rewards_divided", {
            moneybag: moneybagEmoji,
            count: partySize,
        })
        : t("expedition_dm_rewards_solo");
    const totalSection = partySize > 1
        ? t("expedition_dm_total_section", {
            stats: statsEmoji,
            silver: silverEmoji,
            silverAmount: totalRewards.silver.toLocaleString(),
            gold: goldEmoji,
            goldAmount: totalRewards.gold,
            wheat: "🌾",
            wheatAmount: totalRewards.wheat.toLocaleString(),
            honey: "🍯",
            honeyAmount: totalRewards.honey,
            star: starEmoji,
            xpAmount: totalRewards.xp.toLocaleString(),
        })
        : "";
    const description = `${t("expedition_dm_complete_desc", { duration: durationText })}${rewardsSection}\n${silverEmoji} **${memberRewards.silver.toLocaleString()}** ${t("silver_coins")}\n${goldEmoji} **${memberRewards.gold}x** ${t("gold_bars")}\n🌾 **${memberRewards.wheat.toLocaleString()}x** ${t("wheat_item")}\n🍯 **${memberRewards.honey}x** ${t("honey_item")}\n${starEmoji} **+${memberRewards.xp.toLocaleString()} XP**${totalSection}`;
    const dmEmbed = new discord_js_1.EmbedBuilder()
        .setColor("#00FF00")
        .setTitle(t("expedition_dm_complete_title", { check: checkEmoji }))
        .setDescription(description)
        .setFooter({ text: t("expedition_dm_footer") });
    try {
        const user = await client.users.fetch(memberId);
        await user.send({ embeds: [dmEmbed] });
        console.log(`✅ DM enviada para ${memberId}`);
        return true;
    }
    catch (error) {
        console.log(`⚠️ Não foi possível enviar DM para ${memberId}, tentando canal do servidor...`);
        if (guildId && channelId) {
            try {
                const guild = await client.guilds.fetch(guildId);
                const channel = await guild.channels.fetch(channelId);
                if (channel && channel.isTextBased()) {
                    await channel.send({
                        content: `<@${memberId}>`,
                        embeds: [dmEmbed],
                    });
                    console.log(`✅ Notificação enviada no canal para ${memberId}`);
                    return true;
                }
            }
            catch (channelError) {
                console.log(`❌ Falha ao enviar notificação no canal para ${memberId}:`, channelError);
            }
        }
        return false;
    }
}
async function checkCompletedExpeditions(client) {
    try {
        const expeditionData = (0, database_1.readData)("expedition.json");
        if (!expeditionData.parties)
            return 0;
        const now = Date.now();
        let completedCount = 0;
        const partyIds = Object.keys(expeditionData.parties);
        for (const partyId of partyIds) {
            const party = expeditionData.parties[partyId];
            if (party.endTime <= now && !party.rewardsGiven) {
                console.log(`🗺️ Processando expedição completada: ${partyId}`);
                const rewards = calculateRewards(party.duration, party.members.length);
                const silverCoins = Math.floor(Math.random() * (rewards.silverMax - rewards.silverMin + 1)) + rewards.silverMin;
                const goldBars = rewards.goldBars;
                const wheat = Math.floor(Math.random() * (rewards.wheatMax - rewards.wheatMin + 1)) + rewards.wheatMin;
                const honey = rewards.honey;
                const xp = rewards.xp;
                const partySize = party.members.length;
                const silverDistribution = distributeFairly(silverCoins, partySize);
                const goldDistribution = distributeFairly(goldBars, partySize);
                const wheatDistribution = distributeFairly(wheat, partySize);
                const honeyDistribution = distributeFairly(honey, partySize);
                const xpDistribution = distributeFairly(xp, partySize);
                party.totalRewards = {
                    silver: silverCoins,
                    gold: goldBars,
                    wheat: wheat,
                    honey: honey,
                    xp: xp,
                };
                for (let i = 0; i < party.members.length; i++) {
                    const memberId = party.members[i];
                    try {
                        const memberRewards = {
                            silver: silverDistribution[i],
                            gold: goldDistribution[i],
                            wheat: wheatDistribution[i],
                            honey: honeyDistribution[i],
                            xp: xpDistribution[i],
                        };
                        await (0, dataManager_1.addUserSilver)(memberId, memberRewards.silver);
                        await (0, inventoryManager_1.addItem)(memberId, "gold", memberRewards.gold);
                        await (0, inventoryManager_1.addItem)(memberId, "wheat", memberRewards.wheat);
                        await (0, inventoryManager_1.addItem)(memberId, "honey", memberRewards.honey);
                        (0, xpManager_1.addXp)(memberId, memberRewards.xp);
                        if (!expeditionData[memberId]) {
                            expeditionData[memberId] = { totalExpeditions: 0 };
                        }
                        const memberData = expeditionData[memberId];
                        memberData.activeExpedition = undefined;
                        memberData.lastExpedition = now;
                        memberData.totalExpeditions =
                            (memberData.totalExpeditions || 0) + 1;
                        const notificationSent = await sendNotification(client, memberId, memberRewards, party.totalRewards, partySize, party.duration, party.guildId, party.channelId, party.memberLocales?.[memberId]);
                        if (!party.dmSent)
                            party.dmSent = {};
                        party.dmSent[memberId] = notificationSent;
                        console.log(`✅ Recompensas dadas para ${memberId}: ${memberRewards.silver} silver, ${memberRewards.gold} gold, ${memberRewards.wheat} wheat, ${memberRewards.honey} honey`);
                    }
                    catch (error) {
                        console.log(`❌ Erro ao processar recompensas para ${memberId}:`, error);
                    }
                }
                party.rewardsGiven = true;
                completedCount++;
                // CRITICAL: Save immediately after processing each expedition to prevent duplication
                (0, database_1.writeData)("expedition.json", expeditionData);
                console.log(`✅ Expedição ${partyId} completada e recompensas distribuídas`);
            }
            if (party.rewardsGiven && party.endTime + 60 * 60 * 1000 < now) {
                delete expeditionData.parties[partyId];
                (0, database_1.writeData)("expedition.json", expeditionData);
                console.log(`🗑️ Expedição antiga removida: ${partyId}`);
            }
        }
        return completedCount;
    }
    catch (error) {
        console.error("❌ Erro ao verificar expedições completadas:", error);
        return 0;
    }
}
function startExpeditionChecker(client) {
    console.log("🗺️ Iniciando verificador automático de expedições");
    const interval = setInterval(async () => {
        try {
            const completed = await checkCompletedExpeditions(client);
            if (completed > 0) {
                console.log(`🗺️ ${completed} expedição(ões) completada(s) e processada(s)`);
            }
        }
        catch (error) {
            console.error("❌ Erro no verificador de expedições:", error);
        }
    }, 60 * 1000);
    console.log("✅ Verificador de expedições ativo - verifica a cada 1 minuto");
    return interval;
}
//# sourceMappingURL=expeditionChecker.js.map