"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const customEmojis_1 = require("../../utils/customEmojis");
const miningTracker_1 = require("../../utils/miningTracker");
const eventManager_1 = require("../../utils/eventManager");
const territoryManager_1 = require("../../utils/territoryManager");
const i18n_1 = require("../../utils/i18n");
const commandLocalizations_1 = require("../../utils/commandLocalizations");
const embeds_1 = require("../../utils/embeds");
const { addItem, getInventory, removeItem, transferItem, getItem, reduceDurability, } = require("../../utils/inventoryManager");
const { addUserSilver, getUserSilver, removeUserSilver, } = require("../../utils/dataManager");
const database_1 = require("../../utils/database");
const SOLO_DURATION = 90 * 60 * 1000; // 1h30m (90 minutos)
const COOP_DURATION = 30 * 60 * 1000; // 30 minutos
function getMiningData() {
    return (0, database_1.readData)("mining.json");
}
function saveMiningData(data) {
    (0, database_1.writeData)("mining.json", data);
}
function getActiveMining(userId) {
    const data = getMiningData();
    if (!data[userId])
        return null;
    const mining = data[userId];
    if (mining.claimed)
        return null;
    return mining;
}
function startMining(userId, type, partnerId, goldAmount) {
    const data = getMiningData();
    let duration = type === "solo" ? SOLO_DURATION : COOP_DURATION;
    // Apply 50% mining boost if user owns Gold Mine Shares
    const hasGoldMineShares = (0, territoryManager_1.ownsTerritory)(userId, "gold_mine_shares");
    if (hasGoldMineShares) {
        duration = Math.floor(duration * 0.5); // 50% faster = 50% of original time
    }
    // Check if user has a pickaxe for double mining output (only for solo)
    const hasPickaxe = type === "solo" && getItem(userId, "pickaxe") > 0;
    const now = Date.now();
    // Calculate base gold amount
    let calculatedGold;
    if (goldAmount !== undefined) {
        // Use provided goldAmount (for coop)
        calculatedGold = goldAmount;
    }
    else {
        // Calculate for solo mining
        if (hasPickaxe) {
            calculatedGold = Math.floor(Math.random() * 13) + 16; // 16-28 bars with pickaxe
        }
        else {
            calculatedGold = Math.floor(Math.random() * 3) + 1; // 1-3 bars without pickaxe
        }
    }
    data[userId] = {
        type,
        startTime: now,
        endTime: now + duration,
        claimed: false,
        goldAmount: calculatedGold,
        partnerId: partnerId || null,
        boosted: hasGoldMineShares, // Track if this session had the boost
        pickaxeBonus: hasPickaxe, // Track if user had pickaxe bonus
    };
    saveMiningData(data);
    return { goldAmount: calculatedGold, hasPickaxe };
}
function claimMining(userId) {
    const data = getMiningData();
    if (!data[userId])
        return false;
    data[userId].claimed = true;
    saveMiningData(data);
    return true;
}
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
exports.default = {
    data: (0, commandLocalizations_1.applyLocalizations)(new discord_js_1.SlashCommandBuilder()
        .setName("mine")
        .setDescription("Mine for gold in the mountains! Solo or cooperative")
        .setContexts([0, 1, 2])
        .setIntegrationTypes([0, 1]), "mine"),
    async execute(interaction) {
        const userId = interaction.user.id;
        // Defer reply immediately to prevent timeout - most responses are public
        await interaction.deferReply().catch(() => { });
        // Clean up old claimed sessions (older than 24 hours)
        (0, miningTracker_1.cleanupOldSessions)();
        // Verificar se usuário está em uma expedição ativa
        const expeditionData = (0, database_1.readData)("expedition.json");
        const userData = expeditionData[userId];
        if (userData?.activeExpedition) {
            const partyId = userData.activeExpedition.partyId;
            const party = expeditionData.parties?.[partyId];
            if (party && party.endTime > Date.now()) {
                const timeLeft = party.endTime - Date.now();
                const embed = new discord_js_1.EmbedBuilder()
                    .setColor("#FFA500")
                    .setTitle(`🗺️ ${(0, i18n_1.t)(interaction, "mine_blocked_expedition_title")}`)
                    .setDescription((0, i18n_1.t)(interaction, "mine_blocked_expedition_desc"))
                    .addFields({
                    name: (0, i18n_1.t)(interaction, "expedition_time_left"),
                    value: (0, embeds_1.formatDuration)(timeLeft),
                    inline: false,
                })
                    .setFooter({
                    text: (0, i18n_1.t)(interaction, "mine_blocked_expedition_footer"),
                });
                await interaction.editReply({ embeds: [embed] });
                return;
            }
        }
        // Verificar se já está minerando
        const activeMining = getActiveMining(userId);
        if (activeMining) {
            const now = Date.now();
            const timeLeft = activeMining.endTime - now;
            if (timeLeft > 0) {
                // Ainda está minerando
                const goldEmoji = (0, customEmojis_1.getGoldBarEmoji)();
                const progressBar = Math.floor(((now - activeMining.startTime) /
                    (activeMining.endTime - activeMining.startTime)) *
                    20);
                const bar = "█".repeat(progressBar) + "░".repeat(20 - progressBar);
                const viewSessionsButton = new discord_js_1.ButtonBuilder()
                    .setCustomId("view_sessions_progress")
                    .setLabel((0, i18n_1.t)(interaction, "mine_sessions_btn"))
                    .setStyle(discord_js_1.ButtonStyle.Secondary);
                const progressRow = new discord_js_1.ActionRowBuilder().addComponents(viewSessionsButton);
                const mineType = activeMining.type === "solo"
                    ? `${(0, customEmojis_1.getPickaxeEmoji)()} ${(0, i18n_1.t)(interaction, "mine_solo")}`
                    : `${(0, customEmojis_1.getCowboysEmoji)()} ${(0, i18n_1.t)(interaction, "mine_coop")}`;
                const goldBarText = (0, i18n_1.t)(interaction, "gold_bars");
                const embed = new discord_js_1.EmbedBuilder()
                    .setColor(0xffd700)
                    .setTitle(`${(0, customEmojis_1.getPickaxeEmoji)()} ${(0, i18n_1.t)(interaction, "mine_in_progress")}`)
                    .setDescription(`${(0, i18n_1.t)(interaction, "mine_currently_mining")}\n\n${bar}\n\n**${(0, i18n_1.t)(interaction, "mine_time_remaining")}:** ${formatTime(timeLeft)}\n**${(0, i18n_1.t)(interaction, "mine_type")}:** ${mineType}\n**${(0, i18n_1.t)(interaction, "mine_expected_reward")}:** ${activeMining.goldAmount} ${goldEmoji} ${goldBarText}`)
                    .setFooter({ text: (0, i18n_1.t)(interaction, "mine_come_back") })
                    .setTimestamp();
                const reply = await interaction.editReply({
                    embeds: [embed],
                    components: [progressRow],
                });
                // Handler for view sessions button in progress state
                const progressCollector = reply.createMessageComponentCollector({
                    time: 300000,
                });
                progressCollector.on("collect", async (i) => {
                    if (i.customId === "view_sessions_progress") {
                        const activeSessions = (0, miningTracker_1.getActiveSessions)();
                        const unclaimedSessions = (0, miningTracker_1.getUnclaimedSessions)();
                        const stats = (0, miningTracker_1.getMiningStats)();
                        const nowTime = Date.now();
                        const sessionsEmbed = new discord_js_1.EmbedBuilder()
                            .setColor(0xffd700)
                            .setTitle(`${(0, customEmojis_1.getPickaxeEmoji)()} ${(0, i18n_1.t)(i, "mine_sessions_tracker")}`)
                            .setDescription((0, i18n_1.t)(i, "mine_current_operations"))
                            .addFields({
                            name: `${(0, customEmojis_1.getStatsEmoji)()} ${(0, i18n_1.t)(i, "mine_overview")}`,
                            value: `\`\`\`yaml
${(0, i18n_1.t)(i, "mine_active_sessions")}: ${stats.totalActive}
${(0, i18n_1.t)(i, "mine_solo_mining_label")}: ${stats.soloMining}
${(0, i18n_1.t)(i, "mine_cooperative_label")}: ${stats.coopMining}
${(0, i18n_1.t)(i, "mine_ready_to_claim")}: ${stats.unclaimed}
${(0, i18n_1.t)(i, "mine_pending_gold")}: ${stats.totalGoldPending}
\`\`\`${goldEmoji}`,
                            inline: false,
                        });
                        if (activeSessions.length > 0) {
                            const activeList = activeSessions
                                .slice(0, 10)
                                .map(({ userId: uid, session }) => {
                                const timeLeft = session.endTime - nowTime;
                                const progress = Math.floor(((nowTime - session.startTime) /
                                    (session.endTime - session.startTime)) *
                                    10);
                                const progressBar = "█".repeat(progress) + "░".repeat(10 - progress);
                                return `<@${uid}>\n${progressBar} \`${(0, miningTracker_1.formatTime)(timeLeft)}\` • ${session.type === "solo" ? `${(0, customEmojis_1.getPickaxeEmoji)()} Solo` : `${(0, customEmojis_1.getCowboysEmoji)()} Coop`} • ${session.goldAmount} ${goldEmoji}`;
                            })
                                .join("\n\n");
                            sessionsEmbed.addFields({
                                name: `${(0, customEmojis_1.getTimerEmoji)()} ${(0, i18n_1.t)(i, "mine_active_mining")}`,
                                value: activeList +
                                    (activeSessions.length > 10
                                        ? `\n\n_+${activeSessions.length - 10} ${(0, i18n_1.t)(i, "mine_more")}_`
                                        : ""),
                                inline: false,
                            });
                        }
                        if (unclaimedSessions.length > 0) {
                            const unclaimedList = unclaimedSessions
                                .slice(0, 5)
                                .map(({ userId: uid, session }) => {
                                return `<@${uid}> • ${session.type === "solo" ? `${(0, customEmojis_1.getPickaxeEmoji)()}` : `${(0, customEmojis_1.getCowboysEmoji)()}`} • ${session.goldAmount} ${goldEmoji}`;
                            })
                                .join("\n");
                            sessionsEmbed.addFields({
                                name: `${(0, customEmojis_1.getCheckEmoji)()} ${(0, i18n_1.t)(i, "mine_ready_to_claim")}`,
                                value: unclaimedList +
                                    (unclaimedSessions.length > 5
                                        ? `\n_+${unclaimedSessions.length - 5} ${(0, i18n_1.t)(i, "mine_more")}_`
                                        : ""),
                                inline: false,
                            });
                        }
                        if (activeSessions.length === 0 && unclaimedSessions.length === 0) {
                            sessionsEmbed.addFields({
                                name: `${(0, customEmojis_1.getMuteEmoji)()} ${(0, i18n_1.t)(i, "mine_no_active_sessions")}`,
                                value: (0, i18n_1.t)(i, "mine_no_one_mining"),
                                inline: false,
                            });
                        }
                        sessionsEmbed
                            .setFooter({
                            text: `${(0, customEmojis_1.getPickaxeEmoji)()} ${(0, i18n_1.t)(i, "mine_sessions_realtime")}`,
                        })
                            .setTimestamp();
                        await i.reply({
                            embeds: [sessionsEmbed],
                            flags: discord_js_1.MessageFlags.Ephemeral,
                        });
                    }
                });
                return;
            }
            else {
                // Mineração completa - pode coletar
                const claimButton = new discord_js_1.ButtonBuilder()
                    .setCustomId("claim_mining")
                    .setLabel((0, i18n_1.t)(interaction, "mine_collect_btn"))
                    .setStyle(discord_js_1.ButtonStyle.Success);
                const viewSessionsClaimButton = new discord_js_1.ButtonBuilder()
                    .setCustomId("view_sessions_claim")
                    .setLabel((0, i18n_1.t)(interaction, "mine_sessions_btn"))
                    .setStyle(discord_js_1.ButtonStyle.Secondary);
                const row = new discord_js_1.ActionRowBuilder().addComponents(claimButton, viewSessionsClaimButton);
                const goldEmoji = (0, customEmojis_1.getGoldBarEmoji)();
                const goldBarText = (0, i18n_1.t)(interaction, "gold_bars");
                const embed = new discord_js_1.EmbedBuilder()
                    .setColor(0x00ff00)
                    .setTitle(`${(0, customEmojis_1.getCheckEmoji)()} ${(0, i18n_1.t)(interaction, "mine_complete")}`)
                    .setDescription(`${(0, i18n_1.t)(interaction, "mine_complete_desc")}\n\n${(0, customEmojis_1.getMoneybagEmoji)()} **${(0, i18n_1.t)(interaction, "mine_reward")}:** ${activeMining.goldAmount} ${goldEmoji} ${goldBarText}!\n\n${(0, i18n_1.t)(interaction, "mine_click_to_join")}`)
                    .setFooter({ text: (0, i18n_1.t)(interaction, "mine_great_work") })
                    .setTimestamp();
                await interaction.editReply({ embeds: [embed], components: [row] });
                const response = await interaction.fetchReply();
                const collector = response.createMessageComponentCollector({
                    time: 300000,
                }); // 5 min to collect
                collector.on("collect", async (i) => {
                    if (i.customId === "view_sessions_claim") {
                        const activeSessions = (0, miningTracker_1.getActiveSessions)();
                        const unclaimedSessions = (0, miningTracker_1.getUnclaimedSessions)();
                        const stats = (0, miningTracker_1.getMiningStats)();
                        const nowTime = Date.now();
                        const sessionsEmbed = new discord_js_1.EmbedBuilder()
                            .setColor(0xffd700)
                            .setTitle(`${(0, customEmojis_1.getPickaxeEmoji)()} ${(0, i18n_1.t)(interaction, "mine_sessions_tracker")}`)
                            .setDescription((0, i18n_1.t)(interaction, "mine_current_operations"))
                            .addFields({
                            name: `${(0, customEmojis_1.getStatsEmoji)()} ${(0, i18n_1.t)(interaction, "mine_overview")}`,
                            value: `\`\`\`yaml
${(0, i18n_1.t)(interaction, "mine_active_sessions")}: ${stats.totalActive}
${(0, i18n_1.t)(interaction, "mine_solo_mining_label")}: ${stats.soloMining}
${(0, i18n_1.t)(interaction, "mine_cooperative_label")}: ${stats.coopMining}
${(0, i18n_1.t)(interaction, "mine_ready_to_claim")}: ${stats.unclaimed}
${(0, i18n_1.t)(interaction, "mine_pending_gold")}: ${stats.totalGoldPending}
\`\`\`${goldEmoji}`,
                            inline: false,
                        });
                        if (activeSessions.length > 0) {
                            const activeList = activeSessions
                                .slice(0, 10)
                                .map(({ userId: uid, session }) => {
                                const timeLeft = session.endTime - nowTime;
                                const progress = Math.floor(((nowTime - session.startTime) /
                                    (session.endTime - session.startTime)) *
                                    10);
                                const progressBar = "█".repeat(progress) + "░".repeat(10 - progress);
                                return `<@${uid}>\n${progressBar} \`${(0, miningTracker_1.formatTime)(timeLeft)}\` • ${session.type === "solo" ? `${(0, customEmojis_1.getPickaxeEmoji)()} Solo` : `${(0, customEmojis_1.getCowboysEmoji)()} Coop`} • ${session.goldAmount} ${goldEmoji}`;
                            })
                                .join("\n\n");
                            sessionsEmbed.addFields({
                                name: `${(0, customEmojis_1.getTimerEmoji)()} ${(0, i18n_1.t)(interaction, "mine_active_mining")}`,
                                value: activeList +
                                    (activeSessions.length > 10
                                        ? `\n\n_+${activeSessions.length - 10} ${(0, i18n_1.t)(interaction, "mine_more")}_`
                                        : ""),
                                inline: false,
                            });
                        }
                        if (unclaimedSessions.length > 0) {
                            const unclaimedList = unclaimedSessions
                                .slice(0, 5)
                                .map(({ userId: uid, session }) => {
                                return `<@${uid}> • ${session.type === "solo" ? `${(0, customEmojis_1.getPickaxeEmoji)()}` : `${(0, customEmojis_1.getCowboysEmoji)()}`} • ${session.goldAmount} ${goldEmoji}`;
                            })
                                .join("\n");
                            sessionsEmbed.addFields({
                                name: `${(0, customEmojis_1.getCheckEmoji)()} ${(0, i18n_1.t)(interaction, "mine_ready_to_claim")}`,
                                value: unclaimedList +
                                    (unclaimedSessions.length > 5
                                        ? `\n_+${unclaimedSessions.length - 5} ${(0, i18n_1.t)(interaction, "mine_more")}_`
                                        : ""),
                                inline: false,
                            });
                        }
                        if (activeSessions.length === 0 && unclaimedSessions.length === 0) {
                            sessionsEmbed.addFields({
                                name: `${(0, customEmojis_1.getMuteEmoji)()} ${(0, i18n_1.t)(interaction, "mine_no_active_sessions")}`,
                                value: (0, i18n_1.t)(interaction, "mine_no_one_mining"),
                                inline: false,
                            });
                        }
                        sessionsEmbed
                            .setFooter({
                            text: `${(0, customEmojis_1.getPickaxeEmoji)()} ${(0, i18n_1.t)(interaction, "mine_sessions_realtime")}`,
                        })
                            .setTimestamp();
                        return i.reply({
                            embeds: [sessionsEmbed],
                            flags: discord_js_1.MessageFlags.Ephemeral,
                        });
                    }
                    if (i.customId !== "claim_mining")
                        return;
                    if (i.user.id !== userId) {
                        return i.reply({
                            content: `❌ ${(0, i18n_1.t)(interaction, "mine_not_yours")}`,
                            flags: discord_js_1.MessageFlags.Ephemeral,
                        });
                    }
                    await i.deferUpdate();
                    const addResult = await addItem(userId, "gold", activeMining.goldAmount);
                    if (!addResult.success) {
                        return i.editReply({
                            embeds: [
                                {
                                    color: 0xff0000,
                                    title: `⚠️ ${(0, i18n_1.t)(interaction, "mine_collection_failed")}`,
                                    description: `${addResult.error}\n\n${(0, i18n_1.t)(interaction, "mine_inventory_heavy")}`,
                                    footer: { text: (0, i18n_1.t)(interaction, "mine_gold_waiting") },
                                },
                            ],
                            components: [],
                        });
                    }
                    // Registrar ouro no evento (se houver evento ativo)
                    const eventActive = (0, eventManager_1.getCurrentEvent)();
                    let eventPointsAdded = false;
                    if (eventActive && eventActive.active) {
                        eventPointsAdded = (0, eventManager_1.addEventGold)(userId, interaction.user.tag, activeMining.goldAmount);
                    }
                    // Chance de encontrar diamante (20% de chance)
                    let foundDiamond = false;
                    const diamondChance = Math.random();
                    if (diamondChance < 0.2) {
                        const diamondResult = await addItem(userId, "diamond", 1);
                        if (diamondResult.success) {
                            foundDiamond = true;
                        }
                    }
                    let pickaxeBroken = false;
                    if (activeMining.pickaxeBonus) {
                        const durabilityResult = await reduceDurability(userId, "pickaxe");
                        if (durabilityResult.broken) {
                            pickaxeBroken = true;
                        }
                    }
                    claimMining(userId);
                    const userInventory = getInventory(userId);
                    const checkEmoji = (0, customEmojis_1.getCheckEmoji)();
                    const sparklesEmoji = (0, customEmojis_1.getSparklesEmoji)();
                    const backpackEmoji = (0, customEmojis_1.getBackpackEmoji)();
                    const goldBarText = (0, i18n_1.t)(interaction, "gold_bars");
                    const weightText = (0, i18n_1.t)(interaction, "weight");
                    const locale = (0, i18n_1.getLocale)(i);
                    const diamondText = foundDiamond
                        ? `\n${sparklesEmoji} **${locale === "pt-BR" ? "BÔNUS RARO" : "RARE BONUS"}:** +1 ${(0, customEmojis_1.getDiamondEmoji)()} ${locale === "pt-BR" ? "Diamante" : "Diamond"}!`
                        : "";
                    const eventText = eventPointsAdded
                        ? `\n🏆 **${locale === "pt-BR" ? "EVENTO ATIVO" : "EVENT ACTIVE"}:** +${activeMining.goldAmount * 40} ${locale === "pt-BR" ? "pontos" : "points"}!`
                        : "";
                    const pickaxeText = pickaxeBroken
                        ? `\n💥 **${locale === "pt-BR" ? "Sua Picareta quebrou após o uso!" : "Your Pickaxe broke after use!"}**`
                        : "";
                    await i.editReply({
                        embeds: [
                            {
                                color: foundDiamond ? 0x00ffff : (eventPointsAdded ? 0xFF6B00 : 0xffd700),
                                title: `${checkEmoji} ${(0, customEmojis_1.getPickaxeEmoji)()} ${(0, i18n_1.t)(interaction, "mine_collected")} ${sparklesEmoji}`,
                                description: `**+ ${(0, i18n_1.t)(interaction, "mine_you_collected")} ${activeMining.goldAmount} ${goldEmoji} ${goldBarText}!**${diamondText}${eventText}${pickaxeText}\n\n${backpackEmoji} **${weightText}:** ${addResult.newWeight.toFixed(2)}kg / ${userInventory.maxWeight}kg`,
                                footer: {
                                    text: `${(0, customEmojis_1.getCowboyEmoji)()} ${(0, i18n_1.t)(interaction, "mine_can_mine_again")}`,
                                },
                                timestamp: new Date().toISOString(),
                            },
                        ],
                        components: [],
                    });
                    collector.stop();
                });
                return;
            }
        }
        // Não está minerando - mostrar opções
        const row = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
            .setCustomId("mine_solo")
            .setLabel((0, i18n_1.t)(interaction, "mine_alone_duration"))
            .setStyle(discord_js_1.ButtonStyle.Primary), new discord_js_1.ButtonBuilder()
            .setCustomId("mine_coop")
            .setLabel((0, i18n_1.t)(interaction, "mine_find_partner"))
            .setStyle(discord_js_1.ButtonStyle.Success), new discord_js_1.ButtonBuilder()
            .setCustomId("view_sessions")
            .setLabel((0, i18n_1.t)(interaction, "mine_sessions_btn"))
            .setStyle(discord_js_1.ButtonStyle.Secondary));
        const goldEmoji = (0, customEmojis_1.getGoldBarEmoji)();
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(0xffd700)
            .setTitle(`${(0, customEmojis_1.getPickaxeEmoji)()} ${(0, i18n_1.t)(interaction, "mine_title")}`)
            .setImage("https://i.postimg.cc/T3N1ytf4/IMG-3258.png")
            .setDescription((0, i18n_1.t)(interaction, "mine_choose"))
            .addFields({
            name: `${(0, customEmojis_1.getPickaxeEmoji)()} ${(0, i18n_1.t)(interaction, "mine_solo_mining_label")}`,
            value: `\`\`\`yaml\n${(0, i18n_1.t)(interaction, "mine_duration_1h30")}\n${(0, i18n_1.t)(interaction, "mine_reward_1_3")}\n${(0, i18n_1.t)(interaction, "mine_players_1")}\`\`\``,
            inline: true,
        }, {
            name: `${(0, customEmojis_1.getCowboysEmoji)()} ${(0, i18n_1.t)(interaction, "mine_coop")}`,
            value: `\`\`\`yaml\n${(0, i18n_1.t)(interaction, "mine_duration_30min")}\n${(0, i18n_1.t)(interaction, "mine_reward_4_6_split")}\n${(0, i18n_1.t)(interaction, "mine_players_2")}\`\`\``,
            inline: true,
        })
            .setFooter({ text: (0, i18n_1.t)(interaction, "mine_auto_come_back") })
            .setTimestamp();
        await interaction.editReply({
            embeds: [embed],
            components: [row],
        });
        const response = await interaction.fetchReply();
        // Collector para os botões
        const collector = response.createMessageComponentCollector({ time: 60000 });
        collector.on("collect", async (i) => {
            if (i.customId === "view_sessions") {
                // Show mining sessions
                const activeSessions = (0, miningTracker_1.getActiveSessions)();
                const unclaimedSessions = (0, miningTracker_1.getUnclaimedSessions)();
                const stats = (0, miningTracker_1.getMiningStats)();
                const now = Date.now();
                const sessionsEmbed = new discord_js_1.EmbedBuilder()
                    .setColor(0xffd700)
                    .setTitle(`${(0, customEmojis_1.getPickaxeEmoji)()} ${(0, i18n_1.t)(i, "mine_sessions_tracker")}`)
                    .setDescription((0, i18n_1.t)(i, "mine_current_operations"))
                    .addFields({
                    name: `${(0, customEmojis_1.getStatsEmoji)()} ${(0, i18n_1.t)(i, "mine_overview")}`,
                    value: `\`\`\`yaml
${(0, i18n_1.t)(i, "mine_active_sessions")}: ${stats.totalActive}
${(0, i18n_1.t)(i, "mine_solo_mining_label")}: ${stats.soloMining}
${(0, i18n_1.t)(i, "mine_cooperative_label")}: ${stats.coopMining}
${(0, i18n_1.t)(i, "mine_ready_to_claim")}: ${stats.unclaimed}
${(0, i18n_1.t)(i, "mine_pending_gold")}: ${stats.totalGoldPending} ${goldEmoji}
\`\`\``,
                    inline: false,
                });
                // Show active mining sessions
                if (activeSessions.length > 0) {
                    const activeList = activeSessions
                        .slice(0, 10)
                        .map(({ userId: uid, session }) => {
                        const timeLeft = session.endTime - now;
                        const progress = Math.floor(((now - session.startTime) /
                            (session.endTime - session.startTime)) *
                            10);
                        const progressBar = "█".repeat(progress) + "░".repeat(10 - progress);
                        return `<@${uid}>\n${progressBar} \`${(0, miningTracker_1.formatTime)(timeLeft)}\` • ${session.type === "solo" ? `${(0, customEmojis_1.getPickaxeEmoji)()} Solo` : `${(0, customEmojis_1.getCowboysEmoji)()} Coop`} • ${session.goldAmount} ${goldEmoji}`;
                    })
                        .join("\n\n");
                    sessionsEmbed.addFields({
                        name: `⏳ ${(0, i18n_1.t)(i, "mine_active_mining")}`,
                        value: activeList +
                            (activeSessions.length > 10
                                ? `\n\n_+${activeSessions.length - 10} ${(0, i18n_1.t)(i, "mine_more")}_`
                                : ""),
                        inline: false,
                    });
                }
                // Show unclaimed sessions
                if (unclaimedSessions.length > 0) {
                    const unclaimedList = unclaimedSessions
                        .slice(0, 5)
                        .map(({ userId: uid, session }) => {
                        return `<@${uid}> • ${session.type === "solo" ? `${(0, customEmojis_1.getPickaxeEmoji)()}` : `${(0, customEmojis_1.getCowboysEmoji)()}`} • ${session.goldAmount} ${goldEmoji}`;
                    })
                        .join("\n");
                    sessionsEmbed.addFields({
                        name: `${(0, customEmojis_1.getCheckEmoji)()} ${(0, i18n_1.t)(i, "mine_ready_to_claim")}`,
                        value: unclaimedList +
                            (unclaimedSessions.length > 5
                                ? `\n_+${unclaimedSessions.length - 5} ${(0, i18n_1.t)(i, "mine_more")}_`
                                : ""),
                        inline: false,
                    });
                }
                if (activeSessions.length === 0 && unclaimedSessions.length === 0) {
                    sessionsEmbed.addFields({
                        name: `💤 ${(0, i18n_1.t)(i, "mine_no_active_sessions")}`,
                        value: (0, i18n_1.t)(i, "mine_no_one_mining_start"),
                        inline: false,
                    });
                }
                sessionsEmbed
                    .setFooter({
                    text: `${(0, customEmojis_1.getPickaxeEmoji)()} ${(0, i18n_1.t)(i, "mine_sessions_realtime")}`,
                })
                    .setTimestamp();
                await i.reply({
                    embeds: [sessionsEmbed],
                    flags: discord_js_1.MessageFlags.Ephemeral,
                });
            }
            else if (i.customId === "mine_solo") {
                // Verify user for solo mining
                if (i.user.id !== interaction.user.id) {
                    return i.reply({
                        content: `${(0, customEmojis_1.getCancelEmoji)()} ${(0, i18n_1.t)(i, "mine_not_yours")}`,
                        flags: discord_js_1.MessageFlags.Ephemeral,
                    });
                }
                const hasBoost = (0, territoryManager_1.ownsTerritory)(userId, "gold_mine_shares");
                const miningResult = startMining(userId, "solo");
                const durationText = hasBoost
                    ? (0, i18n_1.t)(i, "mine_duration_1h30_boosted")
                    : (0, i18n_1.t)(i, "mine_duration_1h30");
                const boostBadge = hasBoost ? (0, i18n_1.t)(i, "mine_boost_badge") : "";
                const pickaxeBadge = miningResult.hasPickaxe ? `\n⛏️ **${(0, i18n_1.t)(i, "mine_pickaxe_bonus")}** (16-28 ${(0, i18n_1.t)(i, "gold_bars")})` : "";
                await i.update({
                    embeds: [
                        {
                            color: 0xffd700,
                            title: `${(0, customEmojis_1.getPickaxeEmoji)()} ${(0, i18n_1.t)(i, "mine_solo_started")}`,
                            description: `${(0, i18n_1.t)(i, "mine_started_mining")}\n\n${(0, customEmojis_1.getTimerEmoji)()} **${(0, i18n_1.t)(i, "mine_duration")}:** ${durationText}\n${(0, customEmojis_1.getDiamondEmoji)()} **${(0, i18n_1.t)(i, "mine_expected")}:** ${miningResult.goldAmount} ${goldEmoji} ${(0, i18n_1.t)(i, "gold_bars")}${boostBadge}${pickaxeBadge}\n\n${(0, i18n_1.t)(i, "mine_automatic")}\n**${(0, i18n_1.t)(i, "mine_come_back_in")}**`,
                            footer: {
                                text: `${(0, customEmojis_1.getPickaxeEmoji)()} ${(0, i18n_1.t)(i, "mine_check_progress")}`,
                            },
                            timestamp: new Date().toISOString(),
                        },
                    ],
                    components: [],
                });
            }
            else if (i.customId === "mine_coop") {
                // Verify user for cooperative mining
                if (i.user.id !== interaction.user.id) {
                    return i.reply({
                        content: `${(0, customEmojis_1.getCancelEmoji)()} ${(0, i18n_1.t)(i, "mine_not_yours")}`,
                        flags: discord_js_1.MessageFlags.Ephemeral,
                    });
                }
                // Mineração cooperativa - criar convite
                const hasBoostCoop = (0, territoryManager_1.ownsTerritory)(userId, "gold_mine_shares");
                const coopDurationText = hasBoostCoop
                    ? (0, i18n_1.t)(i, "mine_duration_30min_boosted")
                    : (0, i18n_1.t)(i, "mine_duration_30min");
                const inviteRow = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
                    .setCustomId("join_mining")
                    .setLabel((0, i18n_1.t)(i, "mine_find_partner"))
                    .setStyle(discord_js_1.ButtonStyle.Success));
                await i.update({
                    embeds: [
                        {
                            color: 0x00ff00,
                            title: `${(0, customEmojis_1.getCowboysEmoji)()} ${(0, i18n_1.t)(i, "mine_looking_partner")}`,
                            description: `${(0, i18n_1.t)(i, "mine_is_looking")}\n\n${goldEmoji} **${(0, i18n_1.t)(i, "mine_total_reward")}:** ${(0, i18n_1.t)(i, "mine_split_between")}\n${(0, customEmojis_1.getTimerEmoji)()} **${(0, i18n_1.t)(i, "mine_duration")}:** ${coopDurationText}\n\n**${(0, i18n_1.t)(i, "mine_click_to_join")}**`,
                            footer: { text: (0, i18n_1.t)(i, "mine_first_person") },
                        },
                    ],
                    components: [inviteRow],
                });
                // Collector para convite cooperativo
                const coopCollector = response.createMessageComponentCollector({
                    time: 120000,
                });
                coopCollector.on("collect", async (coopI) => {
                    if (coopI.customId !== "join_mining")
                        return;
                    if (coopI.user.id === interaction.user.id) {
                        return coopI.reply({
                            content: `${(0, customEmojis_1.getCancelEmoji)()} ${(0, i18n_1.t)(coopI, "mine_cannot_join_self")}`,
                            flags: discord_js_1.MessageFlags.Ephemeral,
                        });
                    }
                    const partnerId = coopI.user.id;
                    // Verificar se parceiro já está minerando
                    const partnerMining = getActiveMining(partnerId);
                    if (partnerMining) {
                        return coopI.reply({
                            content: `${(0, customEmojis_1.getCancelEmoji)()} ${(0, i18n_1.t)(coopI, "mine_already_mining")}`,
                            flags: discord_js_1.MessageFlags.Ephemeral,
                        });
                    }
                    // Iniciar mineração cooperativa
                    const goldAmount = Math.floor(Math.random() * 3) + 4; // 4-6 gold
                    const goldPerPerson = Math.floor(goldAmount / 2);
                    const remainder = goldAmount % 2;
                    // Distribuição justa: remainder vai para o owner (quem iniciou a mineração)
                    const ownerGold = goldPerPerson + (remainder === 1 ? 1 : 0);
                    const partnerGold = goldPerPerson;
                    startMining(userId, "coop", partnerId, ownerGold);
                    startMining(partnerId, "coop", userId, partnerGold);
                    // Check if owner has boost for displaying correct duration
                    const ownerHasBoost = (0, territoryManager_1.ownsTerritory)(userId, "gold_mine_shares");
                    const coopDuration = ownerHasBoost
                        ? (0, i18n_1.t)(coopI, "mine_duration_30min_boosted")
                        : (0, i18n_1.t)(coopI, "mine_duration_30min");
                    await coopI.update({
                        embeds: [
                            {
                                color: 0xffd700,
                                title: `${(0, customEmojis_1.getPickaxeEmoji)()} ${(0, i18n_1.t)(coopI, "mine_coop_started")}`,
                                description: `**${interaction.user.username}** e **${coopI.user.username}** ${(0, i18n_1.t)(coopI, "mine_mining_together")}\n\n${(0, customEmojis_1.getTimerEmoji)()} **${(0, i18n_1.t)(coopI, "mine_duration")}:** ${coopDuration}\n${(0, customEmojis_1.getDiamondEmoji)()} **${(0, i18n_1.t)(coopI, "mine_total_gold")}:** ${goldAmount} ${goldEmoji} ${(0, i18n_1.t)(coopI, "gold_bars")}\n\n**${interaction.user.username}:** ${ownerGold} ${goldEmoji}\n**${coopI.user.username}:** ${partnerGold} ${goldEmoji}\n\n${(0, i18n_1.t)(coopI, "mine_automatic")}\n**${(0, i18n_1.t)(coopI, "mine_come_back_in")}**`,
                                footer: {
                                    text: `${(0, customEmojis_1.getPickaxeEmoji)()} ${(0, i18n_1.t)(coopI, "mine_check_progress")}`,
                                },
                                timestamp: new Date().toISOString(),
                            },
                        ],
                        components: [],
                    });
                    coopCollector.stop();
                });
                coopCollector.on("end", async (collected) => {
                    if (collected.size === 0) {
                        await response.edit({
                            embeds: [
                                {
                                    color: 0x808080,
                                    title: `${(0, customEmojis_1.getTimerEmoji)()} ${(0, i18n_1.t)(interaction, "mine_invitation_expired")}`,
                                    description: `${(0, i18n_1.t)(interaction, "mine_no_one_joined")}`,
                                    footer: { text: (0, i18n_1.t)(interaction, "mine_better_luck") },
                                },
                            ],
                            components: [],
                        });
                    }
                });
                collector.stop();
            }
        });
        collector.on("end", async (collected) => {
            if (collected.size === 0) {
                await response.edit({
                    embeds: [
                        {
                            color: 0x808080,
                            title: `⏰ ${(0, i18n_1.t)(interaction, "mine_invitation_expired")}`,
                            description: `${(0, i18n_1.t)(interaction, "mine_no_one_joined")}`,
                            footer: { text: (0, i18n_1.t)(interaction, "mine_better_luck") },
                        },
                    ],
                    components: [],
                });
            }
        });
    },
};
//# sourceMappingURL=mine.js.map