import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
declare function createRankingEmbed(userId: string, locale?: string): EmbedBuilder;
declare function createPrizesEmbed(locale?: string): EmbedBuilder;
declare const _default: {
    data: any;
    execute(interaction: ChatInputCommandInteraction): Promise<void>;
};
export default _default;
export { createRankingEmbed, createPrizesEmbed };
//# sourceMappingURL=evento.d.ts.map