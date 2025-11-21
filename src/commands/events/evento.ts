import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import {
  getCurrentEvent,
  getEventLeaderboard,
  getTimeUntilNextEvent,
  formatTimeRemaining,
  getNextSundayDate,
  getCurrentHuntingEvent,
  getHuntingEventLeaderboard,
} from "../../utils/eventManager";
import { t } from "../../utils/i18n";
import { applyLocalizations } from "../../utils/commandLocalizations";
import {
  getTrophyEmoji,
  getPickaxeEmoji,
  getGoldMedalEmoji,
  getSilverMedalEmoji,
  getBronzeMedalEmoji,
  getGoldBarEmoji,
  getTimerEmoji,
  getSilverCoinEmoji,
  getSaloonTokenEmoji,
  getClockEmoji,
  getGreenCircle,
  getRedCircle,
  getStarEmoji,
  getScrollEmoji,
  getInfoEmoji,
  getStatsEmoji,
  getDartEmoji,
  getCircusTentEmoji,
} from "../../utils/customEmojis";
import { createEventoSelectMenu } from "../../events/interaction-handlers/selectMenus/eventoMenus";

function createRankingEmbed(userId: string, locale: string = "pt-BR"): EmbedBuilder {
  const event = getCurrentEvent();
  const leaderboard = getEventLeaderboard().slice(0, 10);
  
  const trophyEmoji = getTrophyEmoji();
  const pickaxeEmoji = getPickaxeEmoji();
  const goldMedalEmoji = getGoldMedalEmoji();
  const silverMedalEmoji = getSilverMedalEmoji();
  const bronzeMedalEmoji = getBronzeMedalEmoji();
  const goldBarEmoji = getGoldBarEmoji();
  const timerEmoji = getTimerEmoji();
  
  const embed = new EmbedBuilder()
    .setColor(event && event.active ? 0xFF6B00 : 0x5865F2)
    .setTitle(`${trophyEmoji} ${event && event.active ? event.name : t({ locale } as any, "event_mining_title")}`)
    .setTimestamp();
  
  // Event status
  if (event && event.active) {
    const timeLeft = event.endTime - Date.now();
    const phaseText = `Fase ${event.phase + 1} / 7`;
    embed.setDescription(`${timerEmoji} **${formatTimeRemaining(timeLeft)}** ${locale === "pt-BR" ? "restante" : "remaining"}\n${phaseText}`);
  } else {
    const timeUntilNext = getTimeUntilNextEvent();
    embed.setDescription(`${locale === "pt-BR" ? "Próximo evento em" : "Next event in"}: ${formatTimeRemaining(timeUntilNext)}`);
  }
  
  // Leaderboard
  if (leaderboard.length === 0) {
    embed.addFields({
      name: `${pickaxeEmoji} ${t({ locale } as any, "event_top_miners")}`,
      value: t({ locale } as any, "event_no_participants"),
      inline: false,
    });
  } else {
    let rankingText = "";
    
    for (let i = 0; i < leaderboard.length && i < 10; i++) {
      const participant = leaderboard[i];
      const isUser = participant.userId === userId;
      
      let medal = "";
      if (i === 0) medal = goldMedalEmoji;
      else if (i === 1) medal = silverMedalEmoji;
      else if (i === 2) medal = bronzeMedalEmoji;
      else medal = `\`${i + 1}º\``;
      
      const highlight = isUser ? "**" : "";
      rankingText += `${medal} ${highlight}${participant.username}${highlight} - ${participant.points.toLocaleString()} ${goldBarEmoji}\n`;
    }
    
    embed.addFields({
      name: `${pickaxeEmoji} ${t({ locale } as any, "event_top_miners")}`,
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
          text: `${t({ locale } as any, "event_your_position")} #${userRank} ${t({ locale } as any, "event_with")} ${userParticipant.points.toLocaleString()} ${t({ locale } as any, "event_points")}`
        });
      }
    } else {
      embed.setFooter({ text: t({ locale } as any, "event_use_mine_join") });
    }
  }
  
  return embed;
}

function createPrizesEmbed(locale: string = "pt-BR"): EmbedBuilder {
  const trophyEmoji = getTrophyEmoji();
  const goldMedalEmoji = getGoldMedalEmoji();
  const silverMedalEmoji = getSilverMedalEmoji();
  const bronzeMedalEmoji = getBronzeMedalEmoji();
  const silverCoinEmoji = getSilverCoinEmoji();
  const saloonTokenEmoji = getSaloonTokenEmoji();
  
  const embed = new EmbedBuilder()
    .setColor(0xFFD700)
    .setTitle(`${trophyEmoji} ${t({ locale } as any, "event_prizes_title")}`)
    .setDescription(t({ locale } as any, "event_prizes_subtitle"))
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
    name: t({ locale } as any, "event_prizes_subtitle"),
    value: prizesText,
    inline: false,
  });
  
  embed.addFields({
    name: t({ locale } as any, "event_how_to_points"),
    value: t({ locale } as any, "event_points_info"),
    inline: false,
  });
  
  return embed;
}

export default {
  data: applyLocalizations(
    new SlashCommandBuilder()
      .setName("evento")
      .setDescription("🏆 Veja o ranking da Corrida do Ouro e eventos ativos")
      .setContexts([0, 1, 2])
      .setIntegrationTypes([0, 1]),
    "evento",
  ),
  
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();

    try {
      const locale = interaction.locale || 'pt-BR';
      const miningEvent = getCurrentEvent();
      const huntingEvent = getCurrentHuntingEvent();
      const nextSunday = getNextSundayDate();
      const timeUntilNext = getTimeUntilNextEvent();
      
      const trophyEmoji = getTrophyEmoji();
      const pickaxeEmoji = getPickaxeEmoji();
      const timerEmoji = getTimerEmoji();
      const clockEmoji = getClockEmoji();
      const greenCircle = getGreenCircle();
      const redCircle = getRedCircle();
      const statsEmoji = getStatsEmoji();
      const dartEmoji = getDartEmoji();
      const infoEmoji = getInfoEmoji();
      const scrollEmoji = getScrollEmoji();
      
      // Calcular tempos restantes
      const miningTimeRemaining = miningEvent?.active 
        ? formatTimeRemaining(miningEvent.endTime - Date.now())
        : "";
      const huntingTimeRemaining = huntingEvent?.active 
        ? formatTimeRemaining(huntingEvent.endTime - Date.now())
        : "";
      
      const nextEventDate = nextSunday.toLocaleDateString(locale, { 
        weekday: 'long', 
        day: '2-digit', 
        month: 'long' 
      });
      const nextEventTimeUntil = formatTimeRemaining(timeUntilNext);
      
      // Criar descrição com status dos eventos
      let description = `${trophyEmoji} **Eventos Ativos e Próximos**\n\n`;
      
      // Status Evento de Mineração
      if (miningEvent?.active) {
        description += `${greenCircle} **Corrida do Ouro** ${pickaxeEmoji}\n`;
        description += `${timerEmoji} Termina em: **${miningTimeRemaining}**\n`;
        description += `${statsEmoji} Fase ${miningEvent.phase + 1}/7\n\n`;
      } else {
        description += `${redCircle} **Corrida do Ouro** ${pickaxeEmoji}\n`;
        description += `${clockEmoji} Próximo evento: **${nextEventDate}**\n`;
        description += `${timerEmoji} Começa em: **${nextEventTimeUntil}**\n\n`;
      }
      
      // Status Evento de Caça
      if (huntingEvent?.active) {
        description += `${greenCircle} **${huntingEvent.name}** ${dartEmoji}\n`;
        description += `${timerEmoji} Termina em: **${huntingTimeRemaining}**\n`;
        description += `${statsEmoji} Fase ${huntingEvent.phase + 1}/7\n\n`;
      } else {
        description += `${redCircle} **Evento de Caça** ${dartEmoji}\n`;
        description += `${clockEmoji} Nenhum evento ativo\n`;
        description += `${infoEmoji} Eventos de caça são iniciados por administradores\n\n`;
      }
      
      description += `\n${scrollEmoji} Use o menu abaixo para ver **classificação** e **prêmios**`;
      
      const circusTentEmoji = getCircusTentEmoji();
      
      const embed = new EmbedBuilder()
        .setColor(0xFFD700)
        .setTitle(`${circusTentEmoji} **EVENTOS**`)
        .setDescription(description)
        .setFooter({ text: "Sheriff Rex • Sistema de Eventos" })
        .setTimestamp();
      
      // Menu de seleção (dropdown)
      const row = createEventoSelectMenu();
      
      await interaction.editReply({ 
        embeds: [embed], 
        components: [row]
      });
      
    } catch (error) {
      console.error("Error in evento command:", error);
      
      const errorEmbed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle("❌ Erro")
        .setDescription("Ocorreu um erro ao processar os eventos.")
        .setTimestamp();
      
      await interaction.editReply({ embeds: [errorEmbed] });
    }
  },
};

// Export para handlers de botões
export { createRankingEmbed, createPrizesEmbed };
