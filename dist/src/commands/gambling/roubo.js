"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.data = void 0;
exports.execute = execute;
const discord_js_1 = require("discord.js");
const dataManager_1 = require("../../utils/dataManager");
const inventoryManager_1 = require("../../utils/inventoryManager");
const punishmentManager_1 = require("../../utils/punishmentManager");
const wantedPoster_1 = require("../../utils/wantedPoster");
const customEmojis_1 = require("../../utils/customEmojis");
const i18n_1 = require("../../utils/i18n");
const progressBar_1 = require("../../utils/progressBar");
const cooldowns = new Map();
const activeHeists = new Map();
const heistTimers = new Map();
const COOLDOWN_TIME = 300000; // 5 minutos
const ENTRY_FEE = 1000; // 1000 Silver Coins para tentar
const HEIST_DURATION = 120000; // 2 minutos para formar o grupo
const ROBBERY_DURATION = 300000; // 5 minutos para executar o roubo
function createHeistButtons(locale) {
    const joinLabel = (0, i18n_1.tLocale)(locale, "roubo_btn_join");
    const cancelLabel = (0, i18n_1.tLocale)(locale, "roubo_btn_cancel");
    const joinButton = new discord_js_1.ButtonBuilder()
        .setCustomId("join_heist")
        .setLabel(joinLabel)
        .setStyle(discord_js_1.ButtonStyle.Secondary);
    const cancelButton = new discord_js_1.ButtonBuilder()
        .setCustomId("cancel_heist")
        .setLabel(cancelLabel)
        .setStyle(discord_js_1.ButtonStyle.Secondary);
    return new discord_js_1.ActionRowBuilder().addComponents(joinButton, cancelButton);
}
function buildHeistEmbed(organizerTag, participants, requiredPlayers, locale, remainingSeconds, client) {
    const participantsList = Array.from(participants)
        .map((id, index) => {
        const user = client.users.cache.get(id);
        return `${index + 1}. ${user?.tag || "Unknown"}`;
    })
        .join("\n");
    const percentage = Math.floor((remainingSeconds / 120) * 100);
    const progressBar = (0, progressBar_1.createProgressBarString)(percentage, 15, "█", "░");
    const timeLeft = Math.ceil(remainingSeconds);
    const title = (0, i18n_1.tLocale)(locale, "roubo_title");
    const organizing = (0, i18n_1.tLocale)(locale, "roubo_organizing");
    const details = (0, i18n_1.tLocale)(locale, "roubo_details");
    const playersNeeded = (0, i18n_1.tLocale)(locale, "roubo_players_needed");
    const cattleToSteal = (0, i18n_1.tLocale)(locale, "roubo_cattle_to_steal");
    const cattleOptions = (0, i18n_1.tLocale)(locale, "roubo_cattle_options");
    const costPer = (0, i18n_1.tLocale)(locale, "roubo_cost_per_person");
    const warning = (0, i18n_1.tLocale)(locale, "roubo_warning");
    const warningText = (0, i18n_1.tLocale)(locale, "roubo_warning_text");
    const participantsLabel = (0, i18n_1.tLocale)(locale, "roubo_participants_label");
    const timeRemaining = (0, i18n_1.tLocale)(locale, "roubo_time_remaining");
    const footerText = (0, i18n_1.tLocale)(locale, "roubo_footer_join");
    const random = (0, i18n_1.tLocale)(locale, "roubo_random_word");
    return new discord_js_1.EmbedBuilder()
        .setColor(0xff6b35)
        .setTitle(`${(0, customEmojis_1.getEmoji)("cowboys")} ${title}`)
        .setImage("https://i.postimg.cc/52WZvCpc/IMG-3332.png")
        .setDescription(`**${organizerTag}** ${organizing}\n\n**${details}**\n${playersNeeded}: **${requiredPlayers}**\n${cattleToSteal}: **${cattleOptions}** (${random})\n${costPer}: ${(0, customEmojis_1.getEmoji)("silver_coin")} **${ENTRY_FEE.toLocaleString()} Silver**\n\n${(0, customEmojis_1.getEmoji)("warning")} **${warning}:** ${warningText}\n\n**${participantsLabel} (${participants.size}/${requiredPlayers}):**\n${participantsList}\n\n**${timeRemaining}:** ${timeLeft}s\n\`${progressBar}\``)
        .setFooter({
        text: footerText,
    })
        .setTimestamp();
}
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName("roubo")
    .setDescription("Roubo de gado cooperativo! Escolha de 2 a 4 jogadores para roubar gado!")
    .addIntegerOption((option) => option
    .setName("participantes")
    .setDescription("Número de participantes necessários (2-4)")
    .setRequired(true)
    .addChoices({ name: "2 jogadores", value: 2 }, { name: "3 jogadores", value: 3 }, { name: "4 jogadores", value: 4 }));
async function execute(interaction) {
    const userId = interaction.user.id;
    const locale = (0, i18n_1.getLocale)(interaction);
    const requiredPlayers = interaction.options.getInteger("participantes", true);
    const punishment = (0, punishmentManager_1.isPunished)(userId);
    if (punishment) {
        const remaining = (0, punishmentManager_1.getRemainingTime)(userId) || 0;
        await interaction.reply({
            content: `${(0, customEmojis_1.getEmoji)("mute")} **${(0, i18n_1.tLocale)(locale, "roubo_in_jail_cooldown")}**\n\n${punishment.reason}\n\n${(0, customEmojis_1.getEmoji)("clock")} ${(0, i18n_1.tLocale)(locale, "roubo_time_remaining_punishment")}: **${(0, punishmentManager_1.formatTime)(remaining)}**`,
            flags: discord_js_1.MessageFlags.Ephemeral,
        });
        return;
    }
    const now = Date.now();
    if (cooldowns.has(userId)) {
        const cooldownTimestamp = cooldowns.get(userId);
        if (cooldownTimestamp) {
            const expirationTime = cooldownTimestamp + COOLDOWN_TIME;
            if (now < expirationTime) {
                const timeLeft = Math.ceil((expirationTime - now) / 1000);
                await interaction.reply({
                    content: `${(0, customEmojis_1.getEmoji)("clock")} ${(0, i18n_1.tLocale)(locale, "roubo_cooldown_wait", { time: timeLeft })}`,
                    flags: discord_js_1.MessageFlags.Ephemeral,
                });
                return;
            }
        }
    }
    const userSilver = (0, dataManager_1.getUserSilver)(userId);
    if (userSilver < ENTRY_FEE) {
        await interaction.reply({
            content: `${(0, customEmojis_1.getEmoji)("cancel")} ${(0, i18n_1.tLocale)(locale, "roubo_entry_fee_required", { amount: ENTRY_FEE.toLocaleString() })}`,
            flags: discord_js_1.MessageFlags.Ephemeral,
        });
        return;
    }
    const heistId = `${interaction.channelId}-${Date.now()}`;
    const participants = new Set();
    participants.add(userId);
    activeHeists.set(heistId, participants);
    const startEmbed = buildHeistEmbed(interaction.user.tag, participants, requiredPlayers, locale, 120, interaction.client);
    await interaction.reply({
        embeds: [startEmbed],
        components: [createHeistButtons(locale)],
    });
    const response = await interaction.fetchReply();
    const collector = response.createMessageComponentCollector({
        componentType: discord_js_1.ComponentType.Button,
        time: HEIST_DURATION,
    });
    let heistStarted = false;
    const startTime = Date.now();
    const progressInterval = setInterval(async () => {
        const currentParticipants = activeHeists.get(heistId);
        if (!currentParticipants || heistStarted) {
            clearInterval(progressInterval);
            return;
        }
        const elapsed = Date.now() - startTime;
        const remainingMs = HEIST_DURATION - elapsed;
        const remainingSeconds = Math.max(0, remainingMs / 1000);
        if (remainingSeconds <= 0) {
            clearInterval(progressInterval);
            return;
        }
        const updatedEmbed = buildHeistEmbed(interaction.user.tag, currentParticipants, requiredPlayers, locale, remainingSeconds, interaction.client);
        try {
            await interaction.editReply({
                embeds: [updatedEmbed],
                components: [createHeistButtons(locale)],
            });
        }
        catch (error) {
            clearInterval(progressInterval);
        }
    }, 5000);
    heistTimers.set(heistId, progressInterval);
    collector.on("collect", async (i) => {
        const currentParticipants = activeHeists.get(heistId) || new Set();
        if (i.customId === "cancel_heist") {
            if (i.user.id !== userId) {
                await i.reply({
                    content: `${(0, customEmojis_1.getEmoji)("cancel")} ${(0, i18n_1.tLocale)(locale, "roubo_only_organizer_cancel")}`,
                    flags: discord_js_1.MessageFlags.Ephemeral,
                });
                return;
            }
            const interval = heistTimers.get(heistId);
            if (interval) {
                clearInterval(interval);
                heistTimers.delete(heistId);
            }
            await i.update({
                content: `${(0, customEmojis_1.getEmoji)("cancel")} ${(0, i18n_1.tLocale)(locale, "roubo_cancelled")}`,
                embeds: [],
                components: [],
            });
            activeHeists.delete(heistId);
            collector.stop();
            return;
        }
        if (i.customId === "join_heist") {
            if (currentParticipants.has(i.user.id)) {
                await i.reply({
                    content: (0, i18n_1.tLocale)(locale, "roubo_already_in"),
                    flags: discord_js_1.MessageFlags.Ephemeral,
                });
                return;
            }
            if (currentParticipants.size >= requiredPlayers) {
                await i.reply({
                    content: (0, i18n_1.tLocale)(locale, "roubo_heist_full"),
                    flags: discord_js_1.MessageFlags.Ephemeral,
                });
                return;
            }
            const joinerSilver = (0, dataManager_1.getUserSilver)(i.user.id);
            if (joinerSilver < ENTRY_FEE) {
                await i.reply({
                    content: `${(0, customEmojis_1.getEmoji)("cancel")} ${(0, i18n_1.tLocale)(locale, "roubo_need_silver", { amount: ENTRY_FEE.toLocaleString() })}`,
                    flags: discord_js_1.MessageFlags.Ephemeral,
                });
                return;
            }
            const joinerPunishment = (0, punishmentManager_1.isPunished)(i.user.id);
            if (joinerPunishment) {
                await i.reply({
                    content: `${(0, customEmojis_1.getEmoji)("lock")} ${(0, i18n_1.tLocale)(locale, "roubo_in_jail")}`,
                    flags: discord_js_1.MessageFlags.Ephemeral,
                });
                return;
            }
            currentParticipants.add(i.user.id);
            activeHeists.set(heistId, currentParticipants);
            const elapsed = Date.now() - startTime;
            const remainingMs = HEIST_DURATION - elapsed;
            const remainingSeconds = Math.max(0, remainingMs / 1000);
            const updateEmbed = buildHeistEmbed(interaction.user.tag, currentParticipants, requiredPlayers, locale, remainingSeconds, i.client);
            if (currentParticipants.size < requiredPlayers) {
                await i.update({
                    embeds: [updateEmbed],
                    components: [createHeistButtons(locale)],
                });
            }
            else {
                heistStarted = true;
                const interval = heistTimers.get(heistId);
                if (interval) {
                    clearInterval(interval);
                    heistTimers.delete(heistId);
                }
                await i.update({
                    content: `**${(0, i18n_1.tLocale)(locale, "roubo_group_complete")}**`,
                    embeds: [updateEmbed],
                    components: [],
                });
                collector.stop("started");
                setTimeout(async () => {
                    await showRobberyProgress(interaction, Array.from(currentParticipants), locale);
                    await executeHeist(interaction, Array.from(currentParticipants), locale, heistId, requiredPlayers);
                }, 3000);
            }
        }
    });
    collector.on("end", async (_, reason) => {
        const interval = heistTimers.get(heistId);
        if (interval) {
            clearInterval(interval);
            heistTimers.delete(heistId);
        }
        if (reason === "time" && !heistStarted) {
            activeHeists.delete(heistId);
            await interaction
                .editReply({
                content: `${(0, customEmojis_1.getEmoji)("timer")} ${(0, i18n_1.tLocale)(locale, "roubo_time_expired")}`,
                embeds: [],
                components: [],
            })
                .catch(() => { });
        }
    });
}
async function showRobberyProgress(interaction, participants, locale) {
    const progressTitle = (0, i18n_1.tLocale)(locale, "roubo_starting");
    const progressDesc = (0, i18n_1.tLocale)(locale, "roubo_progress_desc");
    const beQuiet = (0, i18n_1.tLocale)(locale, "roubo_be_quiet");
    const rancherPatrol = (0, i18n_1.tLocale)(locale, "roubo_rancher_patrol");
    const participantsLabel = (0, i18n_1.tLocale)(locale, "roubo_participants_label");
    const progressLabel = (0, i18n_1.tLocale)(locale, "roubo_progress_label");
    const timeRemainingLabel = (0, i18n_1.tLocale)(locale, "roubo_time_remaining");
    const inProgressFooter = (0, i18n_1.tLocale)(locale, "roubo_in_progress");
    const steps = 10;
    const stepDuration = ROBBERY_DURATION / steps;
    for (let i = 0; i <= steps; i++) {
        const percentage = Math.floor((i / steps) * 100);
        const progressBar = (0, progressBar_1.createProgressBarString)(percentage, 20, "█", "░");
        const timeRemaining = Math.ceil(((steps - i) / steps) * (ROBBERY_DURATION / 1000));
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        const timeDisplay = `${minutes}:${seconds.toString().padStart(2, "0")}`;
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(0xff8c00)
            .setTitle(`${(0, customEmojis_1.getEmoji)("running_cowboy")} ${progressTitle}`)
            .setDescription(`${(0, customEmojis_1.getEmoji)("cowboy_horse")} ${progressDesc}\n\n**${participantsLabel}:** ${participants.length}\n\n**${progressLabel}:**\n\`${progressBar}\` ${percentage}%\n\n**${timeRemainingLabel}:** ${timeDisplay}\n\n${beQuiet}\n${rancherPatrol}`)
            .setFooter({
            text: inProgressFooter,
        })
            .setTimestamp();
        try {
            await interaction.editReply({ embeds: [embed], components: [] });
        }
        catch (error) {
            console.error("Error updating progress bar:", error);
        }
        if (i < steps) {
            await new Promise((resolve) => setTimeout(resolve, stepDuration));
        }
    }
}
async function executeHeist(interaction, participants, locale, heistId, requiredPlayers) {
    for (const participantId of participants) {
        const silver = (0, dataManager_1.getUserSilver)(participantId);
        if (silver < ENTRY_FEE) {
            await interaction.followUp({
                content: `${(0, customEmojis_1.getEmoji)("cancel")} ${(0, i18n_1.tLocale)(locale, "roubo_insufficient_silver")}`,
            });
            activeHeists.delete(heistId);
            return;
        }
        await (0, dataManager_1.removeUserSilver)(participantId, ENTRY_FEE);
        cooldowns.set(participantId, Date.now());
    }
    const cattleOptions = [8, 12, 20];
    const totalCattle = cattleOptions[Math.floor(Math.random() * cattleOptions.length)];
    const successRate = 65; // 65% de chance de sucesso (ajustado para melhor balanceamento)
    const random = Math.random() * 100;
    const success = random < successRate;
    if (success) {
        const cattlePerPlayer = Math.floor(totalCattle / participants.length);
        const remainder = totalCattle % participants.length;
        for (let i = 0; i < participants.length; i++) {
            const participantId = participants[i];
            const cattleAmount = i === 0 ? cattlePerPlayer + remainder : cattlePerPlayer;
            await (0, inventoryManager_1.addItem)(participantId, "cattle", cattleAmount);
        }
        const cattleWord = (0, i18n_1.tLocale)(locale, "roubo_cattle_word");
        const participantsList = await Promise.all(participants.map(async (id, index) => {
            const user = await interaction.client.users.fetch(id);
            const cattle = index === 0 ? cattlePerPlayer + remainder : cattlePerPlayer;
            return `${index + 1}. ${user.tag} - **${cattle} ${cattleWord}**`;
        }));
        const successTitle = (0, i18n_1.tLocale)(locale, "roubo_success_title");
        const successDesc = (0, i18n_1.tLocale)(locale, "roubo_success_desc", {
            cattle: totalCattle,
        });
        const distributionLabel = (0, i18n_1.tLocale)(locale, "roubo_distribution");
        const addedInventory = (0, i18n_1.tLocale)(locale, "roubo_added_inventory");
        const totalCattleLabel = (0, i18n_1.tLocale)(locale, "roubo_total_cattle");
        const participantsLabel = (0, i18n_1.tLocale)(locale, "roubo_participants_count");
        const teamworkFooter = (0, i18n_1.tLocale)(locale, "roubo_teamwork");
        const successEmbed = new discord_js_1.EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle(`${(0, customEmojis_1.getEmoji)("check")} ${successTitle}`)
            .setDescription(`${(0, customEmojis_1.getEmoji)("cowboy_horse")} **${successDesc}**\n\n**${distributionLabel}:**\n${participantsList.join("\n")}\n\n${addedInventory}`)
            .addFields({
            name: totalCattleLabel,
            value: totalCattle.toString(),
            inline: true,
        }, {
            name: participantsLabel,
            value: participants.length.toString(),
            inline: true,
        })
            .setFooter({
            text: teamworkFooter,
        })
            .setTimestamp();
        await interaction.followUp({
            embeds: [successEmbed],
        });
        activeHeists.delete(heistId);
    }
    else {
        const bountyAmount = 8000;
        const crimeReason = (0, i18n_1.tLocale)(locale, "roubo_title");
        const sheriffId = interaction.client.user.id;
        const sheriffTag = "🚨 Sheriff";
        const wantedPosters = [];
        const participantsList = await Promise.all(participants.map(async (id, index) => {
            const user = await interaction.client.users.fetch(id);
            (0, dataManager_1.addBounty)(id, user.tag, sheriffId, sheriffTag, bountyAmount);
            const poster = await (0, wantedPoster_1.generateWantedPoster)(user, bountyAmount, locale);
            wantedPosters.push(new discord_js_1.AttachmentBuilder(poster, { name: `wanted-${id}.png` }));
            return `${index + 1}. ${user.tag}`;
        }));
        const failTitle = (0, i18n_1.tLocale)(locale, "roubo_fail_title");
        const failDesc = (0, i18n_1.tLocale)(locale, "roubo_fail_desc");
        const allWanted = (0, i18n_1.tLocale)(locale, "roubo_all_wanted");
        const bountyPerHead = (0, i18n_1.tLocale)(locale, "roubo_bounty_per_head");
        const reason = (0, i18n_1.tLocale)(locale, "roubo_reason");
        const wantedList = (0, i18n_1.tLocale)(locale, "roubo_wanted_list");
        const watchBountyHunters = (0, i18n_1.tLocale)(locale, "roubo_watch_bounty_hunters");
        const crimeFooter = (0, i18n_1.tLocale)(locale, "roubo_crime_sometimes");
        const failEmbed = new discord_js_1.EmbedBuilder()
            .setColor(0xff0000)
            .setTitle(`${(0, customEmojis_1.getEmoji)("warning")} ${failTitle}`)
            .setDescription(`${(0, customEmojis_1.getEmoji)("revolver")} **${failDesc}**\n\n**${allWanted}**\n${bountyPerHead}: ${(0, customEmojis_1.getEmoji)("silver_coin")} **${bountyAmount.toLocaleString()} Silver**\n${reason}: **${crimeReason}**\n\n**${wantedList}:**\n${participantsList.join("\n")}\n\n${watchBountyHunters}`)
            .setFooter({
            text: crimeFooter,
        })
            .setTimestamp();
        await interaction.followUp({
            embeds: [failEmbed],
            files: wantedPosters,
        });
        activeHeists.delete(heistId);
    }
}
//# sourceMappingURL=roubo.js.map