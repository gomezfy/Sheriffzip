import { EmbedBuilder } from "discord.js";
/**
 * Minimalist Embed System
 *
 * Neutral color palette for clean, modern Discord embeds
 */
export declare const Colors: {
    readonly SUCCESS: 1096065;
    readonly ERROR: 15680580;
    readonly WARNING: 16096779;
    readonly INFO: 3900150;
    readonly NEUTRAL: 7041664;
    readonly GOLD: 16498468;
    readonly PURPLE: 11032055;
};
export interface MinimalEmbedOptions {
    title?: string;
    description?: string;
    fields?: Array<{
        name: string;
        value: string;
        inline?: boolean;
    }>;
    footer?: string;
    timestamp?: boolean;
    color?: number;
}
/**
 * Create a minimal embed with consistent styling
 * @param options
 */
export declare function createMinimalEmbed(options: MinimalEmbedOptions): EmbedBuilder;
/**
 * Success embed (green) - for successful operations
 * @param title
 * @param description
 * @param footer
 */
export declare function successEmbed(title: string, description?: string, footer?: string): EmbedBuilder;
/**
 * Error embed (red) - for errors and failures
 * @param title
 * @param description
 * @param footer
 */
export declare function errorEmbed(title: string, description?: string, footer?: string): EmbedBuilder;
/**
 * Warning embed (amber) - for warnings and alerts
 * @param title
 * @param description
 * @param footer
 */
export declare function warningEmbed(title: string, description?: string, footer?: string): EmbedBuilder;
/**
 * Info embed (blue) - for information and help
 * @param title
 * @param description
 * @param footer
 */
export declare function infoEmbed(title: string, description?: string, footer?: string): EmbedBuilder;
/**
 * Neutral embed (gray) - for generic content
 * @param title
 * @param description
 * @param footer
 */
export declare function neutralEmbed(title: string, description?: string, footer?: string): EmbedBuilder;
/**
 * Economy embed - for economy-related operations (gold color)
 * @param title
 * @param description
 * @param footer
 */
export declare function economyEmbed(title: string, description?: string, footer?: string): EmbedBuilder;
/**
 * Reward embed - for rewards and bonuses (purple)
 * @param title
 * @param description
 * @param footer
 */
export declare function rewardEmbed(title: string, description?: string, footer?: string): EmbedBuilder;
/**
 * Progress embed - for showing progress and stats
 * @param title
 * @param fields
 * @param footer
 */
export declare function progressEmbed(title: string, fields: Array<{
    name: string;
    value: string;
    inline?: boolean;
}>, footer?: string): EmbedBuilder;
/**
 * Create a simple field for embeds
 * @param name
 * @param value
 * @param inline
 */
export declare function field(name: string, value: string, inline?: boolean): {
    name: string;
    value: string;
    inline: boolean;
};
/**
 * Format currency value for display
 * @param amount
 * @param currency
 */
export declare function formatCurrency(amount: number, currency: "tokens" | "silver" | "gold"): string;
/**
 * Format time duration (e.g., "2h 30m")
 * @param milliseconds
 */
export declare function formatDuration(milliseconds: number): string;
/**
 * Create a progress bar visualization
 * @param current
 * @param max
 * @param length
 */
export declare function progressBar(current: number, max: number, length?: number): string;
//# sourceMappingURL=embeds.d.ts.map