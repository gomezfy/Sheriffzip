/**
 * iOS-like UX System
 * Sistema de experiência de usuário suave e satisfatório inspirado no iOS
 * 
 * Features:
 * - Loading states elegantes com shimmer effect
 * - Transições suaves
 * - Feedback visual imediato
 * - Progress indicators bonitos
 * - Skeleton screens
 */

import { EmbedBuilder, ColorResolvable, CommandInteraction, ButtonInteraction, ModalSubmitInteraction } from "discord.js";
import { getEmoji } from "./customEmojis";

export interface LoadingOptions {
  title?: string;
  description?: string;
  color?: ColorResolvable;
  estimatedTime?: number; // em segundos
  showProgress?: boolean;
}

/**
 * Cria um embed de loading elegante estilo iOS
 */
export function createLoadingEmbed(options: LoadingOptions = {}): EmbedBuilder {
  const {
    title = "⏳ Processando...",
    description = "Por favor aguarde, isso levará apenas alguns momentos",
    color = 0x007AFF, // iOS blue
    estimatedTime,
    showProgress = true
  } = options;

  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(title);

  let desc = description;
  
  if (showProgress) {
    // Shimmer effect com blocos Unicode
    const shimmer = "░▒▓█▓▒░░▒▓█▓▒░";
    desc += `\n\n${shimmer}`;
  }

  if (estimatedTime) {
    desc += `\n\n⏱️ Tempo estimado: ~${estimatedTime}s`;
  }

  embed.setDescription(desc);
  embed.setFooter({ text: "Sheriff Rex • Aguarde um momento" });
  embed.setTimestamp();

  return embed;
}

/**
 * Cria skeleton screen para perfis (antes do card carregar)
 */
export function createProfileSkeletonEmbed(): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0xE5E5EA) // iOS light gray
    .setTitle("📊 Carregando Perfil...")
    .setDescription(
      "```" +
      "\n╔══════════════════════════╗" +
      "\n║  ████████  ░░░░░░░░░░  ║" +
      "\n║  ████████  ░░░░░░░░░░  ║" +
      "\n║            ░░░░░░░░░░  ║" +
      "\n║  ░░░░░░░░  ░░░░░░░░░░  ║" +
      "\n║  ░░░░░░░░  ░░░░░░░░░░  ║" +
      "\n║  ░░░░░░░░  ░░░░░░░░░░  ║" +
      "\n╚══════════════════════════╝" +
      "\n```\n" +
      "*Gerando card de perfil personalizado...*"
    )
    .setFooter({ text: "Sheriff Rex • Preparando visual" })
    .setTimestamp();
}

/**
 * Cria barra de progresso elegante
 */
export function createProgressBar(
  current: number,
  total: number,
  length: number = 20,
  style: "smooth" | "blocks" | "ios" = "ios"
): string {
  const percentage = Math.min(100, Math.max(0, (current / total) * 100));
  const filled = Math.floor((percentage / 100) * length);
  const empty = length - filled;

  switch (style) {
    case "smooth":
      // Estilo suave com gradiente
      return "█".repeat(filled) + "░".repeat(empty);
    
    case "blocks":
      // Blocos sólidos
      return "▓".repeat(filled) + "░".repeat(empty);
    
    case "ios":
      // Estilo iOS com círculos
      return "●".repeat(filled) + "○".repeat(empty);
    
    default:
      return "█".repeat(filled) + "░".repeat(empty);
  }
}

/**
 * Cria embed de sucesso com animação de checkmark
 */
export function createSuccessEmbed(
  title: string,
  description?: string,
  additionalFields?: { name: string; value: string; inline?: boolean }[]
): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(0x34C759) // iOS green
    .setTitle(`${getEmoji("check")} ${title}`)
    .setTimestamp()
    .setFooter({ text: "Sheriff Rex • Sucesso" });

  if (description) {
    embed.setDescription(description);
  }

  if (additionalFields && additionalFields.length > 0) {
    embed.addFields(additionalFields);
  }

  return embed;
}

/**
 * Cria embed de erro elegante
 */
export function createErrorEmbed(
  title: string,
  description?: string,
  solution?: string
): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(0xFF3B30) // iOS red
    .setTitle(`${getEmoji("cancel")} ${title}`)
    .setTimestamp()
    .setFooter({ text: "Sheriff Rex • Erro" });

  let desc = description || "";
  
  if (solution) {
    desc += `\n\n**💡 Solução:**\n${solution}`;
  }

  if (desc) {
    embed.setDescription(desc);
  }

  return embed;
}

/**
 * Cria embed de aviso/warning
 */
export function createWarningEmbed(
  title: string,
  description?: string
): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0xFFCC00) // iOS yellow/orange
    .setTitle(`${getEmoji("warning")} ${title}`)
    .setDescription(description || "")
    .setTimestamp()
    .setFooter({ text: "Sheriff Rex • Atenção" });
}

/**
 * Cria embed de informação
 */
export function createInfoEmbed(
  title: string,
  description?: string
): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0x007AFF) // iOS blue
    .setTitle(`${getEmoji("info")} ${title}`)
    .setDescription(description || "")
    .setTimestamp()
    .setFooter({ text: "Sheriff Rex • Informação" });
}

/**
 * Simula uma transição suave com múltiplos updates
 */
export async function smoothTransition(
  interaction: CommandInteraction | ButtonInteraction | ModalSubmitInteraction,
  stages: { embed: EmbedBuilder; delay: number }[],
  finalEmbed: EmbedBuilder
): Promise<void> {
  try {
    // Primeiro stage
    if (stages.length > 0) {
      await interaction.editReply({ embeds: [stages[0].embed] });
    }

    // Stages intermediários com delay
    for (let i = 1; i < stages.length; i++) {
      await new Promise(resolve => setTimeout(resolve, stages[i - 1].delay));
      await interaction.editReply({ embeds: [stages[i].embed] });
    }

    // Final
    if (stages.length > 0) {
      await new Promise(resolve => setTimeout(resolve, stages[stages.length - 1].delay));
    }
    await interaction.editReply({ embeds: [finalEmbed] });
  } catch (error) {
    console.error("Error in smooth transition:", error);
  }
}

/**
 * Formatador de números estilo iOS (com separadores elegantes)
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toLocaleString("pt-BR");
}

/**
 * Cria card de estatísticas estilo iOS
 */
export function createStatsCard(
  stats: { emoji: string; label: string; value: string }[]
): string {
  const lines = stats.map(stat => 
    `${stat.emoji} **${stat.label}**\n\`\`\`${stat.value}\`\`\``
  );
  
  return lines.join("\n\n");
}

/**
 * Feedback háptico simulado (com emojis de confirmação)
 */
export function hapticFeedback(type: "success" | "warning" | "error" | "light"): string {
  switch (type) {
    case "success":
      return "✓"; // Checkmark
    case "warning":
      return "⚠"; // Warning
    case "error":
      return "✗"; // X mark
    case "light":
      return "•"; // Bullet
    default:
      return "";
  }
}

/**
 * Cria embed de loading com percentual animado
 */
export function createPercentageLoadingEmbed(
  title: string,
  percentage: number,
  description?: string
): EmbedBuilder {
  const progressBar = createProgressBar(percentage, 100, 20, "ios");
  
  return new EmbedBuilder()
    .setColor(0x007AFF)
    .setTitle(`⏳ ${title}`)
    .setDescription(
      `${description || ""}\n\n` +
      `${progressBar}\n` +
      `**${percentage}%** completo`
    )
    .setFooter({ text: "Sheriff Rex • Processando" })
    .setTimestamp();
}

/**
 * Animação de carregamento com pontos
 */
export function animatedDots(frame: number): string {
  const dots = [".  ", ".. ", "..."];
  return dots[frame % 3];
}

/**
 * Cores do sistema iOS
 */
export const iOS_COLORS = {
  blue: 0x007AFF,
  green: 0x34C759,
  indigo: 0x5856D6,
  orange: 0xFF9500,
  pink: 0xFF2D55,
  purple: 0xAF52DE,
  red: 0xFF3B30,
  teal: 0x5AC8FA,
  yellow: 0xFFCC00,
  gray: 0x8E8E93,
  lightGray: 0xE5E5EA,
  darkGray: 0x636366,
};

/**
 * Cria notificação estilo iOS
 */
export function createNotificationEmbed(
  icon: string,
  title: string,
  subtitle: string,
  time: string = "Agora"
): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(iOS_COLORS.lightGray)
    .setAuthor({ name: `${icon} ${title}` })
    .setDescription(subtitle)
    .setFooter({ text: time });
}

/**
 * Delay helper para transições suaves
 */
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Cria efeito de "typing" simulado
 */
export async function typingEffect(
  interaction: CommandInteraction | ButtonInteraction,
  messages: string[],
  delayMs: number = 1500
): Promise<void> {
  for (let i = 0; i < messages.length; i++) {
    const embed = createInfoEmbed(
      messages[i],
      i < messages.length - 1 ? animatedDots(i) : undefined
    );
    
    await interaction.editReply({ embeds: [embed] });
    
    if (i < messages.length - 1) {
      await delay(delayMs);
    }
  }
}
