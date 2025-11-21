import { Client, User, EmbedBuilder, AttachmentBuilder } from "discord.js";
export declare function createAutoWanted(client: Client, guildId: string, escapee: User, stolenAmount: number): Promise<{
    success: boolean;
    bounty?: any;
    amount?: number;
    poster?: AttachmentBuilder;
    embed?: EmbedBuilder;
    error?: string;
}>;
//# sourceMappingURL=autoWanted.d.ts.map