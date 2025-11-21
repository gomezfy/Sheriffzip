import { EmbedBuilder, User } from "discord.js";
export declare class SpecialEmbedTemplates {
    static profile(user: User): EmbedBuilder;
    static economy(title: string, user: User): EmbedBuilder;
    static cooldown(command: string, timeLeft: number): EmbedBuilder;
    static pagination(title: string, page: number, totalPages: number): EmbedBuilder;
}
//# sourceMappingURL=specialEmbeds.d.ts.map