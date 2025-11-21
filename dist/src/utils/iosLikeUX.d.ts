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
export interface LoadingOptions {
    title?: string;
    description?: string;
    color?: ColorResolvable;
    estimatedTime?: number;
    showProgress?: boolean;
}
/**
 * Cria um embed de loading elegante estilo iOS
 */
export declare function createLoadingEmbed(options?: LoadingOptions): EmbedBuilder;
/**
 * Cria skeleton screen para perfis (antes do card carregar)
 */
export declare function createProfileSkeletonEmbed(): EmbedBuilder;
/**
 * Cria barra de progresso elegante
 */
export declare function createProgressBar(current: number, total: number, length?: number, style?: "smooth" | "blocks" | "ios"): string;
/**
 * Cria embed de sucesso com animação de checkmark
 */
export declare function createSuccessEmbed(title: string, description?: string, additionalFields?: {
    name: string;
    value: string;
    inline?: boolean;
}[]): EmbedBuilder;
/**
 * Cria embed de erro elegante
 */
export declare function createErrorEmbed(title: string, description?: string, solution?: string): EmbedBuilder;
/**
 * Cria embed de aviso/warning
 */
export declare function createWarningEmbed(title: string, description?: string): EmbedBuilder;
/**
 * Cria embed de informação
 */
export declare function createInfoEmbed(title: string, description?: string): EmbedBuilder;
/**
 * Simula uma transição suave com múltiplos updates
 */
export declare function smoothTransition(interaction: CommandInteraction | ButtonInteraction | ModalSubmitInteraction, stages: {
    embed: EmbedBuilder;
    delay: number;
}[], finalEmbed: EmbedBuilder): Promise<void>;
/**
 * Formatador de números estilo iOS (com separadores elegantes)
 */
export declare function formatNumber(num: number): string;
/**
 * Cria card de estatísticas estilo iOS
 */
export declare function createStatsCard(stats: {
    emoji: string;
    label: string;
    value: string;
}[]): string;
/**
 * Feedback háptico simulado (com emojis de confirmação)
 */
export declare function hapticFeedback(type: "success" | "warning" | "error" | "light"): string;
/**
 * Cria embed de loading com percentual animado
 */
export declare function createPercentageLoadingEmbed(title: string, percentage: number, description?: string): EmbedBuilder;
/**
 * Animação de carregamento com pontos
 */
export declare function animatedDots(frame: number): string;
/**
 * Cores do sistema iOS
 */
export declare const iOS_COLORS: {
    blue: number;
    green: number;
    indigo: number;
    orange: number;
    pink: number;
    purple: number;
    red: number;
    teal: number;
    yellow: number;
    gray: number;
    lightGray: number;
    darkGray: number;
};
/**
 * Cria notificação estilo iOS
 */
export declare function createNotificationEmbed(icon: string, title: string, subtitle: string, time?: string): EmbedBuilder;
/**
 * Delay helper para transições suaves
 */
export declare const delay: (ms: number) => Promise<unknown>;
/**
 * Cria efeito de "typing" simulado
 */
export declare function typingEffect(interaction: CommandInteraction | ButtonInteraction, messages: string[], delayMs?: number): Promise<void>;
//# sourceMappingURL=iosLikeUX.d.ts.map