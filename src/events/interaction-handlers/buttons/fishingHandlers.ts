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

// Mensagens imersivas de sucesso
const SUCCESS_MESSAGES = [
  "O peixe puxou! Mantendo a linha firme...",
  "Boa! O peixe entrou na zona! Aguente firme!",
  "Acerto! O peixe está resistindo!",
  "Perfeito! O peixe se mexeu na zona!",
  "Excelente timing! O peixe avançou!",
  "Fisga perfeita! O peixe sacode a cauda!",
];

// Mensagens imersivas de erro
const FAILURE_MESSAGES = [
  "O peixe escapou pela zona! Tente mover mais rápido!",
  "O peixe se livrou! Melhor sorte na próxima!",
  "Errou de novo! O peixe está ficando desconfiado...",
  "O peixe fugiu da zona! Continue tentando!",
  "O peixe correu! Tente novamente!",
];

// Mensagens quando o peixe escapa
const ESCAPE_MESSAGES = [
  "O peixe foi mais rápido! Conseguiu escapar da vara!",
  "SPLASH! O peixe fez um grande salto e desapareceu!",
  "Ops! O peixe cortou a linha e fugiu para o fundo!",
  "O peixe teve força demais e conseguiu se soltar!",
  "O peixe mergulhou fundo e desapareceu! Que peixe esperto!",
];

// Mensagens quando captura o peixe
const CAPTURE_MESSAGES = [
  "PUXÃO FINAL! Você conseguiu pegar o peixe!",
  "VENCEU! O peixe está na sua mão!",
  "INCRÍVEL! Você dominou o peixe!",
  "ÉPICO! A vara resistiu e você capturou!",
  "SUCESSO! O peixe está capturado!",
];

function getRandomMessage(messages: string[]): string {
  return messages[Math.floor(Math.random() * messages.length)];
}

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
    const captureMessage = getRandomMessage(CAPTURE_MESSAGES).replace("peixe", session.fishName);
    
    await transactionLock.withLock(userId, async () => {
      addItem(userId, fishItem.id, fishItem.amount);
      reduceDurability(userId, "fishing_rod", 1);
      addXp(userId, session.fishExperience);
    });

    const successEmb = successEmbed(
      `${getEmoji("trophy")} ${session.fishName} Capturado!`,
      `${captureMessage}!\n\n` +
        `Você pescou um **${session.fishName}**! ${session.fishEmoji}\n\n` +
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
    const escapeMessage = getRandomMessage(ESCAPE_MESSAGES).replace("peixe", session.fishName);
    const lostEmbed = new EmbedBuilder()
      .setColor("#ef4444")
      .setTitle(`💔 O ${session.fishName} Escapou!`)
      .setDescription(
        `${escapeMessage}!\n\n` +
        `Infelizmente, você não conseguiu acertar a zona verde o suficiente.\n\n` +
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
      const successMsg = getRandomMessage(SUCCESS_MESSAGES).replace("peixe", session.fishName);
      feedbackText = `\n${successMsg}\n**Acertos:** ${session.successfulCatches}/${session.requiredCatches}`;
    } else {
      const failMsg = getRandomMessage(FAILURE_MESSAGES).replace("peixe", session.fishName);
      feedbackText = `\n${failMsg}`;
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
      text: `🎣 Use < e > para mover, depois pressione Fisgar quando estiver na zona verde!` 
    })
    .setTimestamp();

  const leftButton = new ButtonBuilder()
    .setCustomId(`fish_left_${userId}`)
    .setLabel("<")
    .setStyle(ButtonStyle.Secondary);

  const rightButton = new ButtonBuilder()
    .setCustomId(`fish_right_${userId}`)
    .setLabel(">")
    .setStyle(ButtonStyle.Secondary);

  const catchButton = new ButtonBuilder()
    .setCustomId(`fish_catch_${userId}`)
    .setLabel("Fisgar")
    .setStyle(ButtonStyle.Success);

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
