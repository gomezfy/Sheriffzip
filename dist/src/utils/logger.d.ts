import { EmbedBuilder, Client } from "discord.js";
declare class Logger {
    static log(client: Client, guildId: string, type: string, data: any): Promise<void>;
    static createLogEmbed(type: string, data: any): EmbedBuilder;
}
export default Logger;
//# sourceMappingURL=logger.d.ts.map