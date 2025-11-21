import {
  ButtonInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { fishingSessionManager } from "../../../utils/fishingSessionManager";
import { addItem, reduceDurability } from "../../../utils/inventoryManager";
import { addXp } from "../../../utils/xpManager";
import { getEmoji } from "../../../utils/customEmojis";
import { errorEmbed, successEmbed } from "../../../utils/embeds";
import { transactionLock } from "../../../utils/transactionLock";

/**
 * Handler para mover a barra para a esquerda
 */
export async function handleFishLeft(interaction: ButtonInteraction): Promise<void> {
  const userId = interaction.customId.split("_")[2];

  // Verificar se é o usuário correto
  if (interaction.user.id !== userId) {
    await interaction.reply({
      content: "❌ Esta pesca não é sua!",
      ephemeral: true,
    });
    return;
  }

  await interaction.deferUpdate();

  const session = fishingSessionManager.moveLeft(userId);
  if (!session) {
    const embed = errorEmbed(
      "❌ Sessão Expirada",
      "Sua sessão de pesca expirou! Use `/fish` para começar novamente.",
    );
    await interaction.editReply({ embeds: [embed], components: [] });
    return;
  }

  // Atualizar o embed com a nova posição
  await updateFishingEmbed(interaction, userId);
}

/**
 * Handler para mover a barra para a direita
 */
export async function handleFishRight(interaction: ButtonInteraction): Promise<void> {
  const userId = interaction.customId.split("_")[2];

  // Verificar se é o usuário correto
  if (interaction.user.id !== userId) {
    await interaction.reply({
      content: "❌ Esta pesca não é sua!",
      ephemeral: true,
    });
    return;
  }

  await interaction.deferUpdate();

  const session = fishingSessionManager.moveRight(userId);
  if (!session) {
    const embed = errorEmbed(
      "❌ Sessão Expirada",
      "Sua sessão de pesca expirou! Use `/fish` para começar novamente.",
    );
    await interaction.editReply({ embeds: [embed], components: [] });
    return;
  }

  // Atualizar o embed com a nova posição
  await updateFishingEmbed(interaction, userId);
}

/**
 * Handler para tentar pegar o peixe
 */
export async function handleFishCatch(interaction: ButtonInteraction): Promise<void> {
  const userId = interaction.customId.split("_")[2];

  // Verificar se é o usuário correto
  if (interaction.user.id !== userId) {
    await interaction.reply({
      content: "❌ Esta pesca não é sua!",
      ephemeral: true,
    });
    return;
  }

  await interaction.deferUpdate();

  const result = fishingSessionManager.checkCatch(userId);
  if (!result.session) {
    const embed = errorEmbed(
      "❌ Sessão Expirada",
      "Sua sessão de pesca expirou! Use `/fish` para começar novamente.",
    );
    await interaction.editReply({ embeds: [embed], components: [] });
    return;
  }

  const session = result.session;

  // Verificar se venceu
  if (fishingSessionManager.hasWon(userId)) {
    // VITÓRIA - Pegou o peixe! (usar transaction lock)
    const fishItem = session.fishRewards.fish;
    
    await transactionLock.withLock(userId, async () => {
      addItem(userId, fishItem.id, fishItem.amount);
      reduceDurability(userId, "fishing_rod", 1);
      addXp(userId, session.fishExperience);
    });

    const successEmb = successEmbed(
      `${getEmoji("trophy")} Peixe Capturado!`,
      `🎉 Parabéns! Você pescou um **${session.fishName}**!\n\n` +
        `**Recompensas:**\n` +
        `${session.fishEmoji} ${session.fishName} x${fishItem.amount}\n` +
        `${getEmoji("star")} +${session.fishExperience} XP\n\n` +
        `**Estatísticas:**\n` +
        `✅ Acertos na zona: ${session.successfulCatches}/${session.requiredCatches}\n` +
        `🎯 Tentativas usadas: ${session.maxAttempts - session.attemptsRemaining}/${session.maxAttempts}\n\n` +
        `Use \`/hunterstore\` para vender seus peixes!`,
    );

    fishingSessionManager.endSession(userId);
    await interaction.editReply({ embeds: [successEmb], components: [] });
    return;
  }

  // Verificar se perdeu
  if (fishingSessionManager.hasLost(userId)) {
    // DERROTA - Ficou sem tentativas
    const lostEmbed = new EmbedBuilder()
      .setColor("#ef4444")
      .setTitle("💔 O Peixe Escapou!")
      .setDescription(
        `Que pena! O **${session.fishName}** conseguiu escapar...\n\n` +
        `Você ficou sem tentativas antes de acertar a zona verde vezes suficientes.\n\n` +
        `**Estatísticas Finais:**\n` +
        `✅ Acertos: ${session.successfulCatches}/${session.requiredCatches}\n` +
        `❌ Faltaram: ${session.requiredCatches - session.successfulCatches} acertos\n\n` +
        `Tente novamente com \`/fish\`!`,
      )
      .setFooter({ text: "Dica: Fique atento ao movimento da barra e time seus cliques!" })
      .setTimestamp();

    fishingSessionManager.endSession(userId);
    await interaction.editReply({ embeds: [lostEmbed], components: [] });
    return;
  }

  // Continua jogando - Atualizar com feedback
  await updateFishingEmbed(interaction, userId, result.success);
}

/**
 * Atualiza o embed de pesca com a posição atual
 */
async function updateFishingEmbed(
  interaction: ButtonInteraction,
  userId: string,
  lastCatchAttempt?: boolean,
): Promise<void> {
  const session = fishingSessionManager.getSession(userId);
  if (!session) return;

  const bar = fishingSessionManager.generateBar(userId);

  let feedbackText = "";
  if (lastCatchAttempt !== undefined) {
    if (lastCatchAttempt) {
      feedbackText = `\n✅ **ACERTOU A ZONA!** (${session.successfulCatches}/${session.requiredCatches})`;
    } else {
      feedbackText = `\n❌ **ERROU!** Fora da zona verde.`;
    }
  }

  const fishEmbed = new EmbedBuilder()
    .setColor(session.fishRarityColor as `#${string}`)
    .setTitle(`${getEmoji("dart")} Pescando: ${session.fishName}`)
    .setDescription(
      `${session.fishEmoji} **${session.fishName}** (${session.fishRarity})\n` +
      `⚡ Dificuldade: ${"🔥".repeat(session.fishDifficulty)}\n\n` +
      `**Barra de Posição:**\n\`\`\`${bar}\`\`\`${feedbackText}\n\n` +
      `**${getEmoji("info")} Dica:** Mantenha o 🎣 na zona verde 🟢 e pressione ✅ PEGAR!`,
    )
    .addFields(
      {
        name: `${getEmoji("timer")} Status`,
        value: `⏱️ Tentativas: ${session.attemptsRemaining}/${session.maxAttempts}\n✅ Acertos: ${session.successfulCatches}/${session.requiredCatches}`,
        inline: true
      },
      {
        name: `${getEmoji("gift")} Progresso`,
        value: `🎯 Faltam: ${session.requiredCatches - session.successfulCatches} acertos\n📊 ${Math.floor((session.successfulCatches / session.requiredCatches) * 100)}% completo`,
        inline: true
      }
    )
    .setFooter({ 
      text: `🎣 Use 🔙 e 🔜 para mover, depois pressione ✅ PEGAR quando estiver na zona verde!` 
    })
    .setTimestamp();

  const leftButton = new ButtonBuilder()
    .setCustomId(`fish_left_${userId}`)
    .setLabel("🔙 Esquerda")
    .setStyle(ButtonStyle.Primary)
    .setEmoji("◀️");

  const rightButton = new ButtonBuilder()
    .setCustomId(`fish_right_${userId}`)
    .setLabel("🔜 Direita")
    .setStyle(ButtonStyle.Primary)
    .setEmoji("▶️");

  const catchButton = new ButtonBuilder()
    .setCustomId(`fish_catch_${userId}`)
    .setLabel("✅ PEGAR!")
    .setStyle(ButtonStyle.Success)
    .setEmoji("🎣");

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    leftButton,
    catchButton,
    rightButton,
  );

  await interaction.editReply({
    embeds: [fishEmbed],
    components: [row],
  });
}
