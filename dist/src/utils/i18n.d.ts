import { ChatInputCommandInteraction, ButtonInteraction, StringSelectMenuInteraction, Interaction } from "discord.js";
declare const translations: Record<string, Record<string, string>>;
export declare function setUserLocale(userId: string, locale: string): void;
export declare function getUserLocale(userId: string): string;
export declare function getLocale(interaction: ChatInputCommandInteraction | ButtonInteraction | StringSelectMenuInteraction | Interaction): string;
export declare function t(interaction: ChatInputCommandInteraction | ButtonInteraction | StringSelectMenuInteraction | Interaction, key: string, params?: Record<string, any>): string;
export declare function tUser(userId: string, key: string, params?: Record<string, any>): string;
export declare function tLocale(locale: string, key: string, params?: Record<string, any>): string;
export { translations };
//# sourceMappingURL=i18n.d.ts.map