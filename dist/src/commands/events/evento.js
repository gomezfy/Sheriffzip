"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRankingEmbed = createRankingEmbed;
exports.createPrizesEmbed = createPrizesEmbed;
const discord_js_1 = require("discord.js");
const eventManager_1 = require("../../utils/eventManager");
const i18n_1 = require("../../utils/i18n");
const commandLocalizations_1 = require("../../utils/commandLocalizations");
const customEmojis_1 = require("../../utils/customEmojis");
const eventoMenus_1 = require("../../events/interaction-handlers/selectMenus/eventoMenus");
function createRankingEmbed(userId, locale = "pt-BR") {
    const event = (0, eventManager_1.getCurrentEvent)();
    const leaderboard = (0, eventManager_1.getEventLeaderboard)().slice(0, 10);
    const trophyEmoji = (0, customEmojis_1.getTrophyEmoji)();
    const pickaxeEmoji = (0, customEmojis_1.getPickaxeEmoji)();
    const goldMedalEmoji = (0, customEmojis_1.getGoldMedalEmoji)();
    const silverMedalEmoji = (0, customEmojis_1.getSilverMedalEmoji)();
    const bronzeMedalEmoji = (0, customEmojis_1.getBronzeMedalEmoji)();
    const goldBarEmoji = (0, customEmojis_1.getGoldBarEmoji)();
    const timerEmoji = (0, customEmojis_1.getTimerEmoji)();
    const embed = new discord_js_1.EmbedBuilder()
        .setColor(event && event.active ? 0xFF6B00 : 0x5865F2)
        .setTitle(`${trophyEmoji} ${event && event.active ? event.name : (0, i18n_1.t)({ locale }, "event_mining_title")}`)
        .setTimestamp();
    // Event status
    if (event && event.active) {
        const timeLeft = event.endTime - Date.now();
        const phaseText = `Fase ${event.phase + 1} / 7`;
        embed.setDescription(`${timerEmoji} **${(0, eventManager_1.formatTimeRemaining)(timeLeft)}** ${locale === "pt-BR" ? "restante" : "remaining"}\n${phaseText}`);
    }
    else {
        const timeUntilNext = (0, eventManager_1.getTimeUntilNextEvent)();
        embed.setDescription(`${locale === "pt-BR" ? "Próximo evento em" : "Next event in"}: ${(0, eventManager_1.formatTimeRemaining)(timeUntilNext)}`);
    }
    // Leaderboard
    if (leaderboard.length === 0) {
        embed.addFields({
            name: `${pickaxeEmoji} ${(0, i18n_1.t)({ locale }, "event_top_miners")}`,
            value: (0, i18n_1.t)({ locale }, "event_no_participants"),
            inline: false,
        });
    }
    else {
        let rankingText = "";
        for (let i = 0; i < leaderboard.length && i < 10; i++) {
            const participant = leaderboard[i];
            const isUser = participant.userId === userId;
            let medal = "";
            if (i === 0)
                medal = goldMedalEmoji;
            else if (i === 1)
                medal = silverMedalEmoji;
            else if (i === 2)
                medal = bronzeMedalEmoji;
            else
                medal = `\`${i + 1}º\``;
            const highlight = isUser ? "**" : "";
            rankingText += `${medal} ${highlight}${participant.username}${highlight} - ${participant.points.toLocaleString()} ${goldBarEmoji}\n`;
        }
        embed.addFields({
            name: `${pickaxeEmoji} ${(0, i18n_1.t)({ locale }, "event_top_miners")}`,
            value: rankingText,
            inline: false,
        });
    }
    // User position
    if (event && event.active) {
        const userParticipant = Object.values(event.participants).find(p => p.userId === userId);
        if (userParticipant) {
            const userRank = leaderboard.findIndex(p => p.userId === userId) + 1;
            if (userRank > 0) {
                embed.setFooter({
                    text: `${(0, i18n_1.t)({ locale }, "event_your_position")} #${userRank} ${(0, i18n_1.t)({ locale }, "event_with")} ${userParticipant.points.toLocaleString()} ${(0, i18n_1.t)({ locale }, "event_points")}`
                });
            }
        }
        else {
            embed.setFooter({ text: (0, i18n_1.t)({ locale }, "event_use_mine_join") });
        }
    }
    return embed;
}
function createPrizesEmbed(locale = "pt-BR") {
    const trophyEmoji = (0, customEmojis_1.getTrophyEmoji)();
    const goldMedalEmoji = (0, customEmojis_1.getGoldMedalEmoji)();
    const silverMedalEmoji = (0, customEmojis_1.getSilverMedalEmoji)();
    const bronzeMedalEmoji = (0, customEmojis_1.getBronzeMedalEmoji)();
    const silverCoinEmoji = (0, customEmojis_1.getSilverCoinEmoji)();
    const saloonTokenEmoji = (0, customEmojis_1.getSaloonTokenEmoji)();
    const embed = new discord_js_1.EmbedBuilder()
        .setColor(0xFFD700)
        .setTitle(`${trophyEmoji} ${(0, i18n_1.t)({ locale }, "event_prizes_title")}`)
        .setDescription((0, i18n_1.t)({ locale }, "event_prizes_subtitle"))
        .setTimestamp();
    // Prizes table
    const prizes = [
        { position: 1, silver: 300000, tokens: 300, xp: 3500, medal: goldMedalEmoji },
        { position: 2, silver: 200000, tokens: 200, xp: 1750, medal: silverMedalEmoji },
        { position: 3, silver: 100000, tokens: 100, xp: 875, medal: bronzeMedalEmoji },
        { position: 4, silver: 50000, tokens: 50, xp: 400, medal: "4º" },
        { position: 5, silver: 40000, tokens: 40, xp: 350, medal: "5º" },
        { position: 6, silver: 30000, tokens: 30, xp: 300, medal: "6º" },
        { position: 7, silver: 20000, tokens: 20, xp: 250, medal: "7º" },
        { position: 8, silver: 15000, tokens: 15, xp: 200, medal: "8º" },
        { position: 9, silver: 10000, tokens: 10, xp: 150, medal: "9º" },
        { position: 10, silver: 5000, tokens: 5, xp: 100, medal: "10º" },
    ];
    let prizesText = "";
    prizes.forEach((prize) => {
        prizesText += `${prize.medal} ${silverCoinEmoji} **${prize.silver.toLocaleString()}** • ${saloonTokenEmoji} **${prize.tokens}x** • ⭐ **${prize.xp.toLocaleString()} XP**\n`;
    });
    embed.addFields({
        name: (0, i18n_1.t)({ locale }, "event_prizes_subtitle"),
        value: prizesText,
        inline: false,
    });
    embed.addFields({
        name: (0, i18n_1.t)({ locale }, "event_how_to_points"),
        value: (0, i18n_1.t)({ locale }, "event_points_info"),
        inline: false,
    });
    return embed;
}
exports.default = {
    data: (0, commandLocalizations_1.applyLocalizations)(new discord_js_1.SlashCommandBuilder()
        .setName("evento")
        .setDescription("🏆 Veja o ranking da Corrida do Ouro e eventos ativos")
        .setContexts([0, 1, 2])
        .setIntegrationTypes([0, 1]), "evento"),
    async execute(interaction) {
        await interaction.deferReply();
        try {
            const locale = interaction.locale || 'pt-BR';
            const miningEvent = (0, eventManager_1.getCurrentEvent)();
            const huntingEvent = (0, eventManager_1.getCurrentHuntingEvent)();
            const nextSunday = (0, eventManager_1.getNextSundayDate)();
            const timeUntilNext = (0, eventManager_1.getTimeUntilNextEvent)();
            const trophyEmoji = (0, customEmojis_1.getTrophyEmoji)();
            const pickaxeEmoji = (0, customEmojis_1.getPickaxeEmoji)();
            const timerEmoji = (0, customEmojis_1.getTimerEmoji)();
            const clockEmoji = (0, customEmojis_1.getClockEmoji)();
            const greenCircle = (0, customEmojis_1.getGreenCircle)();
            const redCircle = (0, customEmojis_1.getRedCircle)();
            const statsEmoji = (0, customEmojis_1.getStatsEmoji)();
            const dartEmoji = (0, customEmojis_1.getDartEmoji)();
            const infoEmoji = (0, customEmojis_1.getInfoEmoji)();
            const scrollEmoji = (0, customEmojis_1.getScrollEmoji)();
            // Calcular tempos restantes
            const miningTimeRemaining = miningEvent?.active
                ? (0, eventManager_1.formatTimeRemaining)(miningEvent.endTime - Date.now())
                : "";
            const huntingTimeRemaining = huntingEvent?.active
                ? (0, eventManager_1.formatTimeRemaining)(huntingEvent.endTime - Date.now())
                : "";
            const nextEventDate = nextSunday.toLocaleDateString(locale, {
                weekday: 'long',
                day: '2-digit',
                month: 'long'
            });
            const nextEventTimeUntil = (0, eventManager_1.formatTimeRemaining)(timeUntilNext);
            // Criar descrição com status dos eventos
            let description = `${trophyEmoji} **Eventos Ativos e Próximos**\n\n`;
            // Status Evento de Mineração
            if (miningEvent?.active) {
                description += `${greenCircle} **Corrida do Ouro** ${pickaxeEmoji}\n`;
                description += `${timerEmoji} Termina em: **${miningTimeRemaining}**\n`;
                description += `${statsEmoji} Fase ${miningEvent.phase + 1}/7\n\n`;
            }
            else {
                description += `${redCircle} **Corrida do Ouro** ${pickaxeEmoji}\n`;
                description += `${clockEmoji} Próximo evento: **${nextEventDate}**\n`;
                description += `${timerEmoji} Começa em: **${nextEventTimeUntil}**\n\n`;
            }
            // Status Evento de Caça
            if (huntingEvent?.active) {
                description += `${greenCircle} **${huntingEvent.name}** ${dartEmoji}\n`;
                description += `${timerEmoji} Termina em: **${huntingTimeRemaining}**\n`;
                description += `${statsEmoji} Fase ${huntingEvent.phase + 1}/7\n\n`;
            }
            else {
                description += `${redCircle} **Evento de Caça** ${dartEmoji}\n`;
                description += `${clockEmoji} Nenhum evento ativo\n`;
                description += `${infoEmoji} Eventos de caça são iniciados por administradores\n\n`;
            }
            description += `\n${scrollEmoji} Use o menu abaixo para ver **classificação** e **prêmios**`;
            const circusTentEmoji = (0, customEmojis_1.getCircusTentEmoji)();
            const embed = new discord_js_1.EmbedBuilder()
                .setColor(0xFFD700)
                .setTitle(`${circusTentEmoji} **EVENTOS**`)
                .setDescription(description)
                .setFooter({ text: "Sheriff Rex • Sistema de Eventos" })
                .setTimestamp();
            // Menu de seleção (dropdown)
            const row = (0, eventoMenus_1.createEventoSelectMenu)();
            await interaction.editReply({
                embeds: [embed],
                components: [row]
            });
        }
        catch (error) {
            console.error("Error in evento command:", error);
            const errorEmbed = new discord_js_1.EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle("❌ Erro")
                .setDescription("Ocorreu um erro ao processar os eventos.")
                .setTimestamp();
            await interaction.editReply({ embeds: [errorEmbed] });
        }
    },
};
//# sourceMappingURL=evento.js.map