"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const embeds_1 = require("../../utils/embeds");
const customEmojis_1 = require("../../utils/customEmojis");
const i18n_1 = require("../../utils/i18n");
const commandLocalizations_1 = require("../../utils/commandLocalizations");
const inventoryManager_1 = require("../../utils/inventoryManager");
const database_1 = require("../../utils/database");
const EXPEDITION_DURATION_SHORT = 3 * 60 * 60 * 1000; // 3 horas
const EXPEDITION_DURATION_LONG = 10 * 60 * 60 * 1000; // 10 horas
const EXPEDITION_COOLDOWN = 6 * 60 * 60 * 1000; // 6 horas de cooldown
// Seal requirements
const SEAL_COST_3H = 12; // 12 seals for 3h expedition
const SEAL_COST_10H_SOLO = 30; // 30 seals for 10h solo expedition
const SEAL_COST_10H_PARTY = 10; // 10 seals per person for 10h party expedition
// Calculate rewards based on duration and party size
function calculateRewards(duration, partySize) {
    if (duration === EXPEDITION_DURATION_SHORT) {
        // 3 hours - base rewards
        return {
            silverMin: 4500,
            silverMax: 8800,
            goldBars: 9,
            wheatMin: 2000,
            wheatMax: 6000,
            honey: 10,
            xp: 1000,
        };
    }
    else {
        // 10 hours - much better rewards
        return {
            silverMin: 35000,
            silverMax: 55000,
            goldBars: 16,
            wheatMin: 8000,
            wheatMax: 15000,
            honey: 35,
            xp: 3500,
        };
    }
}
// Check if all members have enough inventory capacity
function checkInventoryCapacity(members, duration) {
    const rewards = calculateRewards(duration, members.length);
    // Calculate maximum possible weight per person (worst case scenario)
    const maxGoldPerPerson = Math.ceil(rewards.goldBars / members.length) + 1;
    const maxWheatPerPerson = Math.ceil(rewards.wheatMax / members.length) + 1;
    const maxHoneyPerPerson = Math.ceil(rewards.honey / members.length) + 1;
    // Weight per item (from inventoryManager.ts)
    const goldWeight = 1; // 1kg per gold bar
    const wheatWeight = 0.0005; // 0.5g per wheat
    const honeyWeight = 0.05; // 50g per honey
    const maxWeightNeeded = maxGoldPerPerson * goldWeight +
        maxWheatPerPerson * wheatWeight +
        maxHoneyPerPerson * honeyWeight;
    for (const memberId of members) {
        const inventory = (0, inventoryManager_1.getInventory)(memberId);
        const currentWeight = (0, inventoryManager_1.calculateWeight)(inventory);
        const availableSpace = inventory.maxWeight - currentWeight;
        if (availableSpace < maxWeightNeeded) {
            return {
                hasCapacity: false,
                user: memberId,
                needed: Math.ceil(maxWeightNeeded - availableSpace),
            };
        }
    }
    return { hasCapacity: true, needed: 0 };
}
exports.default = {
    data: (0, commandLocalizations_1.applyLocalizations)(new discord_js_1.SlashCommandBuilder()
        .setName("expedition")
        .setDescription("Embark on a dangerous expedition through the desert!")
        .setContexts([0, 1, 2])
        .setIntegrationTypes([0, 1]), "expedition"),
    async execute(interaction) {
        const userId = interaction.user.id;
        // Defer reply immediately to prevent timeout (ephemeral for privacy)
        await interaction.deferReply({ ephemeral: true }).catch(() => { });
        const expeditionData = (0, database_1.readData)("expedition.json");
        if (!expeditionData.parties)
            expeditionData.parties = {};
        const userData = expeditionData[userId] || {
            totalExpeditions: 0,
        };
        const now = Date.now();
        // Check if user has active expedition
        if (userData.activeExpedition) {
            const partyId = userData.activeExpedition.partyId;
            const party = expeditionData.parties?.[partyId];
            if (party && party.endTime > now) {
                // Still on expedition
                const timeLeft = party.endTime - now;
                const progressBar = Math.floor(((now - party.startTime) / (party.endTime - party.startTime)) * 20);
                const bar = "█".repeat(progressBar) + "░".repeat(20 - progressBar);
                const durationHours = party.duration === EXPEDITION_DURATION_SHORT ? "3h" : "10h";
                const membersList = party.members
                    .map((id) => `<@${id}>`)
                    .join(", ");
                const embed = new discord_js_1.EmbedBuilder()
                    .setColor("#FFA500")
                    .setTitle(`🗺️ ${(0, i18n_1.t)(interaction, "expedition_in_progress_title")}`)
                    .setDescription((0, i18n_1.t)(interaction, "expedition_in_progress_desc"))
                    .addFields({
                    name: (0, i18n_1.t)(interaction, "expedition_party_members_label", {
                        cowboys: (0, customEmojis_1.getCowboysEmoji)(),
                    }),
                    value: membersList,
                    inline: false,
                }, {
                    name: (0, i18n_1.t)(interaction, "expedition_duration"),
                    value: durationHours,
                    inline: true,
                }, {
                    name: (0, i18n_1.t)(interaction, "expedition_time_left"),
                    value: `\`${bar}\`\n${(0, customEmojis_1.getClockEmoji)()} ${(0, embeds_1.formatDuration)(timeLeft)}`,
                    inline: false,
                })
                    .setFooter({ text: (0, i18n_1.t)(interaction, "expedition_in_progress_footer") });
                await interaction.editReply({ embeds: [embed] });
                return;
            }
            else if (party && party.endTime <= now) {
                // Expedition completed - rewards already given automatically
                const embed = new discord_js_1.EmbedBuilder()
                    .setColor("#00FF00")
                    .setTitle(`${(0, customEmojis_1.getCheckEmoji)()} ${(0, i18n_1.t)(interaction, "expedition_complete_title")}`)
                    .setDescription((0, i18n_1.t)(interaction, "expedition_already_complete"))
                    .setFooter({ text: (0, i18n_1.t)(interaction, "expedition_start_new") });
                // Clear the stale expedition reference
                userData.activeExpedition = undefined;
                expeditionData[userId] = userData;
                (0, database_1.writeData)("expedition.json", expeditionData);
                await interaction.editReply({ embeds: [embed] });
                return;
            }
        }
        // Check cooldown
        if (userData.lastExpedition) {
            const timeSinceLastExpedition = now - userData.lastExpedition;
            const cooldownLeft = EXPEDITION_COOLDOWN - timeSinceLastExpedition;
            if (cooldownLeft > 0) {
                const embed = new discord_js_1.EmbedBuilder()
                    .setColor("#FFA500")
                    .setTitle(`${(0, customEmojis_1.getClockEmoji)()} ${(0, i18n_1.t)(interaction, "expedition_cooldown_title")}`)
                    .setDescription((0, i18n_1.t)(interaction, "expedition_cooldown_desc"))
                    .addFields({
                    name: (0, i18n_1.t)(interaction, "expedition_cooldown_time"),
                    value: `${(0, customEmojis_1.getClockEmoji)()} ${(0, embeds_1.formatDuration)(cooldownLeft)}`,
                    inline: false,
                })
                    .setFooter({ text: (0, i18n_1.t)(interaction, "expedition_cooldown_footer") });
                await interaction.editReply({ embeds: [embed] });
                return;
            }
        }
        // Start new expedition - show options
        const silverEmoji = (0, customEmojis_1.getSilverCoinEmoji)();
        const goldEmoji = (0, customEmojis_1.getGoldBarEmoji)();
        const soloButton = new discord_js_1.ButtonBuilder()
            .setCustomId(`expedition_solo_${userId}`)
            .setLabel((0, i18n_1.t)(interaction, "expedition_solo_btn"))
            .setStyle(discord_js_1.ButtonStyle.Primary)
            .setEmoji("🤠");
        const partyButton = new discord_js_1.ButtonBuilder()
            .setCustomId(`expedition_party_${userId}`)
            .setLabel((0, i18n_1.t)(interaction, "expedition_party_btn"))
            .setStyle(discord_js_1.ButtonStyle.Success)
            .setEmoji("👥");
        const row = new discord_js_1.ActionRowBuilder().addComponents(soloButton, partyButton);
        const embed = new discord_js_1.EmbedBuilder()
            .setColor("#FF8C00")
            .setTitle(`🗺️ ${(0, i18n_1.t)(interaction, "expedition_title")}`)
            .setDescription(`${(0, i18n_1.t)(interaction, "expedition_desc")}\n\n${(0, i18n_1.t)(interaction, "expedition_choose_type")}\n${(0, i18n_1.t)(interaction, "expedition_type_solo", { cowboy: (0, customEmojis_1.getCowboyEmoji)() })}\n${(0, i18n_1.t)(interaction, "expedition_type_party", { cowboys: (0, customEmojis_1.getCowboysEmoji)() })}`)
            .addFields({
            name: (0, i18n_1.t)(interaction, "expedition_duration_options"),
            value: `${(0, i18n_1.t)(interaction, "expedition_duration_3h")}\n${(0, i18n_1.t)(interaction, "expedition_duration_10h")}`,
            inline: false,
        }, {
            name: (0, i18n_1.t)(interaction, "expedition_cooldown_label"),
            value: (0, i18n_1.t)(interaction, "expedition_cooldown_value"),
            inline: false,
        }, {
            name: (0, i18n_1.t)(interaction, "expedition_seal_requirements"),
            value: `${(0, i18n_1.t)(interaction, "expedition_seal_3h")}\n${(0, i18n_1.t)(interaction, "expedition_seal_10h_solo")}\n${(0, i18n_1.t)(interaction, "expedition_seal_10h_party")}`,
            inline: false,
        }, {
            name: (0, i18n_1.t)(interaction, "expedition_rewards_3h"),
            value: (0, i18n_1.t)(interaction, "expedition_rewards_3h_value", {
                silver: silverEmoji,
                gold: goldEmoji,
                star: (0, customEmojis_1.getStarEmoji)(),
            }),
            inline: true,
        }, {
            name: (0, i18n_1.t)(interaction, "expedition_rewards_10h"),
            value: (0, i18n_1.t)(interaction, "expedition_rewards_10h_value", {
                silver: silverEmoji,
                gold: goldEmoji,
                star: (0, customEmojis_1.getStarEmoji)(),
            }),
            inline: true,
        })
            .setImage("https://i.postimg.cc/YODZNLOB/IMG-3256.png")
            .setFooter({ text: (0, i18n_1.t)(interaction, "expedition_choose_wisely") });
        const response = await interaction.editReply({
            embeds: [embed],
            components: [row],
        });
        let userMadeChoice = false; // Track if user made a valid choice
        const collector = response.createMessageComponentCollector({
            filter: (i) => i.user.id === userId,
            time: 600000, // 10 minutes instead of 2
        });
        collector.on("collect", async (i) => {
            if (i.customId === `expedition_solo_${userId}`) {
                // Solo expedition - check seals first
                const userSeals = (0, inventoryManager_1.getItem)(userId, "seal");
                // Check if user has at least minimum seals for any expedition
                if (userSeals < SEAL_COST_3H) {
                    await i.reply({
                        content: `${(0, customEmojis_1.getCrossEmoji)()} **Você não tem selos suficientes!**\n\n🎟️ Você tem: **${userSeals} selos**\n🎟️ Necessário: **${SEAL_COST_3H} selos** (expedição de 3h)\n\n*Use \`/inventory\` para verificar seus itens*`,
                        flags: [discord_js_1.MessageFlags.Ephemeral],
                    });
                    return;
                }
                // Mark that user made a valid choice
                userMadeChoice = true;
                collector.stop();
                await i.deferUpdate();
                const duration3hBtn = new discord_js_1.ButtonBuilder()
                    .setCustomId(`expedition_start_3h_solo_${userId}`)
                    .setLabel((0, i18n_1.t)(i, "expedition_btn_3h"))
                    .setStyle(discord_js_1.ButtonStyle.Primary)
                    .setEmoji("🕐");
                const duration10hBtn = new discord_js_1.ButtonBuilder()
                    .setCustomId(`expedition_start_10h_solo_${userId}`)
                    .setLabel((0, i18n_1.t)(i, "expedition_btn_10h"))
                    .setStyle(discord_js_1.ButtonStyle.Success)
                    .setEmoji("🕐")
                    .setDisabled(userSeals < SEAL_COST_10H_SOLO);
                const backBtn = new discord_js_1.ButtonBuilder()
                    .setCustomId(`expedition_back_${userId}`)
                    .setLabel((0, i18n_1.t)(i, "expedition_btn_back"))
                    .setStyle(discord_js_1.ButtonStyle.Secondary)
                    .setEmoji("◀️");
                const durationRow = new discord_js_1.ActionRowBuilder().addComponents(duration3hBtn, duration10hBtn, backBtn);
                let descriptionText = (0, i18n_1.t)(i, "expedition_solo_select");
                descriptionText += `\n\n🎟️ **Seus selos:** ${userSeals}`;
                if (userSeals < SEAL_COST_10H_SOLO) {
                    descriptionText += `\n⚠️ **Atenção:** Expedição de 10h requer **${SEAL_COST_10H_SOLO} selos**.`;
                }
                const durationEmbed = new discord_js_1.EmbedBuilder()
                    .setColor("#FF8C00")
                    .setTitle((0, i18n_1.t)(i, "expedition_solo_choose_duration", {
                    cowboy: (0, customEmojis_1.getCowboyEmoji)(),
                }))
                    .setDescription(descriptionText)
                    .addFields({
                    name: (0, i18n_1.t)(i, "expedition_3h_label", { clock: (0, customEmojis_1.getClockEmoji)() }),
                    value: (0, i18n_1.t)(i, "expedition_3h_desc"),
                    inline: true,
                }, {
                    name: (0, i18n_1.t)(i, "expedition_10h_label", { clock: (0, customEmojis_1.getClockEmoji)() }),
                    value: (0, i18n_1.t)(i, "expedition_10h_desc"),
                    inline: true,
                })
                    .setFooter({ text: (0, i18n_1.t)(i, "expedition_solo_duration_footer") });
                await i.editReply({
                    embeds: [durationEmbed],
                    components: [durationRow],
                });
            }
            else if (i.customId === `expedition_party_${userId}`) {
                // Party expedition - check seals first
                const userSeals = (0, inventoryManager_1.getItem)(userId, "seal");
                // Check if user has at least minimum seals for any party expedition (10h requires 10 seals)
                const minSealsRequired = Math.min(SEAL_COST_3H, SEAL_COST_10H_PARTY);
                if (userSeals < minSealsRequired) {
                    await i.reply({
                        content: `${(0, customEmojis_1.getCrossEmoji)()} **Você não tem selos suficientes!**\n\n🎟️ Você tem: **${userSeals} selos**\n🎟️ Necessário: **${minSealsRequired} selos** (mínimo para expedição em grupo)\n\n*Use \`/inventory\` para verificar seus itens*`,
                        flags: [discord_js_1.MessageFlags.Ephemeral],
                    });
                    return;
                }
                // Mark that user made a valid choice
                userMadeChoice = true;
                collector.stop();
                await i.deferUpdate();
                const duration3hBtn = new discord_js_1.ButtonBuilder()
                    .setCustomId(`expedition_start_3h_party_${userId}`)
                    .setLabel((0, i18n_1.t)(i, "expedition_btn_3h_1to3"))
                    .setStyle(discord_js_1.ButtonStyle.Primary)
                    .setEmoji("🕐")
                    .setDisabled(userSeals < SEAL_COST_3H);
                const duration10hBtn = new discord_js_1.ButtonBuilder()
                    .setCustomId(`expedition_start_10h_party_${userId}`)
                    .setLabel((0, i18n_1.t)(i, "expedition_btn_10h_2to3"))
                    .setStyle(discord_js_1.ButtonStyle.Success)
                    .setEmoji("🕐");
                const backBtn = new discord_js_1.ButtonBuilder()
                    .setCustomId(`expedition_back_${userId}`)
                    .setLabel((0, i18n_1.t)(i, "expedition_btn_back"))
                    .setStyle(discord_js_1.ButtonStyle.Secondary)
                    .setEmoji("◀️");
                const durationRow = new discord_js_1.ActionRowBuilder().addComponents(duration3hBtn, duration10hBtn, backBtn);
                let partyDescriptionText = (0, i18n_1.t)(i, "expedition_party_select");
                partyDescriptionText += `\n\n🎟️ **Seus selos:** ${userSeals}`;
                if (userSeals < SEAL_COST_3H) {
                    partyDescriptionText += `\n⚠️ **Atenção:** Expedição de 3h requer **${SEAL_COST_3H} selos**.`;
                }
                const durationEmbed = new discord_js_1.EmbedBuilder()
                    .setColor("#FF8C00")
                    .setTitle((0, i18n_1.t)(i, "expedition_party_choose_duration", {
                    cowboys: (0, customEmojis_1.getCowboysEmoji)(),
                }))
                    .setDescription(partyDescriptionText)
                    .addFields({
                    name: (0, i18n_1.t)(i, "expedition_3h_party_label", {
                        clock: (0, customEmojis_1.getClockEmoji)(),
                    }),
                    value: (0, i18n_1.t)(i, "expedition_3h_party_desc"),
                    inline: true,
                }, {
                    name: (0, i18n_1.t)(i, "expedition_10h_party_label", {
                        clock: (0, customEmojis_1.getClockEmoji)(),
                    }),
                    value: (0, i18n_1.t)(i, "expedition_10h_party_desc"),
                    inline: true,
                })
                    .setFooter({ text: (0, i18n_1.t)(i, "expedition_party_duration_footer") });
                await i.editReply({
                    embeds: [durationEmbed],
                    components: [durationRow],
                });
            }
        });
        // Handle duration selection and party invites
        const secondCollector = response.createMessageComponentCollector({
            time: 600000, // 10 minutes - increased from 5
        });
        const pendingParties = new Map();
        secondCollector.on("collect", async (i) => {
            // Solo 3h
            if (i.customId === `expedition_start_3h_solo_${userId}` &&
                i.user.id === userId) {
                const userSeals = (0, inventoryManager_1.getItem)(userId, "seal");
                if (userSeals < SEAL_COST_3H) {
                    await i.reply({
                        content: (0, i18n_1.t)(i, "expedition_insufficient_seals", {
                            cross: (0, customEmojis_1.getCrossEmoji)(),
                            current: userSeals,
                            required: SEAL_COST_3H,
                        }),
                        flags: [discord_js_1.MessageFlags.Ephemeral],
                    });
                    return;
                }
                await startExpedition(i, userId, [userId], EXPEDITION_DURATION_SHORT, expeditionData);
                secondCollector.stop();
            }
            // Solo 10h
            else if (i.customId === `expedition_start_10h_solo_${userId}` &&
                i.user.id === userId) {
                const userSeals = (0, inventoryManager_1.getItem)(userId, "seal");
                if (userSeals < SEAL_COST_10H_SOLO) {
                    await i.reply({
                        content: (0, i18n_1.t)(i, "expedition_insufficient_seals", {
                            cross: (0, customEmojis_1.getCrossEmoji)(),
                            current: userSeals,
                            required: SEAL_COST_10H_SOLO,
                        }),
                        flags: [discord_js_1.MessageFlags.Ephemeral],
                    });
                    return;
                }
                await startExpedition(i, userId, [userId], EXPEDITION_DURATION_LONG, expeditionData);
                secondCollector.stop();
            }
            // Party 3h
            else if (i.customId === `expedition_start_3h_party_${userId}` &&
                i.user.id === userId) {
                await showPartyInvite(i, userId, EXPEDITION_DURATION_SHORT, pendingParties);
            }
            // Party 10h
            else if (i.customId === `expedition_start_10h_party_${userId}` &&
                i.user.id === userId) {
                await showPartyInvite(i, userId, EXPEDITION_DURATION_LONG, pendingParties);
            }
            // Back button
            else if (i.customId === `expedition_back_${userId}` &&
                i.user.id === userId) {
                await i.update({
                    embeds: [embed],
                    components: [row],
                });
            }
            // Note: Party join/start logic is now handled by the partyCollector
            // created in showPartyInvite() on the public message
        });
        collector.on("end", () => {
            // Only clear components if user didn't make a valid choice (timed out)
            if (!userMadeChoice) {
                interaction.editReply({ components: [] }).catch(() => { });
            }
        });
    },
};
async function showPartyInvite(interaction, leaderId, duration, pendingParties) {
    await interaction.deferUpdate();
    const expeditionData = (0, database_1.readData)("expedition.json");
    const partyKey = `${leaderId}_${Date.now()}`;
    const durationText = duration === EXPEDITION_DURATION_SHORT
        ? (0, i18n_1.t)(interaction, "expedition_duration_3h_text")
        : (0, i18n_1.t)(interaction, "expedition_duration_10h_text");
    const minPlayers = duration === EXPEDITION_DURATION_LONG ? 2 : 1;
    const membersList = `<@${leaderId}>`;
    const joinButton = new discord_js_1.ButtonBuilder()
        .setCustomId(`expedition_join_${partyKey}`)
        .setLabel((0, i18n_1.t)(interaction, "expedition_btn_join", { current: 1 }))
        .setStyle(discord_js_1.ButtonStyle.Success)
        .setEmoji("✅");
    const startButton = new discord_js_1.ButtonBuilder()
        .setCustomId(`expedition_start_party_${partyKey}`)
        .setLabel((0, i18n_1.t)(interaction, "expedition_btn_start_party"))
        .setStyle(discord_js_1.ButtonStyle.Primary)
        .setEmoji("🗺️")
        .setDisabled(minPlayers > 1);
    const row = new discord_js_1.ActionRowBuilder().addComponents(joinButton, startButton);
    const embed = new discord_js_1.EmbedBuilder()
        .setColor("#00FF00")
        .setTitle((0, i18n_1.t)(interaction, "expedition_party_title", {
        cowboys: (0, customEmojis_1.getCowboysEmoji)(),
        duration: durationText,
    }))
        .setDescription(`${(0, i18n_1.t)(interaction, "expedition_party_forming", { leader: leaderId })}\n\n**${(0, i18n_1.t)(interaction, "expedition_party_members", { current: 1 })}**\n${membersList}`)
        .addFields({
        name: (0, i18n_1.t)(interaction, "expedition_duration"),
        value: durationText,
        inline: true,
    }, {
        name: (0, i18n_1.t)(interaction, "expedition_party_required"),
        value: (0, i18n_1.t)(interaction, "expedition_party_required_players", {
            min: minPlayers,
        }),
        inline: true,
    }, {
        name: (0, i18n_1.t)(interaction, "expedition_party_rewards_divided"),
        value: (0, i18n_1.t)(interaction, "expedition_party_rewards_equally"),
        inline: false,
    })
        .setFooter({ text: (0, i18n_1.t)(interaction, "expedition_party_footer") });
    // Send a PUBLIC follow-up message so everyone can see and join
    const publicMessage = await interaction.followUp({
        embeds: [embed],
        components: [row],
        ephemeral: false,
    });
    // Send confirmation to leader (ephemeral)
    await interaction.editReply({
        content: `${(0, customEmojis_1.getCheckEmoji)()} **Lobby de expedição criado!**\n\nSeus amigos agora podem ver a mensagem abaixo e clicar em "Entrar" para se juntar à expedição.`,
        embeds: [],
        components: [],
    });
    const party = {
        leader: leaderId,
        duration,
        members: new Set([leaderId]),
        memberLocales: { [leaderId]: (0, i18n_1.getLocale)(interaction) }, // Store member locales
        messageId: publicMessage.id,
        message: publicMessage,
    };
    pendingParties.set(partyKey, party);
    // Create collector on the public message for join/start buttons
    const partyCollector = publicMessage.createMessageComponentCollector({
        time: 600000, // 10 minutes
    });
    partyCollector.on("collect", async (i) => {
        // Join party button
        if (i.customId === `expedition_join_${partyKey}`) {
            if (party.leader === i.user.id) {
                await i.reply({
                    content: `${(0, customEmojis_1.getCrossEmoji)()} **Você já é o líder do grupo!**`,
                    flags: [discord_js_1.MessageFlags.Ephemeral],
                });
                return;
            }
            // Check if user already in party
            if (party.members.has(i.user.id)) {
                await i.reply({
                    content: (0, i18n_1.t)(i, "expedition_already_joined", {
                        cross: (0, customEmojis_1.getCrossEmoji)(),
                    }),
                    flags: [discord_js_1.MessageFlags.Ephemeral],
                });
                return;
            }
            // Check party size limit
            if (party.members.size >= 3) {
                await i.reply({
                    content: (0, i18n_1.t)(i, "expedition_party_full", {
                        cross: (0, customEmojis_1.getCrossEmoji)(),
                    }),
                    flags: [discord_js_1.MessageFlags.Ephemeral],
                });
                return;
            }
            // Check if user has active expedition
            const joinerData = expeditionData[i.user.id];
            if (joinerData?.activeExpedition) {
                await i.reply({
                    content: (0, i18n_1.t)(i, "expedition_already_active", {
                        cross: (0, customEmojis_1.getCrossEmoji)(),
                    }),
                    flags: [discord_js_1.MessageFlags.Ephemeral],
                });
                return;
            }
            // Check if user is on cooldown
            if (joinerData?.lastExpedition) {
                const timeSince = Date.now() - joinerData.lastExpedition;
                const cooldownLeft = EXPEDITION_COOLDOWN - timeSince;
                if (cooldownLeft > 0) {
                    await i.reply({
                        content: (0, i18n_1.t)(i, "expedition_on_cooldown", {
                            cross: (0, customEmojis_1.getCrossEmoji)(),
                            timeLeft: (0, embeds_1.formatDuration)(cooldownLeft),
                        }),
                        flags: [discord_js_1.MessageFlags.Ephemeral],
                    });
                    return;
                }
            }
            // Check if user has enough seals
            const requiredSeals = party.duration === EXPEDITION_DURATION_SHORT
                ? SEAL_COST_3H
                : SEAL_COST_10H_PARTY;
            const userSeals = (0, inventoryManager_1.getItem)(i.user.id, "seal");
            if (userSeals < requiredSeals) {
                await i.reply({
                    content: (0, i18n_1.t)(i, "expedition_insufficient_seals", {
                        cross: (0, customEmojis_1.getCrossEmoji)(),
                        current: userSeals,
                        required: requiredSeals,
                    }),
                    flags: [discord_js_1.MessageFlags.Ephemeral],
                });
                return;
            }
            // Add to party
            party.members.add(i.user.id);
            party.memberLocales[i.user.id] = (0, i18n_1.getLocale)(i); // Save member's locale
            await i.reply({
                content: (0, i18n_1.t)(i, "expedition_joined_party", {
                    check: (0, customEmojis_1.getCheckEmoji)(),
                    leader: party.leader,
                    current: party.members.size,
                }),
                flags: [discord_js_1.MessageFlags.Ephemeral],
            });
            // Update the main message to show new member
            await updatePartyMessage(i, party, pendingParties, partyKey);
        }
        // Start party expedition
        else if (i.customId === `expedition_start_party_${partyKey}`) {
            // Check if user is the leader
            if (party.leader !== i.user.id) {
                await i.reply({
                    content: `${(0, customEmojis_1.getCrossEmoji)()} **Apenas o líder pode iniciar a expedição!**\n\n👑 **Líder:** <@${party.leader}>\n\nAguarde o líder iniciar a expedição.`,
                    flags: [discord_js_1.MessageFlags.Ephemeral],
                });
                return;
            }
            // Validate party size for 10h expedition
            if (party.duration === EXPEDITION_DURATION_LONG &&
                party.members.size < 2) {
                await i.reply({
                    content: (0, i18n_1.t)(i, "expedition_need_min_players", {
                        cross: (0, customEmojis_1.getCrossEmoji)(),
                    }),
                    flags: [discord_js_1.MessageFlags.Ephemeral],
                });
                return;
            }
            // Validate all members have enough seals
            const sealCost = party.duration === EXPEDITION_DURATION_SHORT
                ? SEAL_COST_3H
                : SEAL_COST_10H_PARTY;
            for (const memberId of party.members) {
                const memberSeals = (0, inventoryManager_1.getItem)(memberId, "seal");
                if (memberSeals < sealCost) {
                    await i.reply({
                        content: (0, i18n_1.t)(i, "expedition_member_insufficient_seals", {
                            cross: (0, customEmojis_1.getCrossEmoji)(),
                            member: memberId,
                            required: sealCost,
                        }),
                        flags: [discord_js_1.MessageFlags.Ephemeral],
                    });
                    return;
                }
            }
            await startExpedition(i, party.leader, Array.from(party.members), party.duration, expeditionData, party.memberLocales);
            pendingParties.delete(partyKey);
            partyCollector.stop();
        }
    });
    partyCollector.on("end", () => {
        // Disable buttons when collector expires
        if (pendingParties.has(partyKey)) {
            pendingParties.delete(partyKey);
            const disabledJoin = discord_js_1.ButtonBuilder.from(joinButton).setDisabled(true);
            const disabledStart = discord_js_1.ButtonBuilder.from(startButton).setDisabled(true);
            const disabledRow = new discord_js_1.ActionRowBuilder().addComponents(disabledJoin, disabledStart);
            publicMessage.edit({ components: [disabledRow] }).catch(() => { });
        }
    });
}
async function updatePartyMessage(interaction, party, pendingParties, partyKey) {
    if (!partyKey) {
        // Find the party key
        for (const [key, p] of pendingParties.entries()) {
            if (p === party) {
                partyKey = key;
                break;
            }
        }
    }
    const durationText = party.duration === EXPEDITION_DURATION_SHORT
        ? (0, i18n_1.t)(interaction, "expedition_duration_3h_text")
        : (0, i18n_1.t)(interaction, "expedition_duration_10h_text");
    const minPlayers = party.duration === EXPEDITION_DURATION_LONG ? 2 : 1;
    const membersList = Array.from(party.members)
        .map((id) => `<@${id}>`)
        .join("\n");
    const joinButton = new discord_js_1.ButtonBuilder()
        .setCustomId(`expedition_join_${partyKey}`)
        .setLabel((0, i18n_1.t)(interaction, "expedition_btn_join", { current: party.members.size }))
        .setStyle(discord_js_1.ButtonStyle.Success)
        .setEmoji("✅")
        .setDisabled(party.members.size >= 3);
    const startButton = new discord_js_1.ButtonBuilder()
        .setCustomId(`expedition_start_party_${partyKey}`)
        .setLabel((0, i18n_1.t)(interaction, "expedition_btn_start_party"))
        .setStyle(discord_js_1.ButtonStyle.Primary)
        .setEmoji("🗺️")
        .setDisabled(party.members.size < minPlayers);
    const row = new discord_js_1.ActionRowBuilder().addComponents(joinButton, startButton);
    const embed = new discord_js_1.EmbedBuilder()
        .setColor("#00FF00")
        .setTitle((0, i18n_1.t)(interaction, "expedition_party_title", {
        cowboys: (0, customEmojis_1.getCowboysEmoji)(),
        duration: durationText,
    }))
        .setDescription(`${(0, i18n_1.t)(interaction, "expedition_party_forming", { leader: party.leader })}\n\n**${(0, i18n_1.t)(interaction, "expedition_party_members", { current: party.members.size })}**\n${membersList}`)
        .addFields({
        name: (0, i18n_1.t)(interaction, "expedition_duration"),
        value: durationText,
        inline: true,
    }, {
        name: (0, i18n_1.t)(interaction, "expedition_party_required"),
        value: (0, i18n_1.t)(interaction, "expedition_party_required_players", {
            min: minPlayers,
        }),
        inline: true,
    }, {
        name: (0, i18n_1.t)(interaction, "expedition_party_rewards_divided"),
        value: (0, i18n_1.t)(interaction, "expedition_party_rewards_equally"),
        inline: false,
    })
        .setFooter({ text: (0, i18n_1.t)(interaction, "expedition_party_footer") });
    if (party.message) {
        await party.message.edit({
            embeds: [embed],
            components: [row],
        });
    }
    else {
        await interaction.editReply({
            embeds: [embed],
            components: [row],
        });
    }
}
async function startExpedition(interaction, leaderId, members, duration, expeditionData, memberLocales) {
    await interaction.deferUpdate();
    // Check inventory capacity for all members
    const capacityCheck = checkInventoryCapacity(members, duration);
    if (!capacityCheck.hasCapacity) {
        await interaction.editReply({
            content: `${(0, customEmojis_1.getCrossEmoji)()} **Inventário cheio!**\n\n<@${capacityCheck.user}> não tem espaço suficiente no inventário para as recompensas da expedição.\n\n**Espaço necessário:** ~${capacityCheck.needed}kg\n\n💡 *Use \`/inventory\` para ver seu inventário ou venda/organize itens antes de partir.*`,
            components: [],
        });
        return;
    }
    // Double-check all members have enough seals before starting
    const sealCost = duration === EXPEDITION_DURATION_SHORT
        ? SEAL_COST_3H
        : members.length === 1
            ? SEAL_COST_10H_SOLO
            : SEAL_COST_10H_PARTY;
    for (const memberId of members) {
        const memberSeals = (0, inventoryManager_1.getItem)(memberId, "seal");
        if (memberSeals < sealCost) {
            await interaction.editReply({
                content: (0, i18n_1.t)(interaction, "expedition_insufficient_seals", {
                    cross: (0, customEmojis_1.getCrossEmoji)(),
                    current: memberSeals,
                    required: sealCost,
                }),
                components: [],
            });
            return;
        }
    }
    const startTime = Date.now();
    const endTime = startTime + duration;
    const partyId = `expedition_${leaderId}_${startTime}`;
    // Create party with guild and channel info for fallback notifications
    if (!expeditionData.parties)
        expeditionData.parties = {};
    // Store member locales for DM translations
    // Use provided memberLocales (from party), or create new ones for solo expeditions
    const locales = memberLocales || {};
    if (!memberLocales) {
        // Solo expedition - use leader's locale for all members
        const leaderLocale = (0, i18n_1.getLocale)(interaction);
        for (const memberId of members) {
            locales[memberId] = leaderLocale;
        }
    }
    expeditionData.parties[partyId] = {
        leader: leaderId,
        members,
        duration,
        startTime,
        endTime,
        dmSent: {},
        memberLocales: locales,
        guildId: interaction.guildId || undefined,
        channelId: interaction.channelId || undefined,
        rewardsGiven: false,
    };
    // Consume seals from all members (after validation passed)
    for (const memberId of members) {
        await (0, inventoryManager_1.removeItem)(memberId, "seal", sealCost);
    }
    // Update all members
    for (const memberId of members) {
        if (!expeditionData[memberId]) {
            expeditionData[memberId] = { totalExpeditions: 0 };
        }
        const memberData = expeditionData[memberId];
        memberData.activeExpedition = {
            partyId,
            isLeader: memberId === leaderId,
        };
    }
    (0, database_1.writeData)("expedition.json", expeditionData);
    const durationText = duration === EXPEDITION_DURATION_SHORT
        ? (0, i18n_1.t)(interaction, "expedition_duration_3h_text")
        : (0, i18n_1.t)(interaction, "expedition_duration_10h_text");
    const membersList = members.map((id) => `<@${id}>`).join(", ");
    const embed = new discord_js_1.EmbedBuilder()
        .setColor("#00FF00")
        .setTitle((0, i18n_1.t)(interaction, "expedition_started_title"))
        .setDescription((0, i18n_1.t)(interaction, "expedition_started_desc", {
        check: (0, customEmojis_1.getCheckEmoji)(),
        duration: durationText,
    }))
        .addFields({
        name: (0, i18n_1.t)(interaction, "expedition_party_members_label", {
            cowboys: (0, customEmojis_1.getCowboysEmoji)(),
        }),
        value: membersList,
        inline: false,
    }, {
        name: (0, i18n_1.t)(interaction, "expedition_duration"),
        value: durationText,
        inline: true,
    }, {
        name: (0, i18n_1.t)(interaction, "expedition_estimated_return", {
            timer: (0, customEmojis_1.getTimerEmoji)(),
        }),
        value: `<t:${Math.floor(endTime / 1000)}:R>`,
        inline: true,
    })
        .setFooter({ text: (0, i18n_1.t)(interaction, "expedition_started_footer") });
    await interaction.editReply({
        embeds: [embed],
        components: [],
    });
    // Rewards will be automatically processed by the expedition checker system
    // This prevents loss of rewards if the bot restarts during the expedition
    console.log(`🗺️ Expedição iniciada: ${partyId} - Término em ${new Date(endTime).toLocaleString()}`);
}
//# sourceMappingURL=expedition.js.map