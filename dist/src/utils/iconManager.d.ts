/**
 * Icon Manager - Gerencia ícones SVG do Feather e emojis personalizados do Discord
 * Mapeamento de ícones para cada tipo de ação/botão do bot
 */
import { Client } from "discord.js";
export interface IconMapping {
    action: string;
    iconName: string;
    fallbackEmoji: string;
    description: string;
}
/**
 * Mapeamento completo de ações para ícones Feather
 */
export declare const ICON_MAPPINGS: IconMapping[];
/**
 * Obtém o emoji correto para uma ação
 * @param action Nome da ação
 * @param client Cliente do Discord (opcional, para usar emojis personalizados)
 * @returns String do emoji (personalizado ou fallback)
 */
export declare function getIconEmoji(action: string, client?: Client): string;
/**
 * Faz upload de todos os ícones SVG como emojis personalizados para um servidor
 * @param client Cliente do Discord
 * @param guildId ID do servidor onde fazer upload dos emojis
 */
export declare function uploadIconsToGuild(client: Client, guildId: string): Promise<void>;
/**
 * Lista todos os ícones disponíveis
 */
export declare function listAvailableIcons(): void;
/**
 * Obtém o caminho para um ícone SVG
 * @param action Nome da ação
 * @returns Caminho para o arquivo SVG
 */
export declare function getIconPath(action: string): string | null;
//# sourceMappingURL=iconManager.d.ts.map