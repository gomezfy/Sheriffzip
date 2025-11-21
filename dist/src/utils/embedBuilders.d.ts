import { EmbedBuilder, ColorResolvable, User, Guild } from "discord.js";
export declare class EmbedTemplates {
    static success(title: string, description?: string): EmbedBuilder;
    static error(title: string, description?: string): EmbedBuilder;
    static warning(title: string, description?: string): EmbedBuilder;
    static info(title: string, description?: string): EmbedBuilder;
    static gold(title: string, description?: string): EmbedBuilder;
    static western(title: string, description?: string, color?: ColorResolvable): EmbedBuilder;
    static profile(user: User): EmbedBuilder;
    static economy(title: string, user: User): EmbedBuilder;
    static bounty(title: string, color?: ColorResolvable): EmbedBuilder;
    static mining(title: string): EmbedBuilder;
    static leaderboard(title: string, guild?: Guild): EmbedBuilder;
    static announcement(title: string, color?: ColorResolvable): EmbedBuilder;
    static cooldown(command: string, timeLeft: number): EmbedBuilder;
    static pagination(title: string, page: number, totalPages: number): EmbedBuilder;
}
export declare class EmbedFieldBuilder {
    private fields;
    add(name: string, value: string, inline?: boolean): this;
    addSpacer(inline?: boolean): this;
    addMultiple(fields: Array<{
        name: string;
        value: string;
        inline?: boolean;
    }>): this;
    build(): Array<{
        name: string;
        value: string;
        inline?: boolean;
    }>;
    apply(embed: EmbedBuilder): EmbedBuilder;
}
export declare function formatNumber(num: number): string;
export declare function formatTime(ms: number): string;
export declare function createProgressBar(current: number, max: number, length?: number): string;
export declare function truncateText(text: string, maxLength?: number): string;
//# sourceMappingURL=embedBuilders.d.ts.map