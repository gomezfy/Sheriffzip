"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.delay = exports.iOS_COLORS = void 0;
exports.createLoadingEmbed = createLoadingEmbed;
exports.createProfileSkeletonEmbed = createProfileSkeletonEmbed;
exports.createProgressBar = createProgressBar;
exports.createSuccessEmbed = createSuccessEmbed;
exports.createErrorEmbed = createErrorEmbed;
exports.createWarningEmbed = createWarningEmbed;
exports.createInfoEmbed = createInfoEmbed;
exports.smoothTransition = smoothTransition;
exports.formatNumber = formatNumber;
exports.createStatsCard = createStatsCard;
exports.hapticFeedback = hapticFeedback;
exports.createPercentageLoadingEmbed = createPercentageLoadingEmbed;
exports.animatedDots = animatedDots;
exports.createNotificationEmbed = createNotificationEmbed;
exports.typingEffect = typingEffect;
const discord_js_1 = require("discord.js");
const customEmojis_1 = require("./customEmojis");
/**
 * Cria um embed de loading elegante estilo iOS
 */
function createLoadingEmbed(options = {}) {
    const { title = "⏳ Processando...", description = "Por favor aguarde, isso levará apenas alguns momentos", color = 0x007AFF, // iOS blue
    estimatedTime, showProgress = true } = options;
    const embed = new discord_js_1.EmbedBuilder()
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
function createProfileSkeletonEmbed() {
    return new discord_js_1.EmbedBuilder()
        .setColor(0xE5E5EA) // iOS light gray
        .setTitle("📊 Carregando Perfil...")
        .setDescription("```" +
        "\n╔══════════════════════════╗" +
        "\n║  ████████  ░░░░░░░░░░  ║" +
        "\n║  ████████  ░░░░░░░░░░  ║" +
        "\n║            ░░░░░░░░░░  ║" +
        "\n║  ░░░░░░░░  ░░░░░░░░░░  ║" +
        "\n║  ░░░░░░░░  ░░░░░░░░░░  ║" +
        "\n║  ░░░░░░░░  ░░░░░░░░░░  ║" +
        "\n╚══════════════════════════╝" +
        "\n```\n" +
        "*Gerando card de perfil personalizado...*")
        .setFooter({ text: "Sheriff Rex • Preparando visual" })
        .setTimestamp();
}
/**
 * Cria barra de progresso elegante
 */
function createProgressBar(current, total, length = 20, style = "ios") {
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
function createSuccessEmbed(title, description, additionalFields) {
    const embed = new discord_js_1.EmbedBuilder()
        .setColor(0x34C759) // iOS green
        .setTitle(`${(0, customEmojis_1.getEmoji)("check")} ${title}`)
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
function createErrorEmbed(title, description, solution) {
    const embed = new discord_js_1.EmbedBuilder()
        .setColor(0xFF3B30) // iOS red
        .setTitle(`${(0, customEmojis_1.getEmoji)("cancel")} ${title}`)
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
function createWarningEmbed(title, description) {
    return new discord_js_1.EmbedBuilder()
        .setColor(0xFFCC00) // iOS yellow/orange
        .setTitle(`${(0, customEmojis_1.getEmoji)("warning")} ${title}`)
        .setDescription(description || "")
        .setTimestamp()
        .setFooter({ text: "Sheriff Rex • Atenção" });
}
/**
 * Cria embed de informação
 */
function createInfoEmbed(title, description) {
    return new discord_js_1.EmbedBuilder()
        .setColor(0x007AFF) // iOS blue
        .setTitle(`${(0, customEmojis_1.getEmoji)("info")} ${title}`)
        .setDescription(description || "")
        .setTimestamp()
        .setFooter({ text: "Sheriff Rex • Informação" });
}
/**
 * Simula uma transição suave com múltiplos updates
 */
async function smoothTransition(interaction, stages, finalEmbed) {
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
    }
    catch (error) {
        console.error("Error in smooth transition:", error);
    }
}
/**
 * Formatador de números estilo iOS (com separadores elegantes)
 */
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + "M";
    }
    else if (num >= 1000) {
        return (num / 1000).toFixed(1) + "K";
    }
    return num.toLocaleString("pt-BR");
}
/**
 * Cria card de estatísticas estilo iOS
 */
function createStatsCard(stats) {
    const lines = stats.map(stat => `${stat.emoji} **${stat.label}**\n\`\`\`${stat.value}\`\`\``);
    return lines.join("\n\n");
}
/**
 * Feedback háptico simulado (com emojis de confirmação)
 */
function hapticFeedback(type) {
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
function createPercentageLoadingEmbed(title, percentage, description) {
    const progressBar = createProgressBar(percentage, 100, 20, "ios");
    return new discord_js_1.EmbedBuilder()
        .setColor(0x007AFF)
        .setTitle(`⏳ ${title}`)
        .setDescription(`${description || ""}\n\n` +
        `${progressBar}\n` +
        `**${percentage}%** completo`)
        .setFooter({ text: "Sheriff Rex • Processando" })
        .setTimestamp();
}
/**
 * Animação de carregamento com pontos
 */
function animatedDots(frame) {
    const dots = [".  ", ".. ", "..."];
    return dots[frame % 3];
}
/**
 * Cores do sistema iOS
 */
exports.iOS_COLORS = {
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
function createNotificationEmbed(icon, title, subtitle, time = "Agora") {
    return new discord_js_1.EmbedBuilder()
        .setColor(exports.iOS_COLORS.lightGray)
        .setAuthor({ name: `${icon} ${title}` })
        .setDescription(subtitle)
        .setFooter({ text: time });
}
/**
 * Delay helper para transições suaves
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
exports.delay = delay;
/**
 * Cria efeito de "typing" simulado
 */
async function typingEffect(interaction, messages, delayMs = 1500) {
    for (let i = 0; i < messages.length; i++) {
        const embed = createInfoEmbed(messages[i], i < messages.length - 1 ? animatedDots(i) : undefined);
        await interaction.editReply({ embeds: [embed] });
        if (i < messages.length - 1) {
            await (0, exports.delay)(delayMs);
        }
    }
}
//# sourceMappingURL=iosLikeUX.js.map