"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEventsData = getEventsData;
exports.saveEventsData = saveEventsData;
exports.startMiningEvent = startMiningEvent;
exports.addEventGold = addEventGold;
exports.getCurrentEvent = getCurrentEvent;
exports.getAllActiveEvents = getAllActiveEvents;
exports.getEventById = getEventById;
exports.getEventLeaderboard = getEventLeaderboard;
exports.updateEventPhase = updateEventPhase;
exports.sendEventStartNotification = sendEventStartNotification;
exports.checkAndEndEvent = checkAndEndEvent;
exports.getTimeUntilNextEvent = getTimeUntilNextEvent;
exports.getNextSundayDate = getNextSundayDate;
exports.formatTimeRemaining = formatTimeRemaining;
exports.isSunday = isSunday;
exports.startHuntingEvent = startHuntingEvent;
exports.addHuntingEventStats = addHuntingEventStats;
exports.getHuntingEventLeaderboard = getHuntingEventLeaderboard;
exports.getCurrentHuntingEvent = getCurrentHuntingEvent;
exports.checkAndEndHuntingEvent = checkAndEndHuntingEvent;
const database_1 = require("./database");
const inventoryManager_1 = require("./inventoryManager");
const xpManager_1 = require("./xpManager");
const discord_js_1 = require("discord.js");
const customEmojis_1 = require("./customEmojis");
/**
 * Get events data
 */
function getEventsData() {
    const data = (0, database_1.readData)("events.json");
    if (!data.currentEvent && !data.history && !data.activeEvents) {
        return { currentEvent: null, activeEvents: [], history: [] };
    }
    if (!data.activeEvents) {
        data.activeEvents = [];
        if (data.currentEvent && data.currentEvent.active) {
            data.activeEvents.push(data.currentEvent);
        }
    }
    return data;
}
/**
 * Save events data
 */
function saveEventsData(data) {
    (0, database_1.writeData)("events.json", data);
}
/**
 * Start a new mining event (48h duration, starts at 00:00 Sunday, ends Tuesday 00:00)
 */
async function startMiningEvent(client, notificationChannelId, eventName) {
    const now = Date.now();
    const eventId = `mining_${now}`;
    // Nome fixo global: "Corrida do Ouro"
    const defaultName = eventName || "Corrida do Ouro";
    const newEvent = {
        id: eventId,
        name: defaultName,
        type: "mining",
        startTime: now,
        endTime: now + (48 * 60 * 60 * 1000), // 48 hours (Sunday 00:00 to Tuesday 00:00)
        active: true,
        phase: 0,
        participants: {},
        notificationChannelId,
    };
    const data = getEventsData();
    data.currentEvent = newEvent;
    saveEventsData(data);
    // Enviar notificações de início do evento via DM
    if (client) {
        sendEventStartNotification(client, newEvent).catch(error => {
            console.error("❌ Erro ao enviar notificações de início:", error);
        });
    }
    return newEvent;
}
/**
 * Add gold mined to user's event participation
 * 1 ouro = 40 pontos
 */
function addEventGold(userId, username, goldAmount) {
    const data = getEventsData();
    if (!data.currentEvent || !data.currentEvent.active) {
        return false;
    }
    if (!data.currentEvent.participants[userId]) {
        data.currentEvent.participants[userId] = {
            userId,
            username,
            goldMined: 0,
            points: 0,
        };
    }
    data.currentEvent.participants[userId].goldMined += goldAmount;
    data.currentEvent.participants[userId].points += goldAmount * 40; // 1 ouro = 40 pontos
    saveEventsData(data);
    return true;
}
/**
 * Get current event
 */
function getCurrentEvent() {
    const data = getEventsData();
    return data.currentEvent;
}
/**
 * Get all active events
 */
function getAllActiveEvents() {
    const data = getEventsData();
    const activeEvents = [];
    // Include currentEvent if active (for backward compatibility)
    if (data.currentEvent && data.currentEvent.active) {
        activeEvents.push(data.currentEvent);
    }
    // Include all events from activeEvents array
    if (data.activeEvents) {
        data.activeEvents.forEach(event => {
            if (event.active && !activeEvents.find(e => e.id === event.id)) {
                activeEvents.push(event);
            }
        });
    }
    return activeEvents;
}
/**
 * Get event by ID
 */
function getEventById(eventId) {
    const data = getEventsData();
    if (data.currentEvent && data.currentEvent.id === eventId) {
        return data.currentEvent;
    }
    if (data.activeEvents) {
        const event = data.activeEvents.find(e => e.id === eventId);
        if (event)
            return event;
    }
    return null;
}
/**
 * Get event leaderboard (sorted by points)
 */
function getEventLeaderboard() {
    const event = getCurrentEvent();
    if (!event)
        return [];
    const participants = Object.values(event.participants);
    return participants.sort((a, b) => b.points - a.points);
}
/**
 * Update event phase based on elapsed time
 * 7 phases (0-6): each phase represents ~14.3% of the total event duration
 */
function updateEventPhase() {
    const data = getEventsData();
    if (!data.currentEvent || !data.currentEvent.active) {
        return;
    }
    const now = Date.now();
    const totalDuration = data.currentEvent.endTime - data.currentEvent.startTime;
    const elapsed = now - data.currentEvent.startTime;
    const progress = Math.min(1, elapsed / totalDuration);
    // 7 phases (0-6): phase progresses every ~14.3% (1/7)
    const newPhase = Math.min(6, Math.floor(progress / (1 / 7)));
    if (newPhase !== data.currentEvent.phase) {
        data.currentEvent.phase = newPhase;
        saveEventsData(data);
    }
}
/**
 * Send DM to winner with their rewards
 */
async function sendWinnerDM(client, userId, position, rewards) {
    try {
        const user = await client.users.fetch(userId);
        const medals = [(0, customEmojis_1.getGoldMedalEmoji)(), (0, customEmojis_1.getSilverMedalEmoji)(), (0, customEmojis_1.getBronzeMedalEmoji)()];
        const positionText = position <= 3 ? medals[position - 1] : `#${position}`;
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(position === 1 ? 0xFFD700 : position === 2 ? 0xC0C0C0 : position === 3 ? 0xCD7F32 : 0xFF6B00)
            .setTitle(`${positionText} PARABÉNS! VOCÊ VENCEU A CORRIDA DO OURO!`)
            .setDescription(`Você conquistou a **${position}ª posição** no evento de mineração!\n\n` +
            `⛏️ **Ouro Minerado:** ${rewards.goldMined} barras\n` +
            `🏆 **Pontos:** ${rewards.points.toLocaleString()}\n\n` +
            `**🎁 SEUS PRÊMIOS:**`)
            .addFields({
            name: "💰 Silver",
            value: `${rewards.silver.toLocaleString()} ${(0, customEmojis_1.getSilverCoinEmoji)()}`,
            inline: true,
        }, {
            name: `${(0, customEmojis_1.getSaloonTokenEmoji)()} Tokens`,
            value: `${rewards.tokens}x`,
            inline: true,
        }, {
            name: "⭐ XP",
            value: `+${rewards.xp.toLocaleString()}`,
            inline: true,
        })
            .setFooter({ text: "Os prêmios foram adicionados ao seu inventário!" })
            .setTimestamp();
        await user.send({ embeds: [embed] });
        console.log(`✅ DM de prêmio enviada para ${user.tag} (posição ${position})`);
    }
    catch (error) {
        console.error(`❌ Falha ao enviar DM de prêmio para usuário ${userId}:`, error);
    }
}
/**
 * Send DM notification when event starts
 */
async function sendEventStartNotification(client, event) {
    try {
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(0xFF6B00)
            .setTitle(`🏆 ${event.name.toUpperCase()} COMEÇOU!`)
            .setDescription(`O evento de mineração semanal está ativo agora!\n\n` +
            `⏱️ **Duração:** 48 horas (Domingo 00:00 até Terça 00:00)\n` +
            `💰 **Como participar:** Use \`/mine\` para minerar ouro\n` +
            `🏆 **Pontos:** 1 barra de ouro = 40 pontos\n\n` +
            `**🎁 PRÊMIOS TOP 10:**\n` +
            `${(0, customEmojis_1.getGoldMedalEmoji)()} 1º lugar: 300.000 ${(0, customEmojis_1.getSilverCoinEmoji)()} + 300 ${(0, customEmojis_1.getSaloonTokenEmoji)()} + 3.500 XP\n` +
            `${(0, customEmojis_1.getSilverMedalEmoji)()} 2º lugar: 200.000 ${(0, customEmojis_1.getSilverCoinEmoji)()} + 200 ${(0, customEmojis_1.getSaloonTokenEmoji)()} + 1.750 XP\n` +
            `${(0, customEmojis_1.getBronzeMedalEmoji)()} 3º lugar: 100.000 ${(0, customEmojis_1.getSilverCoinEmoji)()} + 100 ${(0, customEmojis_1.getSaloonTokenEmoji)()} + 875 XP\n` +
            `... e mais prêmios até o 10º lugar!`)
            .setFooter({ text: "Use /evento para ver o ranking em tempo real!" })
            .setTimestamp();
        // Get all users who participated in previous events
        const data = getEventsData();
        const notifiedUsers = new Set();
        // Notify users from history (last 3 events)
        if (data.history && data.history.length > 0) {
            const recentEvents = data.history.slice(-3);
            for (const pastEvent of recentEvents) {
                const participants = Object.keys(pastEvent.participants);
                for (const userId of participants) {
                    if (notifiedUsers.has(userId))
                        continue;
                    notifiedUsers.add(userId);
                    try {
                        const user = await client.users.fetch(userId);
                        await user.send({ embeds: [embed] });
                        console.log(`✅ Notificação de evento enviada para ${user.tag}`);
                        // Delay to avoid rate limiting
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                    catch (error) {
                        console.error(`❌ Falha ao enviar notificação para ${userId}:`, error);
                    }
                }
            }
        }
        console.log(`📢 Notificações de início de evento enviadas para ${notifiedUsers.size} usuários`);
    }
    catch (error) {
        console.error("❌ Erro ao enviar notificações de início de evento:", error);
    }
}
/**
 * Check if event should end and handle rewards
 */
async function checkAndEndEvent(client) {
    const data = getEventsData();
    if (!data.currentEvent || !data.currentEvent.active) {
        return false;
    }
    const now = Date.now();
    if (now >= data.currentEvent.endTime) {
        // Event ended - calculate rewards
        const success = await endEventAndDistributeRewards(data.currentEvent, client);
        // Only return true if payout completed successfully
        return success;
    }
    // Update phase
    updateEventPhase();
    return false;
}
/**
 * End event and distribute rewards to top 10
 * Keeps event active until all critical rewards (top 3) succeed
 * Uses idempotent payout tracking to prevent duplicate rewards
 */
async function endEventAndDistributeRewards(event, client) {
    // Initialize payout tracking
    if (!event.payoutStatus) {
        event.payoutStatus = "in_progress";
    }
    if (!event.rewardsPaid) {
        event.rewardsPaid = [];
    }
    const leaderboard = Object.values(event.participants)
        .sort((a, b) => b.points - a.points)
        .slice(0, 10); // Top 10
    // Define rewards for each position
    const rewardsTable = [
        { position: 1, silver: 300000, tokens: 300, xp: 3500 }, // 🥇
        { position: 2, silver: 200000, tokens: 200, xp: 1750 }, // 🥈
        { position: 3, silver: 100000, tokens: 100, xp: 875 }, // 🥉
        { position: 4, silver: 75000, tokens: 75, xp: 650 },
        { position: 5, silver: 50000, tokens: 50, xp: 500 },
        { position: 6, silver: 35000, tokens: 35, xp: 400 },
        { position: 7, silver: 25000, tokens: 25, xp: 300 },
        { position: 8, silver: 15000, tokens: 15, xp: 200 },
        { position: 9, silver: 10000, tokens: 10, xp: 150 },
        { position: 10, silver: 5000, tokens: 5, xp: 100 },
    ];
    const winners = event.winners || [];
    // Distribute rewards with error handling and idempotency
    const rewardErrors = [];
    for (let i = 0; i < leaderboard.length; i++) {
        const participant = leaderboard[i];
        const reward = rewardsTable[i];
        if (!reward)
            continue;
        // Skip if already paid (idempotency check)
        if (event.rewardsPaid.includes(participant.userId)) {
            console.log(`Skipping ${participant.username} - already paid`);
            // Find existing winner in list
            const existingWinner = winners.find(w => w.userId === participant.userId);
            if (!existingWinner) {
                // Reconstruct winner entry if missing
                winners.push({
                    position: reward.position,
                    userId: participant.userId,
                    username: participant.username,
                    goldMined: participant.goldMined,
                    points: participant.points,
                    rewards: {
                        silver: reward.silver,
                        tokens: reward.tokens,
                        xp: reward.xp,
                    },
                });
            }
            continue;
        }
        try {
            // Add rewards with validation
            const silverResult = await (0, inventoryManager_1.addItem)(participant.userId, "silver", reward.silver);
            const tokenResult = await (0, inventoryManager_1.addItem)(participant.userId, "saloon_token", reward.tokens);
            const xpResult = await (0, xpManager_1.addXp)(participant.userId, reward.xp);
            if (!silverResult.success || !tokenResult.success) {
                const errorMsg = `Failed to distribute rewards to ${participant.username} (position #${reward.position})`;
                console.error(errorMsg, {
                    silver: silverResult.success,
                    token: tokenResult.success,
                });
                rewardErrors.push(errorMsg);
                // Continue to next participant but track the error
                continue;
            }
            // Mark as paid IMMEDIATELY after successful distribution
            event.rewardsPaid.push(participant.userId);
            winners.push({
                position: reward.position,
                userId: participant.userId,
                username: participant.username,
                goldMined: participant.goldMined,
                points: participant.points,
                rewards: {
                    silver: reward.silver,
                    tokens: reward.tokens,
                    xp: reward.xp,
                },
            });
            // Enviar DM para o vencedor
            if (client) {
                await sendWinnerDM(client, participant.userId, reward.position, {
                    silver: reward.silver,
                    tokens: reward.tokens,
                    xp: reward.xp,
                    goldMined: participant.goldMined,
                    points: participant.points,
                });
            }
            // Save progress after each successful payout
            const data = getEventsData();
            data.currentEvent = event;
            saveEventsData(data);
        }
        catch (error) {
            const errorMsg = `Error distributing rewards to ${participant.username} (position #${reward.position})`;
            console.error(errorMsg, error);
            rewardErrors.push(errorMsg);
            // Continue to next participant but track the error
            continue;
        }
    }
    // Check if critical rewards failed (top 3 positions)
    const criticalFailures = rewardErrors.filter(err => err.includes('#1)') || err.includes('#2)') || err.includes('#3)'));
    if (criticalFailures.length > 0) {
        console.error('CRITICAL: Top 3 reward distribution failed, keeping event active for retry');
        console.error('Errors:', criticalFailures);
        // Update payout status and save
        event.payoutStatus = "failed_retry";
        event.winners = winners; // Save partial progress
        const data = getEventsData();
        data.currentEvent = event;
        saveEventsData(data);
        // Don't end the event - return false to indicate failure
        return false;
    }
    // If only minor positions failed, log but proceed
    if (rewardErrors.length > 0) {
        console.warn(`Event ended with ${rewardErrors.length} reward distribution error(s)`);
        console.warn('Errors:', rewardErrors);
    }
    // All critical rewards distributed successfully - mark event as inactive and archive
    event.active = false;
    event.payoutStatus = "completed";
    event.winners = winners;
    // Move to history
    const data = getEventsData();
    data.history.push(event);
    data.currentEvent = null;
    // Keep only last 10 events in history
    if (data.history.length > 10) {
        data.history = data.history.slice(-10);
    }
    saveEventsData(data);
    // Send notification if channel is set and client is available
    if (event.notificationChannelId && client) {
        try {
            const channel = await client.channels.fetch(event.notificationChannelId);
            if (channel && channel.isTextBased()) {
                const embed = new discord_js_1.EmbedBuilder()
                    .setColor(0xFFD700)
                    .setTitle("🏆 EVENTO DE MINERAÇÃO ENCERRADO!")
                    .setDescription(`O evento de mineração de 48h terminou! Parabéns aos vencedores!`)
                    .setTimestamp();
                // Add top 3 to embed
                if (winners.length > 0) {
                    const top3Text = winners.slice(0, 3).map((w, idx) => {
                        const medals = [(0, customEmojis_1.getGoldMedalEmoji)(), (0, customEmojis_1.getSilverMedalEmoji)(), (0, customEmojis_1.getBronzeMedalEmoji)()];
                        return `${medals[idx]} **${w.username}** - ${w.points.toLocaleString()} pontos (${w.goldMined} ouro)\n💰 ${w.rewards.silver.toLocaleString()} ${(0, customEmojis_1.getSilverCoinEmoji)()} + ${w.rewards.tokens} ${(0, customEmojis_1.getSaloonTokenEmoji)()} + ${w.rewards.xp} XP`;
                    }).join("\n\n");
                    embed.addFields({
                        name: "🏆 Top 3",
                        value: top3Text,
                        inline: false,
                    });
                }
                await channel.send({ embeds: [embed] });
            }
        }
        catch (error) {
            console.error("Failed to send event end notification:", error);
        }
    }
    // Return true to indicate successful completion
    return true;
}
/**
 * Get time until next event (next Sunday at 00:00)
 * If it's currently Sunday and before the 24h window closes, returns time to next week
 * If it's currently Sunday and no active event exists, should trigger immediate start
 */
function getTimeUntilNextEvent() {
    const now = new Date();
    const nextSunday = new Date(now);
    // Calculate days until next Sunday
    // If today is Sunday (0), next Sunday is in 7 days
    // Otherwise, calculate days remaining in the week
    const daysUntilSunday = now.getDay() === 0 ? 7 : 7 - now.getDay();
    nextSunday.setDate(now.getDate() + daysUntilSunday);
    nextSunday.setHours(0, 0, 0, 0);
    return nextSunday.getTime() - now.getTime();
}
/**
 * Get next Sunday date formatted
 */
function getNextSundayDate() {
    const now = new Date();
    const nextSunday = new Date(now);
    const daysUntilSunday = now.getDay() === 0 ? 7 : 7 - now.getDay();
    nextSunday.setDate(now.getDate() + daysUntilSunday);
    nextSunday.setHours(0, 0, 0, 0);
    return nextSunday;
}
/**
 * Format time remaining
 */
function formatTimeRemaining(ms) {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
    }
    else if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    }
    else {
        return `${seconds}s`;
    }
}
/**
 * Is it Sunday?
 */
function isSunday() {
    return new Date().getDay() === 0;
}
// ==================== HUNTING EVENT FUNCTIONS ====================
/**
 * Start a new hunting event
 */
async function startHuntingEvent(client, notificationChannelId, eventName, duration) {
    const now = Date.now();
    const eventId = `hunting_${now}`;
    const defaultName = eventName || "Caçada do Oeste";
    const eventDuration = duration || 48 * 60 * 60 * 1000; // 48 hours default
    const newEvent = {
        id: eventId,
        name: defaultName,
        type: "hunting",
        startTime: now,
        endTime: now + eventDuration,
        active: true,
        phase: 0,
        participants: {},
        notificationChannelId,
    };
    const data = getEventsData();
    // Initialize arrays if needed
    if (!data.activeEvents) {
        data.activeEvents = [];
    }
    if (!data.huntingEvents) {
        data.huntingEvents = [];
    }
    // Add to active events
    data.activeEvents.push(newEvent);
    data.huntingEvents.push(newEvent);
    saveEventsData(data);
    // Send start notifications
    if (client) {
        sendHuntingEventStartNotification(client, newEvent).catch(error => {
            console.error("❌ Erro ao enviar notificações de início do evento de caça:", error);
        });
    }
    return newEvent;
}
/**
 * Add hunting stats to user's event participation
 * Pontos: 1 pele = 50 pontos, 1 carne = 20 pontos
 */
function addHuntingEventStats(userId, username, pelts, meat, animalName) {
    const data = getEventsData();
    // Find active hunting event
    const huntingEvent = data.activeEvents?.find(e => e.type === "hunting" && e.active);
    if (!huntingEvent) {
        return false;
    }
    if (!huntingEvent.participants[userId]) {
        huntingEvent.participants[userId] = {
            userId,
            username,
            animalsKilled: 0,
            peltsCollected: 0,
            meatCollected: 0,
            points: 0,
            kills: {},
        };
    }
    const participant = huntingEvent.participants[userId];
    // Update stats
    participant.animalsKilled += 1;
    participant.peltsCollected += pelts;
    participant.meatCollected += meat;
    participant.points += pelts * 50 + meat * 20; // 1 pele = 50 pontos, 1 carne = 20 pontos
    // Track individual animal kills
    if (animalName) {
        if (!participant.kills[animalName]) {
            participant.kills[animalName] = 0;
        }
        participant.kills[animalName] += 1;
    }
    saveEventsData(data);
    return true;
}
/**
 * Get hunting event leaderboard
 */
function getHuntingEventLeaderboard() {
    const data = getEventsData();
    const huntingEvent = data.activeEvents?.find(e => e.type === "hunting" && e.active);
    if (!huntingEvent)
        return [];
    const participants = Object.values(huntingEvent.participants);
    return participants.sort((a, b) => b.points - a.points);
}
/**
 * Get current hunting event
 */
function getCurrentHuntingEvent() {
    const data = getEventsData();
    const huntingEvent = data.activeEvents?.find(e => e.type === "hunting" && e.active);
    return huntingEvent || null;
}
/**
 * Send DM notification when hunting event starts
 */
async function sendHuntingEventStartNotification(client, event) {
    try {
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(0x8B4513)
            .setTitle(`🎯 ${event.name.toUpperCase()} COMEÇOU!`)
            .setDescription(`O evento de caça semanal está ativo agora!\n\n` +
            `⏱️ **Duração:** 48 horas\n` +
            `🎯 **Como participar:** Use \`/hunt\` para caçar animais\n` +
            `🏆 **Pontos:** 1 pele = 50 pontos | 1 carne = 20 pontos\n\n` +
            `**🎁 PRÊMIOS TOP 10:**\n` +
            `${(0, customEmojis_1.getGoldMedalEmoji)()} 1º lugar: 250.000 ${(0, customEmojis_1.getSilverCoinEmoji)()} + 250 ${(0, customEmojis_1.getSaloonTokenEmoji)()} + 3.000 XP\n` +
            `${(0, customEmojis_1.getSilverMedalEmoji)()} 2º lugar: 150.000 ${(0, customEmojis_1.getSilverCoinEmoji)()} + 150 ${(0, customEmojis_1.getSaloonTokenEmoji)()} + 1.500 XP\n` +
            `${(0, customEmojis_1.getBronzeMedalEmoji)()} 3º lugar: 80.000 ${(0, customEmojis_1.getSilverCoinEmoji)()} + 80 ${(0, customEmojis_1.getSaloonTokenEmoji)()} + 750 XP\n` +
            `... e mais prêmios até o 10º lugar!`)
            .setFooter({ text: "Use /evento para ver o ranking em tempo real!" })
            .setTimestamp();
        // Get users who participated in previous hunting events
        const data = getEventsData();
        const notifiedUsers = new Set();
        if (data.history && data.history.length > 0) {
            const recentHuntingEvents = data.history
                .filter(e => e.type === "hunting")
                .slice(-3);
            for (const pastEvent of recentHuntingEvents) {
                const participants = Object.keys(pastEvent.participants);
                for (const userId of participants) {
                    if (notifiedUsers.has(userId))
                        continue;
                    notifiedUsers.add(userId);
                    try {
                        const user = await client.users.fetch(userId);
                        await user.send({ embeds: [embed] });
                        console.log(`✅ Notificação de evento de caça enviada para ${user.tag}`);
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                    catch (error) {
                        console.error(`❌ Falha ao enviar notificação para ${userId}:`, error);
                    }
                }
            }
        }
        console.log(`📢 Notificações de início de evento de caça enviadas para ${notifiedUsers.size} usuários`);
    }
    catch (error) {
        console.error("❌ Erro ao enviar notificações de início de evento de caça:", error);
    }
}
/**
 * Check and end hunting event if time is up
 */
async function checkAndEndHuntingEvent(client) {
    const data = getEventsData();
    const huntingEvent = data.activeEvents?.find(e => e.type === "hunting" && e.active);
    if (!huntingEvent) {
        return false;
    }
    const now = Date.now();
    if (now >= huntingEvent.endTime) {
        const success = await endHuntingEventAndDistributeRewards(huntingEvent, client);
        return success;
    }
    // Update phase
    const totalDuration = huntingEvent.endTime - huntingEvent.startTime;
    const elapsed = now - huntingEvent.startTime;
    const progress = Math.min(1, elapsed / totalDuration);
    const newPhase = Math.min(6, Math.floor(progress / (1 / 7)));
    if (newPhase !== huntingEvent.phase) {
        huntingEvent.phase = newPhase;
        saveEventsData(data);
    }
    return false;
}
/**
 * End hunting event and distribute rewards
 */
async function endHuntingEventAndDistributeRewards(event, client) {
    if (!event.payoutStatus) {
        event.payoutStatus = "in_progress";
    }
    if (!event.rewardsPaid) {
        event.rewardsPaid = [];
    }
    const leaderboard = Object.values(event.participants)
        .sort((a, b) => b.points - a.points)
        .slice(0, 10);
    const rewardsTable = [
        { position: 1, silver: 250000, tokens: 250, xp: 3000 },
        { position: 2, silver: 150000, tokens: 150, xp: 1500 },
        { position: 3, silver: 80000, tokens: 80, xp: 750 },
        { position: 4, silver: 50000, tokens: 50, xp: 500 },
        { position: 5, silver: 35000, tokens: 35, xp: 350 },
        { position: 6, silver: 25000, tokens: 25, xp: 250 },
        { position: 7, silver: 18000, tokens: 18, xp: 180 },
        { position: 8, silver: 12000, tokens: 12, xp: 120 },
        { position: 9, silver: 8000, tokens: 8, xp: 80 },
        { position: 10, silver: 5000, tokens: 5, xp: 50 },
    ];
    const winners = event.winners || [];
    const rewardErrors = [];
    for (let i = 0; i < leaderboard.length; i++) {
        const participant = leaderboard[i];
        const reward = rewardsTable[i];
        if (!reward)
            continue;
        if (event.rewardsPaid.includes(participant.userId)) {
            console.log(`Skipping ${participant.username} - already paid`);
            continue;
        }
        try {
            const silverResult = await (0, inventoryManager_1.addItem)(participant.userId, "silver", reward.silver);
            const tokenResult = await (0, inventoryManager_1.addItem)(participant.userId, "saloon_token", reward.tokens);
            const xpResult = await (0, xpManager_1.addXp)(participant.userId, reward.xp);
            if (!silverResult.success || !tokenResult.success) {
                const errorMsg = `Failed to distribute hunting rewards to ${participant.username} (position #${reward.position})`;
                console.error(errorMsg);
                rewardErrors.push(errorMsg);
                continue;
            }
            event.rewardsPaid.push(participant.userId);
            winners.push({
                position: reward.position,
                userId: participant.userId,
                username: participant.username,
                animalsKilled: participant.animalsKilled,
                peltsCollected: participant.peltsCollected,
                meatCollected: participant.meatCollected,
                points: participant.points,
                rewards: {
                    silver: reward.silver,
                    tokens: reward.tokens,
                    xp: reward.xp,
                },
            });
            if (client) {
                await sendHuntingWinnerDM(client, participant.userId, reward.position, {
                    silver: reward.silver,
                    tokens: reward.tokens,
                    xp: reward.xp,
                    animalsKilled: participant.animalsKilled,
                    peltsCollected: participant.peltsCollected,
                    meatCollected: participant.meatCollected,
                    points: participant.points,
                });
            }
            const data = getEventsData();
            saveEventsData(data);
        }
        catch (error) {
            const errorMsg = `Error distributing hunting rewards to ${participant.username}`;
            console.error(errorMsg, error);
            rewardErrors.push(errorMsg);
            continue;
        }
    }
    const criticalFailures = rewardErrors.filter(err => err.includes("#1)") || err.includes("#2)") || err.includes("#3)"));
    if (criticalFailures.length > 0) {
        console.error("CRITICAL: Top 3 hunting reward distribution failed");
        event.payoutStatus = "failed_retry";
        event.winners = winners;
        const data = getEventsData();
        saveEventsData(data);
        return false;
    }
    event.active = false;
    event.payoutStatus = "completed";
    event.winners = winners;
    const data = getEventsData();
    data.history.push(event);
    // Remove from active events
    if (data.activeEvents) {
        data.activeEvents = data.activeEvents.filter(e => e.id !== event.id);
    }
    if (data.history.length > 10) {
        data.history = data.history.slice(-10);
    }
    saveEventsData(data);
    if (event.notificationChannelId && client) {
        try {
            const channel = await client.channels.fetch(event.notificationChannelId);
            if (channel && channel.isTextBased()) {
                const embed = new discord_js_1.EmbedBuilder()
                    .setColor(0x8B4513)
                    .setTitle("🎯 EVENTO DE CAÇA ENCERRADO!")
                    .setDescription(`O evento de caça de 48h terminou! Parabéns aos caçadores!`)
                    .setTimestamp();
                if (winners.length > 0) {
                    const top3Text = winners
                        .slice(0, 3)
                        .map((w, idx) => {
                        const medals = [(0, customEmojis_1.getGoldMedalEmoji)(), (0, customEmojis_1.getSilverMedalEmoji)(), (0, customEmojis_1.getBronzeMedalEmoji)()];
                        return `${medals[idx]} **${w.username}** - ${w.points.toLocaleString()} pontos\n🎯 ${w.animalsKilled} animais | ${w.peltsCollected} peles | ${w.meatCollected} carnes\n💰 ${w.rewards.silver.toLocaleString()} ${(0, customEmojis_1.getSilverCoinEmoji)()} + ${w.rewards.tokens} ${(0, customEmojis_1.getSaloonTokenEmoji)()} + ${w.rewards.xp} XP`;
                    })
                        .join("\n\n");
                    embed.addFields({
                        name: "🏆 Top 3 Caçadores",
                        value: top3Text,
                        inline: false,
                    });
                }
                await channel.send({ embeds: [embed] });
            }
        }
        catch (error) {
            console.error("Failed to send hunting event end notification:", error);
        }
    }
    return true;
}
/**
 * Send DM to hunting event winner
 */
async function sendHuntingWinnerDM(client, userId, position, rewards) {
    try {
        const user = await client.users.fetch(userId);
        const medals = [(0, customEmojis_1.getGoldMedalEmoji)(), (0, customEmojis_1.getSilverMedalEmoji)(), (0, customEmojis_1.getBronzeMedalEmoji)()];
        const positionText = position <= 3 ? medals[position - 1] : `#${position}`;
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(position === 1 ? 0xFFD700 : position === 2 ? 0xC0C0C0 : position === 3 ? 0xCD7F32 : 0x8B4513)
            .setTitle(`${positionText} PARABÉNS! VOCÊ VENCEU A CAÇADA DO OESTE!`)
            .setDescription(`Você conquistou a **${position}ª posição** no evento de caça!\n\n` +
            `🎯 **Animais Caçados:** ${rewards.animalsKilled}\n` +
            `🦌 **Peles:** ${rewards.peltsCollected}\n` +
            `🥩 **Carnes:** ${rewards.meatCollected}\n` +
            `🏆 **Pontos:** ${rewards.points.toLocaleString()}\n\n` +
            `**🎁 SEUS PRÊMIOS:**`)
            .addFields({
            name: "💰 Silver",
            value: `${rewards.silver.toLocaleString()} ${(0, customEmojis_1.getSilverCoinEmoji)()}`,
            inline: true,
        }, {
            name: `${(0, customEmojis_1.getSaloonTokenEmoji)()} Tokens`,
            value: `${rewards.tokens}x`,
            inline: true,
        }, {
            name: "⭐ XP",
            value: `+${rewards.xp.toLocaleString()}`,
            inline: true,
        })
            .setFooter({ text: "Os prêmios foram adicionados ao seu inventário!" })
            .setTimestamp();
        await user.send({ embeds: [embed] });
        console.log(`✅ DM de prêmio de caça enviada para ${user.tag} (posição ${position})`);
    }
    catch (error) {
        console.error(`❌ Falha ao enviar DM de prêmio de caça para usuário ${userId}:`, error);
    }
}
//# sourceMappingURL=eventManager.js.map