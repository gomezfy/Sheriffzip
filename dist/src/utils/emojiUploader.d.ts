import { Guild } from "discord.js";
interface EmojiMapping {
    [key: string]: string;
}
/**
 * Carrega o mapeamento de emojis do arquivo JSON
 */
export declare function loadEmojiMapping(): EmojiMapping;
/**
 * Salva o mapeamento de emojis no arquivo JSON
 * @param mapping
 */
export declare function saveEmojiMapping(mapping: EmojiMapping): void;
/**
 * Faz upload de todos os emojis da pasta custom-emojis para o servidor Discord
 * @param guild
 */
export declare function uploadCustomEmojis(guild: Guild): Promise<{
    success: number;
    failed: number;
    errors: string[];
}>;
/**
 * Sincroniza os emojis existentes do servidor com o mapeamento
 * Busca todos os emojis do servidor e atualiza o arquivo de mapeamento
 * @param guild
 */
export declare function syncServerEmojis(guild: Guild): Promise<{
    success: number;
    failed: number;
    errors: string[];
}>;
/**
 * Obtém um emoji customizado pelo nome
 * @param name
 * @param fallback
 */
export declare function getCustomEmoji(name: string, fallback?: string): string;
/**
 * Lista todos os emojis customizados disponíveis
 */
export declare function listCustomEmojis(): string[];
/**
 * Remove um emoji do servidor e do mapeamento
 * @param guild
 * @param emojiName
 */
export declare function removeCustomEmoji(guild: Guild, emojiName: string): Promise<boolean>;
/**
 * Remove todos os emojis customizados do servidor Discord
 * Remove TODOS os emojis do servidor, independente do mapeamento
 * @param guild
 */
export declare function removeAllCustomEmojis(guild: Guild): Promise<{
    success: number;
    failed: number;
    errors: string[];
}>;
export {};
//# sourceMappingURL=emojiUploader.d.ts.map