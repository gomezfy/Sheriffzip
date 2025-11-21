import { ButtonInteraction, AttachmentBuilder, EmbedBuilder } from "discord.js";
import {
  getCurrentEvent,
  getEventLeaderboard,
  getCurrentHuntingEvent,
  getHuntingEventLeaderboard,
  formatTimeRemaining,
} from "../../../utils/eventManager";
import { createPrizesCanvas, createClassificationCanvas } from "../../../utils/eventCanvas";

/**
 * Handler for mining classification button
 */
export async function handleMiningClassification(interaction: ButtonInteraction): Promise<void> {
  await interaction.deferUpdate();

  try {
    const miningEvent = getCurrentEvent();
    const leaderboard = getEventLeaderboard();

    if (!miningEvent) {
      const embed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle("❌ Evento não encontrado")
        .setDescription("Não há evento de mineração ativo no momento.");

      await interaction.editReply({ embeds: [embed], files: [], components: [] });
      return;
    }

    const timeLeft = miningEvent.endTime - Date.now();
    const imageBuffer = await createClassificationCanvas(
      "mining",
      leaderboard.map((p, i) => ({
        position: i + 1,
        username: p.username,
        points: p.points,
        goldMined: p.goldMined,
      })),
      miningEvent.name,
      formatTimeRemaining(timeLeft),
      miningEvent.active
    );

    const attachment = new AttachmentBuilder(imageBuffer, {
      name: 'classificacao-mineracao.png'
    });

    const embed = new EmbedBuilder()
      .setColor(0xFF6B00)
      .setTitle("⛏️ Classificação - Mineração")
      .setDescription(`**${miningEvent.name}**\n${miningEvent.active ? `⏱️ ${formatTimeRemaining(timeLeft)} restante` : '⏸️ Evento encerrado'}`)
      .setImage('attachment://classificacao-mineracao.png')
      .setTimestamp();

    await interaction.editReply({
      embeds: [embed],
      files: [attachment],
      components: interaction.message.components
    });
  } catch (error) {
    console.error("Error in handleMiningClassification:", error);
    const errorEmbed = new EmbedBuilder()
      .setColor(0xFF0000)
      .setTitle("❌ Erro")
      .setDescription("Ocorreu um erro ao gerar a classificação.");

    await interaction.editReply({ embeds: [errorEmbed], files: [], components: [] });
  }
}

/**
 * Handler for mining prizes button
 */
export async function handleMiningPrizes(interaction: ButtonInteraction): Promise<void> {
  await interaction.deferUpdate();

  try {
    const imageBuffer = await createPrizesCanvas("mining");
    const attachment = new AttachmentBuilder(imageBuffer, {
      name: 'premios-mineracao.png'
    });

    const embed = new EmbedBuilder()
      .setColor(0xFFD700)
      .setTitle("🏆 Prêmios - Evento de Mineração")
      .setDescription("**Corrida do Ouro - Top 10 Prêmios**\n\n⛏️ Mine ouro e ganhe pontos: **1 ouro = 40 pontos**\n💰 Os 10 melhores mineradores ganham recompensas incríveis!")
      .setImage('attachment://premios-mineracao.png')
      .setTimestamp();

    await interaction.editReply({
      embeds: [embed],
      files: [attachment],
      components: interaction.message.components
    });
  } catch (error) {
    console.error("Error in handleMiningPrizes:", error);
    const errorEmbed = new EmbedBuilder()
      .setColor(0xFF0000)
      .setTitle("❌ Erro")
      .setDescription("Ocorreu um erro ao gerar os prêmios.");

    await interaction.editReply({ embeds: [errorEmbed], files: [], components: [] });
  }
}

/**
 * Handler for hunting classification button
 */
export async function handleHuntingClassification(interaction: ButtonInteraction): Promise<void> {
  await interaction.deferUpdate();

  try {
    const huntingEvent = getCurrentHuntingEvent();
    const leaderboard = getHuntingEventLeaderboard();

    if (!huntingEvent) {
      const embed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle("❌ Evento não encontrado")
        .setDescription("Não há evento de caça ativo no momento.");

      await interaction.editReply({ embeds: [embed], files: [], components: [] });
      return;
    }

    const timeLeft = huntingEvent.endTime - Date.now();
    const imageBuffer = await createClassificationCanvas(
      "hunting",
      leaderboard.map((p, i) => ({
        position: i + 1,
        username: p.username,
        points: p.points,
        animalsKilled: p.animalsKilled,
      })),
      huntingEvent.name,
      formatTimeRemaining(timeLeft),
      huntingEvent.active
    );

    const attachment = new AttachmentBuilder(imageBuffer, {
      name: 'classificacao-caca.png'
    });

    const embed = new EmbedBuilder()
      .setColor(0x2D5A3D)
      .setTitle("🎯 Classificação - Caça")
      .setDescription(`**${huntingEvent.name}**\n${huntingEvent.active ? `⏱️ ${formatTimeRemaining(timeLeft)} restante` : '⏸️ Evento encerrado'}`)
      .setImage('attachment://classificacao-caca.png')
      .setTimestamp();

    await interaction.editReply({
      embeds: [embed],
      files: [attachment],
      components: interaction.message.components
    });
  } catch (error) {
    console.error("Error in handleHuntingClassification:", error);
    const errorEmbed = new EmbedBuilder()
      .setColor(0xFF0000)
      .setTitle("❌ Erro")
      .setDescription("Ocorreu um erro ao gerar a classificação.");

    await interaction.editReply({ embeds: [errorEmbed], files: [], components: [] });
  }
}

/**
 * Handler for hunting prizes button
 */
export async function handleHuntingPrizes(interaction: ButtonInteraction): Promise<void> {
  await interaction.deferUpdate();

  try {
    const imageBuffer = await createPrizesCanvas("hunting");
    const attachment = new AttachmentBuilder(imageBuffer, {
      name: 'premios-caca.png'
    });

    const embed = new EmbedBuilder()
      .setColor(0xFFD700)
      .setTitle("🏆 Prêmios - Evento de Caça")
      .setDescription("**Caçada do Oeste - Top 10 Prêmios**\n\n🎯 Cace animais e ganhe pontos:\n• **1 pele = 50 pontos**\n• **1 carne = 20 pontos**\n\n💰 Os 10 melhores caçadores ganham recompensas incríveis!")
      .setImage('attachment://premios-caca.png')
      .setTimestamp();

    await interaction.editReply({
      embeds: [embed],
      files: [attachment],
      components: interaction.message.components
    });
  } catch (error) {
    console.error("Error in handleHuntingPrizes:", error);
    const errorEmbed = new EmbedBuilder()
      .setColor(0xFF0000)
      .setTitle("❌ Erro")
      .setDescription("Ocorreu um erro ao gerar os prêmios.");

    await interaction.editReply({ embeds: [errorEmbed], files: [], components: [] });
  }
}
