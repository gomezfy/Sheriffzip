import {
  ButtonInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuInteraction,
} from "discord.js";
import { fishingSessionManager } from "../../../utils/fishingSessionManager";
import { addItem, reduceDurability, getItem, removeItem } from "../../../utils/inventoryManager";
import { addXp } from "../../../utils/xpManager";
import { getEmoji } from "../../../utils/customEmojis";
import { errorEmbed, successEmbed } from "../../../utils/embeds";
import { transactionLock } from "../../../utils/transactionLock";
import { FISHES, selectFish } from "../../../commands/fishing/fish";

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

// Determina o artigo correto para o nome do peixe
function getArticle(fishName: string): string {
  const feminineFishes = ["Truta Prateada", "Águia Dourada"];
  
  if (feminineFishes.includes(fishName)) {
    return "A";
  }
  return "O";
}

// Substitui "peixe" pela forma correta com artigo
function replaceFishName(message: string, fishName: string): string {
  const article = getArticle(fishName);
  return message
    .replace(/O peixe/gi, `${article} ${fishName}`)
    .replace(/peixe/gi, fishName);
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
    const article = getArticle(session.fishName);
    const captureMessage = replaceFishName(getRandomMessage(CAPTURE_MESSAGES), session.fishName);
    
    await transactionLock.withLock(userId, async () => {
      addItem(userId, fishItem.id, fishItem.amount);
      reduceDurability(userId, "fishing_rod", 1);
      addXp(userId, session.fishExperience);
    });

    const successEmb = new EmbedBuilder()
      .setColor("#00ff00")
      .setTitle(`${getEmoji("trophy")} ${article} ${session.fishName} Capturado!`)
      .setDescription(
        `${captureMessage}!\n\n` +
        `${getEmoji("check")} Você pescou ${article.toLowerCase()} **${session.fishName}**! ${session.fishEmoji}\n\n` +
        `**${getEmoji("gift")} Recompensas:**\n` +
        `${session.fishEmoji} ${session.fishName} x${fishItem.amount}\n` +
        `${getEmoji("star")} +${session.fishExperience} XP\n\n` +
        `**${getEmoji("stats")} Estatísticas:**\n` +
        `${getEmoji("check")} Acertos na zona: ${session.successfulCatches}/${session.requiredCatches}\n` +
        `${getEmoji("timer")} Tentativas usadas: ${session.maxAttempts - session.attemptsRemaining}/${session.maxAttempts}\n\n` +
        `${getEmoji("moneybag")} Use \`/hunterstore\` para vender seus peixes!`
      )
      .setFooter({ text: "Ótima pescaria!" })
      .setTimestamp();

    fishingSessionManager.endSession(userId);
    await interaction.editReply({ embeds: [successEmb], components: [] });
    return;
  }

  // Verificar se perdeu
  if (fishingSessionManager.hasLost(userId)) {
    // DERROTA - Ficou sem tentativas
    const article = getArticle(session.fishName);
    const escapeMessage = replaceFishName(getRandomMessage(ESCAPE_MESSAGES), session.fishName);
    const lostEmbed = new EmbedBuilder()
      .setColor("#ef4444")
      .setTitle(`${getEmoji("cancel")} ${article} ${session.fishName} Escapou!`)
      .setDescription(
        `${escapeMessage}!\n\n` +
        `${getEmoji("warning")} Infelizmente, você não conseguiu acertar a zona verde o suficiente.\n\n` +
        `**${getEmoji("stats")} Estatísticas Finais:**\n` +
        `${getEmoji("check")} Acertos: ${session.successfulCatches}/${session.requiredCatches}\n` +
        `${getEmoji("cross")} Faltaram: ${session.requiredCatches - session.successfulCatches} acertos\n\n` +
        `${getEmoji("info")} Tente novamente com \`/fish\`!`,
      )
      .setFooter({ text: `${getEmoji("dart")} Dica: Fique atento ao movimento da barra e time seus cliques!` })
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
      const successMsg = replaceFishName(getRandomMessage(SUCCESS_MESSAGES), session.fishName);
      feedbackText = `\n${successMsg}\n**Acertos:** ${session.successfulCatches}/${session.requiredCatches}`;
    } else {
      const failMsg = replaceFishName(getRandomMessage(FAILURE_MESSAGES), session.fishName);
      feedbackText = `\n${failMsg}`;
    }
  }

  const fishEmbed = new EmbedBuilder()
    .setColor(session.fishRarityColor as `#${string}`)
    .setTitle(`${getEmoji("dart")} Pescando: ${session.fishName}`)
    .setDescription(
      `${session.fishEmoji} **${session.fishName}** (${session.fishRarity})\n` +
      `${getEmoji("lightning")} Dificuldade: ${"🔥".repeat(session.fishDifficulty)}\n\n` +
      `**Barra de Posição:**\n\`\`\`${bar}\`\`\`${feedbackText}\n\n` +
      `**${getEmoji("info")} Dica:** Mantenha o 🎣 na zona verde 🟢 e pressione ${getEmoji("check")} PEGAR!`,
    )
    .addFields(
      {
        name: `${getEmoji("timer")} Status`,
        value: `${getEmoji("clock")} Tentativas: ${session.attemptsRemaining}/${session.maxAttempts}\n${getEmoji("check")} Acertos: ${session.successfulCatches}/${session.requiredCatches}`,
        inline: true
      },
      {
        name: `${getEmoji("gift")} Progresso`,
        value: `${getEmoji("dart")} Faltam: ${session.requiredCatches - session.successfulCatches} acertos\n${getEmoji("stats")} ${Math.floor((session.successfulCatches / session.requiredCatches) * 100)}% completo`,
        inline: true
      }
    )
    .setFooter({ 
      text: `${getEmoji("fishing_rod")} Use < e > para mover, depois pressione Fisgar quando estiver na zona verde!` 
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

/**
 * Handler para seleção de Isca Básica
 */
export async function handleFishBaitBasic(interaction: ButtonInteraction): Promise<void> {
  await startFishingWithBait(interaction, false);
}

/**
 * Handler para seleção de Isca Premium
 */
export async function handleFishBaitPremium(interaction: ButtonInteraction): Promise<void> {
  await startFishingWithBait(interaction, true);
}

/**
 * Inicia a pesca com a isca selecionada
 */
async function startFishingWithBait(interaction: ButtonInteraction, usePremiumBait: boolean): Promise<void> {
  const userId = interaction.user.id;
  
  await interaction.deferUpdate();

  // Verify user still has the selected bait
  const basicBaitCount = getItem(userId, "basic_bait");
  const premiumBaitCount = getItem(userId, "premium_bait");

  if (usePremiumBait && premiumBaitCount === 0) {
    const embed = errorEmbed(
      `${getEmoji("cancel")} Isca Premium Indisponível`,
      "Você não tem mais Isca Premium disponível!"
    );
    await interaction.editReply({ embeds: [embed], components: [] });
    return;
  }

  if (!usePremiumBait && basicBaitCount === 0) {
    const embed = errorEmbed(
      `${getEmoji("cancel")} Isca Básica Indisponível`,
      "Você não tem mais Isca Básica disponível!"
    );
    await interaction.editReply({ embeds: [embed], components: [] });
    return;
  }

  // Check if user already has an active fishing session
  const existingSession = fishingSessionManager.getSession(userId);
  if (existingSession) {
    const embed = errorEmbed(
      `${getEmoji("fishing_rod")} Pesca em Andamento`,
      `Você já está pescando um **${existingSession.fishName}**!`
    );
    await interaction.editReply({ embeds: [embed], components: [] });
    return;
  }

  // Select a random fish
  const fish = selectFish(usePremiumBait);
  if (!fish) {
    const embed = errorEmbed(
      "❌ Erro na Pesca",
      "Ocorreu um erro ao procurar peixes. Tente novamente!"
    );
    await interaction.editReply({ embeds: [embed], components: [] });
    return;
  }

  // Consume 1 bait
  if (usePremiumBait) {
    await removeItem(userId, "premium_bait", 1);
  } else {
    await removeItem(userId, "basic_bait", 1);
  }

  // Create fishing session
  const session = fishingSessionManager.createSession(
    userId,
    interaction.user.username,
    fish
  );

  // Generate initial bar
  const bar = fishingSessionManager.generateBar(userId);

  const baitUsed = usePremiumBait ? `${getEmoji("premium_bait")} Isca Premium` : `${getEmoji("basic_bait")} Isca Básica`;
  const baitBonus = usePremiumBait ? `\n${getEmoji("sparkles")} **Bônus de Isca Premium ativo!** Mais chances de peixes raros!` : "";

  const fishEmbed = new EmbedBuilder()
    .setColor(fish.rarityColor as `#${string}`)
    .setTitle(`${getEmoji("dart")} Pesca Iniciada!`)
    .setDescription(
      `Você lançou sua linha com ${baitUsed} e fisgou algo!${baitBonus}\n\n` +
      `**Peixe Fisgado**\n` +
      `${fish.emoji} **${fish.name}**\n\n` +
      `${getEmoji("star")} **Raridade:** ${fish.rarity}\n` +
      `${getEmoji("lightning")} **Dificuldade:** ${"🔥".repeat(fish.difficulty)}\n` +
      `${getEmoji("check")} **Acertos Necessários:** ${fish.requiredCatches}\n\n` +
      `**${getEmoji("info")} COMO JOGAR:**\n` +
      `Use os botões < e > para manter o 🎣 na zona verde 🟢!\n` +
      `Acerte a zona ${fish.requiredCatches} vezes para pegar o peixe!\n\n` +
      `**Barra de Posição:**\n\`\`\`${bar}\`\`\``
    )
    .addFields(
      {
        name: `${getEmoji("timer")} Status`,
        value: `${getEmoji("clock")} Tentativas: ${session.attemptsRemaining}/${session.maxAttempts}\n${getEmoji("check")} Acertos: ${session.successfulCatches}/${session.requiredCatches}`,
        inline: true
      },
      {
        name: `${getEmoji("gift")} Recompensas`,
        value: `${fish.emoji} ${fish.name}\n${getEmoji("star")} +${fish.experience} XP`,
        inline: true
      }
    )
    .setFooter({
      text: `${getEmoji("fishing_rod")} Mantenha o 🎣 na zona verde 🟢 e pressione os botões no momento certo!`
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
    rightButton
  );

  await interaction.editReply({
    embeds: [fishEmbed],
    components: [row]
  });
}
